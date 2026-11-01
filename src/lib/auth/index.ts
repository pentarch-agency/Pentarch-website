import { cache } from 'react';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

/**
 * Get the current authenticated user (cached per request).
 * Uses getUser() (server-verified) — never getSession() for authorization.
 */
export const getCurrentUser = cache(async () => {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
});

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
 * Get user profile with role (cached per request).
 */
export const getUserProfile = cache(async (userId: string) => {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('user_profiles')
    .select('full_name, avatar_url, role')
    .eq('id', userId)
    .single();
  return data;
});

/**
 * Check if the user is a founder/super admin.
 */
export async function isFounder(userId: string): Promise<boolean> {
  const profile = await getUserProfile(userId);
  return profile?.role === 'founder';
}

/**
 * Require founder access. Redirects unauthorized users.
 */
export async function requireFounder() {
  const user = await requireAuth('/login');
  const founder = await isFounder(user.id);
  if (!founder) {
    redirect('/login?error=unauthorized');
  }
  return user;
}

/**
 * Check if the user is a Pentarch staff member (cached per request).
 */
export const isStaff = cache(async (userId: string): Promise<boolean> => {
  const supabase = createAdminClient();
  const { count } = await supabase
    .from('organization_memberships')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('status', 'active');

  return (count ?? 0) > 0;
});

/**
 * Require founder or staff access. Redirects unauthorized users.
 */
export async function requireStaff() {
  const user = await requireAuth('/login');
  const profile = await getUserProfile(user.id);

  if (profile?.role === 'founder') return { user, role: 'founder' as const };

  const staff = await isStaff(user.id);
  if (staff) return { user, role: 'staff' as const };

  redirect('/login?error=unauthorized');
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
