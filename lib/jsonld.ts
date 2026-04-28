/**
 * JSON-LD builders. Pure data → object literals; the page injects them
 * into a <script type="application/ld+json"> tag.
 */
import { SITE_URL } from './utils';

export interface Crumb {
  name: string;
  href: string;
}

/** BreadcrumbList — surfaced as the breadcrumb in the SERP. */
export function breadcrumbLd(crumbs: Crumb[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: `${SITE_URL}${c.href}`,
    })),
  };
}

/** Organization — declared once in the layout. */
export function organizationLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Kultivaprix',
    url: SITE_URL,
    logo: `${SITE_URL}/icon`,
    sameAs: ['https://kultiva.app'],
  };
}

/** WebSite — déclaré dans le layout. */
export function websiteLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Kultivaprix',
    url: SITE_URL,
    inLanguage: 'fr-FR',
  };
}

/** ItemList — for category & seasonal landings. */
export function itemListLd(name: string, items: { slug: string; name: string }[], baseUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    itemListElement: items.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `${SITE_URL}${baseUrl}${p.slug}`,
      name: p.name,
    })),
  };
}
