// Spec declarativo da estrutura do CRM (mapeado do Monday.com da Delipe).
// Cada objeto lista os campos custom a garantir. O motor (apply.mjs) é idempotente:
// só cria o que ainda não existe; o campo `stage` do Opportunity é sempre atualizado.
//
// Tipos usados (FieldMetadataType): TEXT, SELECT, MULTI_SELECT, NUMBER, CURRENCY,
// DATE, RICH_TEXT, PHONES, EMAILS, LINKS, BOOLEAN, RELATION.
// Cores válidas (TagColor): green, turquoise, sky, blue, purple, pink, red, orange, yellow, gray.

import { LEADS_BRASIL } from './leads-brasil.mjs';

// Helper: monta options de SELECT a partir de tuplas [value, label, color].
const opts = (...tuples) =>
  tuples.map(([value, label, color], position) => ({
    value,
    label,
    color,
    position,
  }));

// ---------------------------------------------------------------------------
// Estágios do funil (substituem os 5 estágios padrão do Opportunity do Twenty).
// Espelham o "Status do Lead" do board "Leads | Brasil".
// ---------------------------------------------------------------------------
export const OPPORTUNITY_STAGES = opts(
  ['NOVO_LEAD', 'Novo Lead', 'blue'],
  ['CONTATADO', 'Contatado', 'sky'],
  ['SEM_RESPOSTA', 'Sem resposta', 'gray'],
  ['TELEFONE_INVALIDO', 'Telefone Inválido', 'gray'],
  ['NAO_E_PROVEDOR', 'Não é Provedor', 'gray'],
  ['DECLINOU', 'Declinou', 'red'],
  ['INICIAL_AGENDADA', 'Inicial Agendada', 'turquoise'],
  ['INICIAL_NO_SHOW', 'Inicial No Show', 'orange'],
  ['PROPOSTA_AGENDADA', 'Proposta Agendada', 'purple'],
  ['PROPOSTA_NO_SHOW', 'Proposta No Show', 'orange'],
  ['NEGOCIACAO', 'Negociação', 'yellow'],
  ['NAO_CONVERTIDO', 'Não Convertido', 'red'],
  ['VENDIDO', 'Vendido', 'green'],
  ['FOLLOW_UP', 'Follow Up', 'pink'],
);

// Estágios da Assessoria (board "Assessoria B2B, B2C e CHURN" → "Status do projeto").
const ASSESSORIA_STATUS = opts(
  ['DIAGNOSTICO', 'Diagnóstico', 'purple'],
  ['RAMPAGEM', 'Rampagem', 'orange'],
  ['AJUSTE_E_VALIDACAO', 'Ajuste e Validação', 'red'],
  ['MATURACAO', 'Maturação', 'sky'],
  ['CONSOLIDACAO', 'Consolidação', 'blue'],
  ['FINALIZADO', 'Finalizado', 'green'],
);

// Relações de atalho.
const relCompany = (label = 'Empresa', plural = undefined) => ({
  type: 'RELATION',
  name: 'company',
  label,
  icon: 'IconBuildingSkyscraper',
  relation: {
    type: 'MANY_TO_ONE',
    targetObject: 'company',
    targetFieldLabel: plural,
    targetFieldIcon: 'IconBuildingSkyscraper',
  },
});
const relMember = (name, label, plural) => ({
  type: 'RELATION',
  name,
  label,
  icon: 'IconUser',
  relation: {
    type: 'MANY_TO_ONE',
    targetObject: 'workspaceMember',
    targetFieldLabel: plural,
    targetFieldIcon: 'IconUser',
  },
});

