# Quick Start Guide

Get your chat app running in 5 minutes!

## Step 1: Create Supabase Account

1. Go to [https://supabase.com](https://supabase.com) and sign up
2. Create a new project (wait ~2 minutes for provisioning)

## Step 2: Set Up Database

1. In Supabase dashboard, go to **SQL Editor**
2. Copy the content from `supabase-schema.sql` in this project
3. Paste and click **Run**

## Step 3: Get API Credentials

1. Go to **Settings** → **API** in Supabase dashboard
2. Copy your **Project URL** and **anon public key**

## Step 4: Configure Environment

Create `.env.local` file in the project root:

```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Step 5: Run the App

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Step 6: Optional - Disable Email Confirmation (Dev Only)

For easier testing in development:

1. Supabase dashboard → **Authentication** → **Settings**
2. Scroll to "Email Confirmations"
3. Toggle off "Enable email confirmations"

Now you can sign up and log in immediately without checking email!

## That's it! 🎉

Enter a username, start chatting, and open the app in multiple browser windows to see real-time messaging in action.

### Try the Quiz Bot! 🤖

Click the **"🤖 Quiz Me!"** button to get a random trivia question. Answer with A, B, C, or D and the bot will check your answer instantly!

---

**Additional Documentation:**
- [README.md](./README.md) - Complete documentation
- [QUIZ-BOT-GUIDE.md](./QUIZ-BOT-GUIDE.md) - Quiz bot features and customization
- [REALTIME-SETUP.md](./REALTIME-SETUP.md) - Real-time troubleshooting

