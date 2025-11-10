-- Function to delete messages older than 30 minutes
CREATE OR REPLACE FUNCTION cleanup_old_messages()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM messages
  WHERE created_at < NOW() - INTERVAL '30 minutes';
END;
$$;

-- Optional: Set up a cron job to run cleanup automatically every 5 minutes
-- Note: pg_cron extension must be enabled (available on Supabase Pro plan)
-- If you're on the free tier, you can call this function from your app instead

-- To enable pg_cron (Pro plan only):
-- SELECT cron.schedule(
--   'cleanup-old-messages',
--   '*/5 * * * *', -- Every 5 minutes
--   'SELECT cleanup_old_messages();'
-- );

