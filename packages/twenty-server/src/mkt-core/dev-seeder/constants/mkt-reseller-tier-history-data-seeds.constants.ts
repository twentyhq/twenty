import { MKT_RESELLER_DATA_SEEDS_IDS } from './mkt-reseller-data-seeds.constants';
import { MKT_RESELLER_TIER_DATA_SEEDS_IDS } from './mkt-reseller-tier-data-seeds.constants';

type MktResellerTierHistoryDataSeed = {
  id: string;
  resellerId: string;
  fromTierId?: string | null;
  toTierId: string;
  changeType?: string;
  changeReason?: string;
  actualRevenue?: number;
  changedAt?: string;
  changedBy?: string | null;
  effectiveFrom?: string;
  notes?: string;
  position: number;
  createdBySource: string;
  createdByWorkspaceMemberId: string | null;
  createdByName: string;
};

export const MKT_RESELLER_TIER_HISTORY_DATA_SEED_COLUMNS: (keyof MktResellerTierHistoryDataSeed)[] =
  [
    'id',
    'resellerId',
    'fromTierId',
    'toTierId',
    'changeType',
    'changeReason',
    'actualRevenue',
    'changedAt',
    'changedBy',
    'effectiveFrom',
    'notes',
    'position',
    'createdBySource',
    'createdByWorkspaceMemberId',
    'createdByName',
  ];

export const MKT_RESELLER_TIER_HISTORY_DATA_SEEDS_IDS = {
  TECH_SOLUTIONS_INITIAL: '1a1b2c3d-4e5f-6a7b-8c9d-0e1f2a3b4c5d',
  DIGITAL_MARKETING_INITIAL: '2b2c3d4e-5f6a-7b8c-9d0e-1f2a3b4c5d6e',
  DIGITAL_MARKETING_UPGRADE: '3c3d4e5f-6a7b-8c9d-0e1f-2a3b4c5d6e7f',
  BUSINESS_PARTNER_INITIAL: '4d4e5f6a-7b8c-9d0e-1f2a-3b4c5d6e7f8a',
  ENTERPRISE_SALES_INITIAL: '5e5f6a7b-8c9d-0e1f-2a3b-4c5d6e7f8a9b',
  STARTUP_ACCELERATOR_INITIAL: '6f6a7b8c-9d0e-1f2a-3b4c-5d6e7f8a9b0c',
  STARTUP_ACCELERATOR_SUSPEND: '7a7b8c9d-0e1f-2a3b-4c5d-6e7f8a9b0c1d',
};

