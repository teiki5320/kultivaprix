'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

interface Hit {
  slug: string;
  name: string;
  image_url: string | null;
  min_price: number | null;
  offer_count: number;
}

export function SearchAutocomplete({ initialValue = '' }: { initialValue?: string }) {
  const [q, setQ] = useState(initialValue);
  const [hits, setHits] = useState<Hit[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  useEffect(() => {
    if (q.trim().length < 2) {
      setHits([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/autocomplete?q=${encodeURIComponent(q)}`);
        const json = await res.json();
        if (!cancelled) setHits(json.results ?? []);
      } catch {
        if (!cancelled) setHits([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 200);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [q]);

  return (
    <div ref={wrapRef} className="relative">
      <form method="get" className="flex gap-2">
        <input
          type="search"
          name="q"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Ex: tomate Marmande, sécateur, terreau…"
          autoComplete="off"
          aria-label="Rechercher un produit"
          className="flex-1 px-5 py-4 rounded-bubble bg-white font-body text-fg placeholder:text-fg-subtle focus:outline-none transition"
          style={{ boxShadow: 'var(--shadow-sm)' }}
        />
        <button type="submit" className="btn-primary">Chercher</button>
      </form>

      {open && q.trim().length >= 2 && (
        <div
          className="absolute left-0 right-0 mt-2 bg-white rounded-2xl overflow-hidden z-40"
          style={{ boxShadow: 'var(--shadow-lg)' }}
        >
          {loading && hits.length === 0 && (
            <div className="px-5 py-3 text-fg-muted text-sm">Recherche en cours…</div>
          )}
          {!loading && hits.length === 0 && (
            <div className="px-5 py-3 text-fg-muted text-sm">Aucune suggestion</div>
          )}
          {hits.map((h) => (
            <Link
              key={h.slug}
              href={`/produit/${h.slug}`}
              className="flex items-center gap-3 px-4 py-3 hover:bg-cream-warm transition no-underline"
              onClick={() => setOpen(false)}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 overflow-hidden"
                style={{ background: 'var(--cream)' }}
              >
                {h.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={h.image_url} alt="" className="w-full h-full object-cover" loading="lazy" />
                ) : (
                  <span aria-hidden>🌱</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-body font-bold text-sm text-fg truncate">{h.name}</div>
                <div className="text-xs text-fg-muted">
                  {h.offer_count} marchand{h.offer_count > 1 ? 's' : ''}
                  {h.min_price != null && ` · dès ${h.min_price.toFixed(2).replace('.', ',')} €`}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
