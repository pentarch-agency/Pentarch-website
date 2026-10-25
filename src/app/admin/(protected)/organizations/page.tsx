import { connection } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

export default async function OrganizationsPage() {
  await connection();
  const supabase = await createClient();

  const { data: orgs, error } = await supabase
    .from('organizations')
    .select('id, name, slug, status, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    return <div className="text-red-600">Failed to load organizations: {error.message}</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Organizations</h1>
        <Link
          href="/admin/organizations/new"
          className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm"
        >
          Create organization
        </Link>
      </div>

      {!orgs || orgs.length === 0 ? (
        <div className="bg-white rounded-xl border p-8 text-center text-gray-500">
          No organizations yet. Create one to get started.
        </div>
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Slug</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {orgs.map((org) => (
                <tr key={org.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <Link href={`/admin/organizations/${org.id}`} className="text-gray-900 font-medium hover:underline">
                      {org.name}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-gray-500 font-mono text-sm">{org.slug}</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={org.status} />
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-sm">
                    {new Date(org.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active: 'bg-green-100 text-green-800',
    pending_setup: 'bg-yellow-100 text-yellow-800',
    suspended: 'bg-red-100 text-red-800',
    archived: 'bg-gray-100 text-gray-600',
  };
  return (
    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${styles[status] || 'bg-gray-100 text-gray-600'}`}>
      {status.replace('_', ' ')}
    </span>
  );
}
