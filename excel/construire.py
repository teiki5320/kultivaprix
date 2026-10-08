"""Construit les classeurs Excel de Racco D2 (nouvelle version).

    python3 excel/construire.py            -> excel/Racco_D2.xlsx  (sans macro, iPad)
                                              excel/Racco_D2.xlsm  (avec macros, si excel/vba/vbaProject.bin existe)

Mise en page du site index.html : questionnaire à gauche, Dossier / Situation ou Info / Dates à droite.
Toute la logique est en formules (feuille Calcul) ; le VBA (excel/vba/) ne fait que redessiner
l'arbre des tâches, basculer Situation / Info et copier dans le presse-papiers.
Les codes Comlab, APE, DZI, RTY, LVE et les dates sont calculés comme sur le site.
"""
import datetime as dt
from pathlib import Path

import xlsxwriter
from xlsxwriter.utility import xl_col_to_name

ICI = Path(__file__).resolve().parent

# ── Questionnaire : copie conforme de TACHES dans index.html ──────────────────
TACHES = [
    dict(id="t1", lib="Réception dossier", mode="tout", resp="cab", enCours="Incomplète", attente="En attente des pièces",
         okStatut="Dossier complet", okDecision="Recevable", apres="Passer au contrôle de conformité", kids=[
            dict(id="t1a", lib="Demande de raccordement reçue"),
            dict(id="t1b", lib="Plans de l'immeuble reçus"),
            dict(id="t1c", lib="Permis de construire joint"),
            dict(id="t1d", lib="Coordonnées du cabinet conseil")]),
    dict(id="t2", lib="Conformité", mode="un", apres="Lancer l'étude technique", kids=[
        dict(id="t2a", lib="2a  Conforme", court="Conforme", mode="tout", kids=[
            dict(id="t2a1", lib="Plans vérifiés"),
            dict(id="t2a2", lib="Nombre d'EL cohérent avec les plans"),
            dict(id="t2a3", lib="Adresse et IMB contrôlés")]),
        dict(id="t2b", lib="2b  Non conforme", court="Non conforme", mode="tout", resp="cab",
             attente="Attendre les compléments du cabinet", kids=[
            dict(id="t2b1", lib="Anomalies notifiées au cabinet conseil"),
            dict(id="t2b2", lib="Compléments demandés")])]),
    dict(id="t3", lib="Étude technique", mode="tout", resp="Bureau d'études", attente="Étude en cours",
         okStatut="Étude terminée", okDecision="Faisable", apres="Planifier l'intervention", kids=[
            dict(id="t3a", lib="Point de branchement (PBO) identifié"),
            dict(id="t3b", lib="Cheminement du câble validé"),
            dict(id="t3c", lib="Devis de raccordement envoyé"),
            dict(id="t3d", lib="Commande reçue")]),
    dict(id="t4", lib="Planification", mode="tout", resp="Moi", attente="Rendez-vous à caler",
         okStatut="Intervention planifiée", okDecision="Date confirmée", apres="Lancer les travaux", kids=[
            dict(id="t4a", lib="Date d'intervention fixée"),
            dict(id="t4b", lib="Technicien affecté"),
            dict(id="t4c", lib="Syndic ou gestionnaire prévenu")]),
    dict(id="t5", lib="Travaux", mode="tout", resp="Sous-traitant", attente="Chantier en cours",
         okStatut="Travaux terminés", okDecision="Prêt pour la recette", apres="Faire la recette", kids=[
            dict(id="t5a", lib="Câblage de la colonne montante"),
            dict(id="t5b", lib="Pose des prises (PTO) dans les logements"),
            dict(id="t5c", lib="Raccordement au point de branchement"),
            dict(id="t5d", lib="Photos d'intervention reçues")]),
    dict(id="t6", lib="Recette", mode="un", apres="Mettre en service", kids=[
        dict(id="t6a", lib="6a  Recette conforme", court="Recette conforme", mode="tout", kids=[
            dict(id="t6a1", lib="Mesures optiques dans les tolérances"),
            dict(id="t6a2", lib="PV de recette signé")]),
        dict(id="t6b", lib="6b  Recette avec réserves", court="Réserves", mode="tout", resp="Sous-traitant",
             attente="Faire lever les réserves", kids=[
            dict(id="t6b1", lib="Réserves notifiées au sous-traitant"),
            dict(id="t6b2", lib="Reprise planifiée")])]),
    dict(id="t7", lib="Mise en service", mode="tout", resp="Moi", attente="Clôture en cours",
         okStatut="Immeuble raccordé", okDecision="Dossier clos", apres="Archiver le dossier", kids=[
            dict(id="t7a", lib="Dossier de récolement transmis"),
            dict(id="t7b", lib="IMB passés actifs dans le SI"),
            dict(id="t7c", lib="Dossier clôturé")]),
]
DELAIS = [30, 65]
AUTRES = {"ape": 15, "dzi": 20, "rty": 10, "lve": 10}
B32 = "0123456789ABCDEFGHJKMNPQRSTVWXYZ"
NOTE = "Touche une étape de la frise ou le nom d'une grande tâche pour voir sa situation."

# ── Couleurs : tokens du :root de index.html ─────────────────────────────────
C = dict(fond="#EFE3D6", side="#CFE2D8", side_ink="#3F5A4C", carte="#FFFAF4", carte2="#F3E7DB", corail="#F4C6B5",
         texte="#4A4238", muted="#6D6259", ligne="#E4D9CD", peach="#F6D5C9", peach_ink="#B5563A", mint_ink="#2F6B4A",
         accent="#E8907A", accent_ink="#33190F", led_vert="#36C26A", led_rouge="#E2493A",
         ok="#3D7F55", ok_tint="#D9EAD9", ko="#C1523F", ko_tint="#F6D5C9", run="#96660F", run_tint="#F9E9B8",
         none="#7D7670", none_tint="#EBE4DC", verrou="#A89F95")
FONT = "Calibri"
MONO = "Consolas"
FEUILLE = "Racco D2"
M = f"'{FEUILLE}'!"
K = "Calcul!"
ICONE = "⧉"          # icône « copier »
COCHE = "✓"          # retour visuel après copie

# ── Grille de la feuille principale ─────────────────────────────────────────
A_, CHEV, CB, NUM, LIB, LED, GAP = range(7)      # colonnes A..G
R0, NR = 7, 28                                   # colonne droite : H..AI, 28 colonnes étroites
R1 = R0 + NR - 1
MARGE, AIDE = R0 + NR, R0 + NR + 1               # AJ marge, AK colonne d'aide (id du nœud par ligne)
L_TITRE, L_ESPACE, L_CARTES = 0, 1, 2
L_ARBRE0, L_ARBRE1 = 3, 50                       # arbre : lignes Excel 4..51
L_DOSSIER = 2                                    # Excel 3..10
L_BLOC = 11                                      # Situation / Info : Excel 12..25
L_DATES = 26                                     # Excel 27..31
L_INFO_XLSX = 32                                 # version sans macro : Info sous les dates, Excel 33..46
H_BLOC = 14


