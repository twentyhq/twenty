import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

type ShahryarMarketDataSeed = {
  id: string;
  name: string;
  ownerName: string;
  phoneNumber: string;
  assignedSupervisorId: string;
  gpsLocation: string;
  marketAddress: string;
  district: string;
  paymentStatus: string;
  balanceAmount: number;
  notes: string;
  isActiveMarket: boolean;
};

type ShahryarSupervisorVisitDataSeed = {
  id: string;
  name: string;
  marketId: string;
  supervisorId: string;
  checkInAt: string;
  checkOutAt: string;
  gpsLocation: string;
  soldCartons: number;
  requestedCartons: number;
  issue: string;
  decisionMaker: string;
  requestDetails: string;
  report: string;
  notes: string;
};

type ShahryarWorkingTimeDataSeed = {
  id: string;
  name: string;
  supervisorId: string;
  workDate: string;
  checkInAt: string;
  checkOutAt: string;
  gpsLocation: string;
  totalMinutes: number;
  status: string;
};

type ShahryarPaymentDataSeed = {
  id: string;
  name: string;
  marketId: string;
  collectedById: string;
  amount: number;
  dueDate: string;
  paidAt: string;
  status: string;
  notes: string;
};

type ShahryarSupervisorPenaltyDataSeed = {
  id: string;
  name: string;
  supervisorId: string;
  reason: string;
  amount: number;
  penaltyDate: string;
  decidedBy: string;
};

type ShahryarAbsenceDataSeed = {
  id: string;
  name: string;
  supervisorId: string;
  absenceDate: string;
  workingTime: string;
  gpsLocation: string;
  reason: string;
  notes: string;
};

export const SHAHRYAR_MARKET_DATA_SEED_COLUMNS: (keyof ShahryarMarketDataSeed)[] =
  [
    'id',
    'name',
    'ownerName',
    'phoneNumber',
    'assignedSupervisorId',
    'gpsLocation',
    'marketAddress',
    'district',
    'paymentStatus',
    'balanceAmount',
    'notes',
    'isActiveMarket',
  ];

export const SHAHRYAR_SUPERVISOR_VISIT_DATA_SEED_COLUMNS: (keyof ShahryarSupervisorVisitDataSeed)[] =
  [
    'id',
    'name',
    'marketId',
    'supervisorId',
    'checkInAt',
    'checkOutAt',
    'gpsLocation',
    'soldCartons',
    'requestedCartons',
    'issue',
    'decisionMaker',
    'requestDetails',
    'report',
    'notes',
  ];

export const SHAHRYAR_WORKING_TIME_DATA_SEED_COLUMNS: (keyof ShahryarWorkingTimeDataSeed)[] =
  [
    'id',
    'name',
    'supervisorId',
    'workDate',
    'checkInAt',
    'checkOutAt',
    'gpsLocation',
    'totalMinutes',
    'status',
  ];

export const SHAHRYAR_PAYMENT_DATA_SEED_COLUMNS: (keyof ShahryarPaymentDataSeed)[] =
  [
    'id',
    'name',
    'marketId',
    'collectedById',
    'amount',
    'dueDate',
    'paidAt',
    'status',
    'notes',
  ];

export const SHAHRYAR_SUPERVISOR_PENALTY_DATA_SEED_COLUMNS: (keyof ShahryarSupervisorPenaltyDataSeed)[] =
  [
    'id',
    'name',
    'supervisorId',
    'reason',
    'amount',
    'penaltyDate',
    'decidedBy',
  ];

export const SHAHRYAR_ABSENCE_DATA_SEED_COLUMNS: (keyof ShahryarAbsenceDataSeed)[] =
  [
    'id',
    'name',
    'supervisorId',
    'absenceDate',
    'workingTime',
    'gpsLocation',
    'reason',
    'notes',
  ];

export const SHAHRYAR_MARKET_DATA_SEED_IDS = {
  ARAM_MARKET: '20202020-0101-4000-8000-000000000001',
  ZAGROS_AGENT: '20202020-0101-4000-8000-000000000002',
  CITY_MARKET: '20202020-0101-4000-8000-000000000003',
  NEW_MARKET: '20202020-0101-4000-8000-000000000004',
};

