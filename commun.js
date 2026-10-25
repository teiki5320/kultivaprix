/* ═══ Commun à toutes les pages : mémoire, réglages (bouton ⚙ Paramètres), liens, libellés renommés ═══
   Dans le navigateur, la mémoire est rangée dans IndexedDB (base « kultivaprix » + une base de captures ComL par type).
   Dans le logiciel (.exe), window.bureau existe : tout passe par le fichier donnees.json du dossier choisi. */
export const bureau = window.bureau || null;

const ouvrirBase = (nom, magasin) => new Promise((ok, ko) => {
  const r = indexedDB.open(nom, 1);
  r.onupgradeneeded = () => r.result.createObjectStore(magasin);
  r.onsuccess = () => ok(r.result); r.onerror = () => ko(r.error);
});
const bases = {};
const base = (nom, magasin) => bases[nom] || (bases[nom] = ouvrirBase(nom, magasin));
const requete = r => new Promise((ok, ko) => { r.onsuccess = () => ok(r.result); r.onerror = () => ko(r.error); });
const parcourir = (st, plage, cle) => new Promise((ok, ko) => {
  const o = {}, r = st.openCursor(plage);
  r.onsuccess = () => { const c = r.result; if (c) { o[cle(c.key)] = c.value; c.continue(); } else ok(o); }; r.onerror = () => ko(r.error);
});
const transaction = (db, magasin, faire) => new Promise((ok, ko) => {
  const t = db.transaction(magasin, "readwrite"); faire(t.objectStore(magasin));
  t.oncomplete = ok; t.onerror = () => ko(t.error); t.onabort = () => ko(t.error);
});

/* clé → valeur (chaînes JSON ou liste des projets) */
export async function kvGet(k) {
  if (bureau) return bureau.kvGet(k);
  return requete((await base("kultivaprix", "kv")).transaction("kv").objectStore("kv").get(k));
}
// toutes les clés qui commencent par pfx, sans le préfixe
export async function kvPrefixe(pfx) {
  const o = bureau ? await bureau.kvPrefixe(pfx)
    : await parcourir((await base("kultivaprix", "kv")).transaction("kv").objectStore("kv"), IDBKeyRange.bound(pfx, pfx + "\uffff"), k => k.slice(pfx.length));
  return new Map(Object.entries(o));
}
// valeur undefined : la clé est effacée
export async function kvEcrire(k, v) {
  if (bureau) return bureau.kvPut(k, v);
  return transaction(await base("kultivaprix", "kv"), "kv", st => v === undefined ? st.delete(k) : st.put(v, k));
}
export async function kvTout() {
  if (bureau) return bureau.kvTout();
  return parcourir((await base("kultivaprix", "kv")).transaction("kv").objectStore("kv"), undefined, k => k);
}

/* captures des fenêtres ComL : une base par type de dossier ; val undefined = lire, null = effacer */
export const BASES_COML = ["racco-d2-coml", "loc-par-coml", "crea-par-coml"];
export async function photo(nomBase, id, val) {
  if (bureau) return bureau.photo(nomBase, id, val);
  const db = await base(nomBase, "photos");
  if (val === undefined) return requete(db.transaction("photos").objectStore("photos").get(id));
  return transaction(db, "photos", st => val === null ? st.delete(id) : st.put(val, id));
}
async function photosTout(nomBase) {
  if (bureau) return bureau.photosTout(nomBase);
  return parcourir((await base(nomBase, "photos")).transaction("photos").objectStore("photos"), undefined, k => k);
}

/* sauvegarde complète (même format que le bouton Exporter, version 2) */
export async function toutLire() {
  const coml = {}; for (const nom of BASES_COML) coml[nom] = await photosTout(nom);
  return { app: "kultivaprix", version: 2, date: new Date().toISOString(), kv: await kvTout(), coml };
}
export async function toutRemplacer(d) {
  // version 1 : seulement les captures Racco D2
  const parBase = d.version >= 2 ? (d.coml || {}) : { "racco-d2-coml": d.coml || {} };
  const propre = { app: "kultivaprix", version: 2, date: d.date || new Date().toISOString(), kv: d.kv || {}, coml: {} };
  BASES_COML.forEach(nom => { propre.coml[nom] = parBase[nom] || {}; });
  if (bureau) return bureau.remplacer(propre);
  await transaction(await base("kultivaprix", "kv"), "kv", st => { st.clear(); Object.entries(propre.kv).forEach(([k, v]) => st.put(v, k)); });
  for (const nom of BASES_COML)
    await transaction(await base(nom, "photos"), "photos", st => { st.clear(); Object.entries(propre.coml[nom]).forEach(([k, v]) => st.put(v, k)); });
}
export const sauvegardeValable = d => !!(d && d.app === "kultivaprix" && d.kv);

