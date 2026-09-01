param(
    [string]$WorkbookPath = ".\inputs\Comissao_Obras_2025_Jul_26_v5.xlsx",
    [string]$TemplatePath = ".\inputs\Hapvida_modelo_apresentacao_padrao.pptx",
    [string]$OutputDir = ".\outputs",
    [datetime]$StartDate = [datetime]"2025-01-01",
    [datetime]$EndDate = [datetime]"2026-08-14",
    [bool]$UseVisibleRowsOnly = $false
)

$ErrorActionPreference = 'Stop'

Add-Type -AssemblyName System.IO.Compression.FileSystem

$Brand = [ordered]@{
    Navy   = "253F8E"
    Blue   = "2F65B7"
    Green  = "2F65B7"
    Orange = "F37021"
    Yellow = "FDB913"
    Ink    = "15253F"
    Muted  = "64748B"
    Bg     = "F5F8FB"
    Line   = "D8E0EA"
    White  = "FFFFFF"
}

function Resolve-FullPath {
    param([string]$Path)
    if ([System.IO.Path]::IsPathRooted($Path)) {
        return [System.IO.Path]::GetFullPath($Path)
    }
    return [System.IO.Path]::GetFullPath((Join-Path (Get-Location) $Path))
}

function ConvertTo-PlainText {
    param([object]$Value)
    if ($null -eq $Value) { return "" }
    return ([string]$Value).Trim()
}

function Escape-Xml {
    param([object]$Value)
    return [System.Security.SecurityElement]::Escape((ConvertTo-PlainText $Value))
}

function Escape-Html {
    param([object]$Value)
    return [System.Net.WebUtility]::HtmlEncode((ConvertTo-PlainText $Value))
}

function Write-Utf8NoBom {
    param(
        [string]$Path,
        [string]$Value
    )
    $encoding = New-Object System.Text.UTF8Encoding($false)
    [System.IO.File]::WriteAllText($Path, $Value, $encoding)
}

