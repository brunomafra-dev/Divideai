create or replace function public.can_create_group(p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    coalesce((select p.is_premium from public.profiles p where p.id = p_user_id), false)
    or
    (select count(*) from public.groups g where g.owner_id = p_user_id) < 3
$$;

grant execute on function public.can_create_group(uuid) to authenticated;

create or replace function public.enforce_group_quota()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_is_premium boolean;
  v_owned_groups bigint;
begin
  if new.owner_id is null then
    return new;
  end if;

  select coalesce(p.is_premium, false)
    into v_is_premium
  from public.profiles p
  where p.id = new.owner_id;

  if not coalesce(v_is_premium, false) then
    select count(*)
      into v_owned_groups
    from public.groups g
    where g.owner_id = new.owner_id;

    if v_owned_groups >= 3 then
      raise exception 'free_group_limit_reached'
        using errcode = 'P0001',
              message = 'Plano Free permite no máximo 3 grupos ativos.',
              hint = 'Faça upgrade para Premium para criar grupos ilimitados.';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_enforce_group_quota on public.groups;
create trigger trg_enforce_group_quota
before insert on public.groups
for each row
execute function public.enforce_group_quota();

do $$
declare
  r record;
begin
  for r in
    select p.policyname
    from pg_policies p
    where p.schemaname = 'public'
      and p.tablename = 'groups'
      and p.cmd = 'INSERT'
  loop
    execute format('drop policy if exists %I on public.groups', r.policyname);
  end loop;
end
$$;

create policy groups_insert_with_quota
on public.groups
for insert
to authenticated
with check (
  auth.uid() = owner_id
  and public.can_create_group(owner_id)
);
