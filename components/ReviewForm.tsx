'use client';

import { useState } from 'react';

interface Props {
  productSlug: string;
  productName: string;
}

export function ReviewForm({ productSlug, productName }: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [region, setRegion] = useState('');
  const [rating, setRating] = useState(4);
  const [body, setBody] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'ok' | 'error'>('idle');
  const [msg, setMsg] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState('sending');
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ productSlug, displayName: name, region, rating, body }),
      });
      const data = await res.json();
      if (!res.ok) {
        setState('error');
        setMsg(data.error ?? 'Échec');
        return;
      }
      setState('ok');
      setMsg('Merci ! Ton avis sera publié après modération.');
    } catch {
      setState('error');
      setMsg('Erreur réseau');
    }
  }

  if (state === 'ok') {
    return (
      <div className="card-cream text-center" style={{ background: 'color-mix(in oklab, var(--brand) 12%, white)' }}>
        <div className="text-3xl">🌿</div>
        <p className="font-display text-lg font-bold text-brand-dark mt-1">{msg}</p>
      </div>
    );
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="btn-ghost">
        ✍️ Donner mon avis sur {productName}
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="card-cream space-y-3">
      <div className="flex items-baseline gap-2">
        <span className="kicker">✍️ Mon avis</span>
        <button type="button" onClick={() => setOpen(false)} className="ml-auto text-fg-muted text-sm hover:text-fg">
          Annuler
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <input
          required
          placeholder="Pseudo (visible)"
          value={name}
          maxLength={60}
          onChange={(e) => setName(e.target.value)}
          aria-label="Pseudo"
          className="px-4 py-3 rounded-xl bg-white font-body focus:outline-none border border-cream"
        />
        <input
          placeholder="Région (Lyon, Dakar…)"
          value={region}
          maxLength={60}
          onChange={(e) => setRegion(e.target.value)}
          aria-label="Région"
          className="px-4 py-3 rounded-xl bg-white font-body focus:outline-none border border-cream"
        />
      </div>
      <div>
        <label className="font-body font-bold text-sm text-fg-muted block mb-1">Note</label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              aria-label={`${n} étoile${n > 1 ? 's' : ''}`}
              className="text-3xl"
              style={{ color: n <= rating ? 'var(--terracotta-deep)' : 'var(--cream)' }}
            >
              ★
            </button>
          ))}
        </div>
      </div>
      <textarea
        required
        placeholder="Germination, goût, productivité…"
        value={body}
        rows={4}
        minLength={20}
        maxLength={1500}
        onChange={(e) => setBody(e.target.value)}
        className="w-full px-4 py-3 rounded-xl bg-white font-body focus:outline-none border border-cream resize-y"
      />
      <button type="submit" disabled={state === 'sending'} className="btn-primary">
        {state === 'sending' ? '…' : 'Publier (modération préalable)'}
      </button>
      {state === 'error' && <p className="text-sm text-red-700 font-body">{msg}</p>}
    </form>
  );
}
