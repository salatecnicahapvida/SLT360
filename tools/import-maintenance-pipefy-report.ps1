param(
  [string]$WorkbookPath = "C:\Users\thalles.silveira\Downloads\relatrio_2026_14-08-2026.xlsx",
  [string]$OutputPath = "data\maintenance-data.js",
  [string]$UnitRegistryPath = "data\unit-registry-data.js"
)

$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

function Get-ZipText {
  param(
    [System.IO.Compression.ZipArchive]$Zip,
    [string]$Name
  )

  $entry = $Zip.GetEntry($Name)
  if (-not $entry) { return "" }
  $reader = New-Object System.IO.StreamReader($entry.Open())
  try {
    return $reader.ReadToEnd()
  } finally {
    $reader.Close()
  }
}

function Get-ColumnIndex {
  param([string]$CellRef)

  $letters = ($CellRef -replace "\d", "").ToUpperInvariant()
  $index = 0
  foreach ($char in $letters.ToCharArray()) {
    $index = ($index * 26) + ([int][char]$char - [int][char]'A' + 1)
  }
  return $index - 1
}

function Get-CellText {
  param(
    $Cell,
    [string[]]$SharedStrings
  )

  $type = [string]$Cell.t
  if ($type -eq "s") {
    $idx = 0
    if ([int]::TryParse([string]$Cell.v, [ref]$idx) -and $idx -ge 0 -and $idx -lt $SharedStrings.Count) {
      return [string]$SharedStrings[$idx]
    }
    return ""
  }
  if ($type -eq "inlineStr") {
    return [string]$Cell.is.InnerText
  }
  if ($type -eq "b") {
    return ($(if ([string]$Cell.v -eq "1") { "TRUE" } else { "FALSE" }))
  }
  return [string]$Cell.v
}

function Normalize-Key {
  param([string]$Text)

  if (-not $Text) { return "" }
  $normalized = $Text.Normalize([Text.NormalizationForm]::FormD)
  $builder = New-Object Text.StringBuilder
  foreach ($char in $normalized.ToCharArray()) {
    $category = [Globalization.CharUnicodeInfo]::GetUnicodeCategory($char)
    if ($category -ne [Globalization.UnicodeCategory]::NonSpacingMark) {
      [void]$builder.Append($char)
    }
  }
  return ($builder.ToString().ToLowerInvariant() -replace "[^a-z0-9]+", " ").Trim()
}

function Get-RegionFromUf {
  param([string]$Uf)

  $value = ""
  if ($Uf) { $value = $Uf.ToUpperInvariant().Trim() }
  if (@("AC", "AP", "AM", "PA", "RO", "RR", "TO") -contains $value) { return "Norte" }
  if (@("AL", "BA", "CE", "MA", "PB", "PE", "PI", "RN", "SE") -contains $value) { return "Nordeste" }
  if (@("DF", "GO", "MT", "MS") -contains $value) { return "Centro Oeste" }
  if (@("ES", "MG", "RJ", "SP") -contains $value) { return "Sudeste" }
  if (@("PR", "RS", "SC") -contains $value) { return "Sul" }
  return ""
}

function Get-JsonFromWindowAssignment {
  param(
    [string]$Path,
    [string]$VariableName
  )

  if (-not (Test-Path -LiteralPath $Path)) { return $null }
  $raw = Get-Content -LiteralPath $Path -Raw -Encoding UTF8
  $pattern = "window\.$([regex]::Escape($VariableName))\s*=\s*(.*?);?\s*$"
  $match = [regex]::Match($raw, $pattern, [Text.RegularExpressions.RegexOptions]::Singleline)
  if (-not $match.Success) { return $null }
  return $match.Groups[1].Value | ConvertFrom-Json
}

