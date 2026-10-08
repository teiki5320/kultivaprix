Option Explicit
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

Option Explicit
' Racco D2 : efface le message « Copié » de la barre d'état.
Public Sub EffacerBarre()
    Application.StatusBar = False
End Sub
