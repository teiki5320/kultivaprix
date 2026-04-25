/**
 * Static placeholder for "Ils ont planté ça ce mois-ci".
 *
 * The plan is to back this with an aggregate query against the Kultiva
 * app's anonymised plant-events feed. Until that endpoint is available
 * (env KULTIVA_AGGREGATES_URL), we render a curated card so the slot
 * isn't empty and the layout/SEO is in place.
 */
export function PlantedThisMonth() {
  return (
    <section
      className="rounded-bubble p-6"
      style={{
        background: 'linear-gradient(135deg, #FFE7A0 0%, #BCE5C1 100%)',
      }}
    >
      <span className="kicker">🌍 Communauté Kultiva</span>
      <h3 className="font-display text-2xl font-bold text-fg mt-2">
        Ils ont planté ça ce mois-ci
      </h3>
      <p className="font-body text-fg/80 max-w-xl mt-2 leading-relaxed">
        Bientôt : la liste anonymisée des variétés que la communauté Kultiva
        plante en ce moment, agrégée depuis l&apos;application. Tendances par
        région, popularité par mois.
      </p>
      <p className="font-body text-fg-subtle text-xs mt-3 italic">
        Module en cours de branchement avec l&apos;app — les chiffres sont publiés
        dès qu&apos;une masse anonymisable est atteinte (≥ 30 jardins par maille).
      </p>
    </section>
  );
}