export const SHAHRYAR_MARKET_DATA_SEEDS: ShahryarMarketDataSeed[] = [
  {
    id: SHAHRYAR_MARKET_DATA_SEED_IDS.ARAM_MARKET,
    name: 'مارکێتی ئارام',
    ownerName: 'ئارام عەلی',
    phoneNumber: '0750 000 0001',
    assignedSupervisorId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
    gpsLocation: '36.191, 44.009',
    marketAddress: 'هەولێر، شەقامی 100 مەتری',
    district: 'هەولێر',
    paymentStatus: 'PAID',
    balanceAmount: 0,
    notes: 'مارکێتی سەرەکی و پێویستی بە بەدواداچوونی هەفتانە هەیە.',
    isActiveMarket: true,
  },
  {
    id: SHAHRYAR_MARKET_DATA_SEED_IDS.ZAGROS_AGENT,
    name: 'وەکیلی زاگرۆس',
    ownerName: 'سۆران قادر',
    phoneNumber: '0750 000 0002',
    assignedSupervisorId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
    gpsLocation: '36.205, 44.023',
    marketAddress: 'هەولێر، ناو بازاڕی زاگرۆس',
    district: 'هەولێر',
    paymentStatus: 'DEBT_OPEN',
    balanceAmount: 780000,
    notes: 'قەرز ماوە و داواکاری بۆ کارتۆن زیاد کراوە.',
    isActiveMarket: true,
  },
  {
    id: SHAHRYAR_MARKET_DATA_SEED_IDS.CITY_MARKET,
    name: 'مارکێتی شار',
    ownerName: 'هیوا قادر',
    phoneNumber: '0750 000 0003',
    assignedSupervisorId: WORKSPACE_MEMBER_DATA_SEED_IDS.PHIL,
    gpsLocation: '36.214, 44.015',
    marketAddress: 'هەولێر، نزیک بازاڕی شار',
    district: 'هەولێر',
    paymentStatus: 'PAID',
    balanceAmount: 0,
    notes: 'فرۆشتن بەرزە و پێویستی بە پڕکردنەوەی کۆگا هەیە.',
    isActiveMarket: true,
  },
  {
    id: SHAHRYAR_MARKET_DATA_SEED_IDS.NEW_MARKET,
    name: 'مارکێتی نوێ',
    ownerName: 'ڕێباز عەلی',
    phoneNumber: '0750 000 0004',
    assignedSupervisorId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
    gpsLocation: '35.557, 45.435',
    marketAddress: 'سلێمانی، بازاڕی نوێ',
    district: 'سلێمانی',
    paymentStatus: 'PARTIAL',
    balanceAmount: 320000,
    notes: 'ئەمڕۆ پێویستی بە سەردان هەیە و ڕاپۆرت چاوەڕوانە.',
    isActiveMarket: true,
  },
];

export const SHAHRYAR_SUPERVISOR_VISIT_DATA_SEEDS: ShahryarSupervisorVisitDataSeed[] =
  [
    {
      id: '20202020-0201-4000-8000-000000000001',
      name: 'سەردانی مارکێتی ئارام',
      marketId: SHAHRYAR_MARKET_DATA_SEED_IDS.ARAM_MARKET,
      supervisorId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
      checkInAt: new Date('2026-06-01T09:12:00.000Z').toISOString(),
      checkOutAt: new Date('2026-06-01T09:44:00.000Z').toISOString(),
      gpsLocation: '36.191, 44.009',
      soldCartons: 18,
      requestedCartons: 4,
      issue: 'هیچ کێشەیەکی گرنگ نییە.',
      decisionMaker: 'تەدمین',
      requestDetails: '4 کارتۆنی تر بۆ سبەی.',
      report: 'سەردان تەواو بوو، پارەدان کرا.',
      notes: 'پارەدان کرا و داواکاری نوێ تۆمار کرا.',
    },
    {
      id: '20202020-0201-4000-8000-000000000002',
      name: 'سەردانی وەکیلی زاگرۆس',
      marketId: SHAHRYAR_MARKET_DATA_SEED_IDS.ZAGROS_AGENT,
      supervisorId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
      checkInAt: new Date('2026-06-01T10:34:00.000Z').toISOString(),
      checkOutAt: new Date('2026-06-01T11:02:00.000Z').toISOString(),
      gpsLocation: '36.205, 44.023',
      soldCartons: 11,
      requestedCartons: 8,
      issue: 'قەرز ماوە.',
      decisionMaker: 'تەدمین',
      requestDetails: 'بەدواداچوونی پارەدان و 8 کارتۆنی نوێ.',
      report: 'فرۆشتن مامناوەندە و قەرز پێویستی بە چارەسەر هەیە.',
      notes: 'قەرز ماوە و پێویستی بە بەدواداچوون هەیە.',
    },
    {
      id: '20202020-0201-4000-8000-000000000003',
      name: 'سەردانی مارکێتی شار',
      marketId: SHAHRYAR_MARKET_DATA_SEED_IDS.CITY_MARKET,
      supervisorId: WORKSPACE_MEMBER_DATA_SEED_IDS.PHIL,
      checkInAt: new Date('2026-06-01T12:08:00.000Z').toISOString(),
      checkOutAt: new Date('2026-06-01T12:39:00.000Z').toISOString(),
      gpsLocation: '36.214, 44.015',
      soldCartons: 24,
      requestedCartons: 6,
      issue: 'کۆگاکە کەم بووە.',
      decisionMaker: 'بەرپرسی فرۆشتن',
      requestDetails: '6 کارتۆن زیاد بکرێت.',
      report: 'فرۆشتن بەرزە و کۆگاکە پێویستی بە پڕکردنەوە هەیە.',
      notes: 'فرۆشتن بەرزە و کۆگاکە پێویستی بە پڕکردنەوە هەیە.',
    },
  ];

