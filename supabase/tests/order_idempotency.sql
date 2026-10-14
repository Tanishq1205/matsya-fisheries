-- Staging only; run after all three migrations. Rollback does not reset sequences.
begin;
insert into auth.users (id) values
('77777777-7777-4777-8777-777777777777'), ('88888888-8888-4888-8888-888888888888');
insert into public.products (id, name, category, standard_cut, price_1kg, in_stock, is_active)
values ('99999999-9999-4999-8999-999999999999', 'Retry fixture', 'Test', 'Cleaned', 100, true, true);
with zone as (
  insert into public.delivery_zones (name, description, charge_paise)
  values ('Idempotency fixture', 'Rollback-only fixture', 1250) returning id
)
insert into public.serviceable_pincodes (pincode, area, zone_id, status)
select '000003', 'Test', id, 'Available' from zone;
set local role authenticated;
set local request.jwt.claims = '{"sub":"77777777-7777-4777-8777-777777777777","role":"authenticated","is_anonymous":true}';
do $$ declare
  payload jsonb := '{"customer_name":"Retry test","customer_phone":"9876543210","delivery_address":"Test address","pincode":"000003","items":[{"id":"99999999-9999-4999-8999-999999999999","weight":"1000g","quantity":1,"price":100}],"subtotal":100,"delivery_fee":12.5,"total_amount":112.5,"delivery_slot":"Morning Catch","payment_method":"COD"}';
  first_order public.orders%rowtype; retry_order public.orders%rowtype;
begin
  select * into first_order from public.place_order_once('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', payload);
  select * into retry_order from public.place_order_once('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', payload);
  if first_order.id is distinct from retry_order.id then raise exception 'Retry created another order'; end if;
  if (select count(*) from public.orders where checkout_request_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa') <> 1 then
    raise exception 'Retry did not preserve exactly one row'; end if;
  begin
    perform public.place_order_once('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', payload || '{"customer_name":"Changed"}'::jsonb);
    raise exception 'Reused key accepted changed payload';
  exception when raise_exception then
    if sqlerrm <> 'This checkout request was already used for different order details' then raise; end if;
  end;
  -- An intentionally new checkout is allowed to buy the same items again.
  select * into retry_order from public.place_order_once('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', payload);
  if first_order.id = retry_order.id then raise exception 'New checkout reused old order'; end if;
end $$;
reset role;
-- A committed order must remain recoverable even if its product goes out of stock.
update public.products set in_stock = false where id = '99999999-9999-4999-8999-999999999999';
set local role authenticated;
set local request.jwt.claims = '{"sub":"77777777-7777-4777-8777-777777777777","role":"authenticated","is_anonymous":true}';
do $$ declare payload jsonb; result public.orders%rowtype; begin
  select jsonb_build_object('customer_name','Retry test','customer_phone','9876543210','delivery_address','Test address','pincode','000003',
    'items','[{"id":"99999999-9999-4999-8999-999999999999","weight":"1000g","quantity":1,"price":100}]'::jsonb,
    'subtotal',100,'delivery_fee',12.5,'total_amount',112.5,'delivery_slot','Morning Catch','payment_method','COD') into payload;
  select * into result from public.place_order_once('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', payload);
  if result.id is null then raise exception 'Retry failed after stock change'; end if;
end $$;
set local request.jwt.claims = '{"sub":"88888888-8888-4888-8888-888888888888","role":"authenticated","is_anonymous":true}';
do $$ begin
  if exists(select 1 from public.orders where checkout_request_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa') then
    raise exception 'Request key exposed another customer order'; end if;
end $$;
set local role anon;
set local request.jwt.claims = '{"role":"anon"}';
do $$ begin
  begin
    perform public.place_order_once('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', '{}'::jsonb);
    raise exception 'Unauthenticated RPC allowed';
  exception when insufficient_privilege then null; end;
end $$;
rollback;
