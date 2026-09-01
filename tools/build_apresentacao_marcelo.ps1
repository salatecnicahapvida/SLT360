param(
    [string]$SourceWorkbook = "",
    [string]$WorkingWorkbook = "inputs\Apresentacao_Marcelo_atualizada.xlsx",
    [string]$TemplatePath = "inputs\Hapvida_modelo_apresentacao_padrao.pptx",
    [string]$OutputPath = "outputs\apresentacao_marcelo_por_ano_tipologia_Hapvida.pptx",
    [string]$ImprovedWorkbookPath = "outputs\Apresentacao_Marcelo_melhorada.xlsx",
    [string]$DataPath = "outputs\apresentacao_marcelo_por_ano_tipologia_dados.json"
)

$ErrorActionPreference = "Stop"

$Brand = [ordered]@{
    Navy   = "253F8E"
    Blue   = "2F65B7"
    Orange = "F37021"
    Yellow = "FDB913"
    Ink    = "15253F"
    Muted  = "50617F"
    Line   = "D6E0EC"
    Soft   = "F5F8FC"
    White  = "FFFFFF"
}

function Resolve-FullPath {
    param([string]$Path)
    if ([System.IO.Path]::IsPathRooted($Path)) { return [System.IO.Path]::GetFullPath($Path) }
    return [System.IO.Path]::GetFullPath((Join-Path (Get-Location) $Path))
}

function Copy-SharedFile {
    param([string]$Source, [string]$Destination)
    $destFull = Resolve-FullPath $Destination
    New-Item -ItemType Directory -Force -Path (Split-Path -Parent $destFull) | Out-Null
    $in = [System.IO.File]::Open($Source, [System.IO.FileMode]::Open, [System.IO.FileAccess]::Read, [System.IO.FileShare]::ReadWrite)
    try {
        $out = [System.IO.File]::Open($destFull, [System.IO.FileMode]::Create, [System.IO.FileAccess]::Write, [System.IO.FileShare]::None)
        try { $in.CopyTo($out) } finally { $out.Dispose() }
    } finally { $in.Dispose() }
}

function Read-ZipText {
    param([System.IO.Compression.ZipArchive]$Zip, [string]$Path)
    $entry = $Zip.GetEntry($Path)
    if ($null -eq $entry) { return $null }
    $reader = New-Object System.IO.StreamReader($entry.Open(), [System.Text.Encoding]::UTF8)
    try { return $reader.ReadToEnd() } finally { $reader.Dispose() }
}

function Write-Utf8NoBom {
    param([string]$Path, [string]$Value)
    $full = Resolve-FullPath $Path
    New-Item -ItemType Directory -Force -Path (Split-Path -Parent $full) | Out-Null
    [System.IO.File]::WriteAllText($full, $Value, (New-Object System.Text.UTF8Encoding($false)))
}

function Get-SharedStrings {
    param([System.IO.Compression.ZipArchive]$Zip)
    $xmlText = Read-ZipText $Zip "xl/sharedStrings.xml"
    if ([string]::IsNullOrWhiteSpace($xmlText)) { return @() }
    [xml]$xml = $xmlText
    $ns = New-Object System.Xml.XmlNamespaceManager($xml.NameTable)
    $ns.AddNamespace("x", "http://schemas.openxmlformats.org/spreadsheetml/2006/main")
    $shared = New-Object System.Collections.Generic.List[string]
    foreach ($si in $xml.SelectNodes("//x:si", $ns)) {
        $parts = New-Object System.Collections.Generic.List[string]
        foreach ($t in $si.SelectNodes(".//x:t", $ns)) { [void]$parts.Add($t.InnerText) }
        [void]$shared.Add((($parts -join "") -replace "\s+", " ").Trim())
    }
    return $shared.ToArray()
}

function Get-CellColumn {
    param([string]$Reference)
    return ([regex]::Match($Reference, "^[A-Z]+")).Value
}

function Get-CellValue {
    param([object]$Cell, [string[]]$SharedStrings, [System.Xml.XmlNamespaceManager]$Ns)
    $type = [string]$Cell.t
    $valueNode = $Cell.SelectSingleNode("x:v", $Ns)
    if ($type -eq "s" -and $valueNode) {
        $idx = [int]$valueNode.InnerText
        if ($idx -ge 0 -and $idx -lt $SharedStrings.Count) { return [string]$SharedStrings[$idx] }
        return ""
    }
    if ($type -eq "inlineStr") {
        $t = $Cell.SelectSingleNode(".//x:t", $Ns)
        if ($t) { return [string]$t.InnerText }
        return ""
    }
    if ($valueNode) { return [string]$valueNode.InnerText }
    return ""
}

function Normalize-Text {
    param([string]$Text)
    if ($null -eq $Text) { return "" }
    $d = $Text.Normalize([System.Text.NormalizationForm]::FormD)
    return (($d -replace "\p{Mn}", "") -replace "[^A-Za-z0-9]+", "").ToLowerInvariant()
}

function ConvertTo-Number {
    param([object]$Value)
    if ($null -eq $Value) { return 0.0 }
    $text = ([string]$Value).Trim()
    if ($text -eq "" -or $text -eq "-") { return 0.0 }
    $number = 0.0
    if ([double]::TryParse($text, [Globalization.NumberStyles]::Float, [Globalization.CultureInfo]::InvariantCulture, [ref]$number)) { return $number }
    if ([double]::TryParse($text, [Globalization.NumberStyles]::Float, [Globalization.CultureInfo]::GetCultureInfo("pt-BR"), [ref]$number)) { return $number }
    return 0.0
}

function Get-Field {
    param([hashtable]$Data, [string[]]$Names)
    foreach ($name in $Names) {
        $norm = Normalize-Text $name
        if ($Data.ContainsKey($norm)) { return $Data[$norm] }
    }
    return ""
}

function New-Summary {
    param([object[]]$Items)
    $arr = @($Items)
    $area = ($arr | Measure-Object -Property AreaM2 -Sum).Sum
    $value = ($arr | Measure-Object -Property ValorNegociado -Sum).Sum
    $weightedCost = 0.0
    foreach ($item in $arr) {
        if ($item.PrecoM2 -ne $null -and $item.AreaM2 -gt 0) {
            $weightedCost += ([double]$item.PrecoM2 * [double]$item.AreaM2)
        }
    }
    if ($null -eq $area) { $area = 0.0 }
    if ($null -eq $value) { $value = 0.0 }
    $price = $null
    if ($area -gt 0 -and $weightedCost -gt 0) {
        $price = [double]$weightedCost / [double]$area
    } elseif ($area -gt 0) {
        $price = [double]$value / [double]$area
    }
    return [pscustomobject]@{
        Obras = $arr.Count
        AreaM2 = [double]$area
        ValorNegociado = [double]$value
        PrecoM2 = $price
    }
}

function Get-CategoryName {
    param([string]$Kind)
    if ($Kind -eq "PA") { return "Pronto Atendimento" }
    if ($Kind -eq "ClinicasDiagTeaLab") { return "Cl$([char]0x00ED)nicas, Diagn$([char]0x00F3)sticos, TEA e Laborat$([char]0x00F3)rios" }
    return "Hospitais"
}

function Get-Category {
    param([string]$SheetName)
    if ($SheetName -eq "Hospitais") { return "Hospitais" }
    if ($SheetName -eq "Pronto Atendimento") { return (Get-CategoryName "PA") }
    return (Get-CategoryName "ClinicasDiagTeaLab")
}

function ConvertFrom-ExcelSerialDate {
    param([object]$Value)
    $num = ConvertTo-Number $Value
    if ($num -le 0) { return $null }
    try { return ([datetime]"1899-12-30").AddDays([math]::Floor($num)) } catch { return $null }
}

function Get-FinalizationYear {
    param([string]$FimObra, [object]$TerminoReal)
    $text = ([string]$FimObra).Trim()
    if ($text -ne "" -and $text -ne "-") {
        $m = [regex]::Match($text, "(\d{2,4})\s*$")
        if ($m.Success) {
            $year = [int]$m.Groups[1].Value
            if ($year -lt 100) { $year += 2000 }
            if ($year -ge 2000 -and $year -le 2100) { return [string]$year }
        }
    }
    $date = ConvertFrom-ExcelSerialDate $TerminoReal
    if ($date -ne $null) { return [string]$date.Year }
    return "Sem finalizacao"
}

