import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create admin client for user deletion
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.PRIVATE_SUPABASE_SERVICE_KEY!, // This requires service role key
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function DELETE(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);

    // Verify the user's session with the token
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid authentication' }, { status: 401 });
    }

    // Get the email confirmation from request body
    const { confirmEmail } = await request.json();
    
    if (confirmEmail !== user.email) {
      return NextResponse.json({ error: 'Email confirmation does not match' }, { status: 400 });
    }

    // Delete the musician profile first
    const { error: profileError } = await supabaseAdmin
      .from('musician_profiles')
      .delete()
      .eq('id', user.id);

    if (profileError) {
      console.error('Error deleting musician profile:', profileError);
      return NextResponse.json({ error: 'Failed to delete profile data' }, { status: 500 });
    }

    // Delete the user account using admin client
    const { error: userError } = await supabaseAdmin.auth.admin.deleteUser(user.id);

    if (userError) {
      console.error('Error deleting user account:', userError);
      return NextResponse.json({ error: 'Failed to delete user account' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Account deleted successfully' });

  } catch (error) {
    console.error('Unexpected error in account deletion:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
