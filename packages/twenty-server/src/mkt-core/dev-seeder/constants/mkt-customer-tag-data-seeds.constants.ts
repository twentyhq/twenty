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
  // Enterprise Customers
  TECH_CORP_VIP: '23dd8c06-4c41-4737-af5c-e13ceeed1cd1',
  TECH_CORP_ENTERPRISE: 'c12caf5b-e47c-4335-a0df-73d36939e207',

  FINANCE_HIGH_VALUE: '37c3ade5-5952-4b05-8717-13d9bb0dea0e',
  FINANCE_QUICK_PAYER: '514d9a13-a4b5-4d95-b921-d1c40c0481a1',

  HEALTHCARE_SUPPORT: '9741a1a3-0d58-4bdd-90be-3491701fd6a3',
  HEALTHCARE_CHURN: '50a89a47-f037-4fdd-92ee-efa8155261a6',

  // Medium Business
  MARKETING_REFERRAL: 'abd9fc7f-eac3-436d-81ab-f5cf0e02cdce',

  CONSULTING_NEGOTIATOR: '52423d2a-12e8-4582-acfd-a9c68856a345',

  RETAIL_QUICK_PAYER: '1a642b8b-78e5-426c-ad0c-7bba379e8942',

  // Small Business
  STARTUP_CHURN: '108173a1-e0ce-4222-9d8e-f3c1f9262acb',

  RESTAURANT_REFERRAL: 'a60cdd68-7f9a-4e80-b8fc-5ecb15017db0',

  FREELANCE_QUICK_PAYER: '4f264d93-26d5-40e5-ae8c-6b77c3877e9c',

  // Individual Customers
  VIP_CUSTOMER_VIP: '02c9400d-a470-4566-9b5b-caab87c695aa',
  VIP_CUSTOMER_HIGH_VALUE: '6982617a-d9ec-459d-ab62-10de42e2ec60',
  VIP_CUSTOMER_REFERRAL: '5822ffad-e7d3-48c5-a0bd-a8ddd978ebec',

  NEW_LEAD_CHURN: 'dae80b4c-d202-4c73-9588-6593a42baaff',

  LOYAL_QUICK_PAYER: 'ba34e967-cf0f-423d-810e-8fa394383122',
  LOYAL_REFERRAL: 'c806c548-c625-4c26-8bce-903428bf1fae',

  CHURN_RISK_CHURN: '7d5352b5-ff60-4fab-a1ac-be136aa53efd',

  HIGH_VALUE_CUSTOMER_HIGH_VALUE: '5ab5d82a-121b-4afc-b997-2f3729eed0b7',
  HIGH_VALUE_CUSTOMER_QUICK_PAYER: 'f28429a4-55c5-4b51-8c13-556c80d560ea',
  HIGH_VALUE_CUSTOMER_ENTERPRISE: 'a7eedb18-b487-4fbb-8f2d-3beec3b848b8',

  SUPPORT_INTENSIVE_SUPPORT: '154da2b7-cf8f-4ffd-bffe-f8ad89cf9c6c',
  SUPPORT_INTENSIVE_CHURN: 'a87c402e-3531-46f0-ac5a-6446ba13eabc',
};

