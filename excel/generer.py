"""Génère les classeurs Excel de Racco D2 (même logique que index.html).

    python3 excel/generer.py            -> excel/Racco_D2_iPad.xlsx et excel/Racco_D2_ordinateur.xlsx

Tout est calculé par formules : états des étapes, verrouillage, situation,
dates +30 / +65 jours, codes Comlab, APE, DZI, RTY et LVE (identiques au site).
"""
import datetime as dt
import sys
from pathlib import Path

import xlsxwriter
from xlsxwriter.utility import xl_rowcol_to_cell as rc, xl_col_to_name

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

# ── Couleurs (tokens du site) ─────────────────────────────────────────────────
C = dict(fond="#EFE3D6", side="#CFE2D8", side_ink="#3F5A4C", carte="#FFFAF4", carte2="#F3E7DB", texte="#4A4238",
         muted="#6D6259", ligne="#E2D6C9", corail="#F4C6B5", peach_ink="#B5563A", ok="#3D7F55", ok_tint="#D9EAD9",
         ko="#C1523F", ko_tint="#F6D5C9", run="#96660F", run_tint="#F9E9B8", none="#7D7670", none_tint="#EBE4DC",
         led_vert="#36C26A", led_rouge="#E2493A", accent="#E8907A", verrou="#B4AAA0")
FONT = "Calibri"
MONO = "Consolas"

M = "'Racco D2'!"      # préfixe des références vers la feuille principale
K = "Calcul!"          # préfixe vers la feuille de calcul


def noeuds(liste, parent=None, niveau=1):
    for n in liste:
        n["parent"], n["niveau"] = parent, niveau
        yield n
        yield from noeuds(n.get("kids", []), n, niveau + 1)


def feuilles(n):
    return [x for k in n["kids"] for x in feuilles(k)] if n.get("kids") else [n]


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