// ---------------------------------------------------------------------------
// Objetos STANDARD a estender (já existem no Twenty; só adicionamos campos).
// ---------------------------------------------------------------------------
export const STANDARD_OBJECTS = [
  {
    nameSingular: 'company',
    fields: [
      { type: 'TEXT', name: 'cnpj', label: 'CNPJ', icon: 'IconId' },
      { type: 'TEXT', name: 'regiaoAtendimento', label: 'Região de Atendimento', icon: 'IconMapPin' },
      { type: 'SELECT', name: 'b2bB2c', label: 'B2B ou B2C', icon: 'IconCategory',
        options: opts(['B2B', 'B2B', 'blue'], ['B2C', 'B2C', 'green'], ['AMBOS', 'Ambos', 'purple']) },
      { type: 'SELECT', name: 'pais', label: 'País', icon: 'IconFlag',
        options: opts(['BRASIL', 'Brasil', 'green'], ['LATAM', 'Latam', 'orange']) },
      { type: 'SELECT', name: 'clienteEhBase', label: 'Cliente já é Base?', icon: 'IconUsers',
        options: opts(['CLIENTE_BASE', 'Cliente Base', 'blue'], ['CLIENTE_NOVO', 'Cliente Novo', 'green'], ['EX_CLIENTE_BASE', 'Ex Cliente Base', 'red']) },
      { type: 'SELECT', name: 'origem', label: 'Origem', icon: 'IconRoute',
        options: opts(['SITE', 'Site', 'orange'], ['TRAFEGO_PAGO', 'Tráfego Pago', 'blue'], ['ORGANICO', 'Orgânico', 'sky'], ['INDICACAO', 'Indicação', 'yellow'], ['EVENTO', 'Evento', 'purple'], ['LISTA_FRIA', 'Lista Fria', 'gray'], ['CLIENTE_BASE', 'Cliente Base', 'turquoise']) },
    ],
  },
  {
    nameSingular: 'person',
    fields: [
      { type: 'SELECT', name: 'cargo', label: 'Cargo', icon: 'IconBriefcase',
        options: opts(['CEO', 'CEO', 'green'], ['DONO', 'Dono', 'turquoise'], ['SOCIO', 'Sócio', 'sky'], ['DIRETOR', 'Diretor', 'blue'], ['GERENTE', 'Gerente', 'purple'], ['GESTOR', 'Gestor', 'pink'], ['GESTOR_COMERCIAL', 'Gestor Comercial', 'yellow'], ['SUPERVISOR', 'Supervisor', 'orange'], ['FUNCIONARIO', 'Funcionário', 'gray'], ['OUTRO', 'Outro', 'gray']) },
      { type: 'PHONES', name: 'telefoneFinanceiro', label: 'Telefone do Financeiro', icon: 'IconPhone' },
      { type: 'EMAILS', name: 'emailFinanceiro', label: 'E-mail do Financeiro', icon: 'IconMail' },
    ],
  },
  {
    nameSingular: 'opportunity',
    // O campo `stage` é atualizado (não criado) com OPPORTUNITY_STAGES — ver apply.mjs.
    fields: [
      { type: 'SELECT', name: 'canal', label: 'Canal', icon: 'IconRadio',
        options: opts(['SITE', 'Site', 'orange'], ['META_ADS', 'Meta Ads', 'blue'], ['GOOGLE_ADS', 'Google Ads', 'sky'], ['LANDING_PAGE', 'Landing Page', 'red'], ['SDR', 'SDR', 'turquoise'], ['BDR', 'BDR', 'gray'], ['CLIENTES_BASE', 'Clientes Base', 'purple'], ['INDICACAO', 'Indicação', 'yellow'], ['INSTAGRAM', 'Instagram', 'pink'], ['EVENTO', 'Evento', 'green'], ['LISTA_FRIA', 'Lista Fria', 'gray'], ['WHATSAPP', 'WhatsApp', 'green'], ['OUTRO', 'Outro', 'gray']) },
      { type: 'SELECT', name: 'origemLead', label: 'Origem do Lead', icon: 'IconRoute',
        options: opts(['SITE', 'Site', 'orange'], ['TRAFEGO_PAGO', 'Tráfego Pago', 'blue'], ['ORGANICO', 'Orgânico', 'sky'], ['INDICACAO', 'Indicação', 'yellow'], ['EVENTO', 'Evento', 'purple'], ['CLIENTE_BASE', 'Cliente Base', 'turquoise'], ['LISTA_FRIA', 'Lista Fria', 'gray'], ['INSTAGRAM_DELIPE', 'Instagram Delipe', 'pink'], ['INSTAGRAM_DANILO', 'Instagram Danilo', 'red'], ['OUTRO', 'Outro', 'gray']) },
      { type: 'SELECT', name: 'qualidade', label: 'Qualidade', icon: 'IconStar',
        options: opts(['A_QUALIFICAR', 'A qualificar', 'sky'], ['QUALIFICADO', 'Qualificado', 'green'], ['DESQUALIFICADO', 'Desqualificado', 'red'], ['NAO_IDENTIFICADO', 'Não identificado', 'purple'], ['NAO_E_PROVEDOR', 'Não é Provedor', 'gray']) },
      { type: 'SELECT', name: 'temperatura', label: 'Temperatura', icon: 'IconTemperature',
        options: opts(['QUENTE', 'Quente', 'red'], ['MORNO', 'Morno', 'orange'], ['FRIO', 'Frio', 'sky']) },
      { type: 'SELECT', name: 'tipo', label: 'Tipo', icon: 'IconTag',
        options: opts(['MRR', 'MRR', 'green'], ['PRODUTO', 'Produto', 'blue'], ['PRODUTO_UNICO', 'Produto Único', 'sky'], ['EVENTO', 'Evento', 'purple'], ['SERVICOS', 'Serviços', 'orange']) },
      { type: 'CURRENCY', name: 'mrr', label: 'MRR', icon: 'IconRefresh' },
      { type: 'NUMBER', name: 'implantacaoReais', label: 'Implantação (R$)', icon: 'IconCash' },
      { type: 'DATE', name: 'dataEntrada', label: 'Data de Entrada', icon: 'IconCalendar' },
      { type: 'DATE', name: 'dataContatado', label: 'Data Contatado', icon: 'IconCalendar' },
      { type: 'DATE', name: 'dataInicial', label: 'Data Reunião Inicial', icon: 'IconCalendar' },
      { type: 'DATE', name: 'dataProposta', label: 'Data Proposta', icon: 'IconCalendar' },
      { type: 'DATE', name: 'dataNegociacao', label: 'Data Negociação', icon: 'IconCalendar' },
      { type: 'DATE', name: 'dataVendido', label: 'Data Vendido', icon: 'IconCalendar' },
      { type: 'DATE', name: 'dataPerdido', label: 'Data Perdido', icon: 'IconCalendar' },
      { type: 'RICH_TEXT', name: 'detalhes', label: 'Detalhes da Negociação', icon: 'IconNotes' },
      relMember('sdr', 'SDR', 'Oportunidades (SDR)'),
      relMember('closer', 'Closer', 'Oportunidades (Closer)'),
    ],
  },
];

