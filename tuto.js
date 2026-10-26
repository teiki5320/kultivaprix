/* ═══ Tuto de lancement : visite guidée en bulles (Suivi → un dossier → Paramètres) ═══
   lancé tout seul au premier lancement, relancé depuis ⚙ Paramètres › Tuto ;
   il ne fait que montrer : aucun clic de la visite ne change les données (sauf le dossier d'exemple, créé puis effacé). */
import { bureau, kvEcrire, kvPrefixe, lireProjets } from "./commun.js";

const CLE_ETAT = "kultivaprix-tuto", CLE_VU = "kultivaprix-tuto-vu", ID_EXEMPLE = "ptuto";
const PAGES_TYPE = { "racco-d2": "racco-d2.html", "loc-par": "localisation-par.html", "crea-par": "creation-par.html" };
const lire = (s, k) => { try { return JSON.parse(s.getItem(k) || "null"); } catch (e) { return null; } };
const ecrire = (s, k, v) => { try { v == null ? s.removeItem(k) : s.setItem(k, JSON.stringify(v)); } catch (e) {} };
const pageActuelle = () => /parametres\.html$/.test(location.pathname) ? "param" : /(racco-d2|localisation-par|creation-par)\.html$/.test(location.pathname) ? "dossier" : "suivi";

