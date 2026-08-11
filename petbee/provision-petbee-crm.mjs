#!/usr/bin/env node
// Provisionador do modelo de CRM da Petbee para o Twenty.
//
// Cria (ou completa) os objetos Pet e Assinatura, os campos da Petbee no
// objeto de tutor (Person padrão ou um objeto "tutor" customizado que você
// já tenha criado pela interface) e as relações entre eles, via API de
// metadados do Twenty.
//
// Idempotente: pode rodar quantas vezes quiser — objetos e campos que já
// existem são detectados pelo nome e pulados, nunca duplicados. Por isso é
// seguro rodar contra a sua instância local (onde você já criou pet/tutor)
// e depois contra a produção.
//
// Uso:
//   TWENTY_API_KEY=<sua-api-key> node petbee/provision-petbee-crm.mjs
//   TWENTY_API_URL=https://crm.petbee.com.br TWENTY_API_KEY=... node petbee/provision-petbee-crm.mjs
//   ... --dry-run   (só mostra o que seria feito, sem alterar nada)
//
// Requisitos: Node 18+ e uma API key do Twenty (Settings → APIs & Webhooks).

const API_URL = (process.env.TWENTY_API_URL ?? 'http://localhost:3000').replace(/\/+$/, '');
const API_KEY = process.env.TWENTY_API_KEY;
const DRY_RUN = process.argv.includes('--dry-run');
// Force um objeto de tutor específico (nameSingular), ex.: PETBEE_TUTOR_OBJECT=tutor
const TUTOR_OBJECT_OVERRIDE = process.env.PETBEE_TUTOR_OBJECT;

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

  const json = await response.json();

  if (json.errors?.length) {
    throw new Error(json.errors.map((graphqlError) => graphqlError.message).join(' | '));
  }

  return json.data;
};

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
            isCustom
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

