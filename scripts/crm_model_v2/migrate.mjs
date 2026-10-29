#!/usr/bin/env node
// CRM model v2 migration for crm.skilland.ai (Twenty v2.52).
// Spec: skilland-dashboard/docs/CRM-MODEL.md, section "API contract (implemented 2026-10-28)".
// Usage: node migrate.mjs --dry-run | --apply
import { randomUUID } from 'node:crypto';

import { readTwentyCredentials, TwentyClient } from './twenty-client.mjs';
import {
  BUSINESS_LINE_MERGES,
  BUSINESS_LINE_RENAMES,
  CAMPANA_OBJECT,
  CANAL_MAPPING,
  COMPANY_FIELDS,
  LEGACY_OPPORTUNITY_FIELDS_TO_DEACTIVATE,
  OPEN_STAGES,
  OPPORTUNITY_FIELDS,
  STAGE_DEFAULT,
  STAGE_MAPPING,
  STAGE_OPTIONS,
  WON_STAGES,
  classifyCompany,
  isIaMujeres,
} from './model.mjs';

const args = new Set(process.argv.slice(2));
const APPLY = args.has('--apply');

if (APPLY === args.has('--dry-run')) {
  console.error('Usage: node migrate.mjs --dry-run | --apply');
  process.exit(1);
}

const client = new TwentyClient(readTwentyCredentials());
const summary = [];

const log = (msg) => console.log(msg);
const section = (title) => console.log(`\n=== ${title} ${APPLY ? '' : '(dry run)'}`);
const action = (msg) => {
  summary.push(msg);
  console.log(`  ${APPLY ? '✓' : '→'} ${msg}`);
};

let objects = [];

async function refreshMetadata() {
  objects = await client.metadataObjects();
}

function object(nameSingular) {
  return objects.find((o) => o.nameSingular === nameSingular);
}

function field(objectName, fieldName) {
  return object(objectName)?.fields.find((f) => f.name === fieldName);
}

function activeFieldNames(objectName) {
  return new Set(
    (object(objectName)?.fields ?? []).filter((f) => f.isActive).map((f) => f.name),
  );
}

function withOptionIds(options) {
  return options.map((option) => ({ id: randomUUID(), ...option }));
}

// ---------- 1. stage: add the new options alongside the old ones ----------
async function addStageOptions() {
  section('Stage options: add new values');
  const stage = field('opportunity', 'stage');
  const existing = new Map(stage.options.map((o) => [o.value, o]));
  const missing = STAGE_OPTIONS.filter((o) => !existing.has(o.value));
  const relabel = STAGE_OPTIONS.filter((o) => {
    const current = existing.get(o.value);
    return current && (current.label !== o.label || current.color !== o.color);
  });

  if (missing.length === 0 && relabel.length === 0) {
    log('  stage already has every target option');
    return;
  }

  const target = STAGE_OPTIONS.map((o) => o.value);
  const legacy = stage.options
    .filter((o) => !target.includes(o.value))
    .map((o, i) => ({ ...o, position: STAGE_OPTIONS.length + i }));
  const options = [
    ...STAGE_OPTIONS.map((o) => ({ ...(existing.get(o.value) ?? { id: randomUUID() }), ...o })),
    ...legacy,
  ];

  if (missing.length) action(`add stage options ${missing.map((o) => o.value).join(', ')}`);
  if (relabel.length) {
    action(`relabel/recolor stage options ${relabel.map((o) => `${o.value}="${o.label}"`).join(', ')}`);
  }
  if (legacy.length) log(`  legacy options kept for now: ${legacy.map((o) => o.value).join(', ')}`);
  if (APPLY) await client.updateField(stage.id, { options });
}

// ---------- 2. new fields on opportunity / company ----------
async function ensureFields(objectName, definitions) {
  section(`Fields on ${objectName}`);
  const obj = object(objectName);

  for (const def of definitions) {
    const current = field(objectName, def.name);
    if (current) {
      log(`  ${objectName}.${def.name} exists (${current.type}${current.isActive ? '' : ', INACTIVE'})`);
      if (!current.isActive) {
        action(`reactivate ${objectName}.${def.name}`);
        if (APPLY) await client.updateField(current.id, { isActive: true });
      }
      continue;
    }

    action(`create ${objectName}.${def.name} ${def.type}${def.options ? ` [${def.options.map((o) => o.value).join(', ')}]` : ''}`);
    if (APPLY) {
      await client.createField({
        objectMetadataId: obj.id,
        isNullable: true,
        isLabelSyncedWithName: false,
        ...def,
        ...(def.options ? { options: withOptionIds(def.options) } : {}),
      });
    }
  }
}

