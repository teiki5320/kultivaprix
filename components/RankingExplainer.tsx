/**
 * Anti-dark-pattern: a small disclosure that explains, in plain French,
 * how the price table is sorted (cheapest first, no sponsored placement).
 */
export function RankingExplainer() {
  return (
    <details className="group rounded-xl bg-white/70 px-4 py-3 cursor-pointer select-none border border-cream">
      <summary className="font-body font-bold text-sm text-fg-muted list-none flex items-center justify-between">
        <span className="flex items-center gap-2">
          <span aria-hidden>ℹ️</span> Pourquoi ce classement&nbsp;?
        </span>
        <span className="text-fg-subtle text-xs group-open:rotate-180 transition">▾</span>
      </summary>
      <div className="font-body text-sm text-fg-muted leading-relaxed mt-2 space-y-1.5">
        <p>
          Les offres sont triées <strong>du prix le moins cher au plus cher</strong>.
          Aucun marchand ne paie pour apparaître plus haut.
        </p>
        <p>
          Les liens marchands sont des liens d&apos;affiliation : ils financent le site
          mais ne changent ni le prix ni le classement.
        </p>
        <p className="text-fg-subtle text-xs">
          Prix mis à jour automatiquement plusieurs fois par jour depuis les flux officiels.
        </p>
      </div>
    </details>
  );
}
