Option Explicit
' Racco D2 : moteur d'interface. Toute l'interface est decrite dans la feuille Rendu (table "ui") :
' Construire cree les formes, Rafraichir met a jour celles dont une liaison a change (texte, style,
' visibilite, position, hauteur). Les clics sur les formes passent par Clic ; la logique reste en formules.
' Source en ASCII pur (l'editeur VBA de Mac abime les accents) : les symboles passent par ChrW().

Public Const FEUILLE As String = "Racco D2"

' colonnes de la table "ui"
Private Const C_NOM = 1, C_TYPE = 2, C_X = 3, C_Y = 4, C_W = 5, C_H = 6, C_R = 7, C_POL = 8, C_TAI = 9, C_GRAS = 10
Private Const C_AL = 11, C_VA = 12, C_MAR = 13, C_RET = 14, C_ESP = 15, C_TXT = 16, C_RICHE = 17, C_STY = 18
Private Const C_ACT = 19, C_ANC = 20, C_AUTO = 21
Private Const B_TXT = 22, B_STY = 23, B_VIS = 24, B_Y = 25, B_H = 26, A_TXT = 27
' colonnes de la table "noeuds" (feuille Calcul)
Private Const N_ID = 1, N_VALIDE = 6, N_FERME = 7, N_PARENT = 8, N_MODE = 9, N_VERROU = 12, N_COCHE = 4

Private mStyles As Variant
Private mKx As Double, mKy As Double
Private mEdition As String
Private mOccupe As Boolean

Private Function Ui() As Worksheet
    Set Ui = ThisWorkbook.Worksheets(FEUILLE)
End Function

Private Function N(ByVal nom As String) As Range
    Set N = ThisWorkbook.Names(nom).RefersToRange
End Function

Private Sub Journal(ByVal msg As String)
    On Error Resume Next
    With ThisWorkbook.Worksheets("Calcul").Range("Z1")
        .Value = Format$(Now, "hh:nn:ss") & " " & msg & vbLf & Left$(CStr(.Value), 3000)
    End With
End Sub

Private Sub Echelle()
    ' la table est en points sur une grille de 9 pt : on suit la grille reelle de la feuille
    mKx = Ui.Columns(2).Left / 9
    mKy = Ui.Rows(2).Top / 9
    If mKx <= 0 Then mKx = 1
    If mKy <= 0 Then mKy = 1
End Sub

Private Function Couleur(ByVal hexa As String) As Long
    hexa = Replace(hexa, "#", "")
    Couleur = RGB(CLng("&H" & Mid$(hexa, 1, 2)), CLng("&H" & Mid$(hexa, 3, 2)), CLng("&H" & Mid$(hexa, 5, 2)))
End Function

Private Function Nb(ByVal v As Variant) As Double
    If IsEmpty(v) Or IsError(v) Then Exit Function
    If IsNumeric(v) Then Nb = CDbl(v)
End Function

' === demarrage ===
Public Sub Demarrer()
    On Error GoTo Erreur
    If Application.Calculation <> xlCalculationAutomatic Then Application.Calculation = xlCalculationAutomatic
    mStyles = Empty
    Echelle
    If Ui.Shapes.Count < 20 Then
        Construire
    Else
        Rafraichir
    End If
    Ajuster
    Exit Sub
Erreur:
    Journal "erreur Demarrer " & Err.Number & " " & Err.Description
End Sub

' zoom pour que toute la page tienne dans la fenetre, comme le site
Public Sub Ajuster()
    On Error Resume Next
    If ActiveSheet.Name <> FEUILLE Then Exit Sub
    Dim z As Double
    With ActiveWindow
        z = 100 * Application.Min(.UsableWidth / (Nb(N("pageL").Value) * mKx), .UsableHeight / (Nb(N("pageH").Value) * mKy))
        If z > 140 Then z = 140
        If z < 50 Then z = 50
        .Zoom = Int(z)
        .ScrollRow = 1
        .ScrollColumn = 1
    End With
End Sub