/* ═══ Projets : liste commune ; un projet supprimé passe 30 jours dans la corbeille ═══ */
export const JOURS_CORBEILLE = 30;
export async function lireProjets() { return (await kvGet("projets")) || []; }
export async function viderCorbeille(seulementVieux = true) {
  const L = await lireProjets(), limite = Date.now() - JOURS_CORBEILLE * 864e5;
  const partent = L.filter(p => p.supprime && (!seulementVieux || p.supprime < limite));
  if (!partent.length) return 0;
  for (const p of partent) for (const k of (await kvPrefixe(`p:${p.id}:`)).keys()) await kvEcrire(`p:${p.id}:${k}`, undefined);
  await kvEcrire("projets", L.filter(p => !partent.includes(p)));
  return partent.length;
}

/* ═══ Réglages (⚙ Paramètres) : rangés avec les données, sous la clé « reglages » ═══ */
export const COLONNES = [["feu", "Feu"], ["type", "Type"], ["poi", "N° POI"], ["cab", "Cabinet conseil"], ["adr", "Adresse"], ["el", "Nb EL"],
  ["dlpi", "DLPI"], ["dre", "DRE"], ["dlr", "DLR"], ["note", "Note"]];
export const REGLAGES_DEFAUT = {
  theme: "orange", accent: "", fond: "", sombre: false, taille: 1, densite: "aere",
  libelles: {},                                   // par type de dossier : { "t:<id tâche>" ou "x:<texte d'origine>" : nouveau texte }
  colonnes: COLONNES.map(([k]) => ({ k, vue: true })),
  tri: { k: "feu", sens: 1 }, feux: { rouge: true, orange: true, vert: true, aucun: true },
  typesMasques: [], feries: [], mdp: "",
  sauvegardes: { rythme: "jour", garder: 30, fermeture: true },
};
export async function lireReglages() {
  let r = {}; try { r = JSON.parse((await kvGet("reglages")) || "{}") || {}; } catch (e) {}
  const out = { ...structuredClone(REGLAGES_DEFAUT), ...r };
  out.sauvegardes = { ...REGLAGES_DEFAUT.sauvegardes, ...(r.sauvegardes || {}) };
  out.feux = { ...REGLAGES_DEFAUT.feux, ...(r.feux || {}) };
  // colonnes : celles ajoutées depuis viennent à la fin
  const vues = (r.colonnes || []).filter(c => COLONNES.some(([k]) => k === c.k));
  out.colonnes = [...vues, ...COLONNES.filter(([k]) => !vues.some(c => c.k === k)).map(([k]) => ({ k, vue: true }))];
  garderApparence(out);
  return out;
}
export async function ecrireReglages(r) { garderApparence(r); await kvEcrire("reglages", JSON.stringify(r)); }
// copie de l'apparence pour l'appliquer dès le chargement de la page (apparence.js), avant la mémoire
function garderApparence(r) {
  try { localStorage.setItem("kultivaprix-apparence", JSON.stringify({ theme: r.theme, accent: r.accent, fond: r.fond, sombre: r.sombre, taille: r.taille, densite: r.densite })); } catch (e) {}
  if (window.appliquerApparence) window.appliquerApparence(r);
}
// jours non travaillés ajoutés à la main (en plus des fériés français), pour les dates des ComL
export const feriesEnPlus = r => new Set(r.feries || []);

/* ═══ Liens (Modop, Notes, Documents POI) : navigateur, ou Word / Explorateur dans le logiciel ═══ */
export const lienValide = v => /^https?:\/\/\S+$/i.test(v) || (!!bureau && /^([a-z]:[\\/]|\\\\|file:\/\/)/i.test(v));
export const AIDE_LIEN = bureau ? "Le lien doit commencer par https://, ou être un chemin de fichier (C:\\…)" : "Le lien doit commencer par https://";
export function ouvrirLien(l) {
  if (!l) return;
  if (bureau) bureau.ouvrir(l).then(r => { if (r && r.erreur) alert(r.erreur); });
  else window.open(l, "_blank", "noopener");
}

