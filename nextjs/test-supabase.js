// test-supabase.js
// Script to check if there are profiles in the musician_profiles table

const { createClient } = require('@supabase/supabase-js');

// Get variables from Next.js environment or .env
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dknrbpdqeyfzbkmrkoiq.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRrbnJicGRxZXlmemJrbXJrb2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTQ3Mjg2MzAsImV4cCI6MjAzMDMwNDYzMH0.b0xCw-4d6PEYuuKGAgH4rW9ELh6ilR6ldcn_YZAIl20';

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials. Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in .env');
  process.exit(1);
}

console.log('Using Supabase URL:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSupabaseConnection() {
  console.log('Testing Supabase connection...');

  try {
    // Check connection by getting table count
    const { data: tableCount, error: countError } = await supabase
      .from('musician_profiles')
      .select('id', { count: 'exact', head: true });

    if (countError) {
      console.error('Error counting records:', countError);
      return;
    }

    console.log(`Found ${tableCount?.length || 0} musician profiles`);

    // Get a few sample records
    const { data: profiles, error: profilesError } = await supabase
      .from('musician_profiles')
      .select('*')
      .limit(5);

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      return;
    }

    if (profiles.length === 0) {
      console.log('No profiles found in the musician_profiles table.');
    } else {
      console.log(`Sample profiles (${profiles.length}):`);
      profiles.forEach((profile, index) => {
        console.log(`\nProfile #${index + 1}:`);
        console.log(`- ID: ${profile.id}`);
        console.log(`- Name: ${profile.forename || ''} ${profile.surname || ''}`);
        console.log(`- Email: ${profile.email || 'Not provided'}`);
        
        // Check genre_instrument structure
        console.log('- Genre/Instrument data:');
        if (profile.genre_instrument && Array.isArray(profile.genre_instrument)) {
          console.log(`  (${profile.genre_instrument.length} items)`);
          profile.genre_instrument.slice(0, 2).forEach((item, i) => {
            console.log(`  Item ${i + 1}:`, typeof item === 'object' ? JSON.stringify(item) : item);
          });
          if (profile.genre_instrument.length > 2) {
            console.log(`  ... and ${profile.genre_instrument.length - 2} more`);
          }
        } else {
          console.log('  No genre/instrument data or not in expected format');
        }
      });
    }
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

testSupabaseConnection();