export const SHAHRYAR_WORKING_TIME_DATA_SEEDS: ShahryarWorkingTimeDataSeed[] = [
  {
    id: '20202020-0301-4000-8000-000000000001',
    name: 'کاروان - 2026-06-01',
    supervisorId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
    workDate: new Date('2026-06-01').toISOString(),
    checkInAt: new Date('2026-06-01T08:30:00.000Z').toISOString(),
    checkOutAt: new Date('2026-06-01T16:30:00.000Z').toISOString(),
    gpsLocation: '36.191, 44.009',
    totalMinutes: 480,
    status: 'PRESENT',
  },
  {
    id: '20202020-0301-4000-8000-000000000002',
    name: 'هەڵۆ - 2026-06-01',
    supervisorId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
    workDate: new Date('2026-06-01').toISOString(),
    checkInAt: new Date('2026-06-01T10:20:00.000Z').toISOString(),
    checkOutAt: new Date('2026-06-01T15:50:00.000Z').toISOString(),
    gpsLocation: '36.205, 44.023',
    totalMinutes: 330,
    status: 'LATE',
  },
  {
    id: '20202020-0301-4000-8000-000000000003',
    name: 'بەهروز - 2026-06-01',
    supervisorId: WORKSPACE_MEMBER_DATA_SEED_IDS.PHIL,
    workDate: new Date('2026-06-01').toISOString(),
    checkInAt: new Date('2026-06-01T08:40:00.000Z').toISOString(),
    checkOutAt: new Date('2026-06-01T16:10:00.000Z').toISOString(),
    gpsLocation: '36.214, 44.015',
    totalMinutes: 450,
    status: 'PRESENT',
  },
  {
    id: '20202020-0301-4000-8000-000000000004',
    name: 'تەدمین - 2026-06-01',
    supervisorId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
    workDate: new Date('2026-06-01').toISOString(),
    checkInAt: new Date('2026-06-01T08:50:00.000Z').toISOString(),
    checkOutAt: new Date('2026-06-01T15:40:00.000Z').toISOString(),
    gpsLocation: '35.557, 45.435',
    totalMinutes: 410,
    status: 'PRESENT',
  },
];

export const SHAHRYAR_PAYMENT_DATA_SEEDS: ShahryarPaymentDataSeed[] = [
  {
    id: '20202020-0401-4000-8000-000000000001',
    name: 'پارەدانی مارکێتی ئارام',
    marketId: SHAHRYAR_MARKET_DATA_SEED_IDS.ARAM_MARKET,
    collectedById: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
    amount: 1250000,
    dueDate: new Date('2026-06-01').toISOString(),
    paidAt: new Date('2026-06-01').toISOString(),
    status: 'CLOSED',
    notes: 'پارەدان کرا',
  },
  {
    id: '20202020-0401-4000-8000-000000000002',
    name: 'قەرزی وەکیلی زاگرۆس',
    marketId: SHAHRYAR_MARKET_DATA_SEED_IDS.ZAGROS_AGENT,
    collectedById: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
    amount: 780000,
    dueDate: new Date('2026-06-01').toISOString(),
    paidAt: new Date('2026-06-01').toISOString(),
    status: 'OPEN',
    notes: 'قەرز ماوە',
  },
];

export const SHAHRYAR_SUPERVISOR_PENALTY_DATA_SEEDS: ShahryarSupervisorPenaltyDataSeed[] =
  [
    {
      id: '20202020-0501-4000-8000-000000000001',
      name: 'غرامەی ڕاپۆرت نەهات',
      supervisorId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
      reason: 'ڕاپۆرت نەهات',
      amount: 25000,
      penaltyDate: new Date('2026-06-01').toISOString(),
      decidedBy: 'تەدمین',
    },
    {
      id: '20202020-0501-4000-8000-000000000002',
      name: 'غرامەی سەردان نەکرا',
      supervisorId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
      reason: 'سەردان نەکرا',
      amount: 40000,
      penaltyDate: new Date('2026-05-30').toISOString(),
      decidedBy: 'تەدمین',
    },
  ];

export const SHAHRYAR_ABSENCE_DATA_SEEDS: ShahryarAbsenceDataSeed[] = [
  {
    id: '20202020-0601-4000-8000-000000000001',
    name: 'غیابی بەهروز',
    supervisorId: WORKSPACE_MEMBER_DATA_SEED_IDS.PHIL,
    absenceDate: new Date('2026-06-01').toISOString(),
    workingTime: 'نەدەستی پێکرد',
    gpsLocation: '-',
    reason: 'ABSENT',
    notes: 'غیاب',
  },
  {
    id: '20202020-0601-4000-8000-000000000002',
    name: 'درەنگ هاتنی هەڵۆ',
    supervisorId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
    absenceDate: new Date('2026-05-29').toISOString(),
    workingTime: '10:20 - 15:50',
    gpsLocation: '36.205, 44.023',
    reason: 'LATE',
    notes: 'درەنگ هات',
  },
];
