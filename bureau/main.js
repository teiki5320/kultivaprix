/* ═══ Racco D2 — le logiciel (.exe) ═══
   - les pages du Suivi des dossiers, servies depuis le programme lui-même (adresse app://local/) ;
   - aucune connexion Internet : toute requête vers l'extérieur est bloquée, les liens s'ouvrent dans le navigateur ou dans Word ;
   - les données vivent dans donnees.json, dans le dossier choisi au premier lancement (OneDrive…), avec des copies datées dans « Sauvegardes ». */
const { app, BrowserWindow, protocol, ipcMain, dialog, shell, session, Menu } = require("electron");
const path = require("path"), fs = require("fs"), { fileURLToPath } = require("url");

const RACINE = path.join(__dirname, "..");
const BASES_COML = ["racco-d2-coml", "loc-par-coml", "crea-par-coml"];
protocol.registerSchemesAsPrivileged([{ scheme: "app", privileges: { standard: true, secure: true, supportFetchAPI: true } }]);
if (process.env.RACCO_PROFIL) app.setPath("userData", process.env.RACCO_PROFIL);   // essais : un profil à part
if (!app.requestSingleInstanceLock()) app.quit();   // un seul logiciel ouvert à la fois (un seul qui écrit dans donnees.json)

/* ═══ Réglages du PC (pas dans les données) : dossier des données, dossier « POI » ═══ */
const FICHIER_CONFIG = () => path.join(app.getPath("userData"), "config.json");
let config = {};
const lireConfig = () => { try { config = JSON.parse(fs.readFileSync(FICHIER_CONFIG(), "utf8")) || {}; } catch (e) { config = {}; } };
const ecrireConfig = () => { fs.mkdirSync(path.dirname(FICHIER_CONFIG()), { recursive: true }); fs.writeFileSync(FICHIER_CONFIG(), JSON.stringify(config, null, 2)); };

/* ═══ Données : en mémoire, écrites dans donnees.json peu après chaque modification ═══ */
let dossier = null, donnees = null, minuterie = null;
const fichierDonnees = (d = dossier) => path.join(d, "donnees.json");
const dossierSauvegardes = (d = dossier) => path.join(d, "Sauvegardes");
const vides = () => ({ app: "kultivaprix", version: 2, date: new Date().toISOString(), kv: {}, coml: Object.fromEntries(BASES_COML.map(b => [b, {}])) });
function propres(d) {
  const o = vides(); o.date = d.date || o.date; o.kv = d.kv || {};
  BASES_COML.forEach(b => { o.coml[b] = (d.coml && d.coml[b]) || {}; });
  return o;
}
function lireFichier(f) {
  const d = JSON.parse(fs.readFileSync(f, "utf8"));
  if (!d || d.app !== "kultivaprix" || !d.kv) throw new Error("ce fichier n'est pas une sauvegarde du suivi des dossiers");
  return propres(d);
}
const attendre = ms => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
// écriture sûre : un fichier temporaire, puis il remplace l'ancien (plusieurs essais si OneDrive ou l'antivirus le bloque un instant)
function ecrireSur(f, texte) {
  const tmp = f + ".tmp";
  fs.writeFileSync(tmp, texte);
  for (let i = 0; ; i++) {
    try { fs.renameSync(tmp, f); return; }
    catch (e) { if (i >= 8) { fs.writeFileSync(f, texte); try { fs.unlinkSync(tmp); } catch (e2) {} return; } attendre(120); }
  }
}
let alerteEcriture = 0;
function ecrireMaintenant() {
  clearTimeout(minuterie); minuterie = null;
  if (!donnees || !dossier) return;
  try { donnees.date = new Date().toISOString(); ecrireSur(fichierDonnees(), JSON.stringify(donnees)); }
  catch (e) {
    if (Date.now() - alerteEcriture > 60000) { alerteEcriture = Date.now();
      dialog.showErrorBox("Enregistrement impossible", `Les données n'ont pas pu être écrites dans :\n${fichierDonnees()}\n\n${e.message}\n\nVérifie que le dossier est accessible (OneDrive démarré ?). Le logiciel réessaiera à la prochaine modification.`); }
  }
}
const planifier = () => { clearTimeout(minuterie); minuterie = setTimeout(ecrireMaintenant, 500); };

