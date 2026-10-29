// Target CRM model (skilland-dashboard/docs/CRM-MODEL.md, "API contract").
// API names and select values here are a contract with the sales dashboard: don't rename.

export const STAGE_OPTIONS = [
  { value: 'LEAD', label: 'Lead', color: 'purple', position: 0 },
  { value: 'QUALIFIED', label: 'Cualificado', color: 'sky', position: 1 },
  { value: 'PROPOSAL', label: 'Propuesta', color: 'turquoise', position: 2 },
  { value: 'NEGOTIATION', label: 'Negociación / Firma', color: 'orange', position: 3 },
  { value: 'WON_TO_START', label: 'Ganado – por empezar', color: 'yellow', position: 4 },
  { value: 'IN_EXECUTION', label: 'En ejecución', color: 'green', position: 5 },
  { value: 'COMPLETED', label: 'Completado', color: 'gray', position: 6 },
  { value: 'LOST', label: 'Perdido', color: 'red', position: 7 },
  { value: 'ON_HOLD', label: 'En pausa', color: 'blue', position: 8 },
];

export const STAGE_DEFAULT = 'LEAD';

export const STAGE_MAPPING = {
  POSSIBLE_OPPORTUNITY: 'LEAD',
  CONTACTED: 'LEAD',
  IN_MEETINGS: 'QUALIFIED',
  PROPOSAL_NEGOTIATION: 'PROPOSAL',
  PROPUESTA_PRESENTADA_NEGOCIACION: 'PROPOSAL',
  PENDING_SIGNATURE: 'NEGOTIATION',
  CLOSED: 'COMPLETED',
};

