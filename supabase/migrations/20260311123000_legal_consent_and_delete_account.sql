alter table public.profiles
  add column if not exists terms_accepted_at timestamptz,
  add column if not exists privacy_accepted_at timestamptz;

create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_user uuid := auth.uid();
begin
  if v_user is null then
    raise exception 'not_authenticated';
  end if;

  delete from public.payment_reminders where from_user = v_user or to_user = v_user;
  delete from public.payments where from_user = v_user or to_user = v_user;
  delete from public.transactions where payer_id = v_user;
  delete from public.participants where user_id = v_user;
  delete from public.groups where owner_id = v_user;
  delete from public.user_payment_settings where user_id = v_user;
  delete from public.profiles where id = v_user;

  delete from auth.users where id = v_user;
end;
$$;

revoke all on function public.delete_my_account() from public;
grant execute on function public.delete_my_account() to authenticated;
