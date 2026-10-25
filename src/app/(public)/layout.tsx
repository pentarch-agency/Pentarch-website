import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pentarch Agency',
  description: 'Digital agency specializing in web development, design, and strategy.',
};

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-white">
        <nav className="container mx-auto px-6 py-4 flex items-center justify-between">
          <a href="/" className="text-xl font-bold text-gray-900">
            Pentarch
          </a>
          <div className="flex items-center gap-6">
            <a href="/services" className="text-gray-600 hover:text-gray-900">Services</a>
            <a href="/projects" className="text-gray-600 hover:text-gray-900">Projects</a>
            <a href="/about" className="text-gray-600 hover:text-gray-900">About</a>
            <a href="/contact" className="text-gray-600 hover:text-gray-900">Contact</a>
          </div>
        </nav>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t bg-gray-50">
        <div className="container mx-auto px-6 py-8 text-center text-gray-500 text-sm">
          © 2026 Pentarch Agency. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
