-- Run after the previous migrations. No existing payments are changed.
begin;
grant update (payment_status) on public.orders to authenticated;
drop policy if exists orders_admin_status on public.orders;
create policy orders_admin_status on public.orders for update to authenticated
using (
  (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  and coalesce((select auth.jwt() ->> 'is_anonymous'), 'false') = 'false'
)
with check (
  (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  and coalesce((select auth.jwt() ->> 'is_anonymous'), 'false') = 'false'
  and order_status in ('placed', 'dock_processing', 'out_for_delivery', 'delivered')
  and lower(coalesce(payment_status, 'pending')) in ('pending', 'paid')
);
commit;
