drop extension if exists "pg_net";


  create table "public"."groups" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "name" text not null,
    "category" text not null,
    "owner_id" uuid not null,
    "created_at" timestamp with time zone default now(),
    "participants" jsonb
      );


alter table "public"."groups" enable row level security;


  create table "public"."invite_tokens" (
    "id" uuid not null default gen_random_uuid(),
    "group_id" uuid not null,
    "created_by" uuid not null,
    "token" text not null,
    "created_at" timestamp with time zone not null default now(),
    "expires_at" timestamp with time zone
      );


alter table "public"."invite_tokens" enable row level security;


  create table "public"."participants" (
    "id" uuid not null default gen_random_uuid(),
    "group_id" uuid not null,
    "user_id" uuid not null,
    "created_at" timestamp with time zone default now(),
    "role" text not null default 'member'::text
      );


alter table "public"."participants" enable row level security;


  create table "public"."payments" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "group_id" uuid not null,
    "from_user" uuid not null,
    "to_user" uuid not null,
    "amount" numeric(12,2) not null,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."payments" enable row level security;


  create table "public"."transactions" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "group_id" uuid not null,
    "payer_id" uuid not null,
    "description" text not null,
    "value" numeric(12,2) not null,
    "splits" jsonb not null,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."transactions" enable row level security;


  create table "public"."user_payment_settings" (
    "user_id" uuid not null,
    "pix_key" text,
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."user_payment_settings" enable row level security;

CREATE UNIQUE INDEX groups_pkey ON public.groups USING btree (id);

CREATE UNIQUE INDEX invite_tokens_pkey ON public.invite_tokens USING btree (id);

CREATE UNIQUE INDEX invite_tokens_token_key ON public.invite_tokens USING btree (token);

CREATE UNIQUE INDEX participants_group_id_user_id_key ON public.participants USING btree (group_id, user_id);

CREATE UNIQUE INDEX participants_group_user_unique ON public.participants USING btree (group_id, user_id);

CREATE UNIQUE INDEX participants_group_user_unique_idx ON public.participants USING btree (group_id, user_id);

CREATE UNIQUE INDEX participants_pkey ON public.participants USING btree (id);

CREATE INDEX payments_from_user_idx ON public.payments USING btree (from_user);

CREATE INDEX payments_group_id_idx ON public.payments USING btree (group_id);

CREATE UNIQUE INDEX payments_pkey ON public.payments USING btree (id);

CREATE INDEX payments_to_user_idx ON public.payments USING btree (to_user);

CREATE UNIQUE INDEX transactions_pkey ON public.transactions USING btree (id);

CREATE UNIQUE INDEX unique_group_user ON public.participants USING btree (group_id, user_id);

CREATE UNIQUE INDEX user_payment_settings_pkey ON public.user_payment_settings USING btree (user_id);

alter table "public"."groups" add constraint "groups_pkey" PRIMARY KEY using index "groups_pkey";

alter table "public"."invite_tokens" add constraint "invite_tokens_pkey" PRIMARY KEY using index "invite_tokens_pkey";

alter table "public"."participants" add constraint "participants_pkey" PRIMARY KEY using index "participants_pkey";

alter table "public"."payments" add constraint "payments_pkey" PRIMARY KEY using index "payments_pkey";

alter table "public"."transactions" add constraint "transactions_pkey" PRIMARY KEY using index "transactions_pkey";

alter table "public"."user_payment_settings" add constraint "user_payment_settings_pkey" PRIMARY KEY using index "user_payment_settings_pkey";

alter table "public"."groups" add constraint "groups_owner_id_fkey" FOREIGN KEY (owner_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."groups" validate constraint "groups_owner_id_fkey";

alter table "public"."invite_tokens" add constraint "invite_tokens_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."invite_tokens" validate constraint "invite_tokens_created_by_fkey";

alter table "public"."invite_tokens" add constraint "invite_tokens_group_id_fkey" FOREIGN KEY (group_id) REFERENCES public.groups(id) ON DELETE CASCADE not valid;

alter table "public"."invite_tokens" validate constraint "invite_tokens_group_id_fkey";

alter table "public"."invite_tokens" add constraint "invite_tokens_token_key" UNIQUE using index "invite_tokens_token_key";

alter table "public"."participants" add constraint "participants_group_id_fkey" FOREIGN KEY (group_id) REFERENCES public.groups(id) ON DELETE CASCADE not valid;

alter table "public"."participants" validate constraint "participants_group_id_fkey";

alter table "public"."participants" add constraint "participants_group_id_user_id_key" UNIQUE using index "participants_group_id_user_id_key";

alter table "public"."participants" add constraint "participants_group_user_unique" UNIQUE using index "participants_group_user_unique";

alter table "public"."participants" add constraint "participants_role_check" CHECK ((role = ANY (ARRAY['owner'::text, 'member'::text]))) not valid;

alter table "public"."participants" validate constraint "participants_role_check";

alter table "public"."participants" add constraint "participants_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."participants" validate constraint "participants_user_id_fkey";

alter table "public"."participants" add constraint "unique_group_user" UNIQUE using index "unique_group_user";

alter table "public"."payments" add constraint "payments_group_id_fkey" FOREIGN KEY (group_id) REFERENCES public.groups(id) ON DELETE CASCADE not valid;

alter table "public"."payments" validate constraint "payments_group_id_fkey";

alter table "public"."transactions" add constraint "transactions_group_id_fkey" FOREIGN KEY (group_id) REFERENCES public.groups(id) ON DELETE CASCADE not valid;

alter table "public"."transactions" validate constraint "transactions_group_id_fkey";

alter table "public"."user_payment_settings" add constraint "user_payment_settings_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."user_payment_settings" validate constraint "user_payment_settings_user_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.check_payer_in_group_participants()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
begin
  if not exists (
    select 1
    from public.groups g,
         jsonb_array_elements(coalesce(g.participants, '[]'::jsonb)) p
    where g.id = new.group_id
      and (p->>'id') = new.payer_id::text
  ) then
    raise exception 'payer_id must exist in group participants';
  end if;

  return new;
end;
$function$
;

grant delete on table "public"."groups" to "anon";

grant insert on table "public"."groups" to "anon";

grant references on table "public"."groups" to "anon";

grant select on table "public"."groups" to "anon";

grant trigger on table "public"."groups" to "anon";

grant truncate on table "public"."groups" to "anon";

grant update on table "public"."groups" to "anon";

grant delete on table "public"."groups" to "authenticated";

grant insert on table "public"."groups" to "authenticated";

grant references on table "public"."groups" to "authenticated";

grant select on table "public"."groups" to "authenticated";

grant trigger on table "public"."groups" to "authenticated";

grant truncate on table "public"."groups" to "authenticated";

grant update on table "public"."groups" to "authenticated";

grant delete on table "public"."groups" to "service_role";

grant insert on table "public"."groups" to "service_role";

grant references on table "public"."groups" to "service_role";

grant select on table "public"."groups" to "service_role";

grant trigger on table "public"."groups" to "service_role";

grant truncate on table "public"."groups" to "service_role";

grant update on table "public"."groups" to "service_role";

grant delete on table "public"."invite_tokens" to "anon";

grant insert on table "public"."invite_tokens" to "anon";

grant references on table "public"."invite_tokens" to "anon";

grant select on table "public"."invite_tokens" to "anon";

grant trigger on table "public"."invite_tokens" to "anon";

grant truncate on table "public"."invite_tokens" to "anon";

grant update on table "public"."invite_tokens" to "anon";

grant delete on table "public"."invite_tokens" to "authenticated";

grant insert on table "public"."invite_tokens" to "authenticated";

grant references on table "public"."invite_tokens" to "authenticated";

grant select on table "public"."invite_tokens" to "authenticated";

grant trigger on table "public"."invite_tokens" to "authenticated";

grant truncate on table "public"."invite_tokens" to "authenticated";

grant update on table "public"."invite_tokens" to "authenticated";

grant delete on table "public"."invite_tokens" to "service_role";

grant insert on table "public"."invite_tokens" to "service_role";

grant references on table "public"."invite_tokens" to "service_role";

grant select on table "public"."invite_tokens" to "service_role";

grant trigger on table "public"."invite_tokens" to "service_role";

grant truncate on table "public"."invite_tokens" to "service_role";

grant update on table "public"."invite_tokens" to "service_role";

grant delete on table "public"."participants" to "anon";

grant insert on table "public"."participants" to "anon";

grant references on table "public"."participants" to "anon";

grant select on table "public"."participants" to "anon";

grant trigger on table "public"."participants" to "anon";

grant truncate on table "public"."participants" to "anon";

grant update on table "public"."participants" to "anon";

grant delete on table "public"."participants" to "authenticated";

grant insert on table "public"."participants" to "authenticated";

grant references on table "public"."participants" to "authenticated";

grant select on table "public"."participants" to "authenticated";

grant trigger on table "public"."participants" to "authenticated";

grant truncate on table "public"."participants" to "authenticated";

grant update on table "public"."participants" to "authenticated";

grant delete on table "public"."participants" to "service_role";

grant insert on table "public"."participants" to "service_role";

grant references on table "public"."participants" to "service_role";

grant select on table "public"."participants" to "service_role";

grant trigger on table "public"."participants" to "service_role";

grant truncate on table "public"."participants" to "service_role";

grant update on table "public"."participants" to "service_role";

grant delete on table "public"."payments" to "anon";

grant insert on table "public"."payments" to "anon";

grant references on table "public"."payments" to "anon";

grant select on table "public"."payments" to "anon";

grant trigger on table "public"."payments" to "anon";

grant truncate on table "public"."payments" to "anon";

grant update on table "public"."payments" to "anon";

grant delete on table "public"."payments" to "authenticated";

grant insert on table "public"."payments" to "authenticated";

grant references on table "public"."payments" to "authenticated";

grant select on table "public"."payments" to "authenticated";

grant trigger on table "public"."payments" to "authenticated";

grant truncate on table "public"."payments" to "authenticated";

grant update on table "public"."payments" to "authenticated";

grant delete on table "public"."payments" to "service_role";

grant insert on table "public"."payments" to "service_role";

grant references on table "public"."payments" to "service_role";

grant select on table "public"."payments" to "service_role";

grant trigger on table "public"."payments" to "service_role";

grant truncate on table "public"."payments" to "service_role";

grant update on table "public"."payments" to "service_role";

grant delete on table "public"."transactions" to "anon";

grant insert on table "public"."transactions" to "anon";

grant references on table "public"."transactions" to "anon";

grant select on table "public"."transactions" to "anon";

grant trigger on table "public"."transactions" to "anon";

grant truncate on table "public"."transactions" to "anon";

grant update on table "public"."transactions" to "anon";

grant delete on table "public"."transactions" to "authenticated";

grant insert on table "public"."transactions" to "authenticated";

grant references on table "public"."transactions" to "authenticated";

grant select on table "public"."transactions" to "authenticated";

grant trigger on table "public"."transactions" to "authenticated";

grant truncate on table "public"."transactions" to "authenticated";

grant update on table "public"."transactions" to "authenticated";

grant delete on table "public"."transactions" to "service_role";

grant insert on table "public"."transactions" to "service_role";

grant references on table "public"."transactions" to "service_role";

grant select on table "public"."transactions" to "service_role";

grant trigger on table "public"."transactions" to "service_role";

grant truncate on table "public"."transactions" to "service_role";

grant update on table "public"."transactions" to "service_role";

grant delete on table "public"."user_payment_settings" to "anon";

grant insert on table "public"."user_payment_settings" to "anon";

grant references on table "public"."user_payment_settings" to "anon";

grant select on table "public"."user_payment_settings" to "anon";

grant trigger on table "public"."user_payment_settings" to "anon";

grant truncate on table "public"."user_payment_settings" to "anon";

grant update on table "public"."user_payment_settings" to "anon";

grant delete on table "public"."user_payment_settings" to "authenticated";

grant insert on table "public"."user_payment_settings" to "authenticated";

grant references on table "public"."user_payment_settings" to "authenticated";

grant select on table "public"."user_payment_settings" to "authenticated";

grant trigger on table "public"."user_payment_settings" to "authenticated";

grant truncate on table "public"."user_payment_settings" to "authenticated";

grant update on table "public"."user_payment_settings" to "authenticated";

grant delete on table "public"."user_payment_settings" to "service_role";

grant insert on table "public"."user_payment_settings" to "service_role";

grant references on table "public"."user_payment_settings" to "service_role";

grant select on table "public"."user_payment_settings" to "service_role";

grant trigger on table "public"."user_payment_settings" to "service_role";

grant truncate on table "public"."user_payment_settings" to "service_role";

grant update on table "public"."user_payment_settings" to "service_role";


  create policy "Only owner can delete group"
  on "public"."groups"
  as permissive
  for delete
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.participants
  WHERE ((participants.group_id = groups.id) AND (participants.user_id = auth.uid()) AND (participants.role = 'owner'::text)))));



  create policy "groups_delete_owner"
  on "public"."groups"
  as permissive
  for delete
  to authenticated
