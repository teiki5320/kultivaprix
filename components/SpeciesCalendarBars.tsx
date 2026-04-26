/**
 * 12-month calendar bars in the same style as Kultiva's app fiche
 * (active months solid, others pale). Used twice per species page : once
 * for sowing, once for harvest.
 */

const MONTHS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];

interface Props {
  title: string;
  months: number[];           // 1-indexed (1=Jan, 12=Déc)
  tone: 'sow' | 'harvest';
  regionalNote?: string | null;
}

export function SpeciesCalendarBars({ title, months, tone, regionalNote }: Props) {
  const activeSet = new Set(months);

  const activeColor = tone === 'sow' ? 'var(--brand)' : 'var(--terracotta-deep)';
  const idleColor = tone === 'sow'
    ? 'color-mix(in oklab, var(--brand) 14%, white)'
    : 'color-mix(in oklab, var(--terracotta-deep) 12%, white)';

  return (
    <section className="card-cream">
      <h2 className="font-display font-bold text-xl text-fg mb-4">{title}</h2>
      <div className="grid grid-cols-12 gap-1.5">
        {MONTHS.map((m, i) => {
          const idx = i + 1;
          const active = activeSet.has(idx);
          return (
            <div key={m} className="flex flex-col items-center gap-1.5">
              <div
                className="w-full h-3 rounded-full transition"
                style={{ background: active ? activeColor : idleColor }}
                aria-label={active ? `${m} : actif` : `${m} : non`}
              />
              <span
                className="font-body text-[10px] md:text-xs"
                style={{ color: active ? activeColor : 'var(--fg-subtle)', fontWeight: active ? 700 : 400 }}
              >
                {m}
              </span>
            </div>
          );
        })}
      </div>
      {regionalNote && (
        <p className="font-body text-xs text-fg-muted mt-3 italic">
          ℹ️ {regionalNote}
        </p>
      )}
    </section>
  );
}
