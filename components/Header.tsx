import Link from 'next/link';
import { PreferencesDrawer } from './PreferencesDrawer';
import { MONTHS } from '@/lib/calendar';

export function Header() {
  const currentMonth = MONTHS[new Date().getMonth()].slug;
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-cream-warm/85 border-b border-cream">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3 no-underline">
          <span
            aria-hidden
            className="w-10 h-10 rounded-2xl flex items-center justify-center text-2xl shadow-logo"
            style={{ background: 'linear-gradient(135deg, #FFE7A0, #A8D5A2)' }}
          >
            🌷
          </span>
          <span className="font-display text-2xl font-bold tracking-tight" style={{ color: 'var(--brand-dark)' }}>
            Kultiva<span style={{ color: 'var(--terracotta-deep)' }}>prix</span>
          </span>
        </Link>
        <nav className="flex items-center gap-1 md:gap-5 text-sm">
          <Link
            href="/catalogue"
            className="hidden md:inline font-body font-bold text-fg hover:text-brand-dark transition"
          >
            L'étal
          </Link>
          <Link
            href={`/que-semer/${currentMonth}`}
            className="hidden md:inline font-body font-bold text-fg hover:text-brand-dark transition"
          >
            Calendrier
          </Link>
          <Link href="/guide" className="hidden md:inline font-body font-bold text-fg hover:text-brand-dark transition">
            Guides
          </Link>
          <Link href="/app" className="hidden md:inline font-body font-bold text-fg hover:text-brand-dark transition">
            App
          </Link>
          <PreferencesDrawer />
        </nav>
      </div>
    </header>
  );
}
