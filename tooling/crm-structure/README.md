# CRM Structure — setup do Twenty (substituindo o Monday.com)

Script idempotente que cria, numa instância **Twenty self-hosted**, a estrutura de
objetos/campos/funil/views que espelha o setup do Monday.com da Delipe — via a
**Metadata GraphQL API** (`POST /metadata`). Não altera o código core do Twenty.

## O que ele cria

- **Company** (standard) + campos: CNPJ, Região de Atendimento, B2B/B2C, País, "Cliente já é Base?", Origem.
- **Person** (standard) + campos: Cargo, Telefone/E-mail do financeiro.
- **Opportunity** (standard) = funil de vendas:
  - campo `stage` reescrito com os **14 estágios** do board "Leads | Brasil";
  - campos: Canal, Origem do Lead, Qualidade, Temperatura, Tipo, MRR (R$), Implantação (R$),
    datas de cada etapa, Detalhes, e relações SDR/Closer → membros da equipe;
  - view **Kanban "Funil de Vendas"** agrupada por estágio, somando MRR.
- **Objetos custom**: `financeiro`, `assessoria`, `onboarding`, `listaFria`, `vendaBase`, `glaper`,
  cada um com seus campos, relação → Company e uma view Kanban por status.

A estrutura completa fica declarada em [`spec.mjs`](./spec.mjs) — edite lá para ajustar
campos, opções de select ou cores.

## Pré-requisitos

1. Twenty rodando (Docker): `cd packages/twenty-docker && docker compose up -d` → http://localhost:3000
2. Conta criada na UI.
3. **API token**: na UI, _Settings → APIs & Webhooks → Create API Key_. Copie o token.

> Node 20+ (usa `fetch` global). Sem `npm install` — script puro.

## Rodar

```bash
# pré-visualizar (não grava nada)
TWENTY_API_TOKEN=<seu-token> DRY_RUN=1 node tooling/crm-structure/apply.mjs

# aplicar
TWENTY_API_TOKEN=<seu-token> node tooling/crm-structure/apply.mjs
```

Variáveis opcionais:
- `TWENTY_BASE_URL` (default `http://localhost:3000`)

O script é **idempotente**: re-rodar só cria o que falta; o campo `stage` é sempre
reescrito com a lista de estágios do spec.

### Detalhe importante: colunas do Kanban (view groups)

A Metadata API **não** gera as colunas do Kanban automaticamente ao criar a view, e
**atualizar as opções de um SELECT apaga as colunas existentes** que referenciavam
valores antigos. Por isso o script, ao final, recria as colunas de toda view Kanban
(`createManyViewGroups`) a partir das opções atuais do campo de agrupamento — inclusive
da view padrão "By Stage", que quebra quando reescrevemos os estágios do `stage`. Se
você editar opções de um SELECT usado em Kanban pela UI/API, rode o script de novo para
reconstruir as colunas.

## Fase 2 (futuro)

Migração de dados (leads, clientes, financeiro…) do Monday para os records do Twenty
via a API `/graphql` — fora do escopo deste script.
