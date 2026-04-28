'use client';

import { useState, useTransition } from 'react';
import { publishArticle, type PublishResult } from './actions';

export function PublierForm() {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<PublishResult | null>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await publishArticle(null, formData);
      setResult(res);
    });
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <Field label="Titre" hint="Max 120 caractères">
        <input
          name="title"
          type="text"
          required
          maxLength={120}
          className="w-full rounded-xl border-2 border-cream bg-white px-3 py-2.5 font-body text-fg focus:outline-none focus:border-brand"
        />
      </Field>

      <Field
        label="Slug (optionnel)"
        hint="Si vide, généré depuis le titre. Pas d'accents ni d'espaces — utilisé dans l'URL /actualite/<slug>."
      >
        <input
          name="slug"
          type="text"
          maxLength={80}
          pattern="[a-z0-9-]+"
          placeholder="ex: tomates-juin-2026"
          className="w-full rounded-xl border-2 border-cream bg-white px-3 py-2.5 font-body text-fg focus:outline-none focus:border-brand"
        />
      </Field>

      <Field label="Résumé / chapeau" hint="1 à 2 phrases qui apparaissent dans la liste et en lead. Max 320 caractères.">
        <textarea
          name="excerpt"
          required
          rows={3}
          maxLength={320}
          className="w-full rounded-xl border-2 border-cream bg-white px-3 py-2.5 font-body text-fg focus:outline-none focus:border-brand"
        />
      </Field>

      <Field
        label="Corps de l'article"
        hint="Markdown supporté : ## titre, ### sous-titre, **gras**, *italique*, [lien](url), - liste, > citation, ![alt](url-image)."
      >
        <textarea
          name="body"
          required
          rows={14}
          className="w-full rounded-xl border-2 border-cream bg-white px-3 py-2.5 font-body text-fg focus:outline-none focus:border-brand font-mono text-sm"
        />
      </Field>

      <Field label="Image hero" hint="JPG ou PNG, max 5 MB. Format recommandé 16:9 (ex 1600×900).">
        <input
          name="image"
          type="file"
          required
          accept="image/jpeg,image/png,image/webp"
          className="w-full font-body text-sm"
        />
      </Field>

      <Field label="URL vidéo (optionnel)" hint="Lien YouTube → embed automatique. Autres → bouton 'Voir la vidéo'.">
        <input
          name="video_url"
          type="url"
          placeholder="https://www.youtube.com/watch?v=..."
          className="w-full rounded-xl border-2 border-cream bg-white px-3 py-2.5 font-body text-fg focus:outline-none focus:border-brand"
        />
      </Field>

      <Field label="Tags" hint="Séparés par virgules. Ex : saison, tomates, été.">
        <input
          name="tags"
          type="text"
          placeholder="saison, debutant, mai"
          className="w-full rounded-xl border-2 border-cream bg-white px-3 py-2.5 font-body text-fg focus:outline-none focus:border-brand"
        />
      </Field>

      {result && !result.ok && (
        <div className="rounded-xl bg-rose-100 border-2 border-rose-300 px-4 py-3 font-body text-sm text-rose-900">
          ❌ {result.error}
        </div>
      )}

      <div>
        <button
          type="submit"
          disabled={isPending}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? 'Publication…' : 'Publier l’article'}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="font-body font-bold text-sm text-fg">{label}</span>
      {hint && (
        <span className="block font-body text-xs text-fg-muted mt-0.5 mb-1.5">{hint}</span>
      )}
      <div className="mt-1">{children}</div>
    </label>
  );
}
