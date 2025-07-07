// Quick debug script to check genre data
import { createSPASassClient } from './src/lib/supabase/unified.js';

async function checkGenres() {
    try {
        const supabase = await createSPASassClient();
        const client = supabase.getSupabaseClient();
        
        const { data: genres, error } = await client
            .from('genres')
            .select('*')
            .order('name');
            
        if (error) {
            console.error('Error fetching genres:', error);
            return;
        }
        
        console.log('Available genres:');
        genres.forEach(genre => {
            console.log(`- ${genre.name} (HU: ${genre.name_HUN || 'Not set'})`);
        });
        
        // Check specifically for "classical"
        const classical = genres.find(g => g.name.toLowerCase() === 'classical');
        if (classical) {
            console.log('\nClassical genre found:');
            console.log(classical);
        } else {
            console.log('\nNo "classical" genre found');
        }
        
    } catch (error) {
        console.error('Script error:', error);
    }
}

checkGenres();
