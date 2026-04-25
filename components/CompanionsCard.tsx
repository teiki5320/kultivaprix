import { findCompanions } from '@/lib/companions';

export function CompanionsCard({ name }: { name: string }) {
  const c = findCompanions(name);
  if (!c) return null;

  return (
    <section>
      <span className="kicker">🤝 Compagnonnage</span>
      <h2 className="font-display text-3xl font-bold mt-3 mb-4 text-fg">
        Avec qui le planter ?
      </h2>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="card-cream" style={{ background: 'color-mix(in oklab, var(--brand) 10%, white)' }}>
          <h3 className="font-display font-bold text-lg" style={{ color: 'var(--brand-dark)' }}>
            ✅ Bonnes associations
          </h3>
          <ul className="font-body text-fg mt-2 space-y-1">
            {c.good.map((g) => (
              <li key={g}>· {g}</li>
            ))}
          </ul>
        </div>
        <div className="card-cream" style={{ background: 'color-mix(in oklab, var(--terracotta-deep) 10%, white)' }}>
          <h3 className="font-display font-bold text-lg" style={{ color: 'var(--terracotta-deep)' }}>
            🚫 À éviter
          </h3>
          {c.bad.length === 0 ? (
            <p className="font-body text-fg-muted text-sm mt-2">Pas d&apos;incompatibilité notable.</p>
          ) : (
            <ul className="font-body text-fg mt-2 space-y-1">
              {c.bad.map((b) => (
                <li key={b}>· {b}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
