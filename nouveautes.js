/* ═══ Numéro de version et « Quoi de neuf » : une entrée par version, la plus récente en premier ═══ */
export const VERSION = "1.1.0";
export const NOUVEAUTES = [
  { version: "1.1.0", date: "2026-10-28", points: [
    "Fiches préremplies (Racco D2) : choisis tes deux modèles Excel dans ⚙ Paramètres › Documents POI. Le dossier de chaque projet reçoit un sous-dossier « Fiches préremplies » avec une copie vierge de chacun, nommée avec les N° POI.",
    "Les logos roses ouvrent directement dans Excel la fiche du projet : « Faire CMS » le Fichier 1 ; « Faire Desat PMZ », « Faire la FI incomplète » et « Faire la FI » le Fichier 2.",
  ] },
  { version: "1.0.0", date: "2026-10-26", points: [
    "Le Suivi des dossiers devient un logiciel : tes données sont enregistrées dans le dossier que tu as choisi, sans aucune connexion Internet.",
    "Sauvegarde automatique à chaque modification, une copie datée chaque jour et une copie à chaque fermeture.",
    "Bouton ⚙ Paramètres : couleurs, mode sombre, taille du texte, densité, libellés, dossier des Documents POI, sauvegardes, colonnes du Suivi, corbeille, jours non travaillés, mot de passe.",
    "Documents POI : le bouton ouvre directement le dossier du projet (avec son sous-dossier « docs GEDAFFAIRE »), ou le crée s’il n’existe pas.",
    "Rappels : les DRE et DLR à moins de 5 jours (ou dépassées) sont signalées dans le tableau et en haut du Suivi.",
    "Un projet peut être supprimé : il passe 30 jours dans la corbeille avant de disparaître.",
    "Tuto de lancement : une visite guidée en bulles, à relancer quand tu veux depuis ⚙ Paramètres.",
  ] },
];
