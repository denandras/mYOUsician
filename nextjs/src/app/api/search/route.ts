import { NextRequest, NextResponse } from 'next/server';
import { RateLimiter } from '@/lib/rate-limit';
import { createSPASassClient } from '@/lib/supabase/client';
import { sanitizeInput } from '@/lib/sanitize';
import { sampleProfiles } from '@/lib/sample-data';

interface GenreInstrumentItem {
  genre?: string;
  instrument?: string;
  category?: string;
  [key: string]: unknown;
}

// Create a rate limiter instance (10 requests per minute per IP)
const searchRateLimiter = new RateLimiter({
  limit: 10,
  windowMs: 60 * 1000, // 1 minute
});

export const dynamic = 'force-dynamic'; // Make sure the route is not cached

export async function GET(request: NextRequest) {
  // Get client IP for rate limiting
  const ip = request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') || 
             'unknown';
  console.log('Search request from IP:', ip);
  
  // Check rate limit
  const rateLimitResult = searchRateLimiter.check(ip);
  if (rateLimitResult.limited) {
    const timeRemaining = searchRateLimiter.getTimeRemaining(ip);
    return NextResponse.json(
      { error: 'Too many requests', retryAfter: Math.ceil(timeRemaining / 1000) },
      { 
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil(timeRemaining / 1000)),
        },
      }
    );
  }

  // Get search parameters
  const searchParams = request.nextUrl.searchParams;
  const genre = sanitizeInput(searchParams.get('genre') || 'any');
  const instrument = sanitizeInput(searchParams.get('instrument') || 'any');
  const category = sanitizeInput(searchParams.get('category') || 'any');
  const nameSearch = sanitizeInput(searchParams.get('nameSearch') || '');
  const sortBy = sanitizeInput(searchParams.get('sortBy') || 'name_asc');

  console.log('Search params:', { genre, instrument, category, nameSearch, sortBy });

  try {
    // Check if we're using sample data for development
    const useSampleData = true; // Change this to false in production
    
    if (useSampleData) {
      console.log('Using sample data for development');
      
      // Apply filtering to sample data
      let filteredProfiles = [...sampleProfiles];
      
      // Filter by name search
      if (nameSearch) {
        const searchTerms = nameSearch.toLowerCase().split(' ');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        filteredProfiles = filteredProfiles.filter((profile: any) => {
          const fullName = `${profile.forename || ''} ${profile.surname || ''}`.toLowerCase();
          return searchTerms.every(term => fullName.includes(term));
        });
      }
      
      // Filter by genre, instrument, and category
      if (genre !== 'any' || instrument !== 'any' || category !== 'any') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        filteredProfiles = filteredProfiles.filter((profile: any) => {
          if (!profile.genre_instrument || !Array.isArray(profile.genre_instrument)) {
            return false;
          }
          
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return profile.genre_instrument.some((item: any) => {
            if (typeof item !== 'object' || item === null) {
              return false;
            }
            
            // Type assertion to safely access properties
            const itemObj = item as GenreInstrumentItem;
            
            // Match genre if specified
            if (genre !== 'any' && itemObj.genre?.toLowerCase() !== genre.toLowerCase()) {
              return false;
            }
            
            // Match instrument if specified
            if (instrument !== 'any' && itemObj.instrument?.toLowerCase() !== instrument.toLowerCase()) {
              return false;
            }
            
            // Match category if specified
            if (category !== 'any' && itemObj.category?.toLowerCase() !== category.toLowerCase()) {
              return false;
            }
            
            return true;
          });
        });
      }
      
      // Apply sorting
      if (sortBy) {
        switch (sortBy) {
          case 'name_asc':
            filteredProfiles.sort((a, b) => {
              const nameA = `${a.forename || ''} ${a.surname || ''}`.trim();
              const nameB = `${b.forename || ''} ${b.surname || ''}`.trim();
              return nameA.localeCompare(nameB);
            });
            break;
          case 'name_desc':
            filteredProfiles.sort((a, b) => {
              const nameA = `${a.forename || ''} ${a.surname || ''}`.trim();
              const nameB = `${b.forename || ''} ${b.surname || ''}`.trim();
              return nameB.localeCompare(nameA);
            });
            break;
          case 'education_desc':
            filteredProfiles.sort((a, b) => {
              const educationA = Array.isArray(a.education) ? a.education.length : 0;
              const educationB = Array.isArray(b.education) ? b.education.length : 0;
              return educationB - educationA;
            });
            break;
          case 'random':
            filteredProfiles.sort(() => Math.random() - 0.5);
            break;
        }
      }
      
      console.log(`Found ${filteredProfiles.length} musicians in sample data matching criteria`);
      return NextResponse.json({ profiles: filteredProfiles });
    }
    
    const supabase = await createSPASassClient();
    const client = supabase.getSupabaseClient();
    
    // Debug info
    console.log('API route: Search request processing');
    
    // Create a simple test query first to verify database connection
    try {
      const { data: testData, error: testError } = await client
        .from('genres')
        .select('*')
        .limit(1);
      
      if (testError) {
        console.error('Error in test query:', testError);
        return NextResponse.json({ error: 'Database connection error', details: testError }, { status: 500 });
      }
      
      console.log('Test query successful, found genres:', testData?.length || 0);
    } catch (testErr) {
      console.error('Unexpected error in test query:', testErr);
      return NextResponse.json({ error: 'Database connection error', details: String(testErr) }, { status: 500 });
    }
    
    // Query the database with basic filtering
    let query = client.from('musician_profiles').select('*');
    
    // Apply server-side filtering for name search
    if (nameSearch) {
      query = query.or(`forename.ilike.%${nameSearch}%,surname.ilike.%${nameSearch}%`);
    }
    
    // Get all profiles that match the basic criteria
    const { data: allProfiles, error: profilesError } = await query;
    
    if (profilesError) {
      console.error('Error querying musician_profiles:', profilesError);
      // Return empty array instead of error for better user experience
      console.log('Returning empty profiles array due to database error');
      return NextResponse.json({ profiles: [] });
    }
    
    console.log(`Found ${allProfiles?.length || 0} total musician profiles in database`);
    
    // If no profiles found, return early with empty array
    if (!allProfiles || allProfiles.length === 0) {
      console.log('No profiles found in database, returning empty array');
      return NextResponse.json({ profiles: [] });
    }
    
    // Apply more complex filtering on genre_instrument in JavaScript
    let filteredProfiles = allProfiles || [];
    
    // Filter by genre, instrument, and category if not 'any'
    if (genre !== 'any' || instrument !== 'any' || category !== 'any') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      filteredProfiles = filteredProfiles.filter((profile: any) => {
        // Parse genre_instrument data
        let genreInstrumentData = profile.genre_instrument;
        if (typeof genreInstrumentData === 'string') {
          try {
            genreInstrumentData = JSON.parse(genreInstrumentData);
          } catch {
            genreInstrumentData = [];
          }
        }
        
        if (!Array.isArray(genreInstrumentData)) return false;
        
        // Check if any genre_instrument item matches all selected filters
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return genreInstrumentData.some((item: any) => {
          // Convert to object if it's a string
          if (typeof item === 'string') {
            return genre === 'any'; // If we can't parse it, only match if no specific genre is requested
          }
          
          // Skip non-object items
          if (typeof item !== 'object' || item === null) {
            return false;
          }
          
          // Extract genre, instrument, and category values using type assertion
          const itemObj = item as GenreInstrumentItem;
          const itemGenre = String(itemObj.genre || '').toLowerCase();
          const itemInstrument = String(itemObj.instrument || '').toLowerCase();
          const itemCategory = String(itemObj.category || '').toLowerCase();
          
          // Match genre if specified
          if (genre !== 'any' && itemGenre !== genre.toLowerCase()) {
            return false;
          }
          
          // Match instrument if specified
          if (instrument !== 'any' && itemInstrument !== instrument.toLowerCase()) {
            return false;
          }
          
          // Match category if specified
          if (category !== 'any' && itemCategory !== category.toLowerCase()) {
            return false;
          }
          
          return true;
        });
      });
    }
    
    // Apply sorting
    if (sortBy) {
      switch (sortBy) {
        case 'name_asc':
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          filteredProfiles.sort((a: any, b: any) => {
            const nameA = `${a.forename || ''} ${a.surname || ''}`.trim();
            const nameB = `${b.forename || ''} ${b.surname || ''}`.trim();
            return nameA.localeCompare(nameB);
          });
          break;
        case 'name_desc':
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          filteredProfiles.sort((a: any, b: any) => {
            const nameA = `${a.forename || ''} ${a.surname || ''}`.trim();
            const nameB = `${b.forename || ''} ${b.surname || ''}`.trim();
            return nameB.localeCompare(nameA);
          });
          break;
        case 'education_desc':
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          filteredProfiles.sort((a: any, b: any) => {
            const educationA = Array.isArray(a.education) ? a.education.length : 0;
            const educationB = Array.isArray(b.education) ? b.education.length : 0;
            return educationB - educationA;
          });
          break;
        case 'random':
          filteredProfiles.sort(() => Math.random() - 0.5);
          break;
        default:
          // Default to name ascending
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          filteredProfiles.sort((a: any, b: any) => {
            const nameA = `${a.forename || ''} ${a.surname || ''}`.trim();
            const nameB = `${b.forename || ''} ${b.surname || ''}`.trim();
            return nameA.localeCompare(nameB);
          });
      }
    }
    
    console.log(`Found ${filteredProfiles.length} musicians matching criteria`);
    
    // Return the filtered and sorted data
    return NextResponse.json({ profiles: filteredProfiles });
  } catch (error) {
    console.error('Error in search API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