// ---------------------------------------------------------------------------
// Objetos CUSTOM novos a criar.
// ---------------------------------------------------------------------------
export const CUSTOM_OBJECTS = [
  LEADS_BRASIL,
  {
    nameSingular: 'financeiro',
    namePlural: 'financeiros',
    labelSingular: 'Financeiro',
    labelPlural: 'Financeiro',
    icon: 'IconReceipt',
    fields: [
      { type: 'SELECT', name: 'statusPagamento', label: 'Status', icon: 'IconProgress',
        options: opts(['PENDENTE', 'Pendente', 'orange'], ['PAGO', 'Pago', 'green'], ['ATRASADO', 'Atrasado', 'red'], ['CANCELADO', 'Cancelado', 'gray']) },
      { type: 'CURRENCY', name: 'valor', label: 'Valor', icon: 'IconCash' },
      { type: 'NUMBER', name: 'qtdParcelas', label: 'Quantidade de Parcelas', icon: 'IconListNumbers' },
      { type: 'SELECT', name: 'formaPagamento', label: 'Forma de Pagamento', icon: 'IconCreditCard',
        options: opts(['BOLETO', 'Boleto', 'blue'], ['PIX', 'Pix', 'green'], ['CARTAO', 'Cartão', 'purple'], ['TRANSFERENCIA', 'Transferência', 'sky']) },
      { type: 'DATE', name: 'dataSolicitacao', label: 'Data de Solicitação', icon: 'IconCalendar' },
      { type: 'DATE', name: 'dataVencimento', label: 'Data de Vencimento', icon: 'IconCalendar' },
      { type: 'DATE', name: 'ultimoPagamento', label: 'Último Pagamento', icon: 'IconCalendar' },
      { type: 'RICH_TEXT', name: 'motivoCancelamento', label: 'Motivo do Cancelamento', icon: 'IconNotes' },
      relCompany('Empresa', 'Financeiro'),
    ],
    views: [{ name: 'Por Status', type: 'KANBAN', groupBy: 'statusPagamento', icon: 'IconLayoutKanban' }],
  },
  {
    nameSingular: 'assessoria',
    namePlural: 'assessorias',
    labelSingular: 'Assessoria',
    labelPlural: 'Assessorias',
    icon: 'IconHeadset',
    fields: [
      { type: 'SELECT', name: 'statusProjeto', label: 'Status do Projeto', icon: 'IconProgress', options: ASSESSORIA_STATUS },
      { type: 'NUMBER', name: 'notaCliente', label: 'Nota do Cliente (1-5)', icon: 'IconStar' },
      { type: 'SELECT', name: 'b2bB2c', label: 'B2B / B2C / Churn', icon: 'IconCategory',
        options: opts(['B2B', 'B2B', 'blue'], ['B2C', 'B2C', 'green'], ['CHURN', 'Churn', 'red']) },
      { type: 'DATE', name: 'inicio', label: 'Início', icon: 'IconCalendar' },
      { type: 'DATE', name: 'fimAtendimento', label: 'Fim do Atendimento', icon: 'IconCalendar' },
      { type: 'LINKS', name: 'driveCliente', label: 'Drive do Cliente', icon: 'IconBrandGoogleDrive' },
      relMember('responsavel', 'Responsável', 'Assessorias'),
      relCompany('Empresa', 'Assessorias'),
    ],
    views: [{ name: 'Por Status do Projeto', type: 'KANBAN', groupBy: 'statusProjeto', icon: 'IconLayoutKanban' }],
  },
  {
    nameSingular: 'onboarding',
    namePlural: 'onboardings',
    labelSingular: 'Onboarding',
    labelPlural: 'Onboardings',
    icon: 'IconRocket',
    fields: [
      { type: 'SELECT', name: 'statusOnboarding', label: 'Status', icon: 'IconProgress',
        options: opts(['NAO_INICIADO', 'Não Iniciado', 'gray'], ['EM_ANDAMENTO', 'Em Andamento', 'orange'], ['CONCLUIDO', 'Concluído', 'green']) },
      { type: 'SELECT', name: 'temGrupoCriado', label: 'Tem Grupo Criado?', icon: 'IconUsersGroup',
        options: opts(['SIM', 'Sim', 'green'], ['NAO', 'Não', 'red']) },
      { type: 'DATE', name: 'inicio', label: 'Início', icon: 'IconCalendar' },
      relMember('responsavel', 'Responsável', 'Onboardings'),
      relCompany('Empresa', 'Onboardings'),
    ],
    views: [{ name: 'Por Status', type: 'KANBAN', groupBy: 'statusOnboarding', icon: 'IconLayoutKanban' }],
  },
  {
    nameSingular: 'listaFria',
    namePlural: 'listaFrias',
    labelSingular: 'Lista Fria',
    labelPlural: 'Lista Fria (SDR)',
    icon: 'IconSnowflake',
    fields: [
      { type: 'SELECT', name: 'statusContato', label: 'Status do Contato', icon: 'IconProgress',
        options: opts(['NOVO', 'Novo', 'blue'], ['CONTATADO', 'Contatado', 'sky'], ['SEM_RESPOSTA', 'Sem Resposta', 'gray'], ['AGENDADO', 'Agendado', 'green'], ['DESCARTADO', 'Descartado', 'red']) },
      { type: 'PHONES', name: 'telefone', label: 'Telefone', icon: 'IconPhone' },
      { type: 'TEXT', name: 'cnpj', label: 'CNPJ', icon: 'IconId' },
      relMember('sdr', 'SDR', 'Lista Fria'),
      relCompany('Empresa', 'Lista Fria'),
    ],
    views: [{ name: 'Por Status', type: 'KANBAN', groupBy: 'statusContato', icon: 'IconLayoutKanban' }],
  },
  {
    nameSingular: 'vendaBase',
    namePlural: 'vendaBases',
    labelSingular: 'Venda Base',
    labelPlural: 'Vendas Base',
    icon: 'IconRefresh',
    fields: [
      { type: 'SELECT', name: 'statusVenda', label: 'Status', icon: 'IconProgress',
        options: opts(['EM_NEGOCIACAO', 'Em Negociação', 'orange'], ['GANHO', 'Ganho', 'green'], ['PERDIDO', 'Perdido', 'red']) },
      { type: 'CURRENCY', name: 'valor', label: 'Valor', icon: 'IconCash' },
      { type: 'DATE', name: 'data', label: 'Data', icon: 'IconCalendar' },
      relMember('closer', 'Closer', 'Vendas Base'),
      relCompany('Empresa', 'Vendas Base'),
    ],
    views: [{ name: 'Por Status', type: 'KANBAN', groupBy: 'statusVenda', icon: 'IconLayoutKanban' }],
  },
  {
    nameSingular: 'glaper',
    namePlural: 'glapers',
    labelSingular: 'Glaper',
    labelPlural: 'Glaper',
    icon: 'IconBuildingStore',
    fields: [
      { type: 'SELECT', name: 'statusCaptacao', label: 'Status da Captação', icon: 'IconProgress',
        options: opts(['PROSPECCAO', 'Prospecção', 'sky'], ['EM_NEGOCIACAO', 'Em Negociação', 'orange'], ['FECHADO', 'Fechado', 'green'], ['PERDIDO', 'Perdido', 'red']) },
      { type: 'TEXT', name: 'nomeComercio', label: 'Nome do Comércio', icon: 'IconBuildingStore' },
      { type: 'PHONES', name: 'telefone', label: 'Telefone', icon: 'IconPhone' },
      relCompany('Empresa', 'Glaper'),
    ],
    views: [{ name: 'Por Status', type: 'KANBAN', groupBy: 'statusCaptacao', icon: 'IconLayoutKanban' }],
  },
];

// Rótulos pt-BR para os objetos padrão (o catálogo pt-BR do Twenty não traduz
// todos automaticamente). [labelSingular, labelPlural].
export const STANDARD_OBJECT_LABELS = {
  company: ['Empresa', 'Empresas'],
  person: ['Pessoa', 'Pessoas'],
  opportunity: ['Oportunidade', 'Oportunidades'],
  dashboard: ['Painel', 'Painéis'],
  workflow: ['Fluxo', 'Fluxos de Trabalho'],
  task: ['Tarefa', 'Tarefas'],
  note: ['Nota', 'Notas'],
};

// Views adicionais em objetos standard.
export const STANDARD_VIEWS = [
  {
    object: 'opportunity',
    name: 'Funil de Vendas',
    type: 'KANBAN',
    groupBy: 'stage',
    aggregate: { operation: 'SUM', field: 'mrr' },
    icon: 'IconLayoutKanban',
  },
];
