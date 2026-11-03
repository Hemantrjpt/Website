create table if not exists public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 display_name text not null default '',
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create table if not exists public.catalog_items (
 id uuid primary key default gen_random_uuid(),
 slug text not null unique,
 title text not null,
 kind text not null check (kind in ('script','plugin','asset','tutorial')),
 summary text not null default '',
 body text not null default '',
 cover_path text,
 download_path text,
 external_url text,
 is_published boolean not null default false,
 is_featured boolean not null default false,
 created_by uuid references auth.users(id) on delete set null,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create table if not exists public.access_grants (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 catalog_item_id uuid not null references public.catalog_items(id) on delete cascade,
 license_code text not null unique,
 status text not null default 'active' check (status in ('active','revoked','expired')),
 expires_at timestamptz,
 created_by uuid references auth.users(id) on delete set null,
 created_at timestamptz not null default now(),
 unique(user_id,catalog_item_id)
);
create table if not exists public.hub_announcements (
 id uuid primary key default gen_random_uuid(),
 title text not null,
 body text not null default '',
 tone text not null default 'info' check (tone in ('info','success','warning')),
 is_published boolean not null default false,
 created_by uuid references auth.users(id) on delete set null,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create index if not exists catalog_items_published_idx on public.catalog_items(is_published,is_featured,created_at desc);
create index if not exists access_grants_user_idx on public.access_grants(user_id,status);
create index if not exists hub_announcements_published_idx on public.hub_announcements(is_published,created_at desc);
alter table public.profiles enable row level security;
alter table public.catalog_items enable row level security;
alter table public.access_grants enable row level security;
alter table public.hub_announcements enable row level security;
drop policy if exists "profiles_read_own" on public.profiles;
create policy "profiles_read_own" on public.profiles for select to authenticated using ((select auth.uid())=id);
drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles for insert to authenticated with check ((select auth.uid())=id);
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles for update to authenticated using ((select auth.uid())=id) with check ((select auth.uid())=id);
drop policy if exists "catalog_public_read_published" on public.catalog_items;
create policy "catalog_public_read_published" on public.catalog_items for select to anon,authenticated using (is_published=true or (auth.jwt()->'app_metadata'->>'role')='admin');
drop policy if exists "catalog_admin_insert" on public.catalog_items;
create policy "catalog_admin_insert" on public.catalog_items for insert to authenticated with check ((auth.jwt()->'app_metadata'->>'role')='admin');
drop policy if exists "catalog_admin_update" on public.catalog_items;
create policy "catalog_admin_update" on public.catalog_items for update to authenticated using ((auth.jwt()->'app_metadata'->>'role')='admin') with check ((auth.jwt()->'app_metadata'->>'role')='admin');
drop policy if exists "catalog_admin_delete" on public.catalog_items;
create policy "catalog_admin_delete" on public.catalog_items for delete to authenticated using ((auth.jwt()->'app_metadata'->>'role')='admin');
drop policy if exists "grants_read_own_or_admin" on public.access_grants;
create policy "grants_read_own_or_admin" on public.access_grants for select to authenticated using ((select auth.uid())=user_id or (auth.jwt()->'app_metadata'->>'role')='admin');
drop policy if exists "grants_admin_insert" on public.access_grants;
create policy "grants_admin_insert" on public.access_grants for insert to authenticated with check ((auth.jwt()->'app_metadata'->>'role')='admin');
drop policy if exists "grants_admin_update" on public.access_grants;
create policy "grants_admin_update" on public.access_grants for update to authenticated using ((auth.jwt()->'app_metadata'->>'role')='admin') with check ((auth.jwt()->'app_metadata'->>'role')='admin');
drop policy if exists "grants_admin_delete" on public.access_grants;
create policy "grants_admin_delete" on public.access_grants for delete to authenticated using ((auth.jwt()->'app_metadata'->>'role')='admin');
drop policy if exists "announcements_read_published" on public.hub_announcements;
create policy "announcements_read_published" on public.hub_announcements for select to anon,authenticated using (is_published=true or (auth.jwt()->'app_metadata'->>'role')='admin');
drop policy if exists "announcements_admin_insert" on public.hub_announcements;
create policy "announcements_admin_insert" on public.hub_announcements for insert to authenticated with check ((auth.jwt()->'app_metadata'->>'role')='admin');
drop policy if exists "announcements_admin_update" on public.hub_announcements;
create policy "announcements_admin_update" on public.hub_announcements for update to authenticated using ((auth.jwt()->'app_metadata'->>'role')='admin') with check ((auth.jwt()->'app_metadata'->>'role')='admin');
drop policy if exists "announcements_admin_delete" on public.hub_announcements;
create policy "announcements_admin_delete" on public.hub_announcements for delete to authenticated using ((auth.jwt()->'app_metadata'->>'role')='admin');
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values
 ('titanichub-assets','titanichub-assets',true,10485760,array['image/png','image/jpeg','image/webp','image/gif','image/svg+xml']),
 ('titanichub-downloads','titanichub-downloads',false,52428800,array['application/zip','application/pdf','text/plain','application/octet-stream'])
on conflict(id) do update set public=excluded.public,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;
drop policy if exists "hub_assets_public_read" on storage.objects;
create policy "hub_assets_public_read" on storage.objects for select to anon,authenticated using(bucket_id='titanichub-assets');
drop policy if exists "hub_assets_admin_insert" on storage.objects;
create policy "hub_assets_admin_insert" on storage.objects for insert to authenticated with check(bucket_id='titanichub-assets' and (auth.jwt()->'app_metadata'->>'role')='admin');
drop policy if exists "hub_assets_admin_update" on storage.objects;
create policy "hub_assets_admin_update" on storage.objects for update to authenticated using(bucket_id='titanichub-assets' and (auth.jwt()->'app_metadata'->>'role')='admin') with check(bucket_id='titanichub-assets' and (auth.jwt()->'app_metadata'->>'role')='admin');
drop policy if exists "hub_assets_admin_delete" on storage.objects;
create policy "hub_assets_admin_delete" on storage.objects for delete to authenticated using(bucket_id='titanichub-assets' and (auth.jwt()->'app_metadata'->>'role')='admin');
drop policy if exists "hub_downloads_admin_all" on storage.objects;
create policy "hub_downloads_admin_all" on storage.objects for all to authenticated using(bucket_id='titanichub-downloads' and (auth.jwt()->'app_metadata'->>'role')='admin') with check(bucket_id='titanichub-downloads' and (auth.jwt()->'app_metadata'->>'role')='admin');
drop policy if exists "hub_downloads_granted_read" on storage.objects;
create policy "hub_downloads_granted_read" on storage.objects for select to authenticated using(
 bucket_id='titanichub-downloads'
 and split_part(name,'/',1) ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
 and exists(select 1 from public.access_grants g where g.user_id=(select auth.uid()) and g.catalog_item_id=split_part(name,'/',1)::uuid and g.status='active' and (g.expires_at is null or g.expires_at>now()))
);
grant select on public.catalog_items,public.hub_announcements to anon,authenticated;
grant select,insert,update on public.profiles to authenticated;
grant select,insert,update,delete on public.catalog_items,public.hub_announcements,public.access_grants to authenticated;
