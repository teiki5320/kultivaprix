import type { EcoScore } from '@/lib/eco-score';
import { ECO_GRADE_META } from '@/lib/eco-score';

export function EcoScoreBadge({ score }: { score: EcoScore }) {
  const meta = ECO_GRADE_META[score.grade];
  return (
    <details className="rounded-xl bg-white/70 px-4 py-3 cursor-pointer select-none border border-cream group">
      <summary className="flex items-center gap-3 list-none">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center font-display font-bold text-base shrink-0"
          style={{ background: meta.bg, color: meta.fg }}
          aria-label={`Eco-score : ${score.grade}, ${meta.label}`}
        >
          {score.grade}
        </div>
        <div className="flex-1">
          <div className="font-display font-bold text-fg">Score éco · {meta.label}</div>
          <div className="font-body text-xs text-fg-muted">
            Heuristique basée sur bio, origine, reproductibilité.
          </div>
        </div>
        <span className="text-fg-subtle text-xs group-open:rotate-180 transition">▾</span>
      </summary>
      <ul className="mt-3 space-y-1 font-body text-sm text-fg pl-12">
        {score.reasons.length === 0 && (
          <li className="text-fg-muted italic">Aucun signal détecté dans le titre / la marque.</li>
        )}
        {score.reasons.map((r) => (
          <li key={r}>· {r}</li>
        ))}
      </ul>
    </details>
  );
}
