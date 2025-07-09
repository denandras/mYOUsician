// seed-database.js
// This script adds sample musician profiles to the database

const { createClient } = require('@supabase/supabase-js');

// Get variables from Next.js environment or .env
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dknrbpdqeyfzbkmrkoiq.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRrbnJicGRxZXlmemJrbXJrb2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTQ3Mjg2MzAsImV4cCI6MjAzMDMwNDYzMH0.b0xCw-4d6PEYuuKGAgH4rW9ELh6ilR6ldcn_YZAIl20';

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Sample musician profiles
const sampleProfiles = [
  {
    id: 'sample-1',
    email: 'johndoe@example.com',
    forename: 'John',
    surname: 'Doe',
    location: { city: 'New York', country: 'USA' },
    phone: '+1234567890',
    bio: 'Professional violinist with 10 years of experience in classical music.',
    occupation: ['Violinist', 'Music Teacher'],
    education: [
      { type: 'Master', school: 'Juilliard School' },
      { type: 'Bachelor', school: 'New England Conservatory' }
    ],
    certificates: ['ABRSM Grade 8', 'Trinity College Diploma'],
    genre_instrument: [
      { genre: 'classical', instrument: 'violin', category: 'artist' },
      { genre: 'chamber', instrument: 'violin', category: 'artist' }
    ],
    video_links: ['https://www.youtube.com/watch?v=example1', 'https://www.youtube.com/watch?v=example2'],
    social: {
      youtube: 'https://www.youtube.com/user/johndoe',
      instagram: 'https://www.instagram.com/johndoe'
    }
  },
  {
    id: 'sample-2',
    email: 'janesmith@example.com',
    forename: 'Jane',
    surname: 'Smith',
    location: { city: 'London', country: 'UK' },
    phone: '+4412345678',
    bio: 'Jazz pianist and composer with a passion for teaching.',
    occupation: ['Pianist', 'Composer', 'Music Teacher'],
    education: [
      { type: 'Bachelor', school: 'Royal Academy of Music' }
    ],
    certificates: ['ABRSM Jazz Piano Grade 8'],
    genre_instrument: [
      { genre: 'jazz', instrument: 'piano', category: 'artist' },
      { genre: 'jazz', instrument: 'piano', category: 'teacher' }
    ],
    video_links: ['https://www.youtube.com/watch?v=example3'],
    social: {
      facebook: 'https://www.facebook.com/janesmith',
      instagram: 'https://www.instagram.com/janesmith'
    }
  },
  {
    id: 'sample-3',
    email: 'mikebrown@example.com',
    forename: 'Mike',
    surname: 'Brown',
    location: { city: 'Budapest', country: 'Hungary' },
    phone: '+361234567',
    bio: 'Classical guitarist and teacher with expertise in Spanish guitar music.',
    occupation: ['Guitarist', 'Music Teacher'],
    education: [
      { type: 'Master', school: 'Liszt Ferenc Academy of Music' },
      { type: 'Bachelor', school: 'Berklee College of Music' }
    ],
    certificates: ['Guitar Teaching Certification'],
    genre_instrument: [
      { genre: 'classical', instrument: 'guitar', category: 'teacher' },
      { genre: 'flamenco', instrument: 'guitar', category: 'artist' }
    ],
    video_links: ['https://www.youtube.com/watch?v=example4', 'https://www.youtube.com/watch?v=example5'],
    social: {
      youtube: 'https://www.youtube.com/user/mikebrown'
    }
  }
];

async function seedDatabase() {
  console.log('Seeding database with sample musician profiles...');

  // First check if table exists and if it already has these profiles
  try {
    const { data: existingProfiles, error: checkError } = await supabase
      .from('musician_profiles')
      .select('id')
      .in('id', sampleProfiles.map(profile => profile.id));

    if (checkError) {
      console.error('Error checking for existing profiles:', checkError);
      return;
    }

    if (existingProfiles && existingProfiles.length > 0) {
      console.log(`Found ${existingProfiles.length} existing sample profiles. Updating them...`);
      
      // Update each existing profile
      for (const profile of sampleProfiles) {
        if (existingProfiles.some(p => p.id === profile.id)) {
          const { error: updateError } = await supabase
            .from('musician_profiles')
            .update(profile)
            .eq('id', profile.id);
          
          if (updateError) {
            console.error(`Error updating profile ${profile.id}:`, updateError);
          } else {
            console.log(`Updated profile: ${profile.forename} ${profile.surname}`);
          }
        } else {
          // Insert new profile
          const { error: insertError } = await supabase
            .from('musician_profiles')
            .insert(profile);
          
          if (insertError) {
            console.error(`Error inserting profile ${profile.id}:`, insertError);
          } else {
            console.log(`Inserted new profile: ${profile.forename} ${profile.surname}`);
          }
        }
      }
    } else {
      console.log('No existing sample profiles found. Inserting all samples...');
      
      // Insert all sample profiles
      const { error: insertError } = await supabase
        .from('musician_profiles')
        .insert(sampleProfiles);
      
      if (insertError) {
        console.error('Error inserting sample profiles:', insertError);
      } else {
        console.log(`Successfully inserted ${sampleProfiles.length} sample profiles.`);
      }
    }

    // Check the final count
    const { data: finalCount, error: countError } = await supabase
      .from('musician_profiles')
      .select('id', { count: 'exact' });

    if (countError) {
      console.error('Error counting final profiles:', countError);
    } else {
      console.log(`Database now contains ${finalCount.length} total musician profiles.`);
    }
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

seedDatabase();
