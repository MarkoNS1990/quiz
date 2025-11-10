# 🤖 Quiz Bot Guide

The chat app now includes an interactive Quiz Bot that can ask trivia questions and check answers!

## Features

✅ **Random Quiz Questions** - Pulls questions from the database  
✅ **Multiple Categories** - Geography, Science, Art, Math, History, Literature  
✅ **Difficulty Levels** - Easy, Medium, Hard  
✅ **Auto Answer Checking** - Automatically validates when users answer A, B, C, or D  
✅ **Beautiful UI** - Bot messages appear in a gradient purple/pink bubble  

## How to Use

### 1. Update Your Database

Run the updated `supabase-schema.sql` in your Supabase SQL Editor:

1. Go to Supabase dashboard → **SQL Editor**
2. Copy the entire content from `supabase-schema.sql`
3. Run it

This will create:
- `quiz_questions` table with 10 sample questions
- Proper RLS policies
- All necessary indexes

### 2. Trigger a Quiz

In the chat room, click the **"🤖 Quiz Me!"** button in the header.

The bot will post a random quiz question like:

```
📚 Geography Question (easy)

What is the capital of France?

A) London
B) Berlin
C) Paris
D) Madrid

Reply with A, B, C, or D! 🎯
```

### 3. Answer the Quiz

Simply type **A**, **B**, **C**, or **D** in the chat.

The bot will automatically:
- ✅ Check if your answer is correct
- 🎉 Congratulate you if right
- ❌ Show the correct answer if wrong

## How It Works

### Quiz Question Storage

Questions are stored in the `quiz_questions` table with this structure:

```sql
CREATE TABLE quiz_questions (
  id BIGSERIAL PRIMARY KEY,
  question TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_answer TEXT NOT NULL CHECK (correct_answer IN ('A', 'B', 'C', 'D')),
  category TEXT,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Bot Logic

The bot system consists of three main functions:

1. **`getRandomQuizQuestion()`** - Fetches a random question from the database
2. **`postQuizQuestion()`** - Posts the formatted question to chat
3. **`handleAnswerCheck()`** - Validates user answers and responds

### Answer Tracking

The current quiz answer is stored in `sessionStorage` so:
- Each browser tab tracks its own quiz
- Answers are checked only against the current active quiz
- After someone answers, the quiz is cleared

### Automatic Answer Detection

When you type a message, the app checks if it's exactly **A**, **B**, **C**, or **D** (case-insensitive).

If it is, it automatically calls the answer checking function after 500ms.

## Adding More Questions

You can add questions directly in Supabase:

1. Go to **Table Editor** → `quiz_questions`
2. Click **Insert row**
3. Fill in the fields:
   - `question`: Your question text
   - `option_a`, `option_b`, `option_c`, `option_d`: The four options
   - `correct_answer`: One of: A, B, C, or D
   - `category`: e.g., "Geography", "Science"
   - `difficulty`: easy, medium, or hard

Or use SQL:

```sql
INSERT INTO quiz_questions (question, option_a, option_b, option_c, option_d, correct_answer, category, difficulty)
VALUES 
('Your question here?', 'Option A', 'Option B', 'Option C', 'Option D', 'B', 'Category', 'medium');
```

## Bot Message Styling

Bot messages have special styling:
- **Purple-to-pink gradient background**
- **Centered in the chat**
- **White text with shadow**
- **`whitespace-pre-line`** to preserve formatting

You can customize this in `ChatRoom.tsx`:

```tsx
const isBot = message.username.includes('QuizBot');
// Then apply special styling...
```

## API Reference

### `postQuizQuestion()`

Posts a random quiz question to the chat.

```typescript
await postQuizQuestion();
```

**Returns:** `Promise<boolean>` - true if successful

### `handleAnswerCheck(answer, username)`

Checks if the answer is correct and posts bot response.

```typescript
await handleAnswerCheck('A', 'John');
```

**Parameters:**
- `answer`: string - The user's answer (A, B, C, or D)
- `username`: string - The name of the user answering

### `postBotMessage(content)`

Posts any message as the QuizBot.

```typescript
await postBotMessage('Hello from the bot! 👋');
```

**Parameters:**
- `content`: string - The message content

## Customization Ideas

### 1. Timed Quizzes

Add a timer that automatically reveals the answer after 30 seconds:

```typescript
setTimeout(async () => {
  const answer = sessionStorage.getItem('currentQuizAnswer');
  if (answer) {
    await postBotMessage(`⏰ Time's up! The answer was ${answer}`);
  }
}, 30000);
```

### 2. Score Tracking

Add a `user_scores` table to track who answers correctly:

```sql
CREATE TABLE user_scores (
  username TEXT PRIMARY KEY,
  correct_answers INT DEFAULT 0,
  total_answers INT DEFAULT 0
);
```

### 3. Category-Specific Quizzes

Filter questions by category:

```typescript
const { data } = await supabase
  .from('quiz_questions')
  .select('*')
  .eq('category', 'Science');
```

### 4. Leaderboard

Show top scorers in the chat:

```typescript
await postBotMessage(`
🏆 Leaderboard
1. Alice - 15 points
2. Bob - 12 points
3. Charlie - 8 points
`);
```

### 5. Multiple Choice with Reactions

Instead of typing answers, let users click buttons (requires state management changes).

## Troubleshooting

### Bot not posting questions

- Check browser console for errors
- Verify `quiz_questions` table exists
- Make sure RLS policy allows SELECT

### Answers not being checked

- Check that `sessionStorage` is working (browser storage enabled)
- Look for the quiz answer in DevTools → Application → Session Storage
- Verify the answer checking timeout isn't being cancelled

### Questions always the same

- The random selection happens client-side from all questions
- If you only have a few questions, you'll see repeats
- Add more questions to the database

## Sample Questions Included

The schema includes 10 sample questions:
- Geography (4 questions)
- Science (3 questions)
- Art, Mathematics, History, Literature (1 each)

Feel free to delete these and add your own!

## Security Note

The bot posts messages directly without authentication. In production, you might want to:
- Use Supabase Functions (serverless) to post bot messages
- Add a special `is_bot` flag to messages table
- Restrict who can trigger the bot

For now, anyone can trigger quizzes by clicking the button - which is fun for a chat app! 🎉