// ---------- 3. campana object + relations ----------
async function ensureCampanaObject() {
  section('Object campana');
  if (!object(CAMPANA_OBJECT.object.nameSingular)) {
    action(`create object campana ("${CAMPANA_OBJECT.object.labelSingular}" / "${CAMPANA_OBJECT.object.labelPlural}")`);
    if (!APPLY) {
      for (const def of CAMPANA_OBJECT.fields) action(`create campana.${def.name} ${def.type}`);
      for (const rel of CAMPANA_OBJECT.relations) {
        action(`create relation ${rel.source}.${rel.name} → campana (reverse campana.${rel.reverseName})`);
      }
      return;
    }
    await client.createObject({ ...CAMPANA_OBJECT.object, isLabelSyncedWithName: false });
    await refreshMetadata();
  } else {
    log('  object campana exists');
  }

  await ensureFields('campana', CAMPANA_OBJECT.fields);

  section('Relations to campana');
  for (const rel of CAMPANA_OBJECT.relations) {
    if (field(rel.source, rel.name)) {
      log(`  ${rel.source}.${rel.name} exists`);
      continue;
    }
    action(`create relation ${rel.source}.${rel.name} → campana (reverse campana.${rel.reverseName})`);
    if (APPLY) {
      await client.createField({
        objectMetadataId: object(rel.source).id,
        type: 'RELATION',
        name: rel.name,
        label: rel.label,
        icon: rel.icon,
        isNullable: true,
        isLabelSyncedWithName: false,
        relationCreationPayload: {
          targetObjectMetadataId: object('campana').id,
          targetFieldLabel: rel.reverseLabel,
          targetFieldIcon: rel.reverseIcon,
          type: 'MANY_TO_ONE',
        },
      });
    }
  }
  if (APPLY) await refreshMetadata();
  for (const rel of CAMPANA_OBJECT.relations) {
    const reverse = field('campana', rel.reverseName);
    if (APPLY && !reverse) {
      const names = object('campana').fields.filter((f) => f.type === 'RELATION').map((f) => f.name);
      log(`  ! reverse field campana.${rel.reverseName} not found; relation fields on campana: ${names.join(', ')}`);
    }
  }
}

// ---------- 4. business lines ----------
async function migrateBusinessLines() {
  section('Business lines');
  const lines = await client.fetchAll('businessLines', 'id name');
  const byName = new Map(lines.map((l) => [l.name, l]));

  for (const [from, to] of Object.entries(BUSINESS_LINE_RENAMES)) {
    const source = byName.get(from);
    if (!source) {
      log(`  "${from}" not found${byName.has(to) ? ` ("${to}" present)` : ''}`);
      continue;
    }
    if (byName.has(to)) {
      log(`  ! both "${from}" and "${to}" exist; leaving "${from}" untouched`);
      continue;
    }
    action(`rename business line "${from}" → "${to}"`);
    if (APPLY) {
      await client.gql(
        'mutation ($id: UUID!, $data: BusinessLineUpdateInput!) { updateBusinessLine(id: $id, data: $data) { id } }',
        { id: source.id, data: { name: to } },
      );
    }
    byName.delete(from);
    byName.set(to, { ...source, name: to });
  }

  const merges = [];
  for (const [from, to] of Object.entries(BUSINESS_LINE_MERGES)) {
    const source = byName.get(from);
    const target = byName.get(to);
    if (!source) {
      log(`  "${from}" already merged/removed`);
      continue;
    }
    if (!target) throw new Error(`Merge target business line "${to}" not found`);
    merges.push({ from: source, to: target });
  }

  return { lines: byName, merges };
}

