/**
 * URLs des stores pour télécharger l'app Kultiva.
 *
 * Les valeurs par défaut pointent vers la recherche « kultiva » de chaque
 * store afin que les boutons fonctionnent dès la mise en ligne. Quand
 * l'app sera publiée, configure les vraies URLs dans Vercel via
 *   NEXT_PUBLIC_KULTIVA_APPSTORE_URL
 *   NEXT_PUBLIC_KULTIVA_PLAYSTORE_URL
 */
export const APP_STORE_URL =
  process.env.NEXT_PUBLIC_KULTIVA_APPSTORE_URL ??
  'https://apps.apple.com/fr/search?term=kultiva';

export const PLAY_STORE_URL =
  process.env.NEXT_PUBLIC_KULTIVA_PLAYSTORE_URL ??
  'https://play.google.com/store/search?q=kultiva&c=apps';
