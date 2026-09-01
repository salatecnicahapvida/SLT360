param(
  [Parameter(Mandatory = $true)]
  [string]$EvFolder,
  [string]$StatePath = "data/traco-imported-state.js",
  [string]$FilePattern = "*.xlsx",
  [int]$MaxFiles = 0,
  [int]$MaxRows = 260,
  [int]$MaxCols = 80,
  [switch]$Apply
)

Add-Type -AssemblyName System.IO.Compression.FileSystem
Add-Type -AssemblyName System.Web.Extensions

$ErrorActionPreference = "Stop"

$disciplines = @(
  @{ id = "fundacoes-e-contencoes"; nome = "Fundações e Contenções"; categoria = "CustosDaObra"; posicao = 1 },
  @{ id = "estruturas"; nome = "Estruturas"; categoria = "CustosDaObra"; posicao = 2 },
  @{ id = "adequacoes-civis"; nome = "Adequações Civis"; categoria = "CustosDaObra"; posicao = 3 },
  @{ id = "fachadas"; nome = "Fachadas"; categoria = "CustosDaObra"; posicao = 4 },
  @{ id = "instalacoes-eletricas-e-spda"; nome = "Instalações Elétricas e SPDA"; categoria = "CustosDaObra"; posicao = 5 },
  @{ id = "instalacoes-hidrossanitarias"; nome = "Instalações Hidrossanitárias"; categoria = "CustosDaObra"; posicao = 6 },
  @{ id = "instalacoes-de-gases-medicinais"; nome = "Instalações de Gases Medicinais"; categoria = "CustosDaObra"; posicao = 7 },
  @{ id = "instalacoes-de-combate-a-incendio"; nome = "Instalações de Combate a Incêndio"; categoria = "CustosDaObra"; posicao = 8 },
  @{ id = "instalacoes-de-spda"; nome = "Instalações de SPDA"; categoria = "CustosDaObra"; posicao = 9 },
  @{ id = "instalacoes-de-climatizacao-e-exaustao"; nome = "Instalações de Climatização e Exaustão"; categoria = "CustosDaObra"; posicao = 10 },
  @{ id = "dados-voz-cftv-chamada"; nome = "Infraestrutura de Dados/Voz/Seg. Patrimonial/CFTV/Chamada"; categoria = "CustosDaObra"; posicao = 11 },
  @{ id = "custos-indiretos"; nome = "Custos Indiretos"; categoria = "CustosDaObra"; posicao = 12 },
  @{ id = "instalacoes-de-glp"; nome = "Instalações de GLP"; categoria = "CustosDaObra"; posicao = 13 },
  @{ id = "projetos-tecnicos"; nome = "Projetos Técnicos"; categoria = "OutrasCategorias"; posicao = 14 },
  @{ id = "projetos-legalizacao"; nome = "Projetos Legalização"; categoria = "OutrasCategorias"; posicao = 15 },
  @{ id = "dados-e-voz-seguranca-patrimonial-chamada-hospitalar"; nome = "Dados e Voz/Segurança Patrimonial/Chamada Hospitalar"; categoria = "OutrasCategorias"; posicao = 16 },
  @{ id = "equipamentos-de-climatizacao"; nome = "Equipamentos de Climatização"; categoria = "OutrasCategorias"; posicao = 17 },
  @{ id = "artefatos-inox"; nome = "Artefatos em Inox"; categoria = "OutrasCategorias"; posicao = 18 },
  @{ id = "marcenaria"; nome = "Marcenaria"; categoria = "OutrasCategorias"; posicao = 19 },
  @{ id = "reguas-medicinais"; nome = "Réguas Medicinais"; categoria = "OutrasCategorias"; posicao = 20 },
  @{ id = "gerador-subestacao-transformador-cubiculos"; nome = "Gerador/Subestação/Transformador/Cubículos"; categoria = "OutrasCategorias"; posicao = 21 },
  @{ id = "elevadores-plataforma-elevatoria"; nome = "Elevadores/Plataforma Elevatória"; categoria = "OutrasCategorias"; posicao = 22 },
  @{ id = "compressor-bomba-de-vacuo-driox"; nome = "Compressor/Bomba de Vácuo/Driox"; categoria = "OutrasCategorias"; posicao = 23 },
  @{ id = "it-medico-nobreak"; nome = "IT Médico/Nobreak"; categoria = "OutrasCategorias"; posicao = 24 },
  @{ id = "ete-eta"; nome = "ETE/ETA"; categoria = "OutrasCategorias"; posicao = 25 },
  @{ id = "correio-pneumatico"; nome = "Correio Pneumático"; categoria = "OutrasCategorias"; posicao = 26 },
  @{ id = "controle-acessos"; nome = "Controle de Acessos"; categoria = "OutrasCategorias"; posicao = 27 },
  @{ id = "planejamento-obras"; nome = "Planejamento de Obras"; categoria = "OutrasCategorias"; posicao = 28 },
  @{ id = "contas-consumo"; nome = "Contas de Consumo"; categoria = "OutrasCategorias"; posicao = 29 },
  @{ id = "comunicacao-visual-externa-e-interna"; nome = "Comunicação Visual Externa e Interna"; categoria = "OutrasCategorias"; posicao = 30 },
  @{ id = "quadros-eletricos"; nome = "Quadros Elétricos"; categoria = "OutrasCategorias"; posicao = 31 },
  @{ id = "sics"; nome = "SIC's"; categoria = "OutrasCategorias"; posicao = 32 },
  @{ id = "sistemas-de-automacao"; nome = "Sistemas de Automação"; categoria = "OutrasCategorias"; posicao = 33 },
  @{ id = "taxa-risco"; nome = "Taxa de Risco (5%)"; categoria = "OutrasCategorias"; posicao = 34 },
  @{ id = "blindagem"; nome = "Blindagem"; categoria = "OutrasCategorias"; posicao = 35 },
  @{ id = "paisagismo-e-ou-compensacao-ambiental"; nome = "Paisagismo e/ou Compensação Ambiental"; categoria = "OutrasCategorias"; posicao = 36 },
  @{ id = "camara-fria"; nome = "Câmara Fria"; categoria = "OutrasCategorias"; posicao = 37 },
  @{ id = "outras-linhas-ev"; nome = "Outras Linhas do EV"; categoria = "OutrasCategorias"; posicao = 38 },
  @{ id = "sistema-de-aquecimento-de-agua"; nome = "Sistema de Aquecimento de Água"; categoria = "OutrasCategorias"; posicao = 39 }
)

