#!/usr/bin/env node
// Provisionador do modelo de CRM da Petbee para o Twenty.
//
// Este script é o "retrato como construído" do CRM da Petbee: ele reproduz,
// em qualquer instância do Twenty, o modelo que existe hoje em
// https://crm.petbeetools.com.br (snapshot capturado em 2026-08-11 via API
// de metadados). Use-o para montar a futura instância de produção ou para
// reconstruir o ambiente do zero.
//
// Modelo: Tutor (Person) 1—N Pets 1—N Assinatura N—1 Plano
//
// Idempotente: objetos e campos já existentes (pelo nome) são detectados e
// pulados, nunca duplicados nem sobrescritos. Rodar de novo é sempre seguro.
//
// Uso:
//   TWENTY_API_KEY=<sua-api-key> node petbee/provision-petbee-crm.mjs
//   TWENTY_API_URL=https://crm.petbeetools.com.br TWENTY_API_KEY=... node petbee/provision-petbee-crm.mjs
//   ... --dry-run   (só mostra o que seria feito, sem alterar nada)
//
// Requisitos: Node 18+ e uma API key do Twenty (Settings → APIs & Webhooks).

const API_URL = (process.env.TWENTY_API_URL ?? 'http://localhost:3000').replace(/\/+$/, '');
const API_KEY = process.env.TWENTY_API_KEY;
const DRY_RUN = process.argv.includes('--dry-run');

if (!API_KEY) {
  console.error('Erro: defina a variável de ambiente TWENTY_API_KEY.');
  console.error('Gere uma API key no Twenty em Settings → APIs & Webhooks.');
  process.exit(1);
}

const gql = async (query, variables = {}) => {
  let response;
  try {
    response = await fetch(`${API_URL}/metadata`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({ query, variables }),
    });
  } catch (error) {
    throw new Error(`Não consegui conectar em ${API_URL} — a instância está no ar? (${error.message})`);
  }

  if (response.status === 401 || response.status === 403) {
    throw new Error('API key inválida ou sem permissão (HTTP ' + response.status + ').');
  }

  const body = await response.text();
  let json;

  try {
    json = JSON.parse(body);
  } catch {
    throw new Error(`Resposta inesperada (HTTP ${response.status}) de ${API_URL}/metadata: ${body.slice(0, 200)}`);
  }

  if (json.errors?.length) {
    throw new Error(json.errors.map((graphqlError) => graphqlError.message).join(' | '));
  }

  return json.data;
};

// "Assinaturas" → "assinaturas", "Data de nascimento" → "dataDeNascimento":
// mesmo algoritmo que o Twenty usa para derivar o nome do campo espelhado de
// uma relação a partir do rótulo.
const labelToFieldName = (label) =>
  label
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-zA-Z0-9 ]/g, ' ')
    .trim()
    .split(/\s+/)
    .map((word, index) =>
      index === 0
        ? word.charAt(0).toLowerCase() + word.slice(1)
        : word.charAt(0).toUpperCase() + word.slice(1),
    )
    .join('');

const fetchObjects = async () => {
  const data = await gql(`
    query ObjectsMetadata($filter: ObjectFilter!, $paging: CursorPaging!) {
      objects(filter: $filter, paging: $paging) {
        edges {
          node {
            id
            nameSingular
            namePlural
            labelSingular
            isActive
            fieldsList { id name label type isActive }
          }
        }
      }
    }
  `, { filter: {}, paging: { first: 1000 } });

  return data.objects.edges.map((edge) => edge.node);
};

const findObject = (objects, nameSingular) =>
  objects.find((object) => object.nameSingular.toLowerCase() === nameSingular.toLowerCase());

const ensureObject = async (objects, definition) => {
  const existing = findObject(objects, definition.nameSingular);

  if (existing) {
    console.log(`• Objeto "${definition.labelSingular}" já existe (${existing.nameSingular}) — mantido como está.`);
    if (!existing.isActive) {
      console.warn(`  ⚠ Ele está desativado. Reative em Settings → Data model.`);
    }
    return existing;
  }

  if (DRY_RUN) {
    console.log(`→ [dry-run] Criaria o objeto "${definition.labelSingular}".`);
    return { id: `dry-run-${definition.nameSingular}`, ...definition, fieldsList: [], isActive: true };
  }

  const data = await gql(`
    mutation CreateOneObjectMetadataItem($input: CreateOneObjectInput!) {
      createOneObject(input: $input) { id nameSingular }
    }
  `, { input: { object: definition } });

  console.log(`✓ Objeto "${definition.labelSingular}" criado.`);

  return { ...data.createOneObject, ...definition, fieldsList: [], isActive: true };
};

