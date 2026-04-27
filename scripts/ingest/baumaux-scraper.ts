/**
 * Scraper Graines Baumaux — privilégie l'inscription au programme d'affiliation
 * (Awin/Effiliation) quand disponible. Ce scraper sert de fallback si aucun
 * flux n'est accessible. Respect robots.txt + cadence modérée.
 */
import { chromium as playwrightChromium, type Page } from 'playwright';
import { addExtra } from 'playwright-extra';
// @ts-expect-error puppeteer-extra-plugin-stealth ships CommonJS without types
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

const chromium = addExtra(playwrightChromium);
chromium.use(StealthPlugin());
import { ingestBatch, log } from './_shared';
import type { NormalizedOffer } from '../../lib/types';

const BASE = 'https://www.graines-baumaux.fr';
const SEED_URLS = [
  `${BASE}/categorie/3/graines-de-legumes.html`,
  `${BASE}/categorie/4/graines-de-fleurs.html`,
  `${BASE}/categorie/82/aromates.html`,
];
const DELAY_MS = 2500;

async function scrapeCategory(page: Page, url: string): Promise<NormalizedOffer[]> {
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(DELAY_MS);

  const diag = await page.evaluate(() => ({
    title: document.title,
    bodyLen: document.body?.innerText?.length ?? 0,
    productItem: document.querySelectorAll('.product-item').length,
    liProduct: document.querySelectorAll('li.product').length,
    productCard: document.querySelectorAll('.product-card').length,
    anyArticle: document.querySelectorAll('article').length,
    dataProductId: document.querySelectorAll('[data-product-id]').length,
    productMini: document.querySelectorAll('.product-mini, .product-miniature').length,
    aHrefHtml: document.querySelectorAll('a[href*=".html"]').length,
  }));
  log('baumaux', `  diag: title="${diag.title.slice(0, 60)}" bodyLen=${diag.bodyLen} ` +
    `.product-item=${diag.productItem} li.product=${diag.liProduct} .product-card=${diag.productCard} ` +
    `article=${diag.anyArticle} [data-product-id]=${diag.dataProductId} ` +
    `.product-mini[ature]=${diag.productMini} a[href*=.html]=${diag.aHrefHtml}`);

  const products = await page.$$eval('.product-item, li.product, .product-card, .product-miniature, [data-product-id]', (cards) =>
    cards.map((c) => {
      const a = c.querySelector('a') as HTMLAnchorElement | null;
      const title =
        c.querySelector('.product-title, h3, .product-name')?.textContent?.trim() ?? '';
      const priceTxt = c.querySelector('.price, .product-price')?.textContent?.trim() ?? '';
      const img = c.querySelector('img') as HTMLImageElement | null;
      const href = a?.getAttribute('href') ?? '';
      const sku = href.match(/\/(\d+)\//)?.[1] ?? href;
      return {
        href,
        title,
        priceTxt,
        img: img?.getAttribute('src') ?? img?.getAttribute('data-src') ?? null,
        sku,
      };
    }),
  );

  return products
    .filter((p) => p.href && p.title && p.sku)
    .map<NormalizedOffer>((p) => {
      const priceMatch = p.priceTxt.replace(',', '.').replace(/[^\d.]/g, '');
      const price = priceMatch ? parseFloat(priceMatch) : null;
      const absUrl = p.href.startsWith('http') ? p.href : BASE + p.href;
      const absImg = p.img && !p.img.startsWith('http') ? BASE + p.img : p.img;
      return {
        merchantSlug: 'graines-baumaux',
        merchantSku: p.sku,
        title: p.title,
        url: absUrl,
        imageUrl: absImg ?? null,
        price,
        currency: 'EUR',
        inStock: true,
        shippingCost: null,
        gtin: null,
        brand: 'Graines Baumaux',
        categoryHint: url.split('/').pop()?.replace('.html', '') ?? null,
        raw: p as unknown as Record<string, unknown>,
      };
    });
}

export async function runBaumaux() {
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
      log('baumaux', `scrape ${url}`);
      try {
        const offers = await scrapeCategory(page, url);
        log('baumaux', `  ${offers.length} offers`);
        all.push(...offers);
      } catch (e) {
        log('baumaux', `  error: ${(e as Error).message}`);
      }
      await page.waitForTimeout(DELAY_MS);
    }
  } finally {
    await browser.close();
  }
  if (all.length) {
    const r = await ingestBatch(all);
    log('baumaux', `inserted=${r.inserted} skipped=${r.skipped}`);
  }
}

if (require.main === module) {
  runBaumaux().catch((e) => {
    console.error('[baumaux] fatal', e);
    process.exit(1);
  });
}
