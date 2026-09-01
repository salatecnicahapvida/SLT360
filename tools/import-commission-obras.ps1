param(
  [string]$WorkbookPath = "",
  [string]$OutputPath = ".\data\commission-obras-data.js"
)

$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.IO.Compression

if (-not $WorkbookPath) {
  $WorkbookPath = (Get-ChildItem -LiteralPath "C:\Users\thalles.silveira\Downloads" -Filter "*Comiss*Obras 2025*Jul 26 v5.xlsx" | Select-Object -First 1).FullName
}

if (-not $WorkbookPath -or -not (Test-Path -LiteralPath $WorkbookPath)) {
  throw "Planilha de comissão não encontrada. Informe -WorkbookPath com o caminho completo do arquivo."
}

function Read-ZipText($zip, $name) {
  $entry = $zip.GetEntry($name)
  if (-not $entry) { return $null }
  $reader = [System.IO.StreamReader]::new($entry.Open())
  try { return $reader.ReadToEnd() } finally { $reader.Close() }
}

function Get-ColumnNumber($reference) {
  $letters = ([regex]::Match([string]$reference, "^[A-Z]+")).Value
  $number = 0
  foreach ($letter in $letters.ToCharArray()) {
    $number = ($number * 26) + ([int][char]$letter - [int][char]'A' + 1)
  }
  return [int]$number
}

function Get-ColumnLetters([int]$number) {
  $letters = ""
  $n = [int]$number
  while ($n -gt 0) {
    $m = [int](($n - 1) % 26)
    $letters = ([char]([int][char]'A' + $m)) + $letters
    $n = [int][math]::Floor(($n - 1) / 26)
  }
  return $letters
}

function Get-CellText($cell, $sharedStrings) {
  $type = [string]$cell.t
  if ($type -eq "s") {
    $idx = [int]$cell.v
    return [string]$sharedStrings[$idx]
  }
  if ($type -eq "inlineStr") {
    return [string]$cell.is.t
  }
  return [string]$cell.v
}

function Parse-Number($value) {
  $text = ([string]$value).Trim()
  if (-not $text -or $text -eq "-") { return $null }
  $number = 0.0
  if ([double]::TryParse($text, [System.Globalization.NumberStyles]::Any, [System.Globalization.CultureInfo]::InvariantCulture, [ref]$number)) {
    return $number
  }
  $text = $text.Replace(".", "").Replace(",", ".")
  if ([double]::TryParse($text, [System.Globalization.NumberStyles]::Any, [System.Globalization.CultureInfo]::InvariantCulture, [ref]$number)) {
    return $number
  }
  return $null
}

function Parse-ExcelDate($value) {
  $number = Parse-Number $value
  if ($null -eq $number -or $number -lt 20000) { return $null }
  try { return ([DateTime]::FromOADate($number)).ToString("yyyy-MM-dd") } catch { return $null }
}

function Normalize-Region($value) {
  switch (([string]$value).Trim().ToUpperInvariant()) {
    "CO" { "Centro-Oeste" }
    "NE" { "Nordeste" }
    "NO" { "Norte" }
    "SE" { "Sudeste" }
    "SU" { "Sul" }
    default { [string]$value }
  }
}

function Split-WorkName($value) {
  $text = ([string]$value).Trim()
  $match = [regex]::Match($text, "^([0-9]+)\.(.+)$")
  if ($match.Success) {
    return @{
      codigo = $match.Groups[1].Value.Trim()
      nome = $match.Groups[2].Value.Trim()
    }
  }
  return @{
    codigo = ""
    nome = $text
  }
}

$columns = @{
  B = "mesSerial"
  C = "nomeObraCompleto"
  D = "areaCategoria"
  E = "chaveSlide"
  F = "empresa"
  G = "praca"
  H = "uf"
  I = "regiaoOriginal"
  J = "inicioPlanejadoSerial"
  K = "terminoPlanejadoSerial"
  L = "terminoRealSerial"
  M = "status"
  N = "classificacaoObra"
  O = "nivelObra"
  P = "fimObra"
  Q = "dias"
  R = "conclusao"
  S = "tipoObra2"
  T = "tipoObras"
  U = "tipoObra"
  V = "obraDoMes"
  W = "areaFlag"
  X = "aditivoFlag"
  Y = "antecipadaFlag"
  Z = "atrasadoFlag"
  AA = "regionalObras"
  AB = "responsavelObras"
  AC = "valorSalaTecnica"
  AD = "valorNegociado"
  AE = "aditivos"
  AF = "alteracaoEscopo"
  AG = "equipamentosMobiliario"
  AH = "areaM2"
  AI = "percentualAditivo"
  AJ = "refAuditoria"
  AK = "gapSalaTecnicaVsNegociado"
  AL = "gapPercentual"
  AM = "precoM2"
  AN = "observacoes"
}

$fileStream = [System.IO.File]::Open($WorkbookPath, [System.IO.FileMode]::Open, [System.IO.FileAccess]::Read, [System.IO.FileShare]::ReadWrite)
$zip = [System.IO.Compression.ZipArchive]::new($fileStream, [System.IO.Compression.ZipArchiveMode]::Read)