/* ═══ Copies de sécurité (sous-dossier « Sauvegardes ») ═══ */
const deux = n => String(n).padStart(2, "0");
const jour = (d = new Date()) => `${d.getFullYear()}-${deux(d.getMonth() + 1)}-${deux(d.getDate())}`;
const heure = (d = new Date()) => `${deux(d.getHours())}h${deux(d.getMinutes())}`;
const SORTES = { jour: "jour", semaine: "semaine", fermeture: "fermeture", restauration: "avant restauration", import: "avant import" };
const RE_COPIE = /^donnees (jour|semaine|fermeture|avant restauration|avant import) (\d{4}-\d{2}-\d{2})(?: (\d{2})h(\d{2}))?\.json$/;
function reglagesCopies() {
  let r = {}; try { r = JSON.parse((donnees && donnees.kv.reglages) || "{}").sauvegardes || {}; } catch (e) {}
  return { rythme: r.rythme === "semaine" ? "semaine" : "jour", garder: Math.max(1, +r.garder || 30), fermeture: r.fermeture !== false };
}
function listeCopies() {
  let noms = []; try { noms = fs.readdirSync(dossierSauvegardes()); } catch (e) { return []; }
  return noms.map(nom => { const m = RE_COPIE.exec(nom); if (!m) return null;
    const sorte = Object.keys(SORTES).find(k => SORTES[k] === m[1]), st = fs.statSync(path.join(dossierSauvegardes(), nom));
    return { nom, sorte, date: st.mtime.toISOString(), taille: st.size }; })
    .filter(Boolean).sort((a, b) => b.date.localeCompare(a.date));
}
function faireCopie(sorte) {
  if (!donnees) return null;
  fs.mkdirSync(dossierSauvegardes(), { recursive: true });
  const nom = `donnees ${SORTES[sorte]} ${jour()}${sorte === "jour" || sorte === "semaine" ? "" : " " + heure()}.json`;
  ecrireSur(path.join(dossierSauvegardes(), nom), JSON.stringify(donnees));
  return nom;
}
// on ne garde que les plus récentes de chaque sorte
function elaguer(sorte, garder) {
  listeCopies().filter(c => c.sorte === sorte).slice(garder).forEach(c => { try { fs.unlinkSync(path.join(dossierSauvegardes(), c.nom)); } catch (e) {} });
}
function copieAuto() {
  try {
    const r = reglagesCopies(), L = listeCopies().filter(c => c.sorte === r.rythme);
    const derniere = L[0] ? new Date(L[0].date) : null;
    const due = !derniere || (r.rythme === "jour" ? jour(derniere) !== jour() : Date.now() - derniere > 7 * 864e5);
    if (due) faireCopie(r.rythme);
    elaguer(r.rythme, r.garder);
    ["restauration", "import"].forEach(s => elaguer(s, 10));
  } catch (e) {}
}

