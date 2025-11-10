# Real-time Setup & Troubleshooting

## Step 1: Re-run the Database Schema

Since we updated the schema, you need to re-run it:

1. Go to Supabase SQL Editor
2. **Drop the old table first:**
   ```sql
   DROP TABLE IF EXISTS messages CASCADE;
   ```

3. **Run the updated schema** - Copy and paste the entire `supabase-schema.sql` file

## Step 2: Verify Realtime is Enabled

In your Supabase dashboard:

1. Go to **Database** → **Replication** (in the left sidebar)
2. Look for the `messages` table in the list
3. Make sure it has a **checkmark** next to it
4. If not, click to enable it

## Step 3: Check Browser Console

Open your browser console (F12 → Console tab) and look for these messages:

✅ **Good signs:**
```
Setting up real-time subscription...
Subscription status: SUBSCRIBED
```

When a message is sent, you should see:
```
New message received! {new: {...}}
```

❌ **Bad signs:**
- No subscription messages
- Subscription status: CLOSED or CHANNEL_ERROR
- Network errors

## Step 4: Test Real-time

1. Open the chat app in two different browser windows (or one incognito)
2. Log in with different usernames in each window
3. Send a message from window 1
4. **The message should appear instantly in window 2** without refreshing

## Common Issues & Fixes

### Issue: Subscription status shows "CLOSED"

**Fix:** Make sure the messages table is enabled in Replication settings (see Step 2)

### Issue: No console logs appearing

**Fix:** Hard refresh the page (Ctrl+Shift+R) to reload the JavaScript

### Issue: "permission denied for table messages"

**Fix:** Check that the RLS policies are set correctly. Re-run the schema.

### Issue: Messages appear after 10-30 seconds

**Fix:** This is normal for the free tier sometimes. But if it's consistent, check your internet connection and Supabase region.

## Manual Test in Supabase

You can test if realtime is working directly in Supabase:

1. Go to **Table Editor** → **messages**
2. Click "Insert row" and manually add a message
3. The message should appear in your chat app immediately

If this works but sending from the app doesn't, the issue is with the insert operation, not realtime.

## Still Not Working?

Check the browser console for errors and let me know what you see!

