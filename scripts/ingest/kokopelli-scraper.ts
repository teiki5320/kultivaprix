/**
 * Scraper Kokopelli — Association Kokopelli ne fait pas d'affiliation.
 * On scrape respectueusement le catalogue public (respect robots.txt,
 * 1 req/2s, User-Agent identifié).
 *
 * !! À utiliser uniquement si le site autorise le crawl (cf robots.txt
 *    https://kokopelli-semences.fr/robots.txt). Désactive ce scraper si
 *    tu reçois une demande de l'éditeur.
 */
import { chromium, type Page } from 'playwright';
import { ingestBatch, log } from './_shared';
import type { NormalizedOffer } from '../../lib/types';

const BASE = 'https://kokopelli-semences.fr';
const SEED_URLS = [
  `${BASE}/fr/15-graines-de-tomates`,
  `${BASE}/fr/16-graines-de-salades`,
  `${BASE}/fr/17-graines-de-courges`,
  `${BASE}/fr/18-graines-aromatiques`,
];
const DELAY_MS = 2000;

async function scrapeCategory(page: Page, url: string): Promise<NormalizedOffer[]> {
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(DELAY_MS);

  const offers = await page.$$eval('article.product-miniature', (cards, base) =>
    cards.map((c) => {
      const a = c.querySelector('a.product-thumbnail') as HTMLAnchorElement | null;
      const title = c.querySelector('.product-title')?.textContent?.trim() ?? '';
      const priceTxt = c.querySelector('.product-price-and-shipping .price')?.textContent?.trim() ?? '';
      const img = c.querySelector('img') as HTMLImageElement | null;
      const sku = c.getAttribute('data-id-product') ?? a?.href?.split('/')?.pop() ?? '';
      return {
        url: a?.href ?? '',
        title,
        priceTxt,
        img: img?.src ?? null,
        sku,
      };
    }, BASE),
  );

  return offers
    .filter((o) => o.url && o.title && o.sku)
    .map<NormalizedOffer>((o) => {
      const priceMatch = o.priceTxt.replace(',', '.').match(/[\d.]+/);
      const price = priceMatch ? parseFloat(priceMatch[0]) : null;
      return {
        merchantSlug: 'kokopelli',
        merchantSku: o.sku,
        title: o.title,
        url: o.url,
        imageUrl: o.img,
        price,
        currency: 'EUR',
        inStock: true,
        shippingCost: null,
        gtin: null,
        brand: 'Kokopelli',
        categoryHint: url.split('/').pop() ?? null,
        raw: o as unknown as Record<string, unknown>,
      };
    });
}

export async function runKokopelli() {
  const headful = process.env.PLAYWRIGHT_HEADFUL === 'true';
  const userAgent =
    process.env.SCRAPER_USER_AGENT ?? 'KultivaprixBot/0.1 (+https://kultivaprix.com/bot)';
  const browser = await chromium.launch({ headless: !headful });
  const ctx = await browser.newContext({ userAgent });
  const page = await ctx.newPage();
  const all: NormalizedOffer[] = [];
  try {
    for (const url of SEED_URLS) {
      log('kokopelli', `scrape ${url}`);
      try {
        const offers = await scrapeCategory(page, url);
        log('kokopelli', `  ${offers.length} offers`);
        all.push(...offers);
      } catch (e) {
        log('kokopelli', `  error: ${(e as Error).message}`);
      }
      await page.waitForTimeout(DELAY_MS);
    }
  } finally {
    await browser.close();
  }
  if (all.length) {
    const r = await ingestBatch(all);
    log('kokopelli', `inserted=${r.inserted} skipped=${r.skipped}`);
  }
}

if (require.main === module) {
  runKokopelli().catch((e) => {
    console.error('[kokopelli] fatal', e);
    process.exit(1);
  });
}
