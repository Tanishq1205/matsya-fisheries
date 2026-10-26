-- Run on staging after premium_preorders. Everything rolls back (sequences may advance).
begin;
update public.preorder_settings set min_notice_days = null where id = 1;
insert into auth.users (id) values ('aaaaaaaa-1111-4111-8111-111111111111'), ('bbbbbbbb-2222-4222-8222-222222222222');
insert into public.products (id, name, category, standard_cut, price_1kg, in_stock, is_active) values
 ('aaaaaaaa-3333-4333-8333-333333333333', 'Premium fixture', 'Premium Sea Fish', 'Cleaned', 100, true, true),
 ('bbbbbbbb-4444-4444-8444-444444444444', 'Daily fixture', 'Daily Catch', 'Cleaned', 100, true, true);
with zone as (
 insert into public.delivery_zones (name, description, charge_paise)
 values ('Preorder fixture', 'Rollback-only fixture', 1250) returning id
)
insert into public.serviceable_pincodes (pincode, area, zone_id, status)
select '000004', 'Test', id, 'Available' from zone;
set local role authenticated;
set local request.jwt.claims = '{"sub":"aaaaaaaa-1111-4111-8111-111111111111","role":"authenticated","is_anonymous":true}';
do $$ begin
  begin
    perform public.place_order_once(gen_random_uuid(), '{"order_type":"preorder"}'::jsonb);
    raise exception 'Disabled preorder accepted';
  exception when raise_exception then
    if sqlerrm <> 'Preorders are temporarily unavailable' then raise; end if;
  end;
  begin
    update public.preorder_settings set min_notice_days = 1;
    raise exception 'Customer can change notice days';
  exception when insufficient_privilege then null; end;
end $$;
reset role;
update public.preorder_settings set min_notice_days = 2 where id = 1;
set local role authenticated;
do $$ declare
  today date := (now() at time zone 'Asia/Kolkata')::date;
  payload jsonb := '{"customer_name":"Preorder test","customer_phone":"9876543210","delivery_address":"Test address","pincode":"000004","items":[{"id":"aaaaaaaa-3333-4333-8333-333333333333","weight":"1000g","quantity":1,"price":100}],"subtotal":100,"delivery_fee":12.5,"total_amount":112.5,"delivery_slot":"Morning Catch","payment_method":"COD","order_type":"preorder"}';
  saved public.orders%rowtype; retried public.orders%rowtype; testcase record;
begin
  payload := payload || jsonb_build_object('delivery_date', today + 2);
  select * into saved from public.place_order_once('cccccccc-5555-4555-8555-555555555555', payload);
  if saved.order_type <> 'preorder' or saved.delivery_date <> today + 2 or saved.payment_status <> 'pending'
    or saved.total_amount <> 112.50 or saved.customer_id <> auth.uid() then raise exception 'Preorder data not preserved'; end if;
  select * into retried from public.place_order_once('cccccccc-5555-4555-8555-555555555555', payload);
  if saved.id <> retried.id then raise exception 'Preorder retry duplicated'; end if;
  for testcase in select * from (values
    (jsonb_build_object('delivery_date', today + 1), 'Preorders require at least 2 days notice'),
    ('{"delivery_date":null}'::jsonb, 'Preorders require at least 2 days notice'),
    ('{"order_type":"anything"}'::jsonb, 'Invalid order type'),
    ('{"payment_method":"RAZORPAY"}'::jsonb, 'Invalid customer, delivery or payment details'),
    ('{"items":[{"id":"bbbbbbbb-4444-4444-8444-444444444444","weight":"1000g","quantity":1,"price":100}]}'::jsonb, 'Only premium sea fish can be preordered'),
    ('{"subtotal":1,"total_amount":13.5}'::jsonb, 'Prices or delivery charges changed. Refresh checkout before ordering')
  ) as cases(changes, expected) loop
    begin
      perform public.place_order_once(gen_random_uuid(), payload || testcase.changes);
      raise exception 'Invalid preorder accepted';
    exception when raise_exception then
      if sqlerrm <> testcase.expected then raise; end if;
    end;
  end loop;
  begin
    perform public.place_order_once('cccccccc-5555-4555-8555-555555555555', payload || jsonb_build_object('delivery_date', today + 3));
    raise exception 'Request key reused for different date';
  exception when raise_exception then
    if sqlerrm <> 'This checkout request was already used for different order details' then raise; end if;
  end;
  begin
    update public.orders set delivery_date = today where id = saved.id;
    raise exception 'Customer can alter delivery date after ordering';
  exception when insufficient_privilege then null; end;
  select * into retried from public.place_order_once(gen_random_uuid(), (payload - 'order_type') || '{"payment_method":"UPI"}'::jsonb);
  if retried.order_type <> 'standard' or retried.delivery_date <> today or retried.payment_status <> 'pending' then raise exception 'Regular checkout changed'; end if;
end $$;
set local request.jwt.claims = '{"sub":"bbbbbbbb-2222-4222-8222-222222222222","role":"authenticated","is_anonymous":true}';
do $$ begin
  if exists(select 1 from public.orders) then raise exception 'Another customer can read preorder'; end if;
end $$;
set local role anon;
set local request.jwt.claims = '{"role":"anon"}';
do $$ begin
  if (select min_notice_days from public.preorder_settings where id = 1) <> 2 then raise exception 'Public cannot read notice policy'; end if;
  begin
    update public.preorder_settings set min_notice_days = 1;
    raise exception 'Public can change notice policy';
  exception when insufficient_privilege then null; end;
end $$;
rollback;