/* ═══ Documents POI (logiciel) : OneDrive\POI\<type>\<adresse - COMMUNE (N° POI)>\docs GEDAFFAIRE ═══
   le dossier du projet est retrouvé par son N° POI entre parenthèses ; s'il n'existe pas, on propose de le créer */
// « 12 rue des Lilas 44000 NANTES » → « 12 rue des Lilas - NANTES (N° POI) »
export function nomDossierPoi(adresse, nums) {
  const a = String(adresse || "").trim(), m = /^(.*?)[\s,]*\b\d{5}\b\s*(.*)$/.exec(a);
  const rue = (m ? m[1] : a).replace(/[,\s]+$/, ""), commune = m ? m[2].trim() : "";
  const n = nums.filter(Boolean).join(" - ");
  return [rue, commune].filter(Boolean).join(" - ") + (n ? ` (${n})` : "");
}
export async function documentsPoi(type, nums, adresse) {
  nums = nums.map(x => String(x || "").trim()).filter(Boolean);
  const r = await bureau.poiChercher({ type, nums });
  if (r.etat === "ok") return bureau.ouvrir(r.chemin);
  if (r.etat === "base") return choisir({ titre: "Dossier des Documents POI", texte: "Indique d’abord ton dossier « POI » (celui qui contient un sous-dossier par type de dossier) dans ⚙ Paramètres › Documents POI.", boutons: [{ lib: "OK", v: 1, principal: true }] });
  if (r.etat === "type") return choisir({ titre: "Dossier du type introuvable", texte: `Le sous-dossier de ce type de dossier n’a pas été trouvé dans « ${r.base} ». Choisis-le dans ⚙ Paramètres › Documents POI.`, boutons: [{ lib: "OK", v: 1, principal: true }] });
  if (r.etat === "sans-docs") {
    const v = await choisir({ titre: "Pas de dossier « docs GEDAFFAIRE »", texte: `Le dossier du projet existe, mais il n’a pas de sous-dossier « docs GEDAFFAIRE » :\n${r.chemin}`,
      boutons: [{ lib: "Annuler", v: null }, { lib: "Ouvrir le dossier du projet", v: "ouvrir" }, { lib: "Créer « docs GEDAFFAIRE »", v: "creer", principal: true }] });
    if (v === "ouvrir") return bureau.ouvrir(r.chemin);
    if (v === "creer") { const c = await bureau.poiCreer({ type, chemin: r.chemin }); if (c.erreur) return alert(c.erreur); return bureau.ouvrir(c.chemin); }
    return;
  }
  if (r.etat === "plusieurs") {
    const v = await choisir({ titre: "Plusieurs dossiers trouvés", texte: "Lequel ouvrir ?", boutons: [{ lib: "Annuler", v: null }, ...r.liste.map(x => ({ lib: x.nom, v: x.chemin }))] });
    if (v) bureau.ouvrir(v);
    return;
  }
  // aucun dossier : on propose de le créer, avec un nom modifiable
  if (!nums.length) return choisir({ titre: "Pas de N° POI", texte: "Remplis le N° POI du projet : c’est lui qui permet de retrouver son dossier.", boutons: [{ lib: "OK", v: 1, principal: true }] });
  const nom = await demander({ titre: "Créer le dossier du projet ?", texte: `Aucun dossier avec le N° POI ${nums.join(" ou ")} dans :\n${r.dossierType}\n\nIl sera créé avec son sous-dossier « docs GEDAFFAIRE ». Tu peux corriger le nom :`,
    valeur: nomDossierPoi(adresse, nums), ok: "Créer le dossier" });
  if (!nom) return;
  const c = await bureau.poiCreer({ type, nom: nom.trim() });
  if (c.erreur) return alert(c.erreur);
  bureau.ouvrir(c.chemin);
}

