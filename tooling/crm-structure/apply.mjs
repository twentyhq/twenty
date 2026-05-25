#!/usr/bin/env node
// Aplica a estrutura do CRM (objetos/campos/funil/views) numa instância Twenty
// self-hosted, via Metadata GraphQL API (POST /metadata). Idempotente: re-rodar
// só cria o que falta. Sem dependências externas (usa fetch global do Node 20+).
//
// Uso:
//   TWENTY_API_TOKEN=<bearer> node tooling/crm-structure/apply.mjs
// Opcional:
//   TWENTY_BASE_URL=http://localhost:3000  (default)
//   DRY_RUN=1                              (só mostra o que faria)

import {
  STANDARD_OBJECTS,
  CUSTOM_OBJECTS,
  STANDARD_VIEWS,
  OPPORTUNITY_STAGES,
} from './spec.mjs';

const BASE_URL = process.env.TWENTY_BASE_URL ?? 'http://localhost:3000';
const TOKEN = process.env.TWENTY_API_TOKEN;
const DRY_RUN = process.env.DRY_RUN === '1';
const ENDPOINT = `${BASE_URL.replace(/\/$/, '')}/metadata`;

if (!TOKEN) {
  console.error('✖ Falta TWENTY_API_TOKEN. Gere uma API Key na UI: Settings → APIs & Webhooks.');
  process.exit(1);
}

// --- cliente GraphQL ------------------------------------------------------
async function gql(query, variables = {}) {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TOKEN}`,
    },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.errors) {
    const msg = json.errors ? json.errors.map((e) => e.message).join('; ') : `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return json.data;
}

// --- introspecção ---------------------------------------------------------
async function fetchState() {
  const data = await gql(`
    query {
      objects(paging: { first: 1000 }) {
        edges {
          node {
            id
            nameSingular
            namePlural
            labelSingular
            labelPlural
            isCustom
            fieldsList { id name type options }
          }
        }
      }
    }
  `);
  const byName = {};
  for (const { node } of data.objects.edges) {
    byName[node.nameSingular] = {
      id: node.id,
      nameSingular: node.nameSingular,
      labelSingular: node.labelSingular,
      labelPlural: node.labelPlural,
      fields: Object.fromEntries(node.fieldsList.map((f) => [f.name, f])),
    };
  }
  return byName;
}

async function fetchViews(objectMetadataId) {
  const data = await gql(
    `query ($oid: String) {
      getViews(objectMetadataId: $oid) {
        id name type mainGroupByFieldMetadataId
        viewGroups { id fieldValue position isVisible }
      }
    }`,
    { oid: objectMetadataId },
  );
  return data.getViews ?? [];
}

// --- mutations ------------------------------------------------------------
const CREATE_OBJECT = `
  mutation ($input: CreateOneObjectInput!) {
    createOneObject(input: $input) { id nameSingular }
  }`;
const CREATE_FIELD = `
  mutation ($input: CreateOneFieldMetadataInput!) {
    createOneField(input: $input) { id name type }
  }`;
const UPDATE_FIELD = `
  mutation ($input: UpdateOneFieldMetadataInput!) {
    updateOneField(input: $input) { id name options }
  }`;
const CREATE_VIEW = `
  mutation ($input: CreateViewInput!) {
    createView(input: $input) { id name type }
  }`;
const CREATE_MANY_VIEW_GROUPS = `
  mutation ($inputs: [CreateViewGroupInput!]!) {
    createManyViewGroups(inputs: $inputs) { id fieldValue }
  }`;

// Monta o objeto `field` da mutation a partir do spec + state (resolve relações).
function buildFieldInput(objectMetadataId, fieldSpec, state) {
  const base = {
    objectMetadataId,
    type: fieldSpec.type,
    name: fieldSpec.name,
    label: fieldSpec.label,
    icon: fieldSpec.icon,
    isLabelSyncedWithName: false,
  };
  if (fieldSpec.options) {
    base.options = fieldSpec.options;
    base.isNullable = true;
  }
  if (fieldSpec.type === 'RELATION') {
    const target = state[fieldSpec.relation.targetObject];
    if (!target) throw new Error(`Objeto alvo da relação não encontrado: ${fieldSpec.relation.targetObject}`);
    base.relationCreationPayload = {
      type: fieldSpec.relation.type,
      targetObjectMetadataId: target.id,
      targetFieldLabel: fieldSpec.relation.targetFieldLabel,
      targetFieldIcon: fieldSpec.relation.targetFieldIcon,
    };
  }
  return base;
}

