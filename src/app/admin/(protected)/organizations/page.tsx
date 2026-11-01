import { unstable_cache } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { NewOrgButton } from './new-org-button';
import OrgTable from './org-table';

const getOrganizations = unstable_cache(
  async () => {
    const supabase = createAdminClient();
    return supabase.from('organizations').select('id, name, slug, status, created_at').order('created_at', { ascending: false });
  },
  ['admin-organizations'],
  { revalidate: 30 }
);

export default async function OrganizationsPage() {
  const { data: orgs, error } = await getOrganizations();

  if (error) {
    return <div style={{ color: 'var(--danger-text)' }}>Failed to load organizations: {error.message}</div>;
  }

  const all = orgs ?? [];

  return (
    <div>
      {/* Top Bar */}
      <div
        className="sticky top-0 z-20 -mx-6 -mt-6 px-6 mb-6"
        style={{ background: 'var(--surface-canvas)', borderBottom: '1px solid var(--border-default)' }}
      >
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center gap-2.5 text-[13px] pl-10 lg:pl-0">
            <Link href="/" className="transition-colors duration-150" style={{ color: 'var(--text-muted)' }}>Pentarch</Link>
            <span style={{ color: 'var(--text-subtle)' }}>/</span>
            <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>Organizations</span>
            <span
              className="ml-1 px-1.5 py-0.5 rounded text-[11px] font-mono font-medium"
              style={{ background: 'var(--surface-muted)', color: 'var(--text-subtle)' }}
            >
              {all.length}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <NewOrgButton />
          </div>
        </div>
      </div>

      <OrgTable orgs={all} />
    </div>
  );
}