$disciplineAliases = @{
  "fundacoes e contencoes" = "fundacoes-e-contencoes"
  "fundacao e contencao" = "fundacoes-e-contencoes"
  "instalacoes eletricas e spda" = "instalacoes-eletricas-e-spda"
  "instalacoes eletricas" = "instalacoes-eletricas-e-spda"
  "instalacoes hidrossanitarias" = "instalacoes-hidrossanitarias"
  "instalacoes hidraulicas" = "instalacoes-hidrossanitarias"
  "instalacoes hidro sanitarias" = "instalacoes-hidrossanitarias"
  "instalacoes de gases medicinais" = "instalacoes-de-gases-medicinais"
  "gases medicinais" = "instalacoes-de-gases-medicinais"
  "instalacoes de combate a incendio" = "instalacoes-de-combate-a-incendio"
  "combate a incendio" = "instalacoes-de-combate-a-incendio"
  "climatizacao e exaustao" = "instalacoes-de-climatizacao-e-exaustao"
  "instalacoes de climatizacao e exaustao" = "instalacoes-de-climatizacao-e-exaustao"
  "infraestrutura de dados voz seg patrimonial cftv chamada" = "dados-voz-cftv-chamada"
  "dados voz seguranca patrimonial cftv chamada" = "dados-voz-cftv-chamada"
  "dados e voz seguranca patrimonial chamada hospitalar" = "dados-e-voz-seguranca-patrimonial-chamada-hospitalar"
  "dados e voz seguranca patrimonial chamada" = "dados-e-voz-seguranca-patrimonial-chamada-hospitalar"
  "projetos tecnicos" = "projetos-tecnicos"
  "projetos legalizacao" = "projetos-legalizacao"
  "equipamentos de climatizacao" = "equipamentos-de-climatizacao"
  "artefatos em inox" = "artefatos-inox"
  "reguas medicinais" = "reguas-medicinais"
  "gerador subestacao transformador cubiculos" = "gerador-subestacao-transformador-cubiculos"
  "elevadores plataforma elevatoria" = "elevadores-plataforma-elevatoria"
  "compressor bomba de vacuo driox" = "compressor-bomba-de-vacuo-driox"
  "it medico nobreak" = "it-medico-nobreak"
  "ete eta" = "ete-eta"
  "correio pneumatico" = "correio-pneumatico"
  "controle de acessos" = "controle-acessos"
  "planejamento de obras" = "planejamento-obras"
  "contas de consumo" = "contas-consumo"
  "comunicacao visual externa e interna" = "comunicacao-visual-externa-e-interna"
  "quadros eletricos" = "quadros-eletricos"
  "sic s" = "sics"
  "sics" = "sics"
  "sic" = "sics"
  "sistemas de automacao" = "sistemas-de-automacao"
  "taxa de risco 5" = "taxa-risco"
  "taxa de risco" = "taxa-risco"
  "paisagismo e ou compensacao ambiental" = "paisagismo-e-ou-compensacao-ambiental"
  "camara fria" = "camara-fria"
  "outras linhas do ev" = "outras-linhas-ev"
  "sistema de aquecimento de agua" = "sistema-de-aquecimento-de-agua"
}

$stopWords = @("obra", "obras", "novo", "nova", "adequacao", "adequacoes", "estudo", "viabilidade", "mp", "visa", "ppci", "spda", "de", "da", "do", "das", "dos", "e", "em")

function Normalize-Text {
  param([AllowNull()][string]$Text)
  if ([string]::IsNullOrWhiteSpace($Text)) { return "" }
  $normalized = $Text.Normalize([Text.NormalizationForm]::FormD)
  $withoutMarks = [regex]::Replace($normalized, '\p{Mn}', '')
  $lower = $withoutMarks.ToLowerInvariant()
  $lower = $lower -replace '[^a-z0-9]+', ' '
  return ($lower -replace '\s+', ' ').Trim()
}

function Expand-NameAbbreviations {
  param([AllowNull()][string]$Text)
  $norm = Normalize-Text $Text
  if (-not $norm) { return "" }
  $expanded = " $norm "
  $expanded = $expanded -replace ' hs ', ' hospital '
  $expanded = $expanded -replace ' ho ', ' hospital '
  $expanded = $expanded -replace ' hc ', ' hospital '
  $expanded = $expanded -replace ' hosp ', ' hospital '
  $expanded = $expanded -replace ' pa ', ' pronto atendimento '
  $expanded = $expanded -replace ' cc ', ' clinica '
  $expanded = $expanded -replace ' lab ', ' laboratorio '
  $expanded = $expanded -replace '\s+', ' '
  return $expanded.Trim()
}

