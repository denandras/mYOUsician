import supabase from '../lib/supabase';

// Update a single user field in the database
export async function updateUserField(uid, field, value) {
  const { error } = await supabase
    .from('users')
    .update({ [field]: value, updated_at: new Date().toISOString() })
    .eq('uid', uid);
  return error;
}

// Update multiple fields at once
export async function updateUserFields(uid, fields) {
  const { error } = await supabase
    .from('users')
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq('uid', uid);
  return error;
}

// Validate a social link against a prefix
export function validateSocialLink(link, prefix) {
  return link.startsWith(prefix);
}

// Validate a video link (basic)
export function validateVideoLink(link) {
  return /^https?:\/\/.+/.test(link);
}

// Format a genre-instrument pair
export function formatGenreInstrument(genre, instrument) {
  return `${genre} ${instrument}`;
}

// Capitalize first letter
export function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}