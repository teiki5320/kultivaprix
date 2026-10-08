Option Explicit
' Racco D2 : relais des evenements vers le module RaccoD2.

Private Sub Workbook_Open()
    Demarrer
End Sub

Private Sub Workbook_SheetChange(ByVal Sh As Object, ByVal Target As Range)
    If Sh.Name <> FEUILLE Then Exit Sub
    SurChangement Target
End Sub

Private Sub Workbook_SheetSelectionChange(ByVal Sh As Object, ByVal Target As Range)
    If Sh.Name <> FEUILLE Then Exit Sub
    SurSelection Target
End Sub
