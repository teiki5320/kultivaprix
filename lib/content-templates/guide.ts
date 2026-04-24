import {
  GUIDE_OPENING,
  GUIDE_STEPS_HEADERS,
  BUY_TIPS,
  SEASON_TIPS,
  CTA_KULTIVA,
  CLOSING,
  TRUST_NOTES,
} from './variants';
import { pickVariant, stringSeed, toSlug } from '../utils';

export type GuideTopic =
  | 'semis-tomate'
  | 'semis-salade'
  | 'choisir-graines'
  | 'arrosage-potager'
  | 'potager-balcon';

export interface GuideSpec {
  key: GuideTopic;
  title: string;
  topicLabel: string;
  categorySlug?: string;
  bulletIdeas: string[];
}

/** Bibliothèque de sujets de guides. Ajouter une entrée = un nouveau guide. */
export const GUIDE_LIBRARY: GuideSpec[] = [
  {
    key: 'semis-tomate',
    title: 'Semis de tomates : bien démarrer',
    topicLabel: 'le semis de tomates',
    categorySlug: 'graines-tomates',
    bulletIdeas: [
      "Démarre les semis 6 à 8 semaines avant la date des dernières gelées de ta région.",
      "Une température de 20–22 °C favorise une germination régulière.",
      "Repique en godet dès l'apparition des premières vraies feuilles.",
      "Durcis les plants une semaine avant la mise en terre définitive.",
      "Pour les variétés anciennes, choisis des graines reproductibles si tu veux ressemer.",
    ],
  },
  {
    key: 'semis-salade',
    title: 'Semer des salades toute l\'année',
    topicLabel: 'le semis de salades',
    categorySlug: 'graines-salades',
    bulletIdeas: [
      "Échelonne les semis toutes les 2 à 3 semaines pour récolter en continu.",
      "En été, privilégie les variétés résistantes à la montée en graine.",
      "Les laitues d'hiver se sèment d'août à septembre.",
      "Un sol frais et un léger ombrage en plein été limitent l'amertume.",
    ],
  },
  {
    key: 'choisir-graines',
    title: 'Bien choisir ses graines',
    topicLabel: 'le choix des graines',
    categorySlug: 'graines',
    bulletIdeas: [
      "Vérifie la date de péremption : un lot frais germe mieux.",
      "Les F1 offrent un rendement régulier mais ne se ressèment pas fidèlement.",
      "Les variétés bio sont cultivées sans pesticides de synthèse — utile si tu vises un jardin naturel.",
      "Le prix au gramme est le vrai indicateur : les sachets marketing sont souvent plus chers au poids.",
    ],
  },
  {
    key: 'arrosage-potager',
    title: 'Arrosage du potager : le matériel utile',
    topicLabel: 'l\'arrosage du potager',
    categorySlug: 'arrosage',
    bulletIdeas: [
      "Un goutte-à-goutte économise jusqu'à 50 % d'eau par rapport au jet classique.",
      "Un programmateur te permet de partir en vacances l'esprit tranquille.",
      "Les oyas (jarres en terre) sont parfaits sur petite surface.",
      "Arrose le matin tôt pour limiter l'évaporation et les maladies foliaires.",
    ],
  },
  {
    key: 'potager-balcon',
    title: 'Potager de balcon : par où commencer',
    topicLabel: 'le potager de balcon',
    categorySlug: 'plants',
    bulletIdeas: [
      "Oriente-toi vers des variétés compactes (tomates cerises, salades à couper).",
      "Prévoit au moins 30 cm de profondeur de terre pour les tomates.",
      "Un substrat enrichi et un arrosage régulier sont tes meilleurs alliés en pot.",
      "Pense aux aromatiques : basilic, ciboulette, persil — faciles et utiles au quotidien.",
    ],
  },
];

export interface BuiltGuide {
  slug: string;
  title: string;
  bodyMd: string;
  metaDescription: string;
  categorySlug?: string;
  key: GuideTopic;
}

export function buildGuide(spec: GuideSpec): BuiltGuide {
  const seed = stringSeed(spec.key);
  const opening = pickVariant(GUIDE_OPENING, seed).replace(/%TOPIC%/g, spec.topicLabel);
  const header = pickVariant(GUIDE_STEPS_HEADERS, seed + 1);
  const season = pickVariant(SEASON_TIPS, seed + 2);
  const tip = pickVariant(BUY_TIPS, seed + 3);
  const cta = pickVariant(CTA_KULTIVA, seed + 4);
  const close = pickVariant(CLOSING, seed + 5);
  const trust = pickVariant(TRUST_NOTES, seed + 6);

  const bullets = spec.bulletIdeas.map((b) => `- ${b}`).join('\n');

  const bodyMd = [
    opening,
    '',
    `## ${header}`,
    '',
    bullets,
    '',
    `## Quand passer à l'achat`,
    '',
    season,
    '',
    `> ${tip}`,
    '',
    `## Le mot de la fin`,
    '',
    cta,
    '',
    trust,
    '',
    close,
  ].join('\n');

  return {
    key: spec.key,
    slug: toSlug(spec.title),
    title: spec.title,
    categorySlug: spec.categorySlug,
    metaDescription: `${spec.title} — repères et conseils concrets pour jardiner sereinement. Kultivaprix.`.slice(
      0,
      160,
    ),
    bodyMd,
  };
}
