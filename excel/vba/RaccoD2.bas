Option Explicit
' Racco D2 : meme comportement que index.html.
' - l'arbre des taches est redessine a chaque changement (replier une etape ne cache aucune ligne) ;
' - les boutons sont des cellules : un clic (selection) declenche l'action ;
' - les codes et les dates se copient dans le presse-papiers.
' Les formules de la feuille Calcul font tout le reste ; les modeles de lignes et de blocs sont sur la feuille Modeles.

Public Const FEUILLE As String = "Racco D2"
Private mOccupe As Boolean
Private mDernierClic As String      ' anti-rebond : un clic de souris sur une cellule fusionnee peut
Private mDernierTemps As Double     ' declencher deux evenements de selection

' colonnes de la table " noeuds " (feuille Calcul)
Private Const N_ID = 1, N_LIB = 2, N_NIVEAU = 3, N_COCHE = 4, N_VALIDE = 6, N_FERME = 7, N_PARENT = 8, N_MODE = 9, N_INDEX = 10, N_VERROU = 12

Private Function Principale() As Worksheet
    Set Principale = ThisWorkbook.Worksheets(FEUILLE)
End Function

Private Function N(ByVal nom As String) As Range
    Set N = ThisWorkbook.Names(nom).RefersToRange
End Function

Private Function Vue() As String
    Vue = CStr(N("vue").Value)
End Function

Private Function IdLigne(ByVal r As Long) As String
    IdLigne = CStr(Principale.Cells(r, N("aide").Column).Value)
End Function

Private Sub Verrou(ByVal actif As Boolean)
    mOccupe = actif
    Application.EnableEvents = Not actif
End Sub

' journal de bord (cellule Z1 de Calcul) pour le diagnostic
Private Sub Journal(ByVal msg As String)
    On Error Resume Next
    With ThisWorkbook.Worksheets("Calcul").Range("Z1")
        .Value = Format$(Now, "hh:nn:ss") & " " & msg & vbLf & Left$(CStr(.Value), 3000)
    End With
End Sub

' points d'entree pour les tests automatiques (AppleScript : run VB macro ... with arg1 ...)
Public Sub TestVue()
    BasculerVue
End Sub

Public Sub TestCocher(ByVal id As String, ByVal coche As Boolean)
    Basculer id, coche
End Sub

Public Sub TestPlier(ByVal id As String)
    BasculerFerme id
End Sub

Public Sub TestEtape(ByVal pos As Long)
    ChoisirEtape pos
End Sub

