"""Interface en formes de Racco_D2.xlsm : décrit chaque forme dans la feuille « Rendu ».

Le moteur VBA (vba/RaccoD2.bas) lit cette table : « Construire » crée les formes, « Rafraichir » met à jour
celles dont une liaison (texte, style, visibilité, position, hauteur) a changé. Tout le design se règle ici.
Coordonnées en points, sur une grille de 9 pt (1 colonne = 1 ligne = 9 pt) : les champs de saisie sont de
vraies cellules alignées sur cette grille, les cartes sont découpées autour d'eux.
"""
from xlsxwriter.utility import xl_col_to_name

POLICE = "Avenir Next"
MONO = "Menlo"

# couleurs : tokens du :root de index.html
C = dict(fond="#EFE3D6", side="#CFE2D8", side_ink="#3F5A4C", carte="#FFFAF4", carte2="#F3E7DB", corail="#F4C6B5",
         texte="#4A4238", muted="#6D6259", ligne="#E4D9CD", peach_ink="#B5563A", mint_ink="#2F6B4A",
         accent="#E8907A", accent_ink="#33190F", led_vert="#36C26A", led_rouge="#E2493A",
         ok="#3D7F55", ok_tint="#D9EAD9", ko="#C1523F", ko_tint="#F6D5C9", run="#96660F", run_tint="#F9E9B8",
         none="#7D7670", none_tint="#EBE4DC")

# styles : fond, transparence du fond, trait, épaisseur, transparence du trait, encre, transparence de l'encre,
# ombre (clay, clay_sm, inset), halo, rayon du halo
S = {}


def style(nom, fond="", fond_t=0, trait="", ep=0, trait_t=0, encre="", encre_t=0, ombre="", halo="", halo_r=0):
    S[nom] = [nom, fond, fond_t, trait, ep, trait_t, encre, encre_t, ombre, halo, halo_r]


style("carte", C["carte"], ombre="clay")
style("carte_corail", C["corail"], ombre="clay")
style("carte_plat", C["carte"])
style("carte_bas", C["carte"], ombre="clay")
style("entete", C["side"], encre=C["side_ink"], ombre="clay_sm")
style("titre", encre=C["muted"])
style("titre_info", encre=C["peach_ink"])
style("grp", C["carte2"], ombre="inset")
style("grp_actif", C["carte2"], trait=C["accent"], ep=2, ombre="inset")
style("chev", C["carte"], encre=C["texte"], ombre="clay_sm")
style("chev_lock", C["carte"], fond_t=0.45, encre=C["texte"], encre_t=0.5)
style("cb_off", C["carte"], encre=C["carte"], ombre="inset")
style("cb_on", C["ok"], encre=C["carte"], ombre="clay_sm")
style("cb_auto", C["mint_ink"], encre=C["carte"], ombre="clay_sm")
style("cb_lock", C["carte"], fond_t=0.5, encre=C["carte"], ombre="inset")
style("num", encre=C["muted"])
style("num_lock", encre=C["muted"], encre_t=0.5)
style("lib", encre=C["texte"])
style("lib_ok", encre=C["ok"])
style("lib_lock", encre=C["texte"], encre_t=0.5)
style("led_on", C["led_vert"], ombre="0,0,7,#36C26A,0.35,out")
style("led_off", C["led_rouge"], ombre="0,0,7,#E2493A,0.45,out")
style("led_off_lock", C["led_rouge"], fond_t=0.5)
style("ou", encre=C["muted"])
for t in ("none", "run", "ok", "ko"):
    style("tag_" + t, C[t + "_tint"], encre=C[t])
    style("frise_" + t, C[t + "_tint"], encre=C[t])
    style("frise_" + t + "_sel", C[t + "_tint"], trait=C["texte"], ep=2, encre=C[t])