async function softDeleteMergedLines(merges) {
  section('Business lines: soft-delete merged');
  for (const { from } of merges) {
    const remaining = await client.fetchAll('opportunities', 'id', {
      type: 'OpportunityFilterInput',
      value: { businessLineId: { eq: from.id } },
    });
    if (APPLY && remaining.length) {
      log(`  ! "${from.name}" still has ${remaining.length} deals; not deleting`);
      continue;
    }
    action(`soft-delete business line "${from.name}"`);
    if (APPLY) {
      await client.gql('mutation ($id: UUID!) { deleteBusinessLine(id: $id) { id } }', { id: from.id });
    }
  }
}

// ---------- 5. campana records ----------
async function ensureCampanas(opportunities, people) {
  section('Campaña records');
  const names = new Set(
    [...opportunities, ...people].map((r) => r.campaignName?.trim()).filter(Boolean),
  );
  const existing = object('campana') ? await client.fetchAll('campanas', 'id name') : [];
  const byName = new Map(existing.map((c) => [c.name, c.id]));

  for (const name of [...names].sort()) {
    if (byName.has(name)) {
      log(`  "${name}" exists`);
      continue;
    }
    const nOpp = opportunities.filter((o) => o.campaignName?.trim() === name).length;
    const nPeople = people.filter((p) => p.campaignName?.trim() === name).length;
    action(`create campaña "${name}" (${nOpp} deals, ${nPeople} people)`);
    if (APPLY) {
      const data = await client.gql(
        'mutation ($data: CampanaCreateInput!) { createCampana(data: $data) { id } }',
        { data: { name } },
      );
      byName.set(name, data.createCampana.id);
    } else {
      byName.set(name, `<new:${name}>`);
    }
  }

  return byName;
}

// ---------- 6. opportunity records ----------
function opportunityPatch(opp, ctx) {
  const patch = {};

  const newStage = STAGE_MAPPING[opp.stage];
  if (newStage) patch.stage = newStage;
  const stage = patch.stage ?? opp.stage;

  const merge = ctx.merges.find((m) => m.from.id === opp.businessLineId);
  if (merge) patch.businessLineId = merge.to.id;

  if (opp.canal && CANAL_MAPPING[opp.canal]) {
    const { origen, financiacion } = CANAL_MAPPING[opp.canal];
    if (origen && !opp.origen) patch.origen = origen;
    if (financiacion && !opp.financiacion) patch.financiacion = financiacion;
  }

  if (stage === 'LOST' && !opp.motivoPerdida && isIaMujeres(opp)) {
    patch.motivoPerdida = 'CAMPANA_CERRADA';
  }

  if (WON_STAGES.includes(stage) && !opp.fechaGanado && opp.closeDate) {
    patch.fechaGanado = opp.closeDate.slice(0, 10);
  }

  const campanaId = ctx.campanas.get(opp.campaignName?.trim());
  if (campanaId && opp.campanaId !== campanaId) patch.campanaId = campanaId;

  return patch;
}

async function applyGrouped(plural, filterType, updateInputType, items, label) {
  const groups = new Map();
  for (const { id, patch } of items) {
    const key = JSON.stringify(patch);
    if (!groups.has(key)) groups.set(key, { patch, ids: [] });
    groups.get(key).ids.push(id);
  }

  const mutation = `update${plural[0].toUpperCase()}${plural.slice(1)}`;
  for (const { patch, ids } of groups.values()) {
    action(`${label}: ${ids.length} × ${JSON.stringify(patch)}`);
    if (!APPLY) continue;
    for (let i = 0; i < ids.length; i += 50) {
      const chunk = ids.slice(i, i + 50);
      await client.gql(
        `mutation ($filter: ${filterType}!, $data: ${updateInputType}!) { ${mutation}(filter: $filter, data: $data) { id } }`,
        { filter: { id: { in: chunk } }, data: patch },
      );
    }
  }
}