function Get-Tokens {
  param([string]$Text)
  $norm = Expand-NameAbbreviations $Text
  if (-not $norm) { return @() }
  return $norm.Split(" ") | Where-Object { $_.Length -gt 1 -and $stopWords -notcontains $_ }
}

function Parse-Number {
  param([AllowNull()][string]$Text)
  if ([string]::IsNullOrWhiteSpace($Text)) { return $null }
  $raw = ([string]$Text).Trim()
  $raw = $raw -replace '\s', ''
  $raw = $raw -replace 'R\$', ''
  $raw = $raw -replace '%', ''
  $raw = $raw -replace '[^\d,\.\-]', ''
  if (-not $raw -or $raw -eq "-" -or $raw -eq ".") { return $null }

  if ($raw.Contains(",") -and $raw.Contains(".")) {
    if ($raw.LastIndexOf(",") -gt $raw.LastIndexOf(".")) {
      $raw = $raw -replace '\.', ''
      $raw = $raw -replace ',', '.'
    } else {
      $raw = $raw -replace ',', ''
    }
  } elseif ($raw.Contains(",")) {
    $raw = $raw -replace ',', '.'
  }

  $value = 0.0
  if ([double]::TryParse($raw, [System.Globalization.NumberStyles]::Float, [System.Globalization.CultureInfo]::InvariantCulture, [ref]$value)) {
    return [math]::Round($value, 2)
  }
  return $null
}

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
    if ($target.StartsWith("/")) { $target = $target.TrimStart("/") }
    elseif ($target -notlike 'xl/*') { $target = "xl/$target" }
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
  param($Cell, [string[]]$SharedStrings, $Ns)
  $type = [string]$Cell.t
  if ($type -eq 's') {
    $valueNode = $Cell.SelectSingleNode('x:v', $Ns)
    if (-not $valueNode) { return "" }
    $idx = [int]$valueNode.InnerText
    if ($idx -ge 0 -and $idx -lt $SharedStrings.Length) { return $SharedStrings[$idx] }
    return ""
  }
  if ($type -eq 'inlineStr') {
    $parts = @()
    foreach ($node in $Cell.SelectNodes('.//x:t', $Ns)) {
      $parts += $node.InnerText
    }
    return ($parts -join "")
  }
  $v = $Cell.SelectSingleNode('x:v', $Ns)
  if ($v) { return [string]$v.InnerText }
  return ""
}

function Read-XlsxCells {
  param([string]$Path)
  $zip = [System.IO.Compression.ZipFile]::OpenRead($Path)
  try {
    $sharedStrings = Decode-SharedStrings $zip
    $sheets = Get-Sheets $zip
    $cells = New-Object System.Collections.Generic.List[object]
    foreach ($sheet in $sheets) {
      $sheetNorm = Normalize-Text $sheet.Name
      if ($sheetNorm -notlike "*ev por ae*") { continue }
      $sheetXmlText = Get-ZipText $zip $sheet.Path
      if (-not $sheetXmlText) { continue }
      [xml]$sheetXml = $sheetXmlText
      $ns = New-Object System.Xml.XmlNamespaceManager($sheetXml.NameTable)
      $ns.AddNamespace('x', 'http://schemas.openxmlformats.org/spreadsheetml/2006/main')
      foreach ($rowNode in $sheetXml.SelectNodes('//x:sheetData/x:row', $ns)) {
        $row = 0
        if ($rowNode.r) { $row = [int]$rowNode.r }
        if ($row -gt $MaxRows) { continue }
        foreach ($cell in $rowNode.SelectNodes('x:c', $ns)) {
          $ref = [string]$cell.r
          $col = Get-ColIndex $ref
          if ($col -gt $MaxCols) { continue }
          $text = (Get-CellText $cell $sharedStrings $ns).Trim()
          if ($text.Length -eq 0) { continue }
          $numeric = Parse-Number $text
          $cells.Add([pscustomobject]@{
            Sheet = [string]$sheet.Name
            Ref = $ref
            Row = $row
            Col = $col
            Text = $text
            Norm = Normalize-Text $text
            Number = $numeric
          })
        }
      }
    }
    return $cells.ToArray()
  }
  finally {
    $zip.Dispose()
  }
}

function Get-CellAt {
  param([object[]]$Cells, [int]$Row, [int]$Col)
  return @($Cells | Where-Object { $_.Row -eq $Row -and $_.Col -eq $Col } | Select-Object -First 1)[0]
}

function Get-CellTextAt {
  param([object[]]$Cells, [int]$Row, [int]$Col)
  $cell = Get-CellAt $Cells $Row $Col
  if ($cell) { return [string]$cell.Text }
  return ""
}

function Get-CellNumberAt {
  param([object[]]$Cells, [int]$Row, [int]$Col)
  $cell = Get-CellAt $Cells $Row $Col
  if ($cell -and $cell.Number -ne $null) { return [double]$cell.Number }
  return $null
}

