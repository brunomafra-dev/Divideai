create table if not exists public.payment_reminders (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  from_user uuid not null references auth.users(id) on delete cascade,
  to_user uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists idx_payment_reminders_pair_group_created_at
  on public.payment_reminders (group_id, from_user, to_user, created_at desc);

alter table public.payment_reminders enable row level security;

drop policy if exists payment_reminders_insert_sender on public.payment_reminders;
create policy payment_reminders_insert_sender
on public.payment_reminders
for insert
to authenticated
with check (auth.uid() = from_user);

drop policy if exists payment_reminders_select_sender_or_recipient on public.payment_reminders;
create policy payment_reminders_select_sender_or_recipient
on public.payment_reminders
for select
to authenticated
using (auth.uid() = from_user or auth.uid() = to_user);
