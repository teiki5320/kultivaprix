# ✅ Checklist des actions humaines (iPad friendly)

> Tout ce qui suit se fait depuis le **navigateur** (Safari iPad) ou les **apps officielles** (GitHub, Vercel). Aucune action terminal locale requise.

## 🚀 État d'avancement (au 24 avril 2026)

**✅ DÉJÀ FAIT automatiquement (sur le projet Supabase Kultiva `vkiwkeknfzwdvufcqbrp`)**
- [x] Schéma `kultivaprix` créé
- [x] Extensions activées : `vector` (pgvector), `pg_trgm`, `pgcrypto`, `uuid-ossp` (dans `extensions`)
- [x] 7 tables créées avec RLS activé : `categories`, `products_master`, `merchants`, `offers`, `price_history`, `articles`, `clicks`
- [x] 26 index créés (trigram, ivfflat pgvector, FK, etc.)
- [x] 6 policies RLS de lecture publique (tout sauf `clicks`)
- [x] Fonction RPC `kultivaprix.upsert_offer` créée et testée (smoke test upsert + price_history OK)
- [x] 13 catégories seedées (8 principales + 5 sous-catégories graines)
- [x] Les 7 tables de `public` de l'app Kultiva n'ont **pas été touchées** (vérifié)

Migrations enregistrées dans Supabase :
- `kultivaprix_001_schema_and_extensions`
- `kultivaprix_002_tables_rls_rpc`
- `kultivaprix_003_seed_categories`

**⏳ ACTIONS HUMAINES RESTANTES**

👉 Le plus long est fait. Les étapes ci-dessous sont du copier-coller.

### 📋 Valeurs prêtes à coller dans Vercel / GitHub Secrets

```
NEXT_PUBLIC_SITE_URL=https://kultivaprix.com
NEXT_PUBLIC_KULTIVA_APP_URL=https://kultiva.app
NEXT_PUBLIC_SUPABASE_URL=https://vkiwkeknfzwdvufcqbrp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZraXdrZWtuZnp3ZHZ1ZmNxYnJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzNDQ0NDIsImV4cCI6MjA5MTkyMDQ0Mn0.TlR7djhq7N76fVsKbxpbxTQfz0hlqItVIP0J5zZUPOc
SUPABASE_SERVICE_ROLE_KEY=<A_RECUPERER_DANS_SUPABASE_DASHBOARD>
```

🔑 **Service role key** : dashboard Supabase → projet Kultiva → Project Settings → API → **Reveal** sous *service_role secret*. Jamais exposé par les MCPs (sécurité).

### ⚠️ UNE étape manuelle BLOQUANTE sur Supabase

Cette étape ne peut pas être scriptée (config API PostgREST, seulement via UI) :

- [ ] **Projet Supabase Kultiva → Project Settings → API → "Exposed schemas"** → ajouter `kultivaprix` dans la liste. Sauver. Le champ doit contenir `public, kultivaprix` (ou `graphql_public, public, kultivaprix` selon ta config actuelle).

Sans cette étape, toutes les requêtes PostgREST vers `kultivaprix.*` renverront `42501 schema "kultivaprix" is not exposed`.

---

## 1. Comptes à créer / activer