using ((owner_id = auth.uid()));



  create policy "groups_delete_owner_only"
  on "public"."groups"
  as permissive
  for delete
  to authenticated
using ((auth.uid() = owner_id));



  create policy "groups_insert"
  on "public"."groups"
  as permissive
  for insert
  to public
with check ((owner_id = auth.uid()));



  create policy "groups_insert_own"
  on "public"."groups"
  as permissive
  for insert
  to authenticated
with check ((owner_id = auth.uid()));



  create policy "groups_select"
  on "public"."groups"
  as permissive
  for select
  to public
using ((EXISTS ( SELECT 1
   FROM public.participants
  WHERE ((participants.group_id = groups.id) AND (participants.user_id = auth.uid())))));



  create policy "groups_select_own"
  on "public"."groups"
  as permissive
  for select
  to authenticated
using ((owner_id = auth.uid()));



  create policy "groups_select_owner_or_member"
  on "public"."groups"
  as permissive
  for select
  to authenticated
using (((owner_id = auth.uid()) OR (EXISTS ( SELECT 1
   FROM public.participants p
  WHERE ((p.group_id = groups.id) AND (p.user_id = auth.uid()))))));



  create policy "groups_update_members"
  on "public"."groups"
  as permissive
  for update
  to authenticated
using (((owner_id = auth.uid()) OR (EXISTS ( SELECT 1
   FROM jsonb_array_elements(COALESCE(groups.participants, '[]'::jsonb)) p(value)
  WHERE ((p.value ->> 'id'::text) = (auth.uid())::text)))))
