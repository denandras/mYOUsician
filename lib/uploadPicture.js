import supabase from '../lib/supabase';

export async function uploadProfileImage(file, userId) {
  // Always use the same filename for the user's profile image
  const extension = file.name.split('.').pop();
  const filename = `profile.${extension}`;
  const { data, error } = await supabase.storage
    .from('userprofiles')
    .upload(`${userId}/${filename}`, file, {
      cacheControl: '3600',
      upsert: true, // This will overwrite the previous file
    });

  if (error) {
    console.error("Supabase upload error:", error);
    throw error;
  }
  return data.path;
}

export function getProfileImageUrl(path) {
  return supabase.storage.from('userprofiles').getPublicUrl(path).data.publicUrl;
}