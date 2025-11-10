# Automatic Message Cleanup Setup

This feature automatically deletes messages older than 30 minutes to keep your chat clean and show only recent messages.

## How It Works

1. **Automatic Cleanup on Page Load**: Every time a user opens the chat, old messages (older than 30 minutes) are automatically deleted from the database.

2. **No Performance Impact**: The cleanup runs asynchronously in the background and doesn't slow down the chat.

3. **Real-time Updates**: If someone has the chat open when messages are deleted, they won't see them disappear (they'll still have them locally), but on the next page refresh, only recent messages will load.

## Setup Instructions

### Step 1: Run the SQL Function

1. Go to your **Supabase SQL Editor**: https://supabase.com/dashboard/project/_/sql
2. Copy and paste the contents of `cleanup-old-messages.sql`
3. Click **Run** to create the function

```sql
CREATE OR REPLACE FUNCTION cleanup_old_messages()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM messages
  WHERE created_at < NOW() - INTERVAL '30 minutes';
END;
$$;
```

### Step 2: Test It

1. Open your chat app
2. Check the browser console (F12 → Console)
3. You should see: `Old messages cleaned up successfully`

### Step 3: Verify Messages Are Cleaned

1. In Supabase dashboard, go to **Table Editor** → **messages**
2. Send some test messages
3. Wait 30 minutes or manually change the `created_at` timestamps to be older
4. Refresh your app
5. Old messages should be deleted

## Changing the Time Limit

To change from 30 minutes to a different time period:

**In the SQL function** (`cleanup-old-messages.sql`):
```sql
-- For 1 hour:
WHERE created_at < NOW() - INTERVAL '1 hour';

-- For 24 hours:
WHERE created_at < NOW() - INTERVAL '24 hours';

-- For 15 minutes:
WHERE created_at < NOW() - INTERVAL '15 minutes';
```

Re-run the SQL in Supabase after making changes.

## Optional: Scheduled Cleanup (Pro Plan Only)

If you have a **Supabase Pro plan**, you can set up automatic cleanup every 5 minutes using pg_cron:

```sql
-- Enable pg_cron extension (one time)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule cleanup every 5 minutes
SELECT cron.schedule(
  'cleanup-old-messages',
  '*/5 * * * *', -- Every 5 minutes
  'SELECT cleanup_old_messages();'
);
```

### To view scheduled jobs:
```sql
SELECT * FROM cron.job;
```

### To remove the scheduled job:
```sql
SELECT cron.unschedule('cleanup-old-messages');
```

## Troubleshooting

### Issue: Console shows error "function cleanup_old_messages does not exist"

**Fix**: Run the SQL function in Step 1 again. Make sure you clicked "Run" in the SQL Editor.

### Issue: Messages aren't being deleted

**Fix**: 
1. Check the console for error messages
2. Verify the function exists by running in SQL Editor:
   ```sql
   SELECT * FROM information_schema.routines 
   WHERE routine_name = 'cleanup_old_messages';
   ```
3. Test the function manually:
   ```sql
   SELECT cleanup_old_messages();
   ```

### Issue: Want to see how many messages were deleted

**Update the function** to return the count:
```sql
CREATE OR REPLACE FUNCTION cleanup_old_messages()
RETURNS TABLE(deleted_count INTEGER)
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM messages
  WHERE created_at < NOW() - INTERVAL '30 minutes';
  
  RETURN QUERY SELECT COUNT(*)::INTEGER FROM messages;
END;
$$;
```

## Benefits

✅ **Keeps database small**: Prevents unlimited growth of messages table  
✅ **Faster queries**: Fewer rows mean faster loading  
✅ **Privacy-friendly**: Old conversations don't stick around forever  
✅ **Cost-effective**: Stays within free tier limits more easily  
✅ **Relevant content**: Users only see recent, relevant messages  

## Implementation Details

- Function is called in `components/ChatRoom.tsx` on component mount
- Uses Supabase RPC (Remote Procedure Call) to execute the SQL function
- Runs in the background, doesn't block the UI
- Safe to call multiple times (idempotent)

