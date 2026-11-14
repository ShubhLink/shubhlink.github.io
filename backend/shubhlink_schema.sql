-- ShubhLink backend v1 — run in Supabase SQL editor, once.
-- SECURITY: never publish the Supabase service_role key in GitHub Pages.
create extension if not exists pgcrypto;

create table if not exists public.shubhlink_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  added_at timestamptz not null default now()
);
alter table public.shubhlink_admins enable row level security;
revoke all on public.shubhlink_admins from anon, authenticated;

create or replace function public.is_shubhlink_admin()
returns boolean language sql stable security definer
set search_path = '' as $$
  select exists (
    select 1 from public.shubhlink_admins a
    where a.user_id = (select auth.uid())
  );
$$;
revoke all on function public.is_shubhlink_admin() from public;
grant execute on function public.is_shubhlink_admin() to anon, authenticated;

create table if not exists public.shubhlink_categories (
  id text primary key check(id ~ '^[a-z][a-z0-9-]{1,30}$'),
  emoji text not null default '✨' check(char_length(emoji) <= 16),
  name_gu text not null check(char_length(name_gu) between 1 and 60),
  name_hi text not null check(char_length(name_hi) between 1 and 60),
  name_en text not null check(char_length(name_en) between 1 and 60),
  description_gu text not null default '' check(char_length(description_gu) <= 160),
  color text not null default 'pink',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
create table if not exists public.shubhlink_messages (
  id uuid primary key default gen_random_uuid(),
  category_id text not null references public.shubhlink_categories(id) on delete restrict,
  language text not null check (language in ('gu','hi','en')),
  title text not null check(char_length(title) between 1 and 120),
  body text not null check(char_length(body) between 1 and 1000),
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists shubhlink_messages_lookup on public.shubhlink_messages (category_id,language,is_published,created_at desc);

create table if not exists public.shubhlink_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '' check(char_length(display_name) <= 80),
  updated_at timestamptz not null default now()
);
create table if not exists public.shubhlink_saved_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category_id text,
  language text check(language in ('gu','hi','en')),
  title text not null check(char_length(title) between 1 and 120),
  body text not null check(char_length(body) between 1 and 1000),
  recipient_name text not null default '' check(char_length(recipient_name) <= 80),
  sender_name text not null default '' check(char_length(sender_name) <= 80),
  created_at timestamptz not null default now()
);
create index if not exists shubhlink_saved_user on public.shubhlink_saved_messages (user_id, created_at desc);

alter table public.shubhlink_categories enable row level security;
alter table public.shubhlink_messages enable row level security;
alter table public.shubhlink_profiles enable row level security;
alter table public.shubhlink_saved_messages enable row level security;

revoke all on public.shubhlink_categories, public.shubhlink_messages, public.shubhlink_profiles, public.shubhlink_saved_messages from anon,authenticated;
grant select on public.shubhlink_categories,public.shubhlink_messages to anon,authenticated;
grant insert,update,delete on public.shubhlink_categories,public.shubhlink_messages to authenticated;
grant select,insert,update,delete on public.shubhlink_profiles,public.shubhlink_saved_messages to authenticated;

create policy "Everyone reads active categories" on public.shubhlink_categories
for select to anon,authenticated using (is_active or (select public.is_shubhlink_admin()));
create policy "Admin inserts categories" on public.shubhlink_categories
for insert to authenticated with check ((select public.is_shubhlink_admin()));
create policy "Admin updates categories" on public.shubhlink_categories
for update to authenticated using ((select public.is_shubhlink_admin())) with check ((select public.is_shubhlink_admin()));
create policy "Admin deletes categories" on public.shubhlink_categories
for delete to authenticated using ((select public.is_shubhlink_admin()));
create policy "Everyone reads published wishes" on public.shubhlink_messages
for select to anon,authenticated using (is_published or (select public.is_shubhlink_admin()));
create policy "Admin inserts wishes" on public.shubhlink_messages
for insert to authenticated with check ((select public.is_shubhlink_admin()));
create policy "Admin updates wishes" on public.shubhlink_messages
for update to authenticated using ((select public.is_shubhlink_admin())) with check ((select public.is_shubhlink_admin()));
create policy "Admin deletes wishes" on public.shubhlink_messages
for delete to authenticated using ((select public.is_shubhlink_admin()));
create policy "User reads own profile" on public.shubhlink_profiles
for select to authenticated using ((select auth.uid())=user_id);
create policy "User creates own profile" on public.shubhlink_profiles
for insert to authenticated with check ((select auth.uid())=user_id);
create policy "User edits own profile" on public.shubhlink_profiles
for update to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
create policy "User deletes own profile" on public.shubhlink_profiles
for delete to authenticated using ((select auth.uid())=user_id);
create policy "User reads own saved wishes" on public.shubhlink_saved_messages
for select to authenticated using ((select auth.uid())=user_id);
create policy "User saves own wishes" on public.shubhlink_saved_messages
for insert to authenticated with check ((select auth.uid())=user_id);
create policy "User edits own saved wishes" on public.shubhlink_saved_messages
for update to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
create policy "User deletes own saved wishes" on public.shubhlink_saved_messages
for delete to authenticated using ((select auth.uid())=user_id);


-- Existing public categories so the new admin can add messages immediately.
insert into public.shubhlink_categories (id, emoji, name_gu, name_hi, name_en, description_gu, color) values
('birthday','🎂','જન્મદિવસ','जन्मदिन','Birthday','જન્મદિવસની શુભેચ્છાઓ','pink'),
('morning','🌞','સુપ્રભાત','सुप्रभात','Good Morning','સવારની સુંદર શરૂઆત','yellow'),
('suvichar','🌷','દૈનિક સુવિચાર','सुविचार','Daily Thoughts','દરરોજ પ્રેરણાદાયી વિચાર','lavender'),
('newthought','💡','નવા વિચાર','नई सोच','Fresh Ideas','નવું વિચારવાની પ્રેરણા','mint'),
('night','🌙','શુભરાત્રિ','शुभ रात्रि','Good Night','મીઠા સપનાની શુભેચ્છા','blue'),
('festival','🪔','તહેવાર શુભેચ્છા','त्योहार','Festivals','દરેક તહેવારમાં આનંદ','peach'),
('friendship','💛','મિત્રતા','दोस्ती','Friendship','દોસ્તીનું ખાસ બંધન','yellow'),
('anniversary','💍','વર્ષગાંઠ','सालगिरह','Anniversary','સાથે રહેવાની ખુશી','pink'),
('congrats','🎉','અભિનંદન','बधाई','Congratulations','સફળતાની ઉજવણી','mint'),
('afternoon','🍃','શુભ બપોર','शुभ दोपहर','Good Afternoon','બપોરની શુભેચ્છા','blue')
on conflict (id) do nothing;

-- Grant owner access AFTER creating the admin user in Supabase Authentication > Users.
-- IMPORTANT: replace with the actual authenticated Admin UUID. Do not use an unverified email.
-- insert into public.shubhlink_admins (user_id) values ('YOUR-ADMIN-AUTH-USER-UUID');

-- Optional: import curated existing public wishes after configuring Supabase.
-- Never put passwords, API secret keys or phone OTPs into these tables.
