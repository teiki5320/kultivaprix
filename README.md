# Kultivaprix 🌷🌱

Comparateur de prix 100% automatique pour **graines, plants et matériel de jardinage** chez les marchands français. Adossé à l'app [Kultiva](https://kultiva.app).

- Stack : Next.js 14 (App Router) · TypeScript · Tailwind · Supabase · Vercel
- Zéro LLM en prod : tout le contenu SEO est généré au build par des **templates** avec rotation de variantes (`lib/content-templates/`)
- 100% auto : CRON via GitHub Actions (refresh prix 6h, scrape quotidien, guides hebdo, sitemap quotidien)
- Monétisation : liens d'affiliation (Awin, Effiliation, Amazon Partenaires, ManoMano) + CTA vers l'app Kultiva
- Kawaii pastel vert/rose 🌸

## Sommaire

- [Architecture](#architecture)
- [Démarrage rapide (iPad friendly)](#démarrage-rapide-ipad-friendly)
- [Variables d'environnement](#variables-denvironnement)
- [Secrets GitHub à définir](#secrets-github-à-définir)
- [Supabase : init de la base](#supabase--init-de-la-base)
- [Ajouter un marchand](#ajouter-un-marchand)
- [Refresh manuel](#refresh-manuel)
- [Règle de contenu (SEO sans LLM)](#règle-de-contenu-seo-sans-llm)
- [Checklist des actions humaines](./CHECKLIST.md)

## Architecture

```
kultivaprix/
├── app/                     # Next.js App Router
│   ├── page.tsx             # /
│   ├── [category]/page.tsx  # /graines, /plants, /outils…
│   ├── produit/[slug]/page.tsx
│   ├── guide/[slug]/page.tsx
│   ├── recherche/page.tsx
│   ├── api/click/route.ts   # log + redirect 302 affilié
│   ├── sitemap.ts
│   └── robots.ts
├── components/              # Header, Footer, ProductCard, PriceTable…
├── lib/
│   ├── supabase.ts          # client public + admin
│   ├── utils.ts             # helpers (slug, cosine, variants…)
│   ├── types.ts
│   └── content-templates/   # SEO sans LLM
│       ├── variants.ts      # banques de phrases
│       ├── product.ts
│       ├── category.ts
│       └── guide.ts
├── scripts/
│   ├── ingest/
│   │   ├── _shared.ts       # upsert_offer via RPC Supabase
│   │   ├── awin.ts
│   │   ├── effiliation.ts
│   │   ├── amazon.ts        # PAAPI 5.0 (signature AWSv4 manuelle)
│   │   ├── manomano.ts
│   │   ├── kokopelli-scraper.ts
│   │   └── baumaux-scraper.ts
│   ├── normalize.ts         # dédup GTIN + embeddings MiniLM-L6-v2
│   └── sitemap.ts           # sitemap.xml statique
├── supabase/migrations/
│   ├── 0001_init.sql        # tables + RLS + RPC upsert_offer
│   └── 0002_seed_categories.sql
├── .github/workflows/       # 4 workflows CRON + CI
└── ...
```

## Démarrage rapide (iPad friendly)

Aucune action locale n'est requise. Tout se fait via GitHub + Vercel + Supabase :

1. **GitHub** → crée un repo public/privé `Kultivaprix` sous `teiki5320`. Upload les fichiers de ce dossier (ou bien utilise l'app GitHub mobile : Settings → Add existing content via web editor, ou upload un zip via [github.com/new](https://github.com/new)).
2. **Supabase** → **ouvre le projet Supabase existant de Kultiva** (ne pas créer un nouveau projet — Kultivaprix partage le projet Kultiva via un schéma dédié). Dans *SQL Editor*, colle et exécute `supabase/migrations/0001_init.sql` puis `0002_seed_categories.sql`. Puis va dans *Project Settings → API* → ajoute `kultivaprix` dans **Exposed schemas**.
3. **Vercel** → *New Project* → importe le repo GitHub. Framework détecté : Next.js. Ajoute les variables d'env (voir [.env.example](./.env.example)). Déploie.
4. **Secrets GitHub** → repo → *Settings* → *Secrets and variables* → *Actions*. Ajoute les secrets listés ci-dessous.
5. **Programmes d'affiliation** → inscris-toi (voir [CHECKLIST.md](./CHECKLIST.md)) et renseigne les tokens.
6. Déclenche manuellement `refresh-prices` dans l'onglet *Actions* : il ingère les flux, dédoublonne, régénère les descriptions et redéploie Vercel.

## Variables d'environnement

Copie `.env.example` → `.env.local` (local) et reporte les mêmes clés dans **Vercel → Project → Settings → Environment Variables** (Preview + Production) et dans **GitHub → Secrets**.

## Secrets GitHub à définir

| Secret                          | Source |
|--------------------------------|--------|
| `SITE_URL`                     | `https://kultivaprix.com` |
| `SUPABASE_URL`                 | Supabase → Project Settings → API |
| `SUPABASE_ANON_KEY`            | idem |
| `SUPABASE_SERVICE_ROLE_KEY`    | idem (⚠ ne jamais l'exposer côté client) |
| `AWIN_API_TOKEN`               | Awin → Toolbox → API credentials |
| `AWIN_PUBLISHER_ID`            | idem |
| `AWIN_ADVERTISER_IDS`          | ids séparés par virgule |
| `EFFILIATION_API_KEY`          | Effiliation → Mon compte → API |
| `EFFILIATION_PROGRAM_IDS`      | ids séparés par virgule |
| `AMAZON_PA_ACCESS_KEY`         | Amazon Partenaires → PA-API |
| `AMAZON_PA_SECRET_KEY`         | idem |
| `AMAZON_PA_PARTNER_TAG`        | ex: `kultivaprix-21` |
| `MANOMANO_FEED_URL`            | (optionnel si direct feed) |
| `VERCEL_DEPLOY_HOOK_URL`       | Vercel → Project → Git → Deploy Hooks |

## Supabase : init de la base (projet Kultiva partagé)

Kultivaprix **n'a pas son propre projet Supabase** : on réutilise celui de l'app Kultiva. Toutes les tables sont créées dans un **schéma dédié `kultivaprix`** pour ne pas polluer `public`.

1. Ouvrir le dashboard Supabase du projet **Kultiva**.
2. **Database → Extensions** — vérifier que `vector` (pgvector), `pg_trgm`, `uuid-ossp`, `pgcrypto` sont activées. Les migrations les activent si besoin.
3. **SQL Editor** → coller le contenu de `supabase/migrations/0001_init.sql` → *Run*. Cela crée `create schema kultivaprix` puis toutes les tables sous `kultivaprix.*`, les policies RLS et la RPC `kultivaprix.upsert_offer`. Aucun impact sur `public`.
4. Idem avec `0002_seed_categories.sql`.
5. **Project Settings → API → "Exposed schemas"** — ajouter `kultivaprix` (indispensable pour que PostgREST serve les tables). Le champ doit contenir quelque chose comme `public, kultivaprix`.
6. Récupérer `Project URL`, `anon key`, `service_role key` — ce sont les **mêmes clés que Kultiva** (pas de double config).

### Pourquoi un schéma dédié plutôt qu'un préfixe de tables ?

- Isolation propre : pas de collision de noms avec `public.products`, `public.users`, etc. de Kultiva
- Permissions granulaires par schéma via `grant usage on schema kultivaprix to ...`
- Facile à drop si besoin (`drop schema kultivaprix cascade`) sans toucher à Kultiva
- Le client Supabase côté Next.js est configuré avec `db: { schema: 'kultivaprix' }` — toutes les requêtes ciblent automatiquement le bon schéma, pas d'appel `.schema()` à répéter.

## Ajouter un marchand

Trois cas de figure :

### A. Le marchand est sur Awin
Ajoute son `advertiser_id` à `AWIN_ADVERTISER_IDS` (secret GitHub + var Vercel). Relance `refresh-prices`. Terminé.

### B. Le marchand est sur Effiliation
Même principe : `EFFILIATION_PROGRAM_IDS`.

### C. Pas de programme / scraping
1. Duplique `scripts/ingest/kokopelli-scraper.ts` en `<marchand>-scraper.ts`.
2. Ajuste `BASE`, `SEED_URLS` et les sélecteurs CSS/XPath.
3. Ajoute un script npm dans `package.json` (`"scrape:<marchand>"`) et référence-le dans `.github/workflows/scrape-daily.yml`.
4. **Respecte `robots.txt`** et mets une cadence ≥ 2s entre requêtes.

Dans tous les cas, `scripts/normalize.ts` rattache automatiquement les nouvelles offres aux produits canoniques (via GTIN puis embeddings).

## Refresh manuel

- **Via GitHub Actions** (recommandé, iPad friendly) : onglet *Actions* → `refresh-prices` → *Run workflow*.
- **Via Vercel Deploy Hook** : appelle l'URL configurée pour forcer un rebuild immédiat.

## Règle de contenu (SEO sans LLM)

Tout le texte affiché (intro catégorie, description produit, guides) est produit à partir de la bibliothèque **`lib/content-templates/`** :

- `variants.ts` : banques de phrases interchangeables
- `product.ts`, `category.ts`, `guide.ts` : assemblent les phrases via `stringSeed(slug)` → l'output reste **déterministe** par produit (pas de contenu qui change à chaque build, ce que Google pénalise).

Pour enrichir le contenu, **ajoute des variantes** dans `variants.ts` ou **ajoute une entrée** dans `GUIDE_LIBRARY` (guide.ts). Aucun prompt, aucune API payante, aucun risque de hallucination.

## Intégration app Kultiva

Le trafic va de **Kultiva → Kultivaprix** (pas l'inverse — on ne disperse pas). Sur chaque fiche plante / graine dans l'app, on ajoute un bouton **« Comparer les prix »** qui ouvre Kultivaprix dans une vue web native (SFSafariViewController sur iOS / Chrome Custom Tabs sur Android). C'est le meilleur compromis UX : l'utilisateur reste dans le contexte de l'app, pas de WebView branlante, et le cookie de session revient quand on le renvoie vers un marchand.

### Snippet prêt à coller (React Native / Expo)

```bash
# dans le projet Kultiva
npx expo install expo-web-browser
```

```tsx
// components/CompareButton.tsx
import { Pressable, Text } from 'react-native';
import * as WebBrowser from 'expo-web-browser';

interface Props {
  /** Slug Kultivaprix si connu (à stocker côté produit dans Kultiva), sinon
   *  on passe par la recherche. */
  kultivaprixSlug?: string;
  /** Fallback : nom libre (ex: "tomate Marmande") pour la recherche */
  searchTerm?: string;
  /** Identifie l'écran source pour l'attribution */
  screen: string; // ex: 'plant-detail', 'seed-card'
}

export function CompareButton({ kultivaprixSlug, searchTerm, screen }: Props) {
  const base = 'https://kultivaprix.com';
  const path = kultivaprixSlug
    ? `/produit/${kultivaprixSlug}`
    : `/recherche?q=${encodeURIComponent(searchTerm ?? '')}`;
  const url =
    `${base}${path}` +
    `${path.includes('?') ? '&' : '?'}` +
    `utm_source=kultiva-app&utm_medium=compare-cta&utm_content=${encodeURIComponent(screen)}`;

  const onPress = async () => {
    await WebBrowser.openBrowserAsync(url, {
      // iOS : SFSafariViewController
      presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
      // Android : Custom Tabs — couleur de barre alignée marque Kultiva
      toolbarColor: '#3AAA58',
      controlsColor: '#FFFFFF',
      enableBarCollapsing: true,
    });
  };

  return (
    <Pressable onPress={onPress} style={{ backgroundColor: '#FF5490', padding: 12, borderRadius: 24 }}>
      <Text style={{ color: 'white', fontWeight: '700', textAlign: 'center' }}>
        💰 Comparer les prix
      </Text>
    </Pressable>
  );
}
```

### Notes d'intégration

- **Pas de deep-link retour** vers Kultiva depuis le site : on veut que l'utilisateur reste un visiteur web (affiliation mieux trackée, pas de friction). Quand il ferme la vue, il revient naturellement dans Kultiva.
- **Pas de WebView embarquée** (`react-native-webview`) : SFSafariViewController / Custom Tabs gèrent cookies, paiement Apple Pay, extensions anti-pub, Face ID... Avec une WebView on casse tout ça.
- **UTM automatique** : `kultiva.clicks.utm` (côté Kultivaprix) contiendra `utm_source=kultiva-app` + l'écran source → on voit dans Supabase quelles fiches Kultiva génèrent du trafic comparateur.
- **Association produit ↔ slug Kultivaprix** : idéalement, stocker le `kultivaprix_slug` à côté de chaque plante / graine dans la base Kultiva (pourquoi pas via un job de rapprochement automatique qui interroge `/api/search` une fois par jour). À défaut, le bouton fait une recherche par nom — moins précis mais marche out-of-the-box.

## Licence & crédits

MIT. Sprite gardening kawaii issu de l'imaginaire Kultiva 🌷.