' === construction des formes ===
Public Sub Construire()
    Dim t As Variant, i As Long
    Application.ScreenUpdating = False
    Application.EnableEvents = False
    mOccupe = True
    Echelle
    ChargerStyles
    Do While Ui.Shapes.Count > 0
        Ui.Shapes(1).Delete
    Loop
    t = N("ui").Value
    For i = 1 To UBound(t, 1)
        Creer t, i
    Next
    N("ui").Columns(A_TXT).Resize(, 5).ClearContents
    mOccupe = False
    Application.EnableEvents = True
    Application.ScreenUpdating = True
    Rafraichir
End Sub

Private Sub Creer(t As Variant, ByVal i As Long)
    Dim s As Shape, typ As String, x As Double, y As Double, w As Double, h As Double, r As Double, m As Variant
    On Error GoTo Erreur
    typ = CStr(t(i, C_TYPE))
    x = Nb(t(i, C_X)) * mKx: y = Nb(t(i, C_Y)) * mKy
    w = Nb(t(i, C_W)) * mKx: h = Nb(t(i, C_H)) * mKy
    r = Nb(t(i, C_R))
    Select Case typ
    Case "rect": Set s = Ui.Shapes.AddShape(msoShapeRectangle, x, y, w, h)
    Case "rond": Set s = Ui.Shapes.AddShape(msoShapeRoundedRectangle, x, y, w, h)
    Case "ovale": Set s = Ui.Shapes.AddShape(msoShapeOval, x, y, w, h)
    Case "haut", "bas": Set s = Ui.Shapes.AddShape(msoShapeRound2SameRectangle, x, y, w, h)
    Case "texte": Set s = Ui.Shapes.AddTextbox(msoTextOrientationHorizontal, x, y, w, h)
    Case "ligne", "tirets": Set s = Ui.Shapes.AddLine(x, y, x + w, y + h)
    End Select
    s.Name = CStr(t(i, C_NOM))
    s.Placement = xlFreeFloating
    On Error Resume Next
    s.Shadow.Visible = msoFalse
    Select Case typ
    Case "rond"
        s.Adjustments.Item(1) = Application.Min(0.5, r / Application.Min(w, h))
    Case "haut"
        s.Adjustments.Item(1) = Application.Min(0.5, r / Application.Min(w, h))
        s.Adjustments.Item(2) = 0
    Case "bas"
        s.Adjustments.Item(1) = 0
        s.Adjustments.Item(2) = Application.Min(0.5, r / Application.Min(w, h))
    Case "tirets"
        s.Line.DashStyle = msoLineDash
    End Select
    If typ <> "ligne" And typ <> "tirets" Then
        With s.TextFrame2
            If CStr(t(i, C_MAR)) = "" Then m = Split("6,2,6,2", ",") Else m = Split(CStr(t(i, C_MAR)) & ",0,0,0", ",")
            .MarginLeft = Nb(m(0)): .MarginTop = Nb(m(1)): .MarginRight = Nb(m(2)): .MarginBottom = Nb(m(3))
            .WordWrap = IIf(Nb(t(i, C_RET)) = 1, msoTrue, msoFalse)
            Select Case CStr(t(i, C_VA))
            Case "H": .VerticalAnchor = msoAnchorTop
            Case "B": .VerticalAnchor = msoAnchorBottom
            Case Else: .VerticalAnchor = msoAnchorMiddle
            End Select
            .TextRange.Text = Replace(CStr(t(i, C_TXT)), vbLf, vbCr)
            With .TextRange.Font
                .Name = CStr(t(i, C_POL))
                .Size = IIf(Nb(t(i, C_TAI)) > 0, Nb(t(i, C_TAI)), 11)
                .Bold = IIf(Nb(t(i, C_GRAS)) = 1, msoTrue, msoFalse)
                .Spacing = Nb(t(i, C_ESP))
                .Fill.ForeColor.RGB = RGB(74, 66, 56)
            End With
            Select Case CStr(t(i, C_AL))
            Case "C": .TextRange.ParagraphFormat.Alignment = msoAlignCenter
            Case "D": .TextRange.ParagraphFormat.Alignment = msoAlignRight
            Case Else: .TextRange.ParagraphFormat.Alignment = msoAlignLeft
            End Select
            .AutoSize = IIf(Nb(t(i, C_AUTO)) = 1, msoAutoSizeShapeToFitText, msoAutoSizeNone)
        End With
        Riche s, CStr(t(i, C_RICHE))
        If typ = "texte" Then
            s.Fill.Visible = msoFalse
            s.Line.Visible = msoFalse
        End If
    End If
    AppliquerStyle s, CStr(t(i, C_STY))
    If CStr(t(i, C_ACT)) <> "" Then s.OnAction = "Clic" Else s.OnAction = "Rien"
    Exit Sub
