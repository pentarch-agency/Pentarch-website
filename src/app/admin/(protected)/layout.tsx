import type { Metadata } from 'next';
import { connection } from 'next/server';
import { requireFounder } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'Admin — Pentarch',
  description: 'Pentarch founder administration dashboard',
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await connection();
  await requireFounder();

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-6 border-b border-gray-800">
          <span className="text-lg font-bold">Pentarch Admin</span>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <NavLink href="/admin" label="Overview" />
          <NavLink href="/admin/organizations" label="Organizations" />
          <NavLink href="/admin/projects" label="Projects" />
          <NavLink href="/admin/tasks" label="Tasks" />
          <NavLink href="/admin/inquiries" label="Inquiries" />
          <NavLink href="/admin/products" label="Products" />
          <NavLink href="/admin/audit-log" label="Audit Log" />
        </nav>
        <div className="p-4 border-t border-gray-800">
          <form action="/api/auth/signout" method="POST">
            <button className="text-gray-400 hover:text-white text-sm">
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 bg-gray-50">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      className="block px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
    >
      {label}
    </a>
  );
}
