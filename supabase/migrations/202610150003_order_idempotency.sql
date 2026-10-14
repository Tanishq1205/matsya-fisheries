-- Apply after the privacy and pricing migrations. Existing orders are preserved.
begin;
alter table public.orders add column if not exists checkout_request_id uuid;
alter table public.orders add column if not exists checkout_request_hash text;
create unique index if not exists orders_customer_checkout_request_key
  on public.orders (customer_id, checkout_request_id)
  where checkout_request_id is not null;

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
    payment_status, order_status
  ) values (
    caller, request_id, payload_hash,
    order_payload->>'customer_name', order_payload->>'customer_phone',
    order_payload->>'delivery_address', order_payload->>'landmark', order_payload->>'pincode',
    order_payload->'items', (order_payload->>'subtotal')::numeric,
    (order_payload->>'delivery_fee')::numeric, (order_payload->>'total_amount')::numeric,
    order_payload->>'delivery_slot', order_payload->>'payment_method', 'pending', 'placed'
  ) returning *;
end $$;
revoke all on function public.place_order_once(uuid, jsonb) from public, anon;
grant execute on function public.place_order_once(uuid, jsonb) to authenticated;
commit;
