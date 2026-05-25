// Objeto "Leads | Brasil" — réplica 1:1 do board do Monday (board 18194183219),
// com TODAS as colunas mapeadas. Colunas sem equivalente no Twenty (subitens,
// mirror/lookup, fórmula, integração Google Calendar, monday Doc, anexo) são omitidas.

const COLORS = [
  'blue', 'sky', 'turquoise', 'green', 'yellow', 'orange',
  'red', 'pink', 'purple', 'gray',
];

// Gera um value de enum válido (IsValidGraphQLEnumName) a partir de um rótulo:
// remove acentos, maiúsculas, troca não-alfanuméricos por "_", prefixa se começar com dígito.
const enumValue = (label) => {
  let v = label
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  if (/^[0-9]/.test(v)) v = `N_${v}`;
  return v || 'OPCAO';
};

// Converte uma lista de rótulos em options {value,label,color}, deduplicando values.
const toOptions = (labels) => {
  const seen = new Set();
  const options = [];
  labels.forEach((label) => {
    let value = enumValue(label);
    while (seen.has(value)) value = `${value}_`;
    seen.add(value);
    options.push({ value, label, color: COLORS[options.length % COLORS.length], position: options.length });
  });
  return options;
};

const select = (name, label, icon, labels) => ({
  type: 'SELECT', name, label, icon, options: toOptions(labels),
});
const multiSelect = (name, label, icon, labels) => ({
  type: 'MULTI_SELECT', name, label, icon, options: toOptions(labels),
});

// Relações para membros da equipe (people columns do Monday).
const relMember = (name, label, plural) => ({
  type: 'RELATION', name, label, icon: 'IconUser',
  relation: { type: 'MANY_TO_ONE', targetObject: 'workspaceMember', targetFieldLabel: plural, targetFieldIcon: 'IconUser' },
});