Erreur:
    Journal "erreur Creer " & CStr(t(i, C_NOM)) & " " & Err.Number & " " & Err.Description
End Sub

' tailles et graisses par paragraphe : "15:1|7.5:1"
Private Sub Riche(s As Shape, ByVal spec As String)
    If spec = "" Then Exit Sub
    On Error Resume Next
    Dim p As Variant, k As Long, a As Variant
    p = Split(spec, "|")
    For k = 0 To UBound(p)
        a = Split(p(k), ":")
        With s.TextFrame2.TextRange.Paragraphs(k + 1).Font
            .Size = Val(a(0))
            If UBound(a) >= 1 Then .Bold = IIf(a(1) = "1", msoTrue, msoFalse)
        End With
    Next
End Sub

Private Sub ChargerStyles()
    mStyles = N("styles").Value
End Sub

Private Function LigneStyle(ByVal nom As String) As Long
    Dim k As Long
    If IsEmpty(mStyles) Then ChargerStyles
    For k = 1 To UBound(mStyles, 1)
        If CStr(mStyles(k, 1)) = nom Then LigneStyle = k: Exit Function
    Next
End Function

Private Sub AppliquerStyle(s As Shape, ByVal nom As String)
    Dim k As Long, estLigne As Boolean
    If nom = "" Then Exit Sub
    k = LigneStyle(nom)
    If k = 0 Then Journal "style inconnu " & nom: Exit Sub
    On Error Resume Next
    estLigne = (s.Type = msoLine)
    If Not estLigne Then estLigne = s.Connector
    If Not estLigne Then
        If CStr(mStyles(k, 2)) = "" Then
            s.Fill.Visible = msoFalse
        Else
            s.Fill.Visible = msoTrue
            s.Fill.Solid
            s.Fill.ForeColor.RGB = Couleur(CStr(mStyles(k, 2)))
            s.Fill.Transparency = Nb(mStyles(k, 3))
        End If
    End If
    If CStr(mStyles(k, 4)) = "" Then
        s.Line.Visible = msoFalse
    Else
        s.Line.Visible = msoTrue
        s.Line.ForeColor.RGB = Couleur(CStr(mStyles(k, 4)))
        s.Line.Weight = Nb(mStyles(k, 5))
        s.Line.Transparency = Nb(mStyles(k, 6))
    End If
    If CStr(mStyles(k, 7)) <> "" And Not estLigne Then
        With s.TextFrame2.TextRange.Font.Fill
            .ForeColor.RGB = Couleur(CStr(mStyles(k, 7)))
            .Transparency = Nb(mStyles(k, 8))
        End With
    End If
    Ombre s, CStr(mStyles(k, 9))
    If CStr(mStyles(k, 10)) <> "" Then
        s.Glow.Color.RGB = Couleur(CStr(mStyles(k, 10)))
        s.Glow.Radius = Nb(mStyles(k, 11))
    Else
        s.Glow.Radius = 0
    End If
End Sub

