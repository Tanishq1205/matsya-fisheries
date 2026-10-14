-- Apply after reviewing on a staging project. Existing orders stay admin-only.
begin;
-- Browser roles need catalog reads, not administrative table privileges.
revoke all on public.admin_config from public, anon, authenticated;
revoke all on public.products, public.delivery_zones, public.serviceable_pincodes
  from public, anon, authenticated;
grant select on public.products, public.delivery_zones, public.serviceable_pincodes
  to anon, authenticated;
alter table public.orders add column if not exists customer_id uuid references auth.users(id);
create index if not exists orders_customer_id_idx on public.orders(customer_id);
alter table public.orders enable row level security;
alter table public.orders force row level security;

-- Permissive legacy policies would otherwise bypass the new ownership checks.
do $$ declare p record; begin
  for p in select policyname from pg_policies where schemaname = 'public' and tablename = 'orders'
  loop execute format('drop policy %I on public.orders', p.policyname); end loop;
end $$;
revoke all on public.orders from public, anon;
revoke all on public.orders from authenticated;
grant select, insert on public.orders to authenticated;
grant update (order_status) on public.orders to authenticated;
revoke all on sequence public.orders_order_number_seq from public, anon, authenticated;
grant usage on sequence public.orders_order_number_seq to authenticated;

create policy orders_owner_read on public.orders for select to authenticated
using (customer_id = (select auth.uid()));
create policy orders_owner_insert on public.orders for insert to authenticated
with check (
  customer_id = (select auth.uid())
  and order_status = 'placed' and payment_status = 'pending'
  and subtotal >= 0 and delivery_fee >= 0
  and total_amount = subtotal + delivery_fee
  and jsonb_typeof(items::jsonb) = 'array' and jsonb_array_length(items::jsonb) > 0
);
create policy orders_admin_read on public.orders for select to authenticated
using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  and coalesce((select auth.jwt() ->> 'is_anonymous'), 'false') = 'false');
create policy orders_admin_status on public.orders for update to authenticated
using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  and coalesce((select auth.jwt() ->> 'is_anonymous'), 'false') = 'false')
with check ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  and order_status in ('placed', 'dock_processing', 'out_for_delivery', 'delivered'));

-- Retire the old public PIN endpoint, if present.
do $$ begin
  if to_regprocedure('public.verify_admin_pin(text)') is not null then
    revoke execute on function public.verify_admin_pin(text) from public, anon, authenticated;
  end if;
end $$;
commit;
