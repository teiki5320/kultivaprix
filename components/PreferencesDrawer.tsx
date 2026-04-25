'use client';

import { useEffect, useRef, useState } from 'react';
import {
  REGIONS,
  LEVELS,
  CURRENCIES,
  PREFS_COOKIE,
  PREFS_COOKIE_MAX_AGE,
  parsePreferences,
  type Preferences,
  type Region,
  type Level,
  type Currency,
  type LightMode,
} from '@/lib/preferences';

function readCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined;
  const m = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return m ? decodeURIComponent(m[2]) : undefined;
}

function writeCookie(name: string, value: string, maxAge: number) {
  document.cookie = `${name}=${encodeURIComponent(value)}; max-age=${maxAge}; path=/; SameSite=Lax`;
}

export function PreferencesDrawer() {
  const [open, setOpen] = useState(false);
  const [prefs, setPrefs] = useState<Preferences | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPrefs(parsePreferences(readCookie(PREFS_COOKIE)));
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    if (open) {
      document.addEventListener('keydown', onKey);
      return () => document.removeEventListener('keydown', onKey);
    }
  }, [open]);

  function update<K extends keyof Preferences>(key: K, value: Preferences[K]) {
    if (!prefs) return;
    const next = { ...prefs, [key]: value };
    setPrefs(next);
    writeCookie(PREFS_COOKIE, JSON.stringify(next), PREFS_COOKIE_MAX_AGE);
  }

  function applyAndClose() {
    setOpen(false);
    // Hard refresh so server components re-render with the new prefs
    if (typeof window !== 'undefined') window.location.reload();
  }

  const regionLabel = prefs ? REGIONS.find((r) => r.slug === prefs.region)?.emoji : '🌿';

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Mes préférences"
        title="Mes préférences"
        className="rounded-full px-3 py-2 text-sm font-body font-bold transition hover:bg-cream"
        style={{ color: 'var(--brand-dark)' }}
      >
        {regionLabel} <span className="hidden md:inline">Préférences</span>
      </button>

      {open && prefs && (
        <div
          className="fixed inset-0 z-[100] flex items-end md:items-center md:justify-center bg-black/30 backdrop-blur-sm"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Préférences"
        >
          <div
            ref={dialogRef}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-t-bubble md:rounded-bubble w-full md:max-w-md p-6 md:p-7 max-h-[85vh] overflow-y-auto"
            style={{ boxShadow: 'var(--shadow-xl)' }}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="kicker">🌿 Mes préférences</span>
                <h2 className="font-display text-2xl font-bold text-fg mt-1">Pour mon potager</h2>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Fermer"
                className="text-fg-muted hover:text-fg text-xl"
              >
                ✕
              </button>
            </div>

            <fieldset className="mb-5">
              <legend className="font-body font-bold text-sm text-fg mb-2">Ma région</legend>
              <div className="grid grid-cols-1 gap-2">
                {REGIONS.map((r) => (
                  <button
                    key={r.slug}
                    type="button"
                    onClick={() => update('region', r.slug as Region)}
                    className={`text-left rounded-xl px-4 py-3 font-body font-bold text-sm transition border ${
                      prefs.region === r.slug
                        ? 'border-brand bg-brand/10 text-brand-dark'
                        : 'border-cream text-fg hover:bg-cream-warm'
                    }`}
                  >
                    {r.emoji} {r.label}
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset className="mb-5">
              <legend className="font-body font-bold text-sm text-fg mb-2">Mon niveau</legend>
              <div className="grid grid-cols-2 gap-2">
                {LEVELS.map((l) => (
                  <button
                    key={l.slug}
                    type="button"
                    onClick={() => update('level', l.slug as Level)}
                    className={`rounded-xl px-3 py-3 font-body font-bold text-sm transition border ${
                      prefs.level === l.slug
                        ? 'border-brand bg-brand/10 text-brand-dark'
                        : 'border-cream text-fg hover:bg-cream-warm'
                    }`}
                  >
                    {l.emoji} {l.label}
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset className="mb-5">
              <legend className="font-body font-bold text-sm text-fg mb-2">Devise</legend>
              <div className="grid grid-cols-2 gap-2">
                {CURRENCIES.map((c) => (
                  <button
                    key={c.slug}
                    type="button"
                    onClick={() => update('currency', c.slug as Currency)}
                    className={`rounded-xl px-3 py-3 font-body font-bold text-sm transition border ${
                      prefs.currency === c.slug
                        ? 'border-brand bg-brand/10 text-brand-dark'
                        : 'border-cream text-fg hover:bg-cream-warm'
                    }`}
                  >
                    {c.sign} <span className="text-xs font-normal">{c.label.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset className="mb-6">
              <legend className="font-body font-bold text-sm text-fg mb-2">Affichage</legend>
              <label className="flex items-center gap-3 cursor-pointer rounded-xl px-4 py-3 border border-cream hover:bg-cream-warm">
                <input
                  type="checkbox"
                  checked={prefs.light === 'leger'}
                  onChange={(e) => update('light', (e.target.checked ? 'leger' : 'normal') as LightMode)}
                  className="w-4 h-4 accent-brand"
                />
                <span className="font-body text-sm font-bold text-fg">Mode léger (sans images)</span>
              </label>
            </fieldset>

            <button
              type="button"
              onClick={applyAndClose}
              className="btn-primary w-full justify-center"
            >
              Appliquer
            </button>
          </div>
        </div>
      )}
    </>
  );
}