export const MKT_CUSTOMER_TAG_DATA_SEEDS: MktCustomerTagDataSeed[] = [
  // ===== ENTERPRISE CUSTOMERS =====

  // TechCorp Solutions - VIP + Enterprise Prospect
  {
    id: MKT_CUSTOMER_TAG_DATA_SEEDS_IDS.TECH_CORP_VIP,
    name: 'TechCorp Solutions - VIP',
    mktCustomerId: MKT_CUSTOMER_DATA_SEEDS_IDS.TECH_CORP,
    mktTagId: MKT_TAG_DATA_SEEDS_IDS.VIP,
    position: 1,
    createdBySource: 'SYSTEM',
    createdByWorkspaceMemberId: null,
    createdByName: 'System',
  },
  {
    id: MKT_CUSTOMER_TAG_DATA_SEEDS_IDS.TECH_CORP_ENTERPRISE,
    name: 'TechCorp Solutions - Enterprise Prospect',
    mktCustomerId: MKT_CUSTOMER_DATA_SEEDS_IDS.TECH_CORP,
    mktTagId: MKT_TAG_DATA_SEEDS_IDS.ENTERPRISE_PROSPECT,
    position: 2,
    createdBySource: 'SYSTEM',
    createdByWorkspaceMemberId: null,
    createdByName: 'System',
  },

  // Global Finance Ltd - High Value + Quick Payer
  {
    id: MKT_CUSTOMER_TAG_DATA_SEEDS_IDS.FINANCE_HIGH_VALUE,
    name: 'Global Finance Ltd - High Value',
    mktCustomerId: MKT_CUSTOMER_DATA_SEEDS_IDS.FINANCE_LTD,
    mktTagId: MKT_TAG_DATA_SEEDS_IDS.HIGH_VALUE,
    position: 1,
    createdBySource: 'SYSTEM',
    createdByWorkspaceMemberId: null,
    createdByName: 'System',
  },
  {
    id: MKT_CUSTOMER_TAG_DATA_SEEDS_IDS.FINANCE_QUICK_PAYER,
    name: 'Global Finance Ltd - Quick Payer',
    mktCustomerId: MKT_CUSTOMER_DATA_SEEDS_IDS.FINANCE_LTD,
    mktTagId: MKT_TAG_DATA_SEEDS_IDS.QUICK_PAYER,
    position: 2,
    createdBySource: 'SYSTEM',
    createdByWorkspaceMemberId: null,
    createdByName: 'System',
  },

  // HealthCare Systems - Support Intensive + Potential Churn
  {
    id: MKT_CUSTOMER_TAG_DATA_SEEDS_IDS.HEALTHCARE_SUPPORT,
    name: 'HealthCare Systems - Support Intensive',
    mktCustomerId: MKT_CUSTOMER_DATA_SEEDS_IDS.HEALTH_CARE,
    mktTagId: MKT_TAG_DATA_SEEDS_IDS.SUPPORT_INTENSIVE,
    position: 1,
    createdBySource: 'SYSTEM',
    createdByWorkspaceMemberId: null,
    createdByName: 'System',
  },
  {
    id: MKT_CUSTOMER_TAG_DATA_SEEDS_IDS.HEALTHCARE_CHURN,
    name: 'HealthCare Systems - Potential Churn',
    mktCustomerId: MKT_CUSTOMER_DATA_SEEDS_IDS.HEALTH_CARE,
    mktTagId: MKT_TAG_DATA_SEEDS_IDS.POTENTIAL_CHURN,
    position: 2,
    createdBySource: 'SYSTEM',
    createdByWorkspaceMemberId: null,
    createdByName: 'System',
  },

  // ===== MEDIUM BUSINESS =====

  // Creative Marketing Agency - Referral Source
  {
    id: MKT_CUSTOMER_TAG_DATA_SEEDS_IDS.MARKETING_REFERRAL,
    name: 'Creative Marketing Agency - Referral Source',
    mktCustomerId: MKT_CUSTOMER_DATA_SEEDS_IDS.MARKETING_AGENCY,
    mktTagId: MKT_TAG_DATA_SEEDS_IDS.REFERRAL_SOURCE,
    position: 1,
    createdBySource: 'SYSTEM',
    createdByWorkspaceMemberId: null,
    createdByName: 'System',
  },

  // Strategic Consulting Group - Negotiator
  {
    id: MKT_CUSTOMER_TAG_DATA_SEEDS_IDS.CONSULTING_NEGOTIATOR,
    name: 'Strategic Consulting Group - Negotiator',
    mktCustomerId: MKT_CUSTOMER_DATA_SEEDS_IDS.CONSULTING_FIRM,
    mktTagId: MKT_TAG_DATA_SEEDS_IDS.NEGOTIATOR,
    position: 1,
    createdBySource: 'SYSTEM',
    createdByWorkspaceMemberId: null,
    createdByName: 'System',
  },

  // Urban Retail Chain - Quick Payer
  {
    id: MKT_CUSTOMER_TAG_DATA_SEEDS_IDS.RETAIL_QUICK_PAYER,
    name: 'Urban Retail Chain - Quick Payer',
    mktCustomerId: MKT_CUSTOMER_DATA_SEEDS_IDS.RETAIL_CHAIN,
    mktTagId: MKT_TAG_DATA_SEEDS_IDS.QUICK_PAYER,
    position: 1,
    createdBySource: 'SYSTEM',
    createdByWorkspaceMemberId: null,
    createdByName: 'System',
  },

  // ===== SMALL BUSINESS =====

  // InnovateStartup - Potential Churn
  {
    id: MKT_CUSTOMER_TAG_DATA_SEEDS_IDS.STARTUP_CHURN,
    name: 'InnovateStartup - Potential Churn',
    mktCustomerId: MKT_CUSTOMER_DATA_SEEDS_IDS.STARTUP_TECH,
    mktTagId: MKT_TAG_DATA_SEEDS_IDS.POTENTIAL_CHURN,
    position: 1,
    createdBySource: 'SYSTEM',
    createdByWorkspaceMemberId: null,
    createdByName: 'System',
  },

  // Taste of Italy - Referral Source
  {
    id: MKT_CUSTOMER_TAG_DATA_SEEDS_IDS.RESTAURANT_REFERRAL,
    name: 'Taste of Italy - Referral Source',
    mktCustomerId: MKT_CUSTOMER_DATA_SEEDS_IDS.LOCAL_RESTAURANT,
    mktTagId: MKT_TAG_DATA_SEEDS_IDS.REFERRAL_SOURCE,
    position: 1,
    createdBySource: 'SYSTEM',
    createdByWorkspaceMemberId: null,
    createdByName: 'System',
  },

  // Sarah Johnson - Quick Payer
  {
    id: MKT_CUSTOMER_TAG_DATA_SEEDS_IDS.FREELANCE_QUICK_PAYER,
    name: 'Sarah Johnson - Quick Payer',
    mktCustomerId: MKT_CUSTOMER_DATA_SEEDS_IDS.FREELANCE_DESIGNER,
    mktTagId: MKT_TAG_DATA_SEEDS_IDS.QUICK_PAYER,
    position: 1,
    createdBySource: 'SYSTEM',
    createdByWorkspaceMemberId: null,
    createdByName: 'System',
  },

  // ===== INDIVIDUAL CUSTOMERS =====

  // Robert Chen (VIP Customer) - VIP + High Value + Referral Source
  {
    id: MKT_CUSTOMER_TAG_DATA_SEEDS_IDS.VIP_CUSTOMER_VIP,
    name: 'Robert Chen - VIP',
    mktCustomerId: MKT_CUSTOMER_DATA_SEEDS_IDS.VIP_CUSTOMER,
    mktTagId: MKT_TAG_DATA_SEEDS_IDS.VIP,
    position: 1,
    createdBySource: 'SYSTEM',
    createdByWorkspaceMemberId: null,
    createdByName: 'System',
  },
  {
    id: MKT_CUSTOMER_TAG_DATA_SEEDS_IDS.VIP_CUSTOMER_HIGH_VALUE,
    name: 'Robert Chen - High Value',
    mktCustomerId: MKT_CUSTOMER_DATA_SEEDS_IDS.VIP_CUSTOMER,
    mktTagId: MKT_TAG_DATA_SEEDS_IDS.HIGH_VALUE,
    position: 2,
    createdBySource: 'SYSTEM',
    createdByWorkspaceMemberId: null,
    createdByName: 'System',
  },
  {
    id: MKT_CUSTOMER_TAG_DATA_SEEDS_IDS.VIP_CUSTOMER_REFERRAL,
    name: 'Robert Chen - Referral Source',
    mktCustomerId: MKT_CUSTOMER_DATA_SEEDS_IDS.VIP_CUSTOMER,
    mktTagId: MKT_TAG_DATA_SEEDS_IDS.REFERRAL_SOURCE,
    position: 3,
    createdBySource: 'SYSTEM',
    createdByWorkspaceMemberId: null,
    createdByName: 'System',
  },

  // Jennifer Martinez (New Lead) - Potential Churn
  {
    id: MKT_CUSTOMER_TAG_DATA_SEEDS_IDS.NEW_LEAD_CHURN,
    name: 'Jennifer Martinez - Potential Churn',
    mktCustomerId: MKT_CUSTOMER_DATA_SEEDS_IDS.NEW_LEAD,
    mktTagId: MKT_TAG_DATA_SEEDS_IDS.POTENTIAL_CHURN,
    position: 1,
    createdBySource: 'SYSTEM',
    createdByWorkspaceMemberId: null,
    createdByName: 'System',
  },

  // David Thompson (Loyal Customer) - Quick Payer + Referral Source
  {
    id: MKT_CUSTOMER_TAG_DATA_SEEDS_IDS.LOYAL_QUICK_PAYER,
    name: 'David Thompson - Quick Payer',
    mktCustomerId: MKT_CUSTOMER_DATA_SEEDS_IDS.LOYAL_CUSTOMER,
    mktTagId: MKT_TAG_DATA_SEEDS_IDS.QUICK_PAYER,
    position: 1,
    createdBySource: 'SYSTEM',
    createdByWorkspaceMemberId: null,
    createdByName: 'System',
  },
  {
    id: MKT_CUSTOMER_TAG_DATA_SEEDS_IDS.LOYAL_REFERRAL,
    name: 'David Thompson - Referral Source',
    mktCustomerId: MKT_CUSTOMER_DATA_SEEDS_IDS.LOYAL_CUSTOMER,
    mktTagId: MKT_TAG_DATA_SEEDS_IDS.REFERRAL_SOURCE,
    position: 2,
    createdBySource: 'SYSTEM',
    createdByWorkspaceMemberId: null,
    createdByName: 'System',
  },

  // Lisa Anderson (Churn Risk) - Potential Churn
  {
    id: MKT_CUSTOMER_TAG_DATA_SEEDS_IDS.CHURN_RISK_CHURN,
    name: 'Lisa Anderson - Potential Churn',
    mktCustomerId: MKT_CUSTOMER_DATA_SEEDS_IDS.CHURN_RISK,
    mktTagId: MKT_TAG_DATA_SEEDS_IDS.POTENTIAL_CHURN,
    position: 1,
    createdBySource: 'SYSTEM',
    createdByWorkspaceMemberId: null,
    createdByName: 'System',
  },

  // Michael Rodriguez (High Value) - High Value + Quick Payer + Enterprise Prospect
  {
    id: MKT_CUSTOMER_TAG_DATA_SEEDS_IDS.HIGH_VALUE_CUSTOMER_HIGH_VALUE,
    name: 'Michael Rodriguez - High Value',
    mktCustomerId: MKT_CUSTOMER_DATA_SEEDS_IDS.HIGH_VALUE,
    mktTagId: MKT_TAG_DATA_SEEDS_IDS.HIGH_VALUE,
    position: 1,
    createdBySource: 'SYSTEM',
    createdByWorkspaceMemberId: null,
    createdByName: 'System',
  },
  {
    id: MKT_CUSTOMER_TAG_DATA_SEEDS_IDS.HIGH_VALUE_CUSTOMER_QUICK_PAYER,
    name: 'Michael Rodriguez - Quick Payer',
    mktCustomerId: MKT_CUSTOMER_DATA_SEEDS_IDS.HIGH_VALUE,
    mktTagId: MKT_TAG_DATA_SEEDS_IDS.QUICK_PAYER,
    position: 2,
    createdBySource: 'SYSTEM',
    createdByWorkspaceMemberId: null,
    createdByName: 'System',
  },
  {
    id: MKT_CUSTOMER_TAG_DATA_SEEDS_IDS.HIGH_VALUE_CUSTOMER_ENTERPRISE,
    name: 'Michael Rodriguez - Enterprise Prospect',
    mktCustomerId: MKT_CUSTOMER_DATA_SEEDS_IDS.HIGH_VALUE,
    mktTagId: MKT_TAG_DATA_SEEDS_IDS.ENTERPRISE_PROSPECT,
    position: 3,
    createdBySource: 'SYSTEM',
    createdByWorkspaceMemberId: null,
    createdByName: 'System',
  },

  // Amanda Wilson (Support Intensive) - Support Intensive + Potential Churn
  {
    id: MKT_CUSTOMER_TAG_DATA_SEEDS_IDS.SUPPORT_INTENSIVE_SUPPORT,
    name: 'Amanda Wilson - Support Intensive',
    mktCustomerId: MKT_CUSTOMER_DATA_SEEDS_IDS.SUPPORT_INTENSIVE,
    mktTagId: MKT_TAG_DATA_SEEDS_IDS.SUPPORT_INTENSIVE,
    position: 1,
    createdBySource: 'SYSTEM',
    createdByWorkspaceMemberId: null,
    createdByName: 'System',
  },
  {
    id: MKT_CUSTOMER_TAG_DATA_SEEDS_IDS.SUPPORT_INTENSIVE_CHURN,
    name: 'Amanda Wilson - Potential Churn',
    mktCustomerId: MKT_CUSTOMER_DATA_SEEDS_IDS.SUPPORT_INTENSIVE,
    mktTagId: MKT_TAG_DATA_SEEDS_IDS.POTENTIAL_CHURN,
    position: 2,
    createdBySource: 'SYSTEM',
    createdByWorkspaceMemberId: null,
    createdByName: 'System',
  },
];
