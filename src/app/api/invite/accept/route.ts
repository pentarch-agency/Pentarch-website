import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  const body = await request.json();
  const { token, password } = body;

  if (!token || !password || password.length < 8) {
    return NextResponse.json({ error: 'Token and password (8+ chars) required.' }, { status: 400 });
  }

  const supabase = createAdminClient();

  // Fetch and validate the invitation
  const { data: invitation, error: invError } = await supabase
    .from('invitations')
    .select('id, email, role, status, expires_at, organization_id')
    .eq('token', token)
    .single();

  if (invError || !invitation) {
    return NextResponse.json({ error: 'Invalid invitation.' }, { status: 404 });
  }

  if (invitation.status !== 'pending') {
    return NextResponse.json({ error: 'Invitation already used.' }, { status: 400 });
  }

  if (new Date(invitation.expires_at) < new Date()) {
    await supabase.from('invitations').update({ status: 'expired' }).eq('id', invitation.id);
    return NextResponse.json({ error: 'Invitation expired.' }, { status: 400 });
  }

  // Check if user already exists in auth
  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  const existingUser = existingUsers?.users?.find(
    (u) => u.email?.toLowerCase() === invitation.email.toLowerCase()
  );

  let userId: string;

  if (existingUser) {
    // User exists — update password and confirm email
    userId = existingUser.id;
    const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
      password,
      email_confirm: true,
    });
    if (updateError) {
      return NextResponse.json({ error: `Failed to update account: ${updateError.message}` }, { status: 500 });
    }
  } else {
    // Create new auth user
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: invitation.email,
      password,
      email_confirm: true,
    });
    if (createError || !newUser.user) {
      return NextResponse.json({ error: `Failed to create account: ${createError?.message}` }, { status: 500 });
    }
    userId = newUser.user.id;

    // Create user profile
    await supabase.from('user_profiles').insert({
      id: userId,
      email: invitation.email,
      role: 'client',
    });
  }

  // Create organization membership
  const { error: memberError } = await supabase
    .from('organization_memberships')
    .upsert(
      {
        organization_id: invitation.organization_id,
        user_id: userId,
        role: invitation.role,
        status: 'active',
      },
      { onConflict: 'organization_id,user_id' }
    );

  if (memberError) {
    return NextResponse.json({ error: `Failed to create membership: ${memberError.message}` }, { status: 500 });
  }

  // Mark invitation as accepted
  await supabase
    .from('invitations')
    .update({ status: 'accepted', accepted_by: userId })
    .eq('id', invitation.id);

  return NextResponse.json({ success: true, userId });
}
