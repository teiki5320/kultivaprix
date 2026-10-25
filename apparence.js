/* ═══ Apparence (⚙ Paramètres) : thème de couleurs, couleurs une par une, mode sombre, taille du texte, densité ═══
   Script classique placé juste après le <style> de chaque page : il recolore les règles CSS de la page
   (les couleurs orange d'origine prennent la couleur principale choisie, le beige prend la couleur de fond),
   avant l'affichage, d'après la copie gardée par commun.js. */
(function () {
  const THEMES = {
    orange: { nom: "Orange", accent: "#E8701A", fond: "#EDE4D6" },
    bleu: { nom: "Bleu", accent: "#2F6FB5", fond: "#E3E8EE" },
    vert: { nom: "Vert", accent: "#3E8A5B", fond: "#ECEADC" },
    gris: { nom: "Gris", accent: "#4A4A4A", fond: "#E6E6E6" } };
  window.THEMES_APPARENCE = THEMES;
  // couleurs qui ne changent jamais : feux d'urgence, voyants, fenêtres communes
  const GARDEES = /feu|\.led|urgence|\.ff\b|\.cm-|renommer/;

  const hexVersRgb = h => { h = h.replace("#", ""); if (h.length <= 4) h = [...h].map(c => c + c).join("");
    return { r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16), a: h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1 }; };
  function versHsl({ r, g, b, a }) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2; let h = 0, s = 0;
    if (max !== min) { const d = max - min; s = l > .5 ? d / (2 - max - min) : d / (max + min);
      h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4; h *= 60; }
    return { h, s, l, a };
  }
  function versRgb({ h, s, l, a }) {
    const f = n => { const k = (n + h / 30) % 12, x = s * Math.min(l, 1 - l); return Math.round(255 * (l - x * Math.max(-1, Math.min(k - 3, 9 - k, 1)))); };
    return a < 1 ? `rgba(${f(0)}, ${f(8)}, ${f(4)}, ${+a.toFixed(3)})` : `rgb(${f(0)}, ${f(8)}, ${f(4)})`;
  }
  const borne = x => Math.max(0, Math.min(1, x));
  const ORANGE = versHsl(hexVersRgb(THEMES.orange.accent)), BEIGE = hexVersRgb(THEMES.orange.fond);
  const proche = (c, d) => Math.abs(c.r - d.r) + Math.abs(c.g - d.g) + Math.abs(c.b - d.b) < 6;

  // une couleur d'origine → la couleur voulue (prop : la propriété CSS, pour le mode sombre)
  function changer(rgb, prop, o) {
    let c = versHsl(rgb);
    const accent = c.s > .45 && c.h >= 12 && c.h <= 40;   // famille de l'orange (bandeaux, boutons, pêche…)
    let fond = false;
    if (accent && o.accent) {
      const A = o.accent, poids = 1 - Math.min(1, Math.abs(c.l - ORANGE.l) / (c.l > ORANGE.l ? 1 - ORANGE.l : ORANGE.l));
      c = { h: A.h, s: borne(c.s * A.s / ORANGE.s), l: borne(c.l + (A.l - ORANGE.l) * poids), a: c.a };
    } else if (proche(rgb, BEIGE)) { fond = true; if (o.fond) c = { ...o.fond, a: c.a }; }
    if (o.sombre) {
      const texte = prop === "color" || /^--(texte|muted|.*ink)$/.test(prop) || /caret|text-decoration/.test(prop);
      const vif = c.s > .45 && c.l > .3 && c.l < .72;
      if (/shadow/.test(prop)) { /* ombres : inchangées */ }
      else if (texte) { if (c.l < .6 && !vif) c = { ...c, s: c.s * .6, l: 1 - c.l * .85 }; }
      else if (fond) c = { ...c, s: c.s * .4, l: .09 };
      else if (c.l >= .45 && !vif) c = { ...c, s: c.s * .5, l: .15 + (1 - c.l) * .5 };
    }
    return versRgb(c);
  }
  const RE_COULEUR = /#[0-9a-f]{3,8}\b|rgba?\([^)]*\)/gi;
  function lireCouleur(t) {
    if (t[0] === "#") return hexVersRgb(t);
    const n = t.match(/[\d.]+%?/g).map(Number.parseFloat); return { r: n[0], g: n[1], b: n[2], a: n[3] === undefined ? 1 : n[3] };
  }

  // valeurs d'origine des règles qui contiennent une couleur
  const vues = new WeakSet(), origines = [];
  function relever(regles) {
    for (const r of regles) {
      if (vues.has(r)) continue; vues.add(r);
      if (r.style && !GARDEES.test(r.selectorText || "")) for (let i = 0; i < r.style.length; i++) {
        const p = r.style[i], v = r.style.getPropertyValue(p);
        if (/#[0-9a-f]{3,8}\b|rgba?\(/i.test(v)) origines.push({ st: r.style, p, v, prio: r.style.getPropertyPriority(p) });
      }
      if (r.cssRules) relever(r.cssRules);
    }
  }
  function releverTout() { for (const f of document.styleSheets) { try { relever(f.cssRules); } catch (e) {} } }

  let styleDensite = null;
  window.appliquerApparence = function (a) {
    a = a || {};
    const t = THEMES[a.theme] || THEMES.orange, ac = a.accent || t.accent, fo = a.fond || t.fond;
    const o = { accent: ac.toLowerCase() === THEMES.orange.accent.toLowerCase() ? null : versHsl(hexVersRgb(ac)),
      fond: fo.toLowerCase() === THEMES.orange.fond.toLowerCase() ? null : versHsl(hexVersRgb(fo)), sombre: !!a.sombre };
    releverTout();
    const rien = !o.accent && !o.fond && !o.sombre;
    origines.forEach(x => {
      const v = rien ? x.v : x.v.replace(RE_COULEUR, m => { try { return changer(lireCouleur(m), x.p, o); } catch (e) { return m; } });
      if (x.st.getPropertyValue(x.p) !== v) x.st.setProperty(x.p, v, x.prio);
    });
    document.documentElement.style.colorScheme = o.sombre ? "dark" : "";
    document.documentElement.classList.toggle("theme-sombre", o.sombre);
    document.documentElement.style.zoom = a.taille && a.taille !== 1 ? a.taille : "";
    if (!styleDensite) { styleDensite = document.createElement("style"); styleDensite.id = "densite"; document.head.appendChild(styleDensite); }
    styleDensite.textContent = a.densite === "compact" ? `
.page { gap: 10px !important; padding-top: 14px !important; padding-bottom: 14px !important; }
.split { gap: 12px !important; }
.card { padding: 12px 14px !important; }
.card > h2 { margin: -12px -14px 10px !important; padding-top: 9px !important; padding-bottom: 9px !important; }
.bandeau { margin: -12px -14px 0 !important; padding-top: 9px !important; padding-bottom: 9px !important; }
td { padding-top: 7px !important; padding-bottom: 7px !important; }
.ligne { min-height: 32px !important; padding-top: 3px !important; padding-bottom: 3px !important; }
.gt + .gt { margin-top: 6px !important; }` : "";
  };
  let a = null; try { a = JSON.parse(localStorage.getItem("kultivaprix-apparence") || "null"); } catch (e) {}
  if (a) window.appliquerApparence(a);
})();
