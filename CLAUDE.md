# CLAUDE.md — Kultivaprix

Instructions de travail pour toute session Claude (chat ou Claude Code) dans ce repo.

## Identité du projet

Kultivaprix est le **companion web de l'app mobile Kultiva** — l'étal en grand sur ordinateur, le calendrier de semis, le bilan du jardin. Branché à l'app mobile via la table partagée `public.species`.

**Ce que c'est** : un site éditorial Next.js 14 (App Router) + Supabase + Tailwind, déployé sur Vercel à kultivaprix.com.

**Ce que ce n'est plus** : un comparateur de prix marchand. Le scaffolding original a été démoli (commit `c150f71` « phase 1: tear down comparator scaffolding » et suivants). Toute mention résiduelle de « comparateur de prix » dans la copy ou les meta est un vestige à corriger.

## Stack et structure

- Next.js 14 App Router, TypeScript strict, Tailwind v3
- Supabase pour les données (project ref `vkiwkeknfzwdvufcqbrp`)
  - Schéma `public` : table `species` (98 fiches, source = app Kultiva, sync auto)
  - Schéma `kultivaprix` : tables internes `articles`, etc.
- Le dossier projet vit à `~/Code/kultivaprix/` sur le Mac de référence (Mac-mini-de-Jean)
- Les assets statiques sont dans `public/` (logo `logokprix.PNG`, screenshots app, etc.)

## Hygiène de docs — à respecter à la fin de toute session significative

Si la session a modifié le code de façon structurante (nouvelle page, refonte, suppression de feature, changement d'architecture, nouvelle intégration externe), faire **un commit séparé** dédié à la mise à jour des docs :

1. Mettre à jour `_plans/roadmap.md`
   - Déplacer les items entre les sections « ✅ Fait » / « 🔥 En cours » / « 📋 À faire »
   - Mettre à jour la date `> Dernière mise à jour : YYYY-MM-DD`
2. Si la stack ou l'architecture a changé, mettre à jour `README.md`
3. Commit séparé du code, message du genre `docs: refresh roadmap après <feature>`

Ne pas ignorer cette étape. C'est ce qui maintient la cohérence entre le code et la doc, et évite que les nouvelles sessions partent sur une base obsolète.

## Workflow git

- Branche par défaut : `main`
- Travail direct sur `main` accepté pour les petits fixes et docs
- PR/branche pour les refontes plus larges
- Commits en français, message court à l'impératif (« retire X », « ajoute Y », « corrige Z »)

## Tonalité

- Texte produit en français, sans LLM apparent (zéro « En tant qu'IA », zéro emoji parasite)
- Ton chaleureux mais précis, comme on parlerait à un jardinier amateur
- Éviter les superlatifs marketing creux ("révolutionnaire", "ultime", etc.)

## Conventions techniques rapides

- Pas de `any` sauf justification explicite
- Préférer `import type` quand on n'importe que des types
- Composants React : noms en PascalCase, fichiers du même nom
- Tailwind classes regroupées par catégorie quand c'est dense
- Les tokens de design vivent dans `app/globals.css` (cream, brand, terracotta-deep, etc.) — les utiliser plutôt que des hex inlinés
