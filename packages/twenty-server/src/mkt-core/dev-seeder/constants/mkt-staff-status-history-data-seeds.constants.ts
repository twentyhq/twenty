import { PERSON_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/person-data-seeds.constant';

import { MKT_EMPLOYMENT_STATUS_DATA_SEEDS_IDS } from './mkt-employment-status-data-seeds.constants';

type MktStaffStatusHistoryDataSeed = {
  id: string;
  // Reference fields
  staffId: string; // Reference to MKT_STAFF_DATA_SEEDS_IDS
  fromStatusId: string | null; // Reference to MKT_EMPLOYMENT_STATUS_DATA_SEEDS_IDS
  toStatusId: string; // Reference to MKT_EMPLOYMENT_STATUS_DATA_SEEDS_IDS
  // Change details
  changeDate: string;
  changeReason: string | null;
  approvedBy: string | null; // Reference to another staff ID
  notes: string | null;
  // Expected dates
  expectedEndDate: string | null;
  actualEndDate: string | null;
  // Standard fields
  createdBySource: string;
  createdByWorkspaceMemberId: string | null;
  createdByName: string;
};

export const MKT_STAFF_STATUS_HISTORY_DATA_SEED_COLUMNS: (keyof MktStaffStatusHistoryDataSeed)[] =
  [
    'id',
    'staffId',
    'fromStatusId',
    'toStatusId',
    'changeDate',
    'changeReason',
    'approvedBy',
    'notes',
    'expectedEndDate',
    'actualEndDate',
    'createdBySource',
    'createdByWorkspaceMemberId',
    'createdByName',
  ];

export const MKT_STAFF_STATUS_HISTORY_DATA_SEEDS_IDS = {
  SALES_MANAGER_HIRE: '8082b423-d736-43ec-9727-3549c6d53b62',
  SALES_REP_1_HIRE: '2dff0d13-ce24-419c-aff4-ebf5b160448b',
  SALES_REP_2_HIRE: 'b328844c-3470-49a8-96eb-3c9448fba2b3',
  SALES_REP_2_PROBATION_END: 'b2df885f-e11f-4d0a-81aa-d291391fd8a8',
  SUPPORT_MANAGER_HIRE: '95535bcf-eb21-4875-a4e2-155cd295f255',
  SUPPORT_AGENT_1_HIRE: 'f1aa87fe-662c-453a-b796-a32264e625aa',
  SUPPORT_AGENT_2_HIRE: 'dc701632-b9b0-42e2-bf4f-c02262411a5f',
  FINANCE_MANAGER_HIRE: '63331ba5-30c7-4655-97e8-83ae2f290bcc',
  ACCOUNTANT_HIRE: 'a479228e-f771-4afb-9074-df15ed0f9220',
  HR_MANAGER_HIRE: '3eff1bc4-79a7-4ca0-b9a8-5ae4173d620c',
  HR_SPECIALIST_HIRE: 'beb78751-02d3-40fc-aab3-cd282e715315',
  TECH_LEAD_HIRE: 'f7cc3d4a-2317-4c84-9adf-c353ff43ea4f',
  DEVELOPER_HIRE: 'cc5e62d1-909b-4d89-bd0e-9525fa63018f',
  ADMIN_MANAGER_HIRE: '7ee6fb57-af26-4907-a1ad-2dc25356aec7',
  ADMIN_STAFF_HIRE: 'a0509898-2270-4ff2-88d8-f2616fd33222',
};

export const MKT_STAFF_STATUS_HISTORY_DATA_SEEDS: MktStaffStatusHistoryDataSeed[] =
  [
    // Initial hiring records - all staff starting with their first status
    {
      id: MKT_STAFF_STATUS_HISTORY_DATA_SEEDS_IDS.SALES_MANAGER_HIRE,
      staffId: PERSON_DATA_SEED_IDS.ID_1,
      fromStatusId: null, // First status change
      toStatusId: MKT_EMPLOYMENT_STATUS_DATA_SEEDS_IDS.PERMANENT,
      changeDate: '2024-01-01T09:00:00Z',
      changeReason: 'Initial hiring as permanent employee',
      approvedBy: null, // HR decision
      notes: 'Hired as Sales Manager with extensive experience',
      expectedEndDate: null,
      actualEndDate: null,
      createdBySource: 'MANUAL',
      createdByWorkspaceMemberId: null,
      createdByName: 'HR System',
    },
    {
      id: MKT_STAFF_STATUS_HISTORY_DATA_SEEDS_IDS.SALES_REP_1_HIRE,
      staffId: PERSON_DATA_SEED_IDS.ID_2,
      fromStatusId: null,
      toStatusId: MKT_EMPLOYMENT_STATUS_DATA_SEEDS_IDS.PERMANENT,
      changeDate: '2024-01-15T09:00:00Z',
      changeReason: 'Initial hiring as permanent employee',
      approvedBy: PERSON_DATA_SEED_IDS.ID_3,
      notes:
        'Experienced sales representative hired directly as permanent staff',
      expectedEndDate: null,
      actualEndDate: null,
      createdBySource: 'MANUAL',
      createdByWorkspaceMemberId: null,
      createdByName: 'HR System',
    },
    {
      id: MKT_STAFF_STATUS_HISTORY_DATA_SEEDS_IDS.SALES_REP_2_HIRE,
      staffId: PERSON_DATA_SEED_IDS.ID_3,
      fromStatusId: null,
      toStatusId: MKT_EMPLOYMENT_STATUS_DATA_SEEDS_IDS.PROBATION,
      changeDate: '2024-03-01T09:00:00Z',
      changeReason: 'Initial hiring with probation period',
      approvedBy: PERSON_DATA_SEED_IDS.ID_4,
      notes: 'New graduate hired with 3-month probation period',
      expectedEndDate: '2024-06-01',
      actualEndDate: null,
      createdBySource: 'MANUAL',
      createdByWorkspaceMemberId: null,
      createdByName: 'HR System',
    },
    {
      id: MKT_STAFF_STATUS_HISTORY_DATA_SEEDS_IDS.SALES_REP_2_PROBATION_END,
      staffId: PERSON_DATA_SEED_IDS.ID_2,
      fromStatusId: MKT_EMPLOYMENT_STATUS_DATA_SEEDS_IDS.PROBATION,
      toStatusId: MKT_EMPLOYMENT_STATUS_DATA_SEEDS_IDS.PERMANENT,
      changeDate: '2024-06-01T09:00:00Z',
      changeReason: 'Successful completion of probation period',
      approvedBy: PERSON_DATA_SEED_IDS.ID_3,
      notes:
        'Performed excellently during probation, confirmed as permanent employee',
      expectedEndDate: null,
      actualEndDate: '2024-06-01',
      createdBySource: 'MANUAL',
      createdByWorkspaceMemberId: null,
      createdByName: 'HR System',
    },
  ];
