import { NextResponse } from 'next/server';
import { createSPASassClient } from '@/lib/supabase/client';

export const dynamic = 'force-dynamic'; // Make sure the route is not cached

export async function GET() {
  try {
    console.log('Loading reference data via API...');
    
    // Try to connect to database
    const supabase = await createSPASassClient();
    const client = supabase.getSupabaseClient();
    
    const [genresRes, instrumentsRes] = await Promise.all([
      client.from('genres').select('*').order('name'),
      client.from('instruments').select('*').order('name')
    ]);
    
    console.log('API: Genres response:', genresRes);
    console.log('API: Instruments response:', instrumentsRes);
    
    // Check if we got valid data
    if (genresRes.data?.length && instrumentsRes.data?.length) {
      console.log('API: Returning database data');
      return NextResponse.json({
        genres: genresRes.data,
        instruments: instrumentsRes.data,
        source: 'database'
      });
    } else {
      console.log('API: No database data, returning fallback');
      // Return fallback data
      const fallbackGenres = [
        { id: '1', name: 'Classical', name_HUN: 'Klasszikus', created_at: '2023-01-01', updated_at: '2023-01-01' },
        { id: '2', name: 'Jazz', name_HUN: 'Jazz', created_at: '2023-01-01', updated_at: '2023-01-01' },
        { id: '3', name: 'Rock', name_HUN: 'Rock', created_at: '2023-01-01', updated_at: '2023-01-01' },
        { id: '4', name: 'Pop', name_HUN: 'Pop', created_at: '2023-01-01', updated_at: '2023-01-01' },
        { id: '5', name: 'Electronic', name_HUN: 'Elektronikus', created_at: '2023-01-01', updated_at: '2023-01-01' },
        { id: '6', name: 'Folk', name_HUN: 'Népzene', created_at: '2023-01-01', updated_at: '2023-01-01' }
      ];
      
      const fallbackInstruments = [
        { id: '1', name: 'Piano', name_hun: 'Zongora', category: 'Keyboard', category_hun: 'Billentyűs', category_rank: 1, instrument_rank: 1 },
        { id: '2', name: 'Guitar', name_hun: 'Gitár', category: 'String', category_hun: 'Húros', category_rank: 2, instrument_rank: 1 },
        { id: '3', name: 'Violin', name_hun: 'Hegedű', category: 'String', category_hun: 'Húros', category_rank: 2, instrument_rank: 2 },
        { id: '4', name: 'Cello', name_hun: 'Cselló', category: 'String', category_hun: 'Húros', category_rank: 2, instrument_rank: 3 },
        { id: '5', name: 'Flute', name_hun: 'Fuvola', category: 'Woodwind', category_hun: 'Fafúvós', category_rank: 3, instrument_rank: 1 },
        { id: '6', name: 'Voice', name_hun: 'Ének', category: 'Vocal', category_hun: 'Vokális', category_rank: 4, instrument_rank: 1 }
      ];
      
      return NextResponse.json({
        genres: fallbackGenres,
        instruments: fallbackInstruments,
        source: 'fallback'
      });
    }
    
  } catch (error) {
    console.error('API: Error loading reference data:', error);
    
    // Return fallback data in case of error
    const fallbackGenres = [
      { id: '1', name: 'Classical', name_HUN: 'Klasszikus', created_at: '2023-01-01', updated_at: '2023-01-01' },
      { id: '2', name: 'Jazz', name_HUN: 'Jazz', created_at: '2023-01-01', updated_at: '2023-01-01' },
      { id: '3', name: 'Rock', name_HUN: 'Rock', created_at: '2023-01-01', updated_at: '2023-01-01' },
      { id: '4', name: 'Pop', name_HUN: 'Pop', created_at: '2023-01-01', updated_at: '2023-01-01' },
      { id: '5', name: 'Electronic', name_HUN: 'Elektronikus', created_at: '2023-01-01', updated_at: '2023-01-01' },
      { id: '6', name: 'Folk', name_HUN: 'Népzene', created_at: '2023-01-01', updated_at: '2023-01-01' }
    ];
    
    const fallbackInstruments = [
      { id: '1', name: 'Piano', name_hun: 'Zongora', category: 'Keyboard', category_hun: 'Billentyűs', category_rank: 1, instrument_rank: 1 },
      { id: '2', name: 'Guitar', name_hun: 'Gitár', category: 'String', category_hun: 'Húros', category_rank: 2, instrument_rank: 1 },
      { id: '3', name: 'Violin', name_hun: 'Hegedű', category: 'String', category_hun: 'Húros', category_rank: 2, instrument_rank: 2 },
      { id: '4', name: 'Cello', name_hun: 'Cselló', category: 'String', category_hun: 'Húros', category_rank: 2, instrument_rank: 3 },
      { id: '5', name: 'Flute', name_hun: 'Fuvola', category: 'Woodwind', category_hun: 'Fafúvós', category_rank: 3, instrument_rank: 1 },
      { id: '6', name: 'Voice', name_hun: 'Ének', category: 'Vocal', category_hun: 'Vokális', category_rank: 4, instrument_rank: 1 }
    ];
    
    return NextResponse.json({
      genres: fallbackGenres,
      instruments: fallbackInstruments,
      source: 'fallback_error'
    });
  }
}
