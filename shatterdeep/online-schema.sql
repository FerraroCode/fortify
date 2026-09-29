-- SHATTERDEEP 0.5. Additive schema, isolated from the Fortify application.
create schema if not exists shatterdeep_private;
revoke all on schema shatterdeep_private from public, anon;
grant usage on schema shatterdeep_private to authenticated;
create table public.sd_profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 name text not null check (char_length(name) between 1 and 22),
 appearance jsonb not null default '{}'::jsonb check(octet_length(appearance::text)<50000),
 depth integer not null default 1 check(depth between 1 and 10000000),
 level integer not null default 1 check(level between 1 and 10000000),
 updated_at timestamptz not null default now()
);
create table public.sd_saves (
 user_id uuid primary key references auth.users(id) on delete cascade,
 data jsonb not null check(octet_length(data::text)<500000),
 updated_at timestamptz not null default now()
);
create table public.sd_clans (
 id uuid primary key default gen_random_uuid(),
 name text not null check(char_length(name) between 3 and 32),
 owner_id uuid not null references auth.users(id),
 invite_code text not null unique default upper(substr(replace(gen_random_uuid()::text,'-',''),1,12)),
 resources bigint not null default 0 check(resources>=0),
 created_at timestamptz not null default now()
);
create table public.sd_members (
 user_id uuid primary key references auth.users(id) on delete cascade,
 clan_id uuid not null references public.sd_clans(id) on delete cascade,
 contributed bigint not null default 0 check(contributed>=0),
 joined_at timestamptz not null default now()
);
create index sd_members_clan_idx on public.sd_members(clan_id);
alter table public.sd_profiles enable row level security;
alter table public.sd_saves enable row level security;
alter table public.sd_clans enable row level security;
alter table public.sd_members enable row level security;
revoke all on public.sd_profiles,public.sd_saves,public.sd_clans,public.sd_members from anon;
grant select,insert,update on public.sd_profiles,public.sd_saves to authenticated;
grant select on public.sd_clans,public.sd_members to authenticated;

create function shatterdeep_private.my_clan() returns uuid language sql stable security definer set search_path='' as $$
 select m.clan_id from public.sd_members m where m.user_id=(select auth.uid());
$$;
revoke all on function shatterdeep_private.my_clan() from public,anon;
grant execute on function shatterdeep_private.my_clan() to authenticated;
create policy sd_profiles_read on public.sd_profiles for select to authenticated using(id=(select auth.uid()) or exists(select 1 from public.sd_members m where m.user_id=id and m.clan_id=(select shatterdeep_private.my_clan())));
create policy sd_profiles_create on public.sd_profiles for insert to authenticated with check(id=(select auth.uid()));
create policy sd_profiles_update on public.sd_profiles for update to authenticated using(id=(select auth.uid())) with check(id=(select auth.uid()));
create policy sd_saves_read on public.sd_saves for select to authenticated using(user_id=(select auth.uid()));
create policy sd_saves_create on public.sd_saves for insert to authenticated with check(user_id=(select auth.uid()));
create policy sd_saves_update on public.sd_saves for update to authenticated using(user_id=(select auth.uid())) with check(user_id=(select auth.uid()));
create policy sd_clans_read on public.sd_clans for select to authenticated using(id=(select shatterdeep_private.my_clan()));
create policy sd_members_read on public.sd_members for select to authenticated using(user_id=(select auth.uid()) or clan_id=(select shatterdeep_private.my_clan()));

create function shatterdeep_private.create_clan(clan_name text) returns uuid language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); cid uuid;
begin
 if uid is null then raise exception 'Sign in first'; end if;
 if char_length(trim(clan_name)) not between 3 and 32 then raise exception 'Clan name must be 3–32 characters'; end if;
 perform pg_advisory_xact_lock(hashtext(uid::text));
 if exists(select 1 from public.sd_members where user_id=uid) then raise exception 'You already belong to a clan'; end if;
 insert into public.sd_clans(name,owner_id) values(trim(clan_name),uid) returning id into cid;
 insert into public.sd_members(user_id,clan_id) values(uid,cid);
 return cid;
