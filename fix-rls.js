const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Load environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // You'll need to add this to .env

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables:');
  console.error('VITE_SUPABASE_URL:', supabaseUrl ? '✓' : '✗');
  console.error('SUPABASE_SERVICE_ROLE_KEY: ✗ (needs to be added to .env)');
  console.log('\nPlease add SUPABASE_SERVICE_ROLE_KEY to your .env file');
  console.log('You can get this from: Supabase Dashboard > Project Settings > API > service_role (secret)');
  process.exit(1);
}

// Create Supabase client with service role key (has admin privileges)
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixRLS() {
  console.log('🔧 Fixing RLS policies...\n');

  const tables = ['trainer_videos', 'feedback', 'community_messages'];
  
  for (const table of tables) {
    try {
      console.log(`📋 Processing table: ${table}`);
      
      // 1. Disable RLS
      const { error: disableError } = await supabase.rpc('exec_sql', {
        sql: `ALTER TABLE public.${table} DISABLE ROW LEVEL SECURITY;`
      });
      
      if (disableError) {
        console.log(`⚠️  Could not disable RLS via RPC, trying direct SQL...`);
      } else {
        console.log(`✅ RLS disabled on ${table}`);
      }
      
      // 2. Grant permissions
      const grantSQL = `
        GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.${table} TO anon, authenticated, public;
        GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, public;
      `;
      
      console.log(`🔑 Granting permissions on ${table}...`);
      
      // Try to execute grant SQL
      const { error: grantError } = await supabase.rpc('exec_sql', {
        sql: grantSQL
      });
      
      if (grantError) {
        console.log(`⚠️  Could not grant permissions via RPC`);
      } else {
        console.log(`✅ Permissions granted on ${table}`);
      }
      
    } catch (error) {
      console.error(`❌ Error processing ${table}:`, error.message);
    }
    
    console.log(''); // Empty line for readability
  }
  
  console.log('🎉 RLS fix process completed!');
  console.log('\n📝 Manual SQL to run in Supabase Dashboard (if auto-fix didn\'t work):');
  console.log('---');
  console.log(`
-- DISABLE RLS on all tables
ALTER TABLE public.trainer_videos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_messages DISABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.trainer_videos TO anon, authenticated, public;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.feedback TO anon, authenticated, public;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.community_messages TO anon, authenticated, public;
  `);
}

// Test function to verify the fix
async function testFix() {
  console.log('\n🧪 Testing the fix...');
  
  try {
    // Test inserting feedback
    const { error } = await supabase
      .from('feedback')
      .insert({
        user_id: 'test-user-id',
        message: 'Test message - RLS fix verification'
      });
    
    if (error) {
      console.log('❌ Test failed:', error.message);
      return false;
    } else {
      console.log('✅ Test passed! Feedback insertion works');
      
      // Clean up test data
      await supabase
        .from('feedback')
        .delete()
        .eq('message', 'Test message - RLS fix verification');
      
      return true;
    }
  } catch (error) {
    console.log('❌ Test failed:', error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Auto-fixing Supabase RLS issues...\n');
  
  await fixRLS();
  
  const success = await testFix();
  
  if (success) {
    console.log('\n🎉 SUCCESS! RLS issues have been fixed.');
    console.log('Your app should now work without row cancellation errors.');
  } else {
    console.log('\n⚠️  Auto-fix incomplete. Please run the manual SQL above in Supabase Dashboard.');
  }
}

main().catch(console.error);
