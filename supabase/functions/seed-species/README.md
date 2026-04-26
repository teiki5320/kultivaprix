# seed-species

Edge function qui upsert le catalogue Kultiva (espèces + accessoires) dans
`public.species`.

## Déploiement (une fois)

```bash
# 1. Installer la CLI Supabase si pas déjà fait :
#    https://supabase.com/docs/guides/cli/getting-started
# 2. Se logger et lier le projet :
supabase login
supabase link --project-ref vkiwkeknfzwdvufcqbrp

# 3. Définir le secret partagé (à utiliser ensuite côté CI Kultiva).
#    Génère une chaîne aléatoire longue, par ex. via `openssl rand -hex 32`.
supabase secrets set SEED_SECRET="<chaine-aleatoire-longue>"

# 4. Déployer la fonction (sans vérification JWT — l'auth est faite par
#    SEED_SECRET dans le code).
supabase functions deploy seed-species --no-verify-jwt
```

`SUPABASE_URL` et `SUPABASE_SERVICE_ROLE_KEY` sont injectés automatiquement
par Supabase dans l'environnement de la fonction, pas besoin de les setter.

## Appel (côté CI Kultiva ou en manuel)

```bash
curl -sS -X POST \
  "https://vkiwkeknfzwdvufcqbrp.supabase.co/functions/v1/seed-species" \
  -H "Authorization: Bearer $SEED_SECRET" \
  -H "Content-Type: application/json" \
  --data @kultiva-catalog.json
```

Le fichier `kultiva-catalog.json` doit avoir la forme :

```json
{
  "entries": [
    {
      "slug": "tomate",
      "kind": "species",
      "name": "Tomate",
      "category": "fruits",
      "emoji": "🍅",
      "image_asset": "assets/images/species/tomate.png",
      "description": "...",
      "sowing_technique": "...",
      "exposure": "soleil",
      "harvest_time_by_season": { "spring": "...", "summer": "..." },
      "regions": { "france": { "...": "..." }, "west_africa": { "...": "..." } }
    },
    {
      "slug": "acc_secateur",
      "kind": "accessory",
      "name": "Sécateur",
      "category": "accessories",
      "accessory_sub": "tools",
      "image_asset": "assets/images/accessories/secateur.png"
    }
  ]
}
```

Champs requis : `slug`, `kind` (`species` | `accessory`), `name`, `category`.
Tous les autres champs sont optionnels et reflètent les colonnes de
`public.species` (cf. `supabase/migrations/0007_species.sql`).

Réponse en cas de succès :

```json
{ "upserted": 98, "kinds": { "species": 59, "accessory": 39 } }
```

## Workflow GitHub Action côté Kultiva (à créer dans l'autre repo)

Squelette à adapter dans `.github/workflows/sync-catalog.yml` du repo Kultiva :

```yaml
name: Sync catalog to Kultivaprix
on:
  push:
    paths:
      - "lib/data/vegetables_base.dart"
      - "scripts/export-catalog.dart"
  workflow_dispatch:

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: dart-lang/setup-dart@v1
      - run: dart run scripts/export-catalog.dart > kultiva-catalog.json
      - name: Upload to Kultivaprix
        env:
          SEED_SECRET: ${{ secrets.KULTIVAPRIX_SEED_SECRET }}
        run: |
          curl -sS -X POST \
            "https://vkiwkeknfzwdvufcqbrp.supabase.co/functions/v1/seed-species" \
            -H "Authorization: Bearer $SEED_SECRET" \
            -H "Content-Type: application/json" \
            --data @kultiva-catalog.json \
            --fail
```

`KULTIVAPRIX_SEED_SECRET` est à ajouter dans les secrets du repo Kultiva
(Settings → Secrets and variables → Actions), avec la même valeur que celle
passée à `supabase secrets set SEED_SECRET=...` plus haut.
