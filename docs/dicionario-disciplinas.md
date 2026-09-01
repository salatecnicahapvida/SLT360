# Dicionário Canônico de Disciplinas

## 1. Regras

O dicionário de disciplinas é canônico e deve ser controlado por configuração.

Regras:

- A posição é imutável.
- Não reordenar disciplinas.
- Não excluir disciplinas.
- Inativar quando necessário.
- Novas disciplinas entram sempre no final.
- Todo valor financeiro do EV deve apontar para uma disciplina deste dicionário.
- Texto livre não deve ser usado como linha financeira.

## 2. Campos Recomendados

```json
{
  "nome": "string",
  "categoria": "CustosDaObra | OutrasCategorias",
  "posicao": 1,
  "ativo": true,
  "selecionavelParaSIC": true
}
```

## 3. Custos da Obra

| Posição | Disciplina | Selecionável para SIC |
| --- | --- | --- |
| 1 | Fundações e Contenções | Sim |
| 2 | Estruturas | Sim |
| 3 | Adequações Civis | Sim |
| 4 | Fachadas | Sim |
| 5 | Instalações Elétricas e SPDA | Sim |
| 6 | Instalações Hidrossanitárias | Sim |
| 7 | Instalações de Gases Medicinais | Sim |
| 8 | Instalações de Combate a Incêndio | Sim |
| 9 | Instalações de SPDA | Sim |
| 10 | Instalações de Climatização e Exaustão | Sim |
| 11 | Infraestrutura de Dados/Voz/Seg. Patrimonial/CFTV/Chamada | Sim |
| 12 | Custos Indiretos | Sim |
| 13 | Instalações de GLP | Sim |

## 4. Outras Categorias

| Posição | Disciplina | Selecionável para SIC |
| --- | --- | --- |
| 14 | Projetos Técnicos | Sim |
| 15 | Projetos Legalização | Sim |
| 16 | Dados e Voz/Segurança Patrimonial/Chamada Hospitalar | Sim |
| 17 | Equipamentos de Climatização | Sim |
| 18 | Artefatos em Inox | Sim |
| 19 | Marcenaria | Sim |
| 20 | Réguas Medicinais | Sim |
| 21 | Gerador/Subestação/Transformador/Cubículos | Sim |
| 22 | Elevadores/Plataforma Elevatória | Sim |
| 23 | Compressor/Bomba de Vácuo/Driox | Sim |
| 24 | IT Médico/Nobreak | Sim |
| 25 | ETE/ETA | Sim |
| 26 | Correio Pneumático | Sim |
| 27 | Controle de Acessos | Sim |
| 28 | Planejamento de Obras | Sim |
| 29 | Contas de Consumo | Sim |
| 30 | Comunicação Visual Externa e Interna | Sim |
| 31 | Quadros Elétricos | Sim |
| 32 | SIC's | Não |
| 33 | Sistemas de Automação | Sim |
| 34 | Taxa de Risco (5%) | Não |
| 35 | Blindagem | Sim |
| 36 | Paisagismo | Sim |
| 37 | Câmara Fria | Sim |

## 5. Observações sobre Itens Especiais

### `SIC's`

Permanece no dicionário apenas por compatibilidade histórica. Não deve receber novos lançamentos, nem aparecer como opção no formulário de SIC.

### `Taxa de Risco (5%)`

Permanece como linha financeira controlada, mas não deve ser usada como disciplina afetada por SIC.

### `Outras Linhas do EV`

Não é disciplina canônica. Se existir como fallback no comparador, deve ser removida do fluxo novo. O comparador deve usar `diffPorDisciplina`.
