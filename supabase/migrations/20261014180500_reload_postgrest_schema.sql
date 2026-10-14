-- Refresh PostgREST's schema cache so the public AWS leaderboard RPC is discoverable.
notify pgrst, 'reload schema';