const ensureField = async (object, field) => {
  const existing = (object.fieldsList ?? []).find(
    (existingField) => existingField.name.toLowerCase() === field.name.toLowerCase(),
  );

  if (existing) {
    console.log(`  • Campo "${field.label}" (${field.name}) já existe em ${object.nameSingular} — pulado.`);
    return existing;
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

const run = async () => {
  console.log(`Provisionando o modelo Petbee em ${API_URL}${DRY_RUN ? ' (dry-run)' : ''}…\n`);

  const objects = await fetchObjects();

  // Tutor: usa um objeto customizado "tutor" se você já o criou pela
  // interface; senão usa o objeto padrão Person (recomendado, pois ele já
  // tem e-mails, telefones, timeline e integrações de e-mail/calendário).
  const tutorObject = TUTOR_OBJECT_OVERRIDE
    ? findObject(objects, TUTOR_OBJECT_OVERRIDE)
    : (findObject(objects, 'tutor') ?? findObject(objects, 'person'));

  if (!tutorObject) {
    throw new Error(
      TUTOR_OBJECT_OVERRIDE
        ? `Objeto "${TUTOR_OBJECT_OVERRIDE}" (PETBEE_TUTOR_OBJECT) não encontrado nesta instância.`
        : 'Nem "tutor" nem "person" foram encontrados nesta instância.',
    );
  }

  console.log(`Usando "${tutorObject.labelSingular}" (${tutorObject.nameSingular}) como objeto de tutor.\n`);

  const petObject = await ensureObject(objects, {
    nameSingular: 'pet',
    namePlural: 'pets',
    labelSingular: 'Pet',
    labelPlural: 'Pets',
    icon: 'IconPaw',
    description: 'Pet vinculado a um tutor (cliente ou lead da Petbee).',
  });

  const subscriptionObject = await ensureObject(objects, {
    nameSingular: 'assinatura',
    namePlural: 'assinaturas',
    labelSingular: 'Assinatura',
    labelPlural: 'Assinaturas',
    icon: 'IconCreditCard',
    description: 'Assinatura de plano Petbee de um pet, com status e cobrança.',
  });

  console.log('\nCampos do Pet:');
  await ensureField(petObject, {
    name: 'especie',
    label: 'Espécie',
    type: 'SELECT',
    icon: 'IconCategory',
    options: [
      { label: 'Cachorro', value: 'CACHORRO', color: 'blue', position: 0 },
      { label: 'Gato', value: 'GATO', color: 'purple', position: 1 },
      { label: 'Ave', value: 'AVE', color: 'yellow', position: 2 },
      { label: 'Roedor', value: 'ROEDOR', color: 'orange', position: 3 },
      { label: 'Outro', value: 'OUTRO', color: 'gray', position: 4 },
    ],
  });
  await ensureField(petObject, { name: 'raca', label: 'Raça', type: 'TEXT', icon: 'IconDna' });
  await ensureField(petObject, {
    name: 'sexo',
    label: 'Sexo',
    type: 'SELECT',
    icon: 'IconTag',
    options: [
      { label: 'Macho', value: 'MACHO', color: 'blue', position: 0 },
      { label: 'Fêmea', value: 'FEMEA', color: 'pink', position: 1 },
    ],
  });
  await ensureField(petObject, {
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
  await ensureField(petObject, {
    name: 'dataNascimento',
    label: 'Data de nascimento',
    type: 'DATE',
    icon: 'IconCalendar',
  });
  await ensureField(petObject, {
    name: 'pesoKg',
    label: 'Peso (kg)',
    type: 'NUMBER',
    icon: 'IconScale',
    settings: { decimals: 2 },
  });
  await ensureField(petObject, { name: 'castrado', label: 'Castrado(a)', type: 'BOOLEAN', icon: 'IconScissors' });
  await ensureField(petObject, { name: 'microchip', label: 'Microchip', type: 'TEXT', icon: 'IconCpu' });
  await ensureField(petObject, { name: 'observacoes', label: 'Observações', type: 'TEXT', icon: 'IconNotes' });

  console.log('\nCampos da Assinatura:');
  await ensureField(subscriptionObject, {
    name: 'plano',
    label: 'Plano',
    type: 'SELECT',
    icon: 'IconPackage',
    // Ajuste os nomes dos planos abaixo (ou depois, em Settings → Data model).
    options: [
      { label: 'Essencial', value: 'ESSENCIAL', color: 'blue', position: 0 },
      { label: 'Completo', value: 'COMPLETO', color: 'violet', position: 1 },
      { label: 'Premium', value: 'PREMIUM', color: 'amber', position: 2 },
    ],
  });
  await ensureField(subscriptionObject, {
    name: 'status',
    label: 'Status',
    type: 'SELECT',
    icon: 'IconCircleCheck',
    options: [
      { label: 'Ativa', value: 'ATIVA', color: 'green', position: 0 },
      { label: 'Inadimplente', value: 'INADIMPLENTE', color: 'orange', position: 1 },
      { label: 'Pausada', value: 'PAUSADA', color: 'yellow', position: 2 },
      { label: 'Cancelada', value: 'CANCELADA', color: 'red', position: 3 },
      { label: 'Encerrada', value: 'ENCERRADA', color: 'gray', position: 4 },
    ],
  });
  await ensureField(subscriptionObject, {
    name: 'valorMensal',
    label: 'Valor mensal',
    type: 'CURRENCY',
    icon: 'IconCurrencyDollar',
    defaultValue: { amountMicros: null, currencyCode: "'BRL'" },
  });
  await ensureField(subscriptionObject, {
    name: 'dataInicio',
    label: 'Início da vigência',
    type: 'DATE',
    icon: 'IconCalendar',
  });
  await ensureField(subscriptionObject, {
    name: 'proximaCobranca',
    label: 'Próxima cobrança',
    type: 'DATE',
    icon: 'IconCalendarDue',
  });
  await ensureField(subscriptionObject, {
    name: 'formaPagamento',
    label: 'Forma de pagamento',
    type: 'SELECT',
    icon: 'IconCreditCard',
    options: [
      { label: 'Cartão de crédito', value: 'CARTAO_CREDITO', color: 'blue', position: 0 },
      { label: 'Pix', value: 'PIX', color: 'green', position: 1 },
      { label: 'Boleto', value: 'BOLETO', color: 'gray', position: 2 },
    ],
  });

  console.log(`\nCampos do tutor (${tutorObject.nameSingular}):`);
  await ensureField(tutorObject, { name: 'cpf', label: 'CPF', type: 'TEXT', icon: 'IconId' });
  await ensureField(tutorObject, {
    name: 'statusCliente',
    label: 'Status do cliente',
    type: 'SELECT',
    icon: 'IconCircleCheck',
    options: [
      { label: 'Lead', value: 'LEAD', color: 'blue', position: 0 },
      { label: 'Cliente ativo', value: 'CLIENTE_ATIVO', color: 'green', position: 1 },
      { label: 'Inativo', value: 'INATIVO', color: 'gray', position: 2 },
      { label: 'Ex-cliente', value: 'EX_CLIENTE', color: 'red', position: 3 },
    ],
  });
  await ensureField(tutorObject, {
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

  console.log('\nRelações:');
  // Muitos pets → um tutor; o tutor ganha o campo espelhado "Pets".
  await ensureField(petObject, {
    name: 'tutor',
    label: 'Tutor',
    type: 'RELATION',
    icon: 'IconUser',
    relationCreationPayload: {
      targetObjectMetadataId: tutorObject.id,
      targetFieldLabel: 'Pets',
      targetFieldIcon: 'IconPaw',
      type: 'MANY_TO_ONE',
    },
  });
  // Muitas assinaturas → um pet (histórico de planos do pet).
  await ensureField(subscriptionObject, {
    name: 'pet',
    label: 'Pet',
    type: 'RELATION',
    icon: 'IconPaw',
    relationCreationPayload: {
      targetObjectMetadataId: petObject.id,
      targetFieldLabel: 'Assinaturas',
      targetFieldIcon: 'IconCreditCard',
      type: 'MANY_TO_ONE',
    },
  });
  // Muitas assinaturas → um titular (quem paga), direto no tutor.
  await ensureField(subscriptionObject, {
    name: 'titular',
    label: 'Titular',
    type: 'RELATION',
    icon: 'IconUser',
    relationCreationPayload: {
      targetObjectMetadataId: tutorObject.id,
      targetFieldLabel: 'Assinaturas',
      targetFieldIcon: 'IconCreditCard',
      type: 'MANY_TO_ONE',
    },
  });

  console.log(`\nPronto${DRY_RUN ? ' (nada foi alterado — dry-run)' : ''}. Abra Settings → Data model no Twenty para revisar.`);
};

run().catch((error) => {
  console.error(`\nFalhou: ${error.message}`);
  process.exit(1);
});