async function migrateOpportunities(opportunities, ctx) {
  section('Opportunities');
  const items = opportunities
    .map((opp) => ({ id: opp.id, name: opp.name, patch: opportunityPatch(opp, ctx) }))
    .filter((item) => Object.keys(item.patch).length);

  const counts = {};
  for (const { patch } of items) {
    for (const [k, v] of Object.entries(patch)) {
      const key = k === 'campanaId' || k === 'businessLineId' ? k : `${k}=${v}`;
      counts[key] = (counts[key] ?? 0) + 1;
    }
  }
  log(`  ${items.length}/${opportunities.length} deals change. Per field:`);
  for (const [k, v] of Object.entries(counts).sort()) log(`    ${k}: ${v}`);

  const stageMoves = {};
  for (const opp of opportunities) {
    if (STAGE_MAPPING[opp.stage]) {
      const key = `${opp.stage} → ${STAGE_MAPPING[opp.stage]}`;
      stageMoves[key] = (stageMoves[key] ?? 0) + 1;
    }
  }
  log('  stage moves:');
  for (const [k, v] of Object.entries(stageMoves)) log(`    ${k}: ${v}`);

  if (process.env.VERBOSE) {
    for (const item of items) log(`    - ${item.name}: ${JSON.stringify(item.patch)}`);
  }

  await applyGrouped('opportunities', 'OpportunityFilterInput', 'OpportunityUpdateInput', items, 'deals');
}

// ---------- 7. people ----------
async function migratePeople(people, campanas) {
  section('People → campaña');
  const items = people
    .map((p) => {
      const campanaId = campanas.get(p.campaignName?.trim());
      return campanaId && p.campanaId !== campanaId ? { id: p.id, patch: { campanaId } } : null;
    })
    .filter(Boolean);
  if (!items.length) log('  nothing to link');
  await applyGrouped('people', 'PersonFilterInput', 'PersonUpdateInput', items, 'people');
}

// ---------- 8. companies ----------
async function migrateCompanies(companies) {
  section('Companies → tipoCliente');
  const items = [];
  const byType = { B2G: [], B2B: [], B2C: [] };
  for (const company of companies) {
    if (company.tipoCliente) continue;
    const tipo = classifyCompany(company);
    byType[tipo].push(company.name || '(sin nombre)');
    items.push({ id: company.id, patch: { tipoCliente: tipo } });
  }
  for (const [tipo, names] of Object.entries(byType)) {
    log(`  ${tipo}: ${names.length}`);
    if (tipo !== 'B2B') log(`    ${names.sort((a, b) => a.localeCompare(b, 'es')).join(' · ')}`);
  }
  await applyGrouped('companies', 'CompanyFilterInput', 'CompanyUpdateInput', items, 'companies');
}

// ---------- 9. stage: drop legacy options ----------
async function finalizeStageOptions() {
  section('Stage options: remove legacy values');
  const stage = field('opportunity', 'stage');
  const target = STAGE_OPTIONS.map((o) => o.value);
  const legacy = stage.options.filter((o) => !target.includes(o.value)).map((o) => o.value);
  const defaultOk = stage.defaultValue === `'${STAGE_DEFAULT}'`;

  if (!legacy.length && defaultOk) {
    log('  only target options remain');
    return;
  }

  if (APPLY && legacy.length) {
    const stuck = await client.fetchAll('opportunities', 'id name stage', {
      type: 'OpportunityFilterInput',
      value: { stage: { in: legacy } },
    });
    if (stuck.length) {
      throw new Error(`Deals still on legacy stages: ${stuck.map((o) => `${o.name} (${o.stage})`).join(', ')}`);
    }
  }

  const options = STAGE_OPTIONS.map((o) => ({
    ...(stage.options.find((x) => x.value === o.value) ?? { id: randomUUID() }),
    ...o,
  }));
  action(`stage options → ${target.join(', ')} (remove ${legacy.join(', ') || 'none'}); default ${STAGE_DEFAULT}`);
  if (APPLY) {
    await client.updateField(stage.id, { options, defaultValue: `'${STAGE_DEFAULT}'` });
  }
}

// Twenty appends groups for new options at the end of kanban views; put columns in pipeline order.
async function reorderStageViewGroups() {
  section('Kanban views grouped by stage: column order');
  const stage = field('opportunity', 'stage');
  const order = new Map(STAGE_OPTIONS.map((o) => [o.value, o.position]));
  const groups = await client.metadataViewGroups();
  const byView = new Map();
  for (const g of groups) {
    if (g.deletedAt) continue;
    if (!byView.has(g.viewId)) byView.set(g.viewId, []);
    byView.get(g.viewId).push(g);
  }

  for (const [viewId, viewGroups] of byView) {
    const values = viewGroups.map((g) => g.fieldValue).filter((v) => v !== '');
    const isStageView =
      viewGroups.some((g) => g.fieldMetadataId === stage.id) ||
      (values.length > 0 && values.every((v) => order.has(v)) && values.includes('LEAD'));
    if (!isStageView) continue;

    const wrong = viewGroups.filter((g) => order.has(g.fieldValue) && g.position !== order.get(g.fieldValue));
    if (!wrong.length) {
      log(`  view ${viewId} already in pipeline order`);
      continue;
    }
    action(`reorder ${wrong.length} stage columns in view ${viewId}`);
    if (APPLY) {
      for (const g of wrong) await client.updateViewGroup(g.id, { position: order.get(g.fieldValue) });
    }
  }
}