export const WON_STAGES = ['WON_TO_START', 'IN_EXECUTION', 'COMPLETED'];
export const OPEN_STAGES = ['LEAD', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION'];

export const BUSINESS_LINE_RENAMES = {
  Consultoría: 'Consulting',
  Plataforma: 'LMS',
  'Bootcamps a particulares': 'Formación paquetizada',
  'Formación a empresas': 'Formación a medida',
};

export const BUSINESS_LINE_MERGES = {
  Microcredenciales: 'LMS',
};

const option = (value, label, color, position) => ({ value, label, color, position });

export const OPPORTUNITY_FIELDS = [
  {
    name: 'origen',
    label: 'Origen',
    type: 'SELECT',
    icon: 'IconRoute',
    options: [
      option('WEB', 'Web (inbound)', 'green', 0),
      option('REFERIDO', 'Referido', 'turquoise', 1),
      option('OUTBOUND', 'Outbound (prospección)', 'blue', 2),
      option('PARTNER', 'Partner', 'purple', 3),
      option('LICITACION', 'Licitación / convocatoria', 'orange', 4),
      option('RED_PERSONAL', 'Red personal / evento', 'pink', 5),
    ],
  },
  {
    name: 'financiacion',
    label: 'Financiación',
    type: 'SELECT',
    icon: 'IconCoins',
    options: [
      option('PROPIA', 'Propia del cliente', 'green', 0),
      option('FUNDAE', 'FUNDAE', 'blue', 1),
      option('SUBVENCION', 'Subvención / fondos públicos', 'orange', 2),
    ],
  },
  {
    name: 'motivoPerdida',
    label: 'Motivo de pérdida',
    type: 'SELECT',
    icon: 'IconThumbDown',
    options: [
      option('PRECIO', 'Precio', 'red', 0),
      option('TIMING', 'Timing', 'orange', 1),
      option('SIN_PRESUPUESTO', 'Sin presupuesto', 'yellow', 2),
      option('COMPETIDOR', 'Competidor', 'purple', 3),
      option('SIN_RESPUESTA', 'Sin respuesta', 'gray', 4),
      option('NO_ENCAJA', 'No encaja', 'sky', 5),
      option('CAMPANA_CERRADA', 'Campaña cerrada', 'pink', 6),
    ],
  },
  { name: 'fechaGanado', label: 'Fecha de ganado', type: 'DATE', icon: 'IconTrophy' },
  { name: 'fechaRetomar', label: 'Fecha para retomar', type: 'DATE', icon: 'IconCalendarRepeat' },
];

export const COMPANY_FIELDS = [
  {
    name: 'tipoCliente',
    label: 'Tipo de cliente',
    type: 'SELECT',
    icon: 'IconBuildingCommunity',
    options: [
      option('B2C', 'B2C (particulares)', 'pink', 0),
      option('B2B', 'B2B (empresas y entidades)', 'blue', 1),
      option('B2G', 'B2G (administraciones públicas)', 'green', 2),
    ],
  },
];

export const CAMPANA_OBJECT = {
  object: {
    nameSingular: 'campana',
    namePlural: 'campanas',
    labelSingular: 'Campaña',
    labelPlural: 'Campañas',
    icon: 'IconSpeakerphone',
    description: 'Campañas de marketing/captación: campaña → lead → oportunidad → venta.',
  },
  fields: [
    { name: 'canal', label: 'Canal', type: 'TEXT', icon: 'IconBroadcast' },
    { name: 'fechaInicio', label: 'Fecha de inicio', type: 'DATE', icon: 'IconCalendarEvent' },
    { name: 'fechaFin', label: 'Fecha de fin', type: 'DATE', icon: 'IconCalendarOff' },
  ],
  // reverse field name on campana is derived by Twenty from reverseLabel
  relations: [
    {
      source: 'opportunity',
      name: 'campana',
      label: 'Campaña',
      icon: 'IconSpeakerphone',
      reverseName: 'opportunities',
      reverseLabel: 'Opportunities',
      reverseIcon: 'IconTargetArrow',
    },
    {
      source: 'person',
      name: 'campana',
      label: 'Campaña',
      icon: 'IconSpeakerphone',
      reverseName: 'people',
      reverseLabel: 'People',
      reverseIcon: 'IconUsers',
    },
  ],
};

export const CANAL_MAPPING = {
  SUBVENCION: { financiacion: 'SUBVENCION' },
  LICITACION: { origen: 'LICITACION', financiacion: 'SUBVENCION' },
  CONSORCIO_EU: { origen: 'PARTNER', financiacion: 'SUBVENCION' },
  PARTNER: { origen: 'PARTNER' },
  INBOUND: { origen: 'WEB' },
  DIRECTO: { origen: 'OUTBOUND' },
};

export const LEGACY_OPPORTUNITY_FIELDS_TO_DEACTIVATE = [
  'canal',
  'iaMujeresFunnelStage',
  'outreachStatus',
  'gmailDraftId',
  'gmailMessageId',
  'gmailThreadId',
  'lastEmailEventAt',
  'lastEmailEventType',
  'lastEmailTemplate',
  'lastEmailSubject',
  'firstEmailSentAt',
  'lastEmailSentAt',
  'lastReplyAt',
  'followUpDueAt',
  'activeBatchId',
];

export function isIaMujeres(opp) {
  return [opp.name, opp.businessLineName, opp.campaignName].some((v) => /mujeres/i.test(v ?? ''));
}

// Public administrations and public bodies (incl. public universities, public companies,
// public foundations and chambers of commerce).
const B2G_ORG_TYPES = new Set(['ayuntamiento', 'cabildo', 'gobierno_autonomico']);
const B2G_PATTERN = new RegExp(
  [
    'ayuntamiento',
    'cabildo',
    'gobierno',
    'consejer[ií]a',
    'ministerio',
    'diputaci[oó]n',
    'instituto p[uú]blico',
    'ej[eé]rcito',
    'fundaci[oó]n universitaria',
    'universi(dad|tat|dade|ty)',
    'c[aá]mara de comercio',
    'sociedad.(de.)?desarrollo',
    '\\bull\\b',
    'ulpgc',
    '\\bupct\\b',
    '\\bicap\\b',
    'fgull',
    '\\bspet\\b',
    'aciisi',
    '\\bcrue\\b',
    '\\buned\\b',
    '\\budc\\b',
    '\\bjcyl\\b',
    '\\bcdti\\b',
    '\\binta\\b',
    'proexca',
    'sodecan',
    'spegc',
    'sagulpa',
    'red\\.es',
    'red cide',
    'itccanarias',
    'casa [aá]frica',
    'webtenerife',
    'fifede',
    'fundacion biodiversidad',
    'ieselrincon',
    'usach',
    'servicio canario',
  ].join('|'),
  'i',
);
// Private universities that the B2G pattern would otherwise catch.
const B2B_OVERRIDE = /pontificia|valencian international|\bviu\b/i;
// Companies that are really individuals (Bootcamps a particulares).
const B2C_NAMES = new Set(['Joan']);

export function classifyCompany({ name, organizationType }) {
  const label = name ?? '';
  if (B2C_NAMES.has(label.trim())) return 'B2C';
  if (B2B_OVERRIDE.test(label)) return 'B2B';
  if (B2G_ORG_TYPES.has(organizationType ?? '')) return 'B2G';
  if (B2G_PATTERN.test(`${label} ${organizationType ?? ''}`)) return 'B2G';
  return 'B2B';
}