// --- passos ---------------------------------------------------------------
let created = 0;
let skipped = 0;

async function ensureCustomObjects(state) {
  for (const obj of CUSTOM_OBJECTS) {
    if (state[obj.nameSingular]) {
      console.log(`  = objeto "${obj.nameSingular}" já existe`);
      skipped++;
      continue;
    }
    console.log(`  + criando objeto "${obj.nameSingular}"`);
    if (DRY_RUN) continue;
    await gql(CREATE_OBJECT, {
      input: {
        object: {
          nameSingular: obj.nameSingular,
          namePlural: obj.namePlural,
          labelSingular: obj.labelSingular,
          labelPlural: obj.labelPlural,
          icon: obj.icon,
          isLabelSyncedWithName: false,
        },
      },
    });
    created++;
  }
}

async function ensureFields(objectSpecList, state) {
  for (const objSpec of objectSpecList) {
    const obj = state[objSpec.nameSingular];
    if (!obj) {
      console.log(`  ! objeto "${objSpec.nameSingular}" inexistente — pulando campos`);
      continue;
    }
    for (const fieldSpec of objSpec.fields ?? []) {
      if (obj.fields[fieldSpec.name]) {
        skipped++;
        continue;
      }
      console.log(`  + ${objSpec.nameSingular}.${fieldSpec.name} (${fieldSpec.type})`);
      if (DRY_RUN) continue;
      try {
        await gql(CREATE_FIELD, { input: { field: buildFieldInput(obj.id, fieldSpec, state) } });
        created++;
      } catch (e) {
        console.log(`    ✖ falha em ${objSpec.nameSingular}.${fieldSpec.name}: ${e.message}`);
      }
    }
  }
}

async function updateOpportunityStage(state) {
  const opp = state['opportunity'];
  const stage = opp?.fields['stage'];
  if (!stage) {
    console.log('  ! campo opportunity.stage não encontrado — pulando');
    return;
  }
  // Idempotência: só reescreve se os valores diferem (reescrever apaga as colunas do Kanban).
  const current = (stage.options ?? []).map((o) => o.value).sort().join(',');
  const desired = OPPORTUNITY_STAGES.map((o) => o.value).sort().join(',');
  if (current === desired) {
    skipped++;
    return;
  }
  console.log('  ~ atualizando opportunity.stage com os 14 estágios do funil');
  if (DRY_RUN) return;
  await gql(UPDATE_FIELD, {
    input: {
      id: stage.id,
      update: { options: OPPORTUNITY_STAGES, defaultValue: "'NOVO_LEAD'" },
    },
  });
}

async function ensureViews(state) {
  const allViewSpecs = [
    ...STANDARD_VIEWS.map((v) => ({ ...v, object: v.object })),
    ...CUSTOM_OBJECTS.flatMap((o) => (o.views ?? []).map((v) => ({ ...v, object: o.nameSingular }))),
  ];
  for (const v of allViewSpecs) {
    const obj = state[v.object];
    if (!obj) {
      console.log(`  ! objeto "${v.object}" inexistente — pulando view "${v.name}"`);
      continue;
    }
    const existing = await fetchViews(obj.id);
    if (existing.some((e) => e.name === v.name)) {
      skipped++;
      continue;
    }
    const input = {
      name: v.name,
      objectMetadataId: obj.id,
      type: v.type,
      icon: v.icon ?? 'IconLayoutKanban',
      position: existing.length,
    };
    if (v.groupBy) {
      const gb = obj.fields[v.groupBy];
      if (!gb) {
        console.log(`  ! campo de agrupamento "${v.groupBy}" não encontrado em ${v.object} — pulando view`);
        continue;
      }
      input.mainGroupByFieldMetadataId = gb.id;
    }
    if (v.aggregate) {
      const aggField = obj.fields[v.aggregate.field];
      if (aggField) {
        input.kanbanAggregateOperation = v.aggregate.operation;
        input.kanbanAggregateOperationFieldMetadataId = aggField.id;
      }
    }
    console.log(`  + view "${v.name}" (${v.type}) em ${v.object}`);
    if (DRY_RUN) continue;
    try {
      await gql(CREATE_VIEW, { input });
      created++;
    } catch (e) {
      console.log(`    ✖ falha na view "${v.name}": ${e.message}`);
    }
  }

  // Garante as colunas (view groups) de toda view Kanban. As colunas NÃO são
  // criadas automaticamente pela API, e atualizar as options de um SELECT
  // remove as colunas antigas — então reconstruímos a partir das options atuais.
  const groupByPairs = new Map(); // object nameSingular -> groupBy field name
  for (const v of allViewSpecs) {
    if (v.type === 'KANBAN' && v.groupBy) groupByPairs.set(v.object, v.groupBy);
  }
  for (const [objName, fieldName] of groupByPairs) {
    await ensureKanbanGroups(state[objName], fieldName);
  }
}

