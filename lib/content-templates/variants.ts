/**
 * Banques de variantes de phrases pour générer du contenu SEO unique
 * SANS LLM. Chaque template puise dans ces listes via une graine déterministe
 * (voir lib/utils.ts → stringSeed + pickVariant).
 *
 * Règle : jamais de promesse commerciale (« meilleur », « #1 »), ton doux,
 * kawaii, factuel — aligné ligne éditoriale Kultiva.
 */

export const INTRO_HOOKS = [
  "Envie de trouver %NAME% au meilleur prix sans courir d'une boutique à l'autre ?",
  "Comparer les prix de %NAME%, c'est l'assurance de jardiner malin dès le semis.",
  "On a rassemblé pour toi toutes les offres de %NAME% chez les marchands français.",
  "%NAME% : voici un tour d'horizon des prix pratiqués en France, mis à jour régulièrement.",
  "Un potager heureux commence par un bon achat — voici les tarifs de %NAME% sur le web FR.",
];

export const BUY_TIPS = [
  "Regarde toujours le prix au gramme pour les sachets de graines : l'écart peut doubler à qualité équivalente.",
  "Les frais de port font souvent basculer la meilleure offre — on les inclut dans le comparatif quand le marchand les communique.",
  "Privilégie les graines reproductibles (non-hybrides F1) si tu veux ressemer l'année suivante.",
  "Un plant livré trop jeune en période froide, c'est risqué — vérifie la taille promise avant d'acheter.",
  "Les promos de printemps (mars–mai) sont souvent plus intéressantes que les soldes d'été pour le matériel.",
];

export const SEASON_TIPS = [
  "En pleine saison (mars à mai), les stocks tournent vite : mieux vaut comparer puis acheter dans la foulée.",
  "Hors saison, tu peux profiter d'un stock plus calme et parfois de remises sur les invendus.",
  "Certains marchands ajustent leurs prix à la semaine — notre comparateur se met à jour toutes les 6 heures.",
  "Le climat de ton coin compte : note la rusticité de la variété avant d'acheter.",
];

export const CTA_KULTIVA = [
  "Une fois tes graines commandées, planifie ton potager avec l'appli Kultiva — calendrier de semis, rotations, alertes météo.",
  "Kultiva, l'appli compagnon : scanne ton sachet, on t'indique la date idéale de semis pour ta région.",
  "Organise ton jardin côté planning dans Kultiva, et reviens ici quand il est temps de racheter.",
  "Envie d'aller plus loin ? L'appli Kultiva te suit du semis à la récolte, main dans la main avec ton potager.",
];

export const PRICE_COMMENT = [
  "Les prix varient de {{MIN}} à {{MAX}} selon les marchands.",
  "On a repéré {{COUNT}} offres entre {{MIN}} et {{MAX}} sur les boutiques françaises suivies.",
  "Le ticket d'entrée se situe autour de {{MIN}}, avec une moyenne à {{AVG}}.",
  "Selon les enseignes, compte entre {{MIN}} et {{MAX}} — écart fréquent sur ce type de produit.",
];

export const CLOSING = [
  "Bonnes plantations ! 🌱",
  "Jardine doux, jardine juste. 🌸",
  "À toi de semer, on garde un œil sur les prix. 🌿",
  "Reviens régulièrement — les prix bougent au fil de la saison. 🍅",
];

export const TRUST_NOTES = [
  "Kultivaprix est neutre : aucun marchand ne paie pour apparaître plus haut dans le comparateur.",
  "Les liens marchands sont des liens d'affiliation — cela ne change rien au prix que tu paies, mais ça finance le site.",
  "Prix mis à jour automatiquement plusieurs fois par jour depuis les flux officiels des marchands.",
];

export const GUIDE_OPENING = [
  "Voici un guide synthétique pour faire les bons choix autour de %TOPIC%.",
  "Quelques repères concrets si tu te lances dans %TOPIC% cette saison.",
  "On a compilé l'essentiel sur %TOPIC%, sans bla-bla marketing.",
];

export const GUIDE_STEPS_HEADERS = [
  "Ce qu'il faut regarder avant d'acheter",
  "Les critères qui comptent vraiment",
  "Points de vigilance",
  "À savoir avant de commander",
];