export const LEADS_BRASIL = {
  nameSingular: 'leadBrasil',
  namePlural: 'leadsBrasil',
  labelSingular: 'Lead',
  labelPlural: 'Leads | Brasil',
  icon: 'IconTargetArrow',
  fields: [
    // --- Datas de entrada / pipeline ---
    { type: 'DATE', name: 'dataEntrada', label: 'Data da Entrada', icon: 'IconCalendar' },

    // --- Responsáveis (people) ---
    relMember('sdr', 'SDR', 'Leads (SDR)'),
    relMember('closer', 'Closer', 'Leads (Closer)'),

    // --- Status / classificações (status columns) ---
    select('statusLead', 'Status do Lead', 'IconProgress', [
      'NOVO LEAD', 'Contatado', 'Sem resposta', 'Telefone Inválido', 'Não é Provedor',
      'Declinou', 'Inicial Agendada', 'Inicial No Show', 'Proposta Agendada', 'Proposta No Show',
      'Negociação', 'Não convertido', 'Vendido', 'Gerar Contrato / Boleto', 'Follow Up',
      'Cortesia Evento', 'Negociação No Show',
    ]),
    select('qualidade', 'Qualidade', 'IconStar', [
      'A qualificar', 'Qualificado', 'Desqualificado', 'Não identificado', 'Não é Provedor',
    ]),
    select('origemLead', 'Origem Lead', 'IconRoute', [
      'Site', 'Cliente Base', 'Lista Fria', 'Tráfego Pago', 'Orgânico', 'Indicação',
      'Instagram Danilo', 'Instagram Delipe', 'Imersão Compra e Venda', 'Imersão B2B',
      'Evento', 'Lead antigo', 'Abramulti 2026', 'Abrint 2026', 'ADS 1º Tri', 'Futurecom 25',
    ]),
    select('canal', 'Canal', 'IconRadio', [
      'Site', 'Meta Ads', 'Landing Page', 'SDR', 'Clientes Base', 'BDR', 'Google ADS',
      'Indicação', 'Instagram Delipe', 'Instagram Danilo', 'Form Serviços', 'Futurecom 25',
      'Leadster', 'Imersão B2B', 'Delipe One', 'Imersão Compra e Venda', 'Abrint 2026',
      'Lista Fria', 'Encontro Internacional', 'Abramulti', 'Visita Presencial', 'Stand',
      'WhatsApp', 'Abrint', 'Assessoria Comercial', 'Porta-a-porta e Indicação',
    ]),
    select('cargo', 'Cargo', 'IconBriefcase', [
      'Diretor', 'CEO', 'Funcionário', 'Gestor', 'Gerente', 'Dono', 'Sócio', 'Supervisor',
      'Gestor Comercial', 'Gerente nacional', 'Comprador', 'Gerente de CRM', 'Consultor',
      'Representante', 'Analista de TI', 'Gerente de Contas', 'Proprietário', 'Supervisor de vendas',
    ]),
    select('clienteEhBase', 'Cliente já é Base?', 'IconUsers', [
      'Cliente Base', 'Cliente Novo', 'Ex Cliente Base',
    ]),
    select('b2bB2c', 'B2C ou B2B?', 'IconCategory', ['B2C', 'B2B']),
    select('temperatura', 'Temperatura', 'IconTemperature', ['Morno', 'Quente', 'Frio']),
    select('tipoNovo', 'Tipo Novo', 'IconTag', ['Evento', 'Serviços', 'Produto', 'MRR']),
    multiSelect('servicosContratados', 'Serviços Contratados', 'IconShoppingCart', [
      'Assessoria Comercial B2B', 'Desenvolvimento de Marca', 'Assessoria Comercial', 'Glaper',
      'Marketing Completo', 'Marketing em Performance', 'Plataforma BI', 'Recorrência de vídeos',
      'Assessoria em Churn', 'Desenvolvimento de Site', 'Produção de vídeo', 'Follow Day',
      'Diagnóstico de Churn', 'Diagnóstico Comercial', 'Dedir', 'Marketing Branding',
      'Produção de Vídeo + Celebridade', 'Projeto Delipe One', 'Patrocínio', 'Imersão B2B',
      'Imersão Compra e Venda', 'Diagnóstico B2B', '6 Encontro Internacional', 'IA de atendimento',
    ]),
    // "Tipo" no Monday tinha 113 valores ruidosos com ids duplicados → TEXT (lossless p/ migração).
    { type: 'TEXT', name: 'tipoDetalhado', label: 'Tipo (detalhado)', icon: 'IconTag' },

    // --- Contato / empresa ---
    { type: 'TEXT', name: 'nomeDecisor', label: 'Nome Decisor', icon: 'IconUser' },
    { type: 'TEXT', name: 'nomeContato', label: 'Nome do contato', icon: 'IconUser' },
    { type: 'EMAILS', name: 'email', label: 'E-mail', icon: 'IconMail' },
    { type: 'PHONES', name: 'telefone', label: 'Telefone', icon: 'IconPhone' },
    { type: 'TEXT', name: 'assinantes', label: 'Assinantes', icon: 'IconUsers' },
    { type: 'LINKS', name: 'site', label: 'Site', icon: 'IconWorld' },
    { type: 'TEXT', name: 'cidadeEstado', label: 'Cidade e Estado', icon: 'IconMapPin' },
    { type: 'LINKS', name: 'linkPreDiagnostico', label: 'Link Pré-Diagnóstico', icon: 'IconLink' },
    { type: 'TEXT', name: 'cnpj', label: 'CNPJ', icon: 'IconId' },
    { type: 'EMAILS', name: 'emailFinanceiro', label: 'E-mail Financeiro', icon: 'IconMail' },
    { type: 'PHONES', name: 'telefoneFinanceiro', label: 'Telefone do financeiro', icon: 'IconPhone' },

    // --- Textos longos / observações ---
    { type: 'RICH_TEXT', name: 'observacoesVenda', label: 'Observações da Venda', icon: 'IconNotes' },
    { type: 'TEXT', name: 'detalhesLead', label: 'Detalhes do Lead', icon: 'IconNotes' },
    { type: 'TEXT', name: 'detalhesNegociacao', label: 'Detalhes da Negociação', icon: 'IconNotes' },
    { type: 'TEXT', name: 'detalhesReuniao', label: 'Detalhes da Reunião', icon: 'IconNotes' },
    { type: 'TEXT', name: 'analiseIa', label: 'Análise IA', icon: 'IconRobot' },

    // --- Valores ---
    { type: 'NUMBER', name: 'implantacaoReais', label: 'Implantação (R$)', icon: 'IconCash' },
    { type: 'NUMBER', name: 'qtdParcelas', label: 'Quantidade de Parcelas', icon: 'IconListNumbers' },
    { type: 'CURRENCY', name: 'mrr', label: 'MRR (R$)', icon: 'IconRefresh' },
    { type: 'CURRENCY', name: 'produtoValor', label: 'Produto (R$)', icon: 'IconCash' },
    { type: 'CURRENCY', name: 'eventoValor', label: 'Evento (R$)', icon: 'IconCash' },

    // --- Datas de reunião / etapas ---
    { type: 'DATE', name: 'dataVencimento', label: 'Data de Vencimento', icon: 'IconCalendar' },
    { type: 'DATE_TIME', name: 'reuniaoInicial', label: 'Reunião Inicial', icon: 'IconCalendarEvent' },
    { type: 'DATE_TIME', name: 'reuniaoProposta', label: 'Reunião Proposta', icon: 'IconCalendarEvent' },
    { type: 'DATE', name: 'dataContatado', label: 'Data Contatado', icon: 'IconCalendar' },
    { type: 'DATE', name: 'dataDeclinou', label: 'Data Declinou', icon: 'IconCalendar' },
    { type: 'DATE', name: 'dataInicial', label: 'Data Inicial', icon: 'IconCalendar' },
    { type: 'DATE', name: 'dataProposta', label: 'Data Proposta', icon: 'IconCalendar' },
    { type: 'DATE', name: 'dataNegociacao', label: 'Data Negociação', icon: 'IconCalendar' },
    { type: 'DATE', name: 'dataVendido', label: 'Data Vendido', icon: 'IconCalendar' },
    { type: 'DATE', name: 'dataPerdido', label: 'Data Perdido', icon: 'IconCalendar' },
    { type: 'DATE', name: 'data', label: 'Data', icon: 'IconCalendar' },

    // --- Marketing / rastreamento ---
    { type: 'TEXT', name: 'campanhaAds', label: 'Campanha ADS', icon: 'IconSpeakerphone' },
    { type: 'TEXT', name: 'conjuntoAds', label: 'Conjunto ADS', icon: 'IconSpeakerphone' },
    { type: 'TEXT', name: 'anuncioAds', label: 'Anúncio ADS', icon: 'IconSpeakerphone' },
    { type: 'TEXT', name: 'utmSource', label: 'Utm Source', icon: 'IconRoute' },
    { type: 'TEXT', name: 'utmMedium', label: 'Utm Medium', icon: 'IconRoute' },
    { type: 'TEXT', name: 'leadId', label: 'Lead Id', icon: 'IconHash' },
    { type: 'LINKS', name: 'salesfy', label: 'Salesfy', icon: 'IconLink' },
    { type: 'TEXT', name: 'origemVenda', label: 'Origem da Venda', icon: 'IconRoute' },

    // --- Relações ---
    { type: 'RELATION', name: 'empresa', label: 'Empresa', icon: 'IconBuildingSkyscraper',
      relation: { type: 'MANY_TO_ONE', targetObject: 'company', targetFieldLabel: 'Leads | Brasil', targetFieldIcon: 'IconTargetArrow' } },
    { type: 'RELATION', name: 'financeiro', label: 'Financeiro', icon: 'IconReceipt',
      relation: { type: 'MANY_TO_ONE', targetObject: 'financeiro', targetFieldLabel: 'Leads', targetFieldIcon: 'IconTargetArrow' } },
  ],
  views: [
    { name: 'Funil', type: 'KANBAN', groupBy: 'statusLead', aggregate: { operation: 'SUM', field: 'mrr' }, icon: 'IconLayoutKanban' },
  ],
};