/* ═══ Les étapes : page, élément montré (sinon bulle au centre), titre, texte ═══ */
const ETAPES = [
  { page: "suivi", titre: "Bienvenue dans Racco D2 !", texte: "Ce petit tour te montre l’essentiel en quelques bulles. Tu peux le passer quand tu veux, et le relancer depuis ⚙ Paramètres." },
  { page: "suivi", si: () => !!bureau, titre: "Tes données", texte: async () => `Tout ce que tu fais est enregistré tout de suite (pas de bouton « Enregistrer ») dans le dossier choisi au premier lancement :\n${(await bureau.infos()).dossier}\nUne copie de sécurité est faite chaque jour et à chaque fermeture.` },
  { page: "suivi", cible: "#nouveau", titre: "Créer un projet", texte: "« + Nouveau projet » : choisis le type de dossier (Racco D2, Localisation de PAR, Création du PAR…). Le projet s’ouvre tout de suite." },
  { page: "suivi", cible: () => document.getElementById("corps")?.closest(".card"), titre: "Les dossiers en cours", texte: "Une ligne par projet en cours. Clique sur une ligne pour ouvrir le projet. Clique sur le titre d’une colonne pour trier ; un 2e clic inverse le tri." },
  { page: "suivi", cible: "#feuxTous", titre: "Les feux", texte: "Rouge = urgent, orange = pas urgent, vert = en attente de documents. Clique sur un feu pour cacher ou réafficher ces dossiers." },
  { page: "suivi", cible: '#tete th[data-tri="note"]', titre: "La note complète", texte: "Passe la souris sur la case Note d’un dossier : la note s’affiche en entier." },
  { page: "suivi", cible: () => document.getElementById("recherche")?.closest(".card"), titre: "La recherche", texte: "Tape au moins 2 lettres : le mot est cherché dans tous les projets (adresse, N° POI, commentaires, notes…)." },
  { page: "suivi", cible: () => { const r = document.getElementById("rappels"); return r && !r.hidden ? r : document.querySelector('#tete th[data-tri="dre"]'); }, titre: "Les rappels DRE / DLR",
    texte: "Quand une DRE ou une DLR arrive à moins de 5 jours (ou est dépassée), une pastille apparaît dans le tableau et un bandeau en haut du Suivi. « Masquer pour aujourd’hui » le cache jusqu’à demain." },
  { page: "suivi", cible: () => document.getElementById("ongletsTypes")?.closest(".card"), titre: "Le suivi par type de dossier", texte: "Clique sur un type pour voir ses projets en cours, puis ses archivés et annulés." },
  { page: "suivi", cible: () => document.getElementById("stats")?.closest(".card"), titre: "Les statistiques", texte: "Nombre de POI et d’EL en cours, archivés et annulés sur la période choisie. À l’ouverture : du 1er janvier à aujourd’hui." },
  { page: "dossier", titre: "La page d’un dossier", texte: async () => (await etatTuto())?.exemple ? "Voici un dossier d’exemple, créé pour le tuto : il sera effacé à la fin." : "Voici la page d’un de tes dossiers. Le tuto ne change rien : il ne fait que montrer." },
  { page: "dossier", cible: ".urgence .feu", titre: "Le feu d’urgence", texte: "Clique sur une couleur pour donner son urgence au dossier. Elle apparaît dans le Suivi." },
  { page: "dossier", cible: "#arbre .ligne.d2 .cb", titre: "Cocher une tâche", texte: "Clique sur la case quand la tâche est faite. Quand toutes ses tâches sont faites, la grande tâche passe au vert." },
  { page: "dossier", cible: "#arbre .ligne.d2 .cb", titre: "Barrer une tâche", texte: "Double-clic sur la case quand une tâche ne concerne pas ce dossier : elle reste visible, barrée et grisée, et ne bloque plus rien." },
  { page: "dossier", cible: "#arbre .date-mini", titre: "Les dates à côté des tâches", texte: "Tape la date (JJ/MM/AAAA) ou choisis-la dans le calendrier. Certaines vont toutes seules dans les Dates importantes." },
  { page: "dossier", cible: "#arbre .ligne.d1 .lib", titre: "Les commentaires", texte: "Clique sur le texte d’une tâche : ses commentaires s’affichent dans la carte Commentaires (texte, captures collées, fichiers)." },
  { page: "dossier", cible: () => [...document.querySelectorAll("#arbre .modop-btn")].find(b => !(window.COML_IDS || []).includes(b.dataset.lien) && !/~web$/.test(b.dataset.lien)), titre: "Les liens Modop",
    texte: "Le petit dossier orange ouvre le Modop de la tâche (Word, PowerPoint…). Le crayon change le lien. Un lien Modop est le même pour tous les dossiers du même type." },
  { page: "dossier", cible: '#arbre [data-lien$="~web"]', titre: "Les liens web violets", texte: "Le logo violet ouvre un site dans ton navigateur (par exemple l’agent DINOOTOO dans Localisation de PAR)." },
  { page: "dossier", cible: "#arbre .liste-btn", titre: "Les listes", texte: "Le bouton vert ouvre la liste des documents à vérifier pour cette tâche. Le compteur montre combien sont cochés." },
  { page: "dossier", cible: () => [...document.querySelectorAll("#arbre [data-lien]")].find(b => (window.COML_IDS || []).includes(b.dataset.lien)), titre: "Les ComL",
    texte: "Ce bouton ouvre la fenêtre du ComL : la capture d’écran et les dates calculées (DRE, DLR…), à copier. Quand la tâche est cochée, la DRE et la DLR passent dans les Dates importantes." },
  { page: "dossier", cible: ".c-dossier", titre: "Infos du dossier", texte: "N° POI, cabinet, adresse, nombre d’EL… « Annuler » à côté d’un N° POI annule la POI. « Importer Excel » remplit les IMB depuis l’export." },
  { page: "dossier", cible: ".c-dates", titre: "Les Dates importantes", texte: "Elles se remplissent avec les dates des tâches, ou à la main. Une date grisée ne concerne pas ce dossier." },
  { page: "dossier", cible: ".c-utiles", titre: "Les Infos utiles", texte: "Les références à garder sous la main (IPON, PV, BANBOU…)." },
  { page: "dossier", cible: ".c-note", titre: "La Note", texte: "Un bloc-notes libre pour le dossier : texte et captures collées. Le bouton à côté du titre ouvre ton fichier de notes OneDrive." },
  { page: "dossier", cible: "#docsTuile", titre: "Documents POI", texte: () => bureau ? "Ouvre le dossier du projet dans ton OneDrive (POI › type › « adresse - COMMUNE (N° POI) »), où tu vois « docs GEDAFFAIRE ». S’il n’existe pas, le logiciel propose de le créer." : "Ouvre le dossier OneDrive des documents de la POI (lien à coller la première fois)." },
  { page: "dossier", cible: ".retour-suivi", titre: "Revenir au Suivi", texte: "Ce bouton ramène au Suivi des dossiers. Rien à enregistrer : tout l’est déjà." },
  { page: "param", cible: '[data-section="infos"]', titre: "Les Paramètres", texte: "Le bouton ⚙ Paramètres, en haut du Suivi, ouvre cette page. En haut : la version du programme, « Quoi de neuf » et le dossier des données." },
  { page: "param", cible: '[data-section="apparence"]', titre: "L’apparence", texte: "Thème de couleurs, couleurs une par une, mode sombre, taille du texte et densité. Le changement se voit tout de suite." },
  { page: "param", cible: "#admin", titre: "La partie admin", texte: "Les autres réglages sont dans la partie admin : le bouton « Admin » en bas l’ouvre (avec un code, si tu en mets un)." },
  { page: "param", avant: () => window.adminTuto?.(), cible: '[data-section="poi"]', titre: "Le dossier « POI »", texte: "À faire une fois (partie admin) : choisis ton dossier « POI » du OneDrive. Les sous-dossiers de chaque type sont reconnus tout seuls." },
  { page: "param", avant: () => window.adminTuto?.(), cible: '[data-section="donnees"]', titre: "Sauvegardes et « Restaurer »", texte: "Partie admin : les copies de sécurité. « Restaurer » remet toutes tes données comme elles étaient à une date." },
  { page: "param", cible: '[data-section="tuto"]', titre: "Relancer le tuto", texte: "C’est fini ! Tu peux relancer ce tuto quand tu veux, ici." },
];