// Cria uma coluna (view group) por opção do campo de agrupamento, em todas as
// views Kanban do objeto que agrupam por aquele campo (idempotente).
async function ensureKanbanGroups(obj, groupByFieldName) {
  if (!obj) return;
  const field = obj.fields[groupByFieldName];
  if (!field || !Array.isArray(field.options)) return;
  const optionValues = field.options.map((o) => o.value);
  const views = await fetchViews(obj.id);
  for (const view of views) {
    if (view.type !== 'KANBAN' || view.mainGroupByFieldMetadataId !== field.id) continue;
    const existingValues = (view.viewGroups ?? []).map((g) => g.fieldValue);
    const missing = optionValues.filter((v) => !existingValues.includes(v));
    if (missing.length === 0) {
      skipped++;
      continue;
    }
    const startPos = (view.viewGroups ?? []).length;
    const inputs = missing.map((fieldValue, i) => ({
      viewId: view.id,
      fieldValue,
      position: startPos + i,
      isVisible: true,
    }));
    console.log(`  + ${missing.length} coluna(s) Kanban em "${view.name}" (${obj.nameSingular})`);
    if (DRY_RUN) continue;
    try {
      await gql(CREATE_MANY_VIEW_GROUPS, { inputs });
      created += missing.length;
    } catch (e) {
      console.log(`    ✖ falha nas colunas de "${view.name}": ${e.message}`);
    }
  }
}

// --- orquestração ---------------------------------------------------------
async function main() {
  console.log(`→ Twenty metadata API: ${ENDPOINT}${DRY_RUN ? '  [DRY RUN]' : ''}`);

  console.log('\n[1/5] Introspecção inicial');
  let state = await fetchState();
  console.log(`  objetos existentes: ${Object.keys(state).length}`);

  console.log('\n[2/5] Garantindo objetos custom');
  await ensureCustomObjects(state);
  state = await fetchState(); // refresh: novos objetos ganham campos default

  console.log('\n[3/5] Garantindo campos (standard + custom, exceto relações)');
  // Primeiro campos não-relacionais (relações dependem de todos os objetos existirem).
  const splitRelations = (specs) =>
    specs.map((s) => ({ ...s, fields: (s.fields ?? []).filter((f) => f.type !== 'RELATION') }));
  await ensureFields(splitRelations(STANDARD_OBJECTS), state);
  await ensureFields(splitRelations(CUSTOM_OBJECTS), state);

  console.log('\n[4/5] Atualizando funil + criando relações');
  await updateOpportunityStage(state);
  state = await fetchState(); // refresh para pegar ids dos campos recém-criados
  const onlyRelations = (specs) =>
    specs.map((s) => ({ ...s, fields: (s.fields ?? []).filter((f) => f.type === 'RELATION') }));
  await ensureFields(onlyRelations(STANDARD_OBJECTS), state);
  await ensureFields(onlyRelations(CUSTOM_OBJECTS), state);
  state = await fetchState(); // refresh para views (mrr, selects de groupBy)

  console.log('\n[5/5] Criando views (Kanban/Table)');
  await ensureViews(state);

  console.log(`\n✓ Concluído. Criados: ${created} · já existentes/pulados: ${skipped}`);
  if (DRY_RUN) console.log('  (DRY RUN — nada foi gravado)');
}

main().catch((e) => {
  console.error(`\n✖ Erro: ${e.message}`);
  process.exit(1);
});