function Map-EvSummaryDescription {
  param([string]$Description)
  $norm = Normalize-Text $Description
  if (-not $norm) { return $null }
  if ($norm -match '^aditivo| aditivo ') { return "sics" }
  if ($norm -match '^sic| sic ') { return "sics" }
  if ($norm -match 'taxa de risco') { return "taxa-risco" }
  if ($norm -match 'projetos tecnicos') { return "projetos-tecnicos" }
  if ($norm -match 'projetos legalizacao') { return "projetos-legalizacao" }
  if ($norm -match '^civil$|adequacoes civis|construcao civil') { return "adequacoes-civis" }
  if ($norm -match '^estrutura$|^estruturas$') { return "estruturas" }
  if ($norm -eq 'obra') { return "adequacoes-civis" }
  if ($norm -match 'faturamento direto') { return "outras-linhas-ev" }
  if ($norm -match '^chamada hospitalar$') { return "dados-e-voz-seguranca-patrimonial-chamada-hospitalar" }
  if ($norm -match 'dados e voz seguranca patrimonial chamada hospitalar') { return "dados-e-voz-seguranca-patrimonial-chamada-hospitalar" }
  if ($norm -match 'dados voz') { return "dados-voz-cftv-chamada" }
  if ($norm -match 'equipamentos de climatizacao') { return "equipamentos-de-climatizacao" }
  if ($norm -match 'artefatos.*inox') { return "artefatos-inox" }
  if ($norm -match 'marcenaria') { return "marcenaria" }
  if ($norm -match 'reguas medicinais') { return "reguas-medicinais" }
  if ($norm -match 'gerador|subestacao|transformador') { return "gerador-subestacao-transformador-cubiculos" }
  if ($norm -match 'elevadores|plataforma elevatoria') { return "elevadores-plataforma-elevatoria" }
  if ($norm -match 'compressor|bomba de vacuo|driox') { return "compressor-bomba-de-vacuo-driox" }
  if ($norm -match 'it medico|nobreak') { return "it-medico-nobreak" }
  if ($norm -match '^ete|estacao de tratamento de esgoto|^eta|estacao de tratamento de agua') { return "ete-eta" }
  if ($norm -match 'controle de acessos|catraca') { return "controle-acessos" }
  if ($norm -match 'planejamento de obras') { return "planejamento-obras" }
  if ($norm -match 'contas de consumo') { return "contas-consumo" }
  if ($norm -match 'comunicacao visual') { return "comunicacao-visual-externa-e-interna" }
  if ($norm -match 'quadros eletricos') { return "quadros-eletricos" }
  if ($norm -match 'aquecimento') { return "sistema-de-aquecimento-de-agua" }
  if ($norm -match 'livre|outras linhas') { return "outras-linhas-ev" }
  return $null
}

function Find-FirstCell {
  param(
    [object[]]$Cells,
    [int]$Col,
    [string]$Pattern
  )
  return @($Cells | Where-Object { $_.Col -eq $Col -and $_.Norm -match $Pattern } | Sort-Object Row | Select-Object -First 1)[0]
}

function Find-EvHeaderRow {
  param([object[]]$Cells)
  $headers = @($Cells | Where-Object { $_.Col -eq 1 -and $_.Norm -eq "item" } | Sort-Object Row)
  foreach ($header in $headers) {
    $description = Get-CellTextAt $Cells $header.Row 2
    $value = Get-CellTextAt $Cells $header.Row 3
    if ((Normalize-Text $description) -match 'descricao' -and (Normalize-Text $value) -match 'valor') {
      return [int]$header.Row
    }
  }
  if ($headers.Length -gt 0) { return [int]$headers[0].Row }
  return 22
}

function Find-NearNumber {
  param(
    [object[]]$Cells,
    $LabelCell,
    [int]$MaxRows = 3,
    [int]$MaxCols = 12
  )
  $candidates = $Cells | Where-Object {
    $_.Sheet -eq $LabelCell.Sheet -and
    $_.Row -ge $LabelCell.Row -and
    $_.Row -le ($LabelCell.Row + $MaxRows) -and
    $_.Col -gt $LabelCell.Col -and
    $_.Col -le ($LabelCell.Col + $MaxCols) -and
    $_.Number -ne $null
  }
  $ranked = $candidates | Sort-Object `
    @{ Expression = { [math]::Abs($_.Row - $LabelCell.Row) } }, `
    @{ Expression = { $_.Col } }
  foreach ($candidate in $ranked) {
    if ([math]::Abs([double]$candidate.Number) -gt 0.0001) { return [double]$candidate.Number }
  }
  if ($ranked) { return [double]$ranked[0].Number }
  return $null
}

function Find-LabelValue {
  param([object[]]$Cells, [string[]]$Needles)
  foreach ($needle in $Needles) {
    $normNeedle = Normalize-Text $needle
    $labels = $Cells | Where-Object { $_.Norm -like "*$normNeedle*" }
    foreach ($label in $labels) {
      $value = Find-NearNumber $Cells $label 4 16
      if ($value -ne $null) { return [double]$value }
    }
  }
  return $null
}

function Get-RowStatus {
  param([object[]]$Cells, $LabelCell)
  $rowText = (($Cells | Where-Object { $_.Sheet -eq $LabelCell.Sheet -and $_.Row -eq $LabelCell.Row } | Select-Object -ExpandProperty Norm) -join " ")
  if ($rowText -match 'nao se aplica|naoseaplica') { return "Não se aplica" }
  if ($rowText -match 'cotado') { return "Cotado" }
  if ($rowText -match 'orcado') { return "Orçado" }
  if ($rowText -match 'estimado') { return "Estimado" }
  return $null
}

