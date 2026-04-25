import Link from 'next/link';
import { breadcrumbLd, type Crumb } from '@/lib/jsonld';

/**
 * Visible breadcrumb + matching JSON-LD in one drop-in component.
 * Pure server component — no client JS, no layout shift.
 */
export function Breadcrumbs({ crumbs }: { crumbs: Crumb[] }) {
  if (crumbs.length === 0) return null;
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd(crumbs)) }}
      />
      <nav aria-label="Fil d'Ariane" className="font-body text-sm text-fg-muted">
        <ol className="flex flex-wrap items-center gap-1">
          {crumbs.map((c, i) => (
            <li key={c.href} className="flex items-center gap-1">
              {i > 0 && <span aria-hidden className="text-fg-subtle">›</span>}
              {i === crumbs.length - 1 ? (
                <span aria-current="page" className="font-bold text-fg">{c.name}</span>
              ) : (
                <Link href={c.href} className="hover:underline">{c.name}</Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
