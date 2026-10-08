# Racco D2 en Excel

Reproduction du site `index.html` dans un classeur Excel : même questionnaire, même logique, mêmes codes.

- `Racco_D2.xlsm` : version complète pour Excel sur ordinateur (Mac et Windows). L'interface est faite de
  formes (cartes arrondies, cases, diodes, frise, boutons) dessinées par les macros à l'ouverture ; les champs
  de saisie sont de vraies cellules sous des formes qui s'effacent pendant la frappe. Accepter « Activer les
  macros » à l'ouverture.
- `Racco_D2.xlsx` : version sans macro pour Excel sur iPad. Tout est calculé par formules ; l'arbre est
  toujours déplié et la carte Info est affichée sous la carte Dates. Pas de copie en un clic : toucher la
  cellule du code puis Copier.

## Reconstruire

```bash
pip install xlsxwriter
python3 excel/construire.py          # écrit Racco_D2.xlsx et Racco_D2.xlsm
```

`construire.py` écrit les cellules et les formules (feuille `Calcul`). Pour le `.xlsm`, `interface.py` décrit
chaque forme dans la feuille `Rendu` : position, style, texte et liaisons (formules qui donnent le texte, le
style, la visibilité, la position). Le moteur VBA crée les formes au premier lancement et ne met à jour que
celles dont une liaison change. Tout le design se règle dans `interface.py`, sans toucher au VBA. Le code VBA
de `vba/vbaProject.bin` est intégré tel quel dans le `.xlsm`.

## Modifier le VBA

Les sources lisibles sont `vba/RaccoD2.bas` et `vba/ThisWorkbook.cls`, en ASCII pur (l'éditeur VBA de Mac
abîme les accents et les symboles collés ; les symboles passent par `ChrW()`). Après une modification :

1. ouvrir `Racco_D2.xlsm` dans Excel, coller le nouveau code dans le module `RaccoD2` (et `ThisWorkbook`),
   enregistrer ;
2. extraire le projet compilé : `unzip -p Racco_D2.xlsm xl/vbaProject.bin > excel/vba/vbaProject.bin` ;
3. relancer `python3 excel/construire.py`.

Les feuilles ont pour nom de code `Feuil1` à `Feuil4` (fixés par `set_vba_name`) : ils doivent rester
identiques à ceux du `vbaProject.bin`.

## Tester sans la souris

Depuis AppleScript, `run VB macro "Racco_D2.xlsm!TestClic" arg1 "t1a_cb"` simule un clic sur la forme
nommée (noms dans la colonne A de `Rendu`). `Construire` redessine toutes les formes.
Les erreurs des macros sont notées dans `Calcul!Z1`.