function Find-DisciplineValue {
  param([object[]]$Cells, [hashtable]$Discipline)
  $normName = Normalize-Text $Discipline.nome
  $aliasNeedles = @($normName)
  foreach ($alias in $disciplineAliases.Keys) {
    if ($disciplineAliases[$alias] -eq $Discipline.id) {
      $aliasNeedles += (Normalize-Text $alias)
    }
  }
  $matches = @()
  foreach ($needle in ($aliasNeedles | Select-Object -Unique)) {
    if (-not $needle) { continue }
    $matches += $Cells | Where-Object {
      $_.Norm -eq $needle -or
      $_.Norm -like "$needle *" -or
      $_.Norm -like "* $needle" -or
      $_.Norm -like "* $needle *"
    }
  }
  $best = $null
  foreach ($match in ($matches | Sort-Object Sheet, Row, Col -Unique)) {
    $rowNumbers = $Cells | Where-Object {
      $_.Sheet -eq $match.Sheet -and
      $_.Row -ge $match.Row -and
      $_.Row -le ($match.Row + 1) -and
      $_.Col -gt $match.Col -and
      $_.Col -le ($match.Col + 18) -and
      $_.Number -ne $null
    }
    if (-not $rowNumbers) { continue }
    $number = ($rowNumbers | Where-Object { [math]::Abs([double]$_.Number) -gt 1 } | Sort-Object @{ Expression = { [math]::Abs([double]$_.Number) }; Descending = $true } | Select-Object -First 1)
    if (-not $number) { $number = $rowNumbers | Select-Object -First 1 }
    $status = Get-RowStatus $Cells $match
    $candidate = [pscustomobject]@{
      Value = [double]$number.Number
      Status = $status
      Sheet = $match.Sheet
      Row = $match.Row
    }
    if (-not $best -or [math]::Abs($candidate.Value) -gt [math]::Abs($best.Value)) {
      $best = $candidate
    }
  }
  return $best
}

function Get-EvTitle {
  param([string]$FileName)
  $title = [System.IO.Path]::GetFileNameWithoutExtension($FileName)
  $title = $title -replace '(?i)\s*-\s*estudo\s+de\s+viabilidade\s+r\d+\s*$', ''
  $title = $title -replace '(?i)\s*-\s*estudo\s+de\s+viabilidade\s*$', ''
  $title = $title -replace '(?i)\s*-\s*estudo\s+de\s+viabilidade.*$', ''
  $title = $title -replace '^\s*obra\s+', ''
  $title = $title -replace '^\s*\d{4}\s*[\.]?\s*', ''
  return $title.Trim()
}

function Get-EvCode {
  param([string]$FileName)
  $m = [regex]::Match($FileName, '^\s*(?:Obra\s*)?(\d{4})')
  if ($m.Success) { return $m.Groups[1].Value }
  return ""
}

function Get-EvRevision {
  param([string]$FileName)
  $m = [regex]::Match($FileName, '(?i)R(\d{2})')
  if ($m.Success) { return [int]$m.Groups[1].Value }
  return 0
}

function Get-WorkName {
  param($Work)
  if ($Work -is [System.Collections.IDictionary]) {
    foreach ($prop in @("nome", "name", "obra")) {
      if ($Work.ContainsKey($prop) -and $Work[$prop]) { return [string]$Work[$prop] }
    }
    return ""
  }
  foreach ($prop in @("nome", "name", "obra")) {
    if ($Work.PSObject.Properties[$prop] -and $Work.$prop) { return [string]$Work.$prop }
  }
  return ""
}

function Match-Work {
  param([object[]]$Works, [string]$Code, [string]$Title)
  if ($Code -and $Code -ne "0000") {
    $codeMatch = $Works | Where-Object {
      ([string]$_.codigoOriginal) -eq $Code -or
      ([string]$_.codigo) -eq $Code -or
      ([string]$_.code) -eq $Code -or
      ([string]$_.chaveUnica) -match "(^|[^0-9])$([regex]::Escape($Code))([^0-9]|$)"
    } | Select-Object -First 1
    if ($codeMatch) { return $codeMatch }
  }

  $titleNorm = Expand-NameAbbreviations $Title
  if (-not $titleNorm) { return $null }
  $exact = $Works | Where-Object { (Expand-NameAbbreviations (Get-WorkName $_)) -eq $titleNorm } | Select-Object -First 1
  if ($exact) { return $exact }

  $contains = $Works | Where-Object {
    $workNorm = Expand-NameAbbreviations (Get-WorkName $_)
    $workNorm -and ($workNorm.Contains($titleNorm) -or $titleNorm.Contains($workNorm))
  } | Select-Object -First 1
  if ($contains) { return $contains }

  $titleTokens = @(Get-Tokens $Title)
  if (-not $titleTokens.Length) { return $null }
  $best = $null
  $bestScore = 0
  foreach ($work in $Works) {
    $workTokens = @(Get-Tokens (Get-WorkName $work))
    if (-not $workTokens.Length) { continue }
    $intersect = @($titleTokens | Where-Object { $workTokens -contains $_ } | Select-Object -Unique)
    $denominator = [math]::Max(1, [math]::Min($titleTokens.Length, $workTokens.Length))
    $score = $intersect.Length / $denominator
    if ($score -gt $bestScore) {
      $bestScore = $score
      $best = $work
    }
  }
  if ($bestScore -ge 0.55) { return $best }
  return $null
}