const ensureField = async (object, field, relationTargetObject) => {
  const existing = (object.fieldsList ?? []).find(
    (existingField) => existingField.name.toLowerCase() === field.name.toLowerCase(),
  );

  if (existing) {
    console.log(`  • Campo "${field.label}" (${field.name}) já existe em ${object.nameSingular} — pulado.`);
    return existing;
  }

  // Relações criam um campo espelhado no objeto de destino. Se uma execução
  // anterior parou no meio e só o espelho existe, recriar falharia — então
  // detectamos e avisamos em vez de quebrar o restante do provisionamento.
  if (field.relationCreationPayload && relationTargetObject) {
    const mirroredFieldName = labelToFieldName(field.relationCreationPayload.targetFieldLabel);
    const mirrorTaken = (relationTargetObject.fieldsList ?? []).some(
      (targetField) => targetField.name.toLowerCase() === mirroredFieldName.toLowerCase(),
    );

    if (mirrorTaken) {
      console.warn(
        `  ⚠ Relação "${field.label}" não criada: ${object.nameSingular}.${field.name} não existe, mas ` +
          `${relationTargetObject.nameSingular}.${mirroredFieldName} já existe (estado parcial de uma execução ` +
          `anterior?). Resolva manualmente em Settings → Data model e rode de novo.`,
      );
      return null;
    }
  }

  if (DRY_RUN) {
    console.log(`  → [dry-run] Criaria o campo "${field.label}" (${field.type}) em ${object.nameSingular}.`);
    return null;
  }

  const data = await gql(`
    mutation CreateOneFieldMetadataItem($input: CreateOneFieldMetadataInput!) {
      createOneField(input: $input) { id name }
    }
  `, { input: { field: { ...field, objectMetadataId: object.id } } });

  console.log(`  ✓ Campo "${field.label}" criado em ${object.nameSingular}.`);
  object.fieldsList = [...(object.fieldsList ?? []), data.createOneField];

  return data.createOneField;
};

// Opções compartilhadas entre Plano (inclusos) e Assinatura (extras).
const ADDON_OPTIONS = [
  { label: 'Vacinas', value: 'VACINAS', color: 'green', position: 0 },
  { label: 'Checkup', value: 'CHECKUP', color: 'blue', position: 1 },
  { label: 'Limpeza Dentária', value: 'LIMPEZA_DENTARIA', color: 'purple', position: 2 },
];

