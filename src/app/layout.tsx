import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: 'Champion Brew',
  description: 'Champion-style specialty coffee brew recipes and live pour-over guidance.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <div className="mx-auto min-h-screen w-full max-w-6xl px-4 py-5 sm:px-6 lg:px-8">
          <header className="mb-6 flex items-center justify-between rounded-full border border-white/60 bg-white/50 px-4 py-3 backdrop-blur">
            <Link href="/" className="font-serif text-xl font-bold tracking-tight text-espresso">Champion Brew</Link>
            <nav className="flex gap-2 text-sm font-bold text-stone-600">
              <Link href="/beans" className="rounded-full px-3 py-2 hover:bg-white">Beans</Link>
              <Link href="/recipes" className="rounded-full px-3 py-2 hover:bg-white">Recipes</Link>
            </nav>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