/* ═══ Choix du dossier des données (premier lancement, ou dossier introuvable) ═══ */
async function demanderDossier(titre, detail) {
  await dialog.showMessageBox({ type: "info", title: "Racco D2", message: titre, detail, buttons: ["Choisir le dossier…"] });
  const r = await dialog.showOpenDialog({ title: "Dossier des données", properties: ["openDirectory", "createDirectory", "promptToCreate"] });
  return r.canceled ? null : r.filePaths[0];
}
async function ouvrirDonnees() {
  lireConfig();
  for (;;) {
    let d = config.dossier;
    if (!d) d = await demanderDossier("Bienvenue !", "Choisis le dossier où enregistrer tes données, par exemple un dossier « Racco D2 - données » dans ton OneDrive.\nTu pourras le changer plus tard dans ⚙ Paramètres.");
    else if (!fs.existsSync(d)) {
      const r = await dialog.showMessageBox({ type: "warning", title: "Racco D2", message: "Le dossier des données est introuvable", detail: `${d}\n\nOneDrive est-il bien démarré et synchronisé ?`, buttons: ["Réessayer", "Choisir un autre dossier", "Quitter"], defaultId: 0, cancelId: 2 });
      if (r.response === 2) return false;
      if (r.response === 1) d = await demanderDossier("Dossier des données", "Choisis le dossier qui contient (ou contiendra) donnees.json.");
      else continue;
    }
    if (!d) return false;
    try { fs.mkdirSync(d, { recursive: true }); } catch (e) {}
    if (!fs.existsSync(fichierDonnees(d))) { dossier = d; donnees = vides(); ecrireMaintenant(); }
    else {
      try { donnees = lireFichier(fichierDonnees(d)); dossier = d; }
      catch (e) {
        dossier = d;
        const copies = listeCopies();
        const r = await dialog.showMessageBox({ type: "error", title: "Racco D2", message: "Le fichier des données est abîmé", detail: `${fichierDonnees(d)}\n${e.message}`,
          buttons: copies.length ? ["Reprendre la dernière sauvegarde", "Quitter"] : ["Quitter"], defaultId: 0 });
        if (!copies.length || r.response !== 0) return false;
        fs.copyFileSync(fichierDonnees(d), path.join(d, `donnees abime ${jour()} ${heure()}.json`));
        donnees = lireFichier(path.join(dossierSauvegardes(), copies[0].nom)); ecrireMaintenant();
      }
    }
    config.dossier = dossier; ecrireConfig();
    return true;
  }
}

