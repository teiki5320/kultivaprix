import type { Metadata } from 'next';
import Link from 'next/link';
import { MONTHS } from '@/lib/calendar';

export const metadata: Metadata = {
  title: 'Demander conseil',
  description: "Une question potager ? On t'oriente vers le bon réflexe : le quiz, le calendrier ou un guide.",
  alternates: { canonical: '/conseil' },
};

export default function ConseilPage() {
  const currentMonth = MONTHS[new Date().getMonth()].slug;
  const QUICK_LINKS = [
    { q: 'Que planter ce mois ?', href: `/que-semer/${currentMonth}`, kicker: '🌱 Calendrier' },
    { q: 'Quoi planter pour ma config (balcon, exposition…) ?', href: '/quiz', kicker: '✨ Quiz' },
    { q: 'Comment savoir si une variété est bonne ?', href: '/glossaire', kicker: '📚 Glossaire' },
    { q: 'Voir tout le catalogue par famille', href: '/catalogue', kicker: '🌿 Catalogue' },
    { q: 'Je veux un calendrier sur le frigo', href: '/calendrier-imprimable', kicker: '🖨 Imprimer' },
    { q: "Et si je plante en Afrique de l'Ouest ?", href: '/afrique-de-louest', kicker: '🌍 Afrique' },
  ];

  return (
    <div className="flex flex-col gap-8">
      <header className="text-center pt-4">
        <span className="kicker">💬 Demander conseil</span>
        <h1 className="font-display text-4xl md:text-5xl font-bold text-fg mt-3">
          Une <em className="hero-em">question</em> ? On a une réponse
        </h1>
        <p className="font-body text-fg-muted max-w-2xl mx-auto mt-4">
          On t&apos;oriente vers le bon outil selon ce que tu cherches.
        </p>
      </header>

      <section className="grid md:grid-cols-2 gap-3">
        {QUICK_LINKS.map((q) => (
          <Link
            key={q.href}
            href={q.href}
            className="card-cream no-underline transition hover:-translate-y-1 hover:shadow-leaf"
          >
            <span className="kicker">{q.kicker}</span>
            <div className="font-display font-bold text-lg text-fg mt-2">{q.q}</div>
            <div className="font-body text-sm mt-2" style={{ color: 'var(--terracotta-deep)' }}>
              → y aller
            </div>
          </Link>
        ))}
      </section>
    </div>
  );
}
