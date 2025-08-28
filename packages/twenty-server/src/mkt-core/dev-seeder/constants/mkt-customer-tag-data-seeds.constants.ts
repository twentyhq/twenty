import { MKT_CUSTOMER_DATA_SEEDS_IDS } from 'src/mkt-core/dev-seeder/constants/mkt-customer-data-seeds.constants';
import { MKT_TAG_DATA_SEEDS_IDS } from 'src/mkt-core/dev-seeder/constants/mkt-tag-data-seeds.constants';

type MktCustomerTagDataSeed = {
  id: string;
  name: string;

  mktCustomerId: string;
  mktTagId: string;

  position: number;
  createdBySource: string;
  createdByWorkspaceMemberId: string | null;
  createdByName: string;
};

export const MKT_CUSTOMER_TAG_DATA_SEED_COLUMNS: (keyof MktCustomerTagDataSeed)[] =
  [
    'id',
    'name',
    'mktCustomerId',
    'mktTagId',
    'position',
    'createdBySource',
    'createdByWorkspaceMemberId',
    'createdByName',
  ];

export const MKT_CUSTOMER_TAG_DATA_SEEDS_IDS = {
  ID_1: '23dd8c06-4c41-4737-af5c-e13ceeed1cd1',
  ID_2: 'c12caf5b-e47c-4335-a0df-73d36939e207',
  ID_3: '37c3ade5-5952-4b05-8717-13d9bb0dea0e',
  ID_4: '514d9a13-a4b5-4d95-b921-d1c40c0481a1',
  ID_5: '9741a1a3-0d58-4bdd-90be-3491701fd6a3',
  ID_6: '50a89a47-f037-4fdd-92ee-efa8155261a6',
  ID_7: 'abd9fc7f-eac3-436d-81ab-f5cf0e02cdce',
  ID_8: '52423d2a-12e8-4582-acfd-a9c68856a345',
  ID_9: '1a642b8b-78e5-426c-ad0c-7bba379e8942',
  ID_10: '108173a1-e0ce-4222-9d8e-f3c1f9262acb',
  ID_11: 'a60cdd68-7f9a-4e80-b8fc-5ecb15017db0',
  ID_12: '4f264d93-26d5-40e5-ae8c-6b77c3877e9c',
  ID_13: '02c9400d-a470-4566-9b5b-caab87c695aa',
  ID_14: '6982617a-d9ec-459d-ab62-10de42e2ec60',
  ID_15: '5822ffad-e7d3-48c5-a0bd-a8ddd978ebec',
  ID_16: 'dae80b4c-d202-4c73-9588-6593a42baaff',
  ID_17: 'ba34e967-cf0f-423d-810e-8fa394383122',
  ID_18: 'c806c548-c625-4c26-8bce-903428bf1fae',
  ID_19: '7d5352b5-ff60-4fab-a1ac-be136aa53efd',
  ID_20: '5ab5d82a-121b-4afc-b997-2f3729eed0b7',
  ID_21: 'f28429a4-55c5-4b51-8c13-556c80d560ea',
  ID_22: 'a7eedb18-b487-4fbb-8f2d-3beec3b848b8',
  ID_23: '154da2b7-cf8f-4ffd-bffe-f8ad89cf9c6c',
  ID_24: 'a87c402e-3531-46f0-ac5a-6446ba13eabc',
  ID_25: '92c65646-6a5c-4b48-b1e5-98e3ed1fd427',
  ID_26: 'afdbdb38-121a-4eb2-8fea-93e01b31f363',
};