/* ═══ Documents POI : on ouvre OneDrive\POI\<type>\<adresse - COMMUNE (N° POI)>, qui contient « docs GEDAFFAIRE » ═══ */
const norm = s => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");
const MOTS_TYPE = { "racco-d2": ["raccod2", "racco"], "loc-par": ["localisation"], "crea-par": ["creation"], "pim": ["pim"], "echec-prod": ["echec"] };
const sousDossiers = d => { try { return fs.readdirSync(d, { withFileTypes: true }).filter(x => x.isDirectory()).map(x => x.name); } catch (e) { return []; } };
function dossierType(id) {
  if (!config.poiBase) return null;
  const choisi = (config.poiTypes || {})[id];
  if (choisi && fs.existsSync(choisi)) return choisi;
  const noms = sousDossiers(config.poiBase);
  for (const mot of MOTS_TYPE[id] || []) { const n = noms.find(x => norm(x).includes(mot)); if (n) return path.join(config.poiBase, n); }
  return null;
}
const etatPoi = () => ({ base: config.poiBase || "", types: Object.fromEntries(Object.keys(MOTS_TYPE).map(id => [id, dossierType(id)])), fiches: config.fiches || {} });
// numéros entre les dernières parenthèses du nom : « (12345678 - 23456789) »
function numerosDuNom(nom) {
  const m = /\(([^()]*)\)\s*$/.exec(nom) || /\(([^()]*)\)/.exec(nom);
  return m ? m[1].split(/[\s\-–\/,;]+/).map(x => x.trim().toUpperCase()).filter(Boolean) : [];
}
const nomPropre = n => n.replace(/[<>:"/\\|?*\u0000-\u001f]/g, "-").replace(/[. ]+$/, "").trim();
// recherche du dossier du projet par ses N° POI
function chercherProjet(type, nums) {
  if (!config.poiBase || !fs.existsSync(config.poiBase)) return { etat: "base" };
  const dt = dossierType(type); if (!dt) return { etat: "type", base: config.poiBase };
  const voulus = (nums || []).map(n => String(n).trim().toUpperCase()).filter(Boolean);
  const trouves = sousDossiers(dt).filter(nom => numerosDuNom(nom).some(n => voulus.includes(n)));
  if (!trouves.length) return { etat: "aucun", dossierType: dt };
  if (trouves.length > 1) return { etat: "plusieurs", liste: trouves.map(nom => ({ nom, chemin: path.join(dt, nom) })) };
  return { etat: "trouve", chemin: path.join(dt, trouves[0]) };
}

/* ═══ Fiches préremplies (Racco D2) : copies vierges des modèles Excel dans <projet>\Fiches préremplies ═══ */
const DOSSIER_FICHES = "Fiches préremplies";
const TYPES_FICHES = ["racco-d2"];
// « Fiche CMS.xlsx » + N° POI → « Fiche CMS - BHU510263 - BHU510264.xlsx »
const nomFiche = (modele, nums) => { const ext = path.extname(modele), base = path.basename(modele, ext);
  return nomPropre([base, ...(nums || []).map(n => String(n).trim()).filter(Boolean)].join(" - ")) + ext; };
// ajoute ce qui manque (sous-dossier et fiches) ; ne remplace jamais une fiche existante ; renvoie les problèmes
function ajouterFiches(type, projet, nums) {
  if (!TYPES_FICHES.includes(type)) return [];
  const modeles = Object.entries(config.fiches || {}).filter(([, m]) => m); if (!modeles.length) return [];
  const pbs = [], dossierFiches = path.join(projet, DOSSIER_FICHES);
  try { fs.mkdirSync(dossierFiches, { recursive: true }); } catch (e) { return [`Le dossier « ${DOSSIER_FICHES} » n'a pas pu être créé : ${e.message}`]; }
  for (const [n, modele] of modeles) {
    if (!fs.existsSync(modele)) { pbs.push(`Modèle du Fichier ${n.slice(1)} introuvable :\n${modele}`); continue; }
    const cible = path.join(dossierFiches, nomFiche(modele, nums));
    if (fs.existsSync(cible)) continue;
    try { fs.copyFileSync(modele, cible, fs.constants.COPYFILE_EXCL); } catch (e) { if (e.code !== "EEXIST") pbs.push(`La fiche n'a pas pu être copiée : ${e.message}`); }
  }
  return pbs;
}

/* ═══ Fenêtre ═══ */
let fenetre = null;
function creerFenetre() {
  fenetre = new BrowserWindow({
    width: 1500, height: 950, minWidth: 900, minHeight: 600, show: false, backgroundColor: "#EDE4D6", autoHideMenuBar: true, title: "Racco D2",
    webPreferences: { preload: path.join(__dirname, "preload.js"), contextIsolation: true, sandbox: true, nodeIntegration: false, spellcheck: true },
  });
  fenetre.once("ready-to-show", () => { fenetre.maximize(); fenetre.show(); });
  fenetre.loadURL("app://local/index.html");
  fenetre.on("close", () => { ecrireMaintenant(); });
  fenetre.on("closed", () => { fenetre = null; });
}
function proteger(wc) {
  // liens : jamais dans le logiciel ; les pages web s'ouvrent dans le navigateur, les pièces jointes (blob:) dans une fenêtre à part
  wc.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("blob:app://")) return { action: "allow", overrideBrowserWindowOptions: { autoHideMenuBar: true, webPreferences: { sandbox: true, contextIsolation: true } } };
    if (/^https?:\/\//i.test(url)) shell.openExternal(url);
    return { action: "deny" };
  });
  wc.on("will-navigate", (e, url) => { if (!url.startsWith("app://local/")) { e.preventDefault(); if (/^https?:\/\//i.test(url)) shell.openExternal(url); } });
  wc.on("will-attach-webview", e => e.preventDefault());
}

app.whenReady().then(async () => {
  // aucune requête vers l'extérieur : seules les pages du programme sont chargées
  session.defaultSession.webRequest.onBeforeRequest((d, cb) => cb({ cancel: !/^(app|blob|data|devtools):/i.test(d.url) }));
  session.defaultSession.setPermissionRequestHandler((wc, permission, cb) => cb(permission === "clipboard-sanitized-write"));
  try { session.defaultSession.setSpellCheckerLanguages(["fr"]); } catch (e) {}
  // les pages du programme (lues directement : rien ne passe par le réseau)
  const TYPES_MIME = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".json": "application/json", ".png": "image/png", ".svg": "image/svg+xml", ".ico": "image/x-icon" };
  protocol.handle("app", async req => {
    let p = decodeURIComponent(new URL(req.url).pathname);
    if (p.endsWith("/")) p += "index.html";
    const f = path.join(RACINE, p);
    if (!f.startsWith(RACINE + path.sep) || /[\\/](bureau|node_modules|dist|excel|propositions-racco)[\\/]/.test(f.slice(RACINE.length))) return new Response("", { status: 404 });
    try { return new Response(await fs.promises.readFile(f), { headers: { "content-type": TYPES_MIME[path.extname(f).toLowerCase()] || "application/octet-stream" } }); }
    catch (e) { return new Response("", { status: 404 }); }
  });
  app.on("web-contents-created", (e, wc) => proteger(wc));
  Menu.setApplicationMenu(Menu.buildFromTemplate([
    { label: "Fichier", submenu: [{ role: "quit", label: "Quitter" }] },
    { label: "Édition", submenu: [{ role: "undo", label: "Annuler" }, { role: "redo", label: "Rétablir" }, { type: "separator" }, { role: "cut", label: "Couper" }, { role: "copy", label: "Copier" }, { role: "paste", label: "Coller" }, { role: "selectAll", label: "Tout sélectionner" }] },
    { label: "Affichage", submenu: [{ role: "reload", label: "Actualiser" }, { type: "separator" }, { role: "zoomIn", label: "Zoom avant" }, { role: "zoomOut", label: "Zoom arrière" }, { role: "resetZoom", label: "Taille réelle" }, { type: "separator" }, { role: "togglefullscreen", label: "Plein écran" }, { role: "toggleDevTools", label: "Outils de développement" }] },
  ]));
  if (!await ouvrirDonnees()) { app.quit(); return; }
  copieAuto();
  setInterval(copieAuto, 60 * 60 * 1000);   // logiciel ouvert plusieurs jours : une copie par jour quand même
  creerFenetre();
});
app.on("second-instance", () => { if (fenetre) { if (fenetre.isMinimized()) fenetre.restore(); fenetre.focus(); } });
let copieFermetureFaite = false;
app.on("before-quit", () => {
  ecrireMaintenant();
  if (!copieFermetureFaite && donnees && dossier && reglagesCopies().fermeture) { copieFermetureFaite = true; try { faireCopie("fermeture"); elaguer("fermeture", 10); } catch (e) {} }
});
app.on("window-all-closed", () => app.quit());

/* ═══ Ce que les pages demandent (window.bureau) ═══ */
const repondre = (canal, f) => ipcMain.handle(canal, (e, ...a) => f(...a));
repondre("kv:get", k => donnees.kv[k]);
repondre("kv:prefixe", pfx => Object.fromEntries(Object.entries(donnees.kv).filter(([k]) => k.startsWith(pfx)).map(([k, v]) => [k.slice(pfx.length), v])));
repondre("kv:put", (k, v) => { if (v === undefined) delete donnees.kv[k]; else donnees.kv[k] = v; planifier(); });
repondre("kv:tout", () => donnees.kv);
repondre("photo", (base, id, val) => {
  const b = donnees.coml[base] || (donnees.coml[base] = {});
  if (val === undefined) return b[id];
  if (val === null) delete b[id]; else b[id] = val;
  planifier();
});
repondre("photos:tout", base => donnees.coml[base] || {});
repondre("remplacer", d => { ecrireMaintenant(); faireCopie("import"); donnees = propres(d); ecrireMaintenant(); });
repondre("infos", () => ({ version: app.getVersion(), dossier }));
repondre("sauvegardes", () => listeCopies());
repondre("restaurer", nom => {
  try {
    if (!RE_COPIE.test(nom)) throw new Error("sauvegarde inconnue");
    const d = lireFichier(path.join(dossierSauvegardes(), nom));
    ecrireMaintenant(); faireCopie("restauration"); donnees = d; ecrireMaintenant();
    return { ok: true };
  } catch (e) { return { erreur: `La sauvegarde n'a pas pu être restaurée : ${e.message}` }; }
});
repondre("copier", async () => {
  const r = await dialog.showOpenDialog(fenetre, { title: "Où copier la sauvegarde ?", properties: ["openDirectory", "createDirectory"] });
  if (r.canceled) return { annule: true };
  try { ecrireMaintenant(); const f = path.join(r.filePaths[0], `donnees copie ${jour()} ${heure()}.json`); ecrireSur(f, JSON.stringify(donnees)); return { chemin: f }; }
  catch (e) { return { erreur: `La copie n'a pas pu être faite : ${e.message}` }; }
});
repondre("exporter", async (texte, nom) => {
  const r = await dialog.showSaveDialog(fenetre, { title: "Exporter", defaultPath: path.join(app.getPath("documents"), nom), filters: [{ name: "Sauvegarde", extensions: ["json"] }] });
  if (r.canceled) return { annule: true };
  try { fs.writeFileSync(r.filePath, texte); return { chemin: r.filePath }; } catch (e) { return { erreur: `L'export n'a pas pu être enregistré : ${e.message}` }; }
});
repondre("changer-dossier", async () => {
  const r = await dialog.showOpenDialog(fenetre, { title: "Nouvel emplacement des données", properties: ["openDirectory", "createDirectory", "promptToCreate"] });
  if (r.canceled) return { annule: true };
  const d = r.filePaths[0];
  if (path.resolve(d) === path.resolve(dossier)) return { dossier };
  try {
    ecrireMaintenant();
    if (fs.existsSync(fichierDonnees(d))) {
      const c = await dialog.showMessageBox(fenetre, { type: "question", title: "Racco D2", message: "Ce dossier contient déjà des données", detail: "Lesquelles garder ?",
        buttons: ["Mes données actuelles (elles remplacent celles du dossier)", "Les données de ce dossier", "Annuler"], defaultId: 0, cancelId: 2 });
      if (c.response === 2) return { annule: true };
      if (c.response === 1) { const lu = lireFichier(fichierDonnees(d)); dossier = d; donnees = lu; config.dossier = d; ecrireConfig(); fenetre.reload(); return { dossier }; }
      fs.copyFileSync(fichierDonnees(d), path.join(d, `donnees remplacees ${jour()} ${heure()}.json`));
    }
    fs.mkdirSync(d, { recursive: true });
    if (fs.existsSync(dossierSauvegardes())) fs.cpSync(dossierSauvegardes(), dossierSauvegardes(d), { recursive: true });
    const ancien = dossier; dossier = d; ecrireMaintenant(); config.dossier = d; ecrireConfig();
    await dialog.showMessageBox(fenetre, { type: "info", title: "Racco D2", message: "Données déplacées", detail: `Nouvel emplacement :\n${d}\n\nL'ancien dossier n'a pas été effacé :\n${ancien}` });
    return { dossier };
  } catch (e) { return { erreur: `Le changement d'emplacement n'a pas pu être fait : ${e.message}` }; }
});
repondre("ouvrir", async lien => {
  const l = String(lien || "").trim();
  if (/^https?:\/\//i.test(l)) { await shell.openExternal(l); return { ok: true }; }
  let p = l; try { if (/^file:/i.test(l)) p = fileURLToPath(l); } catch (e) {}
  if (!p || !fs.existsSync(p)) return { erreur: `Fichier ou dossier introuvable :\n${p}` };
  const err = await shell.openPath(p);
  return err ? { erreur: err } : { ok: true };
});
repondre("poi:etat", () => etatPoi());
repondre("poi:base", async () => {
  const r = await dialog.showOpenDialog(fenetre, { title: "Dossier « POI »", defaultPath: config.poiBase || app.getPath("home"), properties: ["openDirectory"] });
  if (!r.canceled) { config.poiBase = r.filePaths[0]; config.poiTypes = {}; ecrireConfig(); }
  return etatPoi();
});
repondre("poi:type", async id => {
  const r = await dialog.showOpenDialog(fenetre, { title: "Sous-dossier du type de dossier", defaultPath: dossierType(id) || config.poiBase, properties: ["openDirectory"] });
  if (!r.canceled) { config.poiTypes = { ...(config.poiTypes || {}), [id]: r.filePaths[0] }; ecrireConfig(); }
  return etatPoi();
});
repondre("poi:chercher", ({ type, nums }) => {
  const r = chercherProjet(type, nums);
  if (r.etat !== "trouve") return r;
  const docs = sousDossiers(r.chemin).find(n => norm(n) === "docsgedaffaire");
  return docs ? { etat: "ok", chemin: r.chemin, problemes: ajouterFiches(type, r.chemin, nums) } : { etat: "sans-docs", chemin: r.chemin };
});
repondre("poi:creer", ({ type, nom, chemin, nums }) => {
  try {
    let projet = chemin;
    if (!projet) {
      const dt = dossierType(type); if (!dt) throw new Error("dossier du type introuvable");
      const n = nomPropre(nom || ""); if (!n) throw new Error("nom vide");
      projet = path.join(dt, n);
    }
    const docs = path.join(projet, "docs GEDAFFAIRE");
    fs.mkdirSync(docs, { recursive: true });
    return { chemin: projet, problemes: ajouterFiches(type, projet, nums) };
  } catch (e) { return { erreur: `Le dossier n'a pas pu être créé : ${e.message}` }; }
});
repondre("fiche:choisir", async n => {
  const r = await dialog.showOpenDialog(fenetre, { title: `Modèle du Fichier ${n} (fiche préremplie)`, defaultPath: (config.fiches || {})["f" + n] || config.poiBase || app.getPath("home"),
    properties: ["openFile"], filters: [{ name: "Excel", extensions: ["xlsx", "xlsm", "xls"] }, { name: "Tous les fichiers", extensions: ["*"] }] });
  if (!r.canceled) { config.fiches = { ...(config.fiches || {}), ["f" + n]: r.filePaths[0] }; ecrireConfig(); }
  return etatPoi();
});
// bouton rose : ouvre la fiche du projet dans Excel
repondre("fiche:ouvrir", async ({ type, nums, n, chemin }) => {
  const modele = (config.fiches || {})["f" + n];
  if (!modele) return { etat: "modele" };
  let projet = chemin;
  if (!projet) { const r = chercherProjet(type, nums); if (r.etat !== "trouve") return r; projet = r.chemin; }
  const dossierFiches = path.join(projet, DOSSIER_FICHES), voulu = path.join(dossierFiches, nomFiche(modele, nums));
  // nom exact, sinon une fiche qui commence par le nom du modèle (N° POI complété depuis, par exemple)
  let f = fs.existsSync(voulu) ? voulu : null;
  if (!f) { const debut = norm(path.basename(modele, path.extname(modele)));
    let noms = []; try { noms = fs.readdirSync(dossierFiches); } catch (e) {}
    const t = noms.find(x => !x.startsWith("~$") && norm(x).startsWith(debut)); if (t) f = path.join(dossierFiches, t); }
  if (!f) return { etat: "absente", chemin: voulu };
  const err = await shell.openPath(f);
  return err ? { etat: "erreur", erreur: err } : { etat: "ok" };
});