// ---------- 10. deactivate legacy fields ----------
async function deactivateLegacyFields() {
  section('Deactivate legacy opportunity fields');
  for (const name of LEGACY_OPPORTUNITY_FIELDS_TO_DEACTIVATE) {
    const f = field('opportunity', name);
    if (!f) {
      log(`  ${name} not found`);
      continue;
    }
    if (!f.isActive) {
      log(`  ${name} already inactive`);
      continue;
    }
    action(`deactivate opportunity.${name}`);
    if (APPLY) await client.updateField(f.id, { isActive: false });
  }
}

// ---------- 11. report ----------
async function report() {
  section('Report');
  const fields = activeFieldNames('opportunity');
  const opps = await client.fetchAll(
    'opportunities',
    `id name stage businessLine { name }${fields.has('motivoPerdida') ? ' motivoPerdida' : ''}`,
  );
  const tally = (fn) => {
    const out = {};
    for (const o of opps) out[fn(o)] = (out[fn(o)] ?? 0) + 1;
    return out;
  };
  log(`  deals: ${opps.length}`);
  log(`  by stage: ${JSON.stringify(tally((o) => o.stage))}`);
  log(`  by line: ${JSON.stringify(tally((o) => o.businessLine?.name ?? '(none)'))}`);
  const aMedida = opps.filter(
    (o) => o.businessLine?.name === 'Formación a medida' && !['LOST', 'COMPLETED', 'CLOSED'].includes(o.stage),
  );
  log(`  Formación a medida, not lost/completed (${aMedida.length}) — review medida vs paquetizada:`);
  for (const o of aMedida) log(`    - [${o.stage}]${OPEN_STAGES.includes(o.stage) ? ' (open)' : ''} ${o.name}`);
}

async function main() {
  console.log(`CRM model v2 — ${APPLY ? 'APPLY' : 'DRY RUN'} against ${client.baseUrl}`);
  await refreshMetadata();

  await addStageOptions();
  await ensureFields('opportunity', OPPORTUNITY_FIELDS);
  await ensureFields('company', COMPANY_FIELDS);
  await ensureCampanaObject();
  if (APPLY) await refreshMetadata();

  const { merges } = await migrateBusinessLines();

  const oppFields = activeFieldNames('opportunity');
  const optional = (names) => names.filter((n) => oppFields.has(n.replace(/Id$/, ''))).join(' ');
  const opportunities = await client.fetchAll(
    'opportunities',
    `id name stage businessLineId businessLineName campaignName closeDate ${optional([
      'canal',
      'origen',
      'financiacion',
      'motivoPerdida',
      'fechaGanado',
      'campanaId',
    ])}`,
  );
  const personFields = activeFieldNames('person');
  const people = await client.fetchAll(
    'people',
    `id campaignName${personFields.has('campana') ? ' campanaId' : ''}`,
  );
  const companyFields = activeFieldNames('company');
  const companies = await client.fetchAll(
    'companies',
    `id name organizationType${companyFields.has('tipoCliente') ? ' tipoCliente' : ''}`,
  );

  const campanas = await ensureCampanas(opportunities, people);
  await migrateOpportunities(opportunities, { merges, campanas });
  await migratePeople(people, campanas);
  await migrateCompanies(companies);

  if (APPLY) await refreshMetadata();
  await finalizeStageOptions();
  await reorderStageViewGroups();
  await softDeleteMergedLines(merges);
  await deactivateLegacyFields();

  if (APPLY) {
    await refreshMetadata();
    await report();
  }

  console.log(`\n${summary.length} ${APPLY ? 'changes applied' : 'planned changes'}.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