/* ═══ Petite fenêtre de saisie (window.prompt n'existe pas dans le logiciel) ═══ */
export function demander({ titre, texte = "", valeur = "", ok = "Enregistrer", type = "text", vide = false }) {
  return new Promise(fin => {
    const f = document.createElement("div");
    f.className = "cm-fond";
    f.innerHTML = `<form class="cm-fen" role="dialog" aria-modal="true"><b class="cm-titre"></b><p class="cm-texte"></p>
      <input class="cm-champ" type="${type}" autocomplete="off"><div class="cm-ko" hidden></div>
      <div class="cm-actions"><button type="button" class="cm-btn" data-cm="non">Annuler</button><button type="submit" class="cm-btn cm-oui">${ok}</button></div></form>`;
    f.querySelector(".cm-titre").textContent = titre;
    f.querySelector(".cm-texte").textContent = texte; f.querySelector(".cm-texte").hidden = !texte;
    const c = f.querySelector(".cm-champ"); c.value = valeur;
    const fermer = v => { f.remove(); fin(v); };
    f.querySelector("form").onsubmit = e => { e.preventDefault(); if (!vide && !c.value.trim()) { c.focus(); return; } fermer(c.value); };
    f.addEventListener("click", e => { if (e.target === f || e.target.closest("[data-cm=non]")) fermer(null); });
    f.addEventListener("keydown", e => { if (e.key === "Escape") { e.stopPropagation(); fermer(null); } });
    document.body.appendChild(f); c.focus(); c.select();
  });
}
// message avec des boutons au choix ; renvoie la valeur du bouton cliqué (null si fermé)
export function choisir({ titre, texte = "", html = "", boutons }) {
  return new Promise(fin => {
    const f = document.createElement("div");
    f.className = "cm-fond";
    f.innerHTML = `<div class="cm-fen" role="dialog" aria-modal="true"><b class="cm-titre"></b><p class="cm-texte"></p><div class="cm-html">${html}</div>
      <div class="cm-actions">${boutons.map((b, i) => `<button type="button" class="cm-btn${b.principal ? " cm-oui" : ""}" data-i="${i}"></button>`).join("")}</div></div>`;
    f.querySelector(".cm-titre").textContent = titre;
    f.querySelector(".cm-texte").textContent = texte; f.querySelector(".cm-texte").hidden = !texte;
    f.querySelectorAll("[data-i]").forEach(b => { b.textContent = boutons[+b.dataset.i].lib; });
    const fermer = v => { f.remove(); fin(v); };
    f.addEventListener("click", e => { const b = e.target.closest("[data-i]"); if (b) fermer(boutons[+b.dataset.i].v); else if (e.target === f) fermer(null); });
    f.addEventListener("keydown", e => { if (e.key === "Escape") fermer(null); });
    document.body.appendChild(f); (f.querySelector(".cm-oui") || f.querySelector("[data-i]")).focus();
  });
}
const styleFenetres = document.createElement("style");
styleFenetres.textContent = `
.cm-fond { position: fixed; inset: 0; z-index: 200; background: rgba(20,18,16,.45); display: flex; align-items: center; justify-content: center; padding: 16px; }
.cm-fen { background: #fff; color: #1A1A1A; border-radius: 14px; padding: 20px 22px; width: min(520px, 100%); display: flex; flex-direction: column; gap: 10px; box-shadow: 0 18px 50px rgba(0,0,0,.3); font-family: "Segoe UI", system-ui, sans-serif; font-size: 14px; }
.cm-titre { font-size: 16px; }
.cm-texte { margin: 0; color: #4A4238; white-space: pre-line; }
.cm-champ { border: 0; border-radius: 8px; background: #F3F1ED; padding: 9px 12px; font: inherit; outline: none; }
.cm-champ:focus { box-shadow: 0 0 0 3px rgba(232,112,26,.3); }
.cm-html:empty { display: none; }
.cm-actions { display: flex; justify-content: flex-end; gap: 8px; flex-wrap: wrap; margin-top: 4px; }
.cm-btn { border: 0; border-radius: 999px; padding: 8px 16px; font: inherit; font-weight: 700; font-size: 13px; cursor: pointer; background: #F1EFEB; color: #1A1A1A; }
.cm-oui { background: #E8701A; color: #fff; }
.renommer-barre { position: fixed; left: 50%; bottom: 14px; transform: translateX(-50%); z-index: 150; background: #1A1A1A; color: #fff; border-radius: 999px; padding: 8px 10px 8px 18px; display: flex; align-items: center; gap: 12px; font: 600 13px "Segoe UI", system-ui, sans-serif; box-shadow: 0 8px 24px rgba(0,0,0,.25); }
.renommer-barre button { border: 0; border-radius: 999px; padding: 6px 14px; font: inherit; font-weight: 700; cursor: pointer; background: #E8701A; color: #fff; }
body.renommer .lib[data-note], body.renommer :is(h2, label, .di-titre, .iu-sec-titre)[data-libelle] { outline: 2px dashed #E8701A; outline-offset: 2px; cursor: text; border-radius: 4px; }`;
document.head.appendChild(styleFenetres);

