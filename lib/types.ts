export interface Category {
  id: string;
  slug: string;
  name: string;
  icon: string | null;
  parent_id: string | null;
  description: string | null;
  sort_order: number;
}

export interface Merchant {
  id: string;
  slug: string;
  name: string;
  program: 'awin' | 'effiliation' | 'amazon' | 'direct' | string;
  program_advertiser_id: string | null;
  base_url: string | null;
  logo_url: string | null;
  enabled: boolean;
}

export interface ProductMaster {
  id: string;
  slug: string;
  name: string;
  brand: string | null;
  gtin: string | null;
  category_id: string | null;
  attributes: Record<string, unknown>;
  description: string | null;
  image_url: string | null;
}

export interface Offer {
  id: string;
  product_id: string;
  merchant_id: string;
  merchant_sku: string | null;
  title: string;
  url: string;
  image_url: string | null;
  price: number | null;
  currency: string;
  in_stock: boolean;
  shipping_cost: number | null;
  last_seen_at: string;
}

export interface PricePoint {
  recorded_at: string;
  price: number;
  merchant_id: string;
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  kind: 'guide' | 'comparatif' | 'saison' | string;
  category_id: string | null;
  product_id: string | null;
  body_md: string;
  template_key: string | null;
  published_at: string;
}

/** Normalized payload from any ingest connector */
export interface NormalizedOffer {
  merchantSlug: string;
  merchantSku: string;
  title: string;
  url: string;
  imageUrl: string | null;
  price: number | null;
  currency: string;
  inStock: boolean;
  shippingCost: number | null;
  gtin: string | null;
  brand: string | null;
  categoryHint: string | null;
  raw: Record<string, unknown>;
}
