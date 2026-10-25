import type { Metadata } from 'next';
import { connection } from 'next/server';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { requireAuth, getOrgMembership } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: 'Client Dashboard — Pentarch',
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await connection();
  const headersList = await headers();
  const orgSlug = headersList.get('x-pentarch-org-slug');

  // No org slug in context — this subdomain isn't registered
  if (!orgSlug) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Not Found</h1>
          <p className="text-gray-500">This workspace does not exist.</p>
        </div>
      </div>
    );
  }

  // Resolve org from DB
  const supabase = await createClient();
  const { data: org } = await supabase
    .from('organizations')
    .select('id, name, slug, status')
    .eq('slug', orgSlug)
    .single();

  if (!org) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Not Found</h1>
          <p className="text-gray-500">This workspace does not exist.</p>
        </div>
      </div>
    );
  }

  // Suspended/archived org
  if (org.status === 'suspended' || org.status === 'archived') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Unavailable</h1>
          <p className="text-gray-500">This workspace is currently unavailable.</p>
        </div>
      </div>
    );
  }

  // Require auth + membership
  const user = await requireAuth('/login');
  const membership = await getOrgMembership(user.id, org.id);
  if (!membership) {
    redirect('/');
  }

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-white border-r flex flex-col">
        <div className="p-6 border-b">
          <span className="text-lg font-bold text-gray-900">{org.name}</span>
          <p className="text-xs text-gray-500 mt-1">Client Dashboard</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <DashLink href="/dashboard" label="Overview" />
          <DashLink href="/dashboard/projects" label="Projects" />
          <DashLink href="/dashboard/files" label="Files" />
          <DashLink href="/dashboard/notifications" label="Notifications" />
          <DashLink href="/dashboard/settings" label="Settings" />
        </nav>
      </aside>
      <main className="flex-1 bg-gray-50 p-8">{children}</main>
    </div>
  );
}

function DashLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      className="block px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
    >
      {label}
    </a>
  );
}
