/**
 * Search wrapper — tries the trigram-based RPC `search_products` first,
 * falls back to a plain ILIKE if the migration hasn't been applied yet.
 *
 * Returns the same shape both ways so the caller doesn't care.
 */
import { supabase } from './supabase';

export interface SearchHit {
  id: string;
  slug: string;
  name: string;
  image_url: string | null;
  brand: string | null;
  min_price: number | null;
  offer_count: number;
}

export async function searchProducts(q: string, limit = 24): Promise<SearchHit[]> {
  const trimmed = q.trim();
  if (!trimmed) return [];

  // Preferred: trigram RPC
  const { data: rpcData, error: rpcError } = await supabase.rpc('search_products', {
    q: trimmed,
    p_limit: limit,
  });
  if (!rpcError && Array.isArray(rpcData)) {
    return rpcData.map((r: any) => ({
      id: r.id,
      slug: r.slug,
      name: r.name,
      image_url: r.image_url,
      brand: r.brand,
      min_price: r.min_price != null ? Number(r.min_price) : null,
      offer_count: r.offer_count ?? 0,
    }));
  }

  // Fallback: ILIKE join
  const { data } = await supabase
    .from('products_master')
    .select('id, slug, name, image_url, brand, offers(price, merchant_id)')
    .ilike('name', `%${trimmed}%`)
    .not('slug', 'like', 'tmp-%')
    .limit(limit);

  return (data ?? []).map((p: any) => {
    const prices = (p.offers ?? []).map((o: any) => o.price).filter((n: number) => typeof n === 'number');
    const merchants = new Set((p.offers ?? []).map((o: any) => o.merchant_id));
    return {
      id: p.id,
      slug: p.slug,
      name: p.name,
      image_url: p.image_url,
      brand: p.brand ?? null,
      min_price: prices.length ? Math.min(...prices) : null,
      offer_count: merchants.size,
    };
  });
}

export interface SimilarHit {
  slug: string;
  name: string;
  image_url: string | null;
  min_price: number | null;
  offer_count: number;
}

export async function similarProducts(slug: string, limit = 6): Promise<SimilarHit[]> {
  const { data, error } = await supabase.rpc('similar_products', {
    p_slug: slug,
    p_limit: limit,
  });
  if (!error && Array.isArray(data)) {
    return data.map((r: any) => ({
      slug: r.slug,
      name: r.name,
      image_url: r.image_url,
      min_price: r.min_price != null ? Number(r.min_price) : null,
      offer_count: r.offer_count ?? 0,
    }));
  }
  // Fallback: same first word
  const { data: target } = await supabase
    .from('products_master')
    .select('id, name')
    .eq('slug', slug)
    .single();
  if (!target) return [];
  const firstWord = (target as any).name.split(/\s+/)[0];
  const { data: hits } = await supabase
    .from('products_master')
    .select('slug, name, image_url, offers(price, merchant_id)')
    .ilike('name', `%${firstWord}%`)
    .neq('id', (target as any).id)
    .not('slug', 'like', 'tmp-%')
    .limit(limit);
  return (hits ?? []).map((p: any) => {
    const prices = (p.offers ?? []).map((o: any) => o.price).filter((n: number) => typeof n === 'number');
    const merchants = new Set((p.offers ?? []).map((o: any) => o.merchant_id));
    return {
      slug: p.slug,
      name: p.name,
      image_url: p.image_url,
      min_price: prices.length ? Math.min(...prices) : null,
      offer_count: merchants.size,
    };
  });
}