const run = async () => {
  console.log(`Provisionando o modelo Petbee em ${API_URL}${DRY_RUN ? ' (dry-run)' : ''}…\n`);

  const objects = await fetchObjects();

  const personObject = findObject(objects, 'person');

  if (!personObject) {
    throw new Error('Objeto padrão "person" não encontrado nesta instância.');
  }

  // namePlural "petss" reproduz a instância original: o objeto foi criado lá
  // com singular "pets", e a API de registros usa o plural "petss" nas
  // queries. Mantido igual para os scripts de migração funcionarem nas duas.
  const petsObject = await ensureObject(objects, {
    nameSingular: 'pets',
    namePlural: 'petss',
    labelSingular: 'Pets',
    labelPlural: 'Pets',
    icon: 'IconListNumbers',
    description: 'Pets individual',
  });

  const planObject = await ensureObject(objects, {
    nameSingular: 'plano',
    namePlural: 'planos',
    labelSingular: 'Plano',
    labelPlural: 'Planos',
    icon: 'IconLicense',
  });

  const subscriptionObject = await ensureObject(objects, {
    nameSingular: 'assinatura',
    namePlural: 'assinaturas',
    labelSingular: 'Assinatura',
    labelPlural: 'Assinaturas',
    icon: 'IconFileInvoice',
  });

  console.log('\nCampos de Pets:');
  await ensureField(petsObject, { name: 'especie', label: 'Espécie', type: 'TEXT', icon: 'IconTypography' });
  await ensureField(petsObject, { name: 'raca', label: 'Raça', type: 'TEXT', icon: 'IconDna' });
  await ensureField(petsObject, {
    name: 'dataDeNascimento',
    label: 'Data de nascimento',
    type: 'DATE',
    icon: 'IconCalendarEvent',
  });
  await ensureField(petsObject, {
    name: 'sexo',
    label: 'Sexo',
    type: 'SELECT',
    icon: 'IconTag',
    options: [
      { label: 'Macho', value: 'MACHO', color: 'green', position: 0 },
      { label: 'Fêmea', value: 'FEMEA', color: 'jade', position: 1 },
    ],
  });
  await ensureField(petsObject, {
    name: 'porte',
    label: 'Porte',
    type: 'SELECT',
    icon: 'IconRuler',
    options: [
      { label: 'Pequeno', value: 'PEQUENO', color: 'green', position: 0 },
      { label: 'Médio', value: 'MEDIO', color: 'yellow', position: 1 },
      { label: 'Grande', value: 'GRANDE', color: 'orange', position: 2 },
      { label: 'Gigante', value: 'GIGANTE', color: 'red', position: 3 },
    ],
  });
  await ensureField(petsObject, { name: 'carteirinha', label: 'Carteirinha', type: 'TEXT', icon: 'IconTypography' });
  await ensureField(petsObject, { name: 'petIdPetbee', label: 'ID Petbee (pet)', type: 'TEXT', icon: 'IconKey' });

  console.log('\nCampos de Plano:');
  await ensureField(planObject, {
    name: 'valorMensal',
    label: 'Valor mensal',
    type: 'CURRENCY',
    icon: 'IconCoin',
    settings: { decimals: 2 },
  });
  await ensureField(planObject, {
    name: 'ativo',
    label: 'Ativo',
    type: 'BOOLEAN',
    icon: 'IconToggleRight',
    defaultValue: true,
  });
  await ensureField(planObject, {
    name: 'addonsInclusos',
    label: 'Addons inclusos',
    type: 'MULTI_SELECT',
    icon: 'IconGift',
    options: ADDON_OPTIONS,
  });
  await ensureField(planObject, { name: 'planIdPetbee', label: 'ID Petbee (plano)', type: 'TEXT', icon: 'IconKey' });

  console.log('\nCampos de Assinatura:');
  await ensureField(subscriptionObject, {
    name: 'status',
    label: 'Status',
    type: 'SELECT',
    icon: 'IconProgressCheck',
    defaultValue: "'ATIVA'",
    options: [
      { label: 'Ativa', value: 'ATIVA', color: 'green', position: 0 },
      { label: 'Bloqueada', value: 'BLOQUEADA', color: 'gray', position: 1 },
      { label: 'Cancelada', value: 'CANCELADA', color: 'red', position: 2 },
    ],
  });
  await ensureField(subscriptionObject, {
    name: 'periodicidade',
    label: 'Periodicidade',
    type: 'SELECT',
    icon: 'IconCalendarRepeat',
    defaultValue: "'MENSAL'",
    options: [
      { label: 'Mensal', value: 'MENSAL', color: 'blue', position: 0 },
      { label: 'Anual', value: 'ANUAL', color: 'green', position: 1 },
    ],
  });
  await ensureField(subscriptionObject, {
    name: 'valorMensal',
    label: 'Valor mensal (MRR)',
    type: 'CURRENCY',
    icon: 'IconCoin',
    settings: { decimals: 2 },
  });
  await ensureField(subscriptionObject, {
    name: 'diaVencimento',
    label: 'Dia de vencimento',
    type: 'NUMBER',
    icon: 'IconCalendarDue',
  });
  await ensureField(subscriptionObject, {
    name: 'dataInicio',
    label: 'Data de início',
    type: 'DATE',
    icon: 'IconCalendarPlus',
  });
  await ensureField(subscriptionObject, {
    name: 'dataCancelamento',
    label: 'Data de cancelamento',
    type: 'DATE',
    icon: 'IconCalendarX',
  });
  await ensureField(subscriptionObject, {
    name: 'addons',
    label: 'Addons (extras)',
    type: 'MULTI_SELECT',
    icon: 'IconPlus',
    options: ADDON_OPTIONS,
  });
  await ensureField(subscriptionObject, { name: 'cupom', label: 'Cupom', type: 'TEXT', icon: 'IconTicket' });
  await ensureField(subscriptionObject, {
    name: 'subsIdPetbee',
    label: 'ID Petbee (assinatura)',
    type: 'TEXT',
    icon: 'IconKey',
  });

  console.log('\nCampos do tutor (Person):');
  await ensureField(personObject, { name: 'cpf', label: 'CPF', type: 'TEXT', icon: 'IconId' });
  await ensureField(personObject, {
    name: 'statusCliente',
    label: 'Status do cliente',
    type: 'SELECT',
    icon: 'IconUserCheck',
    options: [
      { label: 'Lead', value: 'LEAD', color: 'blue', position: 0 },
      { label: 'Ativo', value: 'ATIVO', color: 'green', position: 1 },
      { label: 'Inativo', value: 'INATIVO', color: 'red', position: 2 },
    ],
  });
  await ensureField(personObject, {
    name: 'canalPreferido',
    label: 'Canal preferido',
    type: 'SELECT',
    icon: 'IconMessageCircle',
    options: [
      { label: 'WhatsApp', value: 'WHATSAPP', color: 'green', position: 0 },
      { label: 'E-mail', value: 'EMAIL', color: 'blue', position: 1 },
      { label: 'Telefone', value: 'TELEFONE', color: 'yellow', position: 2 },
    ],
  });
  await ensureField(personObject, { name: 'humanid', label: 'HumanID', type: 'TEXT', icon: 'IconTypography' });
  await ensureField(personObject, { name: 'hIdPetbee', label: 'ID Petbee (tutor)', type: 'TEXT', icon: 'IconKey' });
  await ensureField(personObject, {
    name: 'idBitrix',
    label: 'ID Bitrix (contato)',
    type: 'TEXT',
    icon: 'IconBrandBitbucket',
  });
  await ensureField(personObject, { name: 'utmSource', label: 'UTM Source', type: 'TEXT', icon: 'IconBrandGoogle' });
  await ensureField(personObject, { name: 'utmMedium', label: 'UTM Medium', type: 'TEXT', icon: 'IconAd' });
  await ensureField(personObject, {
    name: 'utmCampaign',
    label: 'UTM Campaign',
    type: 'TEXT',
    icon: 'IconSpeakerphone',
  });

  console.log('\nRelações:');
  // Muitos pets → um tutor; Person ganha o campo espelhado "Pets".
  await ensureField(petsObject, {
    name: 'tutor',
    label: 'Tutor',
    type: 'RELATION',
    icon: 'IconUsers',
    relationCreationPayload: {
      targetObjectMetadataId: personObject.id,
      targetFieldLabel: 'Pets',
      targetFieldIcon: 'IconRelationOneToMany',
      type: 'MANY_TO_ONE',
    },
  }, personObject);
  // Muitas assinaturas → um tutor (quem paga).
  await ensureField(subscriptionObject, {
    name: 'tutor',
    label: 'Tutor',
    type: 'RELATION',
    icon: 'IconLink',
    relationCreationPayload: {
      targetObjectMetadataId: personObject.id,
      targetFieldLabel: 'Assinaturas',
      targetFieldIcon: 'IconFileInvoice',
      type: 'MANY_TO_ONE',
    },
  }, personObject);
  // Muitas assinaturas → um pet (histórico de planos do pet).
  await ensureField(subscriptionObject, {
    name: 'pet',
    label: 'Pet',
    type: 'RELATION',
    icon: 'IconLink',
    relationCreationPayload: {
      targetObjectMetadataId: petsObject.id,
      targetFieldLabel: 'Assinaturas',
      targetFieldIcon: 'IconFileInvoice',
      type: 'MANY_TO_ONE',
    },
  }, petsObject);
  // Muitas assinaturas → um plano (catálogo de planos).
  await ensureField(subscriptionObject, {
    name: 'plano',
    label: 'Plano',
    type: 'RELATION',
    icon: 'IconLink',
    relationCreationPayload: {
      targetObjectMetadataId: planObject.id,
      targetFieldLabel: 'Assinaturas',
      targetFieldIcon: 'IconFileInvoice',
      type: 'MANY_TO_ONE',
    },
  }, planObject);

  console.log(`\nPronto${DRY_RUN ? ' (nada foi alterado — dry-run)' : ''}. Abra Settings → Data model no Twenty para revisar.`);
};

run().catch((error) => {
  console.error(`\nFalhou: ${error.message}`);
  process.exit(1);
});
