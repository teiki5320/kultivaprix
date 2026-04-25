# 🗺️ Kultivaprix — Roadmap

> Dernière mise à jour : **2026-04-25**
> Statut global : **actif**

## 🎯 Vision

Devenir le comparateur de prix de référence pour les jardiniers francophones (France et Afrique de l'Ouest), branché à l'app Kultiva, avec un ton kawaii, des données honnêtes et zéro dark pattern.

## 🏁 Jalons

### ✅ Fait

- [x] Stack Next.js 14 + Supabase + Tailwind en place, build vert, TypeScript propre.
- [x] Charte graphique alignée pile sur celle de l'app Kultiva (typographies Fredoka + Quicksand, palette cream / terracotta / vert brand).
- [x] Fiche produit complète : tableau des offres triées au prix, courbe d'historique sur 90 jours, badges « meilleur prix 30 j » et « en baisse », prix au gramme calculé automatiquement depuis le titre.
- [x] Recherche avec autocomplete instantanée, filtres bio / origine France et tri par prix.
- [x] 24 pages saisonnières prérendues (que-semer et que-récolter pour chaque mois) avec calendrier annuel et données structurées FAQ + ItemList.
- [x] Pages éditoriales prêtes : glossaire jardinier, kits potager clés-en-main, quiz « que planter chez moi », calculateur de budget, calendrier imprimable A4, focus Afrique de l'Ouest.
- [x] Panier multi-marchands en localStorage qui calcule le split optimal frais de port inclus, avec permalien de partage.
- [x] Préférences utilisateur sans compte (région, niveau, devise euro / FCFA, mode léger sans images) stockées en cookie.
- [x] SEO de fond : OG image générée dynamiquement, fil d'Ariane visible et structuré, Organization / WebSite / SearchAction, agrégat d'avis, canonicals partout, hreflang multi-marchés francophones.
- [x] Workflows GitHub Actions opérationnels pour rafraîchir les prix toutes les 6 heures, scraper les marchands sans flux, régénérer les guides chaque semaine et republier le sitemap.
- [x] API publique en lecture seule pour exposer produits et offres, plus tracking de clic en edge runtime avec hash anonymisé de l'utilisateur.
- [x] Garde-fous qualité : tests Playwright smoke, dashboard admin protégé par secret, RLS Supabase actives sur toutes les tables sensibles.

### 🔥 En cours

- [ ] Fusion de la branche de refonte design + features sur la branche principale après revue.
- [ ] Application des quatre dernières migrations SQL sur le projet Supabase (recherche trigram, alertes, avis, helpers admin).
- [ ] Configuration des variables d'environnement de production sur Vercel (secret admin, lien tip jar).

### 📋 À faire

- [ ] Acheter et brancher le domaine kultivaprix.com puis valider le déploiement Vercel en production.
- [ ] S'inscrire aux quatre programmes d'affiliation cibles (Awin, Effiliation, Amazon Partenaires, ManoMano) et renseigner les tokens dans les secrets GitHub.
- [ ] Lancer une première ingestion réelle pour avoir un catalogue produits non vide en prod.
- [ ] Brancher un service d'envoi email (Resend ou Postmark) pour activer concrètement les alertes de baisse de prix et la newsletter saisonnière.
- [ ] Écrire le worker Vercel Cron qui scanne les seuils d'alerte et déclenche les envois.
- [ ] Faire vraiment varier le contenu selon la région choisie en cookie (aujourd'hui stockée mais pas encore utilisée pour filtrer les listes).
- [ ] Générer une OG image dynamique pour les paniers partagés afin d'avoir une preview riche sur les réseaux.
- [ ] Activer la modération réelle des avis et brancher les écrans admin de dédoublonnage et d'anomalies de prix.

### 💡 Idées

- [ ] Upload de photos potager par les utilisateurs avec bucket Supabase Storage et modération préalable.
- [ ] Carte interactive des marchands avec géocodage Nominatim et fond OpenStreetMap.
- [ ] Module « ils ont planté ça ce mois-ci » alimenté par un agrégat anonymisé de l'app Kultiva.
- [ ] Espace pro pour maraîchers avec prix hors taxe et conditionnements en gros.
- [ ] Assistant conversationnel jardinage adossé à un modèle vérifié, avec garde-fous éditoriaux.
- [ ] Sponsoring labellisé d'offres marchands sans aucun impact sur le tri du tableau de prix.