function Read-MarceloWorkbook {
    param([string]$Workbook)
    Add-Type -AssemblyName System.IO.Compression.FileSystem
    $zip = [System.IO.Compression.ZipFile]::OpenRead((Resolve-FullPath $Workbook))
    try {
        $shared = Get-SharedStrings $zip
        [xml]$workbookXml = Read-ZipText $zip "xl/workbook.xml"
        [xml]$relsXml = Read-ZipText $zip "xl/_rels/workbook.xml.rels"
        $relMap = @{}
        foreach ($rel in $relsXml.Relationships.Relationship) { $relMap[$rel.Id] = $rel.Target }

        $records = New-Object System.Collections.Generic.List[object]
        foreach ($sheet in $workbookXml.workbook.sheets.sheet) {
            $rid = $sheet.GetAttribute("id", "http://schemas.openxmlformats.org/officeDocument/2006/relationships")
            $target = $relMap[$rid]
            $sheetPath = "xl/" + ($target -replace "^/", "" -replace "^xl/", "")
            [xml]$sheetXml = Read-ZipText $zip $sheetPath
            $ns = New-Object System.Xml.XmlNamespaceManager($sheetXml.NameTable)
            $ns.AddNamespace("x", "http://schemas.openxmlformats.org/spreadsheetml/2006/main")
            $headerRow = $sheetXml.SelectSingleNode("//x:sheetData/x:row[@r='3']", $ns)
            if ($null -eq $headerRow) { continue }

            $headers = @{}
            foreach ($cell in $headerRow.SelectNodes("x:c", $ns)) {
                $col = Get-CellColumn ([string]$cell.r)
                $header = Get-CellValue $cell $shared $ns
                $headers[$col] = $header
            }

            foreach ($row in $sheetXml.SelectNodes("//x:sheetData/x:row", $ns)) {
                if ([int]$row.r -le 3) { continue }
                $data = @{}
                foreach ($cell in $row.SelectNodes("x:c", $ns)) {
                    $col = Get-CellColumn ([string]$cell.r)
                    if (-not $headers.ContainsKey($col)) { continue }
                    $headerNorm = Normalize-Text $headers[$col]
                    if ($headerNorm -ne "") { $data[$headerNorm] = Get-CellValue $cell $shared $ns }
                }
                $name = [string](Get-Field $data @("Nome Obra"))
                if ([string]::IsNullOrWhiteSpace($name)) { continue }
                $status = [string](Get-Field $data @("Status"))
                $conclusion = [string](Get-Field $data @("Conclusao", "Conclusão"))
                if ([string]::IsNullOrWhiteSpace($status) -or $status.Trim() -eq "-") { $status = $conclusion }
                if ([string]::IsNullOrWhiteSpace($status)) { $status = "-" }
                $valor = ConvertTo-Number (Get-Field $data @("Valor Negociado"))
                $area = ConvertTo-Number (Get-Field $data @("Area m2", "Area (m2)", "Area m", "Área (m²)"))
                $precoPlanilha = ConvertTo-Number (Get-Field $data @("Preco m2", "Preco m", "Preço m²"))
                $preco = $null
                if ($precoPlanilha -gt 0) {
                    $preco = [double]$precoPlanilha
                } elseif ($area -gt 0) {
                    $preco = [double]$valor / [double]$area
                }
                $fimObra = [string](Get-Field $data @("Fim Obra"))
                $terminoReal = Get-Field $data @("Termino Real", "Término Real")
                $anoFinalizacao = Get-FinalizationYear -FimObra $fimObra -TerminoReal $terminoReal
                [void]$records.Add([pscustomobject]@{
                    Categoria = Get-Category ([string]$sheet.name)
                    Sheet = [string]$sheet.name
                    Nome = $name
                    Empresa = [string](Get-Field $data @("Empresa"))
                    Praca = [string](Get-Field $data @("Praca", "Praça"))
                    Estado = [string](Get-Field $data @("Estado"))
                    Regiao = [string](Get-Field $data @("Regiao", "Região"))
                    Status = $status
                    Classificacao = [string](Get-Field $data @("Classificacao de Obra", "Classificação de Obra"))
                    Nivel = [string](Get-Field $data @("Nivel de Obra", "Nível de Obra"))
                    FimObra = $fimObra
                    AnoFinalizacao = $anoFinalizacao
                    ValorNegociado = [double]$valor
                    AreaM2 = [double]$area
                    PrecoM2 = $preco
                })
            }
        }
        return $records.ToArray()
    } finally { $zip.Dispose() }
}

function Escape-Xml {
    param([string]$Text)
    if ($null -eq $Text) { return "" }
    return [System.Security.SecurityElement]::Escape($Text)
}

function Format-NumberPt {
    param([double]$Value, [int]$Digits = 0)
    return $Value.ToString("N$Digits", [Globalization.CultureInfo]::GetCultureInfo("pt-BR"))
}

function Format-Brl {
    param([double]$Value, [int]$Digits = 0)
    return ("R$ " + $Value.ToString("N$Digits", [Globalization.CultureInfo]::GetCultureInfo("pt-BR")))
}

function Format-ShortBrl {
    param([double]$Value)
    $abs = [math]::Abs($Value)
    if ($abs -ge 1000000) { return ("R$ " + (($Value / 1000000).ToString("N1", [Globalization.CultureInfo]::GetCultureInfo("pt-BR"))) + " mi") }
    if ($abs -ge 1000) { return ("R$ " + (($Value / 1000).ToString("N1", [Globalization.CultureInfo]::GetCultureInfo("pt-BR"))) + " mil") }
    return Format-Brl $Value 0
}

function Format-ShortArea {
    param([double]$Value)
    if ([math]::Abs($Value) -ge 1000) { return (($Value / 1000).ToString("N1", [Globalization.CultureInfo]::GetCultureInfo("pt-BR")) + " mil m2") }
    return ((Format-NumberPt $Value 0) + " m2")
}

function Short-Text {
    param([string]$Text, [int]$Max = 58)
    $plain = (($Text -replace "\s+", " ").Trim())
    if ($plain.Length -le $Max) { return $plain }
    return $plain.Substring(0, [math]::Max(0, $Max - 1)).TrimEnd() + "..."
}

function New-PptShapeText {
    param(
        [int]$Id,
        [double]$X,
        [double]$Y,
        [double]$W,
        [double]$H,
        [string]$Text,
        [double]$FontSize = 18,
        [string]$Color = "15253F",
        [bool]$Bold = $false,
        [string]$Align = "l",
        [string]$Fill = "",
        [string]$Line = "",
        [int]$Radius = 0
    )
    $emu = 914400
    $xEmu = [int64]($X * $emu)
    $yEmu = [int64]($Y * $emu)
    $wEmu = [int64]($W * $emu)
    $hEmu = [int64]($H * $emu)
    $sz = [int]($FontSize * 100)
    $boldAttr = if ($Bold) { ' b="1"' } else { "" }
    $fillXml = if ($Fill -ne "") { "<a:solidFill><a:srgbClr val='$Fill'/></a:solidFill>" } else { "<a:noFill/>" }
    $lineXml = if ($Line -ne "") { "<a:ln w='6350'><a:solidFill><a:srgbClr val='$Line'/></a:solidFill></a:ln>" } else { "<a:ln><a:noFill/></a:ln>" }
    $geom = if ($Radius -gt 0) { "roundRect" } else { "rect" }
    $paragraphs = (($Text -replace "`r", "").Split("`n")) | ForEach-Object {
        "<a:p><a:pPr algn='$Align'/><a:r><a:rPr lang='pt-BR' sz='$sz'$boldAttr><a:solidFill><a:srgbClr val='$Color'/></a:solidFill></a:rPr><a:t>$(Escape-Xml $_)</a:t></a:r></a:p>"
    }
    return @"
<p:sp>
  <p:nvSpPr><p:cNvPr id="$Id" name="Text $Id"/><p:cNvSpPr txBox="1"/><p:nvPr/></p:nvSpPr>
  <p:spPr>
    <a:xfrm><a:off x="$xEmu" y="$yEmu"/><a:ext cx="$wEmu" cy="$hEmu"/></a:xfrm>
    <a:prstGeom prst="$geom"><a:avLst/></a:prstGeom>
    $fillXml
    $lineXml
  </p:spPr>
  <p:txBody><a:bodyPr wrap="square" lIns="68580" tIns="34290" rIns="68580" bIns="34290"/><a:lstStyle/>$($paragraphs -join "")</p:txBody>
</p:sp>
"@
}

function New-PptRect {
    param([int]$Id, [double]$X, [double]$Y, [double]$W, [double]$H, [string]$Fill, [string]$Line = "", [int]$Alpha = 100000)
    $emu = 914400
    $xEmu = [int64]($X * $emu)
    $yEmu = [int64]($Y * $emu)
    $wEmu = [int64]($W * $emu)
    $hEmu = [int64]($H * $emu)
    $alphaXml = if ($Alpha -lt 100000) { "<a:alpha val='$Alpha'/>" } else { "" }
    $lineXml = if ($Line -ne "") { "<a:ln w='6350'><a:solidFill><a:srgbClr val='$Line'/></a:solidFill></a:ln>" } else { "<a:ln><a:noFill/></a:ln>" }
    return @"
<p:sp>
  <p:nvSpPr><p:cNvPr id="$Id" name="Rect $Id"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr>
  <p:spPr>
    <a:xfrm><a:off x="$xEmu" y="$yEmu"/><a:ext cx="$wEmu" cy="$hEmu"/></a:xfrm>
    <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
    <a:solidFill><a:srgbClr val="$Fill">$alphaXml</a:srgbClr></a:solidFill>
    $lineXml
  </p:spPr>
</p:sp>
"@
}

function New-PptPicture {
    param([int]$Id, [double]$X, [double]$Y, [double]$W, [double]$H, [string]$RelId, [string]$Name = "Picture")
    $emu = 914400
    $xEmu = [int64]($X * $emu)
    $yEmu = [int64]($Y * $emu)
    $wEmu = [int64]($W * $emu)
    $hEmu = [int64]($H * $emu)
    return @"
<p:pic>
  <p:nvPicPr><p:cNvPr id="$Id" name="$(Escape-Xml $Name)"/><p:cNvPicPr><a:picLocks noChangeAspect="1"/></p:cNvPicPr><p:nvPr/></p:nvPicPr>
  <p:blipFill><a:blip r:embed="$RelId"/><a:stretch><a:fillRect/></a:stretch></p:blipFill>
  <p:spPr><a:xfrm><a:off x="$xEmu" y="$yEmu"/><a:ext cx="$wEmu" cy="$hEmu"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></p:spPr>
</p:pic>
"@
}

function New-SlideXml {
    param([string[]]$Shapes)
    return @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:cSld>
    <p:spTree>
      <p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>
      <p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>
      $($Shapes -join "`n")
    </p:spTree>
  </p:cSld>
  <p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr>
</p:sld>
"@
}

function New-SlideRels {
    param([string[]]$Relationships)
    $body = @("<Relationship Id='rIdLayout' Type='http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout' Target='../slideLayouts/slideLayout7.xml'/>")
    $body += $Relationships
    return @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  $($body -join "`n  ")
</Relationships>
"@
}