with check (((owner_id = auth.uid()) OR (EXISTS ( SELECT 1
   FROM jsonb_array_elements(COALESCE(groups.participants, '[]'::jsonb)) p(value)
  WHERE ((p.value ->> 'id'::text) = (auth.uid())::text)))));



  create policy "groups_update_owner_only"
  on "public"."groups"
  as permissive
  for update
  to authenticated
using ((auth.uid() = owner_id))
with check ((auth.uid() = owner_id));



  create policy "select_groups_if_participant"
  on "public"."groups"
  as permissive
  for select
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.participants
  WHERE ((participants.group_id = groups.id) AND (participants.user_id = auth.uid())))));



  create policy "invite_tokens_insert_group_member"
  on "public"."invite_tokens"
  as permissive
  for insert
  to authenticated
with check (((created_by = auth.uid()) AND (EXISTS ( SELECT 1
   FROM public.participants p
  WHERE ((p.group_id = invite_tokens.group_id) AND (p.user_id = auth.uid()))))));



  create policy "invite_tokens_insert_group_members"
  on "public"."invite_tokens"
  as permissive
  for insert
  to authenticated
with check (((created_by = auth.uid()) AND (EXISTS ( SELECT 1
   FROM public.groups g
  WHERE ((g.id = invite_tokens.group_id) AND (EXISTS ( SELECT 1
           FROM jsonb_array_elements(COALESCE(g.participants, '[]'::jsonb)) p(value)
          WHERE (COALESCE((p.value ->> 'user_id'::text), (p.value ->> 'id'::text)) = (auth.uid())::text))))))));



  create policy "invite_tokens_select_all"
  on "public"."invite_tokens"
  as permissive
  for select
  to anon, authenticated