/* ═══ État de la visite (le temps de la séance) ═══ */
async function etatTuto() { return lire(sessionStorage, CLE_ETAT); }
// le dossier montré : un projet existant, sinon un dossier Racco D2 d'exemple
async function dossierPourTuto() {
  const L = (await lireProjets()).filter(p => !p.supprime && PAGES_TYPE[p.type]);
  const p = L.find(x => x.type === "racco-d2" && x.id !== ID_EXEMPLE) || L.find(x => x.id !== ID_EXEMPLE);
  if (p) return { id: p.id, page: PAGES_TYPE[p.type], exemple: false };
  const T = await lireProjets();
  if (!T.some(x => x.id === ID_EXEMPLE)) { T.push({ id: ID_EXEMPLE, type: "racco-d2", cree: Date.now(), tuto: true }); await kvEcrire("projets", T); }
  return { id: ID_EXEMPLE, page: PAGES_TYPE["racco-d2"], exemple: true };
}
// (la page du dossier réécrit son résumé en se fermant : ce qui reste est effacé au chargement de la page suivante)
async function effacerExemple() {
  const L = await lireProjets();
  if (L.some(p => p.tuto)) await kvEcrire("projets", L.filter(p => !p.tuto));
  for (const k of (await kvPrefixe(`p:${ID_EXEMPLE}:`)).keys()) await kvEcrire(`p:${ID_EXEMPLE}:${k}`, undefined);
}
const urlDe = (page, e) => page === "suivi" ? "./" : page === "param" ? "parametres.html" : `${e.page}?p=${encodeURIComponent(e.id)}`;