- [ ] **GitHub** — compte `teiki5320` (déjà).
  - [ ] Créer le repo `Kultivaprix` (public ou privé) sur [github.com/new](https://github.com/new)
  - [ ] Upload ce dossier (zip via l'éditeur web, ou `import repository`)
  - [ ] Générer un **Personal Access Token (Classic)** avec scopes `repo`, `workflow` si tu veux déclencher des runs via API — sinon pas nécessaire.

- [x] ~~**Supabase** — migrations jouées automatiquement via MCP sur projet Kultiva `vkiwkeknfzwdvufcqbrp` — voir section "État d'avancement" en haut.~~
  - [ ] **Reste à faire** : exposer le schéma `kultivaprix` dans *Project Settings → API → Exposed schemas* (1 clic, voir haut de page)
  - [ ] **Reste à faire** : récupérer la `service_role key` dans *Project Settings → API → Reveal* (jamais exposée par les MCPs)

- [ ] **Vercel** — [vercel.com](https://vercel.com)
  - [ ] Plan Hobby suffit pour démarrer
  - [ ] Connecter le repo GitHub → Import Project
  - [ ] Ajouter les variables d'env (cf. `.env.example`, toutes sauf `SUPABASE_SERVICE_ROLE_KEY` peuvent être Preview+Prod ; la service role doit être **Production only**)
  - [ ] Créer un **Deploy Hook** (Project → Git → Deploy Hooks) et copier l'URL dans `VERCEL_DEPLOY_HOOK_URL`
  - [ ] (Plus tard) Ajouter le domaine `kultivaprix.com`

- [ ] **Domaine** `kultivaprix.com` (OVH, Gandi, Namecheap, Cloudflare…)
  - [ ] Pointer le DNS vers Vercel (Vercel fournit les enregistrements A/CNAME)

## 2. Programmes d'affiliation (à demander)

> L'inscription est gratuite. Validation éditeur entre 1 et 10 jours ouvrés. Commence à déployer **sans ces clés** (le site fonctionne à vide), elles arrivent au fur et à mesure.

- [ ] **Awin** — [ui.awin.com/publisher-signup](https://ui.awin.com/publisher-signup/fr)
  - [ ] Payer les 5€ de caution (remboursés au 1er palier de gain)
  - [ ] Postuler chez : Graines Baumaux, Truffaut, Jardiland, ManoMano, Leroy Merlin, Botanic (vérifie la dispo sur Awin FR)
  - [ ] Récupérer `Publisher ID` + `API Token` (Toolbox → API credentials)

- [ ] **Effiliation** — [effiliation.com](https://www.effiliation.com)
  - [ ] Candidature éditeur, validation manuelle
  - [ ] Postuler chez les programmes jardinage (Gamm Vert, Willemse, etc.)
  - [ ] Récupérer `API Key` + `Program IDs`

- [ ] **Amazon Partenaires** — [partenaires.amazon.fr](https://partenaires.amazon.fr)
  - [ ] Inscription gratuite — nécessite **3 ventes dans les 180 jours** pour conserver le compte + PA-API
  - [ ] Créer un tag partenaire (ex: `kultivaprix-21`)
  - [ ] Demander accès à la **PA-API 5.0** (Outils → Product Advertising API)
  - [ ] Récupérer `Access Key`, `Secret Key`, `Partner Tag`

- [ ] **ManoMano** — généralement via Awin ; vérifier [manomano.fr/affiliation](https://www.manomano.fr) ou contact affiliate manager

- [ ] **Programmes directs** (optionnels) : Kokopelli ne fait pas d'affiliation → scraping respectueux. Ferme Sainte-Marthe, La Bonne Graine, Biaugerme : contacter directement.

## 3. Configuration GitHub Actions (secrets)

Repo → *Settings* → *Secrets and variables* → *Actions* → *New repository secret*. Copie-colle les valeurs depuis Supabase / Vercel / les programmes d'affiliation.

- [ ] `SITE_URL` = `https://kultivaprix.com`
- [ ] `SUPABASE_URL`
- [ ] `SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `AWIN_API_TOKEN`
- [ ] `AWIN_PUBLISHER_ID`
- [ ] `AWIN_ADVERTISER_IDS`
- [ ] `EFFILIATION_API_KEY`
- [ ] `EFFILIATION_PROGRAM_IDS`
- [ ] `AMAZON_PA_ACCESS_KEY`
- [ ] `AMAZON_PA_SECRET_KEY`
- [ ] `AMAZON_PA_PARTNER_TAG`
- [ ] `MANOMANO_FEED_URL` *(optionnel)*
- [ ] `VERCEL_DEPLOY_HOOK_URL`

## 4. Premier lancement

- [ ] Dans GitHub → *Actions* → `refresh-prices` → *Run workflow* (branche main). Le job ingère, dédoublonne, régénère les descriptions et appelle le deploy hook Vercel.
- [ ] Vérifier sur `https://<ton-preview>.vercel.app` que la home liste les catégories et quelques produits.
- [ ] Une fois quelques flux connectés, lancer `scrape-daily` à la main pour peupler Kokopelli + Baumaux si tu n'as pas encore l'affiliation.
- [ ] Vérifier `/sitemap.xml` et `/robots.txt`.

## 5. Conformité

- [ ] Compléter `app/mentions-legales/page.tsx` avec ta raison sociale + adresse.
- [ ] Bandeau cookies : **pas nécessaire** tant qu'aucun cookie tiers n'est déposé (actuellement : zéro tracker). Si tu ajoutes Plausible/GA plus tard, utiliser Plausible (sans cookie) pour rester RGPD-friendly.
- [ ] Déclarer le site à la CNIL ? **Non obligatoire** pour un comparateur sans inscription utilisateur. Juste les mentions d'affiliation (déjà présentes dans le footer).

## 6. SEO & croissance (après mise en ligne)

- [ ] Google Search Console : ajouter `kultivaprix.com`, soumettre le sitemap.
- [ ] Bing Webmaster Tools : pareil.
- [ ] Ajouter des **guides saisonniers** en éditant `lib/content-templates/guide.ts` → `GUIDE_LIBRARY` (une PR = un guide).
- [ ] Surveiller les clics via la table `kultivaprix.clicks` (Supabase → Table Editor → schema picker → `kultivaprix`).

---

🪴 **Ordre recommandé** : GitHub repo → Migrations Supabase dans le projet Kultiva (+ expose `kultivaprix` schema) → Vercel (déploiement "à vide") → Awin (premier programme validé en 48h) → Amazon Partenaires → Intégration app Kultiva (bouton "Comparer les prix") → le reste au fur et à mesure.

## 7. Intégration app Kultiva (côté mobile)

- [ ] Dans le code React Native / Expo de Kultiva, ajouter un bouton "Comparer les prix" sur les fiches plante / graine qui ouvre `https://kultivaprix.com/produit/<slug>` (ou `/recherche?q=<nom>` en fallback).
- [ ] Utiliser `expo-web-browser` avec `openBrowserAsync` — ça déclenche nativement **SFSafariViewController** (iOS) ou **Chrome Custom Tabs** (Android). Voir README section *Intégration app Kultiva* pour le snippet.
- [ ] Ajouter un UTM `?utm_source=kultiva-app&utm_medium=compare-cta&utm_content=<screen>` pour mesurer le trafic app → web dans la table `kultivaprix.clicks`.
