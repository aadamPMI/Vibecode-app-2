import { supabase } from './supabase';

/**
 * Test Supabase connection
 * Run this to verify your Supabase setup is working
 */
export const testSupabaseConnection = async () => {
  try {
    console.log('🔄 Testing Supabase connection...');
    
    // Test 1: Check if Supabase client is initialized
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }
    console.log('✅ Supabase client initialized');
    
    // Test 2: Try to get session (will be null if not logged in, but shouldn't error)
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      throw sessionError;
    }
    console.log('✅ Auth check successful');
    console.log('   Logged in:', !!session);
    
    // Test 3: Try a simple query (this will only work if you have created the tables)
    try {
      const { data, error } = await supabase
        .from('programs')
        .select('count');
      
      if (error) {
        console.log('⚠️  Programs table not found (expected if you haven\'t created tables yet)');
        console.log('   Error:', error.message);
      } else {
        console.log('✅ Database query successful');
        console.log('   Programs table exists');
      }
    } catch (err) {
      console.log('⚠️  Could not query database (tables may not exist yet)');
    }
    
    console.log('\n✅ Supabase connection test completed!');
    console.log('\n📝 Next steps:');
    console.log('   1. Run the SQL from docs/supabase-schema.md in Supabase SQL Editor');
    console.log('   2. Enable Row Level Security on all tables');
    console.log('   3. Set up authentication in your app');
    
    return true;
  } catch (error) {
    console.error('❌ Supabase connection test failed:', error);
    return false;
  }
};

/**
 * Example: How to use Supabase in your app
 */
export const exampleUsage = async () => {
  // Example 1: Sign up a new user
  const signUpExample = async () => {
    const { data, error } = await supabase.auth.signUp({
      email: 'user@example.com',
      password: 'secure-password',
    });
    
    if (error) console.error('Sign up error:', error);
    else console.log('User signed up:', data.user);
  };
  
  // Example 2: Sign in
  const signInExample = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'user@example.com',
      password: 'secure-password',
    });
    
    if (error) console.error('Sign in error:', error);
    else console.log('User signed in:', data.user);
  };
  
  // Example 3: Fetch user's programs
  const fetchProgramsExample = async (userId: string) => {
    const { data, error } = await supabase
      .from('programs')
      .select('*')
      .eq('user_id', userId);
    
    if (error) console.error('Fetch error:', error);
    else console.log('Programs:', data);
  };
  
  // Example 4: Create a new program
  const createProgramExample = async (userId: string) => {
    const { data, error } = await supabase
      .from('programs')
      .insert([
        {
          user_id: userId,
          name: 'Push Pull Legs',
          days_per_week: 6,
          is_active: true,
        },
      ])
      .select();
    
    if (error) console.error('Create error:', error);
    else console.log('Program created:', data);
  };
  
  // Example 5: Subscribe to real-time changes
  const subscribeExample = (userId: string) => {
    const subscription = supabase
      .channel('programs-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'programs',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log('Program changed:', payload);
        }
      )
      .subscribe();
    
    // To unsubscribe later:
    // subscription.unsubscribe();
  };
  
  console.log('Example functions defined. See code for usage.');
};