/* ═══ Libellés renommés (Paramètres › Libellés) ═══
   tâches : par leur identifiant ; autres textes (titres, dates importantes, infos utiles) : par leur texte d'origine, partout où il apparaît */
const SEL_LIBELLES = "h2, label, .di-titre, .iu-sec-titre";
export function appliquerLibellesTaches(reg, type, noeuds) {
  const m = (reg.libelles || {})[type] || {};
  Object.values(noeuds).forEach(n => { if (n.libOrig === undefined) n.libOrig = n.lib; n.lib = m["t:" + n.id] || n.libOrig; });
}
const premierTexte = el => [...el.childNodes].find(x => x.nodeType === 3 && x.nodeValue.trim());
function remplacerTextes(m) {
  document.querySelectorAll(SEL_LIBELLES).forEach(el => {
    if (el.closest("#arbre")) return;
    const t = premierTexte(el); if (!t) return;
    if (el.dataset.libelle === undefined) el.dataset.libelle = t.nodeValue.trim();
    const orig = el.dataset.libelle, voulu = m["x:" + orig] || orig;
    if (t.nodeValue.trim() !== voulu) t.nodeValue = t.nodeValue.replace(t.nodeValue.trim(), voulu);
  });
}
// à appeler une fois la page affichée ; les textes recréés ensuite sont aussi remplacés
export function suivreLibelles(reg, type) {
  const m = () => (reg.libelles || {})[type] || {};
  remplacerTextes(m());
  let attente = null;
  new MutationObserver(() => { if (!attente) attente = requestAnimationFrame(() => { attente = null; remplacerTextes(m()); }); })
    .observe(document.body, { childList: true, subtree: true });
}
// mode « renommer » (lancé depuis les Paramètres) : un clic sur un texte permet de le changer
export function modeRenommer(reg, type, noeuds, rafraichir) {
  let actif = false; try { actif = sessionStorage.getItem("kultivaprix-renommer") === "1"; } catch (e) {}
  if (!actif) return;
  document.body.classList.add("renommer");
  const barre = document.createElement("div");
  barre.className = "renommer-barre";
  barre.innerHTML = `<span>Mode renommer : clique sur un nom de tâche, de date ou un titre pour le changer</span><button type="button">Terminer</button>`;
  barre.querySelector("button").onclick = () => { try { sessionStorage.removeItem("kultivaprix-renommer"); } catch (e) {} document.body.classList.remove("renommer"); barre.remove(); };
  document.body.appendChild(barre);
  document.addEventListener("click", async e => {
    if (!document.body.classList.contains("renommer") || e.target.closest(".renommer-barre, .cm-fond")) return;
    const lib = e.target.closest(".lib[data-note]"), autre = !lib && e.target.closest("[data-libelle]");
    if (!lib && !autre) return;
    e.preventDefault(); e.stopPropagation();
    const m = (reg.libelles[type] = reg.libelles[type] || {});
    const cle = lib ? "t:" + lib.dataset.note : "x:" + autre.dataset.libelle;
    const orig = lib ? noeuds[lib.dataset.note].libOrig : autre.dataset.libelle;
    const v = await demander({ titre: "Renommer", texte: `Texte d’origine : « ${orig} »\nLaisse vide pour revenir au texte d’origine.`, valeur: m[cle] || orig, vide: true });
    if (v === null) return;
    if (!v.trim() || v.trim() === orig) delete m[cle]; else m[cle] = v.trim();
    await ecrireReglages(reg);
    if (lib) appliquerLibellesTaches(reg, type, noeuds);
    rafraichir(); remplacerTextes(m);
  }, true);
}

/* ═══ Version du programme (affichée en bas du Suivi et dans les Paramètres) ═══ */
export { VERSION, NOUVEAUTES } from "./nouveautes.js";
