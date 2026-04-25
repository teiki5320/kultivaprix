import type { Metadata } from 'next';
import Link from 'next/link';
import { CTAKultiva } from '@/components/CTAKultiva';
import { KITS } from '@/lib/kits';

export const metadata: Metadata = {
  title: 'Kits potager prêts à planter',
  description: 'Sélections clés-en-main de variétés pour démarrer un balcon, un petit potager, ou une cuisine aromatique.',
};

export default function KitsPage() {
  return (
    <div className="flex flex-col gap-10">
      <header className="text-center pt-4">
        <span className="kicker">🧺 Kits</span>
        <h1 className="font-display text-4xl md:text-5xl font-bold text-fg mt-3">
          Des paniers <em className="hero-em">tout prêts</em> à comparer
        </h1>
        <p className="font-body text-fg-muted max-w-2xl mx-auto mt-4">
          Chaque kit est une short-list de variétés qu&apos;on importe en un clic dans ton panier.
          On te calcule ensuite le total optimal entre marchands.
        </p>
      </header>

      <section className="grid md:grid-cols-2 gap-4">
        {KITS.map((k) => (
          <Link
            key={k.slug}
            href={`/kits/${k.slug}`}
            className="card-cream no-underline transition hover:-translate-y-1 hover:shadow-leaf flex flex-col gap-2"
          >
            <div className="text-5xl">{k.emoji}</div>
            <h2 className="font-display text-xl font-bold text-fg">{k.name}</h2>
            <p className="font-body text-sm text-fg-muted leading-snug">{k.pitch}</p>
            <span className="pill mt-1 self-start" style={{ background: 'var(--cream)', color: 'var(--fg)' }}>
              {k.audience}
            </span>
            <span className="font-body font-bold text-sm mt-3" style={{ color: 'var(--terracotta-deep)' }}>
              Voir le kit →
            </span>
          </Link>
        ))}
      </section>

      <CTAKultiva context="kits" />
    </div>
  );
}
