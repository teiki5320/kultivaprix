/* Pont entre les pages et le logiciel : window.bureau (mémoire dans donnees.json, sauvegardes, Documents POI, liens) */
const { contextBridge, ipcRenderer } = require("electron");
const appel = (canal, ...a) => ipcRenderer.invoke(canal, ...a);

contextBridge.exposeInMainWorld("bureau", {
  kvGet: k => appel("kv:get", k),
  kvPrefixe: pfx => appel("kv:prefixe", pfx),
  kvPut: (k, v) => appel("kv:put", k, v),
  kvTout: () => appel("kv:tout"),
  photo: (base, id, val) => appel("photo", base, id, val),
  photosTout: base => appel("photos:tout", base),
  remplacer: d => appel("remplacer", d),
  infos: () => appel("infos"),
  sauvegardes: () => appel("sauvegardes"),
  restaurer: nom => appel("restaurer", nom),
  copierSauvegarde: () => appel("copier"),
  exporter: (texte, nom) => appel("exporter", texte, nom),
  changerDossier: () => appel("changer-dossier"),
  ouvrir: lien => appel("ouvrir", lien),
  poiEtat: () => appel("poi:etat"),
  poiChoisirBase: () => appel("poi:base"),
  poiChoisirType: id => appel("poi:type", id),
  poiChercher: o => appel("poi:chercher", o),
  poiCreer: o => appel("poi:creer", o),
  ficheChoisir: n => appel("fiche:choisir", n),
  ficheOuvrir: o => appel("fiche:ouvrir", o),
});
