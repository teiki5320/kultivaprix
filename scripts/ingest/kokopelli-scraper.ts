/**
 * Scraper Kokopelli — Association Kokopelli ne fait pas d'affiliation.
 * On scrape respectueusement le catalogue public (respect robots.txt,
 * 1 req/2s, User-Agent identifié).
 *
 * !! À utiliser uniquement si le site autorise le crawl (cf robots.txt
 *    https://kokopelli-semences.fr/robots.txt). Désactive ce scraper si
 *    tu reçois une demande de l'éditeur.
 */
import { chromium as playwrightChromium, type Page } from 'playwright';
import { addExtra } from 'playwright-extra';
// @ts-expect-error puppeteer-extra-plugin-stealth ships CommonJS without types
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

const chromium = addExtra(playwrightChromium);
chromium.use(StealthPlugin());
import { ingestBatch, log } from './_shared';
import type { NormalizedOffer } from '../../lib/types';

const BASE = 'https://kokopelli-semences.fr';
const SEED_URLS = [
  `${BASE}/fr/c/semences/potageres`,
  `${BASE}/fr/c/semences/medicinales-aromatiques-et-florales`,
];
const DELAY_MS = 2000;

async function scrapeCategory(page: Page, url: string): Promise<NormalizedOffer[]> {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(4000);

  // Diagnostic : qu'est-ce qui est réellement chargé ?
  const diag = await page.evaluate(() => ({
    title: document.title,
    bodyLen: document.body?.innerText?.length ?? 0,
    anyArticle: document.querySelectorAll('article').length,
    firstArticleHTML: (document.querySelector('article')?.outerHTML ?? '').slice(0, 1500),
  }));
  log('kokopelli', `  diag: title="${diag.title.slice(0, 60)}" bodyLen=${diag.bodyLen} article=${diag.anyArticle}`);
  log('kokopelli', `  firstArticle="${diag.firstArticleHTML.replace(/\s+/g, ' ').slice(0, 1500)}"`);

  const offers = await page.$$eval('article.product-miniature, .product-miniature, .js-product-miniature', (cards) =>
    cards.map((c) => {
      const a = (c.querySelector('a.product-thumbnail') ?? c.querySelector('a')) as HTMLAnchorElement | null;
      const title = (c.querySelector('.product-title') ?? c.querySelector('h2, h3'))?.textContent?.trim() ?? '';
      const priceTxt = (c.querySelector('.product-price-and-shipping .price') ?? c.querySelector('.price'))?.textContent?.trim() ?? '';
      const img = c.querySelector('img') as HTMLImageElement | null;
      const sku = c.getAttribute('data-id-product') ?? a?.href?.split('/')?.pop() ?? '';
      return {
        url: a?.href ?? '',
        title,
        priceTxt,
        img: img?.src ?? null,
        sku,
      };
    }),
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
    process.env.SCRAPER_USER_AGENT ??
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';
  const browser = await chromium.launch({ headless: !headful });
  const ctx = await browser.newContext({
    userAgent,
    locale: 'fr-FR',
    viewport: { width: 1280, height: 900 },
  });
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
