param(
  [Parameter(Mandatory = $true)]
  [string]$Path,
  [int]$MaxRows = 90,
  [int]$MaxCols = 30
)

Add-Type -AssemblyName System.IO.Compression.FileSystem

function Get-ZipText {
  param($Zip, [string]$EntryName)
  $entry = $Zip.GetEntry($EntryName)
  if (-not $entry) { return $null }
  $reader = [System.IO.StreamReader]::new($entry.Open())
  try { return $reader.ReadToEnd() } finally { $reader.Dispose() }
}

function Get-ColIndex {
  param([string]$CellRef)
  $letters = ([regex]::Match($CellRef, '^[A-Z]+')).Value
  $value = 0
  foreach ($char in $letters.ToCharArray()) {
    $value = ($value * 26) + ([int][char]$char - [int][char]'A' + 1)
  }
  return $value
}

function Get-RowIndex {
  param([string]$CellRef)
  $digits = ([regex]::Match($CellRef, '\d+')).Value
  if ($digits) { return [int]$digits }
  return 0
}

function Decode-SharedStrings {
  param($Zip)
  $xmlText = Get-ZipText $Zip 'xl/sharedStrings.xml'
  if (-not $xmlText) { return @() }
  [xml]$xml = $xmlText
  $ns = New-Object System.Xml.XmlNamespaceManager($xml.NameTable)
  $ns.AddNamespace('x', 'http://schemas.openxmlformats.org/spreadsheetml/2006/main')
  $strings = New-Object System.Collections.Generic.List[string]
  foreach ($si in $xml.SelectNodes('//x:si', $ns)) {
    $parts = @()
    foreach ($node in $si.SelectNodes('.//x:t', $ns)) {
      $parts += $node.InnerText
    }
    $strings.Add(($parts -join ''))
  }
  return $strings.ToArray()
}

function Get-Sheets {
  param($Zip)
  [xml]$workbook = Get-ZipText $Zip 'xl/workbook.xml'
  [xml]$rels = Get-ZipText $Zip 'xl/_rels/workbook.xml.rels'
  $ns = New-Object System.Xml.XmlNamespaceManager($workbook.NameTable)
  $ns.AddNamespace('x', 'http://schemas.openxmlformats.org/spreadsheetml/2006/main')
  $ns.AddNamespace('r', 'http://schemas.openxmlformats.org/officeDocument/2006/relationships')

  $relById = @{}
  foreach ($rel in $rels.Relationships.Relationship) {
    $target = [string]$rel.Target
    if ($target -notlike 'xl/*') { $target = "xl/$target" }
    $relById[[string]$rel.Id] = $target
  }

  $sheets = @()
  foreach ($sheet in $workbook.SelectNodes('//x:sheets/x:sheet', $ns)) {
    $rid = $sheet.GetAttribute('id', 'http://schemas.openxmlformats.org/officeDocument/2006/relationships')
    $sheets += [pscustomobject]@{
      Name = [string]$sheet.name
      Path = $relById[$rid]
    }
  }
  return $sheets
}

function Get-CellText {
  param($Cell, [string[]]$SharedStrings)
  $type = [string]$Cell.t
  if ($type -eq 's') {
    $idx = [int]$Cell.v
    if ($idx -ge 0 -and $idx -lt $SharedStrings.Length) { return $SharedStrings[$idx] }
    return ''
  }
  if ($type -eq 'inlineStr') {
    return ($Cell.is.t | ForEach-Object { $_.'#text' }) -join ''
  }
  if ($Cell.v -ne $null) { return [string]$Cell.v }
  return ''
}

$zip = [System.IO.Compression.ZipFile]::OpenRead($Path)
try {
  $sharedStrings = Decode-SharedStrings $zip
  $sheets = Get-Sheets $zip
  Write-Output "FILE`t$([System.IO.Path]::GetFileName($Path))"
  foreach ($sheet in $sheets) {
    Write-Output "SHEET`t$($sheet.Name)`t$($sheet.Path)"
    $sheetXmlText = Get-ZipText $zip $sheet.Path
    if (-not $sheetXmlText) { continue }
    [xml]$sheetXml = $sheetXmlText
    $ns = New-Object System.Xml.XmlNamespaceManager($sheetXml.NameTable)
    $ns.AddNamespace('x', 'http://schemas.openxmlformats.org/spreadsheetml/2006/main')
    foreach ($cell in $sheetXml.SelectNodes('//x:sheetData/x:row/x:c', $ns)) {
      $ref = [string]$cell.r
      $row = Get-RowIndex $ref
      $col = Get-ColIndex $ref
      if ($row -gt $MaxRows -or $col -gt $MaxCols) { continue }
      $text = (Get-CellText $cell $sharedStrings).Trim()
      if ($text.Length -eq 0) { continue }
      Write-Output "$($sheet.Name)`t$ref`t$text"
    }
  }
}
finally {
  $zip.Dispose()
}
