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
      <header className="bg-ink">
        <nav className="container mx-auto px-6 py-4 flex items-center justify-between">
          <a href="/" className="text-xl font-bold text-bone">
            Pentarch
          </a>
          <div className="flex items-center gap-6">
            <a href="/services" className="text-grey hover:text-bone transition-colors">Services</a>
            <a href="/projects" className="text-grey hover:text-bone transition-colors">Projects</a>
            <a href="/about" className="text-grey hover:text-bone transition-colors">About</a>
            <a href="/contact" className="px-4 py-2 bg-vermilion text-white rounded-lg hover:bg-vermilion/90 transition-colors text-sm font-medium">Contact</a>
          </div>
        </nav>
      </header>
      <main className="flex-1 bg-bone">{children}</main>
      <footer className="bg-ink">
        <div className="container mx-auto px-6 py-8 text-center text-grey text-sm">
          &copy; 2026 Pentarch Agency. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