function Read-State {
  param([string]$Path)
  $content = Get-Content -LiteralPath $Path -Raw -Encoding UTF8
  $match = [regex]::Match($content, 'window\.TRACO_IMPORTED_STATE\s*=\s*(\{[\s\S]*\})\s*;?\s*$')
  if (-not $match.Success) { throw "Não foi possível localizar window.TRACO_IMPORTED_STATE em $Path" }
  $serializer = New-Object System.Web.Script.Serialization.JavaScriptSerializer
  $serializer.MaxJsonLength = [int]::MaxValue
  return $serializer.DeserializeObject($match.Groups[1].Value)
}

function Write-State {
  param($State, [string]$Path)
  $json = (Convert-ToPlainData $State) | ConvertTo-Json -Depth 100 -Compress
  Set-Content -LiteralPath $Path -Encoding UTF8 -Value "window.TRACO_IMPORTED_STATE = $json;"
}

function Convert-ToPlainData {
  param($Value, [int]$Depth = 0)
  if ($Depth -gt 120) { return $null }
  if ($null -eq $Value) { return $null }
  $typeName = $Value.GetType().FullName
  if ($Value -is [string] -or $Value -is [bool] -or $Value.GetType().IsPrimitive -or $Value -is [decimal]) { return $Value }
  if ($Value -is [datetime]) {
    return $Value.ToString("yyyy-MM-ddTHH:mm:ss.fffK", [System.Globalization.CultureInfo]::InvariantCulture)
  }
  if ($Value -is [System.Collections.IDictionary]) {
    $hash = @{}
    foreach ($key in $Value.Keys) {
      $hash[[string]$key] = Convert-ToPlainData $Value[$key] ($Depth + 1)
    }
    return $hash
  }
  if ($Value -is [System.Collections.IEnumerable]) {
    $items = New-Object System.Collections.Generic.List[object]
    foreach ($item in $Value) {
      $items.Add((Convert-ToPlainData $item ($Depth + 1)))
    }
    return ,($items.ToArray())
  }
  if ($typeName -eq "System.Management.Automation.PSCustomObject") {
    $props = @($Value.PSObject.Properties | Where-Object { $_.MemberType -eq "NoteProperty" -or $_.MemberType -eq "Property" })
    $hash = @{}
    foreach ($prop in $props) {
      $hash[$prop.Name] = Convert-ToPlainData $prop.Value ($Depth + 1)
    }
    return $hash
  }
  return [string]$Value
}

function Ensure-Hashtable {
  param($Value)
  if ($Value -is [hashtable]) { return $Value }
  $hash = @{}
  if ($Value -ne $null) {
    if ($Value -is [System.Collections.IDictionary]) {
      foreach ($key in $Value.Keys) {
        $hash[[string]$key] = $Value[$key]
      }
    } else {
      foreach ($prop in $Value.PSObject.Properties) {
        $hash[$prop.Name] = $prop.Value
      }
    }
  }
  return $hash
}

function Get-ExistingLine {
  param($Lines, [string]$DisciplineId)
  if (-not $Lines) { return $null }
  return @($Lines | Where-Object { [string]$_["disciplinaId"] -eq $DisciplineId }) | Select-Object -First 1
}

$state = Read-State $StatePath
$works = @($state["works"])
$files = Get-ChildItem -LiteralPath $EvFolder -Filter $FilePattern | Sort-Object Name
if ($MaxFiles -gt 0) {
  $files = @($files | Select-Object -First $MaxFiles)
}
$todayIso = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffZ", [System.Globalization.CultureInfo]::InvariantCulture)
$todayDate = (Get-Date).ToString("yyyy-MM-dd")
$importResults = New-Object System.Collections.Generic.List[object]
$updated = 0
$unmatched = 0