function Add-HeaderFooter {
    param([System.Collections.Generic.List[string]]$Shapes, [string]$Title, [int]$SlideNumber)
    [void]$Shapes.Add((New-PptRect -Id 900 -X 0 -Y 0 -W 13.333 -H 0.52 -Fill $Brand.Navy))
    [void]$Shapes.Add((New-PptPicture -Id 901 -X 0.36 -Y 0.13 -W 1.35 -H 0.25 -RelId "rIdLogo" -Name "Hapvida"))
    [void]$Shapes.Add((New-PptShapeText -Id 902 -X 1.86 -Y 0.08 -W 7.6 -H 0.35 -Text $Title -FontSize 10 -Color $Brand.White -Bold $true))
    [void]$Shapes.Add((New-PptShapeText -Id 903 -X 11.96 -Y 7.08 -W 0.7 -H 0.25 -Text ([string]$SlideNumber) -FontSize 8 -Color $Brand.Muted -Align "r"))
}

function New-TableShapes {
    param(
        [object[]]$Rows,
        [double]$X,
        [double]$Y,
        [double[]]$Widths,
        [string[]]$Headers,
        [scriptblock[]]$ValueBlocks,
        [int]$StartId,
        [double]$RowH = 0.30,
        [int]$FontSize = 7
    )
    $shapes = New-Object System.Collections.Generic.List[string]
    $id = $StartId
    $xCursor = $X
    for ($c = 0; $c -lt $Headers.Count; $c++) {
        [void]$shapes.Add((New-PptShapeText -Id $id -X $xCursor -Y $Y -W $Widths[$c] -H $RowH -Text $Headers[$c] -FontSize $FontSize -Color $Brand.White -Bold $true -Fill $Brand.Navy))
        $id++
        $xCursor += $Widths[$c]
    }
    for ($r = 0; $r -lt @($Rows).Count; $r++) {
        $row = $Rows[$r]
        $xCursor = $X
        $fill = if ($r % 2 -eq 0) { "FFFFFF" } else { "F5F8FB" }
        for ($c = 0; $c -lt $Headers.Count; $c++) {
            $text = & $ValueBlocks[$c] $row
            $align = if ($c -eq 0) { "l" } else { "r" }
            [void]$shapes.Add((New-PptShapeText -Id $id -X $xCursor -Y ($Y + $RowH + ($r * $RowH)) -W $Widths[$c] -H $RowH -Text $text -FontSize $FontSize -Color $Brand.Ink -Align $align -Fill $fill -Line $Brand.Line))
            $id++
            $xCursor += $Widths[$c]
        }
    }
    return ,([string[]]$shapes.ToArray())
}

function New-YearGroupedWorksTableShapes {
    param(
        [object[]]$Rows,
        [double]$X,
        [double]$Y,
        [double[]]$Widths,
        [string[]]$Headers,
        [int]$StartId,
        [double]$RowH = 0.265,
        [int]$FontSize = 6
    )
    $shapes = New-Object System.Collections.Generic.List[string]
    $id = $StartId
    $totalW = 0.0
    foreach ($width in $Widths) { $totalW += $width }
    $xCursor = $X
    for ($c = 0; $c -lt $Headers.Count; $c++) {
        [void]$shapes.Add((New-PptShapeText -Id $id -X $xCursor -Y $Y -W $Widths[$c] -H $RowH -Text $Headers[$c] -FontSize $FontSize -Color $Brand.White -Bold $true -Fill $Brand.Navy))
        $id++
        $xCursor += $Widths[$c]
    }
    $workIndex = 0
    for ($r = 0; $r -lt @($Rows).Count; $r++) {
        $row = $Rows[$r]
        $yRow = $Y + $RowH + ($r * $RowH)
        $isYearHeader = ($row.PSObject.Properties.Match("IsYearHeader").Count -gt 0 -and $row.IsYearHeader)
        if ($isYearHeader) {
            $preco = if ($row.PrecoM2 -ne $null) { (Format-Brl $row.PrecoM2 0) + "/m2" } else { "-" }
            $continuation = if ($row.Continuacao) { " (contin.)" } else { "" }
            $text = ("{0}{1} | {2} obras | {3} | {4} | {5}" -f $row.AnoFinalizacao, $continuation, (Format-NumberPt $row.Obras 0), (Format-ShortArea $row.AreaM2), (Format-ShortBrl $row.ValorNegociado), $preco)
            [void]$shapes.Add((New-PptShapeText -Id $id -X $X -Y $yRow -W $totalW -H $RowH -Text $text -FontSize $FontSize -Color $Brand.White -Bold $true -Fill $Brand.Blue))
            $id++
            continue
        }
        $fill = if ($workIndex % 2 -eq 0) { "FFFFFF" } else { "F5F8FB" }
        $values = @(
            (Short-Text $row.Nome 62),
            $row.Estado,
            $row.FimObra,
            (Short-Text $row.Status 18),
            (Format-ShortBrl $row.ValorNegociado),
            (Format-ShortArea $row.AreaM2),
            $(if ($row.PrecoM2 -ne $null) { Format-Brl $row.PrecoM2 0 } else { "-" })
        )
        $xCursor = $X
        for ($c = 0; $c -lt $Headers.Count; $c++) {
            $align = if ($c -eq 0) { "l" } else { "r" }
            [void]$shapes.Add((New-PptShapeText -Id $id -X $xCursor -Y $yRow -W $Widths[$c] -H $RowH -Text ([string]$values[$c]) -FontSize $FontSize -Color $Brand.Ink -Align $align -Fill $fill -Line $Brand.Line))
            $id++
            $xCursor += $Widths[$c]
        }
        $workIndex++
    }
    return ,([string[]]$shapes.ToArray())
}

function New-YearGroupedWorksColumnsShapes {
    param(
        [object[]]$Columns,
        [double[]]$Xs,
        [double]$Y,
        [double[]]$Widths,
        [string[]]$Headers,
        [int]$StartId,
        [double]$RowH = 0.215,
        [double]$FontSize = 5.7
    )
    $shapes = New-Object System.Collections.Generic.List[string]
    $id = $StartId
    $totalW = 0.0
    foreach ($width in $Widths) { $totalW += $width }
    for ($col = 0; $col -lt $Columns.Count; $col++) {
        $rows = @($Columns[$col])
        if ($rows.Count -eq 0) { continue }
        $xBase = $Xs[$col]
        $xCursor = $xBase
        for ($c = 0; $c -lt $Headers.Count; $c++) {
            [void]$shapes.Add((New-PptShapeText -Id $id -X $xCursor -Y $Y -W $Widths[$c] -H $RowH -Text $Headers[$c] -FontSize $FontSize -Color $Brand.White -Bold $true -Fill $Brand.Navy))
            $id++
            $xCursor += $Widths[$c]
        }
        $workIndex = 0
        for ($r = 0; $r -lt $rows.Count; $r++) {
            $row = $rows[$r]
            $yRow = $Y + $RowH + ($r * $RowH)
            $isYearHeader = ($row.PSObject.Properties.Match("IsYearHeader").Count -gt 0 -and $row.IsYearHeader)
            if ($isYearHeader) {
                $preco = if ($row.PrecoM2 -ne $null) { (Format-Brl $row.PrecoM2 0) + "/m2" } else { "-" }
                $continuation = if ($row.Continuacao) { " cont." } else { "" }
                $text = ("{0}{1} | {2} obras | {3} | {4} | {5}" -f $row.AnoFinalizacao, $continuation, (Format-NumberPt $row.Obras 0), (Format-ShortArea $row.AreaM2), (Format-ShortBrl $row.ValorNegociado), $preco)
                [void]$shapes.Add((New-PptShapeText -Id $id -X $xBase -Y $yRow -W $totalW -H $RowH -Text $text -FontSize $FontSize -Color $Brand.White -Bold $true -Fill $Brand.Blue))
                $id++
                continue
            }
            $fill = if ($workIndex % 2 -eq 0) { "FFFFFF" } else { "F5F8FB" }
            $values = @(
                (Short-Text $row.Nome 34),
                $row.Estado,
                $row.FimObra,
                (Short-Text $row.Status 12),
                (Format-ShortBrl $row.ValorNegociado),
                (Format-ShortArea $row.AreaM2),
                $(if ($row.PrecoM2 -ne $null) { Format-Brl $row.PrecoM2 0 } else { "-" })
            )
            $xCursor = $xBase
            for ($c = 0; $c -lt $Headers.Count; $c++) {
                $align = if ($c -eq 0) { "l" } else { "r" }
                [void]$shapes.Add((New-PptShapeText -Id $id -X $xCursor -Y $yRow -W $Widths[$c] -H $RowH -Text ([string]$values[$c]) -FontSize $FontSize -Color $Brand.Ink -Align $align -Fill $fill -Line $Brand.Line))
                $id++
                $xCursor += $Widths[$c]
            }
            $workIndex++
        }
    }
    return ,([string[]]$shapes.ToArray())
}

