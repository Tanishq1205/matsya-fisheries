-- Apply AFTER 202610140001_order_privacy.sql. Existing orders are preserved.
begin;
-- This policy depends on the amount columns and must be recreated after ALTER.
-- The transaction keeps the policy change atomic with the schema change.
drop policy if exists orders_owner_insert on public.orders;
-- Orders store rupees; zone charges are paise. Preserve fractional rupees exactly.
alter table public.orders alter column subtotal type numeric(12,2),
  alter column delivery_fee type numeric(12,2),
  alter column total_amount type numeric(12,2);

create policy orders_owner_insert on public.orders for insert to authenticated
with check (
  customer_id = (select auth.uid())
  and order_status = 'placed' and payment_status = 'pending'
  and subtotal >= 0 and delivery_fee >= 0
  and total_amount = subtotal + delivery_fee
  and jsonb_typeof(items::jsonb) = 'array' and jsonb_array_length(items::jsonb) > 0
);

create or replace function public.validate_order_pricing()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  line jsonb; product public.products%rowtype;
  product_id uuid; pack text; qty integer; unit_price numeric;
  expected_subtotal numeric := 0; expected_fee numeric;
  clean_items jsonb := '[]'::jsonb;
begin
  if new.customer_id is distinct from auth.uid() or auth.uid() is null then
    raise exception 'A customer session is required';
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
  new.delivery_date := (now() at time zone 'Asia/Kolkata')::date;
  new.payment_status := 'pending';
  new.order_status := 'placed';
  new.razorpay_order_id := null;
  new.razorpay_payment_id := null;
  return new;
end $$;
revoke all on function public.validate_order_pricing() from public, anon, authenticated;
drop trigger if exists validate_order_pricing_before_insert on public.orders;
create trigger validate_order_pricing_before_insert before insert on public.orders
  for each row execute function public.validate_order_pricing();
commit;