using (true);



  create policy "invite_tokens_select_authenticated"
  on "public"."invite_tokens"
  as permissive
  for select
  to authenticated
using (true);



  create policy "invite_tokens_update_creator"
  on "public"."invite_tokens"
  as permissive
  for update
  to authenticated
using ((created_by = auth.uid()))
with check ((created_by = auth.uid()));



  create policy "insert_participant_self"
  on "public"."participants"
  as permissive
  for insert
  to authenticated
with check ((user_id = auth.uid()));



  create policy "participants_insert"
  on "public"."participants"
  as permissive
  for insert
  to public
with check ((user_id = auth.uid()));



  create policy "participants_insert_self"
  on "public"."participants"
  as permissive
  for insert
  to authenticated
with check ((user_id = auth.uid()));



  create policy "participants_select"
  on "public"."participants"
  as permissive
  for select
  to public
using ((user_id = auth.uid()));



  create policy "participants_select_self"
  on "public"."participants"
  as permissive
  for select
  to authenticated
using ((user_id = auth.uid()));



  create policy "payments_delete_members"
  on "public"."payments"
  as permissive
  for delete
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.groups g
  WHERE ((g.id = payments.group_id) AND (g.owner_id = auth.uid())))));



  create policy "payments_insert"
  on "public"."payments"
  as permissive
  for insert
  to public
with check ((EXISTS ( SELECT 1
   FROM public.participants
  WHERE ((participants.group_id = payments.group_id) AND (participants.user_id = auth.uid())))));



  create policy "payments_insert_members"
  on "public"."payments"
  as permissive
  for insert
  to authenticated
with check (((EXISTS ( SELECT 1
   FROM public.groups g
  WHERE ((g.id = payments.group_id) AND ((g.owner_id = auth.uid()) OR (EXISTS ( SELECT 1
           FROM jsonb_array_elements(COALESCE(g.participants, '[]'::jsonb)) p(value)
          WHERE ((p.value ->> 'id'::text) = (auth.uid())::text))))))) AND ((from_user = auth.uid()) OR (to_user = auth.uid()))));



  create policy "payments_select"
  on "public"."payments"
  as permissive
  for select
  to public