try {
  [xml]$sharedXml = Read-ZipText $zip "xl/sharedStrings.xml"
  $sharedStrings = @()
  if ($sharedXml) {
    foreach ($item in $sharedXml.sst.si) {
      $sharedStrings += (($item.InnerText) -replace "\s+", " ").Trim()
    }
  }

  [xml]$sheetXml = Read-ZipText $zip "xl/worksheets/sheet1.xml"
  $records = @()

  foreach ($row in $sheetXml.worksheet.sheetData.row) {
    if ([int]$row.r -le 2) { continue }
    $raw = @{}
    foreach ($cell in $row.c) {
      $col = Get-ColumnLetters (Get-ColumnNumber $cell.r)
      if (-not $columns.ContainsKey($col)) { continue }
      $raw[$columns[$col]] = Get-CellText $cell $sharedStrings
    }

    if (-not $raw.nomeObraCompleto) { continue }
    $nameParts = Split-WorkName $raw.nomeObraCompleto
    $salaTecnica = Parse-Number $raw.valorSalaTecnica
    $valorNegociado = Parse-Number $raw.valorNegociado
    $areaM2 = Parse-Number $raw.areaM2
    $precoM2 = Parse-Number $raw.precoM2

    $records += [ordered]@{
      id = "COM-$($row.r)"
      rowNumber = [int]$row.r
      mes = Parse-ExcelDate $raw.mesSerial
      nomeObraOriginal = [string]$raw.nomeObraCompleto
      codigoObra = $nameParts.codigo
      nomeObra = $nameParts.nome
      chaveSlide = [string]$raw.chaveSlide
      empresa = [string]$raw.empresa
      cidade = [string]$raw.praca
      uf = [string]$raw.uf
      regiao = Normalize-Region $raw.regiaoOriginal
      regiaoOriginal = [string]$raw.regiaoOriginal
      inicioPlanejado = Parse-ExcelDate $raw.inicioPlanejadoSerial
      terminoPlanejado = Parse-ExcelDate $raw.terminoPlanejadoSerial
      terminoReal = Parse-ExcelDate $raw.terminoRealSerial
      status = [string]$raw.status
      classificacaoObra = [string]$raw.classificacaoObra
      nivelObra = [string]$raw.nivelObra
      fimObra = [string]$raw.fimObra
      dias = Parse-Number $raw.dias
      conclusao = [string]$raw.conclusao
      tipoObra2 = [string]$raw.tipoObra2
      tipoObras = [string]$raw.tipoObras
      tipoObra = [string]$raw.tipoObra
      obraDoMes = [string]$raw.obraDoMes
      areaFlag = [string]$raw.areaFlag
      aditivoFlag = [string]$raw.aditivoFlag
      antecipadaFlag = [string]$raw.antecipadaFlag
      atrasadoFlag = [string]$raw.atrasadoFlag
      regionalObras = [string]$raw.regionalObras
      responsavelObras = [string]$raw.responsavelObras
      valorSalaTecnica = $salaTecnica
      valorNegociado = $valorNegociado
      aditivos = Parse-Number $raw.aditivos
      alteracaoEscopo = Parse-Number $raw.alteracaoEscopo
      equipamentosMobiliario = Parse-Number $raw.equipamentosMobiliario
      areaM2 = $areaM2
      percentualAditivo = Parse-Number $raw.percentualAditivo
      refAuditoria = [string]$raw.refAuditoria
      gapSalaTecnicaVsNegociado = Parse-Number $raw.gapSalaTecnicaVsNegociado
      gapPercentual = Parse-Number $raw.gapPercentual
      precoM2 = $precoM2
      observacoes = [string]$raw.observacoes
      leituraValidaM2 = [bool]($precoM2 -and $precoM2 -gt 0 -and $areaM2 -and $areaM2 -gt 0 -and $valorNegociado -and $valorNegociado -gt 0)
    }
  }

  $validM2 = @($records | Where-Object { $_["leituraValidaM2"] })
  $sumSalaTecnica = 0.0
  $sumValorNegociado = 0.0
  $sumAreaM2 = 0.0
  foreach ($record in $records) {
    if ($null -ne $record["valorSalaTecnica"]) { $sumSalaTecnica += [double]$record["valorSalaTecnica"] }
    if ($null -ne $record["valorNegociado"]) { $sumValorNegociado += [double]$record["valorNegociado"] }
  }
  foreach ($record in $validM2) {
    if ($null -ne $record["areaM2"]) { $sumAreaM2 += [double]$record["areaM2"] }
  }
  $summary = [ordered]@{
    totalRegistros = $records.Count
    registrosValidosM2 = $validM2.Count
    valorSalaTecnica = $sumSalaTecnica
    valorNegociado = $sumValorNegociado
    areaM2 = $sumAreaM2
  }
  $summary.precoM2Ponderado = if ($summary.areaM2 -gt 0) { $summary.valorNegociado / $summary.areaM2 } else { 0 }
  $summary.gapSalaTecnicaVsNegociado = $summary.valorNegociado - $summary.valorSalaTecnica

  $payload = [ordered]@{
    source = Split-Path $WorkbookPath -Leaf
    sheet = "Base Geral"
    importedAt = (Get-Date).ToString("s")
    summary = $summary
    records = $records
  }

  $json = $payload | ConvertTo-Json -Depth 8
  $content = "window.COMMISSION_OBRAS_DATA = $json;"
  Set-Content -LiteralPath $OutputPath -Value $content -Encoding UTF8
  Write-Host "Base de comissão importada: $OutputPath"
  Write-Host "Registros: $($records.Count) | válidos m²: $($validM2.Count)"
} finally {
  $zip.Dispose()
  $fileStream.Dispose()
}
