'use client';

import { useEffect, useMemo, useState } from 'react';
import { getDefaultPrice } from '@/lib/market-prices';
import { getCategoryColor, getCategoryLabel } from '@/lib/etal-categories';

const STORAGE_KEY = 'kultivaprix.bilan.v1';

export interface SpeciesOption {
  slug: string;
  name: string;
  emoji: string | null;
  category: string;
}

interface HarvestEntry {
  id: string;
  speciesSlug: string;
  speciesName: string;
  speciesEmoji: string | null;
  speciesCategory: string;
  kg: number;
  pricePerKg: number;
  date: string; // ISO yyyy-mm-dd
}

interface Props {
  speciesOptions: SpeciesOption[];
}

function loadEntries(): HarvestEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveEntries(entries: HarvestEntry[]) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // quota plein ou storage désactivé — silencieux, l'UX continue.
  }
}

function formatEur(v: number) {
  return v.toLocaleString('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 2,
  });
}

function formatKg(v: number) {
  return `${v.toLocaleString('fr-FR', { maximumFractionDigits: 2 })} kg`;
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export function BilanClient({ speciesOptions }: Props) {
  const [entries, setEntries] = useState<HarvestEntry[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Form state
  const [selectedSlug, setSelectedSlug] = useState<string>(speciesOptions[0]?.slug ?? '');
  const [kg, setKg] = useState<string>('');
  const [pricePerKg, setPricePerKg] = useState<string>('');
  const [date, setDate] = useState<string>(todayIso());

  useEffect(() => {
    setEntries(loadEntries());
    setHydrated(true);
  }, []);

  const speciesBySlug = useMemo(() => {
    const m = new Map<string, SpeciesOption>();
    for (const s of speciesOptions) m.set(s.slug, s);
    return m;
  }, [speciesOptions]);

  // Pré-remplir le prix par défaut quand on change d'espèce.
  useEffect(() => {
    const sp = speciesBySlug.get(selectedSlug);
    if (sp) setPricePerKg(getDefaultPrice(sp.category).toString());
  }, [selectedSlug, speciesBySlug]);

  const totals = useMemo(() => {
    let kg = 0;
    let savings = 0;
    const speciesSet = new Set<string>();
    for (const e of entries) {
      kg += e.kg;
      savings += e.kg * e.pricePerKg;
      speciesSet.add(e.speciesSlug);
    }
    return { kg, savings, distinct: speciesSet.size };
  }, [entries]);

  function addEntry(e: React.FormEvent) {
    e.preventDefault();
    const sp = speciesBySlug.get(selectedSlug);
    if (!sp) return;
    const kgNum = parseFloat(kg.replace(',', '.'));
    const priceNum = parseFloat(pricePerKg.replace(',', '.'));
    if (!Number.isFinite(kgNum) || kgNum <= 0) return;
    if (!Number.isFinite(priceNum) || priceNum < 0) return;
    const entry: HarvestEntry = {
      id: uid(),
      speciesSlug: sp.slug,
      speciesName: sp.name,
      speciesEmoji: sp.emoji,
      speciesCategory: sp.category,
      kg: kgNum,
      pricePerKg: priceNum,
      date: date || todayIso(),
    };
    const next = [entry, ...entries];
    setEntries(next);
    saveEntries(next);
    // Reset partiel : on garde l'espèce et la date pour faciliter les saisies en série.
    setKg('');
  }

  function removeEntry(id: string) {
    const next = entries.filter((e) => e.id !== id);
    setEntries(next);
    saveEntries(next);
  }

  function clearAll() {
    if (!window.confirm('Effacer tout le journal de récoltes ? Cette action est définitive.')) return;
    setEntries([]);
    saveEntries([]);
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Totaux */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <SummaryCard
          icon="💰"
          label="Économies sur les courses"
          value={hydrated ? formatEur(totals.savings) : '—'}
          color="#4A9B5A"
          highlighted
        />
        <SummaryCard
          icon="🥬"
          label="Récolté au total"
          value={hydrated ? formatKg(totals.kg) : '—'}
          color="#E8A87C"
        />
        <SummaryCard
          icon="🌱"
          label="Variétés cultivées"
          value={hydrated ? `${totals.distinct}` : '—'}
          color="#26A69A"
        />
      </section>

      {/* Formulaire */}
      <section className="card-cream">
        <h2 className="font-display font-bold text-xl text-fg mb-4">
          <span aria-hidden className="mr-2">➕</span>Ajouter une récolte
        </h2>
        <form onSubmit={addEntry} className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr_auto] gap-3 items-end">
          <Field label="Espèce">
            <select
              value={selectedSlug}
              onChange={(e) => setSelectedSlug(e.target.value)}
              className="w-full rounded-xl border-2 border-cream bg-white px-3 py-2.5 font-body text-fg focus:outline-none focus:border-brand"
              required
            >
              {speciesOptions.map((s) => (
                <option key={s.slug} value={s.slug}>
                  {s.emoji ?? '🌱'} {s.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Quantité (kg)">
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={kg}
              onChange={(e) => setKg(e.target.value)}
              placeholder="ex: 1,2"
              className="w-full rounded-xl border-2 border-cream bg-white px-3 py-2.5 font-body text-fg focus:outline-none focus:border-brand"
              required
            />
          </Field>
          <Field label="Prix marché €/kg">
            <input
              type="number"
              step="0.01"
              min="0"
              value={pricePerKg}
              onChange={(e) => setPricePerKg(e.target.value)}
              className="w-full rounded-xl border-2 border-cream bg-white px-3 py-2.5 font-body text-fg focus:outline-none focus:border-brand"
              required
            />
          </Field>
          <Field label="Date">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-xl border-2 border-cream bg-white px-3 py-2.5 font-body text-fg focus:outline-none focus:border-brand"
              required
            />
          </Field>
          <button type="submit" className="btn-primary !py-2.5 !px-4 self-end whitespace-nowrap">
            Ajouter
          </button>
        </form>
        <p className="font-body text-xs text-fg-muted mt-3">
          Le prix marché est pré-rempli avec une moyenne grande surface. Ajuste-le selon ton coin du
          rayon. Les données restent dans ton navigateur — ni compte, ni cloud.
        </p>
      </section>

      {/* Liste */}
      <section>
        <div className="flex items-end justify-between mb-4">
          <h2 className="font-display font-bold text-xl text-fg">
            <span aria-hidden className="mr-2">📔</span>
            Journal des récoltes
            {hydrated && entries.length > 0 && (
              <span className="font-body font-normal text-fg-muted text-base ml-2">
                ({entries.length})
              </span>
            )}
          </h2>
          {hydrated && entries.length > 0 && (
            <button
              type="button"
              onClick={clearAll}
              className="font-body text-sm text-fg-muted hover:text-fg underline"
            >
              Tout effacer
            </button>
          )}
        </div>

        {!hydrated ? null : entries.length === 0 ? (
          <div className="card-cream text-center py-10">
            <div className="text-4xl">🧺</div>
            <p className="font-body font-bold text-fg mt-3">Aucune récolte enregistrée pour l&apos;instant.</p>
            <p className="font-body text-sm text-fg-muted mt-1">
              Saisis ta première récolte au-dessus pour voir tes économies se calculer.
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {entries.map((e) => (
              <EntryRow key={e.id} entry={e} onRemove={() => removeEntry(e.id)} />
            ))}
          </ul>
        )}
      </section>

      {/* Méthodologie */}
      <details className="card-cream text-fg-muted font-body text-sm">
        <summary className="font-bold cursor-pointer text-fg">Comment on calcule ?</summary>
        <p className="mt-3 leading-relaxed">
          Pour chaque récolte saisie, on multiplie la quantité (kg) par le prix marché que tu as
          renseigné — par défaut une moyenne grande surface française par famille (
          fruits 3 €/kg, feuilles 5 €/kg, racines 2,5 €/kg, bulbes 4 €/kg, tubercules 2 €/kg,
          aromatiques 50 €/kg…). Ça te donne ce que tu aurais payé en magasin. À déduire de ça : le
          coût des graines, de l&apos;eau et de ton temps — ce calcul ne les inclut pas, c&apos;est
          un repère, pas un audit comptable.
        </p>
      </details>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="font-body font-bold text-xs text-fg-muted uppercase tracking-wide">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  color,
  highlighted,
}: {
  icon: string;
  label: string;
  value: string;
  color: string;
  highlighted?: boolean;
}) {
  return (
    <div
      className="rounded-2xl p-5"
      style={{
        background: highlighted
          ? `linear-gradient(135deg, ${color}26, ${color}40)`
          : '#fff',
        border: `2px solid ${color}b3`,
      }}
    >
      <div className="text-3xl">{icon}</div>
      <div className="font-display font-bold text-2xl mt-2 text-fg">{value}</div>
      <div className="font-body text-sm text-fg-muted mt-1">{label}</div>
    </div>
  );
}

function EntryRow({ entry, onRemove }: { entry: HarvestEntry; onRemove: () => void }) {
  const color = getCategoryColor(entry.speciesCategory);
  const cat = getCategoryLabel(entry.speciesCategory);
  const savings = entry.kg * entry.pricePerKg;
  return (
    <li
      className="flex items-center gap-3 rounded-2xl bg-white px-3 py-3 border-2"
      style={{ borderColor: `${color}66` }}
    >
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center text-2xl shrink-0"
        style={{ background: `${color}1f` }}
      >
        {entry.speciesEmoji ?? '🌱'}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-display font-bold text-fg truncate">{entry.speciesName}</div>
        <div className="font-body text-xs text-fg-muted">
          {cat} · {new Date(entry.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
        </div>
      </div>
      <div className="text-right shrink-0">
        <div className="font-body text-sm text-fg-muted">
          {formatKg(entry.kg)} × {formatEur(entry.pricePerKg)}
        </div>
        <div className="font-display font-bold text-lg" style={{ color }}>
          {formatEur(savings)}
        </div>
      </div>
      <button
        type="button"
        onClick={onRemove}
        aria-label="Supprimer cette récolte"
        className="ml-2 w-8 h-8 rounded-full flex items-center justify-center text-fg-muted hover:bg-cream-warm transition shrink-0"
      >
        ✕
      </button>
    </li>
  );
}