style("btn", C["carte2"], encre=C["texte"], ombre="clay_sm")
style("inset", C["carte2"], ombre="inset")
style("k", encre=C["muted"])
style("v", encre=C["texte"])
style("ligne", trait=C["ligne"], ep=1)
style("sep", trait=C["ligne"], ep=2)
style("tirets", trait="#D9CCBE", ep=1.5)
style("champ", C["carte2"], encre=C["texte"], ombre="inset")
style("champ_vide", C["carte2"], encre=C["muted"], encre_t=0.35, ombre="inset")
style("val", encre=C["texte"])
style("val_vide", encre=C["muted"], encre_t=0.4)
style("ico", C["accent"], encre=C["accent_ink"], ombre="clay_sm")
style("ico_dis", C["accent"], fond_t=0.65)
style("ico_ok", C["ok"], encre=C["carte"], ombre="clay_sm")
style("ico_back", trait=C["accent_ink"], ep=1.2)
style("ico_back_dis", trait=C["accent_ink"], ep=1.2, trait_t=0.65)
style("ico_front", C["accent"], trait=C["accent_ink"], ep=1.2)
style("ico_front_dis", C["accent"], fond_t=0.65, trait=C["accent_ink"], ep=1.2, trait_t=0.65)
style("ico_check", encre=C["carte"])

COLS = ["nom", "type", "x", "y", "w", "h", "rayon", "police", "taille", "gras", "align", "vancre", "marges", "retour",
        "espace", "texte", "riche", "style", "action", "ancre", "auto",
        "b_texte", "b_style", "b_vis", "b_y", "b_h", "a_texte", "a_style", "a_vis", "a_y", "a_h"]

# ── géométrie (points) ──
X0, XR = 18, 1098                     # page
GX, GW = 18, 531                      # colonne gauche (Tâches)
DX, DW = 567, 531                     # colonne droite
IX, IW = 585, 495                     # intérieur des cartes de droite
DOS_Y, DOS_B = 63, 245                # carte Dossier
SIT_Y, SIT_B = 257, 599               # carte Situation / Info
DAT_Y, DAT_B = 611, 731               # carte Dates
RAYON = 20

# champs de saisie : clé, libellé, texte d'attente, rectangle (alignés sur la grille de 9 pt)
COLS4 = [(585, 117), (711, 117), (837, 117), (963, 117)]
SAISIES = [
    ("ant", "N° POI anticipation", "POI anticipation", (585, 108, 117, 27)),
    ("racco", "N° POI Racco D2", "POI Racco D2", (711, 108, 117, 27)),
    ("el", "Nombre d'EL", "0", (837, 108, 117, 27)),
    ("pc", "Permis de construire", "N° PC", (963, 108, 117, 27)),
    ("adr", "Adresse", "Adresse de l'immeuble", (585, 153, 243, 27)),
    ("cab", "Cabinet conseil", "Nom du cabinet", (837, 153, 117, 27)),
    ("dlpi", "DLPI", "jj/mm/aaaa", (963, 153, 117, 27)),
    ("imb1", "IMB", "IMB/…", (585, 198, 117, 27)),
    ("imb2", "", "IMB/…", (711, 198, 117, 27)),
    ("imb3", "", "IMB/…", (837, 198, 117, 27)),
    ("imb4", "", "IMB/…", (963, 198, 117, 27)),
]
DEP_RECT = (585, 648, 162, 63)        # « écran » de la carte Dates : la date de départ se tape dedans


def cellules_saisie():
    """(clé, rectangle, format de cellule) des cellules de saisie, pour construire.py."""
    for cle, _, _, r in SAISIES:
        fmt = dict(font_size=12, indent=1, valign="vcenter")
        if cle == "dlpi":
            fmt.update(num_format="dd/mm/yyyy", align="left")
        if cle.startswith("imb"):
            fmt.update(font_size=11)
        yield cle, r, fmt
    yield "dep", DEP_RECT, dict(font_size=18, bold=True, align="right", valign="vcenter", num_format="dd/mm/yyyy")


class Table:
    def __init__(self):
        self.lignes = []

    def add(self, nom, typ, x, y, w, h, **kw):
        d = dict(nom=nom, type=typ, x=x, y=y, w=w, h=h)
        d.update(kw)
        self.lignes.append(d)
        return d

    def texte(self, nom, x, y, w, h, txt="", taille=11, gras=0, align="G", vancre="M", encre="v", **kw):
        kw.setdefault("marges", "0,0,0,0")
        return self.add(nom, "texte", x, y, w, h, texte=txt, taille=taille, gras=gras, align=align, vancre=vancre,
                        style=encre, **kw)