function Read-XlsxRows {
  param(
    [string]$Path
  )

  $fs = [IO.File]::Open($Path, [IO.FileMode]::Open, [IO.FileAccess]::Read, [IO.FileShare]::ReadWrite)
  $zip = New-Object IO.Compression.ZipArchive($fs, [IO.Compression.ZipArchiveMode]::Read)
  try {
    $sharedStrings = @()
    $sharedText = Get-ZipText -Zip $zip -Name "xl/sharedStrings.xml"
    if ($sharedText) {
      $sharedXml = [xml]$sharedText
      foreach ($si in @($sharedXml.sst.si)) {
        $sharedStrings += [string]$si.InnerText
      }
    }

    $sheetXml = [xml](Get-ZipText -Zip $zip -Name "xl/worksheets/sheet1.xml")
    $rows = @($sheetXml.worksheet.sheetData.row)
    if (-not $rows.Count) { return @() }

    $headerMap = @{}
    $headerRow = $rows[0]
    foreach ($cell in @($headerRow.c)) {
      $column = Get-ColumnIndex -CellRef ([string]$cell.r)
      $header = (Get-CellText -Cell $cell -SharedStrings $sharedStrings).Trim()
      if ($header) { $headerMap[$column] = $header }
    }

    $records = New-Object System.Collections.ArrayList
    foreach ($row in @($rows | Select-Object -Skip 1)) {
      $record = [ordered]@{}
      $hasValue = $false
      foreach ($cell in @($row.c)) {
        $column = Get-ColumnIndex -CellRef ([string]$cell.r)
        if (-not $headerMap.ContainsKey($column)) { continue }
        $value = Get-CellText -Cell $cell -SharedStrings $sharedStrings
        if ($null -ne $value) { $value = [string]$value }
        if ($value -and $value.Trim()) { $hasValue = $true }
        $record[$headerMap[$column]] = $value
      }
      if ($hasValue) { [void]$records.Add([pscustomobject]$record) }
    }

    return @($records.ToArray())
  } finally {
    $zip.Dispose()
    $fs.Dispose()
  }
}

function Get-Value {
  param(
    $Record,
    [string]$Name
  )

  if ($Record.PSObject.Properties.Name -contains $Name) {
    return [string]$Record.$Name
  }
  return ""
}

function To-Number {
  param($Value)

  if ($null -eq $Value) { return 0 }
  $text = ([string]$Value).Trim()
  if (-not $text) { return 0 }
  $text = $text -replace "R\$", ""
  $text = $text -replace "\s", ""
  if ($text -match "," -and $text -match "\.") {
    $text = $text -replace "\.", ""
    $text = $text -replace ",", "."
  } elseif ($text -match ",") {
    $text = $text -replace ",", "."
  }
  $result = 0.0
  if ([double]::TryParse($text, [Globalization.NumberStyles]::Any, [Globalization.CultureInfo]::InvariantCulture, [ref]$result)) {
    return $result
  }
  return 0
}

$records = Read-XlsxRows -Path $WorkbookPath
$unitData = Get-JsonFromWindowAssignment -Path $UnitRegistryPath -VariableName "UNIT_REGISTRY_DATA"
$unitsByName = @{}
if ($unitData -and $unitData.records) {
  foreach ($unit in @($unitData.records)) {
    $name = [string]$unit."NOME UNIDADE"
    $key = Normalize-Key $name
    if ($key -and -not $unitsByName.ContainsKey($key)) {
      $unitsByName[$key] = $unit
    }
  }
}

$normalizedRecords = New-Object System.Collections.ArrayList
foreach ($record in $records) {
  $unitName = (Get-Value $record "NOME DA UNIDADE").Trim()
  $unitKey = Normalize-Key $unitName
  $unit = $null
  if ($unitKey -and $unitsByName.ContainsKey($unitKey)) {
    $unit = $unitsByName[$unitKey]
  }

  $uf = (Get-Value $record "ESTADO DA UNIDADE").Trim().ToUpperInvariant()
  $region = Get-RegionFromUf $uf
  $typology = if ($unit) { [string]$unit.TIPO } else { "" }
  if (-not $typology) { $typology = "Nao informada" }
  $title = (Get-Value $record "NOME DA OBRA").Trim()
  if (-not $title) { $title = (Get-Value $record "Titulo").Trim() }
  if (-not $title) { $title = $unitName }

  $item = [ordered]@{}
  foreach ($property in $record.PSObject.Properties) {
    $item[$property.Name] = $property.Value
  }

  $item["NOME DA OBRA"] = $title
  $item["TIPOLOGIA"] = $typology
  $item["ESTADO"] = $uf
  $item["REGIAO"] = $region
  $item["REGIONAL"] = $region
  $item["REGIAO 2"] = $region
  if ($unit) {
    $item["CNPJ"] = [string]$unit.CNPJ
    $item["CEP"] = [string]$unit.CEP
    $item["CODIGO UNIDADE"] = [string]$unit.CENTRO
  }
  [void]$normalizedRecords.Add([pscustomobject]$item)
}