using ((EXISTS ( SELECT 1
   FROM public.participants
  WHERE ((participants.group_id = payments.group_id) AND (participants.user_id = auth.uid())))));



  create policy "payments_select_members"
  on "public"."payments"
  as permissive
  for select
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.groups g
  WHERE ((g.id = payments.group_id) AND ((g.owner_id = auth.uid()) OR (EXISTS ( SELECT 1
           FROM jsonb_array_elements(COALESCE(g.participants, '[]'::jsonb)) p(value)
          WHERE ((p.value ->> 'id'::text) = (auth.uid())::text))))))));



  create policy "transactions_delete_members"
  on "public"."transactions"
  as permissive
  for delete
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.groups g
  WHERE ((g.id = transactions.group_id) AND (g.owner_id = auth.uid())))));



  create policy "transactions_insert"
  on "public"."transactions"
  as permissive
  for insert
  to public
with check ((EXISTS ( SELECT 1
   FROM public.participants
  WHERE ((participants.group_id = transactions.group_id) AND (participants.user_id = auth.uid())))));



  create policy "transactions_insert_members"
  on "public"."transactions"
  as permissive
  for insert
  to authenticated
with check (((EXISTS ( SELECT 1
   FROM public.groups g
  WHERE ((g.id = transactions.group_id) AND ((g.owner_id = auth.uid()) OR (EXISTS ( SELECT 1
           FROM jsonb_array_elements(COALESCE(g.participants, '[]'::jsonb)) p(value)
          WHERE ((p.value ->> 'id'::text) = (auth.uid())::text))))))) AND (EXISTS ( SELECT 1
   FROM public.groups g2,
    LATERAL jsonb_array_elements(COALESCE(g2.participants, '[]'::jsonb)) p2(value)
  WHERE ((g2.id = transactions.group_id) AND ((p2.value ->> 'id'::text) = (transactions.payer_id)::text))))));



  create policy "transactions_select"
  on "public"."transactions"
  as permissive
  for select
  to public
using ((EXISTS ( SELECT 1
   FROM public.participants
  WHERE ((participants.group_id = transactions.group_id) AND (participants.user_id = auth.uid())))));



  create policy "transactions_select_authenticated"
  on "public"."transactions"
  as permissive
  for select
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.groups g
  WHERE ((g.id = transactions.group_id) AND ((g.owner_id = auth.uid()) OR (EXISTS ( SELECT 1
           FROM jsonb_array_elements(COALESCE(g.participants, '[]'::jsonb)) p(value)
          WHERE (((p.value ->> 'id'::text))::uuid = auth.uid()))))))));



  create policy "transactions_update_by_payer"
  on "public"."transactions"
  as permissive
  for update
  to authenticated
using ((payer_id = auth.uid()))
with check ((payer_id = auth.uid()));



  create policy "transactions_update_members"
  on "public"."transactions"
  as permissive
  for update
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.groups g
  WHERE ((g.id = transactions.group_id) AND ((g.owner_id = auth.uid()) OR (EXISTS ( SELECT 1
           FROM jsonb_array_elements(COALESCE(g.participants, '[]'::jsonb)) p(value)
          WHERE ((p.value ->> 'id'::text) = (auth.uid())::text))))))))
with check ((EXISTS ( SELECT 1
   FROM public.groups g
  WHERE ((g.id = transactions.group_id) AND ((g.owner_id = auth.uid()) OR (EXISTS ( SELECT 1
           FROM jsonb_array_elements(COALESCE(g.participants, '[]'::jsonb)) p(value)
          WHERE ((p.value ->> 'id'::text) = (auth.uid())::text))))))));



  create policy "user_payment_settings_select_own"
  on "public"."user_payment_settings"
  as permissive
  for select
  to authenticated
using ((user_id = auth.uid()));



  create policy "user_payment_settings_update_own"
  on "public"."user_payment_settings"
  as permissive
  for update
  to authenticated
using ((user_id = auth.uid()))
with check ((user_id = auth.uid()));



  create policy "user_payment_settings_upsert_own"
  on "public"."user_payment_settings"
  as permissive
  for insert
  to authenticated
with check ((user_id = auth.uid()));


CREATE TRIGGER trg_check_payer_in_group_participants BEFORE INSERT OR UPDATE ON public.transactions FOR EACH ROW EXECUTE FUNCTION public.check_payer_in_group_participants();


