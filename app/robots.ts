import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/utils';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin',
          '/admin/',
          '/amb/',
          '/desinscription',
          '/panier',
          '/panier/',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
