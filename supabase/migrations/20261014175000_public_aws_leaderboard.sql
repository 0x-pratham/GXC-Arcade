-- Expose only the fields needed for the public AWS Cloud Quest leaderboard.
-- SECURITY DEFINER allows the function to read scores despite table-level RLS,
-- without making the scores table itself publicly readable.
create or replace function public.get_public_aws_leaderboard()
returns table (
  user_id uuid,
  score bigint,
  played_at timestamptz,
  username text
)
language sql
stable
security definer
set search_path = ''
as $$
  with ranked_scores as (
    select
      s.user_id,
      s.score::bigint as score,
      s.played_at,
      row_number() over (
        partition by s.user_id
        order by s.score desc, s.played_at asc
      ) as row_num
    from public.scores as s
    where s.game_id = '796aac6a-6cd4-48c6-af90-518bab836a84'::uuid
  )
  select
    rs.user_id,
    rs.score,
    rs.played_at,
    coalesce(p.username, 'Anonymous Player')::text as username
  from ranked_scores as rs
  left join public.profiles as p on p.id = rs.user_id
  where rs.row_num = 1
  order by rs.score desc, rs.played_at asc
  limit 100;
$$;

revoke all on function public.get_public_aws_leaderboard() from public;
grant execute on function public.get_public_aws_leaderboard() to anon, authenticated;