/* ═══ Affichage : fond assombri, trou autour de l'élément montré, bulle ═══ */
const style = document.createElement("style");
style.textContent = `
.tuto-bloque { position: fixed; inset: 0; z-index: 300; }
.tuto-bloque.plein { background: rgba(20, 16, 12, .55); }
.tuto-trou { position: fixed; z-index: 301; border-radius: 12px; box-shadow: 0 0 0 9999px rgba(20, 16, 12, .55); outline: 3px solid #E8701A; outline-offset: 2px; pointer-events: none; transition: all .25s ease; }
.tuto-bulle { position: fixed; z-index: 302; width: min(380px, calc(100vw - 24px)); background: #fff; color: #1A1A1A; border-radius: 14px; padding: 16px 18px 14px; box-shadow: 0 18px 50px rgba(0,0,0,.35);
  font: 14px/1.5 "Segoe UI", system-ui, -apple-system, sans-serif; display: flex; flex-direction: column; gap: 8px; }
.tuto-bulle b { font-size: 16px; }
.tuto-bulle p { margin: 0; white-space: pre-line; color: #3A3836; overflow-wrap: anywhere; }
.tuto-pied { display: flex; align-items: center; gap: 8px; margin-top: 4px; }
.tuto-pied .tuto-num { color: #8A847C; font-size: 12px; font-weight: 700; margin-right: auto; }
.tuto-pied button { border: 0; border-radius: 999px; padding: 7px 14px; font: inherit; font-weight: 700; font-size: 13px; cursor: pointer; background: #F1EFEB; color: #1A1A1A; }
.tuto-pied .tuto-passer { background: none; color: #8A847C; padding: 7px 6px; }
.tuto-pied .tuto-suivant { background: #E8701A; color: #fff; }
.tuto-pied button:focus-visible { outline: 2px solid #E8701A; outline-offset: 2px; }
@media (prefers-reduced-motion: reduce) { .tuto-trou { transition: none; } }`;
document.head.appendChild(style);