Private Sub Ombre(s As Shape, ByVal preset As String)
    On Error Resume Next
    With s.Shadow
        Select Case preset
        Case "clay"
            .Visible = msoTrue: .Style = msoShadowStyleOuterShadow
            .OffsetX = 0: .OffsetY = 8: .Blur = 18: .Size = 100
            .ForeColor.RGB = RGB(120, 90, 60): .Transparency = 0.8
        Case "clay_sm"
            .Visible = msoTrue: .Style = msoShadowStyleOuterShadow
            .OffsetX = 0: .OffsetY = 3: .Blur = 7: .Size = 100
            .ForeColor.RGB = RGB(120, 90, 60): .Transparency = 0.78
        Case "inset"
            .Visible = msoTrue: .Style = msoShadowStyleInnerShadow
            .OffsetX = 2: .OffsetY = 2: .Blur = 6
            .ForeColor.RGB = RGB(120, 90, 60): .Transparency = 0.84
        Case ""
            .Visible = msoFalse
        Case Else
            ' ombre libre : "dx,dy,flou,#couleur,transparence,out|in" (sert aussi de halo aux diodes)
            Dim p As Variant
            p = Split(preset, ",")
            .Visible = msoTrue
            .Style = IIf(p(5) = "in", msoShadowStyleInnerShadow, msoShadowStyleOuterShadow)
            .OffsetX = Val(p(0)): .OffsetY = Val(p(1)): .Blur = Val(p(2)): .Size = 100
            .ForeColor.RGB = Couleur(CStr(p(3))): .Transparency = Val(p(4))
        End Select
    End With
End Sub

' === mise a jour : seules les liaisons qui ont change touchent les formes ===
Public Sub Rafraichir()
    Dim t As Variant, a As Variant, i As Long, nb_ As Long, s As Shape
    Dim v As String, vu As Boolean, ev As Boolean
    On Error GoTo Erreur
    If mKx = 0 Then Echelle
    If IsEmpty(mStyles) Then ChargerStyles
    t = N("ui").Value
    nb_ = UBound(t, 1)
    a = N("ui").Columns(A_TXT).Resize(, 5).Value
    ev = Application.EnableEvents
    Application.EnableEvents = False
    Application.ScreenUpdating = False
    For i = 1 To nb_
        Set s = Nothing
        ' visibilite
        If Not IsEmpty(t(i, B_VIS)) And Not IsError(t(i, B_VIS)) Then
            vu = CBool(t(i, B_VIS))
            If mEdition <> "" Then
                If CStr(t(i, C_ACT)) = "champ:" & mEdition Then vu = False
            End If
            v = "#" & IIf(vu, "1", "0")
            If v <> CStr(a(i, 3)) Then
                Set s = Ui.Shapes(CStr(t(i, C_NOM)))
                s.Visible = IIf(vu, msoTrue, msoFalse)
                a(i, 3) = v
            End If
        End If
        ' position et hauteur
        If Not IsEmpty(t(i, B_Y)) And Not IsError(t(i, B_Y)) Then
            v = "#" & CStr(t(i, B_Y))
            If v <> CStr(a(i, 4)) Then
                If s Is Nothing Then Set s = Ui.Shapes(CStr(t(i, C_NOM)))
                s.Top = Nb(t(i, B_Y)) * mKy
                a(i, 4) = v
            End If
        End If
        If Not IsEmpty(t(i, B_H)) And Not IsError(t(i, B_H)) Then
            v = "#" & CStr(t(i, B_H))
            If v <> CStr(a(i, 5)) Then
                If s Is Nothing Then Set s = Ui.Shapes(CStr(t(i, C_NOM)))
                s.Height = Application.Max(0, Nb(t(i, B_H))) * mKy
                a(i, 5) = v
            End If
        End If
        ' texte
        If Not IsEmpty(t(i, B_TXT)) And Not IsError(t(i, B_TXT)) Then
            v = "#" & CStr(t(i, B_TXT))
            If v <> CStr(a(i, 1)) Then
                If s Is Nothing Then Set s = Ui.Shapes(CStr(t(i, C_NOM)))
                s.TextFrame2.TextRange.Text = Replace(CStr(t(i, B_TXT)), vbLf, vbCr)
                Riche s, CStr(t(i, C_RICHE))
                If Nb(t(i, C_ANC)) > 0 Then s.Left = Nb(t(i, C_ANC)) * mKx - s.Width
                a(i, 1) = v
            End If
        End If
        ' style
        If Not IsEmpty(t(i, B_STY)) And Not IsError(t(i, B_STY)) Then
            v = "#" & CStr(t(i, B_STY))
            If v <> CStr(a(i, 2)) Then
                If s Is Nothing Then Set s = Ui.Shapes(CStr(t(i, C_NOM)))
                AppliquerStyle s, CStr(t(i, B_STY))
                a(i, 2) = v
            End If
        End If
    Next
    N("ui").Columns(A_TXT).Resize(, 5).Value = a
    Application.ScreenUpdating = True
    Application.EnableEvents = ev
    Exit Sub
