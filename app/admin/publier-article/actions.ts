'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { toSlug } from '@/lib/utils';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function adminClient() {
  if (!SUPABASE_URL || !SERVICE_KEY) {
    throw new Error(
      'Supabase admin manquant : NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY non défini.',
    );
  }
  return createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { persistSession: false },
    db: { schema: 'public' },
  });
}

export type PublishResult =
  | { ok: true; slug: string }
  | { ok: false; error: string };

export async function publishArticle(_prev: unknown, formData: FormData): Promise<PublishResult> {
  try {
    const title = (formData.get('title') as string ?? '').trim();
    const slugInput = (formData.get('slug') as string ?? '').trim();
    const excerpt = (formData.get('excerpt') as string ?? '').trim();
    const body = (formData.get('body') as string ?? '').trim();
    const videoUrl = (formData.get('video_url') as string ?? '').trim() || null;
    const tags = (formData.get('tags') as string ?? '')
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);
    const image = formData.get('image') as File | null;

    // Validation
    if (!title) return { ok: false, error: 'Titre requis.' };
    if (title.length > 120) return { ok: false, error: 'Titre trop long (max 120).' };
    if (!excerpt) return { ok: false, error: 'Résumé requis.' };
    if (excerpt.length > 320) return { ok: false, error: 'Résumé trop long (max 320).' };
    if (!body) return { ok: false, error: 'Corps de l’article requis.' };
    if (!image || image.size === 0) return { ok: false, error: 'Image requise.' };
    if (image.size > 5 * 1024 * 1024) {
      return { ok: false, error: 'Image trop lourde (max 5 MB).' };
    }

    const slug = (slugInput || toSlug(title)).slice(0, 80);
    if (!slug) return { ok: false, error: 'Slug invalide.' };

    const admin = adminClient();

    // Vérifier que le slug n'existe pas déjà
    const { data: existing } = await admin
      .from('articles')
      .select('slug')
      .eq('slug', slug)
      .maybeSingle();
    if (existing) {
      return { ok: false, error: `Le slug "${slug}" existe déjà — change le titre ou le slug.` };
    }

    // Upload image
    const ext = (image.name.split('.').pop() ?? 'jpg').toLowerCase();
    const imagePath = `articles/${slug}.${ext}`;
    const arrayBuffer = await image.arrayBuffer();
    const { error: uploadErr } = await admin.storage
      .from('news-images')
      .upload(imagePath, new Uint8Array(arrayBuffer), {
        contentType: image.type || 'image/jpeg',
        upsert: true,
      });
    if (uploadErr) {
      return { ok: false, error: `Upload image échoué : ${uploadErr.message}` };
    }
    const { data: pub } = admin.storage.from('news-images').getPublicUrl(imagePath);

    // Insert article
    const { error: dbErr } = await admin.from('articles').insert({
      slug,
      title,
      excerpt,
      body,
      image_url: pub.publicUrl,
      video_url: videoUrl,
      tags,
    });
    if (dbErr) {
      return { ok: false, error: `Insert échoué : ${dbErr.message}` };
    }

    revalidatePath('/actualites');
    revalidatePath(`/actualite/${slug}`);
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Erreur inattendue.',
    };
  }

  // Redirige hors du try/catch (redirect() throw une exception interne).
  const slug = ((formData.get('slug') as string) || toSlug((formData.get('title') as string) ?? ''))
    .slice(0, 80);
  redirect(`/actualite/${slug}`);
}