function New-ZipFromDirectory {
    param(
        [string]$SourceDir,
        [string]$ZipPath
    )
    if (Test-Path -LiteralPath $ZipPath) {
        Remove-Item -LiteralPath $ZipPath -Force
    }
    $sourceFull = [System.IO.Path]::GetFullPath($SourceDir).TrimEnd('\', '/')
    $fileStream = [System.IO.File]::Open($ZipPath, [System.IO.FileMode]::CreateNew)
    try {
        $zip = New-Object System.IO.Compression.ZipArchive($fileStream, [System.IO.Compression.ZipArchiveMode]::Create)
        try {
            foreach ($file in Get-ChildItem -LiteralPath $sourceFull -Recurse -File) {
                $relative = $file.FullName.Substring($sourceFull.Length).TrimStart('\', '/')
                $entryName = $relative -replace "\\", "/"
                [void][System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $file.FullName, $entryName, [System.IO.Compression.CompressionLevel]::Optimal)
            }
        } finally {
            $zip.Dispose()
        }
    } finally {
        $fileStream.Dispose()
    }
}

function Remove-Accents {
    param([string]$Text)
    if ([string]::IsNullOrWhiteSpace($Text)) { return "" }
    $normalized = $Text.Normalize([Text.NormalizationForm]::FormD)
    $builder = New-Object System.Text.StringBuilder
    foreach ($ch in $normalized.ToCharArray()) {
        if ([Globalization.CharUnicodeInfo]::GetUnicodeCategory($ch) -ne [Globalization.UnicodeCategory]::NonSpacingMark) {
            [void]$builder.Append($ch)
        }
    }
    return $builder.ToString().Normalize([Text.NormalizationForm]::FormC)
}

function Normalize-Key {
    param([object]$Value)
    return (Remove-Accents (ConvertTo-PlainText $Value)).ToLowerInvariant()
}

function ConvertTo-Number {
    param([object]$Value)
    if ($null -eq $Value) { return $null }
    $text = (ConvertTo-PlainText $Value)
    if ($text -eq "" -or $text -eq "-") { return $null }
    $number = 0.0
    if ([double]::TryParse($text, [Globalization.NumberStyles]::Float, [Globalization.CultureInfo]::InvariantCulture, [ref]$number)) {
        return [double]$number
    }
    $br = [Globalization.CultureInfo]::GetCultureInfo("pt-BR")
    if ([double]::TryParse($text, [Globalization.NumberStyles]::Float, $br, [ref]$number)) {
        return [double]$number
    }
    return $null
}

function ConvertFrom-ExcelDate {
    param([object]$Value)
    $number = ConvertTo-Number $Value
    if ($null -eq $number) { return $null }
    try {
        return [datetime]::FromOADate($number).Date
    } catch {
        return $null
    }
}

function Format-Brl {
    param([double]$Value, [int]$Digits = 0)
    $culture = [Globalization.CultureInfo]::GetCultureInfo("pt-BR")
    return $Value.ToString(("C{0}" -f $Digits), $culture)
}

function Format-NumberPt {
    param([double]$Value, [int]$Digits = 0)
    $culture = [Globalization.CultureInfo]::GetCultureInfo("pt-BR")
    return $Value.ToString(("N{0}" -f $Digits), $culture)
}

function Format-ShortBrl {
    param([double]$Value)
    if ([math]::Abs($Value) -ge 1000000000) { return ("R$ {0:N1} bi" -f ($Value / 1000000000.0)) -replace ",", "§" -replace "\.", "," -replace "§", "." }
    if ([math]::Abs($Value) -ge 1000000) { return ("R$ {0:N1} mi" -f ($Value / 1000000.0)) -replace ",", "§" -replace "\.", "," -replace "§", "." }
    if ([math]::Abs($Value) -ge 1000) { return ("R$ {0:N1} mil" -f ($Value / 1000.0)) -replace ",", "§" -replace "\.", "," -replace "§", "." }
    return Format-Brl $Value 0
}

function Format-ShortArea {
    param([double]$Value)
    if ([math]::Abs($Value) -ge 1000000) { return ("{0:N1} mi m²" -f ($Value / 1000000.0)) -replace ",", "§" -replace "\.", "," -replace "§", "." }
    if ([math]::Abs($Value) -ge 1000) { return ("{0:N1} mil m²" -f ($Value / 1000.0)) -replace ",", "§" -replace "\.", "," -replace "§", "." }
    return ("{0:N0} m²" -f $Value) -replace ",", "§" -replace "\.", "," -replace "§", "."
}

function Format-SvgNum {
    param([double]$Value)
    return $Value.ToString("0.##", [Globalization.CultureInfo]::InvariantCulture)
}

function Get-ColIndex {
    param([string]$Letters)
    $n = 0
    foreach ($ch in $Letters.ToUpperInvariant().ToCharArray()) {
        $n = ($n * 26) + ([int][char]$ch - [int][char]'A' + 1)
    }
    return $n
}

function Get-CellColumn {
    param([string]$CellRef)
    return [regex]::Match($CellRef, "^[A-Z]+").Value
}

function Read-ZipText {
    param(
        [System.IO.Compression.ZipArchive]$Zip,
        [string]$Name
    )
    $entry = $Zip.GetEntry($Name)
    if ($null -eq $entry) { return $null }
    $stream = $entry.Open()
    try {
        $reader = New-Object System.IO.StreamReader($stream)
        return $reader.ReadToEnd()
    } finally {
        if ($reader) { $reader.Dispose() } else { $stream.Dispose() }
    }
}

function Get-SharedStrings {
    param([System.IO.Compression.ZipArchive]$Zip)
    $xmlText = Read-ZipText $Zip "xl/sharedStrings.xml"
    $shared = New-Object System.Collections.Generic.List[string]
    if ([string]::IsNullOrWhiteSpace($xmlText)) { return $shared.ToArray() }
    [xml]$xml = $xmlText
    foreach ($si in $xml.sst.si) {
        $pieces = New-Object System.Collections.Generic.List[string]
        if ($si.t) {
            $text = $si.t.'#text'
            if ($null -eq $text) { $text = [string]$si.t }
            [void]$pieces.Add($text)
        }
        if ($si.r) {
            foreach ($run in $si.r) {
                if ($run.t) {
                    $text = $run.t.'#text'
                    if ($null -eq $text) { $text = [string]$run.t }
                    [void]$pieces.Add($text)
                }
            }
        }
        [void]$shared.Add(($pieces -join ""))
    }
    return $shared.ToArray()
}

function Get-CellValue {
    param(
        [object]$Cell,
        [string[]]$SharedStrings
    )
    $type = [string]$Cell.t
    $value = [string]$Cell.v
    if ($type -eq "s") {
        $idx = 0
        if ([int]::TryParse($value, [ref]$idx) -and $idx -ge 0 -and $idx -lt $SharedStrings.Count) {
            return $SharedStrings[$idx]
        }
        return ""
    }
    if ($type -eq "inlineStr") {
        if ($Cell.is.t) { return [string]$Cell.is.t }
        return ""
    }
    if ($type -eq "str") {
        return $value
    }
    return $value
}

function Read-ObrasData {
    param(
        [string]$Workbook,
        [datetime]$Start,
        [datetime]$End,
        [bool]$VisibleRowsOnly = $true
    )

    $zip = [System.IO.Compression.ZipFile]::OpenRead($Workbook)
    try {
        [xml]$workbookXml = Read-ZipText $zip "xl/workbook.xml"
        [xml]$relsXml = Read-ZipText $zip "xl/_rels/workbook.xml.rels"
        $baseSheet = $workbookXml.workbook.sheets.sheet | Where-Object { $_.name -eq "Base Geral" } | Select-Object -First 1
        if ($null -eq $baseSheet) { throw "A aba 'Base Geral' não foi encontrada." }

        $rid = $baseSheet.GetAttribute("id", "http://schemas.openxmlformats.org/officeDocument/2006/relationships")
        $target = ($relsXml.Relationships.Relationship | Where-Object { $_.Id -eq $rid } | Select-Object -First 1).Target
        $sheetPath = "xl/" + ($target -replace "^/", "" -replace "^xl/", "")
        [xml]$sheetXml = Read-ZipText $zip $sheetPath
        $shared = Get-SharedStrings $zip

        $hiddenColumns = @{}
        if ($sheetXml.worksheet.cols -and $sheetXml.worksheet.cols.col) {
            foreach ($col in $sheetXml.worksheet.cols.col) {
                if ([string]$col.hidden -eq "1") {
                    for ($i = [int]$col.min; $i -le [int]$col.max; $i++) {
                        $hiddenColumns[$i] = $true
                    }
                }
            }
        }

        $rows = @($sheetXml.worksheet.sheetData.row)
        $headerRow = $null
        foreach ($row in $rows) {
            $visibleValues = @()
            foreach ($cell in @($row.c)) {
                $colLetters = Get-CellColumn ([string]$cell.r)
                if ($colLetters -eq "") { continue }
                $colIdx = Get-ColIndex $colLetters
                if ($hiddenColumns.ContainsKey($colIdx)) { continue }
                $visibleValues += (Get-CellValue $cell $shared)
            }
            $joined = ($visibleValues -join "|")
            if ($joined -match "Nome Obra" -and $joined -match "Status" -and $joined -match "Classifica") {
                $headerRow = $row
                break
            }
        }
        if ($null -eq $headerRow) { throw "Não consegui localizar a linha de cabeçalho da Base Geral." }

        $headers = [ordered]@{}
        foreach ($cell in @($headerRow.c)) {
            $colLetters = Get-CellColumn ([string]$cell.r)
            if ($colLetters -eq "") { continue }
            $colIdx = Get-ColIndex $colLetters
            if ($hiddenColumns.ContainsKey($colIdx)) { continue }
            $headers[$colLetters] = ConvertTo-PlainText (Get-CellValue $cell $shared)
        }

        foreach ($required in @("B", "C", "L", "M", "N", "O", "U", "AD", "AH")) {
            if (-not $headers.Contains($required)) {
                throw "A coluna visível $required não foi encontrada nos cabeçalhos da Base Geral."
            }
        }

        $records = New-Object System.Collections.Generic.List[object]
        $headerRowNumber = [int]$headerRow.r
        foreach ($row in $rows) {
            if ($VisibleRowsOnly -and [string]$row.hidden -eq "1") { continue }
            if ([int]$row.r -le $headerRowNumber) { continue }
            $cellsByColumn = @{}
            foreach ($cell in @($row.c)) {
                $colLetters = Get-CellColumn ([string]$cell.r)
                if ($colLetters -eq "") { continue }
                $colIdx = Get-ColIndex $colLetters
                if ($hiddenColumns.ContainsKey($colIdx)) { continue }
                $cellsByColumn[$colLetters] = Get-CellValue $cell $shared
            }
            if (-not $cellsByColumn.ContainsKey("C")) { continue }
            $name = ConvertTo-PlainText $cellsByColumn["C"]
            if ($name -eq "") { continue }

            $record = [ordered]@{
                mes                  = ConvertFrom-ExcelDate $cellsByColumn["B"]
                nome                 = $name
                area                 = ConvertTo-PlainText $cellsByColumn["D"]
                empresa              = ConvertTo-PlainText $cellsByColumn["F"]
                praca                = ConvertTo-PlainText $cellsByColumn["G"]
                estado               = ConvertTo-PlainText $cellsByColumn["H"]
                regiao               = ConvertTo-PlainText $cellsByColumn["I"]
                inicioPlanejado      = ConvertFrom-ExcelDate $cellsByColumn["J"]
                terminoPlanejado     = ConvertFrom-ExcelDate $cellsByColumn["K"]
                terminoReal          = ConvertFrom-ExcelDate $cellsByColumn["L"]
                status               = ConvertTo-PlainText $cellsByColumn["M"]
                classificacao        = ConvertTo-PlainText $cellsByColumn["N"]
                colunaO              = ConvertTo-PlainText $cellsByColumn["O"]
                colunaU              = ConvertTo-PlainText $cellsByColumn["U"]
                salaTecnica          = ConvertTo-Number $cellsByColumn["AC"]
                valorNegociado       = ConvertTo-Number $cellsByColumn["AD"]
                aditivos             = ConvertTo-Number $cellsByColumn["AE"]
                alteracaoEscopo      = ConvertTo-Number $cellsByColumn["AF"]
                areaM2               = ConvertTo-Number $cellsByColumn["AH"]
                precoM2Planilha      = ConvertTo-Number $cellsByColumn["AM"]
            }
            if ($record.valorNegociado -eq $null) { $record.valorNegociado = 0.0 }
            if ($record.areaM2 -eq $null) { $record.areaM2 = 0.0 }
            if ($record.areaM2 -gt 0) {
                $record.precoM2Calculado = [double]$record.valorNegociado / [double]$record.areaM2
            } else {
                $record.precoM2Calculado = $null
            }
            [void]$records.Add([pscustomobject]$record)
        }

        $filtered = @($records | Where-Object {
            $_.mes -ne $null -and
            $_.mes -ge $Start.Date -and
            $_.mes -le $End.Date
        })

        $hiddenList = New-Object System.Collections.Generic.List[int]
        foreach ($key in $hiddenColumns.Keys) {
            [void]$hiddenList.Add([int]$key)
        }
        $hiddenArray = $hiddenList.ToArray()
        [Array]::Sort($hiddenArray)

        $result = New-Object psobject
        Add-Member -InputObject $result -MemberType NoteProperty -Name "headers" -Value $headers
        Add-Member -InputObject $result -MemberType NoteProperty -Name "hiddenColumns" -Value $hiddenArray
        Add-Member -InputObject $result -MemberType NoteProperty -Name "records" -Value $filtered
        return $result
    } finally {
        $zip.Dispose()
    }
}

function New-Summary {
    param([object[]]$Items)
    $itemsArray = @($Items)
    $area = ($itemsArray | Measure-Object -Property areaM2 -Sum).Sum
    $value = ($itemsArray | Measure-Object -Property valorNegociado -Sum).Sum
    if ($null -eq $area) { $area = 0.0 }
    if ($null -eq $value) { $value = 0.0 }
    $price = $null
    if ($area -gt 0) { $price = [double]$value / [double]$area }
    return [pscustomobject]@{
        obras = @($itemsArray).Count
        areaM2 = [double]$area
        valorNegociado = [double]$value
        precoM2 = $price
    }
}

function Group-Records {
    param(
        [object[]]$Items,
        [string]$Property,
        [int]$Top = 99
    )
    $groups = foreach ($g in @($Items | Group-Object -Property $Property)) {
        $summary = New-Summary @($g.Group)
        [pscustomobject]@{
            nome = if ([string]::IsNullOrWhiteSpace([string]$g.Name)) { "(sem informação)" } else { [string]$g.Name }
            obras = $summary.obras
            areaM2 = $summary.areaM2
            valorNegociado = $summary.valorNegociado
            precoM2 = $summary.precoM2
        }
    }
    return @($groups | Sort-Object -Property @{ Expression = "areaM2"; Descending = $true }, @{ Expression = "valorNegociado"; Descending = $true } | Select-Object -First $Top)
}

function Get-MonthSeries {
    param(
        [object[]]$Items,
        [datetime]$Start,
        [datetime]$End
    )
    $series = New-Object System.Collections.Generic.List[object]
    $cursor = Get-Date -Year $Start.Year -Month $Start.Month -Day 1
    $last = Get-Date -Year $End.Year -Month $End.Month -Day 1
    while ($cursor -le $last) {
        $monthItems = @($Items | Where-Object { $_.mes -ne $null -and $_.mes.Year -eq $cursor.Year -and $_.mes.Month -eq $cursor.Month })
        $summary = New-Summary $monthItems
        [void]$series.Add([pscustomobject]@{
            mes = $cursor.ToString("yyyy-MM")
            rotulo = $cursor.ToString("MMM/yy", [Globalization.CultureInfo]::GetCultureInfo("pt-BR"))
            ano = $cursor.Year
            obras = $summary.obras
            areaM2 = $summary.areaM2
            valorNegociado = $summary.valorNegociado
            precoM2 = $summary.precoM2
        })
        $cursor = $cursor.AddMonths(1)
    }
    return $series.ToArray()
}

function Get-TopWorks {
    param([object[]]$Items)
    $priced = @($Items | Where-Object { $_.areaM2 -gt 0 -and $_.valorNegociado -gt 0 })
    return [pscustomobject]@{
        maiorPrecoM2 = @($priced | Sort-Object -Property precoM2Calculado -Descending | Select-Object -First 12)
        maiorArea    = @($Items | Sort-Object -Property areaM2 -Descending | Select-Object -First 12)
        maiorValor   = @($Items | Sort-Object -Property valorNegociado -Descending | Select-Object -First 12)
    }
}

function Get-YearSummary {
    param([object[]]$Items)
    return @($Items | Group-Object { $_.mes.Year } | Sort-Object Name | ForEach-Object {
        $summary = New-Summary @($_.Group)
        [pscustomobject]@{
            ano = [int]$_.Name
            obras = $summary.obras
            areaM2 = $summary.areaM2
            valorNegociado = $summary.valorNegociado
            precoM2 = $summary.precoM2
        }
    })
}

function Get-Insights {
    param(
        [object]$Summary,
        [object[]]$ByClass,
        [object[]]$ByO,
        [object[]]$ByU,
        [object[]]$Monthly
    )
    $largestMonth = @($Monthly | Sort-Object -Property areaM2 -Descending | Select-Object -First 1)[0]
    $largestClass = @($ByClass | Sort-Object -Property areaM2 -Descending | Select-Object -First 1)[0]
    $highestClass = @($ByClass | Where-Object { $_.precoM2 -ne $null } | Sort-Object -Property precoM2 -Descending | Select-Object -First 1)[0]
    $largestO = @($ByO | Sort-Object -Property areaM2 -Descending | Select-Object -First 1)[0]
    $largestU = @($ByU | Sort-Object -Property areaM2 -Descending | Select-Object -First 1)[0]

    $insights = New-Object System.Collections.Generic.List[string]
    if ($largestMonth) {
        [void]$insights.Add(("Maior entrega mensal em área: {0}, com {1}." -f $largestMonth.rotulo, (Format-ShortArea $largestMonth.areaM2)))
    }
    if ($largestClass) {
        [void]$insights.Add(("Classificação com maior área construída: {0} ({1})." -f $largestClass.nome, (Format-ShortArea $largestClass.areaM2)))
    }
    if ($highestClass) {
        [void]$insights.Add(("Maior R$/m² por classificação: {0}, com {1}/m²." -f $highestClass.nome, (Format-Brl $highestClass.precoM2 0)))
    }
    if ($largestO) {
        [void]$insights.Add(("Nível de Obra mais representativo em área: {0}." -f $largestO.nome))
    }
    if ($largestU) {
        [void]$insights.Add(("Tipologia de Obras mais representativa em área: {0}." -f $largestU.nome))
    }
    [void]$insights.Add(("Área total analisada no período: {0}." -f (Format-ShortArea $Summary.areaM2)))
    return $insights.ToArray()
}

function New-HorizontalBarSvg {
    param(
        [object[]]$Groups,
        [string]$Title,
        [string]$Metric = "precoM2",
        [int]$Width = 1200,
        [int]$Height = 560
    )
    $items = @($Groups | Where-Object { $_.$Metric -ne $null } | Select-Object -First 8)
    if (@($items).Count -eq 0) { $items = @($Groups | Select-Object -First 8) }
    $max = 1.0
    foreach ($item in $items) {
        $value = [double]($item.$Metric)
        if ($value -gt $max) { $max = $value }
    }
    $left = 330
    $right = 80
    $top = 86
    $rowH = 52
    $barMax = $Width - $left - $right - 145
    $svg = New-Object System.Collections.Generic.List[string]
    [void]$svg.Add(("""<svg xmlns='http://www.w3.org/2000/svg' width='{0}' height='{1}' viewBox='0 0 {0} {1}'>""" -f $Width, $Height).Trim('"'))
    [void]$svg.Add("<rect width='100%' height='100%' fill='#FFFFFF'/>")
    [void]$svg.Add(("<text x='30' y='42' font-family='Aptos, Arial, sans-serif' font-size='26' font-weight='700' fill='#{0}'>{1}</text>" -f $Brand.Ink, (Escape-Xml $Title)))
    [void]$svg.Add(("<line x1='30' y1='62' x2='{0}' y2='62' stroke='#{1}' stroke-width='2'/>" -f ($Width - 30), $Brand.Line))
    $idx = 0
    foreach ($item in $items) {
        $y = $top + ($idx * $rowH)
        $value = [double]($item.$Metric)
        $w = [math]::Max(2, [math]::Round(($value / $max) * $barMax))
        $color = if ($idx % 3 -eq 0) { $Brand.Green } elseif ($idx % 3 -eq 1) { $Brand.Blue } else { $Brand.Orange }
        [void]$svg.Add(("<text x='30' y='{0}' font-family='Aptos, Arial, sans-serif' font-size='18' font-weight='600' fill='#{1}'>{2}</text>" -f ($y + 25), $Brand.Ink, (Escape-Xml $item.nome)))
        [void]$svg.Add(("<rect x='{0}' y='{1}' width='{2}' height='24' rx='5' fill='#{3}'/>" -f $left, ($y + 7), $w, $color))
        [void]$svg.Add(("<text x='{0}' y='{1}' font-family='Aptos, Arial, sans-serif' font-size='17' font-weight='700' fill='#{2}'>{3}</text>" -f ($left + $w + 14), ($y + 26), $Brand.Ink, (Escape-Xml (Format-Brl $value 0))))
        [void]$svg.Add(("<text x='{0}' y='{1}' font-family='Aptos, Arial, sans-serif' font-size='13' fill='#{2}'>{3} | {4}</text>" -f ($Width - 190), ($y + 26), $Brand.Muted, (Escape-Xml (Format-ShortArea $item.areaM2)), (Escape-Xml (Format-ShortBrl $item.valorNegociado))))
        $idx++
    }
    [void]$svg.Add("</svg>")
    return ($svg -join "`n")
}

function New-MonthlySvg {
    param(
        [object[]]$Monthly,
        [int]$Width = 1200,
        [int]$Height = 560
    )
    $left = 72
    $right = 72
    $top = 88
    $bottom = 88
    $plotW = $Width - $left - $right
    $plotH = $Height - $top - $bottom
    $maxArea = 1.0
    foreach ($m in $Monthly) {
        if ([double]$m.areaM2 -gt $maxArea) { $maxArea = [double]$m.areaM2 }
    }
    $count = @($Monthly).Count
    $step = if ($count -gt 1) { $plotW / ($count - 1) } else { $plotW }
    $barW = [math]::Max(14, [math]::Min(34, ($plotW / [math]::Max(1, $count)) * 0.55))
    $svg = New-Object System.Collections.Generic.List[string]
    [void]$svg.Add(("""<svg xmlns='http://www.w3.org/2000/svg' width='{0}' height='{1}' viewBox='0 0 {0} {1}'>""" -f $Width, $Height).Trim('"'))
    [void]$svg.Add("<rect width='100%' height='100%' fill='#FFFFFF'/>")
    [void]$svg.Add(("<text x='30' y='42' font-family='Aptos, Arial, sans-serif' font-size='26' font-weight='700' fill='#{0}'>Curva mensal de entregas</text>" -f $Brand.Ink))
    [void]$svg.Add(("<text x='30' y='67' font-family='Aptos, Arial, sans-serif' font-size='15' fill='#{0}'>Barras: m² construídos por mês, conforme coluna Mês</text>" -f $Brand.Muted))
    foreach ($g in 0..4) {
        $y = $top + ($plotH * $g / 4.0)
        [void]$svg.Add(("<line x1='{0}' y1='{1}' x2='{2}' y2='{1}' stroke='#{3}' stroke-width='1'/>" -f $left, (Format-SvgNum $y), ($Width - $right), $Brand.Line))
    }
    for ($i = 0; $i -lt $count; $i++) {
        $m = $Monthly[$i]
        $x = $left + ($step * $i)
        $barH = if ($maxArea -gt 0) { ([double]$m.areaM2 / $maxArea) * ($plotH * 0.92) } else { 0 }
        $barX = $x - ($barW / 2)
        $barY = $top + $plotH - $barH
        [void]$svg.Add(("<rect x='{0}' y='{1}' width='{2}' height='{3}' rx='4' fill='#{4}' opacity='0.82'><title>{5}: {6}, {7} obras</title></rect>" -f (Format-SvgNum $barX), (Format-SvgNum $barY), (Format-SvgNum $barW), (Format-SvgNum $barH), $Brand.Green, (Escape-Xml $m.rotulo), (Escape-Xml (Format-ShortArea $m.areaM2)), $m.obras))
        if ($i % 2 -eq 0 -or $i -eq ($count - 1)) {
            [void]$svg.Add(("<text x='{0}' y='{1}' text-anchor='middle' font-family='Aptos, Arial, sans-serif' font-size='12' fill='#{2}'>{3}</text>" -f (Format-SvgNum $x), ($Height - 34), $Brand.Muted, (Escape-Xml $m.rotulo)))
        }
    }
    [void]$svg.Add(("<text x='{0}' y='{1}' font-family='Aptos, Arial, sans-serif' font-size='13' fill='#{2}'>m²</text>" -f 28, ($top + 10), $Brand.Green))
    [void]$svg.Add("</svg>")
    return ($svg -join "`n")
}

function Build-DashboardHtml {
    param(
        [object]$Payload,
        [string]$LogoDataUri,
        [string]$OutputPath
    )
    $json = $Payload | ConvertTo-Json -Depth 12 -Compress
    $html = @'
<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Dashboard Obras 2025-2026 | Hapvida</title>
  <style>
    :root {
      --navy: #253F8E;
      --blue: #2F65B7;
      --primary: #253F8E;
      --accent-blue: #2F65B7;
      --orange: #F37021;
      --yellow: #FDB913;
      --ink: #15253F;
      --muted: #64748B;
      --line: #D8E0EA;
      --bg: #F5F8FB;
      --white: #FFFFFF;
      --shadow: 0 14px 36px rgba(21, 37, 63, .10);
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: Aptos, "Segoe UI", Arial, sans-serif;
      color: var(--ink);
      background: var(--bg);
      letter-spacing: 0;
    }
    button, input, select { font: inherit; }
    .shell { min-height: 100vh; }
    header {
      background: linear-gradient(135deg, var(--navy) 0%, #2F65B7 64%, #F37021 118%);
      color: var(--white);
      padding: 24px clamp(18px, 4vw, 46px) 22px;
    }
    .topbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 20px;
      margin-bottom: 18px;
    }
    .logo { height: 36px; max-width: 210px; object-fit: contain; }
    .date-pill {
      border: 1px solid rgba(255,255,255,.32);
      border-radius: 999px;
      padding: 8px 13px;
      font-size: 13px;
      color: rgba(255,255,255,.92);
      white-space: nowrap;
    }
    h1 {
      margin: 0;
      max-width: 920px;
      font-size: clamp(28px, 4vw, 46px);
      line-height: 1.06;
      font-weight: 800;
    }
    .subtitle {
      margin: 12px 0 0;
      max-width: 900px;
      color: rgba(255,255,255,.86);
      font-size: clamp(15px, 1.6vw, 20px);
      line-height: 1.45;
    }
    main { padding: 22px clamp(14px, 3vw, 34px) 42px; }
    .panel {
      background: var(--white);
      border: 1px solid var(--line);
      border-radius: 8px;
      box-shadow: var(--shadow);
    }
    .filters {
      padding: 16px;
      display: grid;
      gap: 12px;
      grid-template-columns: repeat(7, minmax(130px, 1fr));
      align-items: end;
      position: sticky;
      top: 0;
      z-index: 5;
    }
    label { display: grid; gap: 6px; font-size: 12px; color: var(--muted); font-weight: 700; }
    select, input {
      width: 100%;
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 10px 11px;
      color: var(--ink);
      background: #fff;
      min-width: 0;
    }
    .segmented { display: flex; border: 1px solid var(--line); border-radius: 8px; overflow: hidden; background: #fff; }
    .segmented button {
      flex: 1;
      border: 0;
      border-right: 1px solid var(--line);
      background: #fff;
      color: var(--ink);
      padding: 10px 8px;
      cursor: pointer;
      font-weight: 700;
    }
    .segmented button:last-child { border-right: 0; }
    .segmented button.active { background: var(--navy); color: #fff; }
    .icon-button, .primary-button {
      height: 40px;
      border-radius: 8px;
      border: 1px solid var(--line);
      cursor: pointer;
      background: #fff;
      color: var(--ink);
      font-weight: 800;
    }
    .primary-button { background: var(--navy); color: #fff; border-color: var(--navy); }
    .kpis {
      display: grid;
      grid-template-columns: repeat(4, minmax(160px, 1fr));
      gap: 14px;
      margin: 18px 0;
    }
    .kpi {
      padding: 16px;
      min-height: 122px;
      display: grid;
      align-content: space-between;
      cursor: pointer;
    }
    .kpi span { color: var(--muted); font-size: 13px; font-weight: 800; }
    .kpi strong {
      display: block;
      margin-top: 8px;
      font-size: clamp(22px, 2.4vw, 32px);
      line-height: 1.08;
      overflow-wrap: anywhere;
    }
    .kpi small { color: var(--muted); font-size: 12px; }
    .grid {
      display: grid;
      grid-template-columns: minmax(0, 1.4fr) minmax(320px, .8fr);
      gap: 16px;
      margin-bottom: 16px;
    }
    .section-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 14px;
      padding: 15px 16px 0;
    }
    h2 { font-size: 18px; margin: 0; }
    .tabs { display: flex; gap: 6px; flex-wrap: wrap; }
    .tabs button {
      border: 1px solid var(--line);
      background: #fff;
      border-radius: 999px;
      padding: 7px 11px;
      cursor: pointer;
      font-size: 12px;
      font-weight: 800;
      color: var(--ink);
    }
    .tabs button.active { background: var(--orange); border-color: var(--orange); color: #fff; }
    .chart { padding: 14px 16px 18px; min-height: 220px; }
    svg { max-width: 100%; display: block; }
    .metric-list, .month-list { display: grid; gap: 10px; }
    .metric-row, .month-row {
      display: grid;
      align-items: center;
      gap: 12px;
      min-height: 44px;
      padding: 8px 10px;
      border-radius: 8px;
      cursor: pointer;
    }
    .metric-row { grid-template-columns: minmax(210px, 30%) minmax(180px, 1fr) minmax(96px, .18fr) minmax(96px, .18fr); }
    .month-row { grid-template-columns: 74px minmax(180px, 1fr) 110px 130px 70px; }
    .metric-row:hover, .month-row:hover { background: #F7FAFF; }
    .metric-label, .month-label {
      color: var(--ink);
      font-weight: 750;
      line-height: 1.22;
      overflow-wrap: anywhere;
    }
    .metric-track, .month-track {
      height: 22px;
      border-radius: 999px;
      background: #EEF3FA;
      overflow: hidden;
      border: 1px solid #DCE6F2;
    }
    .metric-fill, .month-fill {
      height: 100%;
      min-width: 4px;
      border-radius: inherit;
      background: var(--blue);
    }
    .metric-value, .month-value, .metric-area, .month-area, .month-count {
      color: var(--ink);
      font-weight: 800;
      white-space: nowrap;
      text-align: right;
    }
    .metric-area, .month-area, .month-count { color: var(--muted); font-weight: 700; }
    .tables {
      display: grid;
      grid-template-columns: minmax(0, .95fr) minmax(0, 1.05fr);
      gap: 16px;
    }
    table { width: 100%; border-collapse: collapse; table-layout: fixed; }
    th, td {
      padding: 10px 11px;
      border-bottom: 1px solid var(--line);
      text-align: left;
      vertical-align: top;
      font-size: 13px;
      overflow-wrap: anywhere;
    }
    th {
      color: var(--muted);
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0;
      cursor: pointer;
      background: #FAFCFE;
      position: sticky;
      top: 0;
      z-index: 1;
    }
    td.num, th.num { text-align: right; }
    .table-wrap { max-height: 430px; overflow: auto; padding: 0 0 4px; }
    .insights { padding: 16px; display: grid; gap: 10px; }
    .insight {
      border-left: 4px solid var(--orange);
      background: #FFF7F1;
      padding: 10px 12px;
      border-radius: 0 8px 8px 0;
      line-height: 1.35;
      font-size: 14px;
    }
    .chips { display: flex; gap: 8px; flex-wrap: wrap; padding: 0 16px 14px; }
    .chip {
      border: 1px solid var(--line);
      background: #fff;
      border-radius: 999px;
      padding: 7px 10px;
      font-size: 12px;
      font-weight: 800;
      color: var(--muted);
    }
    .empty { color: var(--muted); padding: 20px; text-align: center; }
    @media (max-width: 1120px) {
      .filters { grid-template-columns: repeat(3, minmax(140px, 1fr)); }
      .grid, .tables { grid-template-columns: 1fr; }
    }
    @media (max-width: 720px) {
      header { padding-top: 18px; }
      .topbar { align-items: flex-start; flex-direction: column; }
      .filters { grid-template-columns: 1fr; position: static; }
      .kpis { grid-template-columns: 1fr 1fr; }
      .section-head { align-items: flex-start; flex-direction: column; }
      th, td { font-size: 12px; padding: 9px 8px; }
      .metric-row, .month-row { grid-template-columns: 1fr; gap: 7px; }
      .metric-value, .month-value, .metric-area, .month-area, .month-count { text-align: left; }
    }
    @media (max-width: 460px) {
      .kpis { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <div class="shell">
    <header>
      <div class="topbar">
        <img class="logo" alt="Hapvida" src="__LOGO_DATA_URI__">
        <div class="date-pill">Base Geral | até __END_DATE_DISPLAY__</div>
      </div>
      <h1>Obras 2025-2026: construção por m²</h1>
      <p class="subtitle">Análise das obras com Mês em 2025 e 2026, com status transparente, curva mensal, área total e cortes por Tipologia de Obras, classificação, nível de obra, estado e região.</p>
    </header>
    <main>
      <section class="panel filters" aria-label="Filtros">
        <label>Ano
          <div class="segmented" id="yearButtons">
            <button type="button" data-year="" class="active">Todos</button>
            <button type="button" data-year="2025">2025</button>
            <button type="button" data-year="2026">2026</button>
          </div>
        </label>
        <label>Status<select id="statusFilter"></select></label>
        <label>Classificação de Obra<select id="classificationFilter"></select></label>
        <label>Nível de Obra<select id="colOFilter"></select></label>
        <label>Tipologia de Obras<select id="colUFilter"></select></label>
        <label>Busca<input id="searchFilter" type="search" placeholder="Obra, praça, estado"></label>
        <button class="icon-button" id="resetButton" type="button">Limpar</button>
      </section>
      <section class="kpis" id="kpis"></section>
      <div class="chips" id="activeChips"></div>
      <section class="grid">
        <div class="panel">
          <div class="section-head">
            <h2>Curva mensal</h2>
          </div>
          <div class="chart" id="monthlyChart"></div>
        </div>
        <div class="panel">
          <div class="section-head">
            <h2>Leituras principais</h2>
          </div>
          <div class="insights" id="insights"></div>
        </div>
      </section>
      <section class="panel" style="margin-bottom:16px">
        <div class="section-head">
          <h2>R$/m² por grupo</h2>
          <div class="tabs" id="categoryTabs">
            <button type="button" data-view="colunaU" class="active">Tipologia de Obras</button>
            <button type="button" data-view="classificacao">Classificação de Obra</button>
            <button type="button" data-view="colunaO">Nível de Obra</button>
            <button type="button" data-view="estado">Estado</button>
            <button type="button" data-view="regiao">Região</button>
          </div>
        </div>
        <div class="chart" id="categoryChart"></div>
      </section>
      <section class="tables">
        <div class="panel">
          <div class="section-head"><h2>Resumo do corte ativo</h2></div>
          <div class="table-wrap"><table id="summaryTable"></table></div>
        </div>
        <div class="panel">
          <div class="section-head">
            <h2>Detalhe das obras</h2>
            <button class="primary-button" id="csvButton" type="button">CSV</button>
          </div>
          <div class="table-wrap"><table id="detailTable"></table></div>
        </div>
      </section>
    </main>
  </div>
  <script>
    const REPORT_DATA = __REPORT_JSON__;
    const state = { year: '', month: '', status: '', classificacao: '', colunaO: '', colunaU: '', estado: '', regiao: '', search: '', view: 'colunaU', sort: { key: 'mes', dir: 'desc' } };
    const fmtBRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
    const fmtBRL1 = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 1 });
    const fmtNum = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 });
    const fmtM2 = v => `${fmtNum.format(v || 0)} m²`;
    const norm = value => String(value || '').normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
    const safe = value => String(value ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
    const price = rows => {
      const area = rows.reduce((s, r) => s + (+r.areaM2 || 0), 0);
      const value = rows.reduce((s, r) => s + (+r.valorNegociado || 0), 0);
      return area > 0 ? value / area : null;
    };
    const summarize = rows => {
      const area = rows.reduce((s, r) => s + (+r.areaM2 || 0), 0);
      const value = rows.reduce((s, r) => s + (+r.valorNegociado || 0), 0);
      return { obras: rows.length, areaM2: area, valorNegociado: value, precoM2: area > 0 ? value / area : null };
    };
    const unique = key => [...new Set(REPORT_DATA.records.map(r => r[key]).filter(Boolean))].sort((a,b) => a.localeCompare(b, 'pt-BR'));
    function fillSelect(id, key) {
      const select = document.getElementById(id);
      select.innerHTML = `<option value="">Todos</option>` + unique(key).map(v => `<option value="${safe(v)}">${safe(v)}</option>`).join('');
      select.addEventListener('change', () => { state[key] = select.value; render(); });
    }
    fillSelect('statusFilter', 'status');
    fillSelect('classificationFilter', 'classificacao');
    fillSelect('colOFilter', 'colunaO');
    fillSelect('colUFilter', 'colunaU');
    document.querySelectorAll('#yearButtons button').forEach(btn => btn.addEventListener('click', () => {
      state.year = btn.dataset.year;
      document.querySelectorAll('#yearButtons button').forEach(b => b.classList.toggle('active', b === btn));
      render();
    }));
    document.getElementById('searchFilter').addEventListener('input', event => { state.search = event.target.value; render(); });
    document.getElementById('resetButton').addEventListener('click', () => {
      Object.assign(state, { year: '', month: '', status: '', classificacao: '', colunaO: '', colunaU: '', estado: '', regiao: '', search: '', view: state.view });
      document.querySelector('#yearButtons button[data-year=""]').click();
      for (const id of ['statusFilter','classificationFilter','colOFilter','colUFilter']) document.getElementById(id).value = '';
      document.getElementById('searchFilter').value = '';
      render();
    });
    document.querySelectorAll('#categoryTabs button').forEach(btn => btn.addEventListener('click', () => {
      state.view = btn.dataset.view;
      document.querySelectorAll('#categoryTabs button').forEach(b => b.classList.toggle('active', b === btn));
      render();
    }));
    function filteredRows() {
      return REPORT_DATA.records.filter(r => {
        if (state.year && !String(r.mes || '').startsWith(state.year)) return false;
        if (state.month && !String(r.mes || '').startsWith(state.month)) return false;
        if (state.status && r.status !== state.status) return false;
        if (state.classificacao && r.classificacao !== state.classificacao) return false;
        if (state.colunaO && r.colunaO !== state.colunaO) return false;
        if (state.colunaU && r.colunaU !== state.colunaU) return false;
        if (state.estado && r.estado !== state.estado) return false;
        if (state.regiao && r.regiao !== state.regiao) return false;
        if (state.search) {
          const hay = norm([r.nome, r.praca, r.estado, r.regiao, r.empresa].join(' '));
          if (!hay.includes(norm(state.search))) return false;
        }
        return true;
      });
    }
    function groupBy(rows, key) {
      const map = new Map();
      for (const row of rows) {
        const name = row[key] || '(sem informação)';
        if (!map.has(name)) map.set(name, []);
        map.get(name).push(row);
      }
      return [...map.entries()].map(([nome, group]) => ({ nome, ...summarize(group) }))
        .sort((a,b) => (b.areaM2 - a.areaM2) || (b.valorNegociado - a.valorNegociado));
    }
    function monthRows(rows) {
      const base = new Map(REPORT_DATA.monthly.map(m => [m.mes, { ...m, obras: 0, areaM2: 0, valorNegociado: 0, precoM2: null }]));
      for (const row of rows) {
        const month = String(row.mes || '').slice(0, 7);
        if (!base.has(month)) continue;
        const m = base.get(month);
        m.obras += 1;
        m.areaM2 += +row.areaM2 || 0;
        m.valorNegociado += +row.valorNegociado || 0;
      }
      return [...base.values()].map(m => ({ ...m, precoM2: m.areaM2 > 0 ? m.valorNegociado / m.areaM2 : null }));
    }
    function renderKpis(summary, rows) {
      const kpis = [
        ['Obras no período', fmtNum.format(summary.obras), 'Filtro de Mês e Status'],
        ['Área construída', fmtM2(summary.areaM2), 'Soma de Área (m²)'],
        ['Valor negociado', fmtBRL.format(summary.valorNegociado), 'Soma de Valor Negociado'],
        ['Custo por m²', summary.precoM2 ? `${fmtBRL.format(summary.precoM2)}/m²` : '-', 'Valor negociado ÷ área do filtro']
      ];
      document.getElementById('kpis').innerHTML = kpis.map(k => `<button class="panel kpi" type="button"><span>${k[0]}</span><strong>${k[1]}</strong><small>${k[2]}</small></button>`).join('');
    }
    function renderChips() {
      const chips = [];
      if (state.year) chips.push(`Ano: ${state.year}`);
      if (state.month) chips.push(`Mês: ${state.month}`);
      if (state.status) chips.push(`Status: ${state.status}`);
      if (state.classificacao) chips.push(`Classificação: ${state.classificacao}`);
      if (state.colunaO) chips.push(`Nível de Obra: ${state.colunaO}`);
      if (state.colunaU) chips.push(`Tipologia de Obras: ${state.colunaU}`);
      if (state.estado) chips.push(`Estado: ${state.estado}`);
      if (state.regiao) chips.push(`Região: ${state.regiao}`);
      if (state.search) chips.push(`Busca: ${state.search}`);
      document.getElementById('activeChips').innerHTML = chips.map(c => `<span class="chip">${safe(c)}</span>`).join('');
    }
    function renderMonthly(rows) {
      const months = monthRows(rows).filter(m => m.obras || m.areaM2 || m.valorNegociado);
      if (!months.length) { document.getElementById('monthlyChart').innerHTML = '<div class="empty">Sem dados para o filtro selecionado.</div>'; return; }
      const maxArea = Math.max(1, ...months.map(m => m.areaM2));
      document.getElementById('monthlyChart').innerHTML = `<div class="month-list">${months.map((m, i) => {
        const pct = Math.max(2, (m.areaM2 / maxArea) * 100);
        const color = i % 3 === 0 ? '#253F8E' : i % 3 === 1 ? '#2F65B7' : '#F37021';
        return `<div class="month-row" data-month="${safe(m.mes)}">
          <div class="month-label">${safe(m.rotulo)}</div>
          <div class="month-track"><div class="month-fill" style="width:${pct}%;background:${color}"></div></div>
          <div class="month-area">${fmtM2(m.areaM2)}</div>
          <div class="month-value">${fmtBRL.format(m.valorNegociado)}</div>
          <div class="month-count">${fmtNum.format(m.obras)} obras</div>
        </div>`;
      }).join('')}</div>`;
      document.querySelectorAll('.month-row').forEach(el => el.addEventListener('click', () => { state.month = state.month === el.dataset.month ? '' : el.dataset.month; render(); }));
    }
    function renderCategory(rows) {
      const key = state.view;
      const groups = groupBy(rows, key).filter(g => g.precoM2).sort((a,b) => b.precoM2 - a.precoM2).slice(0, 12);
      if (!groups.length) { document.getElementById('categoryChart').innerHTML = '<div class="empty">Sem dados para o corte selecionado.</div>'; return; }
      const max = Math.max(...groups.map(g => g.precoM2 || 0), 1);
      document.getElementById('categoryChart').innerHTML = `<div class="metric-list">${groups.map((g, i) => {
        const pct = Math.max(2, (g.precoM2 / max) * 100);
        const color = i % 3 === 0 ? '#253F8E' : i % 3 === 1 ? '#2F65B7' : '#F37021';
        return `<div class="metric-row" data-key="${key}" data-value="${safe(g.nome)}">
          <div class="metric-label">${safe(g.nome)}</div>
          <div class="metric-track"><div class="metric-fill" style="width:${pct}%;background:${color}"></div></div>
          <div class="metric-value">${fmtBRL.format(g.precoM2)}/m²</div>
          <div class="metric-area">${fmtM2(g.areaM2)}</div>
        </div>`;
      }).join('')}</div>`;
      document.querySelectorAll('.metric-row').forEach(el => el.addEventListener('click', () => {
        const key = el.dataset.key;
        state[key] = state[key] === el.dataset.value ? '' : el.dataset.value;
        if (key === 'classificacao') document.getElementById('classificationFilter').value = state[key];
        if (key === 'colunaO') document.getElementById('colOFilter').value = state[key];
        if (key === 'colunaU') document.getElementById('colUFilter').value = state[key];
        render();
      }));
    }
    function renderInsights(rows, summary) {
      const byClass = groupBy(rows, 'classificacao');
      const byO = groupBy(rows, 'colunaO');
      const byU = groupBy(rows, 'colunaU');
      const byEstado = groupBy(rows, 'estado');
      const byRegiao = groupBy(rows, 'regiao');
      const topMonth = monthRows(rows).sort((a,b) => b.areaM2 - a.areaM2)[0];
      const topClass = byClass[0];
      const highPrice = [...byClass].filter(g => g.precoM2).sort((a,b) => b.precoM2 - a.precoM2)[0];
      const insights = [
        topMonth && `Maior mês em área: ${topMonth.rotulo}, ${fmtM2(topMonth.areaM2)}.`,
        topClass && `Classificação com maior área: ${topClass.nome}, ${fmtM2(topClass.areaM2)}.`,
        highPrice && `Maior R$/m² em classificação: ${highPrice.nome}, ${fmtBRL.format(highPrice.precoM2)}/m².`,
        byU[0] && `Tipologia de Obras dominante em área: ${byU[0].nome}.`,
        byO[0] && `Nível de Obra dominante em área: ${byO[0].nome}.`,
        byRegiao[0] && `Região com maior área: ${byRegiao[0].nome}.`,
        byEstado[0] && `Estado com maior valor negociado: ${[...byEstado].sort((a,b)=>b.valorNegociado-a.valorNegociado)[0].nome}.`
      ].filter(Boolean);
      document.getElementById('insights').innerHTML = insights.map(i => `<div class="insight">${safe(i)}</div>`).join('');
    }
    function renderSummaryTable(rows) {
      const key = state.view;
      const groups = groupBy(rows, key).filter(g => g.precoM2).sort((a,b) => b.precoM2 - a.precoM2).slice(0, 50);
      const labels = { classificacao: 'Classificação de Obra', colunaO: 'Nível de Obra', colunaU: 'Tipologia de Obras', estado: 'Estado', regiao: 'Região' };
      document.getElementById('summaryTable').innerHTML = `<thead><tr><th>${labels[state.view] || 'Grupo'}</th><th class="num">Obras</th><th class="num">m²</th><th class="num">Valor</th><th class="num">R$/m² do grupo</th></tr></thead><tbody>${groups.map(g => `<tr><td>${safe(g.nome)}</td><td class="num">${fmtNum.format(g.obras)}</td><td class="num">${fmtM2(g.areaM2)}</td><td class="num">${fmtBRL.format(g.valorNegociado)}</td><td class="num">${g.precoM2 ? fmtBRL.format(g.precoM2) : '-'}</td></tr>`).join('')}</tbody>`;
    }
    function renderDetailTable(rows) {
      const sorted = [...rows].sort((a,b) => {
        const dir = state.sort.dir === 'asc' ? 1 : -1;
        const av = a[state.sort.key] ?? '';
        const bv = b[state.sort.key] ?? '';
        return String(av).localeCompare(String(bv), 'pt-BR', { numeric: true }) * dir;
      });
      const headers = [
        ['mes','Mês'], ['status','Status'], ['nome','Obra'], ['estado','Estado'], ['regiao','Região'], ['classificacao','Classificação de Obra'], ['colunaO','Nível de Obra'], ['colunaU','Tipologia de Obras'], ['areaM2','m²'], ['valorNegociado','Valor'], ['precoM2Calculado','R$/m² da obra']
      ];
      document.getElementById('detailTable').innerHTML = `<thead><tr>${headers.map(([k,h]) => `<th data-sort="${k}" class="${['areaM2','valorNegociado','precoM2Calculado'].includes(k) ? 'num' : ''}">${h}</th>`).join('')}</tr></thead><tbody>${sorted.map(r => `<tr><td>${safe((r.mes || '').slice(0,10).split('-').reverse().join('/'))}</td><td>${safe(r.status)}</td><td>${safe(r.nome)}</td><td>${safe(r.estado)}</td><td>${safe(r.regiao)}</td><td>${safe(r.classificacao)}</td><td>${safe(r.colunaO)}</td><td>${safe(r.colunaU)}</td><td class="num">${fmtM2(r.areaM2)}</td><td class="num">${fmtBRL.format(r.valorNegociado || 0)}</td><td class="num">${r.precoM2Calculado ? fmtBRL.format(r.precoM2Calculado) : '-'}</td></tr>`).join('')}</tbody>`;
      document.querySelectorAll('#detailTable th[data-sort]').forEach(th => th.addEventListener('click', () => {
        const key = th.dataset.sort;
        state.sort = { key, dir: state.sort.key === key && state.sort.dir === 'desc' ? 'asc' : 'desc' };
        render();
      }));
    }
    document.getElementById('csvButton').addEventListener('click', () => {
      const rows = filteredRows();
      const columns = ['mes','status','nome','empresa','praca','estado','regiao','classificacao','colunaO','colunaU','areaM2','valorNegociado','precoM2Calculado'];
      const csv = [columns.join(';')].concat(rows.map(r => columns.map(c => `"${String(r[c] ?? '').replace(/"/g, '""')}"`).join(';'))).join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'obras_2025_2026_filtrado.csv';
      a.click();
      URL.revokeObjectURL(a.href);
    });
    function render() {
      const rows = filteredRows();
      const summary = summarize(rows);
      renderKpis(summary, rows);
      renderChips();
      renderMonthly(rows);
      renderCategory(rows);
      renderInsights(rows, summary);
      renderSummaryTable(rows);
      renderDetailTable(rows);
    }
    render();
  </script>
</body>
</html>
'@
    $html = $html.Replace("__LOGO_DATA_URI__", $LogoDataUri).Replace("__END_DATE_DISPLAY__", $Payload.meta.endDateDisplay).Replace("__REPORT_JSON__", $json)
    Write-Utf8NoBom -Path $OutputPath -Value $html
}

function New-PptShapeText {
    param(
        [int]$Id,
        [double]$X,
        [double]$Y,
        [double]$W,
        [double]$H,
        [string]$Text,
        [int]$FontSize = 18,
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
    $sz = $FontSize * 100
    $boldAttr = if ($Bold) { ' b="1"' } else { "" }
    $fillXml = if ($Fill -ne "") { "<a:solidFill><a:srgbClr val='$Fill'/></a:solidFill>" } else { "<a:noFill/>" }
    $lineXml = if ($Line -ne "") { "<a:ln w='6350'><a:solidFill><a:srgbClr val='$Line'/></a:solidFill></a:ln>" } else { "<a:ln><a:noFill/></a:ln>" }
    $geom = if ($Radius -gt 0) { "roundRect" } else { "rect" }
    $paragraphs = (ConvertTo-PlainText $Text).Split("`n") | ForEach-Object {
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
  <p:txBody><a:bodyPr wrap="square" lIns="91440" tIns="45720" rIns="91440" bIns="45720"/><a:lstStyle/>$($paragraphs -join "")</p:txBody>
</p:sp>
"@
}

function New-PptRect {
    param(
        [int]$Id,
        [double]$X,
        [double]$Y,
        [double]$W,
        [double]$H,
        [string]$Fill,
        [string]$Line = "",
        [int]$Alpha = 100000
    )
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
    param(
        [int]$Id,
        [double]$X,
        [double]$Y,
        [double]$W,
        [double]$H,
        [string]$RelId,
        [string]$Name = "Picture"
    )
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

function New-PptTableShapes {
    param(
        [object[]]$Rows,
        [double]$X,
        [double]$Y,
        [double[]]$Widths,
        [string[]]$Headers,
        [scriptblock[]]$ValueBlocks,
        [int]$StartId,
        [int]$MaxRows = 6
    )
    $shapes = New-Object System.Collections.Generic.List[string]
    $rowH = 0.34
    $id = $StartId
    $xCursor = $X
    for ($c = 0; $c -lt $Headers.Count; $c++) {
        [void]$shapes.Add((New-PptShapeText -Id $id -X $xCursor -Y $Y -W $Widths[$c] -H $rowH -Text $Headers[$c] -FontSize 8 -Color $Brand.White -Bold $true -Fill $Brand.Navy))
        $id++
        $xCursor += $Widths[$c]
    }
    $rowsToShow = @($Rows | Select-Object -First $MaxRows)
    for ($r = 0; $r -lt $rowsToShow.Count; $r++) {
        $row = $rowsToShow[$r]
        $xCursor = $X
        $fill = if ($r % 2 -eq 0) { "FFFFFF" } else { "F5F8FB" }
        for ($c = 0; $c -lt $Headers.Count; $c++) {
            $text = & $ValueBlocks[$c] $row
            $align = if ($c -eq 0) { "l" } else { "r" }
            [void]$shapes.Add((New-PptShapeText -Id $id -X $xCursor -Y ($Y + $rowH + ($r * $rowH)) -W $Widths[$c] -H $rowH -Text $text -FontSize 8 -Color $Brand.Ink -Align $align -Fill $fill -Line $Brand.Line))
            $id++
            $xCursor += $Widths[$c]
        }
    }
    return ,([string[]]$shapes.ToArray())
}

function New-PptBarListShapes {
    param(
        [object[]]$Rows,
        [double]$X,
        [double]$Y,
        [double]$W,
        [double]$RowH,
        [string]$Metric = "valorNegociado",
        [int]$StartId,
        [int]$MaxRows = 7,
        [string]$Color = ""
    )
    $items = @($Rows | Where-Object { $_.$Metric -ne $null } | Select-Object -First $MaxRows)
    $max = 1.0
    foreach ($item in $items) {
        $value = [double]($item.$Metric)
        if ($value -gt $max) { $max = $value }
    }
    $shapes = New-Object System.Collections.Generic.List[string]
    $id = $StartId
    $labelW = $W * 0.34
    $barX = $X + $labelW + 0.1
    $barW = $W * 0.38
    $valueX = $barX + $barW + 0.14
    for ($i = 0; $i -lt $items.Count; $i++) {
        $row = $items[$i]
        $yRow = $Y + ($i * $RowH)
        $value = [double]$row.$Metric
        $label = ""
        if ($row.PSObject.Properties["nome"]) {
            $label = [string]$row.nome
        } elseif ($row.PSObject.Properties["rotulo"]) {
            $label = [string]$row.rotulo
        }
        $wBar = if ($max -gt 0) { [math]::Max(0.08, ($value / $max) * $barW) } else { 0.08 }
        $fill = if ($Color -ne "") { $Color } elseif ($i % 3 -eq 0) { $Brand.Navy } elseif ($i % 3 -eq 1) { $Brand.Blue } else { $Brand.Orange }
        $metricText = if ($Metric -eq "areaM2") { Format-ShortArea $value } elseif ($Metric -eq "precoM2") { Format-Brl $value 0 } else { Format-ShortBrl $value }
        [void]$shapes.Add((New-PptShapeText -Id $id -X $X -Y $yRow -W $labelW -H ($RowH - 0.04) -Text $label -FontSize 8 -Color $Brand.Ink -Bold $true))
        $id++
        [void]$shapes.Add((New-PptRect -Id $id -X $barX -Y ($yRow + 0.08) -W $wBar -H 0.16 -Fill $fill))
        $id++
        [void]$shapes.Add((New-PptShapeText -Id $id -X $valueX -Y $yRow -W ($W - ($valueX - $X)) -H ($RowH - 0.04) -Text ("{0} | {1} obras" -f $metricText, $row.obras) -FontSize 8 -Color $Brand.Muted))
        $id++
    }
    return ,([string[]]$shapes.ToArray())
}

function Add-HeaderFooter {
    param(
        [System.Collections.Generic.List[string]]$Shapes,
        [string]$Title,
        [int]$SlideNumber
    )
    [void]$Shapes.Add((New-PptRect -Id 900 -X 0 -Y 0 -W 13.333 -H 0.53 -Fill $Brand.Navy))
    [void]$Shapes.Add((New-PptPicture -Id 901 -X 0.36 -Y 0.13 -W 1.35 -H 0.25 -RelId "rIdLogo" -Name "Hapvida"))
    [void]$Shapes.Add((New-PptShapeText -Id 902 -X 1.86 -Y 0.08 -W 7.6 -H 0.35 -Text $Title -FontSize 11 -Color $Brand.White -Bold $true))
    [void]$Shapes.Add((New-PptShapeText -Id 903 -X 11.96 -Y 7.08 -W 0.7 -H 0.25 -Text ([string]$SlideNumber) -FontSize 8 -Color $Brand.Muted -Align "r"))
}

function Build-Presentation {
    param(
        [string]$Template,
        [string]$OutputPath,
        [object]$Payload,
        [object[]]$Records,
        [string]$MonthlySvg,
        [string]$ClassSvg,
        [string]$ColOSvg,
        [string]$ColUSvg
    )
    $outputFull = Resolve-FullPath $OutputPath
    $outDir = Split-Path -Parent $outputFull
    $tempRoot = Join-Path $outDir "pptx_build"
    $workspaceRoot = Resolve-FullPath "."
    $tempFull = [System.IO.Path]::GetFullPath($tempRoot)
    if (-not $tempFull.StartsWith($workspaceRoot, [StringComparison]::OrdinalIgnoreCase)) {
        throw "Pasta temporária fora do workspace: $tempFull"
    }
    if (Test-Path -LiteralPath $tempFull) {
        Remove-Item -LiteralPath $tempFull -Recurse -Force
    }
    [System.IO.Compression.ZipFile]::ExtractToDirectory((Resolve-FullPath $Template), $tempFull)

    $slidesDir = Join-Path $tempFull "ppt\slides"
    $slideRelsDir = Join-Path $slidesDir "_rels"
    if (Test-Path -LiteralPath $slidesDir) {
        Get-ChildItem -LiteralPath $slidesDir -Filter "slide*.xml" | Remove-Item -Force
    }
    if (Test-Path -LiteralPath $slideRelsDir) {
        Get-ChildItem -LiteralPath $slideRelsDir -Filter "slide*.xml.rels" | Remove-Item -Force
    } else {
        New-Item -ItemType Directory -Force -Path $slideRelsDir | Out-Null
    }

    $mediaDir = Join-Path $tempFull "ppt\media"
    Write-Utf8NoBom -Path (Join-Path $mediaDir "chart_monthly.svg") -Value $MonthlySvg
    Write-Utf8NoBom -Path (Join-Path $mediaDir "chart_class.svg") -Value $ClassSvg
    Write-Utf8NoBom -Path (Join-Path $mediaDir "chart_colo.svg") -Value $ColOSvg
    Write-Utf8NoBom -Path (Join-Path $mediaDir "chart_colu.svg") -Value $ColUSvg

    $summary = $Payload.summary
    $yearRows = @($Payload.yearSummary)
    $insights = @($Payload.insights)
    $byClass = @($Payload.byClass)
    $byO = @($Payload.byO)
    $byU = @($Payload.byU)
    $byEstado = @($Payload.byEstado)
    $byRegiao = @($Payload.byRegiao)
    $byStatus = @($Payload.byStatus)
    $topPrice = @($Payload.topWorks.maiorPrecoM2)
    $topArea = @($Payload.topWorks.maiorArea)

    $slides = New-Object System.Collections.Generic.List[object]

    $shapes = New-Object System.Collections.Generic.List[string]
    [void]$shapes.Add((New-PptPicture -Id 10 -X 0 -Y 0 -W 13.333 -H 7.5 -RelId "rIdCover" -Name "Capa"))
    [void]$shapes.Add((New-PptRect -Id 11 -X 0 -Y 0 -W 13.333 -H 7.5 -Fill "0B1F49" -Alpha 46000))
    [void]$shapes.Add((New-PptPicture -Id 12 -X 0.72 -Y 0.56 -W 1.9 -H 0.35 -RelId "rIdLogo" -Name "Hapvida"))
    [void]$shapes.Add((New-PptShapeText -Id 13 -X 0.72 -Y 2.28 -W 8.5 -H 1.3 -Text "Obras 2025-2026`nTipologia e construção por m²" -FontSize 32 -Color $Brand.White -Bold $true))
    [void]$shapes.Add((New-PptShapeText -Id 14 -X 0.75 -Y 3.72 -W 8.2 -H 0.55 -Text ("2025 e 2026 até {0} | Base Geral" -f $Payload.meta.endDateDisplay) -FontSize 17 -Color $Brand.White))
    [void]$shapes.Add((New-PptShapeText -Id 15 -X 0.75 -Y 5.33 -W 2.55 -H 0.76 -Text ((Format-ShortArea $summary.areaM2) + "`nconstruídos") -FontSize 16 -Color $Brand.White -Bold $true -Fill $Brand.Green -Radius 1))
    [void]$shapes.Add((New-PptShapeText -Id 16 -X 3.48 -Y 5.33 -W 2.55 -H 0.76 -Text ((Format-ShortBrl $summary.valorNegociado) + "`nnegociados") -FontSize 16 -Color $Brand.White -Bold $true -Fill $Brand.Blue -Radius 1))
    [void]$shapes.Add((New-PptShapeText -Id 17 -X 6.21 -Y 5.33 -W 2.95 -H 0.76 -Text (($byU[0].nome) + "`ntipologia líder") -FontSize 12 -Color $Brand.White -Bold $true -Fill $Brand.Orange -Radius 1))
    [void]$slides.Add([pscustomobject]@{ Shapes = $shapes.ToArray(); Rels = @("<Relationship Id='rIdCover' Type='http://schemas.openxmlformats.org/officeDocument/2006/relationships/image' Target='../media/image1.jpeg'/>", "<Relationship Id='rIdLogo' Type='http://schemas.openxmlformats.org/officeDocument/2006/relationships/image' Target='../media/image4.png'/>") })

    $shapes = New-Object System.Collections.Generic.List[string]
    Add-HeaderFooter $shapes "Resumo executivo" 2
    [void]$shapes.Add((New-PptShapeText -Id 20 -X 0.62 -Y 0.82 -W 8.8 -H 0.55 -Text "Resumo do período" -FontSize 24 -Color $Brand.Ink -Bold $true))
    $cards = @(
        @("Obras", (Format-NumberPt $summary.obras 0), "no período"),
        @("Área construída", (Format-ShortArea $summary.areaM2), "Área (m²)"),
        @("Valor negociado", (Format-ShortBrl $summary.valorNegociado), "Valor Negociado"),
        @("Tipologia líder", $byU[0].nome, "maior área construída")
    )
    for ($i = 0; $i -lt $cards.Count; $i++) {
        $x = 0.62 + ($i * 3.08)
        $fill = @($Brand.Green, $Brand.Blue, $Brand.Navy, $Brand.Orange)[$i]
        [void]$shapes.Add((New-PptShapeText -Id (30 + $i) -X $x -Y 1.55 -W 2.78 -H 1.12 -Text ("{0}`n{1}`n{2}" -f $cards[$i][0], $cards[$i][1], $cards[$i][2]) -FontSize 13 -Color $Brand.White -Bold $true -Fill $fill -Radius 1))
    }
    [void]$shapes.Add((New-PptShapeText -Id 40 -X 0.72 -Y 3.02 -W 5.8 -H 0.35 -Text "Comparativo anual" -FontSize 16 -Color $Brand.Ink -Bold $true))
    [void]$shapes.AddRange((New-PptTableShapes -Rows $yearRows -X 0.72 -Y 3.46 -Widths @(1.05,1.15,1.7,1.95) -Headers @("Ano","Obras","m²","Valor") -ValueBlocks @(
        { param($r) [string]$r.ano },
        { param($r) Format-NumberPt $r.obras 0 },
        { param($r) Format-ShortArea $r.areaM2 },
        { param($r) Format-ShortBrl $r.valorNegociado }
    ) -StartId 50 -MaxRows 3))
    [void]$shapes.Add((New-PptShapeText -Id 80 -X 7.0 -Y 3.02 -W 5.55 -H 0.35 -Text "Principais leituras" -FontSize 16 -Color $Brand.Ink -Bold $true))
    $insightText = ($insights | Select-Object -First 5 | ForEach-Object { "• $_" }) -join "`n"
    [void]$shapes.Add((New-PptShapeText -Id 81 -X 7.0 -Y 3.44 -W 5.65 -H 2.25 -Text $insightText -FontSize 12 -Color $Brand.Ink -Fill "FFFFFF" -Line $Brand.Line -Radius 1))
    [void]$slides.Add([pscustomobject]@{ Shapes = $shapes.ToArray(); Rels = @("<Relationship Id='rIdLogo' Type='http://schemas.openxmlformats.org/officeDocument/2006/relationships/image' Target='../media/image4.png'/>") })

    $shapes = New-Object System.Collections.Generic.List[string]
    Add-HeaderFooter $shapes "Curva mensal" 3
    [void]$shapes.Add((New-PptShapeText -Id 100 -X 0.62 -Y 0.82 -W 8.6 -H 0.45 -Text "Curva mensal de área construída" -FontSize 23 -Color $Brand.Ink -Bold $true))
    [void]$shapes.Add((New-PptShapeText -Id 101 -X 0.72 -Y 1.32 -W 5.8 -H 0.32 -Text "2025 | m² construídos por mês" -FontSize 14 -Color $Brand.Navy -Bold $true))
    $monthly2025 = @($Payload.monthly | Where-Object { $_.ano -eq 2025 -and $_.obras -gt 0 })
    [void]$shapes.AddRange((New-PptBarListShapes -Rows $monthly2025 -X 0.72 -Y 1.78 -W 5.75 -RowH 0.34 -Metric "areaM2" -StartId 110 -MaxRows 12 -Color $Brand.Blue))
    [void]$shapes.Add((New-PptShapeText -Id 170 -X 7.0 -Y 1.32 -W 5.5 -H 0.32 -Text "2026 | m² construídos por mês" -FontSize 14 -Color $Brand.Orange -Bold $true))
    $monthly2026 = @($Payload.monthly | Where-Object { $_.ano -eq 2026 -and $_.obras -gt 0 })
    [void]$shapes.AddRange((New-PptBarListShapes -Rows $monthly2026 -X 7.0 -Y 1.78 -W 5.75 -RowH 0.42 -Metric "areaM2" -StartId 210 -MaxRows 8 -Color $Brand.Orange))
    [void]$slides.Add([pscustomobject]@{ Shapes = $shapes.ToArray(); Rels = @("<Relationship Id='rIdLogo' Type='http://schemas.openxmlformats.org/officeDocument/2006/relationships/image' Target='../media/image4.png'/>") })

    foreach ($slideDef in @(
        @{ Title = "Tipologia de Obras"; Data = $byU; Number = 4; Subtitle = "Coluna U | eixo principal" },
        @{ Title = "Classificação de Obra"; Data = $byClass; Number = 5; Subtitle = "Coluna N" },
        @{ Title = "Nível de Obra"; Data = $byO; Number = 6; Subtitle = "Coluna O" }
    )) {
        $shapes = New-Object System.Collections.Generic.List[string]
        Add-HeaderFooter $shapes $slideDef.Title $slideDef.Number
        [void]$shapes.Add((New-PptShapeText -Id 130 -X 0.62 -Y 0.82 -W 7.7 -H 0.45 -Text ($slideDef.Title + " | valor, área e R$/m²") -FontSize 22 -Color $Brand.Ink -Bold $true))
        [void]$shapes.Add((New-PptShapeText -Id 131 -X 8.55 -Y 0.88 -W 3.95 -H 0.36 -Text $slideDef.Subtitle -FontSize 11 -Color $Brand.Muted -Align "r"))
        $slideRows = @($slideDef.Data | Sort-Object -Property valorNegociado -Descending | Select-Object -First 7)
        [void]$shapes.Add((New-PptShapeText -Id 132 -X 0.72 -Y 1.35 -W 5.7 -H 0.3 -Text "Valor negociado por grupo" -FontSize 14 -Color $Brand.Navy -Bold $true))
        [void]$shapes.AddRange((New-PptBarListShapes -Rows $slideRows -X 0.72 -Y 1.78 -W 6.05 -RowH 0.54 -Metric "valorNegociado" -StartId 133 -MaxRows 7 -Color $Brand.Blue))
        [void]$shapes.AddRange((New-PptTableShapes -Rows $slideRows -X 7.15 -Y 1.48 -Widths @(1.75,0.65,1.15,0.95,0.95) -Headers @("Grupo","Obras","Valor","m²","R$/m²") -ValueBlocks @(
            { param($r) $r.nome },
            { param($r) Format-NumberPt $r.obras 0 },
            { param($r) Format-ShortBrl $r.valorNegociado },
            { param($r) Format-ShortArea $r.areaM2 },
            { param($r) Format-Brl $r.precoM2 0 }
        ) -StartId 150 -MaxRows 7))
        [void]$slides.Add([pscustomobject]@{ Shapes = $shapes.ToArray(); Rels = @("<Relationship Id='rIdLogo' Type='http://schemas.openxmlformats.org/officeDocument/2006/relationships/image' Target='../media/image4.png'/>") })
    }

    $nextSlideNumber = 7
    $shapes = New-Object System.Collections.Generic.List[string]
    Add-HeaderFooter $shapes "Indicadores geográficos" $nextSlideNumber
    [void]$shapes.Add((New-PptShapeText -Id 600 -X 0.62 -Y 0.82 -W 8.8 -H 0.45 -Text "Indicadores por Região e Estado" -FontSize 22 -Color $Brand.Ink -Bold $true))
    [void]$shapes.Add((New-PptShapeText -Id 601 -X 0.72 -Y 1.35 -W 5.6 -H 0.32 -Text "Região" -FontSize 14 -Color $Brand.Green -Bold $true))
    [void]$shapes.AddRange((New-PptTableShapes -Rows $byRegiao -X 0.72 -Y 1.75 -Widths @(1.45,0.85,1.25,1.45,1.05) -Headers @("Região","Obras","m²","Valor","R$/m²") -ValueBlocks @(
        { param($r) $r.nome },
        { param($r) Format-NumberPt $r.obras 0 },
        { param($r) Format-ShortArea $r.areaM2 },
        { param($r) Format-ShortBrl $r.valorNegociado },
        { param($r) Format-Brl $r.precoM2 0 }
    ) -StartId 610 -MaxRows 8))
    [void]$shapes.Add((New-PptShapeText -Id 670 -X 7.05 -Y 1.35 -W 5.6 -H 0.32 -Text "Top Estados por valor negociado" -FontSize 14 -Color $Brand.Blue -Bold $true))
    $topEstados = @($byEstado | Sort-Object -Property valorNegociado -Descending | Select-Object -First 9)
    [void]$shapes.AddRange((New-PptTableShapes -Rows $topEstados -X 7.05 -Y 1.75 -Widths @(1.25,0.75,1.25,1.45,1.05) -Headers @("UF","Obras","m²","Valor","R$/m²") -ValueBlocks @(
        { param($r) $r.nome },
        { param($r) Format-NumberPt $r.obras 0 },
        { param($r) Format-ShortArea $r.areaM2 },
        { param($r) Format-ShortBrl $r.valorNegociado },
        { param($r) Format-Brl $r.precoM2 0 }
    ) -StartId 680 -MaxRows 9))
    [void]$slides.Add([pscustomobject]@{ Shapes = $shapes.ToArray(); Rels = @("<Relationship Id='rIdLogo' Type='http://schemas.openxmlformats.org/officeDocument/2006/relationships/image' Target='../media/image4.png'/>") })
    $nextSlideNumber++

    foreach ($tipo in $byU) {
        $typeRows = @($Records | Where-Object { $_.colunaU -eq $tipo.nome })
        if ($typeRows.Count -eq 0) { continue }
        $typeSummary = New-Summary $typeRows
        $typeByClass = Group-Records -Items $typeRows -Property "classificacao" -Top 8
        $typeByNivel = Group-Records -Items $typeRows -Property "colunaO" -Top 8
        $typeByEstado = Group-Records -Items $typeRows -Property "estado" -Top 8

        $shapes = New-Object System.Collections.Generic.List[string]
        Add-HeaderFooter $shapes ("Tipologia de Obras: " + $tipo.nome) $nextSlideNumber
        [void]$shapes.Add((New-PptShapeText -Id 720 -X 0.62 -Y 0.82 -W 9.8 -H 0.45 -Text ("Tipologia de Obras | " + $tipo.nome) -FontSize 21 -Color $Brand.Ink -Bold $true))
        $cardsTipo = @(
            @("Obras", (Format-NumberPt $typeSummary.obras 0), "no período"),
            @("Área", (Format-ShortArea $typeSummary.areaM2), "construída"),
            @("Valor", (Format-ShortBrl $typeSummary.valorNegociado), "negociado"),
            @("R$/m²", ((Format-Brl $typeSummary.precoM2 0) + "/m²"), "nesta tipologia")
        )
        for ($i = 0; $i -lt $cardsTipo.Count; $i++) {
            $x = 0.62 + ($i * 3.08)
            $fill = @($Brand.Green, $Brand.Blue, $Brand.Navy, $Brand.Orange)[$i]
            [void]$shapes.Add((New-PptShapeText -Id (730 + $i) -X $x -Y 1.38 -W 2.78 -H 0.86 -Text ("{0}`n{1}`n{2}" -f $cardsTipo[$i][0], $cardsTipo[$i][1], $cardsTipo[$i][2]) -FontSize 12 -Color $Brand.White -Bold $true -Fill $fill -Radius 1))
        }
        [void]$shapes.Add((New-PptShapeText -Id 750 -X 0.72 -Y 2.58 -W 5.6 -H 0.28 -Text "Classificação de Obra" -FontSize 13 -Color $Brand.Navy -Bold $true))
        [void]$shapes.AddRange((New-PptTableShapes -Rows $typeByClass -X 0.72 -Y 2.94 -Widths @(2.25,0.65,1.1,1.3,0.95) -Headers @("Classificação","Obras","m²","Valor","R$/m²") -ValueBlocks @(
            { param($r) $r.nome },
            { param($r) Format-NumberPt $r.obras 0 },
            { param($r) Format-ShortArea $r.areaM2 },
            { param($r) Format-ShortBrl $r.valorNegociado },
            { param($r) Format-Brl $r.precoM2 0 }
        ) -StartId 760 -MaxRows 7))
        [void]$shapes.Add((New-PptShapeText -Id 830 -X 7.05 -Y 2.58 -W 5.6 -H 0.28 -Text "Nível de Obra" -FontSize 13 -Color $Brand.Blue -Bold $true))
        [void]$shapes.AddRange((New-PptTableShapes -Rows $typeByNivel -X 7.05 -Y 2.94 -Widths @(2.25,0.65,1.1,1.3,0.95) -Headers @("Nível","Obras","m²","Valor","R$/m²") -ValueBlocks @(
            { param($r) $r.nome },
            { param($r) Format-NumberPt $r.obras 0 },
            { param($r) Format-ShortArea $r.areaM2 },
            { param($r) Format-ShortBrl $r.valorNegociado },
            { param($r) Format-Brl $r.precoM2 0 }
        ) -StartId 840 -MaxRows 7))
        [void]$shapes.Add((New-PptShapeText -Id 910 -X 0.72 -Y 6.08 -W 11.8 -H 0.36 -Text ("Estados líderes: " + (($typeByEstado | Select-Object -First 5 | ForEach-Object { $_.nome + " (" + (Format-ShortBrl $_.valorNegociado) + ")" }) -join " | ")) -FontSize 10 -Color $Brand.Muted))
        [void]$slides.Add([pscustomobject]@{ Shapes = $shapes.ToArray(); Rels = @("<Relationship Id='rIdLogo' Type='http://schemas.openxmlformats.org/officeDocument/2006/relationships/image' Target='../media/image4.png'/>") })
        $nextSlideNumber++
    }

    $shapes = New-Object System.Collections.Generic.List[string]
    Add-HeaderFooter $shapes "Rankings de obras" $nextSlideNumber
    [void]$shapes.Add((New-PptShapeText -Id 220 -X 0.62 -Y 0.82 -W 8.8 -H 0.45 -Text "Obras com maior R$/m² e maior área" -FontSize 22 -Color $Brand.Ink -Bold $true))
    [void]$shapes.Add((New-PptShapeText -Id 221 -X 0.72 -Y 1.36 -W 5.6 -H 0.32 -Text "Maior R$/m²" -FontSize 14 -Color $Brand.Green -Bold $true))
    [void]$shapes.AddRange((New-PptTableShapes -Rows $topPrice -X 0.72 -Y 1.78 -Widths @(2.52,1.0,1.2,1.2) -Headers @("Obra","m²","Valor","R$/m²") -ValueBlocks @(
        { param($r) $r.nome },
        { param($r) Format-NumberPt $r.areaM2 0 },
        { param($r) Format-ShortBrl $r.valorNegociado },
        { param($r) Format-Brl $r.precoM2Calculado 0 }
    ) -StartId 230 -MaxRows 9))
    [void]$shapes.Add((New-PptShapeText -Id 300 -X 7.0 -Y 1.36 -W 5.6 -H 0.32 -Text "Maior área construída" -FontSize 14 -Color $Brand.Blue -Bold $true))
    [void]$shapes.AddRange((New-PptTableShapes -Rows $topArea -X 7.0 -Y 1.78 -Widths @(2.52,1.0,1.2,1.2) -Headers @("Obra","m²","Valor","R$/m²") -ValueBlocks @(
        { param($r) $r.nome },
        { param($r) Format-NumberPt $r.areaM2 0 },
        { param($r) Format-ShortBrl $r.valorNegociado },
        { param($r) if ($r.precoM2Calculado -ne $null) { Format-Brl $r.precoM2Calculado 0 } else { "-" } }
    ) -StartId 310 -MaxRows 9))
    [void]$slides.Add([pscustomobject]@{ Shapes = $shapes.ToArray(); Rels = @("<Relationship Id='rIdLogo' Type='http://schemas.openxmlformats.org/officeDocument/2006/relationships/image' Target='../media/image4.png'/>") })
    $nextSlideNumber++

    $shapes = New-Object System.Collections.Generic.List[string]
    Add-HeaderFooter $shapes "Critérios da análise" $nextSlideNumber
    [void]$shapes.Add((New-PptShapeText -Id 400 -X 0.62 -Y 0.82 -W 8.8 -H 0.45 -Text "Critérios e campos utilizados" -FontSize 22 -Color $Brand.Ink -Bold $true))
    $method = @(
        "Aba utilizada: Base Geral.",
        "Colunas ocultas ignoradas conforme orientação.",
        "Filtro principal: Mês entre 01/01/2025 e $($Payload.meta.endDateDisplay), incluindo os status da coluna M.",
        "R$/m² apresentado somente dentro dos cortes analíticos: soma do Valor Negociado dividida pela soma da Área (m²).",
        "Eixo executivo principal: Tipologia de Obras pela coluna U. Cortes complementares: Classificação, Nível de Obra, Estado e Região."
    ) | ForEach-Object { "• $_" }
    [void]$shapes.Add((New-PptShapeText -Id 401 -X 0.92 -Y 1.6 -W 11.3 -H 3.4 -Text ($method -join "`n") -FontSize 17 -Color $Brand.Ink -Fill "FFFFFF" -Line $Brand.Line -Radius 1))
    [void]$shapes.Add((New-PptShapeText -Id 402 -X 0.92 -Y 5.45 -W 11.3 -H 0.48 -Text "Arquivo complementar: dashboard HTML interativo com filtros, curva mensal e tabela detalhada." -FontSize 14 -Color $Brand.Muted))
    [void]$slides.Add([pscustomobject]@{ Shapes = $shapes.ToArray(); Rels = @("<Relationship Id='rIdLogo' Type='http://schemas.openxmlformats.org/officeDocument/2006/relationships/image' Target='../media/image4.png'/>") })

    for ($i = 1; $i -le $slides.Count; $i++) {
        $slide = $slides[$i - 1]
        Write-Utf8NoBom -Path (Join-Path $slidesDir ("slide{0}.xml" -f $i)) -Value (New-SlideXml -Shapes $slide.Shapes)
        Write-Utf8NoBom -Path (Join-Path $slideRelsDir ("slide{0}.xml.rels" -f $i)) -Value (New-SlideRels -Relationships $slide.Rels)
    }

    [xml]$presentation = Get-Content -LiteralPath (Join-Path $tempFull "ppt\presentation.xml") -Raw
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
    $presentation.Save((Join-Path $tempFull "ppt\presentation.xml"))

    [xml]$rels = Get-Content -LiteralPath (Join-Path $tempFull "ppt\_rels\presentation.xml.rels") -Raw
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
    $rels.Save((Join-Path $tempFull "ppt\_rels\presentation.xml.rels"))

    [xml]$contentTypes = Get-Content -LiteralPath (Join-Path $tempFull "[Content_Types].xml") -Raw
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
    $contentTypes.Save((Join-Path $tempFull "[Content_Types].xml"))

    New-ZipFromDirectory -SourceDir $tempFull -ZipPath $outputFull
    Remove-Item -LiteralPath $tempFull -Recurse -Force
}

$workbookFull = Resolve-FullPath $WorkbookPath
$templateFull = Resolve-FullPath $TemplatePath
$outputFullDir = Resolve-FullPath $OutputDir
New-Item -ItemType Directory -Force -Path $outputFullDir | Out-Null

$read = Read-ObrasData -Workbook $workbookFull -Start $StartDate -End $EndDate -VisibleRowsOnly $UseVisibleRowsOnly
$records = @($read.records)
if ($records.Count -eq 0) { throw "Nenhuma obra encontrada no período informado." }

$summary = New-Summary $records
$byClass = Group-Records -Items $records -Property "classificacao" -Top 30
$byO = Group-Records -Items $records -Property "colunaO" -Top 30
$byU = Group-Records -Items $records -Property "colunaU" -Top 30
$byEstado = Group-Records -Items $records -Property "estado" -Top 30
$byRegiao = Group-Records -Items $records -Property "regiao" -Top 30
$byStatus = Group-Records -Items $records -Property "status" -Top 10
$monthly = Get-MonthSeries -Items $records -Start $StartDate -End $EndDate
$topWorks = Get-TopWorks $records
$yearSummary = Get-YearSummary $records
$insights = Get-Insights -Summary $summary -ByClass $byClass -ByO $byO -ByU $byU -Monthly $monthly

$payloadRecords = @($records | ForEach-Object {
    [ordered]@{
        mes = if ($_.mes) { $_.mes.ToString("yyyy-MM-dd") } else { $null }
        nome = $_.nome
        area = $_.area
        empresa = $_.empresa
        praca = $_.praca
        estado = $_.estado
        regiao = $_.regiao
        inicioPlanejado = if ($_.inicioPlanejado) { $_.inicioPlanejado.ToString("yyyy-MM-dd") } else { $null }
        terminoPlanejado = if ($_.terminoPlanejado) { $_.terminoPlanejado.ToString("yyyy-MM-dd") } else { $null }
        terminoReal = if ($_.terminoReal) { $_.terminoReal.ToString("yyyy-MM-dd") } else { $null }
        status = $_.status
        classificacao = $_.classificacao
        colunaO = $_.colunaO
        colunaU = $_.colunaU
        salaTecnica = $_.salaTecnica
        valorNegociado = $_.valorNegociado
        aditivos = $_.aditivos
        alteracaoEscopo = $_.alteracaoEscopo
        areaM2 = $_.areaM2
        precoM2Planilha = $_.precoM2Planilha
        precoM2Calculado = $_.precoM2Calculado
    }
})

$payload = [ordered]@{
    meta = [ordered]@{
        generatedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
        startDate = $StartDate.ToString("yyyy-MM-dd")
        endDate = $EndDate.ToString("yyyy-MM-dd")
        endDateDisplay = $EndDate.ToString("dd/MM/yyyy")
        sourceSheet = "Base Geral"
        ignoredHiddenColumns = $true
        statusFilter = "Todos os status da coluna M"
        dateFilter = "Mês"
        valueColumn = "AD - $($read.headers['AD'])"
        areaColumn = "AH - $($read.headers['AH'])"
        classColumn = "N - $($read.headers['N'])"
        columnOLabel = $read.headers["O"]
        columnULabel = $read.headers["U"]
    }
    summary = $summary
    yearSummary = $yearSummary
    monthly = $monthly
    byClass = $byClass
    byO = $byO
    byU = $byU
    byEstado = $byEstado
    byRegiao = $byRegiao
    byStatus = $byStatus
    topWorks = $topWorks
    insights = $insights
    records = $payloadRecords
}

$jsonPath = Join-Path $outputFullDir "obras_2025_2026_dados_rev5.json"
$htmlPath = Join-Path $outputFullDir "dashboard_obras_2025_2026_rev5.html"
$pptPath = Join-Path $outputFullDir "apresentacao_obras_2025_2026_Hapvida_rev5.pptx"
$monthlySvgPath = Join-Path $outputFullDir "chart_curva_mensal.svg"
$classSvgPath = Join-Path $outputFullDir "chart_classificacao.svg"
$colOSvgPath = Join-Path $outputFullDir "chart_coluna_o.svg"
$colUSvgPath = Join-Path $outputFullDir "chart_coluna_u.svg"

Write-Utf8NoBom -Path $jsonPath -Value ($payload | ConvertTo-Json -Depth 14)

$logoPath = Join-Path $outputFullDir "template_media\image4.png"
if (-not (Test-Path -LiteralPath $logoPath)) {
    $logoPath = Join-Path (Split-Path -Parent $templateFull) "image4.png"
}
if (-not (Test-Path -LiteralPath $logoPath)) {
    $logoDataUri = ""
} else {
    $logoBytes = [System.IO.File]::ReadAllBytes($logoPath)
    $logoDataUri = "data:image/png;base64," + [Convert]::ToBase64String($logoBytes)
}

$monthlySvg = New-MonthlySvg -Monthly $monthly
$classSvg = New-HorizontalBarSvg -Groups $byClass -Title "R$/m² por Classificação de Obra"
$colOSvg = New-HorizontalBarSvg -Groups $byO -Title ("R$/m² por " + $read.headers["O"])
$colUSvg = New-HorizontalBarSvg -Groups $byU -Title ("R$/m² por " + $read.headers["U"])
Write-Utf8NoBom -Path $monthlySvgPath -Value $monthlySvg
Write-Utf8NoBom -Path $classSvgPath -Value $classSvg
Write-Utf8NoBom -Path $colOSvgPath -Value $colOSvg
Write-Utf8NoBom -Path $colUSvgPath -Value $colUSvg

Build-DashboardHtml -Payload $payload -LogoDataUri $logoDataUri -OutputPath $htmlPath
Build-Presentation -Template $templateFull -OutputPath $pptPath -Payload $payload -Records $records -MonthlySvg $monthlySvg -ClassSvg $classSvg -ColOSvg $colOSvg -ColUSvg $colUSvg

[pscustomobject]@{
    RegistrosFiltrados = $records.Count
    Obras = $summary.obras
    AreaM2 = [math]::Round($summary.areaM2, 2)
    ValorNegociado = [math]::Round($summary.valorNegociado, 2)
    PrecoM2Ponderado = [math]::Round($summary.precoM2, 2)
    Dashboard = $htmlPath
    Apresentacao = $pptPath
    Dados = $jsonPath
} | Format-List