foreach ($file in $files) {
  $title = Get-EvTitle $file.Name
  $code = Get-EvCode $file.Name
  $revision = Get-EvRevision $file.Name
  $work = Match-Work $works $code $title
  if (-not $work) {
    $unmatched += 1
    $importResults.Add([pscustomobject]@{
      File = $file.Name
      Matched = $false
      Title = $title
      Code = $code
      Reason = "Sem obra correspondente"
    })
    continue
  }

  $cells = Read-XlsxCells $file.FullName
  if (-not $cells -or $cells.Count -eq 0) {
    $unmatched += 1
    $importResults.Add([pscustomobject]@{
      File = $file.Name
      Matched = $false
      Title = $title
      Code = $code
      Reason = "Aba I - EV por AE não encontrada"
    })
    continue
  }
  $areaConstruida = Find-LabelValue $cells @("Área de Construção", "Área Construída", "Area de Construcao", "Area Construida")
  if ($areaConstruida -eq $null -or $areaConstruida -le 0) { $areaConstruida = Get-CellNumberAt $cells 5 3 }
  if ($areaConstruida -eq $null -or $areaConstruida -le 0) { $areaConstruida = Get-CellNumberAt $cells 4 3 }
  if ($areaConstruida -eq $null -or $areaConstruida -le 0) { $areaConstruida = Get-CellNumberAt $cells 3 20 }
  $areaEquivalente = Find-LabelValue $cells @("Área Equivalente", "Area Equivalente")
  if ($areaEquivalente -eq $null -or $areaEquivalente -le 0) { $areaEquivalente = Get-CellNumberAt $cells 6 3 }
  if ($areaEquivalente -eq $null -or $areaEquivalente -le 0) { $areaEquivalente = Get-CellNumberAt $cells 5 3 }
  if ($areaEquivalente -eq $null -or $areaEquivalente -le 0) { $areaEquivalente = Get-CellNumberAt $cells 5 20 }

  $headerRow = Find-EvHeaderRow $cells
  $totalNoRiskLabel = Find-FirstCell $cells 2 'total geral.*sem taxa de risco'
  $totalGeneralLabel = Find-FirstCell $cells 2 '^total geral$|^total geral:$'
  $totalEv = $null
  $custoM2 = $null
  if ($totalNoRiskLabel) {
    $totalEv = Get-CellNumberAt $cells $totalNoRiskLabel.Row 3
    $custoM2 = Get-CellNumberAt $cells $totalNoRiskLabel.Row 6
  }
  if (($totalEv -eq $null -or $totalEv -le 0) -and $totalGeneralLabel) {
    $totalEv = Get-CellNumberAt $cells $totalGeneralLabel.Row 3
    $custoM2 = Get-CellNumberAt $cells $totalGeneralLabel.Row 6
  }
  if ($totalEv -eq $null -or $totalEv -le 0) { $totalEv = Get-CellNumberAt $cells 52 3 }
  if ($totalEv -eq $null -or $totalEv -le 0) { $totalEv = Get-CellNumberAt $cells 51 3 }
  if ($custoM2 -eq $null -or $custoM2 -le 0) { $custoM2 = Get-CellNumberAt $cells 52 6 }
  if ($custoM2 -eq $null -or $custoM2 -le 0) { $custoM2 = Get-CellNumberAt $cells 51 6 }

  $lines = New-Object System.Collections.Generic.List[object]
  foreach ($discipline in $disciplines) {
    $existingEv = Ensure-Hashtable $work["ev"]
    $existingLine = Get-ExistingLine $existingEv["lines"] $discipline.id
    $existingLineHash = Ensure-Hashtable $existingLine
    $line = @{
      disciplinaId = $discipline.id
      valorOrcado = 0
      status = "Não se aplica"
    }
    foreach ($keepKey in @("sicIds", "sicDetails", "demandaIds", "riskExceeded")) {
      if ($existingLineHash.ContainsKey($keepKey)) { $line[$keepKey] = $existingLineHash[$keepKey] }
    }
    $lines.Add($line)
  }

  $dataStartRow = [math]::Max(1, [int]$headerRow + 1)
  $dataEndRow = $MaxRows
  if ($totalGeneralLabel) { $dataEndRow = [math]::Min($dataEndRow, [int]$totalGeneralLabel.Row - 1) }
  if ($totalNoRiskLabel) { $dataEndRow = [math]::Min($dataEndRow, [int]$totalNoRiskLabel.Row - 1) }
  if ($dataEndRow -lt $dataStartRow) { $dataEndRow = $MaxRows }

  foreach ($rowIndex in $dataStartRow..$dataEndRow) {
    $itemNumber = Get-CellNumberAt $cells $rowIndex 1
    if ($itemNumber -eq $null -or $itemNumber -le 0) { continue }
    $description = Get-CellTextAt $cells $rowIndex 2
    $disciplineId = Map-EvSummaryDescription $description
    if (-not $disciplineId) { $disciplineId = "outras-linhas-ev" }
    $value = Get-CellNumberAt $cells $rowIndex 3
    if ($value -eq $null -or [math]::Abs([double]$value) -lt 0.0001) { continue }
    $targetLine = @($lines | Where-Object { $_["disciplinaId"] -eq $disciplineId } | Select-Object -First 1)[0]
    if (-not $targetLine) { continue }
    $targetLine["valorOrcado"] = [math]::Round([double]$targetLine["valorOrcado"] + [double]$value, 2)
    $rowStatus = Get-CellTextAt $cells $rowIndex 5
    if ((Normalize-Text $rowStatus) -match 'cotado') {
      $targetLine["status"] = "Cotado"
    } elseif ($targetLine["status"] -ne "Cotado") {
      $targetLine["status"] = "Orçado"
    }
  }

  $lineSumNoRisk = 0
  $lineSumWithRisk = 0
  foreach ($lineForTotal in $lines) {
    if ($lineForTotal["status"] -eq "Não se aplica") { continue }
    $lineValue = [double]$lineForTotal["valorOrcado"]
    $lineSumWithRisk += $lineValue
    if ($lineForTotal["disciplinaId"] -ne "taxa-risco") {
      $lineSumNoRisk += $lineValue
    }
  }
  if (-not $totalEv -or $totalEv -le 0) { $totalEv = [double]$lineSumNoRisk }
  if (($areaEquivalente -eq $null -or $areaEquivalente -le 0) -and $work["areaEquivalente"]) { $areaEquivalente = [double]$work["areaEquivalente"] }
  if (($areaConstruida -eq $null -or $areaConstruida -le 0) -and $work["areaConstruida"]) { $areaConstruida = [double]$work["areaConstruida"] }
  if (($custoM2 -eq $null -or $custoM2 -le 0) -and $areaEquivalente -and $areaEquivalente -gt 0) { $custoM2 = [math]::Round([double]$totalEv / [double]$areaEquivalente, 2) }

  $applicableCount = @($lines | Where-Object { $_["status"] -ne "Não se aplica" -and [double]$_["valorOrcado"] -gt 0 }).Length
  $workName = Get-WorkName $work
  $importResults.Add([pscustomobject]@{
    File = $file.Name
    Matched = $true
    WorkId = $work["id"]
    Work = $workName
    Code = $code
    Revision = $revision
    AreaConstruida = $areaConstruida
    AreaEquivalente = $areaEquivalente
    TotalEV = [math]::Round([double]$totalEv, 2)
    SumLines = [math]::Round([double]$lineSumWithRisk, 2)
    Lines = $applicableCount
  })

  if ($Apply) {
    $existingEv = Ensure-Hashtable $work["ev"]
    $previousVersion = if ($existingEv.ContainsKey("versaoAtual")) { [int]$existingEv["versaoAtual"] } else { 0 }
    $versionNumber = if ($revision -gt 0) { $revision } else { [math]::Max(1, $previousVersion) }
    $versions = @()
    if ($existingEv["versions"]) { $versions = @($existingEv["versions"]) }
    $origin = "Importação EV XLSX - $($file.Name)"
    $versions = @($versions | Where-Object { (Ensure-Hashtable $_)["origem"] -ne $origin })
    $versions += @{
      numero = $versionNumber
      data = $file.LastWriteTime.ToString("yyyy-MM-dd")
      origem = $origin
      valorTotal = [math]::Round([double]$totalEv, 2)
      custoM2 = if ($custoM2) { [math]::Round([double]$custoM2, 2) } else { 0 }
      diffPorDisciplina = @()
    }

    $anexos = @()
    if ($existingEv["anexos"]) { $anexos = @($existingEv["anexos"]) }
    $attachmentId = "ev-file-$($work["id"])-r$($versionNumber)"
    $anexos = @($anexos | Where-Object { (Ensure-Hashtable $_)["id"] -ne $attachmentId })
    $anexos += @{
      id = $attachmentId
      nome = $file.Name
      tipo = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      tamanho = [int64]$file.Length
      data = $file.LastWriteTime.ToString("yyyy-MM-dd")
      origem = "Importação EV XLSX"
      caminho = $file.FullName
    }

    $work["areaConstruida"] = if ($areaConstruida) { [math]::Round([double]$areaConstruida, 2) } else { 0 }
    $work["areaEquivalente"] = if ($areaEquivalente) { [math]::Round([double]$areaEquivalente, 2) } else { 0 }
    $previousArea = 0
    if ($work.ContainsKey("area") -and $work["area"] -ne $null) { $previousArea = [double]$work["area"] }
    $work["area"] = if ($areaEquivalente) { [math]::Round([double]$areaEquivalente, 2) } elseif ($areaConstruida) { [math]::Round([double]$areaConstruida, 2) } else { $previousArea }
    $work["updatedAt"] = $todayIso
    $work["ev"] = @{
      id = if ($existingEv["id"]) { $existingEv["id"] } else { "EV-$($work["id"])" }
      versaoAtual = $versionNumber
      status = if ($applicableCount -gt 0) { "Completo" } else { "Rascunho" }
      lines = @($lines | Sort-Object { $discipline = $_["disciplinaId"]; ($disciplines | Where-Object { $_.id -eq $discipline } | Select-Object -First 1).posicao })
      versions = $versions
      anexos = $anexos
      sicIds = if ($existingEv["sicIds"]) { $existingEv["sicIds"] } else { @() }
      demandaIds = if ($existingEv["demandaIds"]) { $existingEv["demandaIds"] } else { @() }
      sourceFile = $file.FullName
      sourceImportedAt = $todayIso
    }
    $updated += 1
  }
}