def noeuds(liste, parent=None, niveau=1):
    for i, n in enumerate(liste):
        n["parent"], n["niveau"], n["index"] = parent, niveau, i
        yield n
        yield from noeuds(n.get("kids", []), n, niveau + 1)


def feuilles(n):
    return [x for k in n["kids"] for x in feuilles(k)] if n.get("kids") else [n]


def racine(n):
    while n["parent"]:
        n = n["parent"]
    return n


def paques(a):
    b, c, d = a % 19, a // 100, a % 100
    e, f, g = c // 4, c % 4, (c + 8) // 25
    h = (c - g + 1) // 3
    i = (19 * b + c - e - h + 15) % 30
    k, l = d // 4, d % 4
    m = (32 + 2 * f + 2 * k - i - l) % 7
    n = (b + 11 * i + 22 * m) // 451
    mois, j = (i + m - 7 * n + 114) // 31, ((i + m - 7 * n + 114) % 31) + 1
    return dt.date(a, mois, j)


def feries(a):
    p = paques(a)
    return [dt.date(a, 1, 1), p + dt.timedelta(1), dt.date(a, 5, 1), dt.date(a, 5, 8), p + dt.timedelta(39),
            p + dt.timedelta(50), dt.date(a, 7, 14), dt.date(a, 8, 15), dt.date(a, 11, 1), dt.date(a, 11, 11),
            dt.date(a, 12, 25)]


def q(t):
    """Chaîne Excel entre guillemets."""
    return '"' + t.replace('"', '""') + '"'


def fnv_pas(h, c):
    """Une étape FNV-1a 32 bits sans dépasser la précision d'Excel :
       h*16777619 mod 2^32 = ((x mod 256)*2^24 + x*403) mod 2^32, avec x = h XOR c."""
    x = f"BITXOR({h},{c})"
    return f"MOD(MOD({x},256)*16777216+{x}*403,4294967296)"