export const MKT_RESELLER_TIER_HISTORY_DATA_SEEDS: MktResellerTierHistoryDataSeed[] =
  [
    // Tech Solutions - Initial assignment to Silver
    {
      id: MKT_RESELLER_TIER_HISTORY_DATA_SEEDS_IDS.TECH_SOLUTIONS_INITIAL,
      resellerId: MKT_RESELLER_DATA_SEEDS_IDS.TECH_SOLUTIONS,
      fromTierId: null, // First time assignment
      toTierId: MKT_RESELLER_TIER_DATA_SEEDS_IDS.SILVER,
      changeType: 'MANUAL',
      changeReason: 'Initial tier assignment based on commitment amount',
      actualRevenue: 0,
      changedAt: '2023-12-01T09:00:00.000Z',
      changedBy: 'admin@company.com',
      effectiveFrom: '2023-12-01',
      notes: 'Initial assignment to Silver tier upon registration',
      position: 1,
      createdBySource: 'MANUAL',
      createdByWorkspaceMemberId: null,
      createdByName: 'Admin User',
    },

    // Digital Marketing - Initial assignment to Silver
    {
      id: MKT_RESELLER_TIER_HISTORY_DATA_SEEDS_IDS.DIGITAL_MARKETING_INITIAL,
      resellerId: MKT_RESELLER_DATA_SEEDS_IDS.DIGITAL_MARKETING,
      fromTierId: null,
      toTierId: MKT_RESELLER_TIER_DATA_SEEDS_IDS.SILVER,
      changeType: 'MANUAL',
      changeReason: 'Initial tier assignment',
      actualRevenue: 0,
      changedAt: '2023-11-15T10:30:00.000Z',
      changedBy: 'admin@company.com',
      effectiveFrom: '2023-11-15',
      notes: 'Started with Silver tier',
      position: 2,
      createdBySource: 'MANUAL',
      createdByWorkspaceMemberId: null,
      createdByName: 'Admin User',
    },

    // Digital Marketing - Upgrade to Gold
    {
      id: MKT_RESELLER_TIER_HISTORY_DATA_SEEDS_IDS.DIGITAL_MARKETING_UPGRADE,
      resellerId: MKT_RESELLER_DATA_SEEDS_IDS.DIGITAL_MARKETING,
      fromTierId: MKT_RESELLER_TIER_DATA_SEEDS_IDS.SILVER,
      toTierId: MKT_RESELLER_TIER_DATA_SEEDS_IDS.GOLD,
      changeType: 'AUTO_UPGRADE',
      changeReason: 'Exceeded Silver tier revenue threshold',
      actualRevenue: 1200000000,
      changedAt: '2024-01-10T14:15:00.000Z',
      changedBy: null, // Automatic upgrade
      effectiveFrom: '2024-01-01',
      notes: 'Automatically upgraded to Gold tier due to excellent performance',
      position: 3,
      createdBySource: 'SYSTEM',
      createdByWorkspaceMemberId: null,
      createdByName: 'System Auto',
    },

    // Business Partner - Initial assignment to Bronze
    {
      id: MKT_RESELLER_TIER_HISTORY_DATA_SEEDS_IDS.BUSINESS_PARTNER_INITIAL,
      resellerId: MKT_RESELLER_DATA_SEEDS_IDS.BUSINESS_PARTNER,
      fromTierId: null,
      toTierId: MKT_RESELLER_TIER_DATA_SEEDS_IDS.BRONZE,
      changeType: 'MANUAL',
      changeReason: 'Initial tier assignment based on low commitment',
      actualRevenue: 0,
      changedAt: '2023-12-20T11:00:00.000Z',
      changedBy: 'admin@company.com',
      effectiveFrom: '2023-12-20',
      notes: 'Started with Bronze tier due to lower commitment amount',
      position: 4,
      createdBySource: 'MANUAL',
      createdByWorkspaceMemberId: null,
      createdByName: 'Admin User',
    },

    // Enterprise Sales - Initial assignment to Diamond
    {
      id: MKT_RESELLER_TIER_HISTORY_DATA_SEEDS_IDS.ENTERPRISE_SALES_INITIAL,
      resellerId: MKT_RESELLER_DATA_SEEDS_IDS.ENTERPRISE_SALES,
      fromTierId: null,
      toTierId: MKT_RESELLER_TIER_DATA_SEEDS_IDS.DIAMOND,
      changeType: 'MANUAL',
      changeReason: 'Enterprise client with high commitment amount',
      actualRevenue: 0,
      changedAt: '2023-10-01T08:30:00.000Z',
      changedBy: 'admin@company.com',
      effectiveFrom: '2023-10-01',
      notes: 'Premium enterprise client - direct assignment to Diamond tier',
      position: 5,
      createdBySource: 'MANUAL',
      createdByWorkspaceMemberId: null,
      createdByName: 'Admin User',
    },

    // Startup Accelerator - Initial assignment to Silver
    {
      id: MKT_RESELLER_TIER_HISTORY_DATA_SEEDS_IDS.STARTUP_ACCELERATOR_INITIAL,
      resellerId: MKT_RESELLER_DATA_SEEDS_IDS.STARTUP_ACCELERATOR,
      fromTierId: null,
      toTierId: MKT_RESELLER_TIER_DATA_SEEDS_IDS.SILVER,
      changeType: 'MANUAL',
      changeReason: 'Standard tier assignment',
      actualRevenue: 0,
      changedAt: '2023-11-01T09:15:00.000Z',
      changedBy: 'admin@company.com',
      effectiveFrom: '2023-11-01',
      notes: 'Initial assignment to Silver tier',
      position: 6,
      createdBySource: 'MANUAL',
      createdByWorkspaceMemberId: null,
      createdByName: 'Admin User',
    },

    // Startup Accelerator - Status change (not tier change, but documented)
    {
      id: MKT_RESELLER_TIER_HISTORY_DATA_SEEDS_IDS.STARTUP_ACCELERATOR_SUSPEND,
      resellerId: MKT_RESELLER_DATA_SEEDS_IDS.STARTUP_ACCELERATOR,
      fromTierId: MKT_RESELLER_TIER_DATA_SEEDS_IDS.SILVER,
      toTierId: MKT_RESELLER_TIER_DATA_SEEDS_IDS.SILVER, // Same tier, but status change
      changeType: 'ADMIN_ADJUSTMENT',
      changeReason: 'Account suspended due to compliance issues',
      actualRevenue: 200000000,
      changedAt: '2024-01-30T16:00:00.000Z',
      changedBy: 'compliance@company.com',
      effectiveFrom: '2024-01-30',
      notes: 'Tier maintained but account status changed to suspended',
      position: 7,
      createdBySource: 'MANUAL',
      createdByWorkspaceMemberId: null,
      createdByName: 'Compliance Team',
    },
  ];