$matched = $importResults | Where-Object { $_.Matched }
Write-Output "Modo: $(if ($Apply) { "APLICAÇÃO" } else { "RELATÓRIO" })"
Write-Output "Arquivos encontrados: $($files.Count)"
Write-Output "Arquivos casados com obras: $(@($matched).Count)"
Write-Output "Arquivos sem correspondência: $unmatched"
Write-Output ""
foreach ($result in ($importResults | Where-Object { -not $_.Matched })) {
  Write-Output "SEM_CORRESPONDENCIA | codigo=$($result.Code) | titulo=$($result.Title) | arquivo=$($result.File)"
}
if ($unmatched -gt 0) { Write-Output "" }
foreach ($result in ($importResults | Where-Object { $_.Matched })) {
  Write-Output "CASADO | obra=$($result.Work) | codigo=$($result.Code) | rev=$($result.Revision) | total=$($result.TotalEV) | arquivo=$($result.File)"
}
Write-Output ""
$importResults |
  Sort-Object Matched, Work, File -Descending |
  Select-Object Matched, Work, Code, Revision, AreaConstruida, AreaEquivalente, TotalEV, SumLines, Lines, Reason, File |
  Format-Table -AutoSize -Wrap

if ($Apply) {
  $state["importedAt"] = $todayIso
  $state["version"] = "$($state["version"]) + ev-xlsx-$todayDate"
  if (-not $state.ContainsKey("history") -or -not $state["history"]) { $state["history"] = @() }
  $history = @($state["history"])
  $history = @(@{
    id = "hist-ev-xlsx-$([DateTimeOffset]::UtcNow.ToUnixTimeSeconds())"
    entidade = "ev"
    entidadeId = "importacao-xlsx"
    campo = "importação EV XLSX"
    valorAnterior = "Base anterior"
    valorNovo = "$updated EV(s) atualizados a partir de $($files.Count) arquivo(s)"
    timestamp = $todayIso
  }) + $history
  $state["history"] = $history

  $backup = "$StatePath.bak-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
  Copy-Item -LiteralPath $StatePath -Destination $backup
  Write-State $state $StatePath
  Write-Output ""
  Write-Output "Base atualizada: $StatePath"
  Write-Output "Backup criado: $backup"
}