Erreur:
    Journal "erreur Rafraichir ligne " & i & " " & Err.Number & " " & Err.Description
    Application.ScreenUpdating = True
    Application.EnableEvents = True
End Sub

' === clics ===
Public Sub Rien()
End Sub

Public Sub Clic()
    Agir CStr(Application.Caller)
End Sub

Public Sub Agir(ByVal nom As String)
    Dim noms As Variant, acts As Variant, i As Long, act As String, verbe As String, arg As String
    On Error GoTo Erreur
    noms = N("ui").Columns(C_NOM).Value
    acts = N("ui").Columns(C_ACT).Value
    For i = 1 To UBound(noms, 1)
        If CStr(noms(i, 1)) = nom Then act = CStr(acts(i, 1)): Exit For
    Next
    If act = "" Then Exit Sub
    i = InStr(act, ":")
    If i > 0 Then
        verbe = Left$(act, i - 1)
        arg = Mid$(act, i + 1)
    Else
        verbe = act
    End If
    If mEdition <> "" And verbe <> "champ" Then FinEdition False
    Application.EnableEvents = False
    Select Case verbe
    Case "cocher": Basculer arg, Not Valide(arg)
    Case "plier": BasculerFerme arg
    Case "etape": N("etapeChoisie").Value = CLng(arg)
    Case "vue": N("vue").Value = IIf(CStr(N("vue").Value) = "Info", "Situation", "Info")
    Case "auj": N("f_dep").Cells(1, 1).Value = Date
    End Select
    Application.EnableEvents = True
    Select Case verbe
    Case "champ"
        Editer arg
    Case "copier"
        Rafraichir
        CopierCode arg, Left$(nom, InStrRev(nom, "_") - 1)
    Case Else
        Rafraichir
    End Select
    Exit Sub
Erreur:
    Journal "erreur Agir " & nom & " " & Err.Number & " " & Err.Description
    Application.EnableEvents = True
End Sub

' point d'entree pour les tests (AppleScript : run VB macro "Racco_D2.xlsm!TestClic" arg1 "nom de la forme")
Public Sub TestClic(ByVal nom As String)
    Agir nom
End Sub

' === cases a cocher (port de basculer() du site) ===
Private Function Valide(ByVal id As String) As Boolean
    Dim nd As Variant, i As Long
    nd = N("noeuds").Value
    i = Indice(nd, id)
    If i > 0 Then Valide = CBool(nd(i, N_VALIDE))
End Function

Private Sub Basculer(ByVal id As String, ByVal coche As Boolean)
    Dim nd As Variant, nb_ As Long, i As Long, k As Long, x As Long, p As Long, j As Long
    nd = N("noeuds").Value
    nb_ = UBound(nd, 1)
    i = Indice(nd, id)
    If i = 0 Then Exit Sub
    If CBool(nd(i, N_VERROU)) Then Exit Sub
    Dim etat() As Boolean: ReDim etat(1 To nb_)
    For k = 1 To nb_: etat(k) = CBool(nd(k, N_COCHE)): Next
    If coche Then
        etat(i) = True
        Cascade nd, i, etat
        ' branches au choix : cocher dans une branche efface les autres
        x = i
        Do While x > 0
            p = Indice(nd, CStr(nd(x, N_PARENT)))
            If p > 0 Then
                If nd(p, N_MODE) = "un" Then
                    For j = 1 To nb_
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
    Dim col() As Variant: ReDim col(1 To nb_, 1 To 1)
    For k = 1 To nb_: col(k, 1) = etat(k): Next
    N("noeuds").Columns(N_COCHE).Value = col
End Sub

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
    If CBool(nd(i, N_VERROU)) Then Exit Sub
    N("noeuds").Cells(i, N_FERME).Value = Not CBool(nd(i, N_FERME))
End Sub