'  demarrage 
Public Sub Demarrer()
    ' le mode de calcul est global a Excel : s'il est manuel (herite d'un autre classeur), la frise, les dates
    ' et les codes ne se mettraient plus a jour en direct
    If Application.Calculation <> xlCalculationAutomatic Then Application.Calculation = xlCalculationAutomatic
    Rendre
End Sub

'  evenements (relayes par ThisWorkbook) 
Public Sub SurChangement(ByVal Target As Range)
    If mOccupe Then Exit Sub
    On Error GoTo Erreur
    Dim c As Range: Set c = Target.Cells(1, 1)
    If Intersect(c, N("arbre")) Is Nothing Then Exit Sub
    If c.Column <> N("arbre").Column + 1 Then Exit Sub
    Dim id As String: id = IdLigne(c.Row)
    If id = "" Or id = "ou" Then Exit Sub
    Basculer id, (c.Value = True)
    Exit Sub
Erreur:
    Journal "erreur SurChangement " & Err.Number & " " & Err.Description
    Verrou False
End Sub

Public Sub SurSelection(ByVal Target As Range)
    If mOccupe Then Exit Sub
    On Error GoTo Erreur
    Dim c As Range: Set c = Target.Cells(1, 1)
    Dim fait As Boolean, id As String
    If c.Address = mDernierClic And Timer - mDernierTemps < 0.7 Then Exit Sub
    If Not Intersect(c, N("arbre")) Is Nothing Then
        id = IdLigne(c.Row)
        If Len(id) = 2 Then                               ' t1..t7 : ligne d'une grande tache
            If c.Column = N("arbre").Column Then
                BasculerFerme id
                fait = True
            ElseIf c.Column = N("arbre").Column + 3 Then
                ChoisirEtape CLng(Mid$(id, 2))
                fait = True
            End If
        End If
    ElseIf Not Intersect(c, N("btnVue")) Is Nothing Then
        BasculerVue                 ' (sur sa propre ligne : suivi de ":" ce serait une etiquette, pas un appel)
        fait = True
    ElseIf Not Intersect(c, N("btnAujourdhui")) Is Nothing Then
        Verrou True
        N("dateDepart").Cells(1, 1).Value = Date
        Verrou False
        fait = True
    ElseIf Vue = "Situation" And Not Intersect(c, N("frise")) Is Nothing Then
        ChoisirEtape (c.Column - N("frise").Column) \ 4 + 1
        fait = True
    Else
        fait = CopierSiBouton(c)
    End If
    If fait Then
        mDernierClic = c.Address
        mDernierTemps = Timer
        mOccupe = True
        Principale.Cells(c.Row, N("arbre").Column + 5).Select     ' colonne G, vide : le prochain clic sur le meme bouton marchera
        mOccupe = False
    End If
    Exit Sub
Erreur:
    Journal "erreur SurSelection " & Err.Number & " " & Err.Description
    Verrou False
End Sub

'  etat des cases (port de basculer() du site) 
Private Sub Basculer(ByVal id As String, ByVal coche As Boolean)
    Dim nd As Variant, nb As Long, i As Long, k As Long, x As Long, p As Long, j As Long
    nd = N("noeuds").Value
    nb = UBound(nd, 1)
    i = Indice(nd, id)
    If i = 0 Then Exit Sub
    If CBool(nd(i, N_VERROU)) Then Rendre: Exit Sub
    Dim etat() As Boolean: ReDim etat(1 To nb)
    For k = 1 To nb: etat(k) = CBool(nd(k, N_COCHE)): Next
    If coche Then
        etat(i) = True
        Cascade nd, i, etat
        ' branches au choix : cocher dans une branche efface les autres
        x = i
        Do While x > 0
            p = Indice(nd, CStr(nd(x, N_PARENT)))
            If p > 0 Then
                If nd(p, N_MODE) = "un" Then
                    For j = 1 To nb
                        If nd(j, N_PARENT) = nd(p, N_ID) And j <> x Then
                            etat(j) = False
                            Decocher nd, j, etat
                        End If
                    Next
                End If
            End If
            x = p
        Loop
    Else
        etat(i) = False
        Decocher nd, i, etat
        x = Indice(nd, CStr(nd(i, N_PARENT)))
        Do While x > 0
            etat(x) = False
            x = Indice(nd, CStr(nd(x, N_PARENT)))
        Loop
    End If
    Dim col() As Variant: ReDim col(1 To nb, 1 To 1)
    For k = 1 To nb: col(k, 1) = etat(k): Next
    Verrou True
    N("noeuds").Columns(N_COCHE).Value = col
    Verrou False
    Rendre
End Sub

' coche en cascade les sous-taches (sans traverser un choix " ou ")
Private Sub Cascade(nd As Variant, ByVal i As Long, etat() As Boolean)
    If nd(i, N_MODE) = "un" Then Exit Sub
    Dim j As Long
    For j = 1 To UBound(nd, 1)
        If nd(j, N_PARENT) = nd(i, N_ID) Then
            etat(j) = True
            Cascade nd, j, etat
        End If
    Next
End Sub

' decoche toute la descendance
Private Sub Decocher(nd As Variant, ByVal i As Long, etat() As Boolean)
    Dim j As Long
    For j = 1 To UBound(nd, 1)
        If nd(j, N_PARENT) = nd(i, N_ID) Then
            etat(j) = False
            Decocher nd, j, etat
        End If
    Next
End Sub

Private Function Indice(nd As Variant, ByVal id As String) As Long
    Dim j As Long
    If id = "" Then Exit Function
    For j = 1 To UBound(nd, 1)
        If nd(j, N_ID) = id Then Indice = j: Exit Function
    Next
End Function

Private Sub BasculerFerme(ByVal id As String)
    Dim nd As Variant, i As Long
    nd = N("noeuds").Value
    i = Indice(nd, id)
    If i = 0 Then Exit Sub
    If CBool(nd(i, N_VERROU)) Then Exit Sub               ' verrouillee : reste repliee
    Verrou True
    N("noeuds").Cells(i, N_FERME).Value = Not CBool(nd(i, N_FERME))
    Verrou False
    Rendre
End Sub

Private Sub ChoisirEtape(ByVal pos As Long)
    Verrou True
    If Vue = "Situation" Then
        N("etapeChoisie").Cells(1, 1).Value = pos
    Else
        N("selMemo").Value = pos
    End If
    Verrou False
End Sub

'  rendu de l'arbre (port de rendu() du site) 
Public Sub Rendre()
    Dim nd As Variant, nb As Long, i As Long, j As Long, p As Long, r As Long, pos As Long
    Dim ferme As Boolean
    Dim ws As Worksheet: Set ws = Principale
    Dim arbre As Range: Set arbre = N("arbre")
    Dim clip As String: clip = LireClip()
    Verrou True
    Application.ScreenUpdating = False
    Application.Calculate
    nd = N("noeuds").Value
    nb = UBound(nd, 1)
    arbre.FormatConditions.Delete
    arbre.Clear
    r = arbre.Row
    For i = 1 To nb
        If nd(i, N_NIVEAU) = 1 Then
            pos = pos + 1
            ferme = CBool(nd(i, N_FERME)) Or CBool(nd(i, N_VERROU))
            Ligne ws, r, "etape", nd, i, pos, ferme
            r = r + 1
            If Not ferme Then
                For j = i + 1 To nb
                    If nd(j, N_NIVEAU) = 1 Then Exit For
                    p = Indice(nd, CStr(nd(j, N_PARENT)))
                    If nd(p, N_MODE) = "un" And nd(j, N_INDEX) > 0 Then
                        Ligne ws, r, "ou", nd, 0, 0, False
                        r = r + 1
                    End If
                    Ligne ws, r, IIf(nd(j, N_NIVEAU) = 2, "sous2", "sous3"), nd, j, 0, False
                    r = r + 1
                Next
            End If
        End If
    Next
    Ligne ws, r, "fin", nd, 0, 0, False
    r = r + 1
    Do While r <= arbre.Row + arbre.Rows.Count - 1
        Ligne ws, r, "vide", nd, 0, 0, False
        r = r + 1
    Loop
    Application.ScreenUpdating = True
    Verrou False
    RemettreClip clip
End Sub

Private Sub Ligne(ws As Worksheet, ByVal r As Long, ByVal typ As String, nd As Variant, ByVal i As Long, ByVal pos As Long, ByVal ferme As Boolean)
    Dim c0 As Long: c0 = N("arbre").Column
    Dim cAide As Long: cAide = N("aide").Column
    N("tpl_" & typ).Copy Destination:=ws.Cells(r, c0)
    Select Case typ
    Case "etape"
        ws.Cells(r, c0).Value = IIf(ferme, ChrW(&H25B8), ChrW(&H25BE))
        ws.Cells(r, c0 + 1).Value = CBool(nd(i, N_VALIDE))
        ws.Cells(r, c0 + 2).Value = pos
        ws.Cells(r, c0 + 3).Value = nd(i, N_LIB)
        ws.Cells(r, cAide).Value = nd(i, N_ID)
    Case "sous2", "sous3"
        ws.Cells(r, c0 + 1).Value = CBool(nd(i, N_VALIDE))
        ws.Cells(r, c0 + 3).Value = nd(i, N_LIB)
        ws.Cells(r, cAide).Value = nd(i, N_ID)
    Case "ou"
        ws.Cells(r, cAide).Value = "ou"
    Case Else
        ws.Cells(r, cAide).Value = ""
    End Select
End Sub

'  Situation / Info 
Private Sub BasculerVue()
    Dim nouveau As String
    nouveau = IIf(Vue = "Info", "Situation", "Info")
    Dim clip As String: clip = LireClip()
    Verrou True
    Application.ScreenUpdating = False
    If nouveau = "Info" Then N("selMemo").Value = N("etapeChoisie").Cells(1, 1).Value
    With N("bloc")
        .FormatConditions.Delete
        .UnMerge
        .Clear
    End With
    N("tpl_" & LCase$(nouveau)).Copy Destination:=N("bloc").Cells(1, 1)
    If nouveau = "Situation" Then N("etapeChoisie").Cells(1, 1).Value = N("selMemo").Value
    N("vue").Value = nouveau
    Application.ScreenUpdating = True
    Verrou False
    RemettreClip clip
End Sub

'  copie dans le presse-papiers 
Private Function CopierSiBouton(c As Range) As Boolean
    Dim noms As Variant, src As Variant, i As Long, v As String
    noms = Array("cp_D30", "cp_D65", "cp_I30", "cp_I65", "cp_Comlab", "cp_APE", "cp_DZI", "cp_RTY", "cp_LVE")
    src = Array("date30", "date65", "date30", "date65", "comlab", "codeAPE", "codeDZI", "codeRTY", "codeLVE")
    For i = 0 To UBound(noms)
        If Not Intersect(c, N(noms(i))) Is Nothing Then
            If i >= 2 And Vue <> "Info" Then Exit Function
            v = CStr(N(src(i)).Value)
            If v <> "" Then
                Copier v
                Retour N(noms(i)).Cells(1, 1), v
            End If
            CopierSiBouton = True
            Exit Function
        End If
    Next
End Function

Private Sub Retour(cell As Range, ByVal v As String)
    Verrou True
    cell.Value = ChrW(&H2713)
    cell.Font.Color = RGB(255, 250, 244)
    cell.Interior.Color = RGB(61, 127, 85)
    Verrou False
    Application.StatusBar = "Copi" & ChrW(233) & " : " & v
    Application.OnTime Now + TimeSerial(0, 0, 2), "'" & ThisWorkbook.Name & "'!RetablirIcones"
End Sub

Public Sub RetablirIcones()
    Dim noms As Variant, i As Long, c As Range
    noms = Array("cp_D30", "cp_D65", "cp_I30", "cp_I65", "cp_Comlab", "cp_APE", "cp_DZI", "cp_RTY", "cp_LVE")
    Verrou True
    For i = 0 To UBound(noms)
        Set c = N(noms(i)).Cells(1, 1)
        If c.Value = ChrW(&H2713) Then
            c.Value = ChrW(&H29C9)
            c.Font.Color = RGB(51, 25, 15)
            c.Interior.Color = RGB(232, 144, 122)
        End If
    Next
    Verrou False
    Application.StatusBar = False
End Sub

' sur Mac, Range.Copy Destination:= vide le presse-papiers : on sauve son texte avant un rendu et on le remet apres
Private Function LireClip() As String
    #If Mac Then
        On Error Resume Next
        LireClip = MacScript("the clipboard as text")
        On Error GoTo 0
    #End If
End Function

Private Sub RemettreClip(ByVal texte As String)
    #If Mac Then
        If texte <> "" Then Copier texte
    #End If
End Sub

Public Sub Copier(ByVal texte As String)
    On Error Resume Next
    #If Mac Then
        MacScript "set the clipboard to """ & Replace(Replace(texte, "\", "\\"), """", "\""") & """"
    #Else
        With CreateObject("New:{1C3B4210-F441-11CE-B9EA-00AA006B1A69}")
            .SetText texte
            .PutInClipboard
        End With
    #End If
    If Err.Number <> 0 Then
        Err.Clear
        CopierParForme texte
    End If
    On Error GoTo 0
End Sub

' secours : copie le texte d'une zone de texte temporaire (marche sur Mac et Windows)
Private Sub CopierParForme(ByVal texte As String)
    On Error Resume Next
    Dim sh As Shape
    Set sh = Principale.Shapes.AddTextbox(1, 0, 0, 100, 20)
    sh.TextFrame2.TextRange.Text = texte
    sh.TextFrame2.TextRange.Copy
    sh.Delete
End Sub
