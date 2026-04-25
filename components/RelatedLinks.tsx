import Link from 'next/link';
import { MONTHS } from '@/lib/calendar';

interface Props {
  categorySlug: string | null;
  categoryName: string | null;
}

/**
 * "Voir aussi" footer block on product pages — internal linking boost.
 * Links to: parent category, current month sowing/harvesting, glossary,
 * and the seasonal kit landing.
 */
export function RelatedLinks({ categorySlug, categoryName }: Props) {
  const currentMonth = MONTHS[new Date().getMonth()];

  const links: { href: string; label: string; emoji: string }[] = [];
  if (categorySlug && categoryName) {
    links.push({ href: `/${categorySlug}`, label: `Toutes les ${categoryName.toLowerCase()}`, emoji: '🗂' });
  }
  links.push({ href: `/que-semer/${currentMonth.slug}`, label: `Que semer en ${currentMonth.label.toLowerCase()}`, emoji: currentMonth.emoji });
  links.push({ href: `/que-recolter/${currentMonth.slug}`, label: `Que récolter en ${currentMonth.label.toLowerCase()}`, emoji: '🧺' });
  links.push({ href: '/glossaire', label: 'Glossaire jardinier', emoji: '📚' });
  links.push({ href: '/kits', label: 'Kits potager prêts à planter', emoji: '🧺' });
  links.push({ href: '/quiz', label: 'Quiz : que planter chez moi ?', emoji: '✨' });

  return (
    <section>
      <span className="kicker">🔗 Voir aussi</span>
      <h2 className="font-display text-2xl font-bold mt-2 mb-3 text-fg">Pour aller plus loin</h2>
      <ul className="grid md:grid-cols-2 gap-2">
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="card-cream flex items-center gap-3 no-underline transition hover:-translate-y-0.5 hover:shadow-leaf"
            >
              <span aria-hidden className="text-2xl">{l.emoji}</span>
              <span className="font-body font-bold text-sm text-fg">{l.label}</span>
              <span className="ml-auto text-fg-subtle">→</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
