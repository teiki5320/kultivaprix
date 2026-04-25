'use client';

import { useState } from 'react';

interface Props {
  productSlug: string;
  productName: string;
  currentMin: number | null;
}

export function PriceAlertForm({ productSlug, productName, currentMin }: Props) {
  const [email, setEmail] = useState('');
  const [threshold, setThreshold] = useState<string>(
    currentMin != null ? (currentMin * 0.85).toFixed(2) : '',
  );
  const [state, setState] = useState<'idle' | 'sending' | 'ok' | 'error'>('idle');
  const [msg, setMsg] = useState<string>('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState('sending');
    try {
      const res = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          email,
          productSlug,
          kind: 'price',
          thresholdEur: parseFloat(threshold) || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setState('error');
        setMsg(data.error ?? 'Échec');
        return;
      }
      setState('ok');
      setMsg('On te prévient dès que le prix baisse 🌱');
    } catch {
      setState('error');
      setMsg('Erreur réseau');
    }
  }

  if (state === 'ok') {
    return (
      <div className="card-cream text-center" style={{ background: 'color-mix(in oklab, var(--brand) 12%, white)' }}>
        <div className="text-3xl">🎉</div>
        <p className="font-display text-lg font-bold text-brand-dark mt-1">{msg}</p>
        <p className="font-body text-sm text-fg-muted mt-2">
          Lien de désinscription dans chaque email.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="card-cream space-y-3">
      <div>
        <span className="kicker">🔔 Alerte prix</span>
        <h3 className="font-display text-xl font-bold text-fg mt-2">
          Préviens-moi pour {productName}
        </h3>
        <p className="font-body text-sm text-fg-muted mt-1">
          Email envoyé une seule fois quand le prix passe sous le seuil que tu choisis. Pas de
          compte, pas de spam.
        </p>
      </div>
      <div className="flex flex-col md:flex-row gap-2">
        <input
          type="email"
          required
          placeholder="ton@email.fr"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-label="Adresse email"
          className="flex-1 px-4 py-3 rounded-xl bg-white font-body focus:outline-none border border-cream"
        />
        <div className="flex items-center gap-1">
          <span className="text-fg-muted font-body text-sm">≤</span>
          <input
            type="number"
            min="0"
            step="0.01"
            required
            value={threshold}
            onChange={(e) => setThreshold(e.target.value)}
            aria-label="Seuil de prix en euros"
            className="w-24 px-3 py-3 rounded-xl bg-white font-body focus:outline-none border border-cream text-right"
          />
          <span className="text-fg-muted font-body text-sm">€</span>
        </div>
        <button type="submit" disabled={state === 'sending'} className="btn-primary">
          {state === 'sending' ? '…' : 'Activer'}
        </button>
      </div>
      {state === 'error' && (
        <p className="text-sm text-red-700 font-body">{msg}</p>
      )}
    </form>
  );
}
