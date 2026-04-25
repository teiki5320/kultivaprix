'use client';

import { useState } from 'react';

export function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'ok' | 'error'>('idle');
  const [msg, setMsg] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState('sending');
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setState('error');
        setMsg(data.error ?? 'Échec');
        return;
      }
      setState('ok');
      setMsg('Inscrite ! Une confirmation arrivera bientôt.');
    } catch {
      setState('error');
      setMsg('Erreur réseau');
    }
  }

  if (state === 'ok') {
    return (
      <div className="font-body text-sm text-white/80">🌿 {msg}</div>
    );
  }

  return (
    <form onSubmit={submit} className="flex gap-2">
      <input
        type="email"
        required
        placeholder="Ton email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        aria-label="Inscription newsletter saisonnière"
        className="flex-1 px-3 py-2 rounded-xl text-sm bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:border-white/40"
      />
      <button
        type="submit"
        disabled={state === 'sending'}
        className="px-3 py-2 rounded-xl bg-white text-ink-deep text-sm font-bold font-body transition hover:bg-cream-warm"
      >
        {state === 'sending' ? '…' : 'OK'}
      </button>
      {state === 'error' && (
        <span className="font-body text-xs text-red-300 absolute -bottom-5">{msg}</span>
      )}
    </form>
  );
}