end $$;
create function shatterdeep_private.join_clan(code text) returns uuid language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); cid uuid;
begin
 if uid is null then raise exception 'Sign in first'; end if;
 perform pg_advisory_xact_lock(hashtext(uid::text));
 if exists(select 1 from public.sd_members where user_id=uid) then raise exception 'You already belong to a clan'; end if;
 select id into cid from public.sd_clans where invite_code=upper(trim(code));
 if cid is null then raise exception 'That invite code was not found'; end if;
 insert into public.sd_members(user_id,clan_id) values(uid,cid);
 return cid;
end $$;
create function shatterdeep_private.donate(amount integer) returns bigint language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); cid uuid; saved jsonb; balance bigint; total bigint;
begin
 if uid is null then raise exception 'Sign in first'; end if;
 if amount<1 or amount>10000 then raise exception 'Choose an amount from 1 to 10000'; end if;
 select clan_id into cid from public.sd_members where user_id=uid;
 if cid is null then raise exception 'Join a clan first'; end if;
 select data into saved from public.sd_saves where user_id=uid for update;
 balance:=coalesce((saved->'bank'->>'stone')::bigint,0);
 if balance<amount then raise exception 'Bank more stone at your fortress first'; end if;
 update public.sd_saves set data=jsonb_set(saved,'{bank,stone}',to_jsonb(balance-amount)),updated_at=now() where user_id=uid;
 update public.sd_members set contributed=contributed+amount where user_id=uid;
 update public.sd_clans set resources=resources+amount where id=cid returning resources into total;
 return total;
end $$;
create function shatterdeep_private.leave_clan() returns void language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); cid uuid; owner uuid;
begin
 if uid is null then raise exception 'Sign in first'; end if;
 select clan_id into cid from public.sd_members where user_id=uid;
 if cid is null then return; end if;
 select owner_id into owner from public.sd_clans where id=cid for update;
 if owner=uid and exists(select 1 from public.sd_members where clan_id=cid and user_id<>uid) then raise exception 'The clan founder must stay while other members remain'; end if;
 delete from public.sd_members where user_id=uid;
 if owner=uid then delete from public.sd_clans where id=cid; end if;
end $$;
revoke all on function shatterdeep_private.create_clan(text),shatterdeep_private.join_clan(text),shatterdeep_private.donate(integer),shatterdeep_private.leave_clan() from public,anon;
grant execute on function shatterdeep_private.create_clan(text),shatterdeep_private.join_clan(text),shatterdeep_private.donate(integer),shatterdeep_private.leave_clan() to authenticated;
create function public.sd_create_clan(clan_name text) returns uuid language sql security invoker set search_path='' as $$select shatterdeep_private.create_clan(clan_name);$$;
create function public.sd_join_clan(code text) returns uuid language sql security invoker set search_path='' as $$select shatterdeep_private.join_clan(code);$$;
create function public.sd_donate(amount integer) returns bigint language sql security invoker set search_path='' as $$select shatterdeep_private.donate(amount);$$;
create function public.sd_leave_clan() returns void language sql security invoker set search_path='' as $$select shatterdeep_private.leave_clan();$$;
revoke all on function public.sd_create_clan(text),public.sd_join_clan(text),public.sd_donate(integer),public.sd_leave_clan() from public,anon;
grant execute on function public.sd_create_clan(text),public.sd_join_clan(text),public.sd_donate(integer),public.sd_leave_clan() to authenticated;
create policy sd_clan_realtime_read on realtime.messages for select to authenticated using(extension in ('broadcast','presence') and (select realtime.topic())='sd-clan-'||(select shatterdeep_private.my_clan())::text);
create policy sd_clan_realtime_write on realtime.messages for insert to authenticated with check(extension in ('broadcast','presence') and (select realtime.topic())='sd-clan-'||(select shatterdeep_private.my_clan())::text);