def morceaux(x, y, w, h, trous, rayon):
    """Découpe une carte (x, y, w, h) autour de trous rectangulaires : bandes horizontales,
    bande du haut et du bas arrondies, petits recouvrements pour cacher les jointures."""
    ys = sorted({y, y + h} | {t[1] for t in trous} | {t[1] + t[3] for t in trous})
    bandes = []
    for ya, yb in zip(ys, ys[1:]):
        dedans = sorted((t[0], t[0] + t[2]) for t in trous if t[1] < yb and t[1] + t[3] > ya)
        libres, cx = [], x
        for a, b in dedans:
            if a > cx:
                libres.append((cx, a))
            cx = max(cx, b)
        if cx < x + w:
            libres.append((cx, x + w))
        bandes.append((ya, yb, libres))
    pieces = []
    for i, (ya, yb, libres) in enumerate(bandes):
        for a, b in libres:
            typ = "haut" if i == 0 else "bas" if i == len(bandes) - 1 else "rect"
            pieces.append((typ, a, ya, b - a, yb - ya))
    for (ya, yb, la), (_, _, lb) in zip(bandes, bandes[1:]):
        for a1, b1 in la:
            for a2, b2 in lb:
                a, b = max(a1, a2), min(b1, b2)
                if b > a:
                    pieces.append(("rect", a, yb - 1, b - a, 2))
    assert bandes[0][1] - bandes[0][0] >= rayon and bandes[-1][1] - bandes[-1][0] >= rayon
    return pieces


