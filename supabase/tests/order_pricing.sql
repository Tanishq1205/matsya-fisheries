-- Run on staging after BOTH migrations. Fixtures roll back; sequences may advance.
begin;
insert into auth.users (id) values ('44444444-4444-4444-8444-444444444444');
insert into public.products (id, name, category, standard_cut, price_500g, price_1kg, in_stock, is_active)
values ('55555555-5555-4555-8555-555555555555', 'Pricing fixture', 'Test', 'Cleaned', 60, 100, true, true),
('66666666-6666-4666-8666-666666666666', 'Out of stock fixture', 'Test', 'Cleaned', 60, 100, false, true);
with zone as (
  insert into public.delivery_zones (name, description, charge_paise)
  values ('Pricing test zone', 'Rollback-only fixture', 1250) returning id
)
insert into public.serviceable_pincodes (pincode, area, zone_id, status)
select pin, 'Test', zone.id, status from zone cross join
 (values ('000001', 'Available'), ('000002', 'Paused')) as pins(pin, status);
set local role authenticated;
set local request.jwt.claims = '{"sub":"44444444-4444-4444-8444-444444444444","role":"authenticated","is_anonymous":true}';
do $$ declare
  base jsonb := '{"id":"55555555-5555-4555-8555-555555555555","weight":"1000g","quantity":1,"price":100}';
  test_case record; saved public.orders%rowtype;
begin
  insert into public.orders (customer_id, customer_name, customer_phone, delivery_address, pincode, items, subtotal, delivery_fee, total_amount, delivery_slot, payment_method)
  values (auth.uid(), 'Pricing test', '9876543210', 'Test address', '000001', jsonb_build_array(base), 100, 12.50, 112.50, 'Morning Catch', 'COD') returning * into saved;
  if saved.total_amount <> 112.50 or saved.payment_status <> 'pending' or saved.order_status <> 'placed' then
    raise exception 'Valid order or paise conversion failed'; end if;
  -- Every case must fail for the intended validation reason.
  for test_case in select * from (values
    (base || '{"price":1}'::jsonb, '000001', 1::numeric, 12.5::numeric, 'Product prices changed'),
    (base, '000001', 100, 0, 'Prices or delivery charges changed'),
    (base, '000002', 100, 12.5, 'Delivery is not available'),
    (base || '{"quantity":-1}'::jsonb, '000001', 100, 12.5, 'Invalid quantity'),
    (base || '{"weight":"250g"}'::jsonb, '000001', 100, 12.5, 'Invalid pack size'),
    (base || '{"id":"66666666-6666-4666-8666-666666666666"}'::jsonb, '000001', 100, 12.5, 'A product is unavailable')
  ) as cases(item, pin, sub, fee, expected)
  loop
    begin
      insert into public.orders (customer_id, customer_name, customer_phone, delivery_address, pincode, items, subtotal, delivery_fee, total_amount, delivery_slot, payment_method)
      values (auth.uid(), 'Pricing test', '9876543210', 'Test address', test_case.pin,
        jsonb_build_array(test_case.item), test_case.sub, test_case.fee, test_case.sub + test_case.fee, 'Morning Catch', 'COD');
      raise exception 'Invalid order accepted';
    exception when raise_exception then
      if position(test_case.expected in sqlerrm) = 0 then raise; end if;
    end;
  end loop;
end $$;
rollback;
