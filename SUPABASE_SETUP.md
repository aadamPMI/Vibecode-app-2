# Supabase Setup Guide

Your Supabase integration is now configured! 🎉

## ✅ What's Been Set Up

1. **Supabase Client** (`src/lib/supabase.ts`)
   - Configured with your project URL and anon key
   - Set up with AsyncStorage for session persistence
   - Ready for real-time subscriptions

2. **Authentication Helpers** (`src/lib/supabase-auth.ts`)
   - Sign up, sign in, password reset functions
   - Auth state change listeners

3. **Database Helpers** (`src/lib/supabase-database.ts`)
   - CRUD operations for programs, sessions, set logs, PRs
   - Real-time subscription helpers

4. **Test Functions** (`src/lib/supabase-test.ts`)
   - Connection testing
   - Example usage code

## 📋 Next Steps

### 1. Create Database Tables

Run the SQL schema from `docs/supabase-schema.md` in your **Supabase SQL Editor**:

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Copy the entire SQL from `docs/supabase-schema.md`
4. Run it to create all tables and Row Level Security policies

### 2. Test the Connection

In your app, import and run the test function:

\`\`\`typescript
import { testSupabaseConnection } from './src/lib/supabase-test';

// Run this in your app to verify connection
await testSupabaseConnection();
\`\`\`

### 3. Set Up Authentication

Here's a quick example of setting up auth in a screen:

\`\`\`typescript
import { signUpWithEmail, signInWithEmail } from './src/lib';

// Sign up new user
const handleSignUp = async (email: string, password: string) => {
  try {
    const { user } = await signUpWithEmail(email, password);
    console.log('User created:', user);
  } catch (error) {
    console.error('Sign up error:', error);
  }
};

// Sign in existing user
const handleSignIn = async (email: string, password: string) => {
  try {
    const { user } = await signInWithEmail(email, password);
    console.log('Signed in:', user);
  } catch (error) {
    console.error('Sign in error:', error);
  }
};
\`\`\`

### 4. Use Database Functions

Example: Fetching and creating programs

\`\`\`typescript
import { 
  getPrograms, 
  createProgram, 
  getCurrentUser 
} from './src/lib';

// Get current user
const user = await getCurrentUser();

// Fetch user's programs
const programs = await getPrograms(user.id);
console.log('Programs:', programs);

// Create a new program
const newProgram = await createProgram({
  user_id: user.id,
  name: 'Push Pull Legs',
  description: 'Classic 6-day split',
  days_per_week: 6,
});
console.log('Created:', newProgram);
\`\`\`

### 5. Set Up Real-Time Subscriptions

Listen to database changes in real-time:

\`\`\`typescript
import { subscribeToProgramChanges } from './src/lib';

const userId = 'user-id-here';

const subscription = subscribeToProgramChanges(userId, (payload) => {
  console.log('Program changed:', payload);
  // Update your UI here
});

// Unsubscribe when component unmounts
subscription.unsubscribe();
\`\`\`

## 🔐 Security Notes

1. **Row Level Security (RLS)** is configured in the schema
   - Users can only access their own data
   - Public programs are visible to all users
   
2. **Anon Key** is safe to use in your app
   - It's designed for client-side use
   - RLS policies protect your data
   
3. **Never commit `.env`** to git
   - Already added to `.gitignore`
   - Share credentials securely with your team

## 📚 Available Functions

### Authentication
- `signUpWithEmail(email, password)`
- `signInWithEmail(email, password)`
- `resetPassword(email)`
- `updatePassword(newPassword)`
- `signOut()`
- `getCurrentUser()`
- `isAuthenticated()`
- `onAuthStateChange(callback)`

### Programs
- `getPrograms(userId)`
- `getActiveProgram(userId)`
- `createProgram(program)`
- `updateProgram(programId, updates)`
- `deleteProgram(programId)`

### Sessions
- `getSessions(userId, limit?)`
- `getSessionById(sessionId)`
- `createSession(session)`
- `updateSession(sessionId, updates)`
- `completeSession(sessionId, completedAt, duration, totalSets, totalVolume)`

### Set Logs
- `addSetLog(setLog)`
- `getSetLogsForSession(sessionId)`

### Personal Records
- `getPRsForExercise(userId, exerciseId)`
- `getAllPRs(userId)`
- `createPREvent(prEvent)`

### E1RM Tracking
- `getE1RMHistory(userId, exerciseId)`
- `addE1RMRecord(record)`

### Real-Time
- `subscribeToProgramChanges(userId, callback)`
- `subscribeToSessionChanges(userId, callback)`

## 🔧 Troubleshooting

**Issue**: "Missing Supabase environment variables"
- **Solution**: Make sure `.env` file exists with your credentials

**Issue**: "relation 'programs' does not exist"
- **Solution**: Run the SQL schema from `docs/supabase-schema.md`

**Issue**: "Row level security policy violation"
- **Solution**: Make sure you're authenticated and RLS policies are set up

**Issue**: Connection fails
- **Solution**: Run `testSupabaseConnection()` to diagnose

## 📖 Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- Your schema: `docs/supabase-schema.md`

## 🚀 Going to Production

Before launching:

1. ✅ Enable RLS on all tables
2. ✅ Test all RLS policies
3. ✅ Set up database backups
4. ✅ Enable email confirmations for sign-ups
5. ✅ Configure custom SMTP (optional)
6. ✅ Set up monitoring and alerts
7. ✅ Review and limit API rate limits

---

Need help? Check the test file at `src/lib/supabase-test.ts` for examples!

