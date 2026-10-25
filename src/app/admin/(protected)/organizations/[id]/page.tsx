import { connection } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { requireFounder } from '@/lib/auth';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { StatusActions } from './status-actions';
import { InviteForm } from './invite-form';

export default async function OrganizationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await connection();
  await requireFounder();
  const { id } = await params;

  const supabase = createAdminClient();

  const { data: org, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !org) {
    notFound();
  }

  // Fetch members
  const { data: members } = await supabase
    .from('organization_memberships')
    .select('id, user_id, role, status, created_at')
    .eq('organization_id', id)
    .order('created_at', { ascending: true });

  // Fetch pending invitations
  const { data: invitations } = await supabase
    .from('invitations')
    .select('id, email, role, status, created_at')
    .eq('organization_id', id)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  // Fetch member profiles
  const memberProfiles: Record<string, { email: string }> = {};
  if (members && members.length > 0) {
    const { data: profiles } = await supabase
      .from('user_profiles')
      .select('id, email')
      .in('id', members.map((m) => m.user_id));
    profiles?.forEach((p) => {
      memberProfiles[p.id] = { email: p.email };
    });
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3 mb-2">
        <Link href="/admin/organizations" className="text-sm text-gray-500 hover:text-gray-700">
          &larr; Organizations
        </Link>
      </div>

      {/* Header */}
      <div className="bg-white rounded-xl border p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{org.name}</h1>
            <p className="text-gray-500 font-mono text-sm mt-1">{org.slug}.pentarch.agency</p>
          </div>
          <StatusActions orgId={org.id} currentStatus={org.status} />
        </div>
      </div>

      {/* Members */}
      <div className="bg-white rounded-xl border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Members</h2>
        {!members || members.length === 0 ? (
          <p className="text-gray-500 text-sm">No members yet. Send an invitation below.</p>
        ) : (
          <table className="w-full">
            <thead className="border-b">
              <tr>
                <th className="text-left pb-2 text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="text-left pb-2 text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="text-left pb-2 text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {members.map((m) => (
                <tr key={m.id}>
                  <td className="py-3 text-sm">{memberProfiles[m.user_id]?.email || m.user_id}</td>
                  <td className="py-3 text-sm text-gray-500">{m.role}</td>
                  <td className="py-3 text-sm">
                    <span className={`inline-flex px-2 py-0.5 text-xs rounded-full ${
                      m.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {m.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pending Invitations */}
      {invitations && invitations.length > 0 && (
        <div className="bg-white rounded-xl border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Pending Invitations</h2>
          <ul className="space-y-2">
            {invitations.map((inv) => (
              <li key={inv.id} className="flex items-center justify-between text-sm border-b pb-2">
                <span>{inv.email}</span>
                <span className="text-gray-500">{inv.role} &middot; {new Date(inv.created_at).toLocaleDateString()}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Invite Form */}
      <div className="bg-white rounded-xl border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Invite Member</h2>
        <InviteForm orgId={org.id} />
      </div>
    </div>
  );
}
