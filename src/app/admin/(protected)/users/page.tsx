import { connection } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { requireFounder } from '@/lib/auth';
import Link from 'next/link';

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  await connection();
  await requireFounder();

  const params = await searchParams;
  const supabase = createAdminClient();

  let query = supabase.from('user_profiles').select('*').order('created_at', { ascending: false });
  if (params.role) query = query.eq('role', params.role);

  const { data: users } = await query;

  const membershipCounts: Record<string, number> = {};
  if (users && users.length > 0) {
    const { data: memberships } = await supabase
      .from('organization_memberships')
      .select('user_id')
      .in('user_id', users.map(u => u.id))
      .eq('status', 'active');
    memberships?.forEach(m => {
      membershipCounts[m.user_id] = (membershipCounts[m.user_id] || 0) + 1;
    });
  }

  const thStyle = {
    color: 'var(--text-subtle)',
    background: 'var(--surface-muted)',
    height: '36px',
  } as const;

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
            <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>Users</span>
          </div>
        </div>
      </div>

      <div
        className="rounded-lg overflow-hidden"
        style={{ background: 'var(--surface-card)', border: '1px solid var(--border-default)' }}
      >
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-left px-4 data-sm" style={thStyle}>Email</th>
              <th className="text-left px-4 data-sm" style={thStyle}>Name</th>
              <th className="text-left px-4 data-sm" style={thStyle}>Role</th>
              <th className="text-left px-4 data-sm" style={thStyle}>Orgs</th>
              <th className="text-left px-4 data-sm" style={thStyle}>Joined</th>
            </tr>
          </thead>
          <tbody>
            {(!users || users.length === 0) && (
              <tr><td colSpan={5} className="p-4 text-[13px] text-center" style={{ color: 'var(--text-subtle)' }}>No users found.</td></tr>
            )}
            {users?.map((u) => {
              const isFounder = u.role === 'founder';
              return (
                <UserRow key={u.id} user={u} orgCount={membershipCounts[u.id] || 0} isFounder={isFounder} />
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function UserRow({ user, orgCount, isFounder }: { user: any; orgCount: number; isFounder: boolean }) {
  return (
    <tr>
      <td
        className="px-4"
        style={{ borderBottom: '1px solid var(--border-default)', height: '50px' }}
      >
        <Link href={`/users/${user.id}`} className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>{user.email}</Link>
      </td>
      <td className="px-4 text-[13px]" style={{ borderBottom: '1px solid var(--border-default)', color: 'var(--text-muted)' }}>
        {user.full_name || '—'}
      </td>
      <td className="px-4" style={{ borderBottom: '1px solid var(--border-default)' }}>
        <span
          className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium"
          style={{
            background: isFounder ? 'var(--accent-solid)' : 'var(--surface-muted)',
            color: isFounder ? 'var(--text-on-accent)' : 'var(--text-muted)',
          }}
        >
          {user.role}
        </span>
      </td>
      <td className="px-4 text-[13px]" style={{ borderBottom: '1px solid var(--border-default)', color: 'var(--text-muted)' }}>
        {orgCount}
      </td>
      <td className="px-4 text-[13px]" style={{ borderBottom: '1px solid var(--border-default)', color: 'var(--text-subtle)' }}>
        {new Date(user.created_at).toLocaleDateString()}
      </td>
    </tr>
  );
}
