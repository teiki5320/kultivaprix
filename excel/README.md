# Racco D2 en Excel

Reproduction du site `index.html` dans un classeur Excel : même questionnaire, même logique, mêmes codes.

- `Racco_D2.xlsm` : version complète pour Excel sur ordinateur (Mac et Windows). Les macros redessinent
  l'arbre des tâches, basculent Situation ↔ Info et copient les codes et les dates dans le presse-papiers.
  Accepter « Activer les macros » à l'ouverture.
- `Racco_D2.xlsx` : version sans macro pour Excel sur iPad. Tout est calculé par formules ; l'arbre est
  toujours déplié et la carte Info est affichée sous la carte Dates. Pas de copie en un clic : toucher la
  cellule du code puis Copier.

## Reconstruire

```bash
pip install xlsxwriter
python3 excel/construire.py          # écrit Racco_D2.xlsx et Racco_D2.xlsm
```

`construire.py` écrit toutes les cellules, les formules (feuille `Calcul`) et les modèles copiés par les
macros (feuille `Modèles`). Le code VBA de `vba/vbaProject.bin` est intégré tel quel dans le `.xlsm`.

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

Depuis AppleScript, `run VB macro "Racco_D2.xlsm!TestCocher" arg1 "t1a" arg2 true` coche une case comme un
clic ; `TestPlier` replie une étape, `TestEtape` choisit l'étape affichée, `TestVue` bascule Situation ↔ Info.
Les erreurs des macros sont notées dans `Calcul!Z1`.