def construire_rendu(k):
    """k : la Construction de construire.py (accès aux cellules de Calcul)."""
    wb, md, F = k.wb, k.md, k.F
    t = Table()
    K = "Calcul!"
    cel, tc, COUR, SEL = k.cel, k.tc, k.COUR, k.SEL
    VUE = "vue"
    INFO = f'{VUE}="Info"'
    TACHES = [x for x in k.tous if x["niveau"] == 1]

    # ── table des lignes de l'arbre (positions calculées par formules) ──
    LC = 60                                 # colonnes BI.. de Rendu
    lig = []                                # (id, type, hauteur, visibilité)
    Y0_ARBRE = 103

    def ferme_ou_verrou(i, x):
        r = x["_r"]
        return f"OR({K}$G${r + 1},{tc('verrou', i)})"

    grps = []
    for i, tache in enumerate(TACHES):
        kidvis = f"NOT({ferme_ou_verrou(i, tache)})"
        g = dict(i=i, t=tache, debut=len(lig))
        lig.append(("pad", tache["id"], 6, "TRUE"))
        lig.append(("d1", tache["id"], 38, "TRUE"))
        g["kids"] = []
        for x in k.tous:
            if x is tache or racine(x) is not tache:
                continue
            p = x["parent"]
            if p.get("mode") == "un" and x["index"] > 0:
                lig.append(("ou", x["id"], 18, kidvis))
            g["kids"].append(len(lig))
            lig.append(("kid", x["id"], 30, kidvis))
        g["fin"] = len(lig)
        lig.append(("padb", tache["id"], 6, "TRUE"))
        if i < len(TACHES) - 1:
            lig.append(("gap", tache["id"], 10, "TRUE"))
        g["kidvis"] = kidvis
        grps.append(g)
    md.write_row(0, LC, ["type", "id", "h", "vis", "eff", "top"])

    def top(j):
        return f"Rendu!${xl_col_to_name(LC + 5)}${j + 2}"

    def eff(j):
        return f"Rendu!${xl_col_to_name(LC + 4)}${j + 2}"
    for j, (typ, ident, h, vis) in enumerate(lig):
        r = j + 1
        md.write_row(r, LC, [typ, ident, h])
        md.write_formula(r, LC + 3, "=" + vis)
        md.write_formula(r, LC + 4, f"=IF({xl_col_to_name(LC + 3)}{r + 1},{xl_col_to_name(LC + 2)}{r + 1},0)")
        if j == 0:
            md.write(r, LC + 5, Y0_ARBRE)
        else:
            md.write_formula(r, LC + 5, f"={xl_col_to_name(LC + 5)}{r}+{xl_col_to_name(LC + 4)}{r}")
    dernier = len(lig) - 1

    # ── en-tête ──
    t.add("entete", "rond", X0, 9, XR - X0, 44, rayon=22, texte="Racco D2", taille=19, gras=1, align="G",
          marges="22,0,0,0", style="entete")

    # ── carte Tâches ──
    t.add("c_taches", "rond", GX, DOS_Y, GW, 400, rayon=22, style="carte",
          b_h=f"{top(dernier)}+{eff(dernier)}+16-{DOS_Y}")
    t.texte("ti_taches", GX + 20, DOS_Y + 14, 200, 16, "TÂCHES", taille=10, gras=1, encre="titre", espace=1)
    acq = f"COUNTIF({k.ACQ},TRUE)"
    t.add("compteur", "rond", GX + GW - 60, DOS_Y + 13, 40, 18, rayon=9, taille=9.5, gras=1, align="C",
          marges="8,1,8,1", auto=1, ancre=GX + GW - 20, style="tag_none",
          b_texte=f'{acq}&" / 7"', b_style=f'IF({acq}=7,"tag_ok",IF({acq}>0,"tag_run","tag_none"))')

    for g in grps:
        i, tache = g["i"], g["t"]
        n = i + 1
        r = tache["_r"]
        val, chk = cel[tache["id"]]["val"], cel[tache["id"]]["chk"]
        verrou, tag = tc("verrou", i), tc("tag", i)
        j_pad, j_d1, j_fin = g["debut"], g["debut"] + 1, g["fin"]
        t.add(f"g_{n}", "rond", GX + 14, Y0_ARBRE, GW - 28, 50, rayon=16, style="grp",
              b_y=top(j_pad), b_h=f"SUM({eff(j_pad)}:{eff(j_fin)})",
              b_style=f'IF({SEL}={n},"grp_actif","grp")')
        if g["kids"]:
            j1 = g["kids"][0]
            t.add(f"gl_{n}", "tirets", GX + 36, Y0_ARBRE, 0, 40, style="tirets", b_vis=g["kidvis"],
                  b_y=f"{top(j1)}+2", b_h=f"{top(j_fin)}-{top(j1)}-6")
        y = top(j_d1)
        ident = tache["id"]
        t.add(f"{ident}_chev", "rond", GX + 24, 0, 26, 26, rayon=9, taille=13, align="C", texte="▾", style="chev",
              action=f"plier:{ident}", b_y=f"{y}+6",
              b_texte=f'IF({ferme_ou_verrou(i, tache)},"▸","▾")', b_style=f'IF({verrou},"chev_lock","chev")')
        cb_style = f'IF({verrou},"cb_lock",IF({chk},"cb_on",IF({val},"cb_auto","cb_off")))'
        t.add(f"{ident}_cb", "rond", GX + 60, 0, 24, 24, rayon=8, taille=12, gras=1, align="C", style="cb_off",
              action=f"cocher:{ident}", b_y=f"{y}+7", b_texte=f'IF({val},"✓","")', b_style=cb_style)
        t.texte(f"{ident}_num", GX + 90, 0, 16, 38, str(n), taille=11, police=MONO, align="D", encre="num",
                action=f"etape:{n}", b_y=y, b_style=f'IF({verrou},"num_lock","num")')
        t.texte(f"{ident}_lib", GX + 112, 0, 360, 38, tache["lib"], taille=15, gras=1, encre="lib",
                action=f"etape:{n}", b_y=y, b_style=f'IF({verrou},"lib_lock",IF({val},"lib_ok","lib"))')
        t.add(f"{ident}_led", "ovale", GX + GW - 40, 0, 12, 12, style="led_off", b_y=f"{y}+13",
              b_style=f'IF({verrou},"led_off_lock",IF({tag}="ok","led_on","led_off"))')
        for j in range(j_d1 + 1, j_fin):
            typ, kid_id, _, _ = lig[j]
            yk = top(j)
            if typ == "ou":
                t.texte(f"ou_{kid_id}", GX + 82, 0, 60, 18, "OU", taille=8.5, gras=1, encre="ou", espace=1.5,
                        b_y=yk, b_vis=g["kidvis"])
                continue
            x = next(z for z in k.tous if z["id"] == kid_id)
            dx = 0 if x["niveau"] == 2 else 30
            v2, c2 = cel[kid_id]["val"], cel[kid_id]["chk"]
            t.add(f"{kid_id}_cb", "rond", GX + 80 + dx, 0, 24, 24, rayon=8, taille=12, gras=1, align="C",
                  style="cb_off", action=f"cocher:{kid_id}", b_y=f"{yk}+3", b_vis=g["kidvis"],
                  b_texte=f'IF({v2},"✓","")', b_style=f'IF({c2},"cb_on",IF({v2},"cb_auto","cb_off"))')
            t.texte(f"{kid_id}_lib", GX + 112 + dx, 0, 380 - dx, 30, x["lib"], taille=13.5, gras=1 if x["niveau"] == 2 else 0,
                    encre="lib", action=f"cocher:{kid_id}", b_y=yk, b_vis=g["kidvis"],
                    b_style=f'IF({v2},"lib_ok","lib")')

    # ── carte Dossier (découpée autour des champs) ──
    trous = [s[3] for s in SAISIES]
    pieces = morceaux(DX, DOS_Y, DW, DOS_B - DOS_Y, trous, RAYON)
    for j, (typ, x, y, w, h) in enumerate(sorted(pieces, key=lambda p: p[0] != "bas")):
        t.add(f"dos_p{j}", typ, x, y, w, h, rayon=RAYON, style="carte_bas" if typ == "bas" else "carte_plat")
    t.texte("ti_dossier", IX, DOS_Y + 12, 200, 16, "DOSSIER", taille=10, gras=1, encre="titre", espace=1)
    for cle, lib, attente, (x, y, w, h) in SAISIES:
        if lib:
            t.texte(f"lab_{cle}", x + 2, y - 16, w, 14, lib, taille=9.5, gras=1, encre="k")
        f = "v_" + cle
        if cle == "dlpi":
            valeur = f'IF(ISNUMBER({f}),RIGHT("0"&DAY({f}),2)&"/"&RIGHT("0"&MONTH({f}),2)&"/"&YEAR({f}),{f}&"")'
        else:
            valeur = f'{f}&""'
        t.add(f"champ_{cle}", "rond", x, y, w, h, rayon=10, taille=11 if cle.startswith("imb") else 12,
              police=MONO if cle.startswith("imb") else "", marges="10,0,8,0", style="champ_vide",
              action=f"champ:{cle}", b_vis="TRUE",
              b_texte=f'IF({f}="",{q(attente)},{valeur})', b_style=f'IF({f}="","champ_vide","champ")')

    # ── carte Situation / Info ──
    t.add("c_situ", "rond", DX, SIT_Y, DW, SIT_B - SIT_Y, rayon=22, style="carte",
          b_style=f'IF({INFO},"carte_corail","carte")')
    t.texte("ti_situ", IX, SIT_Y + 15, 140, 16, "SITUATION", taille=10, gras=1, encre="titre", espace=1,
            b_texte=f'IF({INFO},"INFO","SITUATION")', b_style=f'IF({INFO},"titre_info","titre")')
    t.add("btn_vue", "rond", IX + IW - 74, SIT_Y + 11, 74, 24, rayon=12, taille=10.5, gras=1, align="C",
          texte="Info", style="btn", action="vue", b_texte=f'IF({INFO},"Situation","Info")')
    SITU = f'{VUE}="Situation"'
    t.add("etat", "rond", IX + 260, SIT_Y + 14, 100, 18, rayon=9, taille=9, gras=1, align="C", marges="8,1,8,1",
          auto=1, ancre=IX + IW - 84, style="tag_run", espace=0.5,
          b_texte=f'IF({COUR}=0,"DOSSIER TERMINÉ","ÉTAPE "&{COUR}&" EN COURS")',
          b_style=f'IF({COUR}=0,"tag_ok","tag_run")', b_vis=SITU)
    fw = (IW - 6 * 6) / 7
    for i, tache in enumerate(TACHES):
        n = i + 1
        etat = (f'IF({tc("tag", i)}="ko","ko",IF({tc("acquise", i)},"ok",IF({COUR}={n},"run","none")))'
                f'&IF({SEL}={n},"_sel","")')
        t.add(f"frise_{n}", "rond", IX + i * (fw + 6), SIT_Y + 44, fw, 46, rayon=12, align="C", gras=1,
              texte=f"{n}\n{tache['lib']}", riche="15:1|7.5:1", marges="2,3,2,3", style="frise_none",
              action=f"etape:{n}", b_style=f'"frise_"&{etat}', b_vis=SITU)
    lib_sel = f"INDEX({K}$C${k.T0 + 2}:$C${k.T0 + 8},{SEL})"

    def champ_sel(h):
        c_ = xl_col_to_name(k.col[h])
        return f"INDEX({K}${c_}${k.T0 + 2}:${c_}${k.T0 + 8},{SEL})"
    t.texte("situ_titre", IX, SIT_Y + 100, 360, 22, "", taille=15, gras=1, b_texte=f'{SEL}&" · "&{lib_sel}', b_vis=SITU)
    t.add("situ_tag", "rond", IX + 380, SIT_Y + 102, 80, 18, rayon=9, taille=9, gras=1, align="C", marges="8,1,8,1",
          auto=1, ancre=IX + IW, style="tag_none", b_texte=champ_sel("texte"),
          b_style=f'"tag_"&{champ_sel("tag")}', b_vis=SITU)
    yb = SIT_Y + 130
    t.add("situ_box", "rond", IX, yb, IW, 184, rayon=16, style="inset", b_vis=SITU)
    lignes = [("Statut", champ_sel("statut"), 26), ("Décision", champ_sel("décision"), 26),
              ("Action suivante", champ_sel("action"), 80), ("Responsable", champ_sel("responsable"), 26),
              ("Délai", k.DELAI_DLPI, 26)]
    yy = yb
    for j, (lib, formule, h) in enumerate(lignes):
        long = h > 26
        t.texte(f"situ_k{j}", IX + 12, yy + (7 if long else 0), 84, 26 if long else h, lib, taille=9.5, gras=1, encre="k",
                vancre="M", b_vis=SITU)
        t.texte(f"situ_v{j}", IX + 100, yy + (6 if long else 0), IW - 112, h - (8 if long else 0), "", taille=11.5, gras=1,
                retour=1, vancre="H" if long else "M", b_texte=formule, b_vis=SITU)
        yy += h
        if j < len(lignes) - 1:
            t.add(f"situ_l{j}", "ligne", IX + 10, yy, IW - 20, 0, style="ligne", b_vis=SITU)
    note = (f'IF(OR({COUR}={SEL},{COUR}=0),"Touche une étape de la frise ou le nom d\'une grande tâche pour voir sa situation.",'
            f'"Étape en cours : "&{COUR}&" · "&INDEX({K}$C${k.T0 + 2}:$C${k.T0 + 8},{COUR}))')
    t.texte("situ_note", IX, yb + 188, IW, 20, "", taille=9.5, encre="k", b_texte=note, b_vis=SITU)

    # vue Info
    for j, d in enumerate(k.D_):
        x, y, w = IX + j * (243 + 9), SIT_Y + 44, 243
        sortie(t, f"i{DELAIS_[j]}", x, y, w, 66, d, INFO, f"i{DELAIS_[j]}")
    yc = SIT_Y + 150
    t.add("i_code", "rond", IX, yc, IW, 62, rayon=16, style="inset", b_vis=INFO)
    t.texte("i_code_lab", IX, yc + 7, IW, 14, "CODE COMLAB", taille=9.5, gras=1, encre="k", align="C", espace=1, b_vis=INFO)
    t.texte("i_code_val", IX + 30, yc + 25, IW - 60, 28, "", taille=16, gras=1, police=MONO, align="C", espace=1,
            b_texte=groupes(k.COMLAB, 25), b_vis=INFO)
    icone(t, "ico_comlab", IX + IW - 30, yc + 8, "copier:comlab", INFO)
    for j, nom in enumerate(["ape", "dzi", "rty", "lve"]):
        x, y, w = IX + (j % 2) * (243 + 9), SIT_Y + 252 + (j // 2) * 44, 243
        t.add(f"p_{nom}", "rond", x, y, w, 34, rayon=17, style="inset", b_vis=INFO)
        t.texte(f"p_{nom}_lab", x, y, 52, 34, nom.upper(), taille=9.5, gras=1, encre="k", align="C", espace=1, b_vis=INFO)
        t.add(f"p_{nom}_sep", "ligne", x + 52, y + 8, 0, 18, style="sep", b_vis=INFO)
        t.texte(f"p_{nom}_val", x + 60, y, 152, 34, "", taille=10.5, gras=1, police=MONO, espace=0.3,
                b_texte=groupes(k.CODES[nom], AUTRES_[nom]), b_vis=INFO)
        icone(t, f"ico_{nom}", x + w - 29, y + 7, f"copier:{nom}", INFO)

    # ── carte Dates (découpée autour de l'écran de saisie) ──
    pieces = morceaux(DX, DAT_Y, DW, DAT_B - DAT_Y, [DEP_RECT], RAYON)
    for j, (typ, x, y, w, h) in enumerate(sorted(pieces, key=lambda p: p[0] != "bas")):
        t.add(f"dat_p{j}", typ, x, y, w, h, rayon=RAYON, style="carte_bas" if typ == "bas" else "carte_plat")
    t.texte("ti_dates", IX, DAT_Y + 15, 200, 16, "DATES", taille=10, gras=1, encre="titre", espace=1)
    t.add("btn_auj", "rond", IX + IW - 96, DAT_Y + 11, 96, 24, rayon=12, taille=10.5, gras=1, align="C",
          texte="Aujourd'hui", style="btn", action="auj")
    x, y, w, h = DEP_RECT
    t.add("champ_dep", "rond", x, y, w, h, rayon=16, style="inset", action="champ:dep", b_vis="TRUE")
    jour = 'CHOOSE(WEEKDAY(v_dep),"dim.","lun.","mar.","mer.","jeu.","ven.","sam.")'
    mois = 'CHOOSE(MONTH(v_dep),"janv.","févr.","mars","avr.","mai","juin","juil.","août","sept.","oct.","nov.","déc.")'
    t.texte("dep_expr", x + 10, y + 8, w - 20, 14, "", taille=9, align="D", encre="k", action="champ:dep", b_vis="TRUE",
            b_texte=f'IF(ISNUMBER(v_dep),"Départ · "&{jour}&" "&DAY(v_dep)&" "&{mois}&" "&YEAR(v_dep),"Date de départ")')
    t.texte("dep_val", x + 10, y + 26, w - 20, 30, "", taille=18, gras=1, police=MONO, align="D", action="champ:dep",
            b_vis="TRUE", b_style='IF(ISNUMBER(v_dep),"val","val_vide")',
            b_texte='IF(ISNUMBER(v_dep),RIGHT("0"&DAY(v_dep),2)&"/"&RIGHT("0"&MONTH(v_dep),2)&"/"&YEAR(v_dep),"jj/mm/aaaa")')
    sortie(t, "d30", 756, 648, 157, 63, k.D_[0], None, "d30")
    sortie(t, "d65", 922, 648, 158, 63, k.D_[1], None, "d65")

    ecrire(wb, md, t, k)


def sortie(t, nom, x, y, w, h, d, vis, cle):
    """Boîte « + 30 jours » : libellé, icône de copie, date, étiquette Week-end / Férié."""
    kw = dict(b_vis=vis) if vis else {}
    t.add(f"s_{nom}", "rond", x, y, w, h, rayon=16, style="inset", **kw)
    t.texte(f"s_{nom}_lab", x + 10, y + 7, w - 50, 14, f"+ {cle[1:]} JOURS", taille=9.5, gras=1, encre="k", espace=1, **kw)
    icone(t, f"ico_{nom}", x + w - 29, y + 6, f"copier:{cle}", vis, vide=d["txt"])
    t.texte(f"s_{nom}_val", x + 8, y + 24, w - 18, 22, "", taille=13 if w < 200 else 14, gras=1, police=MONO, align="D",
            b_texte=f'IF({d["txt"]}="","—",{d["jour"]}&" "&{d["txt"]})', **kw)
    vis_tag = f'AND({vis},{d["tag"]}<>"")' if vis else f'{d["tag"]}<>""'
    t.add(f"s_{nom}_tag", "rond", x + 10, y + h - 21, 50, 15, rayon=7, taille=8.5, gras=1, align="C", marges="7,0,7,0",
          auto=1, ancre=x + w - 10, style="tag_ko", b_texte=d["tag"], b_vis=vis_tag)


def icone(t, nom, x, y, action, vis, vide=None):
    """Icône « copier » du site : carré corail, deux petits carrés ; passe en ✓ vert après la copie."""
    vis_f = vis if vis else "TRUE"
    dis = f'{vide}=""' if vide else "FALSE"
    t.add(f"{nom}_bg", "rond", x, y, 20, 20, rayon=7, style="ico", action=action,
          b_style=f'IF({dis},"ico_dis","ico")', b_vis=vis_f)
    t.add(f"{nom}_b", "rond", x + 5, y + 4, 8, 8, rayon=2, style="ico_back", action=action,
          b_style=f'IF({dis},"ico_back_dis","ico_back")', b_vis=vis_f)
    t.add(f"{nom}_f", "rond", x + 8, y + 7, 8, 8, rayon=2, style="ico_front", action=action,
          b_style=f'IF({dis},"ico_front_dis","ico_front")', b_vis=vis_f)
    t.texte(f"{nom}_ok", x, y, 20, 20, "✓", taille=11, gras=1, align="C", encre="ico_check", action=action,
            b_vis="FALSE")


def q(s):
    return '"' + s.replace('"', '""') + '"'


def groupes(ref, n):
    return '&" "&'.join(f"MID({ref},{5 * g + 1},5)" for g in range((n + 4) // 5))


def racine(n):
    while n["parent"]:
        n = n["parent"]
    return n


DELAIS_ = [30, 65]
AUTRES_ = {"ape": 15, "dzi": 20, "rty": 10, "lve": 10}


def ecrire(wb, md, t, k):
    """Écrit la table des formes (A..AE), les styles (AH..AR) et les noms utilisés par le VBA."""
    md.write_row(0, 0, COLS)
    pos = {c: i for i, c in enumerate(COLS)}
    for j, d in enumerate(t.lignes):
        r = j + 1
        for c in COLS[:21]:
            v = d.get(c, "")
            if c == "police" and not v:
                v = POLICE
            if c == "type":
                v = d["type"]
            md.write(r, pos[c], v)
        for c in ("b_texte", "b_style", "b_vis", "b_y", "b_h"):
            v = d.get(c)
            if v is None or v == "":
                continue
            v = str(v)
            md.write_formula(r, pos[c], "=" + v)
    n = len(t.lignes)
    wb.define_name("ui", f"=Rendu!$A$2:${xl_col_to_name(len(COLS) - 1)}${n + 1}")
    SC = 33
    md.write_row(0, SC, ["style", "fond", "fond_t", "trait", "ep", "trait_t", "encre", "encre_t", "ombre", "halo", "halo_r"])
    for j, row in enumerate(S.values()):
        md.write_row(j + 1, SC, row)
    wb.define_name("styles", f"=Rendu!${xl_col_to_name(SC)}$2:${xl_col_to_name(SC + 10)}${len(S) + 1}")
    md.write(0, 46, "réglages")
    md.write(1, 46, "largeur")
    md.write(1, 47, XR + 18)
    md.write(2, 46, "hauteur")
    md.write(2, 47, DAT_B + 60)          # marge : la fenêtre utile compte la barre d'onglets
    wb.define_name("pageL", "=Rendu!$AV$2")
    wb.define_name("pageH", "=Rendu!$AV$3")
    md.write(3, 46, "carte (couleur des cellules de saisie)")
    md.write(3, 47, C["carte"])
    md.write(4, 46, "carte2 (pendant la saisie)")
    md.write(4, 47, C["carte2"])
    wb.define_name("coulCarte", "=Rendu!$AV$4")
    wb.define_name("coulSaisie", "=Rendu!$AV$5")
