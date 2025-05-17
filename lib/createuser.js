import supabase from './supabase';

export async function createuser({ uid, email }) {
    const payload = {
        uid,
        email,
        forename: '',
        surname: '',
        location: {}, // jsonb (object)
        phone: '',
        bio: '',
        occupation: [], // jsonb (array)
        certificates: [], // jsonb (array)
        education: [], // jsonb (array)
        video_links: [], // jsonb (array)
        genre_instrument: [], // jsonb (array)
        social: [], // jsonb (array)
    };

    const { error } = await supabase
        .from('users')
        .insert([payload]);

    if (error) {
        console.error('Test user insert error:', error);
        return { error: error.message || error };
    }
    return { message: 'Test user created.' };
}