$totalProposal = 0
$totalSlt = 0
$totalNegotiated = 0
$topInvestments = @{}
$costLines = @{}
foreach ($record in @($normalizedRecords)) {
  $proposal = To-Number (Get-Value $record "VALOR DA PROPOSTA")
  $slt = To-Number (Get-Value $record "VALOR SALA TECNICA")
  $expense = Normalize-Key (Get-Value $record "TIPO DE DESPESA")
  $negotiated = if ($expense -like "*opex*") { 0 } else { To-Number (Get-Value $record "VALOR NEGOCIADO") }
  $title = (Get-Value $record "NOME DA OBRA").Trim()
  $costCenter = (Get-Value $record "CENTRO DE CUSTO").Trim()
  if (-not $costCenter) { $costCenter = "Nao informado" }

  $totalProposal += $proposal
  $totalSlt += $slt
  $totalNegotiated += $negotiated
  if ($title) {
    if (-not $topInvestments.ContainsKey($title)) { $topInvestments[$title] = 0 }
    $topInvestments[$title] += $slt
  }
  if (-not $costLines.ContainsKey($costCenter)) { $costLines[$costCenter] = 0 }
  $costLines[$costCenter] += $slt
}

$summaryInvestments = @(
  $topInvestments.GetEnumerator() |
    Sort-Object Value -Descending |
    Select-Object -First 12 |
    ForEach-Object { [pscustomobject]@{ obra = $_.Key; valor = [math]::Round([double]$_.Value, 2) } }
)

$summaryCostLines = @(
  $costLines.GetEnumerator() |
    Sort-Object Value -Descending |
    Select-Object -First 12 |
    ForEach-Object { [pscustomobject]@{ linha = $_.Key; valor = [math]::Round([double]$_.Value, 2) } }
)

$payload = [ordered]@{
  source = [IO.Path]::GetFileName($WorkbookPath)
  sheet = "Report"
  importedAt = (Get-Date).ToString("s")
  records = @($normalizedRecords)
  summary = [ordered]@{
    capexAprovado = [math]::Round([double]$totalProposal, 2)
    saldoManutencao = [math]::Round([double]($totalProposal - $totalSlt), 2)
    saldoAtual = [math]::Round([double]($totalProposal - $totalSlt), 2)
    totalRealizado = [math]::Round([double]$totalSlt, 2)
    investimentosExtrasTotal = [math]::Round([double]$totalNegotiated, 2)
    sourceNote = "Dados recalculados a partir da aba Report do relatorio Pipefy."
  }
  summaryInvestments = @($summaryInvestments)
  summaryCostLines = @($summaryCostLines)
}

if (Test-Path -LiteralPath $OutputPath) {
  $stamp = Get-Date -Format "yyyyMMdd-HHmmss"
  $backup = [IO.Path]::Combine((Split-Path -Parent $OutputPath), "maintenance-data.before-pipefy-$stamp.js")
  Copy-Item -LiteralPath $OutputPath -Destination $backup
  Write-Output "Backup criado: $backup"
}

$json = $payload | ConvertTo-Json -Depth 12 -Compress
$content = "window.MAINTENANCE_DATA = $json;`n"
Set-Content -LiteralPath $OutputPath -Value $content -Encoding UTF8
Write-Output "Importado: $($normalizedRecords.Count) registros para $OutputPath"
Write-Output "Proposta: $([math]::Round([double]$totalProposal, 2)) | Sala Tecnica: $([math]::Round([double]$totalSlt, 2)) | Negociado CAPEX: $([math]::Round([double]$totalNegotiated, 2))"