function New-YearGroupedWorkCardsColumnsShapes {
    param(
        [object[]]$Columns,
        [double[]]$Xs,
        [double]$Y,
        [double]$W,
        [int]$StartId,
        [double]$RowH = 0.35,
        [double]$NameFontSize = 5.7,
        [double]$MetaFontSize = 5.25
    )
    $shapes = New-Object System.Collections.Generic.List[string]
    $id = $StartId
    for ($col = 0; $col -lt $Columns.Count; $col++) {
        $rows = @($Columns[$col])
        if ($rows.Count -eq 0) { continue }
        $xBase = $Xs[$col]
        $workIndex = 0
        for ($r = 0; $r -lt $rows.Count; $r++) {
            $row = $rows[$r]
            $yRow = $Y + ($r * $RowH)
            $isYearHeader = ($row.PSObject.Properties.Match("IsYearHeader").Count -gt 0 -and $row.IsYearHeader)
            if ($isYearHeader) {
                $preco = if ($row.PrecoM2 -ne $null) { (Format-Brl $row.PrecoM2 0) + "/m2" } else { "-" }
                $continuation = if ($row.Continuacao) { " cont." } else { "" }
                $text = ("{0}{1} | {2} obras | {3} | {4} | {5}" -f $row.AnoFinalizacao, $continuation, (Format-NumberPt $row.Obras 0), (Format-ShortArea $row.AreaM2), (Format-ShortBrl $row.ValorNegociado), $preco)
                [void]$shapes.Add((New-PptShapeText -Id $id -X $xBase -Y $yRow -W $W -H ($RowH - 0.03) -Text $text -FontSize 5.8 -Color $Brand.White -Bold $true -Fill $Brand.Blue))
                $id++
                continue
            }
            $fill = if ($workIndex % 2 -eq 0) { "FFFFFF" } else { "F5F8FB" }
            $nomeCompleto = (($row.Nome -replace "\s+", " ").Trim())
            $meta = ("UF {0} | Fim {1} | Status {2} | Valor {3} | {4} | {5}" -f $row.Estado, $row.FimObra, $row.Status, (Format-ShortBrl $row.ValorNegociado), (Format-ShortArea $row.AreaM2), $(if ($row.PrecoM2 -ne $null) { (Format-Brl $row.PrecoM2 0) + "/m2" } else { "-" }))
            [void]$shapes.Add((New-PptRect -Id $id -X $xBase -Y $yRow -W $W -H ($RowH - 0.025) -Fill $fill -Line $Brand.Line))
            $id++
            [void]$shapes.Add((New-PptShapeText -Id $id -X ($xBase + 0.04) -Y ($yRow + 0.01) -W ($W - 0.08) -H 0.16 -Text $nomeCompleto -FontSize $NameFontSize -Color $Brand.Ink -Bold $true))
            $id++
            [void]$shapes.Add((New-PptShapeText -Id $id -X ($xBase + 0.04) -Y ($yRow + 0.17) -W ($W - 0.08) -H 0.15 -Text $meta -FontSize $MetaFontSize -Color $Brand.Muted))
            $id++
            $workIndex++
        }
    }
    return ,([string[]]$shapes.ToArray())
}

function New-BarShapes {
    param([object[]]$Rows, [double]$X, [double]$Y, [double]$W, [double]$RowH, [string]$Metric, [int]$StartId, [int]$MaxRows = 5)
    $items = @($Rows | Where-Object { $_.$Metric -gt 0 } | Select-Object -First $MaxRows)
    $max = 1.0
    foreach ($item in $items) { if ([double]$item.$Metric -gt $max) { $max = [double]$item.$Metric } }
    $shapes = New-Object System.Collections.Generic.List[string]
    $id = $StartId
    $labelW = $W * 0.34
    $barX = $X + $labelW + 0.08
    $barW = $W * 0.38
    $valueX = $barX + $barW + 0.12
    for ($i = 0; $i -lt $items.Count; $i++) {
        $row = $items[$i]
        $yRow = $Y + ($i * $RowH)
        $value = [double]$row.$Metric
        $wBar = [math]::Max(0.08, ($value / $max) * $barW)
        $fill = if ($i % 3 -eq 0) { $Brand.Navy } elseif ($i % 3 -eq 1) { $Brand.Blue } else { $Brand.Orange }
        [void]$shapes.Add((New-PptShapeText -Id $id -X $X -Y $yRow -W $labelW -H ($RowH - 0.03) -Text (Short-Text $row.Nome 20) -FontSize 7 -Color $Brand.Ink -Bold $true))
        $id++
        [void]$shapes.Add((New-PptRect -Id $id -X $barX -Y ($yRow + 0.08) -W $wBar -H 0.14 -Fill $fill))
        $id++
        [void]$shapes.Add((New-PptShapeText -Id $id -X $valueX -Y $yRow -W ($W - ($valueX - $X)) -H ($RowH - 0.03) -Text (Format-ShortBrl $value) -FontSize 7 -Color $Brand.Muted))
        $id++
    }
    return ,([string[]]$shapes.ToArray())
}

function Group-ByMetric {
    param([object[]]$Rows, [string]$Property)
    $groups = foreach ($g in @($Rows | Group-Object -Property $Property)) {
        $summary = New-Summary @($g.Group)
        [pscustomobject]@{ Nome = if ([string]::IsNullOrWhiteSpace($g.Name)) { "-" } else { $g.Name }; Obras = $summary.Obras; AreaM2 = $summary.AreaM2; ValorNegociado = $summary.ValorNegociado; PrecoM2 = $summary.PrecoM2 }
    }
    return @($groups | Sort-Object -Property ValorNegociado -Descending)
}

function Build-TableRows {
    param([object[]]$Items, [int]$MaxRows = 12)
    $sorted = @($Items | Sort-Object -Property ValorNegociado -Descending)
    if ($sorted.Count -le $MaxRows) { return $sorted }
    $visible = @($sorted | Select-Object -First ($MaxRows - 1))
    $rest = @($sorted | Select-Object -Skip ($MaxRows - 1))
    $sum = New-Summary $rest
    $visible += [pscustomobject]@{
        Nome = ("Demais obras ({0})" -f $rest.Count)
        Estado = "-"
        Status = "Consolidado"
        ValorNegociado = $sum.ValorNegociado
        AreaM2 = $sum.AreaM2
        PrecoM2 = $sum.PrecoM2
    }
    return $visible
}

