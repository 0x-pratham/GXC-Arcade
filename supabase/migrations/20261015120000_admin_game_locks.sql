-- Admin-controlled per-game access locks.
create table if not exists public.game_access_locks (
  game_id uuid primary key references public.games(id) on delete cascade,
  is_locked boolean not null default false,
  locked_at timestamptz,
  locked_by uuid references public.profiles(id) on delete set null,
  updated_at timestamptz not null default now()
);

alter table public.game_access_locks enable row level security;

drop policy if exists "Game locks are readable by everyone" on public.game_access_locks;
create policy "Game locks are readable by everyone"
  on public.game_access_locks for select
  to anon, authenticated
  using (true);

drop policy if exists "Admins can insert game locks" on public.game_access_locks;
create policy "Admins can insert game locks"
  on public.game_access_locks for insert
  to authenticated
  with check (exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  ));

drop policy if exists "Admins can update game locks" on public.game_access_locks;
create policy "Admins can update game locks"
  on public.game_access_locks for update
  to authenticated
  using (exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  ))
  with check (exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  ));

-- Seed a row for each existing game so a lock state is always represented.
insert into public.game_access_locks (game_id, is_locked)
select g.id, false from public.games g
on conflict (game_id) do nothing;

-- All new game attempts must use this game-aware RPC. It checks the lock in
-- the database before invoking the existing credit deduction function.
create or replace function public.deduct_game_credit_for_game(p_game_id uuid)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  game_is_locked boolean;
  remaining_credits integer;
begin
  if auth.uid() is null then
    raise exception 'Please log in before playing.';
  end if;

  select coalesce(l.is_locked, false)
    into game_is_locked
    from public.game_access_locks l
    where l.game_id = p_game_id;

  if coalesce(game_is_locked, false) then
    raise exception 'This game is temporarily locked by an admin.';
  end if;

  perform 1 from public.games g where g.id = p_game_id;
  if not found then
    raise exception 'Game not found.';
  end if;

  select public.deduct_game_credit() into remaining_credits;
  return remaining_credits;
end;
$$;

revoke all on function public.deduct_game_credit_for_game(uuid) from public;
grant execute on function public.deduct_game_credit_for_game(uuid) to authenticated;

notify pgrst, 'reload schema';
