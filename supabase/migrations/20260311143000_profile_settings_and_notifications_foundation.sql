alter table public.profiles
  add column if not exists notifications_expense boolean not null default true,
  add column if not exists notifications_payment boolean not null default true,
  add column if not exists notifications_invite boolean not null default true,
  add column if not exists privacy_profile_visible boolean not null default true,
  add column if not exists privacy_show_balance boolean not null default true;

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  actor_id uuid references auth.users(id) on delete set null,
  group_id uuid references public.groups(id) on delete cascade,
  type text not null,
  title text not null,
  body text not null,
  payload jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_notifications_user_created_at
  on public.notifications (user_id, created_at desc);

alter table public.notifications enable row level security;

drop policy if exists notifications_select_own on public.notifications;
create policy notifications_select_own
on public.notifications
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists notifications_insert_authenticated on public.notifications;
create policy notifications_insert_authenticated
on public.notifications
for insert
to authenticated
with check (true);

drop policy if exists notifications_update_own on public.notifications;
create policy notifications_update_own
on public.notifications
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
