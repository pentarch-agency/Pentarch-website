import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

/**
 * Get the current authenticated user. Returns null if not authenticated.
 * Uses getUser() (server-verified) — never getSession() for authorization.
 */
export async function getCurrentUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
}

/**
 * Require authentication. Redirects to login if not authenticated.
 */
export async function requireAuth(loginUrl = '/login') {
  const user = await getCurrentUser();
  if (!user) {
    redirect(loginUrl);
  }
  return user;
}

/**
 * Check if the user is a founder/super admin.
 * This is verified server-side against the database — never from client state.
 */
export async function isFounder(userId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', userId)
    .single();

  return data?.role === 'founder';
}

/**
 * Require founder access. Redirects unauthorized users.
 */
export async function requireFounder() {
  const user = await requireAuth('/admin/login');
  const founder = await isFounder(user.id);
  if (!founder) {
    redirect('/');
  }
  return user;
}

/**
 * Check if a user is a member of an organization and return their role.
 */
export async function getOrgMembership(userId: string, organizationId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from('organization_memberships')
    .select('role, status')
    .eq('user_id', userId)
    .eq('organization_id', organizationId)
    .single();

  if (!data || data.status !== 'active') return null;
  return data;
}

/**
 * Require membership in an organization. Redirects if not a member.
 */
export async function requireOrgMembership(organizationId: string) {
  const user = await requireAuth('/login');
  const membership = await getOrgMembership(user.id, organizationId);
  if (!membership) {
    redirect('/');
  }
  return { user, membership };
}