export const MKT_CUSTOMER_TAG_DATA_SEEDS: MktCustomerTagDataSeed[] = [
  // Customer 1 - John Doe (VIP, High Value, Quick Payer)
  {
    id: MKT_CUSTOMER_TAG_DATA_SEEDS_IDS.ID_1,
    name: 'John Doe - VIP',
    mktCustomerId: MKT_CUSTOMER_DATA_SEEDS_IDS.ID_1,
    mktTagId: MKT_TAG_DATA_SEEDS_IDS.VIP,
    position: 1,
    createdBySource: 'API',
    createdByWorkspaceMemberId: null,
    createdByName: 'Sarah Johnson',
  },
  {
    id: MKT_CUSTOMER_TAG_DATA_SEEDS_IDS.ID_2,
    name: 'John Doe - High Value',
    mktCustomerId: MKT_CUSTOMER_DATA_SEEDS_IDS.ID_1,
    mktTagId: MKT_TAG_DATA_SEEDS_IDS.HIGH_VALUE,
    position: 2,
    createdBySource: 'API',
    createdByWorkspaceMemberId: null,
    createdByName: 'Sarah Johnson',
  },
  {
    id: MKT_CUSTOMER_TAG_DATA_SEEDS_IDS.ID_3,
    name: 'John Doe - Quick Payer',
    mktCustomerId: MKT_CUSTOMER_DATA_SEEDS_IDS.ID_1,
    mktTagId: MKT_TAG_DATA_SEEDS_IDS.QUICK_PAYER,
    position: 3,
    createdBySource: 'API',
    createdByWorkspaceMemberId: null,
    createdByName: 'Sarah Johnson',
  },

  // Customer 2 - Jane Smith (High Value, Referral Source)
  {
    id: MKT_CUSTOMER_TAG_DATA_SEEDS_IDS.ID_4,
    name: 'Jane Smith - High Value',
    mktCustomerId: MKT_CUSTOMER_DATA_SEEDS_IDS.ID_2,
    mktTagId: MKT_TAG_DATA_SEEDS_IDS.HIGH_VALUE,
    position: 1,
    createdBySource: 'API',
    createdByWorkspaceMemberId: null,
    createdByName: 'Michael Chen',
  },
  {
    id: MKT_CUSTOMER_TAG_DATA_SEEDS_IDS.ID_5,
    name: 'Jane Smith - Referral Source',
    mktCustomerId: MKT_CUSTOMER_DATA_SEEDS_IDS.ID_2,
    mktTagId: MKT_TAG_DATA_SEEDS_IDS.REFERRAL_SOURCE,
    position: 2,
    createdBySource: 'API',
    createdByWorkspaceMemberId: null,
    createdByName: 'Michael Chen',
  },

  // Customer 3 - Jim Beam (VIP, High Value, Support Intensive)
  {
    id: MKT_CUSTOMER_TAG_DATA_SEEDS_IDS.ID_6,
    name: 'Jim Beam - VIP',
    mktCustomerId: MKT_CUSTOMER_DATA_SEEDS_IDS.ID_3,
    mktTagId: MKT_TAG_DATA_SEEDS_IDS.VIP,
    position: 1,
    createdBySource: 'API',
    createdByWorkspaceMemberId: null,
    createdByName: 'Emily Rodriguez',
  },
  {
    id: MKT_CUSTOMER_TAG_DATA_SEEDS_IDS.ID_7,
    name: 'Jim Beam - High Value',
    mktCustomerId: MKT_CUSTOMER_DATA_SEEDS_IDS.ID_3,
    mktTagId: MKT_TAG_DATA_SEEDS_IDS.HIGH_VALUE,
    position: 2,
    createdBySource: 'API',
    createdByWorkspaceMemberId: null,
    createdByName: 'Emily Rodriguez',
  },
  {
    id: MKT_CUSTOMER_TAG_DATA_SEEDS_IDS.ID_8,
    name: 'Jim Beam - Support Intensive',
    mktCustomerId: MKT_CUSTOMER_DATA_SEEDS_IDS.ID_3,
    mktTagId: MKT_TAG_DATA_SEEDS_IDS.SUPPORT_INTENSIVE,
    position: 3,
    createdBySource: 'API',
    createdByWorkspaceMemberId: null,
    createdByName: 'Emily Rodriguez',
  },

  // Customer 4 - John Doe (Potential Churn, Negotiator)
  {
    id: MKT_CUSTOMER_TAG_DATA_SEEDS_IDS.ID_9,
    name: 'John Doe - Potential Churn',
    mktCustomerId: MKT_CUSTOMER_DATA_SEEDS_IDS.ID_4,
    mktTagId: MKT_TAG_DATA_SEEDS_IDS.POTENTIAL_CHURN,
    position: 1,
    createdBySource: 'API',
    createdByWorkspaceMemberId: null,
    createdByName: 'David Kim',
  },
  {
    id: MKT_CUSTOMER_TAG_DATA_SEEDS_IDS.ID_10,
    name: 'John Doe - Negotiator',
    mktCustomerId: MKT_CUSTOMER_DATA_SEEDS_IDS.ID_4,
    mktTagId: MKT_TAG_DATA_SEEDS_IDS.NEGOTIATOR,
    position: 2,
    createdBySource: 'API',
    createdByWorkspaceMemberId: null,
    createdByName: 'David Kim',
  },

  // Customer 5 - Lisa Wang (Enterprise Prospect, Support Intensive)
  {
    id: MKT_CUSTOMER_TAG_DATA_SEEDS_IDS.ID_11,
    name: 'Lisa Wang - Enterprise Prospect',
    mktCustomerId: MKT_CUSTOMER_DATA_SEEDS_IDS.ID_5,
    mktTagId: MKT_TAG_DATA_SEEDS_IDS.ENTERPRISE_PROSPECT,
    position: 1,
    createdBySource: 'API',
    createdByWorkspaceMemberId: null,
    createdByName: 'Lisa Wang',
  },
  {
    id: MKT_CUSTOMER_TAG_DATA_SEEDS_IDS.ID_12,
    name: 'Lisa Wang - Support Intensive',
    mktCustomerId: MKT_CUSTOMER_DATA_SEEDS_IDS.ID_5,
    mktTagId: MKT_TAG_DATA_SEEDS_IDS.SUPPORT_INTENSIVE,
    position: 2,
    createdBySource: 'API',
    createdByWorkspaceMemberId: null,
    createdByName: 'Lisa Wang',
  },

  // Customer 6 - Robert Taylor (Quick Payer, Referral Source)
  {
    id: MKT_CUSTOMER_TAG_DATA_SEEDS_IDS.ID_13,
    name: 'Robert Taylor - Quick Payer',
    mktCustomerId: MKT_CUSTOMER_DATA_SEEDS_IDS.ID_6,
    mktTagId: MKT_TAG_DATA_SEEDS_IDS.QUICK_PAYER,
    position: 1,
    createdBySource: 'API',
    createdByWorkspaceMemberId: null,
    createdByName: 'Robert Taylor',
  },
  {
    id: MKT_CUSTOMER_TAG_DATA_SEEDS_IDS.ID_14,
    name: 'Robert Taylor - Referral Source',
    mktCustomerId: MKT_CUSTOMER_DATA_SEEDS_IDS.ID_6,
    mktTagId: MKT_TAG_DATA_SEEDS_IDS.REFERRAL_SOURCE,
    position: 2,
    createdBySource: 'API',
    createdByWorkspaceMemberId: null,
    createdByName: 'Robert Taylor',
  },

  // Customer 7 - Jessica Brown (High Value, Quick Payer)
  {
    id: MKT_CUSTOMER_TAG_DATA_SEEDS_IDS.ID_15,
    name: 'Jessica Brown - High Value',
    mktCustomerId: MKT_CUSTOMER_DATA_SEEDS_IDS.ID_7,
    mktTagId: MKT_TAG_DATA_SEEDS_IDS.HIGH_VALUE,
    position: 1,
    createdBySource: 'API',
    createdByWorkspaceMemberId: null,
    createdByName: 'Jessica Brown',
  },
  {
    id: MKT_CUSTOMER_TAG_DATA_SEEDS_IDS.ID_16,
    name: 'Jessica Brown - Quick Payer',
    mktCustomerId: MKT_CUSTOMER_DATA_SEEDS_IDS.ID_7,
    mktTagId: MKT_TAG_DATA_SEEDS_IDS.QUICK_PAYER,
    position: 2,
    createdBySource: 'API',
    createdByWorkspaceMemberId: null,
    createdByName: 'Jessica Brown',
  },

  // Customer 8 - Mark Wilson (Potential Churn, Negotiator)
  {
    id: MKT_CUSTOMER_TAG_DATA_SEEDS_IDS.ID_17,
    name: 'Mark Wilson - Potential Churn',
    mktCustomerId: MKT_CUSTOMER_DATA_SEEDS_IDS.ID_8,
    mktTagId: MKT_TAG_DATA_SEEDS_IDS.POTENTIAL_CHURN,
    position: 1,
    createdBySource: 'API',
    createdByWorkspaceMemberId: null,
    createdByName: 'Mark Wilson',
  },
  {
    id: MKT_CUSTOMER_TAG_DATA_SEEDS_IDS.ID_18,
    name: 'Mark Wilson - Negotiator',
    mktCustomerId: MKT_CUSTOMER_DATA_SEEDS_IDS.ID_8,
    mktTagId: MKT_TAG_DATA_SEEDS_IDS.NEGOTIATOR,
    position: 2,
    createdBySource: 'API',
    createdByWorkspaceMemberId: null,
    createdByName: 'Mark Wilson',
  },

  // Customer 9 - Jennifer Davis (VIP, High Value)
  {
    id: MKT_CUSTOMER_TAG_DATA_SEEDS_IDS.ID_19,
    name: 'Jennifer Davis - VIP',
    mktCustomerId: MKT_CUSTOMER_DATA_SEEDS_IDS.ID_9,
    mktTagId: MKT_TAG_DATA_SEEDS_IDS.VIP,
    position: 1,
    createdBySource: 'API',
    createdByWorkspaceMemberId: null,
    createdByName: 'Jennifer Davis',
  },
  {
    id: MKT_CUSTOMER_TAG_DATA_SEEDS_IDS.ID_20,
    name: 'Jennifer Davis - High Value',
    mktCustomerId: MKT_CUSTOMER_DATA_SEEDS_IDS.ID_9,
    mktTagId: MKT_TAG_DATA_SEEDS_IDS.HIGH_VALUE,
    position: 2,
    createdBySource: 'API',
    createdByWorkspaceMemberId: null,
    createdByName: 'Jennifer Davis',
  },

  // Customer 10 - Christopher Martinez (Enterprise Prospect, Support Intensive)
  {
    id: MKT_CUSTOMER_TAG_DATA_SEEDS_IDS.ID_21,
    name: 'Christopher Martinez - Enterprise Prospect',
    mktCustomerId: MKT_CUSTOMER_DATA_SEEDS_IDS.ID_10,
    mktTagId: MKT_TAG_DATA_SEEDS_IDS.ENTERPRISE_PROSPECT,
    position: 1,
    createdBySource: 'API',
    createdByWorkspaceMemberId: null,
    createdByName: 'Christopher Martinez',
  },
  {
    id: MKT_CUSTOMER_TAG_DATA_SEEDS_IDS.ID_22,
    name: 'Christopher Martinez - Support Intensive',
    mktCustomerId: MKT_CUSTOMER_DATA_SEEDS_IDS.ID_10,
    mktTagId: MKT_TAG_DATA_SEEDS_IDS.SUPPORT_INTENSIVE,
    position: 2,
    createdBySource: 'API',
    createdByWorkspaceMemberId: null,
    createdByName: 'Christopher Martinez',
  },

  // Customer 11 - Amanda Lopez (Potential Churn)
  {
    id: MKT_CUSTOMER_TAG_DATA_SEEDS_IDS.ID_23,
    name: 'Amanda Lopez - Potential Churn',
    mktCustomerId: MKT_CUSTOMER_DATA_SEEDS_IDS.ID_11,
    mktTagId: MKT_TAG_DATA_SEEDS_IDS.POTENTIAL_CHURN,
    position: 1,
    createdBySource: 'API',
    createdByWorkspaceMemberId: null,
    createdByName: 'Amanda Lopez',
  },

  // Customer 12 - Kevin Anderson (Quick Payer, Referral Source)
  {
    id: MKT_CUSTOMER_TAG_DATA_SEEDS_IDS.ID_24,
    name: 'Kevin Anderson - Quick Payer',
    mktCustomerId: MKT_CUSTOMER_DATA_SEEDS_IDS.ID_12,
    mktTagId: MKT_TAG_DATA_SEEDS_IDS.QUICK_PAYER,
    position: 1,
    createdBySource: 'API',
    createdByWorkspaceMemberId: null,
    createdByName: 'Kevin Anderson',
  },
  {
    id: MKT_CUSTOMER_TAG_DATA_SEEDS_IDS.ID_25,
    name: 'Kevin Anderson - Referral Source',
    mktCustomerId: MKT_CUSTOMER_DATA_SEEDS_IDS.ID_12,
    mktTagId: MKT_TAG_DATA_SEEDS_IDS.REFERRAL_SOURCE,
    position: 2,
    createdBySource: 'API',
    createdByWorkspaceMemberId: null,
    createdByName: 'Kevin Anderson',
  },
];