def construire(chemin, macro=False, etat_test=None, depart_test=None):
    etat_test = etat_test or {}
    wb = xlsxwriter.Workbook(str(chemin), {"use_future_functions": True})
    wb.set_properties({"title": "Racco D2", "comments": "Suivi d'un dossier de raccordement D2"})
    wb.set_calc_mode("auto")

    def F(**kw):
        base = dict(font_name=FONT, font_size=11, font_color=C["texte"], valign="vcenter")
        base.update(kw)
        return wb.add_format(base)

    ws = wb.add_worksheet("Racco D2")
    kc = wb.add_worksheet("Calcul")
    pa = wb.add_worksheet("Paramètres")
    ws.activate()
    ws.hide_gridlines(2)
    ws.set_zoom(100)
    ws.outline_settings(True, False, True, False)   # boutons de groupe au-dessus des sous-tâches

    # Fond général
    fond = F(bg_color=C["fond"])
    ws.set_column("A:A", 2, fond)
    ws.set_column("B:B", 4.5, fond)
    ws.set_column("C:C", 3.5, fond)
    ws.set_column("D:D", 46, fond)
    ws.set_column("E:E", 4, fond)
    ws.set_column("F:F", 3, fond)
    ws.set_column("G:M", 13.5, fond)
    ws.set_column("N:Z", 2, fond)
    ws.set_default_row(24)

    # ── En-tête ──
    ws.set_row(0, 36)
    ws.merge_range("B1:M1", "Racco D2", F(bold=True, font_size=18, font_color=C["side_ink"], bg_color=C["side"], indent=1))
    ws.set_row(1, 8)

    # ── Paramètres : délais, jours fériés, alphabet ──
    pa.hide_gridlines(2)
    pa.set_column("A:A", 34)
    pa.set_column("B:B", 14)
    titre_p = F(bold=True, font_size=13)
    pa.write("A1", "Paramètres", titre_p)
    pa.write("A2", "Délai date 1 (jours)", F())
    pa.write("B2", DELAIS[0], F(bg_color=C["carte2"], align="center"))
    pa.write("A3", "Délai date 2 (jours)", F())
    pa.write("B3", DELAIS[1], F(bg_color=C["carte2"], align="center"))
    pa.write("A5", "Jours fériés (France)", titre_p)
    fmt_date = F(num_format="dd/mm/yyyy", align="center")
    liste = [d for a in range(2024, 2046) for d in feries(a)]
    for i, d in enumerate(liste):
        pa.write_datetime(5 + i, 1, dt.datetime(d.year, d.month, d.day), fmt_date)
    PAR = "'Paramètres'!"
    FERIES = f"'Paramètres'!$B$6:$B${5 + len(liste)}"
    pa.write("D1", "Alphabet base 32 des codes", F(font_color=C["muted"]))
    pa.write("D2", B32, F(font_name=MONO))
    ALPHA = "'Paramètres'!$D$2"

    # ── Questionnaire (colonne gauche) ──
    ws.write("B3", "TÂCHES", F(bold=True, font_size=10, font_color=C["muted"]))
    tous = list(noeuds(TACHES))
    rang = {}           # id -> ligne (0-indexée) dans la feuille principale
    ligne = 3
    f_case = F(align="center", bg_color=C["carte2"])
    # ligne de titre d'étape : un épais trait couleur fond au-dessus sépare les étapes
    sep = dict(top=5, top_color=C["fond"])
    f_case_h = F(align="center", bg_color=C["carte2"], **sep)
    f_num = F(font_color=C["muted"], font_size=10, align="right", bg_color=C["carte2"], **sep)
    f_t1 = F(bold=True, font_size=12, bg_color=C["carte2"], **sep)
    f_led = F(font_size=14, align="center", bg_color=C["carte2"], **sep)
    f_ou = F(font_size=9, bold=True, font_color=C["muted"], bg_color=C["carte2"], indent=2)
    f_vide = F(bg_color=C["carte2"])
    for i, t in enumerate(TACHES):
        rang[t["id"]] = ligne
        ws.insert_checkbox(ligne, 1, bool(etat_test.get(t["id"])), f_case_h)
        ws.write(ligne, 2, i + 1, f_num)
        ws.write(ligne, 3, t["lib"], f_t1)
        ws.write(ligne, 4, "●", f_led)
        ligne += 1
        enfants = [n for n in tous if n is not t and _sous(n, t)]
        for n in enfants:
            par = n["parent"]
            if par.get("mode") == "un" and par["kids"].index(n) > 0:
                ws.set_row(ligne, 24, None, {"level": 1})
                for col in range(1, 5):
                    ws.write_blank(ligne, col, None, f_vide)
                ws.write(ligne, 3, "ou", f_ou)
                ligne += 1
            rang[n["id"]] = ligne
            ws.set_row(ligne, 24, None, {"level": 1})
            ws.insert_checkbox(ligne, 1, bool(etat_test.get(n["id"])), f_case)
            ws.write_blank(ligne, 2, None, f_vide)
            ind = 1 if n["niveau"] == 2 else 3
            ws.write(ligne, 3, n["lib"], F(bg_color=C["carte2"], indent=ind, bold=n["niveau"] == 2))
            ws.write_blank(ligne, 4, None, f_vide)
            ligne += 1
    fin_taches = ligne

    # ── Calcul : nœuds ──
    kc.write_row(0, 0, ["id", "libellé", "ligne", "coché", "effectif", "valide"], F(bold=True))
    kc.set_column("A:A", 8)
    kc.set_column("B:B", 38)
    kc.set_column("C:Z", 14)
    cel = {}            # id -> dict de références Calcul
    for j, n in enumerate(tous):
        r = j + 1
        cel[n["id"]] = dict(chk=f"{K}$D${r + 1}", eff=f"{K}$E${r + 1}", val=f"{K}$F${r + 1}", lib=f"{K}$B${r + 1}")
        n["_r"] = r
    for n in tous:
        r = n["_r"]
        case = f"{M}$B${rang[n['id']] + 1}"
        kc.write(r, 0, n["id"])
        kc.write(r, 1, n["lib"])
        kc.write(r, 2, rang[n["id"]] + 1)
        kc.write_formula(r, 3, f"=IF(ISLOGICAL({case}),{case},LEN({case})>0)")
        p = n["parent"]
        # une case cochée coche en cascade ses sous-tâches, sauf à travers un choix « ou »
        eff = f"=OR(D{r + 1},{cel[p['id']]['eff']})" if p and p.get("mode") == "tout" else f"=D{r + 1}"
        kc.write_formula(r, 4, eff)
        if n.get("kids"):
            vals = ",".join(cel[k["id"]]["val"] for k in n["kids"])
            agg = f"AND({vals})" if n["mode"] == "tout" else f"OR({vals})"
            kc.write_formula(r, 5, f"=OR(E{r + 1},{agg})")
        else:
            kc.write_formula(r, 5, f"=E{r + 1}")

    # ── Calcul : grandes tâches ──
    T0 = len(tous) + 3      # ligne d'en-tête du tableau des tâches (0-indexée)
    entetes = ["n°", "id", "libellé", "valide", "branche A", "branche B", "en A", "en B", "verrou", "ko", "acquise",
               "tag", "texte", "statut", "décision", "action", "responsable", "lettre"]
    kc.write_row(T0, 0, entetes, F(bold=True))
    col = {h: i for i, h in enumerate(entetes)}

    def tc(h, i):    # référence absolue d'une cellule du tableau des tâches
        return f"{K}${xl_col_to_name(col[h])}${T0 + 2 + i}"

    CAB = f'IF({M}$I$9="","Cabinet conseil",{M}$I$9)'
    DLPI = f"{M}$I$10"
    DELAI = (f'IF({DLPI}="","DLPI non renseignée",IF({DLPI}-TODAY()>0,"J-"&({DLPI}-TODAY())&" avant la DLPI",'
             f'IF({DLPI}-TODAY()=0,"DLPI aujourd\'hui","DLPI dépassée de "&(TODAY()-{DLPI})&" j")))')
    COUR = f"{K}$B${T0 + 10}"   # n° de l'étape en cours (0 = dossier terminé)

    def qui(n):
        r = n.get("resp", "Moi")
        return CAB if r == "cab" else q(r)

    def manquants(n):
        fs = feuilles(n)
        return "TEXTJOIN(CHAR(10),TRUE," + ",".join(f'IF({cel[x["id"]]["val"]},"","• "&{cel[x["id"]]["lib"]})' for x in fs) + ")"

    def compte(n):
        fs = feuilles(n)
        return "(" + "+".join(f'N({cel[x["id"]]["val"]})' for x in fs) + ")", len(fs)

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
        # résultat, en commençant par le verrouillage
        champs = ["tag", "texte", "statut", "décision", "action", "responsable"]
        prec = TACHES[i - 1]["lib"] if i else ""
        verrou_val = ['"none"', '"Verrouillée"', '"Pas encore accessible"', '"—"',
                      q(f"Valider d'abord l'étape {i} · {prec}"), '"—"']
        for k, h in enumerate(champs):
            expr = defaut[k]
            for c in reversed(cas):
                expr = f"IF({c[0]},{c[k + 1]},{expr})"
            kc.write_formula(r, col[h], f"=IF({V('verrou')},{verrou_val[k]},{expr})")
        kc.write_formula(r, col["acquise"], f"=AND(NOT({V('verrou')}),{V('valide')},NOT({V('ko')}))")
        kc.write_formula(r, col["lettre"],
                         f'=IF({V("tag")}="ko","N",IF({V("acquise")},"V",IF(AND({i + 1}={COUR},{V("tag")}="run"),"E","A")))')
    ACQ = f"{K}${xl_col_to_name(col['acquise'])}${T0 + 2}:${xl_col_to_name(col['acquise'])}${T0 + 8}"
    kc.write(T0 + 9, 0, "en cours")
    kc.write_formula(T0 + 9, 1, f"=IFERROR(MATCH(FALSE,{ACQ},0),0)")
    kc.write(T0 + 10, 0, "affichée")
    SEL = f"{K}$B${T0 + 11}"
    kc.write_formula(T0 + 10, 1, f"=IF(ISNUMBER({M}$M$13),{M}$M$13,IF({COUR}=0,7,{COUR}))")

    # ── Calcul : code Comlab (25 caractères) ──
    C0 = T0 + 14
    kc.write(C0, 0, "Code Comlab", F(bold=True))
    lettres = "&".join(tc("lettre", i) for i in range(7))
    fs = [x for t in TACHES for x in feuilles(t)]
    bits = [f"N({cel[x['id']]['val']})" for x in fs] + ["0"] * (70 - len(fs))
    groupes = []
    for g in range(14):
        b = bits[5 * g:5 * g + 5]
        poids = "+".join(f"{2 ** (4 - k)}*{b[k]}" for k in range(5) if b[k] != "0") or "0"
        groupes.append(f"MID({ALPHA},1+{poids},1)")
    kc.write(C0 + 1, 0, "corps")
    CORPS = f"{K}$B${C0 + 2}"
    kc.write_formula(C0 + 1, 1, "=" + lettres + "&" + "&".join(groupes))
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
    hf = h_prec
    ctrl = "&".join(f"MID({ALPHA},MOD(INT({hf}/{32 ** k}),32)+1,1)" for k in range(4))
    kc.write(C0 + 25, 0, "Comlab")
    COMLAB = f"{K}$B${C0 + 26}"
    kc.write_formula(C0 + 25, 1, f"={CORPS}&{ctrl}")

    # ── Calcul : codes APE, DZI, RTY, LVE (même méthode que le site) ──
    r = C0 + 28
    CODES = {}
    for nom, L in AUTRES.items():
        kc.write(r, 0, nom.upper(), F(bold=True))
        r += 1
        h_prec, sorties = "2166136261", []
        for j in range((L + 1) // 2):
            graine = f'"{nom}"&{COMLAB}&{2 * j}'
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
            sorties.append(f"MID({ALPHA},MOD({h_prec},32)+1,1)&MID({ALPHA},MOD(INT({h_prec}/32),32)+1,1)")
        kc.write(r, 0, "code")
        kc.write_formula(r, 1, f"=LEFT({'&'.join(sorties)},{L})")
        CODES[nom] = f"{K}$B${r + 1}"
        r += 2

    # ── Calcul : dates ──
    DEP = f"{M}$I$28"
    D_ = []
    for k, cle in enumerate(["B2", "B3"]):
        rr = r + k
        kc.write(rr, 0, f"date {k + 1}")
        kc.write_formula(rr, 1, f'=IF(ISNUMBER({DEP}),{DEP}+{PAR}${cle[0]}${cle[1:]},"")')
        d = f"{K}$B${rr + 1}"
        kc.write_formula(rr, 2, f'=IF({d}="","",RIGHT("0"&DAY({d}),2)&"/"&RIGHT("0"&MONTH({d}),2)&"/"&YEAR({d}))')
        kc.write_formula(rr, 3, f'=IF({d}="","",CHOOSE(WEEKDAY({d}),"dim.","lun.","mar.","mer.","jeu.","ven.","sam."))')
        kc.write_formula(rr, 4, f'=IF({d}="","",IF(COUNTIF({FERIES},{d})>0,"Férié",IF(WEEKDAY({d},2)>5,"Week-end","")))')
        D_.append(dict(txt=f"{K}$C${rr + 1}", jour=f"{K}$D${rr + 1}", tag=f"{K}$E${rr + 1}", delai=f"'Paramètres'!${cle[0]}${cle[1:]}"))
    kc.hide()

    # ── Colonne droite : Dossier ──
    f_titre = F(bold=True, font_size=10, font_color=C["muted"], bg_color=C["carte"])
    f_lab = F(bold=True, font_size=10, font_color=C["muted"], bg_color=C["carte"], indent=1)
    f_inp = F(bg_color=C["carte2"], border=1, border_color=C["carte"], indent=1)
    f_carte = F(bg_color=C["carte"])
    for rr in range(2, 11):
        for cc in range(6, 13):
            ws.write_blank(rr, cc, None, f_carte)
    ws.write("G3", "DOSSIER", f_titre)
    champs = [("N° POI anticipation", 3), ("N° POI Racco D2", 4), ("Adresse", 5), ("Nombre d'EL", 6),
              ("Permis de construire", 7), ("Cabinet conseil", 8)]
    for lib, rr in champs:
        ws.merge_range(rr, 6, rr, 7, lib, f_lab)
        ws.merge_range(rr, 8, rr, 12, "", f_inp)
    ws.merge_range("G10:H10", "DLPI", f_lab)
    ws.merge_range("I10:M10", "", F(bg_color=C["carte2"], num_format="dd/mm/yyyy", indent=1, align="left",
                                     border=1, border_color=C["carte"]))
    ws.data_validation("I10", {"validate": "date", "criteria": ">", "value": dt.date(2000, 1, 1),
                               "error_title": "DLPI", "error_message": "Entre une date."})
    ws.merge_range("G11:H11", "IMB", f_lab)
    for cc in range(8, 12):
        ws.write_blank(10, cc, None, F(bg_color=C["carte2"], font_name=MONO, font_size=10, border=1, border_color=C["carte"]))
    ws.write_blank(10, 12, None, f_carte)

    # ── Colonne droite : Situation / Info ──
    VUE = f"{M}$K$13"
    INFO = f'{VUE}="Info"'
    for rr in range(12, 25):
        for cc in range(6, 13):
            ws.write_blank(rr, cc, None, f_carte)
    ws.merge_range("G13:I13", "", F(bold=True, font_size=10, font_color=C["muted"], bg_color=C["carte"]))
    ws.write_formula("G13", f'=IF({INFO},"INFO","SITUATION")',
                     F(bold=True, font_size=10, font_color=C["muted"], bg_color=C["carte"]))
    ws.write("J13", "Affichage", F(font_size=9, font_color=C["muted"], align="right", bg_color=C["carte"]))
    f_menu = F(bold=True, align="center", bg_color=C["carte2"], border=1, border_color=C["ligne"])
    ws.write("K13", "Situation", f_menu)
    ws.data_validation("K13", {"validate": "list", "source": ["Situation", "Info"]})
    ws.write("L13", "Étape", F(font_size=9, font_color=C["muted"], align="right", bg_color=C["carte"]))
    ws.write_blank("M13", None, f_menu)
    ws.data_validation("M13", {"validate": "list", "source": [str(i) for i in range(1, 8)],
                               "input_title": "Étape affichée", "input_message": "Vide = étape en cours"})
    # frise
    for i, t in enumerate(TACHES):
        ws.write_formula(13, 6 + i, f'=IF({INFO},"",{i + 1})', F(bold=True, font_size=13, align="center", bg_color=C["none_tint"],
                                                               font_color=C["none"], border=1, border_color=C["carte"]))
        ws.write_formula(14, 6 + i, f'=IF({INFO},"",{q(t["lib"])})', F(font_size=8, align="center", bg_color=C["carte"],
                                                                         font_color=C["muted"], shrink=True))
    # titre + étiquette
    lib_sel = f"INDEX({K}$C${T0 + 2}:$C${T0 + 8},{SEL})"
    ws.merge_range("G16:K16", "", F(bold=True, font_size=13, bg_color=C["carte"]))
    ws.write_formula("G16", f'=IF({INFO},"Dates et codes du dossier",{SEL}&" · "&{lib_sel})', F(bold=True, font_size=13, bg_color=C["carte"]))
    tag_sel = f"INDEX({K}${xl_col_to_name(col['tag'])}${T0 + 2}:${xl_col_to_name(col['tag'])}${T0 + 8},{SEL})"
    txt_sel = f"INDEX({K}${xl_col_to_name(col['texte'])}${T0 + 2}:${xl_col_to_name(col['texte'])}${T0 + 8},{SEL})"
    ws.merge_range("L16:M16", "", F(bold=True, font_size=10, align="center", bg_color=C["carte"]))
    ws.write_formula("L16", f'=IF({INFO},"",{txt_sel})', F(bold=True, font_size=10, align="center", bg_color=C["carte"]))

    def champ_sel(h):
        c_ = xl_col_to_name(col[h])
        return f"INDEX({K}${c_}${T0 + 2}:${c_}${T0 + 8},{SEL})"

    def date_lib(k):
        d = D_[k]
        return (f'"+ "&{d["delai"]}&" jours"&IF({d["txt"]}="",""," · "&{d["jour"]})'
                f'&IF({d["tag"]}="",""," · "&{d["tag"]})')

    lignes = [  # (libellé Situation, valeur Situation, libellé Info, valeur Info, hauteur)
        ('"Statut"', champ_sel("statut"), date_lib(0), f'IF({D_[0]["txt"]}="","—",{D_[0]["txt"]})', 1),
        ('"Décision"', champ_sel("décision"), date_lib(1), f'IF({D_[1]["txt"]}="","—",{D_[1]["txt"]})', 1),
        ('"Action suivante"', champ_sel("action"), '"Code Comlab"', COMLAB, 3),
        ('"Responsable"', champ_sel("responsable"), '"APE"', CODES["ape"], 1),
        ('"Délai"', DELAI, '"DZI"', CODES["dzi"], 1),
        ('""', f'IF(OR({COUR}={SEL},{COUR}=0),"","Étape en cours : "&{COUR}&" · "&INDEX({K}$C${T0 + 2}:$C${T0 + 8},{COUR}))',
         '"RTY"', CODES["rty"], 1),
        ('""', '""', '"LVE"', CODES["lve"], 1),
    ]
    f_k = F(bold=True, font_size=10, font_color=C["muted"], bg_color=C["carte2"], indent=1, text_wrap=True)
    f_v = F(bold=True, bg_color=C["carte2"], text_wrap=True, indent=1)
    rr = 16
    for ls, vs, li, vi, n in lignes:
        ws.merge_range(rr, 6, rr + n - 1, 7, "", f_k)
        ws.write_formula(rr, 6, f"=IF({INFO},{li},{ls})", f_k)
        ws.merge_range(rr, 8, rr + n - 1, 12, "", f_v)
        ws.write_formula(rr, 8, f"=IF({INFO},{vi},{vs})", f_v)
        rr += n

    # ── Colonne droite : Dates ──
    for rr in range(26, 30):
        for cc in range(6, 13):
            ws.write_blank(rr, cc, None, f_carte)
    ws.write("G27", "DATES", f_titre)
    ws.merge_range("G28:H28", "Date de départ", f_lab)
    ws.merge_range("I28:J28", "", F(bold=True, font_size=13, bg_color=C["carte2"], num_format="dd/mm/yyyy", align="center",
                                     border=1, border_color=C["ligne"]))
    if depart_test:
        ws.write_datetime("I28", dt.datetime.combine(depart_test, dt.time()), F(bold=True, font_size=13, bg_color=C["carte2"],
                                                                                num_format="dd/mm/yyyy", align="center"))
    ws.data_validation("I28", {"validate": "date", "criteria": ">", "value": dt.date(2000, 1, 1),
                               "input_title": "Date de départ", "input_message": "Tape la date, par ex. 07/10/2026 ou Ctrl+; pour aujourd'hui",
                               "error_title": "Date de départ", "error_message": "Entre une date."})
    ws.merge_range("K28:M28", "", F(font_color=C["muted"], bg_color=C["carte"], indent=1))
    ws.write_formula("K28", f'=IF(ISNUMBER({DEP}),CHOOSE(WEEKDAY({DEP}),"dimanche","lundi","mardi","mercredi","jeudi","vendredi","samedi"),"")',
                     F(font_color=C["muted"], bg_color=C["carte"], indent=1))
    for k in range(2):
        rr = 28 + k
        d = D_[k]
        ws.merge_range(rr, 6, rr, 7, "", f_lab)
        ws.write_formula(rr, 6, f'="+ "&{d["delai"]}&" jours"', f_lab)
        ws.merge_range(rr, 8, rr, 9, "", F(bold=True, font_size=13, bg_color=C["carte2"], align="center"))
        ws.write_formula(rr, 8, f'=IF({d["txt"]}="","—",{d["txt"]})', F(bold=True, font_size=13, bg_color=C["carte2"], align="center"))
        ws.write_formula(rr, 10, f'={d["jour"]}', F(font_color=C["muted"], bg_color=C["carte"], align="center"))
        ws.merge_range(rr, 11, rr, 12, "", F(bold=True, font_size=10, align="center", bg_color=C["carte"]))
        ws.write_formula(rr, 11, f'={d["tag"]}', F(bold=True, font_size=10, align="center", bg_color=C["carte"]))

    # ── Mises en forme conditionnelles ──
    def cf(plage, formule, **fmt):
        ws.conditional_format(plage, {"type": "formula", "criteria": formule, "format": wb.add_format(fmt)})

    ws.write_formula("E3", f'=COUNTIF({ACQ},TRUE)&" / 7"', F(bold=True, font_size=10, align="center",
                                                               bg_color=C["none_tint"], font_color=C["none"]))
    cf("E3", f"=COUNTIF({ACQ},TRUE)=7", bg_color=C["ok_tint"], font_color=C["ok"])
    cf("E3", f"=COUNTIF({ACQ},TRUE)>0", bg_color=C["run_tint"], font_color=C["run"])
    for i, t in enumerate(TACHES):
        r = rang[t["id"]] + 1
        tag = tc("tag", i)
        cf(f"E{r}", f'={tag}="ok"', font_color=C["led_vert"])
        cf(f"E{r}", f'={tag}<>"ok"', font_color=C["led_rouge"])
        dern = rang[TACHES[i + 1]["id"]] if i + 1 < len(TACHES) else fin_taches   # n° Excel de la dernière sous-tâche
        cf(f"B{r}:D{dern}", f"={tc('verrou', i)}", font_color=C["verrou"])
    for n in tous:
        r = rang[n["id"]] + 1
        cf(f"D{r}", f"={cel[n['id']]['val']}", font_color=C["ok"])
    # frise : couleur selon l'état, cadre sur l'étape affichée
    for i in range(7):
        c_ = xl_col_to_name(6 + i)
        plage = f"{c_}14"
        cf(plage, f"=AND(NOT({INFO}),{SEL}={i + 1})", bold=True, border=2, border_color=C["texte"])
        cf(plage, f'=AND(NOT({INFO}),{tc("tag", i)}="ko")', bg_color=C["ko_tint"], font_color=C["ko"])
        cf(plage, f"=AND(NOT({INFO}),{tc('acquise', i)})", bg_color=C["ok_tint"], font_color=C["ok"])
        cf(plage, f"=AND(NOT({INFO}),{COUR}={i + 1})", bg_color=C["run_tint"], font_color=C["run"])
        cf(plage, f"={INFO}", bg_color=C["corail"])
    cf("G15:M15", f"={INFO}", bg_color=C["corail"])
    # étiquette de l'étape affichée
    for tag, fond_, encre in [("ok", "ok_tint", "ok"), ("run", "run_tint", "run"), ("ko", "ko_tint", "ko"), ("none", "none_tint", "none")]:
        cf("L16", f'=AND(NOT({INFO}),{tag_sel}="{tag}")', bg_color=C[fond_], font_color=C[encre])
    # carte Info en corail
    cf("G13:M16", f"={INFO}", bg_color=C["corail"])
    cf("G13:I13", f"={INFO}", bg_color=C["corail"], font_color=C["peach_ink"])
    cf("I17:M25", f"={INFO}", font_color=C["texte"], bg_color=C["carte"], bold=True)
    cf("G17:H25", f"={INFO}", bg_color=C["corail"], font_color=C["peach_ink"])
    for k in range(2):
        rr = 29 + k
        cf(f"L{rr}", f'=L{rr}<>""', bg_color=C["ko_tint"], font_color=C["ko"])

    ws.freeze_panes(2, 0)
    ws.set_landscape()
    ws.fit_to_pages(1, 0)
    ws.print_area(0, 0, max(fin_taches, 30), 12)

    if macro:
        page_macro(wb, F)
    wb.close()


def _sous(n, t):
    p = n["parent"]
    while p:
        if p is t:
            return True
        p = p["parent"]
    return False


VBA = r'''Option Explicit
' Racco D2 : double-clic sur un code ou une date pour le copier.
' A coller dans le module de la feuille « Racco D2 » (voir la feuille Macro).

Private Sub Worksheet_BeforeDoubleClick(ByVal Target As Range, Cancel As Boolean)
    Dim zone As Range, v As String
    Set zone = Target.Cells(1, 1).MergeArea.Cells(1, 1)
    If Not Intersect(zone, Me.Range("I17:I25")) Is Nothing Then
        If Me.Range("K13").Value <> "Info" Then Exit Sub
    ElseIf Intersect(zone, Me.Range("I29:I30")) Is Nothing Then
        Exit Sub
    End If
    v = CStr(zone.Value)
    If v = "" Or v = "—" Then Exit Sub
    Cancel = True
    If CopierTexte(v) Then
        Application.StatusBar = "Copié : " & v
    Else
        zone.Copy
        Application.StatusBar = "Cellule copiée : " & v
    End If
    Application.OnTime Now + TimeValue("00:00:03"), "'" & ThisWorkbook.Name & "'!EffacerBarre"
End Sub

Private Function CopierTexte(ByVal v As String) As Boolean
    ' Windows : presse-papiers texte via MSForms ; sur Mac on retombe sur zone.Copy
    On Error GoTo Echec
    Dim o As Object
    Set o = CreateObject("New:{1C3B4210-F441-11CE-B9EA-00AA006B1A69}")
    o.SetText v
    o.PutInClipboard
    CopierTexte = True
    Exit Function
Echec:
    CopierTexte = False
End Function
'''

VBA_MODULE = r'''Option Explicit
' Racco D2 : efface le message « Copié » de la barre d'état.
Public Sub EffacerBarre()
    Application.StatusBar = False
End Sub
'''


def page_macro(wb, F):
    mc = wb.add_worksheet("Macro")
    mc.hide_gridlines(2)
    mc.set_column("A:A", 110)
    mc.write("A1", "Activer la copie par double-clic (Excel sur ordinateur, à faire une seule fois)", F(bold=True, font_size=13))
    etapes = [
        "1. Enregistre ce fichier au format « Classeur Excel prenant en charge les macros (.xlsm) ».",
        "2. Ouvre l'éditeur VBA : Alt+F11 sur Windows, Option+F11 (ou Outils > Macros > Visual Basic Editor) sur Mac.",
        "3. À gauche, double-clique sur « Feuil1 (Racco D2) » et colle le code A ci-dessous.",
        "4. Menu Insertion > Module, puis colle le code B ci-dessous.",
        "5. Ferme l'éditeur et enregistre. Si Excel demande d'activer les macros à l'ouverture, accepte.",
        "Ensuite : en affichage Info, double-clique sur un code ou une date pour le copier. Ça marche aussi pour les dates de la carte Dates.",
        "Sur iPad les macros ne fonctionnent pas : touche la cellule puis Copier.",
    ]
    for i, e in enumerate(etapes):
        mc.write(2 + i, 0, e, F(text_wrap=True))
    mono = F(font_name=MONO, font_size=10, valign="top", text_wrap=True, bg_color=C["carte2"])
    mc.write(10, 0, "Code A : module de la feuille « Racco D2 »", F(bold=True))
    for i, l in enumerate(VBA.splitlines()):
        mc.write(11 + i, 0, l, mono)
    base = 12 + len(VBA.splitlines())
    mc.write(base, 0, "Code B : module standard", F(bold=True))
    for i, l in enumerate(VBA_MODULE.splitlines()):
        mc.write(base + 1 + i, 0, l, mono)


if __name__ == "__main__":
    construire(ICI / "Racco_D2_iPad.xlsx")
    construire(ICI / "Racco_D2_ordinateur.xlsx", macro=True)
    (ICI / "copie_double_clic.bas").write_text(VBA + "\n" + VBA_MODULE, encoding="utf-8")
    print("ok")
