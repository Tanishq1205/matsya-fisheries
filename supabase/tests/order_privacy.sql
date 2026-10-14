-- Run against staging AFTER the migration. All fixtures are rolled back.
begin;
-- Valid catalog/delivery fixtures also satisfy the pricing trigger migration.
insert into public.products (id, name, category, standard_cut, price_1kg, in_stock, is_active)
values ('33333333-3333-4333-8333-333333333333', 'Privacy fixture', 'Test', 'Cleaned', 100, true, true);
with zone as (
  insert into public.delivery_zones (name, description, charge_paise)
  values ('Privacy test zone', 'Rollback-only fixture', 4900) returning id
)
insert into public.serviceable_pincodes (pincode, area, zone_id, status)
select '000000', 'Test', id, 'Available' from zone;
insert into auth.users (id) values
 ('11111111-1111-4111-8111-111111111111'),
 ('22222222-2222-4222-8222-222222222222');
set local role authenticated;
set local request.jwt.claims = '{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated","is_anonymous":true}';
insert into public.orders (customer_id, customer_name, customer_phone, delivery_address, pincode, items, subtotal, delivery_fee, total_amount, delivery_slot, payment_method, payment_status, order_status)
values ('11111111-1111-4111-8111-111111111111', 'Privacy test', '9876543210', 'Test address', '000000', '[{"id":"33333333-3333-4333-8333-333333333333","weight":"1000g","quantity":1,"price":100}]', 100, 49, 149, 'Morning Catch', 'COD', 'pending', 'placed');
do $$ begin
  if (select count(*) from public.orders) <> 1 then raise exception 'Owner cannot read their order'; end if;
  update public.orders set order_status = 'delivered';
  if found then raise exception 'Customer changed order status'; end if;
end $$;
set local request.jwt.claims = '{"sub":"22222222-2222-4222-8222-222222222222","role":"authenticated","is_anonymous":true,"user_metadata":{"role":"admin"}}';
do $$ begin
  if exists(select 1 from public.orders) then raise exception 'Customer B can read customer A'; end if;
  begin
    insert into public.orders (customer_id, customer_name, customer_phone, delivery_address, pincode, items, subtotal, delivery_fee, total_amount, delivery_slot, payment_status, order_status)
    values ('11111111-1111-4111-8111-111111111111', 'Forged owner', '9876543210', 'Test', '400001', '[{}]', 1, 0, 1, 'Morning Catch', 'pending', 'placed');
    raise exception 'Forged ownership accepted';
  exception when insufficient_privilege then null;
    when raise_exception then
      if sqlerrm <> 'A customer session is required' then raise; end if;
  end;
end $$;
set local request.jwt.claims = '{"sub":"22222222-2222-4222-8222-222222222222","role":"authenticated","is_anonymous":false,"app_metadata":{"role":"admin"}}';
do $$ begin
  if not exists(select 1 from public.orders where customer_id = '11111111-1111-4111-8111-111111111111') then raise exception 'Admin cannot read orders'; end if;
  update public.orders set order_status = 'dock_processing' where customer_id = '11111111-1111-4111-8111-111111111111';
  if not found then raise exception 'Admin cannot update status'; end if;
end $$;
set local role anon;
set local request.jwt.claims = '{"role":"anon"}';
do $$ begin
  begin
    perform 1 from public.orders;
    raise exception 'Unauthenticated access accepted';
  exception when insufficient_privilege then null; end;
end $$;
rollback;