def groupes(ref, n):
    """Code de n caractères affiché par groupes de 5 séparés d'une espace."""
    morceaux = [f"MID({ref},{5 * g + 1},5)" for g in range((n + 4) // 5)]
    return '&" "&'.join(morceaux)


def cellule(r, c):
    return f"${xl_col_to_name(c)}${r + 1}"


class Construction:
    def __init__(self, chemin, macro, vba_bin=None):
        self.macro = macro
        self.wb = xlsxwriter.Workbook(str(chemin), {"use_future_functions": True})
        self.wb.set_properties({"title": "Racco D2", "comments": "Suivi d'un dossier de raccordement D2"})
        self.wb.set_calc_mode("auto")
        self._formats = {}
        self.tous = list(noeuds(TACHES))
        self.rang = {}
        if macro and vba_bin:
            self.wb.add_vba_project(str(vba_bin))

    # ── formats (mis en cache) ──
    def F(self, **kw):
        base = dict(font_name=FONT, font_size=11, font_color=C["texte"], valign="vcenter")
        base.update(kw)
        cle = tuple(sorted(base.items()))
        if cle not in self._formats:
            self._formats[cle] = self.wb.add_format(base)
        return self._formats[cle]

    def construire(self):
        wb = self.wb
        self.ws = wb.add_worksheet(FEUILLE)
        self.kc = wb.add_worksheet("Calcul")
        self.pa = wb.add_worksheet("Paramètres")
        self.md = wb.add_worksheet("Modèles") if self.macro else None
        if self.macro:
            for ws, nom in [(self.ws, "Feuil1"), (self.kc, "Feuil2"), (self.pa, "Feuil3"), (self.md, "Feuil4")]:
                ws.set_vba_name(nom)
        self.ws.activate()
        self.parametres()
        self.page()
        self.calcul()
        self.arbre(self.ws)
        self.dossier()
        self.bloc(self.ws, L_BLOC, "situation", boutons=self.macro)
        self.dates()
        if self.macro:
            self.modeles()
        else:
            self.espace(L_INFO_XLSX - 1)
            self.bloc(self.ws, L_INFO_XLSX, "info", boutons=False)
        self.noms()
        self.kc.hide()
        self.pa.hide()
        if self.md:
            self.md.hide()
        wb.close()

    # ── Paramètres : délais, jours fériés, alphabet ──
    def parametres(self):
        pa, F = self.pa, self.F
        pa.hide_gridlines(2)
        pa.set_column("A:A", 34)
        pa.set_column("B:B", 14)
        titre = F(bold=True, font_size=13)
        pa.write("A1", "Paramètres", titre)
        pa.write("A2", "Délai date 1 (jours)", F())
        pa.write("B2", DELAIS[0], F(bg_color=C["carte2"], align="center"))
        pa.write("A3", "Délai date 2 (jours)", F())
        pa.write("B3", DELAIS[1], F(bg_color=C["carte2"], align="center"))
        pa.write("A5", "Jours fériés (France)", titre)
        fmt_date = F(num_format="dd/mm/yyyy", align="center")
        liste = [d for a in range(2024, 2046) for d in feries(a)]
        for i, d in enumerate(liste):
            pa.write_datetime(5 + i, 1, dt.datetime(d.year, d.month, d.day), fmt_date)
        self.FERIES = f"'Paramètres'!$B$6:$B${5 + len(liste)}"
        self.DELAI = ["'Paramètres'!$B$2", "'Paramètres'!$B$3"]
        pa.write("D1", "Alphabet base 32 des codes", F(font_color=C["muted"]))
        pa.write("D2", B32, F(font_name=MONO))
        self.ALPHA = "'Paramètres'!$D$2"

    # ── Feuille principale : fond, colonnes, en-tête ──
    def page(self):
        ws, F = self.ws, self.F
        fond = F(bg_color=C["fond"])
        ws.hide_gridlines(2)
        ws.hide_row_col_headers()
        ws.set_zoom(115)
        ws.set_column(A_, A_, 1.2, fond)
        ws.set_column(CHEV, CHEV, 3.2, fond)
        ws.set_column(CB, CB, 3.4, fond)
        ws.set_column(NUM, NUM, 2.8, fond)
        ws.set_column(LIB, LIB, 50, fond)
        ws.set_column(LED, LED, 3, fond)
        ws.set_column(GAP, GAP, 2.2, fond)
        ws.set_column(R0, R1, 3.0, fond)
        ws.set_column(MARGE, MARGE, 1.2, fond)
        ws.set_column(AIDE, AIDE, 8, F(font_color=C["fond"], bg_color=C["fond"]), {"hidden": True})
        ws.set_column(AIDE + 1, 200, 3.0, fond)
        ws.set_default_row(18)
        ws.set_row(L_TITRE, 27)
        ws.set_row(L_ESPACE, 6)
        ws.merge_range(L_TITRE, CHEV, L_TITRE, R1, "Racco D2",
                       F(bold=True, font_size=16, font_color=C["side_ink"], bg_color=C["side"], indent=1))

    def espace(self, r):
        fond = self.F(bg_color=C["fond"])
        for c in range(R0, R1 + 1):
            self.ws.write_blank(r, c, None, fond)

    # ── Calcul : nœuds, tâches, codes, dates ──
    def calcul(self):
        kc, F, tous = self.kc, self.F, self.tous
        kc.write_row(0, 0, ["id", "libellé", "niveau", "coché", "effectif", "valide", "fermé", "parent", "mode",
                            "index", "ligne", "verrou", "tag", "court"], F(bold=True))
        kc.set_column("A:A", 8)
        kc.set_column("B:B", 38)
        kc.set_column("C:Z", 13)
        n = len(tous)
        self.cel = cel = {}
        for j, x in enumerate(tous):
            r = j + 1
            x["_r"] = r
            cel[x["id"]] = dict(chk=f"{K}$D${r + 1}", eff=f"{K}$E${r + 1}", val=f"{K}$F${r + 1}", lib=f"{K}$B${r + 1}")
        self.NOEUDS = f"$A$2:$N${n + 1}"
        self.COL_ID = f"{K}$A$2:$A${n + 1}"

        # lignes de l'arbre (rendu initial, tout déplié) : nécessaires aux formules « coché » de la version sans macro
        self.lignes_arbre = self.calculer_lignes()
        for x in tous:
            r = x["_r"]
            kc.write(r, 0, x["id"])
            kc.write(r, 1, x["lib"])
            kc.write(r, 2, x["niveau"])
            if self.macro:
                kc.write_boolean(r, 3, False)
                kc.write_boolean(r, 6, False)
            else:
                case = f"{M}{cellule(self.rang[x['id']], CB)}"
                kc.write_formula(r, 3, f"=IF(ISLOGICAL({case}),{case},FALSE)")
                kc.write_boolean(r, 6, False)
            p = x["parent"]
            # une case cochée coche en cascade ses sous-tâches, sauf à travers un choix « ou »
            eff = f"=OR(D{r + 1},{cel[p['id']]['eff']})" if p and p.get("mode") == "tout" else f"=D{r + 1}"
            kc.write_formula(r, 4, eff)
            if x.get("kids"):
                vals = ",".join(cel[k["id"]]["val"] for k in x["kids"])
                agg = f"AND({vals})" if x["mode"] == "tout" else f"OR({vals})"
                kc.write_formula(r, 5, f"=OR(E{r + 1},{agg})")
            else:
                kc.write_formula(r, 5, f"=E{r + 1}")
            kc.write(r, 7, p["id"] if p else "")
            kc.write(r, 8, x.get("mode", ""))
            kc.write(r, 9, x["index"])
            kc.write(r, 10, self.rang[x["id"]] + 1)
            kc.write(r, 13, x.get("court", ""))

        # ── grandes tâches ──
        T0 = n + 3
        self.T0 = T0
        entetes = ["n°", "id", "libellé", "valide", "branche A", "branche B", "en A", "en B", "verrou", "ko", "acquise",
                   "tag", "texte", "statut", "décision", "action", "responsable", "lettre"]
        kc.write_row(T0, 0, entetes, F(bold=True))
        col = {h: i for i, h in enumerate(entetes)}
        self.col = col

        def tc(h, i):
            return f"{K}${xl_col_to_name(col[h])}${T0 + 2 + i}"
        self.tc = tc

        CAB = f'IF({M}$V$7="","Cabinet conseil",{M}$V$7)'
        DLPI = f"{M}$AC$7"
        self.DELAI_DLPI = (f'IF({DLPI}="","DLPI non renseignée",IF({DLPI}-TODAY()>0,"J-"&({DLPI}-TODAY())&" avant la DLPI",'
                           f'IF({DLPI}-TODAY()=0,"DLPI aujourd\'hui","DLPI dépassée de "&(TODAY()-{DLPI})&" j")))')
        COUR = f"{K}$B${T0 + 10}"
        self.COUR = COUR

        def qui(x):
            r = x.get("resp", "Moi")
            return CAB if r == "cab" else q(r)

        def manquants(x):
            fs = feuilles(x)
            return "TEXTJOIN(CHAR(10),TRUE," + ",".join(f'IF({cel[f["id"]]["val"]},"","• "&{cel[f["id"]]["lib"]})' for f in fs) + ")"

        def compte(x):
            fs = feuilles(x)
            return "(" + "+".join(f'N({cel[f["id"]]["val"]})' for f in fs) + ")", len(fs)

        for i, t in enumerate(TACHES):
            r = T0 + 1 + i
            R = r + 1
            kc.write(r, col["n°"], i + 1)
            kc.write(r, col["id"], t["id"])
            kc.write(r, col["libellé"], t["lib"])
            kc.write_formula(r, col["valide"], f"={cel[t['id']]['val']}")
            verrou = "FALSE" if i == 0 else f"NOT({tc('acquise', i - 1)})"
            kc.write_formula(r, col["verrou"], f"={verrou}")
            V = lambda h: f"{xl_col_to_name(col[h])}{R}"
            if t["mode"] == "un":
                a, b = t["kids"]
                kc.write_formula(r, col["branche A"], f"={cel[a['id']]['val']}")
                kc.write_formula(r, col["branche B"], f"={cel[b['id']]['val']}")
                kc.write_formula(r, col["en A"], "=OR(" + ",".join(cel[k["id"]]["val"] for k in a["kids"]) + ")")
                kc.write_formula(r, col["en B"], "=OR(" + ",".join(cel[k["id"]]["val"] for k in b["kids"]) + ")")
                kc.write_formula(r, col["ko"], f"=AND(NOT({V('verrou')}),NOT({V('branche A')}),{V('branche B')})")
                A, B = q(a["court"]), q(b["court"])
                choix = f'"« "&{A}&" » ou « "&{B}&" »"'
                cas = [  # (condition, tag, texte, statut, décision, action, responsable)
                    (V("branche A"), '"ok"', A, A, '"Accepté"', q(t["apres"]), '"Moi"'),
                    (V("branche B"), '"ko"', B, B, '"Suspendu"', q(b["attente"]), qui(b)),
                    (f"AND({cel[t['id']]['eff']},NOT({V('en A')}),NOT({V('en B')}))", '"ok"', '"Validée"',
                     '"Validée sans précision"', '"À préciser"', '"Indiquer "&' + choix, '"Moi"'),
                    (V("en A"), '"run"', '"En cours"', '"Vers « "&' + A + '&" »"', '"En cours"', manquants(a), '"Moi"'),
                    (V("en B"), '"run"', '"En cours"', '"Vers « "&' + B + '&" »"', '"En cours"', manquants(b), '"Moi"'),
                ]
                defaut = ('"none"', '"À contrôler"', '"Pas encore contrôlé"', '"—"', '"Choisir "&' + choix, '"Moi"')
            else:
                kc.write_formula(r, col["ko"], "=FALSE")
                n_ok, total = compte(t)
                en_cours = q(t.get("enCours", "En cours"))
                cas = [
                    (V("valide"), '"ok"', '"Validée"', q(t.get("okStatut", "Étape validée")), q(t.get("okDecision", "—")),
                     q(t.get("apres", "Passer à l'étape suivante")), '"Moi"'),
                    ("TRUE" if t.get("enCours") else f"{n_ok}>0", '"run"', en_cours, q(t["lib"] + " : ") + f"&{n_ok}&\"/{total}\"",
                     q(t.get("attente", "En cours")), manquants(t), qui(t)),
                ]
                defaut = ('"none"', '"À faire"', '"Pas commencée"', '"—"', manquants(t), qui(t))
            champs = ["tag", "texte", "statut", "décision", "action", "responsable"]
            prec = TACHES[i - 1]["lib"] if i else ""
            verrou_val = ['"none"', '"Verrouillée"', '"Pas encore accessible"', '"—"',
                          q(f"Valider d'abord l'étape {i} · {prec}"), '"—"']
            for k, h in enumerate(champs):
                expr = defaut[k]
                for c_ in reversed(cas):
                    expr = f"IF({c_[0]},{c_[k + 1]},{expr})"
                kc.write_formula(r, col[h], f"=IF({V('verrou')},{verrou_val[k]},{expr})")
            kc.write_formula(r, col["acquise"], f"=AND(NOT({V('verrou')}),{V('valide')},NOT({V('ko')}))")
            kc.write_formula(r, col["lettre"],
                             f'=IF({V("tag")}="ko","N",IF({V("acquise")},"V",IF(AND({i + 1}={COUR},{V("tag")}="run"),"E","A")))')
        self.ACQ = f"{K}${xl_col_to_name(col['acquise'])}${T0 + 2}:${xl_col_to_name(col['acquise'])}${T0 + 8}"
        kc.write(T0 + 9, 0, "en cours")
        kc.write_formula(T0 + 9, 1, f"=IFERROR(MATCH(FALSE,{self.ACQ},0),0)")
        kc.write(T0 + 10, 0, "affichée")
        self.SEL = f"{K}$B${T0 + 11}"
        kc.write_formula(T0 + 10, 1, f"=IF(ISNUMBER(etapeChoisie),etapeChoisie,IF({COUR}=0,7,{COUR}))")
        kc.write(T0 + 11, 0, "vue")
        kc.write(T0 + 11, 1, "Situation")
        kc.write(T0 + 12, 0, "étape mémorisée")
        kc.write(T0 + 12, 1, "")
        self.cellules_etat = {"cour": (T0 + 9, 1), "sel": (T0 + 10, 1), "vue": (T0 + 11, 1), "selMemo": (T0 + 12, 1)}

        # verrou et tag par nœud (pour les mises en forme de l'arbre)
        for x in tous:
            r = x["_r"]
            i = TACHES.index(racine(x))
            kc.write_formula(r, 11, f"={tc('verrou', i)}")
            kc.write_formula(r, 12, f"={tc('tag', i)}" if x["niveau"] == 1 else '=""')

        # ── code Comlab (25 caractères) ──
        C0 = T0 + 15
        kc.write(C0, 0, "Code Comlab", F(bold=True))
        lettres = "&".join(tc("lettre", i) for i in range(7))
        fs = [x for t in TACHES for x in feuilles(t)]
        bits = [f"N({cel[x['id']]['val']})" for x in fs] + ["0"] * (70 - len(fs))
        grp = []
        for g in range(14):
            b = bits[5 * g:5 * g + 5]
            poids = "+".join(f"{2 ** (4 - k)}*{b[k]}" for k in range(5) if b[k] != "0") or "0"
            grp.append(f"MID({self.ALPHA},1+{poids},1)")
        kc.write(C0 + 1, 0, "corps")
        CORPS = f"{K}$B${C0 + 2}"
        kc.write_formula(C0 + 1, 1, "=" + lettres + "&" + "&".join(grp))
        kc.write(C0 + 2, 0, "pas")
        kc.write(C0 + 2, 1, "car.")
        kc.write(C0 + 2, 2, "empreinte")
        h_prec = "2166136261"
        for k in range(21):
            r = C0 + 3 + k
            kc.write(r, 0, k + 1)
            kc.write_formula(r, 1, f"=UNICODE(MID({CORPS},{k + 1},1))")
            kc.write_formula(r, 2, "=" + fnv_pas(h_prec, f"B{r + 1}"))
            h_prec = f"C{r + 1}"
        ctrl = "&".join(f"MID({self.ALPHA},MOD(INT({h_prec}/{32 ** k}),32)+1,1)" for k in range(4))
        kc.write(C0 + 25, 0, "Comlab")
        self.COMLAB = f"{K}$B${C0 + 26}"
        self.cellules_etat["comlab"] = (C0 + 25, 1)
        kc.write_formula(C0 + 25, 1, f"={CORPS}&{ctrl}")

        # ── codes APE, DZI, RTY, LVE (même méthode que le site) ──
        r = C0 + 28
        self.CODES = {}
        for nom, L in AUTRES.items():
            kc.write(r, 0, nom.upper(), F(bold=True))
            r += 1
            h_prec, sorties = "2166136261", []
            for j in range((L + 1) // 2):
                graine = f'"{nom}"&{self.COMLAB}&{2 * j}'
                n_car = len(nom) + 25 + len(str(2 * j))
                kc.write(r, 0, f"tour {j + 1}")
                kc.write_formula(r, 1, "=" + graine)
                S = f"$B${r + 1}"
                r += 1
                for k in range(n_car):
                    kc.write_formula(r, 1, f"=UNICODE(MID({S},{k + 1},1))")
                    kc.write_formula(r, 2, "=" + fnv_pas(h_prec, f"B{r + 1}"))
                    h_prec = f"C{r + 1}"
                    r += 1
                sorties.append(f"MID({self.ALPHA},MOD({h_prec},32)+1,1)&MID({self.ALPHA},MOD(INT({h_prec}/32),32)+1,1)")
            kc.write(r, 0, "code")
            kc.write_formula(r, 1, f"=LEFT({'&'.join(sorties)},{L})")
            self.CODES[nom] = f"{K}$B${r + 1}"
            self.cellules_etat["code" + nom.upper()] = (r, 1)
            r += 2

        # ── dates ──
        DEP = f"{M}$H$29"
        self.D_ = []
        for k in range(2):
            rr = r + k
            kc.write(rr, 0, f"date {k + 1}")
            kc.write_formula(rr, 1, f'=IF(ISNUMBER({DEP}),{DEP}+{self.DELAI[k]},"")')
            d = f"{K}$B${rr + 1}"
            kc.write_formula(rr, 2, f'=IF({d}="","",RIGHT("0"&DAY({d}),2)&"/"&RIGHT("0"&MONTH({d}),2)&"/"&YEAR({d}))')
            kc.write_formula(rr, 3, f'=IF({d}="","",CHOOSE(WEEKDAY({d}),"dim.","lun.","mar.","mer.","jeu.","ven.","sam."))')
            kc.write_formula(rr, 4, f'=IF({d}="","",IF(COUNTIF({self.FERIES},{d})>0,"Férié",IF(WEEKDAY({d},2)>5,"Week-end","")))')
            self.D_.append(dict(txt=f"{K}$C${rr + 1}", jour=f"{K}$D${rr + 1}", tag=f"{K}$E${rr + 1}", delai=self.DELAI[k]))
            self.cellules_etat[f"date{DELAIS[k]}"] = (rr, 2)

    # ── Arbre des tâches ──
    def calculer_lignes(self):
        """Lignes du rendu initial (tout déplié) : (type, nœud, fermé). Remplit self.rang."""
        lignes = []
        for t in TACHES:
            lignes.append(("etape", t, False))
            for x in self.tous:
                if x is t or racine(x) is not t:
                    continue
                p = x["parent"]
                if p.get("mode") == "un" and x["index"] > 0:
                    lignes.append(("ou", None, False))
                lignes.append(("sous2" if x["niveau"] == 2 else "sous3", x, False))
        r = L_ARBRE0
        for typ, x, _ in lignes:
            if x is not None:
                self.rang[x["id"]] = r
            r += 1
        return lignes

    def ligne_arbre(self, ws, r, typ, x=None, pos=None, ferme=False):
        """Dessine une ligne de l'arbre (B..F) + colonne d'aide. Sert aussi aux modèles copiés par le VBA."""
        F = self.F
        carte2 = C["carte2"]
        sep = dict(top=2, top_color=C["carte"])      # séparation entre deux étapes
        if typ == "vide":
            for c in range(CHEV, LED + 1):
                ws.write_blank(r, c, None, F(bg_color=C["fond"]))
            ws.write(r, AIDE, "", F(font_color=C["fond"]))
            return
        if typ == "fin":
            for c in range(CHEV, LED + 1):
                ws.write_blank(r, c, None, F(bg_color=C["carte"]))
            ws.write(r, AIDE, "", F(font_color=C["fond"]))
            return
        if typ == "ou":
            for c in range(CHEV, LED + 1):
                ws.write_blank(r, c, None, F(bg_color=carte2))
            ws.write(r, LIB, "ou", F(font_size=8, bold=True, font_color=C["muted"], bg_color=carte2, indent=2))
            ws.write(r, AIDE, "ou", F(font_color=C["fond"]))
            return
        etape = typ == "etape"
        extra = sep if etape else {}
        f_chev = F(font_size=11, bold=True, align="center", bg_color=carte2, font_color=C["muted"], **extra)
        f_case = F(align="center", bg_color=carte2, font_color=C["muted"], **extra)
        f_num = F(font_size=9, font_color=C["muted"], align="right", bg_color=carte2, **extra)
        if etape:
            f_lib = F(bold=True, font_size=12, bg_color=carte2, **extra)
        elif typ == "sous2":
            f_lib = F(bold=True, bg_color=carte2, indent=1)
        else:
            f_lib = F(bg_color=carte2, indent=3)
        f_led = F(font_size=13, align="center", bg_color=carte2, font_color=C["led_rouge"], **extra)
        ws.write(r, CHEV, ("▸" if ferme else "▾") if (etape and self.macro) else "", f_chev)
        ws.insert_checkbox(r, CB, False, f_case)
        ws.write(r, NUM, pos if etape else "", f_num)
        ws.write(r, LIB, x["lib"] if x else "", f_lib)
        ws.write(r, LED, "●" if etape else "", f_led)
        ws.write(r, AIDE, x["id"] if x else "", F(font_color=C["fond"]))

    def cf_arbre(self, ws, r0, r1):
        """Mises en forme conditionnelles de l'arbre : lecture par l'id de la ligne (colonne d'aide)."""
        n = len(self.tous)

        def lit(colonne, defaut="FALSE"):
            return (f"IFERROR(INDEX({K}${colonne}$2:${colonne}${n + 1},MATCH(${xl_col_to_name(AIDE)}{r0 + 1},"
                    f"{K}$A$2:$A${n + 1},0)),{defaut})")

        def cf(c0, c1, formule, **fmt):
            ws.conditional_format(r0, c0, r1, c1, {"type": "formula", "criteria": f"={formule}", "format": self.wb.add_format(fmt)})

        cf(CHEV, LIB, lit("L"), font_color=C["verrou"])                                   # étape verrouillée : grisée (la diode reste rouge)
        cf(LED, LED, f'{lit("M", chr(34) * 2)}="ok"', font_color=C["led_vert"])           # diode verte
        cf(LIB, LIB, lit("F"), font_color=C["ok"])                                        # libellé validé en vert
        cf(CB, CB, lit("D"), font_color=C["ok"])                                          # case cochée : vert
        cf(CB, CB, f'AND(NOT({lit("D")}),{lit("F")})', font_color=C["mint_ink"])          # validée par ses sous-tâches

    def arbre(self, ws):
        F = self.F
        ws.merge_range(L_CARTES, CHEV, L_CARTES, NUM, "TÂCHES", F(bold=True, font_size=9, font_color=C["muted"], bg_color=C["carte"], indent=1))
        ws.write_formula(L_CARTES, LIB, f'=COUNTIF({self.ACQ},TRUE)&" / 7"',
                         F(bold=True, font_size=9, align="right", bg_color=C["carte"], font_color=C["none"]))
        ws.write(L_CARTES, LED, "", F(bg_color=C["carte"]))
        cpt = f"COUNTIF({self.ACQ},TRUE)"
        ws.conditional_format(L_CARTES, LIB, L_CARTES, LIB, {"type": "formula", "criteria": f"={cpt}=7",
                                                            "format": self.wb.add_format(dict(font_color=C["ok"]))})
        ws.conditional_format(L_CARTES, LIB, L_CARTES, LIB, {"type": "formula", "criteria": f"={cpt}>0",
                                                            "format": self.wb.add_format(dict(font_color=C["run"]))})
        r = L_ARBRE0
        for typ, x, ferme in self.lignes_arbre:
            self.ligne_arbre(ws, r, typ, x, TACHES.index(x) + 1 if typ == "etape" else None, ferme)
            r += 1
        self.ligne_arbre(ws, r, "fin")
        r += 1
        while r <= L_ARBRE1 + 1:
            self.ligne_arbre(ws, r, "vide")
            r += 1
        self.cf_arbre(ws, L_ARBRE0, L_ARBRE1)

    # ── Aides de dessin pour la colonne droite ──
    def carte(self, ws, r0, r1, couleur=None):
        f = self.F(bg_color=couleur or C["carte"])
        for r in range(r0, r1 + 1):
            for c in range(R0, R1 + 1):
                ws.write_blank(r, c, None, f)

    def zone(self, ws, r, k0, k1, contenu, fmt, r2=None, formule=False):
        """Cellule fusionnée sur les colonnes étroites k0..k1 (0..27) de la colonne droite."""
        r2 = r if r2 is None else r2
        c0, c1 = R0 + k0, R0 + k1
        if (r2, c1) != (r, c0):
            ws.merge_range(r, c0, r2, c1, "", fmt)
        if formule:
            ws.write_formula(r, c0, contenu, fmt)
        else:
            ws.write(r, c0, contenu, fmt)

    def titre_carte(self, ws, r, texte, k1=13, fond=None, encre=None):
        self.zone(ws, r, 0, k1, texte, self.F(bold=True, font_size=9, font_color=encre or C["muted"], bg_color=fond or C["carte"]))

    def bouton(self, ws, r, k0, k1, texte):
        self.zone(ws, r, k0, k1, texte, self.F(bold=True, font_size=9, align="center", bg_color=C["carte2"],
                                               border=1, border_color=C["ligne"]))

    def icone(self, ws, r, k0, k1=None):
        k1 = k0 + 1 if k1 is None else k1
        self.zone(ws, r, k0, k1, ICONE, self.F(bold=True, font_size=11, align="center", bg_color=C["accent"],
                                               font_color=C["accent_ink"]))

    # ── Dossier ──
    def dossier(self):
        ws, F = self.ws, self.F
        r = L_DOSSIER
        self.carte(ws, r, r + 7)
        self.titre_carte(ws, r, "DOSSIER")
        f_lab = F(bold=True, font_size=8, font_color=C["muted"], bg_color=C["carte"], indent=1)
        f_inp = F(bg_color=C["carte2"], border=1, border_color=C["carte"], indent=1)
        f_num = F(bg_color=C["carte2"], border=1, border_color=C["carte"], indent=1, num_format="0")
        f_date = F(bg_color=C["carte2"], border=1, border_color=C["carte"], indent=1, num_format="dd/mm/yyyy", align="left")
        f_imb = F(bg_color=C["carte2"], border=1, border_color=C["carte"], indent=1, font_name=MONO, font_size=10)
        champs1 = [("N° POI anticipation", 0, 6, f_inp), ("N° POI Racco D2", 7, 13, f_inp),
                   ("Nombre d'EL", 14, 20, f_num), ("Permis de construire", 21, 27, f_inp)]
        champs2 = [("Adresse", 0, 13, f_inp), ("Cabinet conseil", 14, 20, f_inp), ("DLPI", 21, 27, f_date)]
        for ligne, champs in [(r + 1, champs1), (r + 3, champs2)]:
            for lib, k0, k1, fmt in champs:
                self.zone(ws, ligne, k0, k1, lib, f_lab)
                self.zone(ws, ligne + 1, k0, k1, "", fmt)
        ws.data_validation(r + 4, R0 + 21, r + 4, R0 + 27, {"validate": "date", "criteria": ">", "value": dt.date(2000, 1, 1),
                                                           "error_title": "DLPI", "error_message": "Entre une date."})
        self.zone(ws, r + 5, 0, 27, "IMB", f_lab)
        for k in range(4):
            self.zone(ws, r + 6, 7 * k, 7 * k + 6, "", f_imb)

    # ── Situation / Info (bloc de 14 lignes, dessiné sur la feuille ou sur Modèles) ──
    def bloc(self, ws, r0, vue, boutons):
        F, tc, col, T0 = self.F, self.tc, self.col, self.T0
        if vue == "situation":
            self.carte(ws, r0, r0 + H_BLOC - 1)
            self.titre_carte(ws, r0, "SITUATION", 6)
            f_tag = F(bold=True, font_size=9, align="center", bg_color=C["run_tint"], font_color=C["run"])
            self.zone(ws, r0, 7, 14, f'=IF({self.COUR}=0,"Dossier terminé","Étape "&{self.COUR}&" en cours")', f_tag, formule=True)
            ws.conditional_format(r0, R0 + 7, r0, R0 + 14, {"type": "formula", "criteria": f"={self.COUR}=0",
                                                           "format": self.wb.add_format(dict(bg_color=C["ok_tint"], font_color=C["ok"]))})
            self.zone(ws, r0, 16, 18, "Étape", F(font_size=8, font_color=C["muted"], align="right", bg_color=C["carte"]))
            self.zone(ws, r0, 19, 20, "", F(bold=True, align="center", bg_color=C["carte2"], border=1, border_color=C["ligne"]))
            ws.data_validation(r0, R0 + 19, r0, R0 + 20, {"validate": "list", "source": [str(i) for i in range(1, 8)],
                                                         "input_title": "Étape affichée", "input_message": "Vide = étape en cours"})
            if boutons:
                self.bouton(ws, r0, 22, 27, "Info")
            # frise
            for i, t in enumerate(TACHES):
                k0 = 4 * i
                self.zone(ws, r0 + 1, k0, k0 + 3, i + 1, F(bold=True, font_size=13, align="center", bg_color=C["none_tint"],
                                                           font_color=C["none"], left=1, right=1, top=1, border_color=C["carte"]))
                self.zone(ws, r0 + 2, k0, k0 + 3, t["lib"], F(font_size=7, align="center", bg_color=C["none_tint"],
                                                                 font_color=C["none"], shrink=True, left=1, right=1, bottom=1, border_color=C["carte"]))
                plage = (r0 + 1, R0 + k0, r0 + 2, R0 + k0 + 3)

                def cf(formule, **fmt):
                    ws.conditional_format(*plage, {"type": "formula", "criteria": f"={formule}", "format": self.wb.add_format(fmt)})
                cf(f"{self.SEL}={i + 1}", bold=True, border=2, border_color=C["texte"])
                cf(f'{tc("tag", i)}="ko"', bg_color=C["ko_tint"], font_color=C["ko"])
                cf(f"{tc('acquise', i)}", bg_color=C["ok_tint"], font_color=C["ok"])
                cf(f"{self.COUR}={i + 1}", bg_color=C["run_tint"], font_color=C["run"])
            # titre + étiquette
            lib_sel = f"INDEX({K}$C${T0 + 2}:$C${T0 + 8},{self.SEL})"
            self.zone(ws, r0 + 3, 0, 19, f'={self.SEL}&" · "&{lib_sel}', F(bold=True, font_size=13, bg_color=C["carte"]), formule=True)
            tag_sel = f"INDEX({K}${xl_col_to_name(col['tag'])}${T0 + 2}:${xl_col_to_name(col['tag'])}${T0 + 8},{self.SEL})"
            txt_sel = f"INDEX({K}${xl_col_to_name(col['texte'])}${T0 + 2}:${xl_col_to_name(col['texte'])}${T0 + 8},{self.SEL})"
            self.zone(ws, r0 + 3, 20, 27, f"={txt_sel}", F(bold=True, font_size=9, align="center", bg_color=C["none_tint"], font_color=C["none"]), formule=True)
            for tag, fond_, encre in [("ok", "ok_tint", "ok"), ("run", "run_tint", "run"), ("ko", "ko_tint", "ko")]:
                ws.conditional_format(r0 + 3, R0 + 20, r0 + 3, R0 + 27, {"type": "formula", "criteria": f'={tag_sel}="{tag}"',
                                                                        "format": self.wb.add_format(dict(bg_color=C[fond_], font_color=C[encre]))})

            def champ_sel(h):
                c_ = xl_col_to_name(col[h])
                return f"INDEX({K}${c_}${T0 + 2}:${c_}${T0 + 8},{self.SEL})"
            f_k = F(bold=True, font_size=9, font_color=C["muted"], bg_color=C["carte2"], indent=1, bottom=1, bottom_color=C["ligne"], valign="top")
            f_v = F(bold=True, bg_color=C["carte2"], text_wrap=True, indent=1, bottom=1, bottom_color=C["ligne"], valign="top")
            lignes = [("Statut", champ_sel("statut"), 1), ("Décision", champ_sel("décision"), 1),
                      ("Action suivante", champ_sel("action"), 4), ("Responsable", champ_sel("responsable"), 1),
                      ("Délai", self.DELAI_DLPI, 1)]
            r = r0 + 4
            for lib, formule, n in lignes:
                self.zone(ws, r, 0, 5, lib, f_k, r2=r + n - 1)
                self.zone(ws, r, 6, 27, "=" + formule, f_v, r2=r + n - 1, formule=True)
                r += n
            note = (f'=IF(OR({self.COUR}={self.SEL},{self.COUR}=0),{q(NOTE)},'
                    f'"Étape en cours : "&{self.COUR}&" · "&INDEX({K}$C${T0 + 2}:$C${T0 + 8},{self.COUR}))')
            self.zone(ws, r, 0, 27, note, F(font_size=9, font_color=C["muted"], bg_color=C["carte"], text_wrap=True), formule=True)
        else:
            self.carte(ws, r0, r0 + H_BLOC - 1, C["corail"])
            self.titre_carte(ws, r0, "INFO", 6, fond=C["corail"], encre=C["peach_ink"])
            if boutons:
                self.bouton(ws, r0, 22, 27, "Situation")
            f_dec = F(bold=True, font_size=8, font_color=C["muted"], bg_color=C["carte2"], indent=1)
            f_val = F(bold=True, font_size=12, font_name=MONO, bg_color=C["carte2"], indent=1)
            f_tagd = F(bold=True, font_size=8, align="center", bg_color=C["carte2"], font_color=C["ko"])
            for k, d in enumerate(self.D_):
                k0 = 14 * k
                self.zone(ws, r0 + 1, k0, k0 + 11, f"+ {DELAIS[k]} JOURS", f_dec)
                self.icone(ws, r0 + 1, k0 + 12, k0 + 13)
                self.zone(ws, r0 + 2, k0, k0 + 9, f'=IF({d["txt"]}="","—",{d["jour"]}&" "&{d["txt"]})', f_val, formule=True)
                self.zone(ws, r0 + 2, k0 + 10, k0 + 13, f'={d["tag"]}', f_tagd, formule=True)
                ws.conditional_format(r0 + 2, R0 + k0 + 10, r0 + 2, R0 + k0 + 13,
                                      {"type": "formula", "criteria": f'={d["tag"]}<>""',
                                       "format": self.wb.add_format(dict(bg_color=C["ko_tint"]))})
            # code Comlab
            self.zone(ws, r0 + 4, 0, 25, "CODE COMLAB", F(bold=True, font_size=8, font_color=C["muted"], bg_color=C["carte2"], align="center"))
            self.icone(ws, r0 + 4, 26, 27)
            self.zone(ws, r0 + 5, 0, 27, "=" + groupes(self.COMLAB, 25),
                      F(bold=True, font_size=13, font_name=MONO, align="center", bg_color=C["carte2"]), formule=True)
            # pastilles
            f_pl = F(bold=True, font_size=8, font_color=C["muted"], bg_color=C["carte2"], align="center",
                     right=1, right_color=C["ligne"])
            f_code = F(bold=True, font_size=10, font_name=MONO, bg_color=C["carte2"], indent=1)
            for i, nom in enumerate(AUTRES):
                r, k0 = r0 + 7 + 2 * (i // 2), 14 * (i % 2)
                self.zone(ws, r, k0, k0 + 2, nom.upper(), f_pl)
                self.zone(ws, r, k0 + 3, k0 + 11, "=" + groupes(self.CODES[nom], AUTRES[nom]), f_code, formule=True)
                self.icone(ws, r, k0 + 12, k0 + 13)

    # ── Dates ──
    def dates(self):
        ws, F = self.ws, self.F
        r = L_DATES
        self.carte(ws, r, r + 4)
        self.titre_carte(ws, r, "DATES")
        if self.macro:
            self.bouton(ws, r, 22, 27, "Aujourd'hui")
        f_dec = F(bold=True, font_size=8, font_color=C["muted"], bg_color=C["carte2"], indent=1)
        self.zone(ws, r + 1, 0, 9, "Date de départ", f_dec)
        f_dep = F(bold=True, font_size=12, bg_color=C["carte2"], num_format="dd/mm/yyyy", align="center",
                  border=1, border_color=C["ligne"])
        self.zone(ws, r + 2, 0, 9, "", f_dep)
        ws.data_validation(r + 2, R0, r + 2, R0 + 9, {"validate": "date", "criteria": ">", "value": dt.date(2000, 1, 1),
                                                     "input_title": "Date de départ",
                                                     "input_message": "Tape la date, par ex. 07/10/2026 ou Ctrl+; pour aujourd'hui",
                                                     "error_title": "Date de départ", "error_message": "Entre une date."})
        DEP = f"{M}$H${r + 3}"
        self.zone(ws, r + 3, 0, 9, f'=IF(ISNUMBER({DEP}),"Départ · "&CHOOSE(WEEKDAY({DEP}),"dimanche","lundi","mardi","mercredi","jeudi","vendredi","samedi"),"")',
                  F(font_size=8, font_color=C["muted"], bg_color=C["carte2"], indent=1), formule=True)
        f_val = F(bold=True, font_size=12, font_name=MONO, bg_color=C["carte2"], indent=1)
        f_tagd = F(bold=True, font_size=8, bg_color=C["carte2"], font_color=C["ko"], indent=1)
        for k, d in enumerate(self.D_):
            k0 = 10 + 9 * k
            self.zone(ws, r + 1, k0, k0 + 6, f"+ {DELAIS[k]} JOURS", f_dec)
            self.icone(ws, r + 1, k0 + 7, k0 + 8)
            self.zone(ws, r + 2, k0, k0 + 8, f'=IF({d["txt"]}="","—",{d["jour"]}&" "&{d["txt"]})', f_val, formule=True)
            self.zone(ws, r + 3, k0, k0 + 8, f'={d["tag"]}', f_tagd, formule=True)
            ws.conditional_format(r + 3, R0 + k0, r + 3, R0 + k0 + 8, {"type": "formula", "criteria": f'={d["tag"]}<>""',
                                                                       "format": self.wb.add_format(dict(bg_color=C["ko_tint"]))})

    # ── Modèles copiés par le VBA ──
    def modeles(self):
        md = self.md
        md.hide_gridlines(2)
        for c, w in [(CHEV, 3.2), (CB, 3.4), (NUM, 2.8), (LIB, 50), (LED, 3)]:
            md.set_column(c, c, w)
        md.set_column(R0, R1, 3.0)
        md.set_default_row(18)
        md.write("A1", "Modèles de lignes et de blocs copiés par les macros", self.F(bold=True))
        self.tpl = {}
        for i, typ in enumerate(["etape", "sous2", "sous3", "ou", "fin", "vide"]):
            r = 2 + i
            self.ligne_arbre(md, r, typ, None, None, False)
            self.tpl[typ] = r
        self.cf_arbre(md, 2, 4)
        self.bloc(md, 12, "situation", boutons=True)
        self.bloc(md, 30, "info", boutons=True)

    # ── Noms définis (utilisés par le VBA et par quelques formules) ──
    def noms(self):
        wb = self.wb

        def nom(n, feuille, r0, c0, r1=None, c1=None):
            r1 = r0 if r1 is None else r1
            c1 = c0 if c1 is None else c1
            wb.define_name(n, f"='{feuille}'!{cellule(r0, c0)}:{cellule(r1, c1)}")
        for n, (r, c) in self.cellules_etat.items():
            nom(n, "Calcul", r, c)
        nom("noeuds", "Calcul", 1, 0, len(self.tous), 13)
        nom("taches", "Calcul", self.T0 + 1, 0, self.T0 + 7, len(self.col) - 1)
        nom("arbre", FEUILLE, L_ARBRE0, CHEV, L_ARBRE1, LED)
        nom("aide", FEUILLE, L_ARBRE0, AIDE, L_ARBRE1, AIDE)
        nom("etapeChoisie", FEUILLE, L_BLOC, R0 + 19)      # une seule cellule : un nom sur deux cellules casse ISNUMBER()
        nom("bloc", FEUILLE, L_BLOC, R0, L_BLOC + H_BLOC - 1, R1)
        nom("btnVue", FEUILLE, L_BLOC, R0 + 22, L_BLOC, R0 + 27)
        nom("frise", FEUILLE, L_BLOC + 1, R0, L_BLOC + 2, R1)
        nom("btnAujourdhui", FEUILLE, L_DATES, R0 + 22, L_DATES, R0 + 27)
        nom("dateDepart", FEUILLE, L_DATES + 2, R0, L_DATES + 2, R0 + 9)
        nom("cp_D30", FEUILLE, L_DATES + 1, R0 + 17, L_DATES + 1, R0 + 18)
        nom("cp_D65", FEUILLE, L_DATES + 1, R0 + 26, L_DATES + 1, R0 + 27)
        nom("cp_I30", FEUILLE, L_BLOC + 1, R0 + 12, L_BLOC + 1, R0 + 13)
        nom("cp_I65", FEUILLE, L_BLOC + 1, R0 + 26, L_BLOC + 1, R0 + 27)
        nom("cp_Comlab", FEUILLE, L_BLOC + 4, R0 + 26, L_BLOC + 4, R0 + 27)
        for i, n in enumerate(AUTRES):
            r, k0 = L_BLOC + 7 + 2 * (i // 2), 14 * (i % 2)
            nom("cp_" + n.upper(), FEUILLE, r, R0 + k0 + 12, r, R0 + k0 + 13)
        if self.macro:
            for typ, r in self.tpl.items():
                nom("tpl_" + typ, "Modèles", r, CHEV, r, LED)
            nom("tpl_situation", "Modèles", 12, R0, 12 + H_BLOC - 1, R1)
            nom("tpl_info", "Modèles", 30, R0, 30 + H_BLOC - 1, R1)


def construire(chemin, macro, vba_bin=None):
    Construction(chemin, macro, vba_bin).construire()


if __name__ == "__main__":
    import sys
    cible = sys.argv[1] if len(sys.argv) > 1 else "tous"
    if cible in ("tous", "xlsx"):
        construire(ICI / "Racco_D2.xlsx", macro=False)
        print("Racco_D2.xlsx ok")
    if cible in ("tous", "xlsm", "base"):
        vba = ICI / "vba" / "vbaProject.bin"
        if cible == "base" or not vba.exists():
            construire(ICI / "Racco_D2_base.xlsx", macro=True)
            print("Racco_D2_base.xlsx ok (sans VBA : à ouvrir dans Excel pour y coller les macros)")
        else:
            construire(ICI / "Racco_D2.xlsm", macro=True, vba_bin=vba)
            print("Racco_D2.xlsm ok")
