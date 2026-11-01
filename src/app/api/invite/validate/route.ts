import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json({ error: 'Missing token' }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { data: invitation, error } = await supabase
    .from('invitations')
    .select('id, email, role, status, expires_at, organization_id')
    .eq('token', token)
    .single();

  if (error || !invitation) {
    return NextResponse.json({ error: 'Invalid invitation', code: 'invalid' }, { status: 404 });
  }

  if (invitation.status !== 'pending') {
    return NextResponse.json({ error: 'Invitation already used', code: 'invalid' }, { status: 400 });
  }

  if (new Date(invitation.expires_at) < new Date()) {
    await supabase
      .from('invitations')
      .update({ status: 'expired' })
      .eq('id', invitation.id);
    return NextResponse.json({ error: 'Invitation expired', code: 'expired' }, { status: 400 });
  }

  const { data: org } = await supabase
    .from('organizations')
    .select('name')
    .eq('id', invitation.organization_id)
    .single();

  return NextResponse.json({
    email: invitation.email,
    role: invitation.role,
    orgName: org?.name || 'Organization',
  });
}
