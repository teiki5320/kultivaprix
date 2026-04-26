import { Fragment } from 'react';

/**
 * Two-column key/value card matching Kultiva's "Semis", "Culture" sections.
 */
interface Props {
  icon: string;
  title: string;
  rows: { label: string; value: string | null | undefined }[];
}

export function SpeciesKeyValueCard({ icon, title, rows }: Props) {
  const visible = rows.filter((r) => r.value && String(r.value).trim().length > 0);
  if (visible.length === 0) return null;
  return (
    <section className="card-cream">
      <h2 className="font-display font-bold text-xl text-fg mb-3">
        <span aria-hidden className="mr-2">{icon}</span>
        {title}
      </h2>
      <dl className="grid grid-cols-[120px_1fr] gap-y-2 gap-x-4 font-body text-sm">
        {visible.map((r) => (
          <Fragment key={r.label}>
            <dt className="text-fg-muted">{r.label}</dt>
            <dd className="text-fg">{r.value}</dd>
          </Fragment>
        ))}
      </dl>
    </section>
  );
}
