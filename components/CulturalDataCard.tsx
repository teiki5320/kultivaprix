import { findCulturalData, monthsToString } from '@/lib/cultural';

interface Props {
  name: string;
  attributes: Record<string, unknown> | null;
}

export function CulturalDataCard({ name, attributes }: Props) {
  const data = findCulturalData(name, attributes);
  if (!data) return null;

  const rows: { label: string; value: string }[] = [];
  if (data.exposure) rows.push({ label: 'Exposition', value: data.exposure });
  if (data.sowingMonths?.length) rows.push({ label: 'À semer', value: monthsToString(data.sowingMonths) });
  if (data.harvestMonths?.length) rows.push({ label: 'À récolter', value: monthsToString(data.harvestMonths) });
  if (data.spacingCm) rows.push({ label: 'Distance', value: `${data.spacingCm} cm entre plants` });
  if (data.heightCm) rows.push({ label: 'Hauteur adulte', value: `${data.heightCm} cm` });
  if (data.waterNeed) rows.push({ label: 'Arrosage', value: data.waterNeed });
  if (data.daysToHarvest) rows.push({ label: 'Cycle', value: `${data.daysToHarvest} j de la graine à la récolte` });

  if (rows.length === 0) return null;

  return (
    <section>
      <span className="kicker">🌱 Repères culturaux</span>
      <h2 className="font-display text-3xl font-bold mt-3 mb-4 text-fg">Comment ça pousse</h2>
      <div className="card-cream grid grid-cols-1 md:grid-cols-2 gap-3">
        {rows.map((r) => (
          <div key={r.label} className="flex items-baseline gap-3">
            <div className="font-body font-bold text-sm text-fg-muted w-32 shrink-0">{r.label}</div>
            <div className="font-display text-fg">{r.value}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
