'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { KITS } from '@/lib/kits';

/**
 * Rough budget calculator — given a yearly budget in € and an area in m²,
 * suggests which curated kit fits, and the typical "yield per €" ranking.
 *
 * Numbers are deliberately conservative; this is a first-pass tool to help
 * a beginner pick a starting point, not an agronomic forecast.
 */

interface KitEstimate {
  slug: string;
  name: string;
  emoji: string;
  estimatedCost: number;
  fits: boolean;
}

// Hand-tuned average cost per query for a sachet of seeds at FR market price.
const COST_PER_VARIETY = 3.5; // €

export default function BudgetClient() {
  const [budget, setBudget] = useState('40');
  const [sqm, setSqm] = useState('5');

  const estimates: KitEstimate[] = useMemo(() => {
    const b = parseFloat(budget) || 0;
    return KITS.map((k) => {
      const cost = k.queries.length * COST_PER_VARIETY;
      return {
        slug: k.slug,
        name: k.name,
        emoji: k.emoji,
        estimatedCost: cost,
        fits: cost <= b,
      };
    }).sort((a, b) => a.estimatedCost - b.estimatedCost);
  }, [budget]);

  const sqmNum = parseFloat(sqm) || 0;

  return (
    <div className="flex flex-col gap-8 max-w-2xl mx-auto">
      <header className="text-center pt-4">
        <span className="kicker">💶 Budget potager</span>
        <h1 className="font-display text-4xl md:text-5xl font-bold text-fg mt-3">
          Cadre ton <em className="hero-em">premier potager</em>
        </h1>
        <p className="font-body text-fg-muted mt-3">
          Indique ce que tu veux mettre en graines cette année et la place dont tu disposes.
          On te propose le kit qui colle le mieux.
        </p>
      </header>

      <section className="card-cream space-y-4">
        <label className="block">
          <span className="font-body font-bold text-sm text-fg">Mon budget annuel (€)</span>
          <input
            type="number"
            min="0"
            step="5"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            className="mt-1 w-full px-4 py-3 rounded-xl bg-white font-body focus:outline-none border border-cream"
          />
        </label>
        <label className="block">
          <span className="font-body font-bold text-sm text-fg">Ma surface (m²)</span>
          <input
            type="number"
            min="0"
            step="1"
            value={sqm}
            onChange={(e) => setSqm(e.target.value)}
            className="mt-1 w-full px-4 py-3 rounded-xl bg-white font-body focus:outline-none border border-cream"
          />
        </label>
      </section>

      <section className="grid gap-3">
        {estimates.map((k) => (
          <Link
            key={k.slug}
            href={`/kits/${k.slug}`}
            className="card-cream flex items-center gap-4 no-underline transition hover:-translate-y-1 hover:shadow-leaf"
            style={k.fits ? { background: 'color-mix(in oklab, var(--brand) 12%, white)' } : {}}
          >
            <div className="text-3xl">{k.emoji}</div>
            <div className="flex-1">
              <div className="font-display font-bold text-fg">{k.name}</div>
              <div className="font-body text-xs text-fg-muted mt-0.5">
                Coût estimé : <strong>{k.estimatedCost.toFixed(2).replace('.', ',')} €</strong>
              </div>
            </div>
            <span className="pill" style={k.fits ? { background: 'var(--brand)', color: 'white' } : { background: 'var(--cream)', color: 'var(--fg)' }}>
              {k.fits ? 'Tient dans ton budget' : 'Au-delà'}
            </span>
          </Link>
        ))}
      </section>

      {sqmNum > 0 && sqmNum < 4 && (
        <aside className="card-cream text-fg-muted text-sm">
          🌱 Avec {sqmNum} m², privilégie les pots et les variétés compactes (tomates cerises,
          aromatiques, salades). Le kit « Balcon ensoleillé » est taillé pour ça.
        </aside>
      )}

      <div className="text-center">
        <Link href="/quiz" className="font-body font-bold text-sm" style={{ color: 'var(--terracotta-deep)' }}>
          → Pas sûr·e ? Fais le quiz « quoi planter »
        </Link>
      </div>
    </div>
  );
}