function New-ZipFromDirectory {
    param([string]$SourceDir, [string]$ZipPath)
    $zipFull = Resolve-FullPath $ZipPath
    if (Test-Path -LiteralPath $zipFull) { Remove-Item -LiteralPath $zipFull -Force }
    Add-Type -AssemblyName System.IO.Compression.FileSystem
    $sourceFull = Resolve-FullPath $SourceDir
    $zip = [System.IO.Compression.ZipFile]::Open($zipFull, [System.IO.Compression.ZipArchiveMode]::Create)
    try {
        foreach ($file in Get-ChildItem -LiteralPath $sourceFull -Recurse -File) {
            $relative = $file.FullName.Substring($sourceFull.Length).TrimStart("\", "/") -replace "\\", "/"
            [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $file.FullName, $relative) | Out-Null
        }
    } finally { $zip.Dispose() }
}

function Build-Presentation {
    param([string]$Template, [string]$Output, [object[]]$Records)
    $templateFull = Resolve-FullPath $Template
    $outputFull = Resolve-FullPath $Output
    New-Item -ItemType Directory -Force -Path (Split-Path -Parent $outputFull) | Out-Null

    $temp = Join-Path ([System.IO.Path]::GetTempPath()) ("ppt_marcelo_" + [guid]::NewGuid().ToString("N"))
    Add-Type -AssemblyName System.IO.Compression.FileSystem
    [System.IO.Compression.ZipFile]::ExtractToDirectory($templateFull, $temp)
    $slidesDir = Join-Path $temp "ppt\slides"
    $slideRelsDir = Join-Path $temp "ppt\slides\_rels"
    New-Item -ItemType Directory -Force -Path $slidesDir, $slideRelsDir | Out-Null
    Get-ChildItem -LiteralPath $slidesDir -Filter "slide*.xml" -ErrorAction SilentlyContinue | Remove-Item -Force
    Get-ChildItem -LiteralPath $slideRelsDir -Filter "slide*.xml.rels" -ErrorAction SilentlyContinue | Remove-Item -Force

    $order = @("Hospitais", (Get-CategoryName "PAClinicas"), (Get-CategoryName "Diagnosticos"), (Get-CategoryName "TEALabs"))
    $slides = New-Object System.Collections.Generic.List[object]
    $slideNo = 1
    foreach ($category in $order) {
        $items = @($Records | Where-Object { $_.Categoria -eq $category })
        $summary = New-Summary $items
        $byState = Group-ByMetric $items "Estado"
        $byStatus = Group-ByMetric $items "Status"
        $byClass = Group-ByMetric $items "Classificacao"
        $topWork = @($items | Sort-Object -Property ValorNegociado -Descending | Select-Object -First 1)
        $rows = Build-TableRows $items 13

        $shapes = New-Object System.Collections.Generic.List[string]
        Add-HeaderFooter $shapes $category $slideNo
        [void]$shapes.Add((New-PptShapeText -Id 10 -X 0.58 -Y 0.78 -W 8.7 -H 0.42 -Text $category -FontSize 22 -Color $Brand.Ink -Bold $true))
        [void]$shapes.Add((New-PptShapeText -Id 11 -X 8.6 -Y 0.84 -W 4.1 -H 0.28 -Text "Dados da planilha Apresentacao_Marcelo" -FontSize 9 -Color $Brand.Muted -Align "r"))

        $precoCard = if ($summary.PrecoM2 -ne $null) { (Format-Brl $summary.PrecoM2 0) + "/m2" } else { "-" }
        $cards = @(
            @("Obras", (Format-NumberPt $summary.Obras 0), "escopo da categoria"),
            @("Area construida", (Format-ShortArea $summary.AreaM2), "soma da area"),
            @("Valor negociado", (Format-ShortBrl $summary.ValorNegociado), "soma negociada"),
            @("Custo por m2", $precoCard, "preco m2 ponderado")
        )
        for ($i = 0; $i -lt $cards.Count; $i++) {
            $x = 0.58 + ($i * 2.25)
            $fill = @($Brand.Navy, $Brand.Blue, $Brand.Orange, $Brand.Navy)[$i]
            [void]$shapes.Add((New-PptShapeText -Id (20 + $i) -X $x -Y 1.34 -W 2.05 -H 0.76 -Text ("{0}`n{1}`n{2}" -f $cards[$i][0], $cards[$i][1], $cards[$i][2]) -FontSize 10 -Color $Brand.White -Bold $true -Fill $fill -Radius 1))
        }

        $insights = New-Object System.Collections.Generic.List[string]
        if ($topWork.Count -gt 0) { [void]$insights.Add(("Maior obra: {0} ({1})." -f (Short-Text $topWork[0].Nome 48), (Format-ShortBrl $topWork[0].ValorNegociado))) }
        if ($byState.Count -gt 0) { [void]$insights.Add(("UF lider em valor: {0} ({1})." -f $byState[0].Nome, (Format-ShortBrl $byState[0].ValorNegociado))) }
        if ($byClass.Count -gt 0) { [void]$insights.Add(("Classificacao dominante: {0}." -f (Short-Text $byClass[0].Nome 48))) }
        if ($byStatus.Count -gt 0) { [void]$insights.Add(("Status: " + (($byStatus | ForEach-Object { $_.Nome + " " + $_.Obras }) -join " | "))) }
        [void]$shapes.Add((New-PptShapeText -Id 40 -X 9.78 -Y 1.30 -W 2.95 -H 0.34 -Text "Leitura executiva" -FontSize 12 -Color $Brand.Navy -Bold $true))
        [void]$shapes.Add((New-PptShapeText -Id 41 -X 9.78 -Y 1.68 -W 2.95 -H 1.20 -Text (($insights | ForEach-Object { "- $_" }) -join "`n") -FontSize 8 -Color $Brand.Ink -Fill "FFFFFF" -Line $Brand.Line -Radius 1))

        [void]$shapes.Add((New-PptShapeText -Id 50 -X 0.62 -Y 2.48 -W 8.8 -H 0.26 -Text "Listagem executiva das obras por valor negociado" -FontSize 12 -Color $Brand.Navy -Bold $true))
        [void]$shapes.AddRange((New-TableShapes -Rows $rows -X 0.62 -Y 2.82 -Widths @(4.12,0.46,1.02,1.08,0.92,0.82) -Headers @("Obra","UF","Status","Valor","m2","R$/m2") -ValueBlocks @(
            { param($r) Short-Text $r.Nome 58 },
            { param($r) $r.Estado },
            { param($r) Short-Text $r.Status 16 },
            { param($r) Format-ShortBrl $r.ValorNegociado },
            { param($r) Format-ShortArea $r.AreaM2 },
            { param($r) if ($r.PrecoM2 -ne $null) { Format-Brl $r.PrecoM2 0 } else { "-" } }
        ) -StartId 100 -RowH 0.285 -FontSize 6))

        [void]$shapes.Add((New-PptShapeText -Id 300 -X 9.78 -Y 3.08 -W 2.95 -H 0.28 -Text "Top UFs por valor" -FontSize 11 -Color $Brand.Orange -Bold $true))
        [void]$shapes.AddRange((New-BarShapes -Rows $byState -X 9.78 -Y 3.48 -W 3.0 -RowH 0.42 -Metric "ValorNegociado" -StartId 310 -MaxRows 5))
        [void]$shapes.Add((New-PptShapeText -Id 360 -X 9.78 -Y 5.82 -W 2.95 -H 0.62 -Text ("Base: {0} obras | {1} | {2}" -f $summary.Obras, (Format-ShortArea $summary.AreaM2), (Format-ShortBrl $summary.ValorNegociado)) -FontSize 9 -Color $Brand.Muted -Fill $Brand.Soft -Line $Brand.Line -Radius 1))

        [void]$slides.Add([pscustomobject]@{ Shapes = $shapes.ToArray(); Rels = @("<Relationship Id='rIdLogo' Type='http://schemas.openxmlformats.org/officeDocument/2006/relationships/image' Target='../media/image4.png'/>") })
        $slideNo++
    }

    for ($i = 1; $i -le $slides.Count; $i++) {
        $slide = $slides[$i - 1]
        Write-Utf8NoBom -Path (Join-Path $slidesDir ("slide{0}.xml" -f $i)) -Value (New-SlideXml -Shapes $slide.Shapes)
        Write-Utf8NoBom -Path (Join-Path $slideRelsDir ("slide{0}.xml.rels" -f $i)) -Value (New-SlideRels -Relationships $slide.Rels)
    }

    [xml]$presentation = Get-Content -LiteralPath (Join-Path $temp "ppt\presentation.xml") -Raw
    $nsP = "http://schemas.openxmlformats.org/presentationml/2006/main"
    $nsR = "http://schemas.openxmlformats.org/officeDocument/2006/relationships"
    $sldIdLst = $presentation.presentation.sldIdLst
    $sldIdLst.RemoveAll()
    for ($i = 1; $i -le $slides.Count; $i++) {
        $sldId = $presentation.CreateElement("p", "sldId", $nsP)
        [void]$sldId.SetAttribute("id", [string](255 + $i))
        [void]$sldId.SetAttribute("id", $nsR, ("rIdSlide{0}" -f $i))
        [void]$sldIdLst.AppendChild($sldId)
    }
    $presentation.Save((Join-Path $temp "ppt\presentation.xml"))

    [xml]$rels = Get-Content -LiteralPath (Join-Path $temp "ppt\_rels\presentation.xml.rels") -Raw
    $relRoot = $rels.Relationships
    $slideRels = @($relRoot.Relationship | Where-Object { $_.Type -eq "http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" })
    foreach ($rel in $slideRels) { [void]$relRoot.RemoveChild($rel) }
    $nsRel = "http://schemas.openxmlformats.org/package/2006/relationships"
    for ($i = 1; $i -le $slides.Count; $i++) {
        $rel = $rels.CreateElement("Relationship", $nsRel)
        [void]$rel.SetAttribute("Id", ("rIdSlide{0}" -f $i))
        [void]$rel.SetAttribute("Type", "http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide")
        [void]$rel.SetAttribute("Target", ("slides/slide{0}.xml" -f $i))
        [void]$relRoot.AppendChild($rel)
    }
    $rels.Save((Join-Path $temp "ppt\_rels\presentation.xml.rels"))

    [xml]$contentTypes = Get-Content -LiteralPath (Join-Path $temp "[Content_Types].xml") -Raw
    $typesRoot = $contentTypes.Types
    $slideOverrides = @($typesRoot.Override | Where-Object { $_.PartName -like "/ppt/slides/slide*.xml" })
    foreach ($node in $slideOverrides) { [void]$typesRoot.RemoveChild($node) }
    $nsCt = "http://schemas.openxmlformats.org/package/2006/content-types"
    for ($i = 1; $i -le $slides.Count; $i++) {
        $override = $contentTypes.CreateElement("Override", $nsCt)
        $override.SetAttribute("PartName", ("/ppt/slides/slide{0}.xml" -f $i))
        $override.SetAttribute("ContentType", "application/vnd.openxmlformats-officedocument.presentationml.slide+xml")
        [void]$typesRoot.AppendChild($override)
    }
    $contentTypes.Save((Join-Path $temp "[Content_Types].xml"))

    New-ZipFromDirectory -SourceDir $temp -ZipPath $outputFull
    Remove-Item -LiteralPath $temp -Recurse -Force
}

function Get-YearSortValue {
    param([string]$Year)
    $n = 0
    if ([int]::TryParse([string]$Year, [ref]$n)) { return $n }
    return 9999
}

function Get-CategoryOrder {
    return @("Hospitais", (Get-CategoryName "PA"), (Get-CategoryName "ClinicasDiagTeaLab"))
}

function Split-Items {
    param([object[]]$Items, [int]$Size)
    $arr = @($Items)
    $pages = New-Object System.Collections.Generic.List[object]
    for ($i = 0; $i -lt $arr.Count; $i += $Size) {
        $take = [math]::Min($Size, $arr.Count - $i)
        [void]$pages.Add([pscustomobject]@{ Rows = @($arr | Select-Object -Skip $i -First $take) })
    }
    return $pages.ToArray()
}

function New-YearHeaderRow {
    param([string]$Year, [object[]]$Items, [bool]$Continuation = $false)
    $summary = New-Summary @($Items)
    return [pscustomobject]@{
        IsYearHeader = $true
        AnoFinalizacao = $Year
        Continuacao = $Continuation
        Obras = $summary.Obras
        AreaM2 = $summary.AreaM2
        ValorNegociado = $summary.ValorNegociado
        PrecoM2 = $summary.PrecoM2
    }
}

function Split-ItemsByYear {
    param([object[]]$Items, [int]$Size = 16)
    $pages = New-Object System.Collections.Generic.List[object]
    $current = New-Object System.Collections.Generic.List[object]
    $yearGroups = @($Items | Group-Object AnoFinalizacao | Sort-Object @{ Expression = { Get-YearSortValue $_.Name } })
    foreach ($group in $yearGroups) {
        $year = [string]$group.Name
        $yearItems = @($group.Group | Sort-Object -Property FimObra, ValorNegociado -Descending)
        if ($yearItems.Count -eq 0) { continue }
        $index = 0
        $continuation = $false
        while ($index -lt $yearItems.Count) {
            $remaining = $yearItems.Count - $index
            $remainingSpace = $Size - $current.Count
            $blockUnits = 1 + $remaining
            if ($current.Count -gt 0 -and $blockUnits -gt $remainingSpace) {
                [void]$pages.Add([pscustomobject]@{ Rows = @($current.ToArray()) })
                $current.Clear()
            }

            [void]$current.Add((New-YearHeaderRow -Year $year -Items $yearItems -Continuation $continuation))
            $take = [math]::Min(($Size - $current.Count), ($yearItems.Count - $index))
            foreach ($item in @($yearItems | Select-Object -Skip $index -First $take)) {
                [void]$current.Add($item)
            }
            $index += $take

            if ($index -lt $yearItems.Count) {
                [void]$pages.Add([pscustomobject]@{ Rows = @($current.ToArray()) })
                $current.Clear()
                $continuation = $true
            }
        }
    }
    if ($current.Count -gt 0) {
        [void]$pages.Add([pscustomobject]@{ Rows = @($current.ToArray()) })
    }
    return $pages.ToArray()
}

function Split-ItemsByYearColumns {
    param([object[]]$Items, [int]$ColumnSize = 21, [int]$ColumnCount = 2)
    $pages = New-Object System.Collections.Generic.List[object]
    $columns = New-Object System.Collections.Generic.List[object]
    for ($i = 0; $i -lt $ColumnCount; $i++) {
        [void]$columns.Add((New-Object System.Collections.Generic.List[object]))
    }
    $colIndex = 0

    function Save-CurrentColumns {
        $hasRows = $false
        foreach ($colRows in $columns) {
            if ($colRows.Count -gt 0) { $hasRows = $true }
        }
        if (-not $hasRows) { return }
        $snapshot = New-Object System.Collections.Generic.List[object]
        foreach ($colRows in $columns) {
            [void]$snapshot.Add(@($colRows.ToArray()))
        }
        [void]$pages.Add([pscustomobject]@{ Columns = @($snapshot.ToArray()) })
        foreach ($colRows in $columns) { $colRows.Clear() }
        $script:dummy = $null
    }

    function Move-NextColumn {
        if ($colIndex -lt ($ColumnCount - 1)) {
            $script:__compactColIndex = $colIndex + 1
        } else {
            Save-CurrentColumns
            $script:__compactColIndex = 0
        }
    }

    $script:__compactColIndex = 0
    $yearGroups = @($Items | Group-Object AnoFinalizacao | Sort-Object @{ Expression = { Get-YearSortValue $_.Name } })
    foreach ($group in $yearGroups) {
        $year = [string]$group.Name
        $yearItems = @($group.Group | Sort-Object -Property FimObra, ValorNegociado -Descending)
        if ($yearItems.Count -eq 0) { continue }
        $index = 0
        $continuation = $false
        while ($index -lt $yearItems.Count) {
            $colIndex = $script:__compactColIndex
            $remaining = $yearItems.Count - $index
            $take = [math]::Min($remaining, ($ColumnSize - 1))
            $segment = New-Object System.Collections.Generic.List[object]
            [void]$segment.Add((New-YearHeaderRow -Year $year -Items $yearItems -Continuation $continuation))
            foreach ($item in @($yearItems | Select-Object -Skip $index -First $take)) {
                [void]$segment.Add($item)
            }

            $available = $ColumnSize - $columns[$colIndex].Count
            if ($columns[$colIndex].Count -gt 0 -and $segment.Count -gt $available) {
                Move-NextColumn
                $colIndex = $script:__compactColIndex
            }
            foreach ($row in $segment) {
                [void]$columns[$colIndex].Add($row)
            }

            $index += $take
            if ($index -lt $yearItems.Count) {
                Move-NextColumn
                $continuation = $true
            }
        }
    }
    Save-CurrentColumns
    return $pages.ToArray()
}

function Format-YearList {
    param([object[]]$Years)
    $values = @($Years | Where-Object { -not [string]::IsNullOrWhiteSpace([string]$_) } | Select-Object -Unique)
    if ($values.Count -eq 0) { return "-" }
    $numbers = New-Object System.Collections.Generic.List[int]
    $allNumeric = $true
    foreach ($value in $values) {
        $n = 0
        if ([int]::TryParse([string]$value, [ref]$n)) { [void]$numbers.Add($n) } else { $allNumeric = $false }
    }
    if ($allNumeric -and $numbers.Count -gt 1) {
        $ordered = @($numbers | Sort-Object)
        $isSequence = $true
        for ($i = 1; $i -lt $ordered.Count; $i++) {
            if ($ordered[$i] -ne ($ordered[$i - 1] + 1)) { $isSequence = $false }
        }
        if ($isSequence) { return ("{0} a {1}" -f $ordered[0], $ordered[$ordered.Count - 1]) }
    }
    return ($values -join ", ")
}

function Get-YearTipologySummary {
    param([object[]]$Records)
    $rows = foreach ($g in @($Records | Group-Object AnoFinalizacao, Categoria)) {
        $parts = $g.Name -split ", ", 2
        $summary = New-Summary @($g.Group)
        [pscustomobject]@{
            AnoFinalizacao = $parts[0]
            Categoria = $parts[1]
            Obras = $summary.Obras
            AreaM2 = $summary.AreaM2
            ValorNegociado = $summary.ValorNegociado
            PrecoM2 = $summary.PrecoM2
            SortAno = Get-YearSortValue $parts[0]
            SortCategoria = [array]::IndexOf((Get-CategoryOrder), $parts[1])
        }
    }
    return @($rows | Sort-Object SortCategoria, SortAno)
}

function ConvertTo-XlsxColumnName {
    param([int]$Index)
    $name = ""
    $n = $Index
    while ($n -gt 0) {
        $n--
        $name = [char](65 + ($n % 26)) + $name
        $n = [math]::Floor($n / 26)
    }
    return $name
}

function New-XlsxCell {
    param([int]$Row, [int]$Column, [object]$Value, [bool]$Numeric = $false, [int]$Style = 0)
    $ref = (ConvertTo-XlsxColumnName $Column) + $Row
    $styleAttr = if ($Style -gt 0) { " s=`"$Style`"" } else { "" }
    if ($Numeric -and $Value -ne $null -and ([string]$Value) -ne "") {
        $num = ([double]$Value).ToString("0.############", [Globalization.CultureInfo]::InvariantCulture)
        return "<c r=`"$ref`"$styleAttr><v>$num</v></c>"
    }
    $text = Escape-Xml ([string]$Value)
    return "<c r=`"$ref`" t=`"inlineStr`"$styleAttr><is><t>$text</t></is></c>"
}

function New-XlsxSheetXml {
    param([object[]]$Rows, [object[]]$Columns)
    $lastCol = ConvertTo-XlsxColumnName $Columns.Count
    $lastRow = @($Rows).Count + 1
    $xmlRows = New-Object System.Collections.Generic.List[string]
    $headerCells = New-Object System.Collections.Generic.List[string]
    for ($c = 1; $c -le $Columns.Count; $c++) {
        [void]$headerCells.Add((New-XlsxCell -Row 1 -Column $c -Value $Columns[$c - 1].Label -Style 1))
    }
    [void]$xmlRows.Add("<row r=`"1`">$($headerCells -join '')</row>")
    $rIndex = 2
    foreach ($row in @($Rows)) {
        $cells = New-Object System.Collections.Generic.List[string]
        for ($c = 1; $c -le $Columns.Count; $c++) {
            $col = $Columns[$c - 1]
            $value = $row.($col.Key)
            $numeric = [bool]$col.Numeric
            $style = if ($numeric) { 2 } else { 0 }
            [void]$cells.Add((New-XlsxCell -Row $rIndex -Column $c -Value $value -Numeric:$numeric -Style $style))
        }
        [void]$xmlRows.Add("<row r=`"$rIndex`">$($cells -join '')</row>")
        $rIndex++
    }
    $cols = New-Object System.Collections.Generic.List[string]
    for ($c = 1; $c -le $Columns.Count; $c++) {
        $width = if ($Columns[$c - 1].Width) { $Columns[$c - 1].Width } else { 16 }
        [void]$cols.Add("<col min=`"$c`" max=`"$c`" width=`"$width`" customWidth=`"1`"/>")
    }
    return @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <dimension ref="A1:$lastCol$lastRow"/>
  <sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>
  <cols>$($cols -join '')</cols>
  <sheetData>
    $($xmlRows -join "`n    ")
  </sheetData>
  <autoFilter ref="A1:$lastCol$lastRow"/>
</worksheet>
"@
}

function Write-ImprovedWorkbook {
    param([string]$Path, [object[]]$Records)
    $outFull = Resolve-FullPath $Path
    New-Item -ItemType Directory -Force -Path (Split-Path -Parent $outFull) | Out-Null
    $temp = Join-Path ([System.IO.Path]::GetTempPath()) ("xlsx_marcelo_" + [guid]::NewGuid().ToString("N"))
    New-Item -ItemType Directory -Force -Path (Join-Path $temp "_rels"), (Join-Path $temp "xl\_rels"), (Join-Path $temp "xl\worksheets") | Out-Null

    $baseRows = @($Records | Sort-Object Categoria, @{ Expression = { Get-YearSortValue $_.AnoFinalizacao } }, FimObra, Nome | ForEach-Object {
        [pscustomobject]@{
            AnoFinalizacao = $_.AnoFinalizacao
            Tipologia = $_.Categoria
            FimObra = $_.FimObra
            Nome = $_.Nome
            Empresa = $_.Empresa
            Praca = $_.Praca
            Estado = $_.Estado
            Regiao = $_.Regiao
            Status = $_.Status
            Classificacao = $_.Classificacao
            Nivel = $_.Nivel
            AreaM2 = $_.AreaM2
            ValorNegociado = $_.ValorNegociado
            PrecoM2 = $_.PrecoM2
        }
    })
    $summaryYearType = Get-YearTipologySummary $Records
    $summaryType = foreach ($g in @($Records | Group-Object Categoria)) {
        $s = New-Summary @($g.Group)
        [pscustomobject]@{ Tipologia = $g.Name; Obras = $s.Obras; AreaM2 = $s.AreaM2; ValorNegociado = $s.ValorNegociado; PrecoM2 = $s.PrecoM2 }
    }
    $summaryType = @($summaryType | Sort-Object @{ Expression = { [array]::IndexOf((Get-CategoryOrder), $_.Tipologia) } })

    $baseCols = @(
        [pscustomobject]@{Key="AnoFinalizacao";Label="Ano finalizacao";Width=16},
        [pscustomobject]@{Key="Tipologia";Label="Tipologia / aba";Width=34},
        [pscustomobject]@{Key="FimObra";Label="Fim Obra";Width=12},
        [pscustomobject]@{Key="Nome";Label="Nome Obra";Width=58},
        [pscustomobject]@{Key="Empresa";Label="Empresa";Width=16},
        [pscustomobject]@{Key="Praca";Label="Praca";Width=22},
        [pscustomobject]@{Key="Estado";Label="UF";Width=8},
        [pscustomobject]@{Key="Regiao";Label="Regiao";Width=10},
        [pscustomobject]@{Key="Status";Label="Status";Width=18},
        [pscustomobject]@{Key="Classificacao";Label="Classificacao";Width=24},
        [pscustomobject]@{Key="Nivel";Label="Nivel";Width=18},
        [pscustomobject]@{Key="AreaM2";Label="Area m2";Numeric=$true;Width=14},
        [pscustomobject]@{Key="ValorNegociado";Label="Valor Negociado";Numeric=$true;Width=18},
        [pscustomobject]@{Key="PrecoM2";Label="Preco m2";Numeric=$true;Width=14}
    )
    $summaryCols = @(
        [pscustomobject]@{Key="AnoFinalizacao";Label="Ano finalizacao";Width=16},
        [pscustomobject]@{Key="Categoria";Label="Tipologia / aba";Width=34},
        [pscustomobject]@{Key="Obras";Label="Obras";Numeric=$true;Width=10},
        [pscustomobject]@{Key="AreaM2";Label="Area m2";Numeric=$true;Width=14},
        [pscustomobject]@{Key="ValorNegociado";Label="Valor Negociado";Numeric=$true;Width=18},
        [pscustomobject]@{Key="PrecoM2";Label="Preco m2";Numeric=$true;Width=14}
    )
    $typeCols = @(
        [pscustomobject]@{Key="Tipologia";Label="Tipologia / aba";Width=34},
        [pscustomobject]@{Key="Obras";Label="Obras";Numeric=$true;Width=10},
        [pscustomobject]@{Key="AreaM2";Label="Area m2";Numeric=$true;Width=14},
        [pscustomobject]@{Key="ValorNegociado";Label="Valor Negociado";Numeric=$true;Width=18},
        [pscustomobject]@{Key="PrecoM2";Label="Preco m2";Numeric=$true;Width=14}
    )

    Write-Utf8NoBom -Path (Join-Path $temp "xl\worksheets\sheet1.xml") -Value (New-XlsxSheetXml -Rows $baseRows -Columns $baseCols)
    Write-Utf8NoBom -Path (Join-Path $temp "xl\worksheets\sheet2.xml") -Value (New-XlsxSheetXml -Rows $summaryYearType -Columns $summaryCols)
    Write-Utf8NoBom -Path (Join-Path $temp "xl\worksheets\sheet3.xml") -Value (New-XlsxSheetXml -Rows $summaryType -Columns $typeCols)
    Write-Utf8NoBom -Path (Join-Path $temp "[Content_Types].xml") -Value @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/worksheets/sheet2.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/worksheets/sheet3.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
</Types>
"@
    Write-Utf8NoBom -Path (Join-Path $temp "_rels\.rels") -Value @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>
"@
    Write-Utf8NoBom -Path (Join-Path $temp "xl\workbook.xml") -Value @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    <sheet name="Base_Normalizada" sheetId="1" r:id="rId1"/>
    <sheet name="Resumo_Ano_Tipo" sheetId="2" r:id="rId2"/>
    <sheet name="Resumo_Tipologia" sheetId="3" r:id="rId3"/>
  </sheets>
</workbook>
"@
    Write-Utf8NoBom -Path (Join-Path $temp "xl\_rels\workbook.xml.rels") -Value @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet2.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet3.xml"/>
  <Relationship Id="rId4" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>
"@
    Write-Utf8NoBom -Path (Join-Path $temp "xl\styles.xml") -Value @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font></fonts>
  <fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF253F8E"/><bgColor indexed="64"/></patternFill></fill></fills>
  <borders count="2"><border/><border><left style="thin"><color rgb="FFD6E0EC"/></left><right style="thin"><color rgb="FFD6E0EC"/></right><top style="thin"><color rgb="FFD6E0EC"/></top><bottom style="thin"><color rgb="FFD6E0EC"/></bottom></border></borders>
  <cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
  <cellXfs count="3"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="4" fontId="0" fillId="0" borderId="1" xfId="0" applyNumberFormat="1" applyBorder="1"/></cellXfs>
  <cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
  <dxfs count="0"/>
  <tableStyles count="0" defaultTableStyle="TableStyleMedium2" defaultPivotStyle="PivotStyleLight16"/>
</styleSheet>
"@
    New-ZipFromDirectory -SourceDir $temp -ZipPath $outFull
    Remove-Item -LiteralPath $temp -Recurse -Force
}

function Build-YearTipologyPresentation {
    param([string]$Template, [string]$Output, [object[]]$Records)
    $templateFull = Resolve-FullPath $Template
    $outputFull = Resolve-FullPath $Output
    New-Item -ItemType Directory -Force -Path (Split-Path -Parent $outputFull) | Out-Null

    $temp = Join-Path ([System.IO.Path]::GetTempPath()) ("ppt_marcelo_" + [guid]::NewGuid().ToString("N"))
    Add-Type -AssemblyName System.IO.Compression.FileSystem
    [System.IO.Compression.ZipFile]::ExtractToDirectory($templateFull, $temp)
    $slidesDir = Join-Path $temp "ppt\slides"
    $slideRelsDir = Join-Path $temp "ppt\slides\_rels"
    New-Item -ItemType Directory -Force -Path $slidesDir, $slideRelsDir | Out-Null
    Get-ChildItem -LiteralPath $slidesDir -Filter "slide*.xml" -ErrorAction SilentlyContinue | Remove-Item -Force
    Get-ChildItem -LiteralPath $slideRelsDir -Filter "slide*.xml.rels" -ErrorAction SilentlyContinue | Remove-Item -Force

    $slides = New-Object System.Collections.Generic.List[object]
    $summary = New-Summary $Records
    $summaryRows = Get-YearTipologySummary $Records

    $shapes = New-Object System.Collections.Generic.List[string]
    Add-HeaderFooter $shapes "Resumo executivo" 1
    [void]$shapes.Add((New-PptShapeText -Id 10 -X 0.62 -Y 0.82 -W 8.8 -H 0.44 -Text "Obras por tipologia e ano de finalizacao" -FontSize 22 -Color $Brand.Ink -Bold $true))
    [void]$shapes.Add((New-PptShapeText -Id 11 -X 9.0 -Y 0.88 -W 3.5 -H 0.28 -Text "Todas as obras listadas nos slides seguintes" -FontSize 9 -Color $Brand.Muted -Align "r"))
    $precoTotal = if ($summary.PrecoM2 -ne $null) { (Format-Brl $summary.PrecoM2 0) + "/m2" } else { "-" }
    $cards = @(
        @("Obras", (Format-NumberPt $summary.Obras 0), "total da planilha"),
        @("Area", (Format-ShortArea $summary.AreaM2), "area total"),
        @("Valor", (Format-ShortBrl $summary.ValorNegociado), "valor negociado"),
        @("Preco m2", $precoTotal, "ponderado pela area")
    )
    for ($i = 0; $i -lt $cards.Count; $i++) {
        $x = 0.62 + ($i * 2.55)
        $fill = @($Brand.Navy, $Brand.Blue, $Brand.Orange, $Brand.Navy)[$i]
        [void]$shapes.Add((New-PptShapeText -Id (20 + $i) -X $x -Y 1.38 -W 2.35 -H 0.78 -Text ("{0}`n{1}`n{2}" -f $cards[$i][0], $cards[$i][1], $cards[$i][2]) -FontSize 11 -Color $Brand.White -Bold $true -Fill $fill -Radius 1))
    }
    [void]$shapes.Add((New-PptShapeText -Id 45 -X 0.72 -Y 2.55 -W 7.8 -H 0.28 -Text "Resumo por tipologia e ano" -FontSize 13 -Color $Brand.Navy -Bold $true))
    [void]$shapes.AddRange((New-TableShapes -Rows $summaryRows -X 0.72 -Y 2.90 -Widths @(4.05,0.75,0.6,1.05,1.20,0.95) -Headers @("Tipologia","Ano","Obras","m2","Valor","R$/m2") -ValueBlocks @(
        { param($r) $r.Categoria },
        { param($r) $r.AnoFinalizacao },
        { param($r) Format-NumberPt $r.Obras 0 },
        { param($r) Format-ShortArea $r.AreaM2 },
        { param($r) Format-ShortBrl $r.ValorNegociado },
        { param($r) if ($r.PrecoM2 -ne $null) { Format-Brl $r.PrecoM2 0 } else { "-" } }
    ) -StartId 80 -RowH 0.32 -FontSize 7))
    [void]$shapes.Add((New-PptShapeText -Id 250 -X 9.1 -Y 2.64 -W 3.25 -H 2.05 -Text "Criterio de separacao`n- Sequencia: tipologia e, dentro dela, ano de finalizacao.`n- Slides de detalhe podem reunir mais de um ano quando couber.`n- Tipologia: as 3 abas originais da planilha.`n- Nao ha consolidacao de obras na listagem." -FontSize 10 -Color $Brand.Ink -Fill $Brand.Soft -Line $Brand.Line -Radius 1))
    [void]$slides.Add([pscustomobject]@{ Shapes = $shapes.ToArray(); Rels = @("<Relationship Id='rIdLogo' Type='http://schemas.openxmlformats.org/officeDocument/2006/relationships/image' Target='../media/image4.png'/>") })

    $slideNumber = 2
    foreach ($category in Get-CategoryOrder) {
        $categoryItems = @($Records | Where-Object { $_.Categoria -eq $category } | Sort-Object @{ Expression = { Get-YearSortValue $_.AnoFinalizacao } }, FimObra, ValorNegociado -Descending)
        if ($categoryItems.Count -eq 0) { continue }
        $pages = @(Split-ItemsByYearColumns -Items $categoryItems -ColumnSize 14 -ColumnCount 2)
        for ($p = 0; $p -lt $pages.Count; $p++) {
            $pageColumns = @($pages[$p].Columns)
            $pageRows = @($pageColumns | ForEach-Object { $_ })
            $pageWorks = @($pageRows | Where-Object { -not ($_.PSObject.Properties.Match("IsYearHeader").Count -gt 0 -and $_.IsYearHeader) })
            $pageSummary = New-Summary $pageWorks
            $pageYears = @($pageRows | Where-Object { $_.PSObject.Properties.Match("IsYearHeader").Count -gt 0 -and $_.IsYearHeader } | ForEach-Object { $_.AnoFinalizacao } | Select-Object -Unique)
            $yearLabel = Format-YearList $pageYears
            $shapes = New-Object System.Collections.Generic.List[string]
            Add-HeaderFooter $shapes $category $slideNumber
            [void]$shapes.Add((New-PptShapeText -Id 10 -X 0.62 -Y 0.76 -W 8.35 -H 0.40 -Text $category -FontSize 18 -Color $Brand.Ink -Bold $true))
            [void]$shapes.Add((New-PptShapeText -Id 11 -X 8.9 -Y 0.84 -W 3.7 -H 0.28 -Text ("Anos: {0} | Pagina {1}/{2}" -f $yearLabel, ($p + 1), $pages.Count) -FontSize 9 -Color $Brand.Muted -Align "r"))
            $precoGrupo = if ($pageSummary.PrecoM2 -ne $null) { (Format-Brl $pageSummary.PrecoM2 0) + "/m2" } else { "-" }
            $kpi = @(
                @("Obras", (Format-NumberPt $pageSummary.Obras 0)),
                @("Area", (Format-ShortArea $pageSummary.AreaM2)),
                @("Valor", (Format-ShortBrl $pageSummary.ValorNegociado)),
                @("Preco m2", $precoGrupo)
            )
            for ($i = 0; $i -lt $kpi.Count; $i++) {
                $x = 0.62 + ($i * 2.35)
                $fill = @($Brand.Navy, $Brand.Blue, $Brand.Orange, $Brand.Navy)[$i]
                [void]$shapes.Add((New-PptShapeText -Id (20 + $i) -X $x -Y 1.25 -W 2.10 -H 0.58 -Text ("{0}`n{1}" -f $kpi[$i][0], $kpi[$i][1]) -FontSize 10 -Color $Brand.White -Bold $true -Fill $fill -Radius 1))
            }
            [void]$shapes.Add((New-PptShapeText -Id 60 -X 0.62 -Y 1.92 -W 9.0 -H 0.22 -Text "Obras listadas por ano, com nomenclatura completa" -FontSize 10 -Color $Brand.Navy -Bold $true))
            [void]$shapes.AddRange((New-YearGroupedWorkCardsColumnsShapes -Columns $pageColumns -Xs @(0.55,6.78) -Y 2.15 -W 5.85 -StartId 100 -RowH 0.35 -NameFontSize 5.7 -MetaFontSize 5.25))
            [void]$slides.Add([pscustomobject]@{ Shapes = $shapes.ToArray(); Rels = @("<Relationship Id='rIdLogo' Type='http://schemas.openxmlformats.org/officeDocument/2006/relationships/image' Target='../media/image4.png'/>") })
            $slideNumber++
        }
    }

    for ($i = 1; $i -le $slides.Count; $i++) {
        $slide = $slides[$i - 1]
        Write-Utf8NoBom -Path (Join-Path $slidesDir ("slide{0}.xml" -f $i)) -Value (New-SlideXml -Shapes $slide.Shapes)
        Write-Utf8NoBom -Path (Join-Path $slideRelsDir ("slide{0}.xml.rels" -f $i)) -Value (New-SlideRels -Relationships $slide.Rels)
    }
    [xml]$presentation = Get-Content -LiteralPath (Join-Path $temp "ppt\presentation.xml") -Raw
    $nsP = "http://schemas.openxmlformats.org/presentationml/2006/main"
    $nsR = "http://schemas.openxmlformats.org/officeDocument/2006/relationships"
    $sldIdLst = $presentation.presentation.sldIdLst
    $sldIdLst.RemoveAll()
    for ($i = 1; $i -le $slides.Count; $i++) {
        $sldId = $presentation.CreateElement("p", "sldId", $nsP)
        [void]$sldId.SetAttribute("id", [string](255 + $i))
        [void]$sldId.SetAttribute("id", $nsR, ("rIdSlide{0}" -f $i))
        [void]$sldIdLst.AppendChild($sldId)
    }
    $presentation.Save((Join-Path $temp "ppt\presentation.xml"))
    [xml]$rels = Get-Content -LiteralPath (Join-Path $temp "ppt\_rels\presentation.xml.rels") -Raw
    $relRoot = $rels.Relationships
    foreach ($rel in @($relRoot.Relationship | Where-Object { $_.Type -eq "http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" })) { [void]$relRoot.RemoveChild($rel) }
    $nsRel = "http://schemas.openxmlformats.org/package/2006/relationships"
    for ($i = 1; $i -le $slides.Count; $i++) {
        $rel = $rels.CreateElement("Relationship", $nsRel)
        [void]$rel.SetAttribute("Id", ("rIdSlide{0}" -f $i))
        [void]$rel.SetAttribute("Type", "http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide")
        [void]$rel.SetAttribute("Target", ("slides/slide{0}.xml" -f $i))
        [void]$relRoot.AppendChild($rel)
    }
    $rels.Save((Join-Path $temp "ppt\_rels\presentation.xml.rels"))
    [xml]$contentTypes = Get-Content -LiteralPath (Join-Path $temp "[Content_Types].xml") -Raw
    $typesRoot = $contentTypes.Types
    foreach ($node in @($typesRoot.Override | Where-Object { $_.PartName -like "/ppt/slides/slide*.xml" })) { [void]$typesRoot.RemoveChild($node) }
    $nsCt = "http://schemas.openxmlformats.org/package/2006/content-types"
    for ($i = 1; $i -le $slides.Count; $i++) {
        $override = $contentTypes.CreateElement("Override", $nsCt)
        $override.SetAttribute("PartName", ("/ppt/slides/slide{0}.xml" -f $i))
        $override.SetAttribute("ContentType", "application/vnd.openxmlformats-officedocument.presentationml.slide+xml")
        [void]$typesRoot.AppendChild($override)
    }
    $contentTypes.Save((Join-Path $temp "[Content_Types].xml"))
    New-ZipFromDirectory -SourceDir $temp -ZipPath $outputFull
    Remove-Item -LiteralPath $temp -Recurse -Force
}

$sourceFull = $null
if ([string]::IsNullOrWhiteSpace($SourceWorkbook)) {
    $downloads = Join-Path $env:USERPROFILE "Downloads"
    $candidate = Get-ChildItem -LiteralPath $downloads -Filter "Apresenta*Marcelo.xlsx" | Sort-Object LastWriteTime -Descending | Select-Object -First 1
    if ($candidate) { $sourceFull = $candidate.FullName }
} else {
    $sourceFull = Resolve-FullPath $SourceWorkbook
}
$workingFull = Resolve-FullPath $WorkingWorkbook
$templateFull = Resolve-FullPath $TemplatePath
$outputFull = Resolve-FullPath $OutputPath
$improvedFull = Resolve-FullPath $ImprovedWorkbookPath
$dataFull = Resolve-FullPath $DataPath

if ($sourceFull -and (Test-Path -LiteralPath $sourceFull)) {
    Copy-SharedFile -Source $sourceFull -Destination $workingFull
} elseif (-not (Test-Path -LiteralPath $workingFull)) {
    throw "Nao encontrei a planilha de origem em Downloads nem a copia de trabalho em inputs."
}
$records = @(Read-MarceloWorkbook -Workbook $workingFull)
if ($records.Count -eq 0) { throw "Nenhum registro encontrado na planilha." }

$payload = [ordered]@{
    source = $sourceFull
    generatedAt = (Get-Date).ToString("s")
    total = New-Summary $records
    byYearTipology = Get-YearTipologySummary $records
    categories = @(
        foreach ($cat in Get-CategoryOrder) {
            $items = @($records | Where-Object { $_.Categoria -eq $cat })
            [ordered]@{
                name = $cat
                summary = New-Summary $items
                byStatus = Group-ByMetric $items "Status"
                byEstado = Group-ByMetric $items "Estado"
                works = @($items | Sort-Object @{ Expression = { Get-YearSortValue $_.AnoFinalizacao } }, FimObra, ValorNegociado -Descending)
            }
        }
    )
    works = @($records | Sort-Object Categoria, @{ Expression = { Get-YearSortValue $_.AnoFinalizacao } }, FimObra, ValorNegociado -Descending)
}
Write-Utf8NoBom -Path $dataFull -Value ($payload | ConvertTo-Json -Depth 10)
Write-ImprovedWorkbook -Path $improvedFull -Records $records
Build-YearTipologyPresentation -Template $templateFull -Output $outputFull -Records $records

$summary = New-Summary $records
[pscustomobject]@{
    Registros = $records.Count
    Obras = $summary.Obras
    AreaM2 = [math]::Round($summary.AreaM2, 2)
    ValorNegociado = [math]::Round($summary.ValorNegociado, 2)
    PrecoM2 = if ($summary.PrecoM2 -ne $null) { [math]::Round($summary.PrecoM2, 2) } else { $null }
    Apresentacao = $outputFull
    PlanilhaMelhorada = $improvedFull
    Dados = $dataFull
}