' === saisie : la forme du champ s'efface, la cellule dessous prend la saisie ===
Private Function Cles() As Variant
    Cles = Array("ant", "racco", "el", "pc", "adr", "cab", "dlpi", "imb1", "imb2", "imb3", "imb4", "dep")
End Function

Private Sub Editer(ByVal cle As String)
    If mEdition <> "" And mEdition <> cle Then FinEdition False
    mEdition = cle
    Application.EnableEvents = False
    N("f_" & cle).Interior.Color = Couleur(CStr(N("coulSaisie").Value))
    Rafraichir
    Application.EnableEvents = False
    N("f_" & cle).Cells(1, 1).Select
    Application.EnableEvents = True
End Sub

Private Sub FinEdition(ByVal rafraichirApres As Boolean)
    If mEdition = "" Then Exit Sub
    Dim ev As Boolean: ev = Application.EnableEvents
    Application.EnableEvents = False
    N("f_" & mEdition).Interior.Color = Couleur(CStr(N("coulCarte").Value))
    mEdition = ""
    Application.EnableEvents = ev
    If rafraichirApres Then Rafraichir
End Sub

Public Sub SurSelection(ByVal Target As Range)
    If mOccupe Then Exit Sub
    On Error GoTo Erreur
    Dim c As Range, k As Variant
    Set c = Target.Cells(1, 1)
    For Each k In Cles()
        If Not Intersect(c, N("f_" & k)) Is Nothing Then
            If mEdition <> CStr(k) Then Editer CStr(k)
            Exit Sub
        End If
    Next
    If mEdition <> "" Then FinEdition True
    Exit Sub
Erreur:
    Journal "erreur SurSelection " & Err.Number & " " & Err.Description
    Application.EnableEvents = True
End Sub

Public Sub SurChangement(ByVal Target As Range)
    If mOccupe Then Exit Sub
    On Error GoTo Erreur
    Dim k As Variant
    For Each k In Cles()
        If Not Intersect(Target, N("f_" & k)) Is Nothing Then
            Rafraichir
            Exit Sub
        End If
    Next
    ' saisie dans une cellule cachee sous les formes : on l'annule
    Application.EnableEvents = False
    Application.Undo
    Application.EnableEvents = True
    Exit Sub
Erreur:
    Application.EnableEvents = True
End Sub

' === copie dans le presse-papiers ===
Private Sub CopierCode(ByVal cle As String, ByVal base As String)
    Dim v As String, noms As Variant, i As Long
    Select Case cle
    Case "comlab": v = CStr(N("comlab").Value)
    Case "ape", "dzi", "rty", "lve": v = CStr(N("code" & UCase$(cle)).Value)
    Case "d30", "i30": v = CStr(N("date30").Value)
    Case "d65", "i65": v = CStr(N("date65").Value)
    End Select
    If v = "" Then Exit Sub
    Copier v
    ' retour visuel : l'icone passe en coche verte ; ses liaisons sont marquees a refaire pour FinCopie
    On Error Resume Next
    AppliquerStyle Ui.Shapes(base & "_bg"), "ico_ok"
    Ui.Shapes(base & "_b").Visible = msoFalse
    Ui.Shapes(base & "_f").Visible = msoFalse
    Ui.Shapes(base & "_ok").Visible = msoTrue
    noms = N("ui").Columns(C_NOM).Value
    For i = 1 To UBound(noms, 1)
        If Left$(CStr(noms(i, 1)), Len(base) + 1) = base & "_" Then
            N("ui").Cells(i, A_TXT + 1).Value = ""
            N("ui").Cells(i, A_TXT + 2).Value = ""
        End If
    Next
    Application.StatusBar = "Copi" & ChrW(233) & " : " & v
    Application.OnTime Now + TimeSerial(0, 0, 2), "FinCopie"
End Sub

Public Sub FinCopie()
    Rafraichir
    Application.StatusBar = False
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
        Dim sh As Shape
        Set sh = Ui.Shapes.AddTextbox(1, 0, 0, 100, 20)
        sh.TextFrame2.TextRange.Text = texte
        sh.TextFrame2.TextRange.Copy
        sh.Delete
    End If
End Sub
