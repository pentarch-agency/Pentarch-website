import { connection } from 'next/server';
import Link from 'next/link';
import { requireAuth } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/server';
import { SettingsForms } from './settings-forms';

export default async function SettingsPage() {
  await connection();
  const user = await requireAuth('/login');
  const supabase = createAdminClient();

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('full_name, avatar_url, role')
    .eq('id', user.id)
    .single();

  const { data: memberships } = await supabase
    .from('organization_memberships')
    .select('role, organization_id, organizations(name, slug)')
    .eq('user_id', user.id)
    .eq('status', 'active');

  const orgs = (memberships ?? []) as Array<{
    role: string;
    organization_id: string;
    organizations: { name: string; slug: string } | null;
  }>;

  return (
    <>
      <div className="mb-8">
        <p className="display-sm" style={{ color: 'var(--text-muted)' }}>
          <Link href="/dashboard" className="onlee-link-accent">Dashboard</Link>
          <span className="mx-1.5">/</span>
          Settings
        </p>
        <h1 className="text-[1.5rem] font-bold mt-1" style={{ color: 'var(--text-primary)' }}>
          Settings
        </h1>
      </div>

      <div className="space-y-6 max-w-2xl">
        <SettingsForms
          fullName={profile?.full_name ?? ''}
          avatarUrl={profile?.avatar_url ?? ''}
          email={user.email ?? ''}
          role={profile?.role ?? 'client'}
          lastSignIn={user.last_sign_in_at ?? null}
          orgs={orgs}
        />
      </div>
    </>
  );
}
