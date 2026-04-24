/**
 * Amazon Partenaires — Product Advertising API 5.0
 *
 * On utilise SearchItems avec des mots-clés pertinents (graines, semences,
 * outillage de jardin) et un BrowseNode "Jardin" (ID FR : 2454169031 "Jardin").
 *
 * Doc signature AWS v4 :
 *   https://webservices.amazon.com/paapi5/documentation/sending-request.html
 *
 * On signe manuellement pour éviter une dépendance lourde. L'implémentation
 * ci-dessous couvre l'opération SearchItems.
 */
import crypto from 'node:crypto';
import { ingestBatch, log, requiredEnv } from './_shared';
import type { NormalizedOffer } from '../../lib/types';

const SERVICE = 'ProductAdvertisingAPI';
const OPERATION = 'SearchItems';
const KEYWORDS = [
  'graines potager',
  'graines bio',
  'plants tomates',
  'sécateur jardin',
  'terreau potager',
  'semences fleurs',
];

interface PaapiItem {
  ASIN: string;
  DetailPageURL: string;
  ItemInfo?: {
    Title?: { DisplayValue: string };
    ByLineInfo?: { Brand?: { DisplayValue: string }; Manufacturer?: { DisplayValue: string } };
    ExternalIds?: { EANs?: { DisplayValues?: string[] } };
    Classifications?: { Binding?: { DisplayValue: string }; ProductGroup?: { DisplayValue: string } };
  };
  Images?: { Primary?: { Large?: { URL: string } } };
  Offers?: {
    Listings?: Array<{
      Price?: { Amount: number; Currency: string };
      Availability?: { Message: string };
    }>;
  };
}

function sign(
  accessKey: string,
  secretKey: string,
  host: string,
  region: string,
  payload: string,
  target: string,
): { headers: Record<string, string>; body: string } {
  const amzDate = new Date().toISOString().replace(/[:-]|\.\d{3}/g, '');
  const dateStamp = amzDate.slice(0, 8);

  const canonicalHeaders =
    `content-encoding:amz-1.0\n` +
    `content-type:application/json; charset=utf-8\n` +
    `host:${host}\n` +
    `x-amz-date:${amzDate}\n` +
    `x-amz-target:${target}\n`;
  const signedHeaders = 'content-encoding;content-type;host;x-amz-date;x-amz-target';
  const payloadHash = crypto.createHash('sha256').update(payload).digest('hex');

  const canonicalRequest =
    `POST\n/paapi5/searchitems\n\n${canonicalHeaders}\n${signedHeaders}\n${payloadHash}`;

  const algorithm = 'AWS4-HMAC-SHA256';
  const credentialScope = `${dateStamp}/${region}/${SERVICE}/aws4_request`;
  const stringToSign = `${algorithm}\n${amzDate}\n${credentialScope}\n${crypto
    .createHash('sha256')
    .update(canonicalRequest)
    .digest('hex')}`;

  const kDate = crypto.createHmac('sha256', 'AWS4' + secretKey).update(dateStamp).digest();
  const kRegion = crypto.createHmac('sha256', kDate).update(region).digest();
  const kService = crypto.createHmac('sha256', kRegion).update(SERVICE).digest();
  const kSigning = crypto.createHmac('sha256', kService).update('aws4_request').digest();
  const signature = crypto.createHmac('sha256', kSigning).update(stringToSign).digest('hex');

  const authorization = `${algorithm} Credential=${accessKey}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  return {
    headers: {
      'Content-Encoding': 'amz-1.0',
      'Content-Type': 'application/json; charset=utf-8',
      Host: host,
      'X-Amz-Date': amzDate,
      'X-Amz-Target': target,
      Authorization: authorization,
    },
    body: payload,
  };
}

async function searchItems(keyword: string): Promise<PaapiItem[]> {
  const accessKey = requiredEnv('AMAZON_PA_ACCESS_KEY');
  const secretKey = requiredEnv('AMAZON_PA_SECRET_KEY');
  const tag = requiredEnv('AMAZON_PA_PARTNER_TAG');
  const host = process.env.AMAZON_PA_HOST ?? 'webservices.amazon.fr';
  const region = process.env.AMAZON_PA_REGION ?? 'eu-west-1';

  const payload = JSON.stringify({
    Keywords: keyword,
    Resources: [
      'Images.Primary.Large',
      'ItemInfo.Title',
      'ItemInfo.ByLineInfo',
      'ItemInfo.ExternalIds',
      'ItemInfo.Classifications',
      'Offers.Listings.Price',
      'Offers.Listings.Availability.Message',
    ],
    PartnerTag: tag,
    PartnerType: 'Associates',
    Marketplace: 'www.amazon.fr',
    BrowseNodeId: '2454169031', // Jardin (FR)
  });

  const { headers, body } = sign(
    accessKey,
    secretKey,
    host,
    region,
    payload,
    'com.amazon.paapi5.v1.ProductAdvertisingAPIv1.SearchItems',
  );

  const res = await fetch(`https://${host}/paapi5/searchitems`, {
    method: 'POST',
    headers,
    body,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PAAPI ${res.status}: ${text.slice(0, 300)}`);
  }
  const json = await res.json();
  return json.SearchResult?.Items ?? [];
}

function toOffer(item: PaapiItem): NormalizedOffer | null {
  const listing = item.Offers?.Listings?.[0];
  const price = listing?.Price?.Amount ?? null;
  const availability = listing?.Availability?.Message ?? '';
  return {
    merchantSlug: 'amazon-fr',
    merchantSku: item.ASIN,
    title: item.ItemInfo?.Title?.DisplayValue ?? item.ASIN,
    url: item.DetailPageURL,
    imageUrl: item.Images?.Primary?.Large?.URL ?? null,
    price,
    currency: listing?.Price?.Currency ?? 'EUR',
    inStock: /en stock|in stock|disponible/i.test(availability),
    shippingCost: null,
    gtin: item.ItemInfo?.ExternalIds?.EANs?.DisplayValues?.[0] ?? null,
    brand: item.ItemInfo?.ByLineInfo?.Brand?.DisplayValue ?? null,
    categoryHint: item.ItemInfo?.Classifications?.ProductGroup?.DisplayValue ?? null,
    raw: item as unknown as Record<string, unknown>,
  };
}

export async function runAmazon() {
  const all: NormalizedOffer[] = [];
  for (const kw of KEYWORDS) {
    log('amazon', `SearchItems "${kw}"`);
    try {
      const items = await searchItems(kw);
      const offers = items.map(toOffer).filter((o): o is NormalizedOffer => !!o);
      log('amazon', `  ${offers.length} offers`);
      all.push(...offers);
      // PAAPI TPS limit — 1 req/sec pour débutants
      await new Promise((r) => setTimeout(r, 1200));
    } catch (e) {
      log('amazon', `  error: ${(e as Error).message}`);
    }
  }
  if (all.length) {
    const res = await ingestBatch(all);
    log('amazon', `inserted=${res.inserted} skipped=${res.skipped}`);
  }
}

if (require.main === module) {
  runAmazon().catch((e) => {
    console.error('[amazon] fatal', e);
    process.exit(1);
  });
}
