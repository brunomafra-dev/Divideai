-- Fix transaction payer validation to use participants table (source of truth)
-- instead of legacy groups.participants jsonb.

drop trigger if exists trg_check_payer_in_group_participants on public.transactions;
drop function if exists public.check_payer_in_group_participants();

create or replace function public.check_payer_in_group_participants()
returns trigger
language plpgsql
as $$
begin
  if not exists (
    select 1
    from public.participants p
    where p.group_id = new.group_id
      and p.user_id = new.payer_id
  ) then
    raise exception 'payer_id must exist in group participants';
  end if;

  return new;
end;
$$;

create trigger trg_check_payer_in_group_participants
before insert or update on public.transactions
for each row
execute function public.check_payer_in_group_participants();