let calques = null, cibleVue = null;
function fermerCalques() { calques?.forEach(c => c.remove()); calques = null; cibleVue = null; removeEventListener("resize", placer); removeEventListener("scroll", placer, true); document.removeEventListener("keydown", touches, true); }
const visible = el => { if (!el) return false; const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && !el.closest("[hidden]"); };
function trouverCible(c) { const el = !c ? null : typeof c === "function" ? c() : document.querySelector(c); return visible(el) ? el : null; }
function placer() {
  if (!calques) return;
  const [bloque, trou, bulle] = calques, el = cibleVue, W = innerWidth, H = innerHeight, m = 12;
  bloque.classList.toggle("plein", !el); trou.hidden = !el;
  const bw = bulle.offsetWidth, bh = bulle.offsetHeight;
  if (!el) { bulle.style.left = Math.max(m, (W - bw) / 2) + "px"; bulle.style.top = Math.max(m, (H - bh) / 2) + "px"; return; }
  const r = el.getBoundingClientRect(), p = 6;
  Object.assign(trou.style, { left: r.left - p + "px", top: r.top - p + "px", width: r.width + 2 * p + "px", height: r.height + 2 * p + "px" });
  let top = r.bottom + p + 12;
  if (top + bh > H - m) top = r.top - p - 12 - bh >= m ? r.top - p - 12 - bh : Math.max(m, H - bh - m);
  bulle.style.top = top + "px";
  bulle.style.left = Math.min(Math.max(m, r.left + r.width / 2 - bw / 2), W - bw - m) + "px";
}
function touches(e) {
  if (e.key === "Escape") { e.preventDefault(); terminer(); }
  else if (e.key === "ArrowRight") { e.preventDefault(); aller(+1); }
  else if (e.key === "ArrowLeft") { e.preventDefault(); aller(-1); }
}
// les étapes de la visite, sans celles qui ne s'appliquent pas
const etapesActives = () => ETAPES.filter(e => !e.si || e.si());
async function montrer(i) {
  const L = etapesActives(), e = L[i]; if (!e) return terminer();
  if (e.page !== pageActuelle()) { location.href = urlDe(e.page, await etatTuto()); return; }
  if (e.avant) e.avant();
  fermerCalques();
  const bloque = document.createElement("div"), trou = document.createElement("div"), bulle = document.createElement("div");
  bloque.className = "tuto-bloque"; trou.className = "tuto-trou"; bulle.className = "tuto-bulle";
  bulle.setAttribute("role", "dialog"); bulle.setAttribute("aria-modal", "true"); bulle.setAttribute("aria-live", "polite");
  const texte = typeof e.texte === "function" ? await e.texte() : e.texte;
  bulle.innerHTML = `<b></b><p></p><div class="tuto-pied"><span class="tuto-num">${i + 1} / ${L.length}</span>` +
    `<button type="button" class="tuto-passer">${i === L.length - 1 ? "" : "Passer le tuto"}</button>` +
    (i ? `<button type="button" class="tuto-prec">Précédent</button>` : "") +
    `<button type="button" class="tuto-suivant">${i === L.length - 1 ? "Terminer" : "Suivant"}</button></div>`;
  bulle.querySelector("b").textContent = e.titre; bulle.querySelector("p").textContent = texte;
  if (i === L.length - 1) bulle.querySelector(".tuto-passer").hidden = true;
  bulle.querySelector(".tuto-suivant").onclick = () => aller(+1);
  bulle.querySelector(".tuto-prec")?.addEventListener("click", () => aller(-1));
  bulle.querySelector(".tuto-passer").onclick = () => terminer();
  document.body.append(bloque, trou, bulle);
  calques = [bloque, trou, bulle];
  cibleVue = trouverCible(e.cible);
  if (cibleVue) { cibleVue.scrollIntoView({ block: "center", behavior: "instant" }); }
  placer();
  addEventListener("resize", placer); addEventListener("scroll", placer, true); document.addEventListener("keydown", touches, true);
  bulle.querySelector(".tuto-suivant").focus();
}
async function aller(pas) {
  const s = await etatTuto(); if (!s) return;
  const L = etapesActives(), i = Math.max(0, Math.min(L.length, s.i + pas));
  if (i >= L.length) return terminer();
  // en passant au dossier : on choisit le projet montré (ou on crée l'exemple)
  if (L[i].page === "dossier" && !s.id) Object.assign(s, await dossierPourTuto());
  s.i = i; ecrire(sessionStorage, CLE_ETAT, s);
  montrer(i);
}
async function terminer() {
  fermerCalques();
  const s = await etatTuto();
  ecrire(sessionStorage, CLE_ETAT, null); ecrire(localStorage, CLE_VU, true);
  if (s?.adminParTuto) { try { sessionStorage.removeItem("kultivaprix-admin"); } catch (e) {} }
  await effacerExemple();
  if (pageActuelle() === "dossier" && s?.exemple) location.href = "./";
  else if (s?.adminParTuto && pageActuelle() === "param") location.reload();
}

/* ═══ Depuis les pages ═══ */
// premier lancement : le tuto part tout seul (le « Quoi de neuf » attend la fois suivante)
export const tutoPrevu = () => !lire(localStorage, CLE_VU) && !lire(sessionStorage, CLE_ETAT);
export async function lancerTuto() {
  ecrire(sessionStorage, CLE_ETAT, { i: 0 });
  if (pageActuelle() !== "suivi") { location.href = "./"; return; }
  montrer(0);
}
// à appeler une fois la page affichée : reprend la visite en cours, ou la lance au premier lancement (sur le Suivi)
export async function suivreTuto() {
  const s = await etatTuto();
  if (s) return montrer(s.i);
  if (pageActuelle() === "suivi" && tutoPrevu()) return lancerTuto();
}
// partie admin ouverte par la visite (seulement s'il n'y a pas de code) : refermée à la fin
export function noterAdminParTuto() { const s = lire(sessionStorage, CLE_ETAT); if (s) { s.adminParTuto = true; ecrire(sessionStorage, CLE_ETAT, s); } }

// un dossier d'exemple resté d'une visite interrompue : effacé
if (!lire(sessionStorage, CLE_ETAT)) await effacerExemple();
