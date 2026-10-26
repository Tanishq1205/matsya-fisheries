-- Apply after the four existing order migrations. Existing orders remain standard.
-- Owner confirmed a minimum of two calendar days notice (India time).
-- Set min_notice_days to NULL later to temporarily close new preorders.
begin;
create table public.preorder_settings (
  id integer primary key check (id = 1),
  min_notice_days integer check (min_notice_days between 1 and 365)
);
insert into public.preorder_settings (id, min_notice_days) values (1, 2);
alter table public.preorder_settings enable row level security;
revoke all on public.preorder_settings from public, anon, authenticated;
grant select on public.preorder_settings to anon, authenticated;
create policy preorder_settings_read on public.preorder_settings
  for select to anon, authenticated using (true);

alter table public.orders add column order_type text not null default 'standard'
  check (order_type in ('standard', 'preorder'));

create or replace function public.validate_order_pricing()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  line jsonb; product public.products%rowtype;
  product_id uuid; pack text; qty integer; unit_price numeric;
  expected_subtotal numeric := 0; expected_fee numeric;
  clean_items jsonb := '[]'::jsonb;
  notice_days integer;
  today date := (now() at time zone 'Asia/Kolkata')::date;
begin
  if new.customer_id is distinct from auth.uid() or auth.uid() is null then
    raise exception 'A customer session is required';
  end if;
  if new.order_type is null or new.order_type not in ('standard', 'preorder') then
    raise exception 'Invalid order type';
  end if;
  if new.order_type = 'preorder' then
    select min_notice_days into notice_days from public.preorder_settings where id = 1 for share;
    if notice_days is null then raise exception 'Preorders are temporarily unavailable'; end if;
    if new.delivery_date is null or not isfinite(new.delivery_date) or new.delivery_date < today + notice_days then
      raise exception 'Preorders require at least % days notice', notice_days;
    end if;
  else
    new.delivery_date := today;
  end if;
  if new.customer_name is null or length(trim(new.customer_name)) not between 1 and 200
    or new.customer_phone is null or new.customer_phone !~ '^[6-9][0-9]{9}$'
    or new.delivery_address is null or length(trim(new.delivery_address)) not between 1 and 2000
    or new.pincode is null or new.pincode !~ '^[0-9]{6}$'
    or new.delivery_slot is null or length(trim(new.delivery_slot)) not between 1 and 100
    or new.payment_method is null or new.payment_method not in ('COD', 'UPI') then
    raise exception 'Invalid customer, delivery or payment details';
  end if;
  select z.charge_paise::numeric / 100 into expected_fee
  from public.serviceable_pincodes p join public.delivery_zones z on z.id = p.zone_id
  where p.pincode = new.pincode and p.status in ('Available', 'Available (legacy)')
    and z.charge_paise >= 0 for share of p, z;
  if expected_fee is null then raise exception 'Delivery is not available for this PIN code'; end if;
  if new.items is null or jsonb_typeof(new.items) <> 'array' then
    raise exception 'Invalid basket';
  end if;
  if jsonb_array_length(new.items) not between 1 and 100 then raise exception 'Invalid basket size'; end if;
  for line in select value from jsonb_array_elements(new.items) loop
    -- Support previously saved detail-page cart IDs (UUID followed by cut/weight).
    product_id := substring(coalesce(nullif(line->>'productId', ''), line->>'id')
      from '^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})')::uuid;
    if product_id is null then raise exception 'Invalid product'; end if;
    if coalesce(line->>'quantity', '') !~ '^[1-9][0-9]{0,2}$' then raise exception 'Invalid quantity'; end if;
    qty := (line->>'quantity')::integer;
    pack := line->>'weight';
    select * into product from public.products where id = product_id
      and is_active is true and in_stock is true for share;
    if not found then raise exception 'A product is unavailable. Please update your basket'; end if;
    if new.order_type = 'preorder' and product.category is distinct from 'Premium Sea Fish' then
      raise exception 'Only premium sea fish can be preordered';
    end if;
    if pack = '500g' then unit_price := product.price_500g;
    elsif pack in ('1000g', '1kg') then unit_price := product.price_1kg;
    else raise exception 'Invalid pack size'; end if;
    if unit_price is null or unit_price <= 0 then raise exception 'Selected pack is unavailable'; end if;
    if (line->>'price')::numeric is distinct from unit_price then
      raise exception 'Product prices changed. Remove and re-add items before ordering';
    end if;
    expected_subtotal := expected_subtotal + unit_price * qty;
    clean_items := clean_items || jsonb_build_array(jsonb_build_object(
      'id', product.id, 'productId', product.id, 'name', product.name,
      'image', product.image_url, 'weight', pack, 'quantity', qty, 'price', unit_price,
      'cut', left(coalesce(line->>'cut', product.standard_cut), 200)));
  end loop;
  if new.subtotal is distinct from expected_subtotal
    or new.delivery_fee is distinct from expected_fee
    or new.total_amount is distinct from (expected_subtotal + expected_fee) then
    raise exception 'Prices or delivery charges changed. Refresh checkout before ordering';
  end if;
  new.items := clean_items;
  new.created_at := now();
  new.payment_status := 'pending';
  new.order_status := 'placed';
  new.razorpay_order_id := null;
  new.razorpay_payment_id := null;
  return new;
end $$;
revoke all on function public.validate_order_pricing() from public, anon, authenticated;

-- SECURITY INVOKER: caller grants and ownership/admin RLS still apply.
create or replace function public.place_order_once(request_id uuid, order_payload jsonb)
returns setof public.orders language plpgsql security invoker set search_path = '' as $$
declare
  caller uuid := auth.uid();
  payload_hash text;
  existing public.orders%rowtype;
begin
  if caller is null or request_id is null then raise exception 'A customer session and request ID are required'; end if;
  if order_payload is null or jsonb_typeof(order_payload) <> 'object' then raise exception 'Invalid order payload'; end if;
  payload_hash := pg_catalog.md5((order_payload - 'created_at')::text);
  -- Lock lasts until commit. Retried requests wait for the first insert and
  -- return its saved row BEFORE checking prices or stock that may have changed.
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(caller::text || ':' || request_id::text, 0));
  select * into existing from public.orders
    where customer_id = caller and checkout_request_id = request_id;
  if found then
    if existing.checkout_request_hash is distinct from payload_hash then
      raise exception 'This checkout request was already used for different order details';
    end if;
    return next existing;
    return;
  end if;
  return query insert into public.orders (
    customer_id, checkout_request_id, checkout_request_hash,
    customer_name, customer_phone, delivery_address, landmark, pincode,
    items, subtotal, delivery_fee, total_amount, delivery_slot, payment_method,
    payment_status, order_status, order_type, delivery_date
  ) values (
    caller, request_id, payload_hash,
    order_payload->>'customer_name', order_payload->>'customer_phone',
    order_payload->>'delivery_address', order_payload->>'landmark', order_payload->>'pincode',
    order_payload->'items', (order_payload->>'subtotal')::numeric,
    (order_payload->>'delivery_fee')::numeric, (order_payload->>'total_amount')::numeric,
    order_payload->>'delivery_slot', order_payload->>'payment_method', 'pending', 'placed',
    coalesce(order_payload->>'order_type', 'standard'), (order_payload->>'delivery_date')::date
  ) returning *;
end $$;
revoke all on function public.place_order_once(uuid, jsonb) from public, anon;
grant execute on function public.place_order_once(uuid, jsonb) to authenticated;

commit;
