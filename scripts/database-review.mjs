// PGlite runs actual PostgreSQL SQL in an isolated in-memory database.
// Auth helpers and the initial schema below model this project's supplied schema.
// This does not replace Supabase staging validation of platform Auth/API behavior.
import { readFile, readdir } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
const { PGlite } = await import(pathToFileURL(process.env.MATSYA_PGLITE).href);
const db = new PGlite();
try {
  await db.exec(`
    create role anon; create role authenticated;
    create schema auth;
    create table auth.users (id uuid primary key);
    create function auth.jwt() returns jsonb language sql stable as $f$ select coalesce(nullif(current_setting('request.jwt.claims', true), ''), '{}')::jsonb $f$;
    create function auth.uid() returns uuid language sql stable as $f$ select (auth.jwt()->>'sub')::uuid $f$;
    grant usage on schema auth to anon, authenticated;
    grant execute on function auth.jwt(), auth.uid() to anon, authenticated;
    create table public.admin_config (key text primary key, value text not null);
    create table public.products (id uuid primary key default gen_random_uuid(), name text not null, category text not null,
      standard_cut text not null, price_500g integer, price_1kg integer not null, image_url text,
      is_active boolean default true, in_stock boolean default true);
    create table public.delivery_zones (id serial primary key, name text unique not null, description text not null, charge_paise integer not null);
    create table public.serviceable_pincodes (pincode text primary key, area text not null, zone_id integer references public.delivery_zones(id), status text not null);
    create table public.orders (id uuid primary key default gen_random_uuid(), order_number bigserial unique,
      customer_name text not null, customer_phone text not null, delivery_address text not null, landmark text,
      pincode text not null, delivery_date date default current_date, delivery_slot text not null, items jsonb not null,
      subtotal integer not null, delivery_fee integer not null default 0, total_amount integer not null,
      payment_method text default 'RAZORPAY', payment_status text default 'PENDING',
      razorpay_order_id text, razorpay_payment_id text, order_status text default 'RECEIVED', created_at timestamptz default now());
    alter table public.products enable row level security;
    alter table public.delivery_zones enable row level security;
    alter table public.serviceable_pincodes enable row level security;
    alter table public.admin_config enable row level security;
    create policy products_read on public.products for select using (is_active = true);
    create policy zones_read on public.delivery_zones for select using (true);
    create policy pincodes_read on public.serviceable_pincodes for select using (status in ('Available', 'Available (legacy)'));
  `);
  for (const file of (await readdir('supabase/migrations')).filter(name => name.endsWith('.sql')).sort()) {
    await db.exec(await readFile(`supabase/migrations/${file}`, 'utf8'));
    console.log(`Migration passed: ${file}`);
  }
  for (const file of ['order_privacy.sql', 'order_pricing.sql', 'order_idempotency.sql', 'preorders.sql']) {
    await db.exec(await readFile(`supabase/tests/${file}`, 'utf8'));
    console.log(`Database test passed: ${file}`);
  }
} catch (error) { console.error(JSON.stringify({message:error.message, code:error.code, detail:error.detail, where:error.where})); process.exitCode = 1; } finally { await db.close(); }
