export enum MktStaffPosition {
  SALES_REP = 'SALES_REP',
  SALES_MANAGER = 'SALES_MANAGER',
  SUPPORT_AGENT = 'SUPPORT_AGENT',
  SUPPORT_MANAGER = 'SUPPORT_MANAGER',
  ACCOUNTANT = 'ACCOUNTANT',
  FINANCE_MANAGER = 'FINANCE_MANAGER',
  HR_SPECIALIST = 'HR_SPECIALIST',
  HR_MANAGER = 'HR_MANAGER',
  DEVELOPER = 'DEVELOPER',
  TECH_LEAD = 'TECH_LEAD',
  ADMIN_STAFF = 'ADMIN_STAFF',
  ADMIN_MANAGER = 'ADMIN_MANAGER',
}

type MktStaffDataSeed = {
  id: string;
  // ⭐ THE ONLY AUTH REFERENCE - Pure Reference Approach
  workspaceMemberId: string | null;
  // Optional contact info reference
  personId: string | null;
  // Business Identity
  employeeId: string;
  position: MktStaffPosition;
  // Business References
  departmentId: string; // Reference to MKT_DEPARTMENT_DATA_SEEDS_IDS
  organizationLevelId: string; // Reference to MKT_ORGANIZATION_LEVEL_DATA_SEEDS_IDS
  employmentStatusId: string; // Reference to MKT_EMPLOYMENT_STATUS_DATA_SEEDS_IDS
  // Team hierarchy
  teamLeaderId: string | null; // Self-referencing to other staff
  // Employment tracking
  statusStartDate: string | null;
  statusExpectedEndDate: string | null;
  // KPI configuration
  hasKpiTracking: boolean | null;
  // Standard fields
  createdBySource: string;
  createdByWorkspaceMemberId: string | null;
  createdByName: string;
};

export const MKT_STAFF_DATA_SEED_COLUMNS: (keyof MktStaffDataSeed)[] = [
  'id',
  'workspaceMemberId',
  'personId',
  'employeeId',
  'position',
  'departmentId',
  'organizationLevelId',
  'employmentStatusId',
  'teamLeaderId',
  'statusStartDate',
  'statusExpectedEndDate',
  'hasKpiTracking',
  'createdBySource',
  'createdByWorkspaceMemberId',
  'createdByName',
];

export const MKT_STAFF_DATA_SEEDS_IDS = {
  SALES_MANAGER: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  SALES_REP_1: 'b2c3d4e5-f6a7-8901-bcde-f23456789012',
  SALES_REP_2: 'c3d4e5f6-a7b8-9012-cdef-345678901234',
  SUPPORT_MANAGER: 'd4e5f6a7-b8c9-0123-def4-567890123456',
  SUPPORT_AGENT_1: 'e5f6a7b8-c9d0-1234-efa5-678901234567',
  SUPPORT_AGENT_2: 'f6a7b8c9-d0e1-2345-fab6-789012345678',
  FINANCE_MANAGER: 'a7b8c9d0-e1f2-3456-abc7-890123456789',
  ACCOUNTANT: 'b8c9d0e1-f2a3-4567-bcd8-901234567890',
  HR_MANAGER: 'c9d0e1f2-a3b4-5678-cde9-012345678901',
  HR_SPECIALIST: 'd0e1f2a3-b4c5-6789-def0-123456789012',
  TECH_LEAD: 'e1f2a3b4-c5d6-7890-efa1-234567890123',
  DEVELOPER: 'f2a3b4c5-d6e7-8901-fab2-345678901234',
  ADMIN_MANAGER: 'a3b4c5d6-e7f8-9012-abc3-456789012345',
  ADMIN_STAFF: 'b4c5d6e7-f8a9-0123-bcd4-567890123456',
};

// Need to reference the seeds IDs from other entities
import { MKT_DEPARTMENT_DATA_SEEDS_IDS } from './mkt-department-data-seeds.constants';
import { MKT_ORGANIZATION_LEVEL_DATA_SEEDS_IDS } from './mkt-organization-level-data-seeds.constants';
import { MKT_EMPLOYMENT_STATUS_DATA_SEEDS_IDS } from './mkt-employment-status-data-seeds.constants';

export const MKT_STAFF_DATA_SEEDS: MktStaffDataSeed[] = [
  // Sales Department
  {
    id: MKT_STAFF_DATA_SEEDS_IDS.SALES_MANAGER,
    workspaceMemberId: null, // Will be set during user account creation
    personId: null,
    employeeId: 'EMP-SALES-001',
    position: MktStaffPosition.SALES_MANAGER,
    departmentId: MKT_DEPARTMENT_DATA_SEEDS_IDS.SALES,
    organizationLevelId: MKT_ORGANIZATION_LEVEL_DATA_SEEDS_IDS.MANAGER,
    employmentStatusId: MKT_EMPLOYMENT_STATUS_DATA_SEEDS_IDS.PERMANENT,
    teamLeaderId: null, // Top level
    statusStartDate: '2024-01-01',
    statusExpectedEndDate: null,
    hasKpiTracking: true,
    createdBySource: 'MANUAL',
    createdByWorkspaceMemberId: null,
    createdByName: 'Admin User',
  },
  {
    id: MKT_STAFF_DATA_SEEDS_IDS.SALES_REP_1,
    workspaceMemberId: null, // Will be set during user account creation
    personId: null,
    employeeId: 'EMP-SALES-002',
    position: MktStaffPosition.SALES_REP,
    departmentId: MKT_DEPARTMENT_DATA_SEEDS_IDS.SALES,
    organizationLevelId: MKT_ORGANIZATION_LEVEL_DATA_SEEDS_IDS.SENIOR_STAFF,
    employmentStatusId: MKT_EMPLOYMENT_STATUS_DATA_SEEDS_IDS.PERMANENT,
    teamLeaderId: MKT_STAFF_DATA_SEEDS_IDS.SALES_MANAGER,
    statusStartDate: '2024-01-15',
    statusExpectedEndDate: null,
    hasKpiTracking: true,
    createdBySource: 'MANUAL',
    createdByWorkspaceMemberId: null,
    createdByName: 'Admin User',
  },
  {
    id: MKT_STAFF_DATA_SEEDS_IDS.SALES_REP_2,
    personId: null,
    workspaceMemberId: null, // Will be set during user account creation
    employeeId: 'EMP-SALES-003',
    position: MktStaffPosition.SALES_REP,
    departmentId: MKT_DEPARTMENT_DATA_SEEDS_IDS.SALES,
    organizationLevelId: MKT_ORGANIZATION_LEVEL_DATA_SEEDS_IDS.SENIOR_STAFF,
    teamLeaderId: MKT_STAFF_DATA_SEEDS_IDS.SALES_MANAGER,
    employmentStatusId: MKT_EMPLOYMENT_STATUS_DATA_SEEDS_IDS.PROBATION,
    statusStartDate: '2024-03-01',
    statusExpectedEndDate: '2024-06-01',
    hasKpiTracking: true,
    createdBySource: 'MANUAL',
    createdByWorkspaceMemberId: null,
    createdByName: 'Admin User',
  },

  // Support Department
  {
    id: MKT_STAFF_DATA_SEEDS_IDS.SUPPORT_MANAGER,
    personId: null,
    workspaceMemberId: null, // Will be set during user account creation
    employeeId: 'EMP-SUP-001',
    position: MktStaffPosition.SUPPORT_MANAGER,
    departmentId: MKT_DEPARTMENT_DATA_SEEDS_IDS.SUPPORT,
    organizationLevelId: MKT_ORGANIZATION_LEVEL_DATA_SEEDS_IDS.MANAGER,
    teamLeaderId: null,
    employmentStatusId: MKT_EMPLOYMENT_STATUS_DATA_SEEDS_IDS.PERMANENT,
    statusStartDate: '2024-01-01',
    statusExpectedEndDate: null,
    hasKpiTracking: true,
    createdBySource: 'MANUAL',
    createdByWorkspaceMemberId: null,
    createdByName: 'Admin User',
  },
  {
    id: MKT_STAFF_DATA_SEEDS_IDS.SUPPORT_AGENT_1,
    personId: null,
    workspaceMemberId: null, // Will be set during user account creation
    employeeId: 'EMP-SUP-002',
    position: MktStaffPosition.SUPPORT_AGENT,
    departmentId: MKT_DEPARTMENT_DATA_SEEDS_IDS.SUPPORT,
    organizationLevelId: MKT_ORGANIZATION_LEVEL_DATA_SEEDS_IDS.SENIOR_STAFF,
    teamLeaderId: MKT_STAFF_DATA_SEEDS_IDS.SUPPORT_MANAGER,
    employmentStatusId: MKT_EMPLOYMENT_STATUS_DATA_SEEDS_IDS.PERMANENT,
    statusStartDate: '2024-01-10',
    statusExpectedEndDate: null,
    hasKpiTracking: true,
    createdBySource: 'MANUAL',
    createdByWorkspaceMemberId: null,
    createdByName: 'Admin User',
  },
  {
    id: MKT_STAFF_DATA_SEEDS_IDS.SUPPORT_AGENT_2,
    personId: null,
    workspaceMemberId: null, // Will be set during user account creation
    employeeId: 'EMP-SUP-003',
    position: MktStaffPosition.SUPPORT_AGENT,
    departmentId: MKT_DEPARTMENT_DATA_SEEDS_IDS.SUPPORT,
    organizationLevelId: MKT_ORGANIZATION_LEVEL_DATA_SEEDS_IDS.SENIOR_STAFF,
    teamLeaderId: MKT_STAFF_DATA_SEEDS_IDS.SUPPORT_MANAGER,
    employmentStatusId: MKT_EMPLOYMENT_STATUS_DATA_SEEDS_IDS.CONTRACT,
    statusStartDate: '2024-02-01',
    statusExpectedEndDate: '2025-02-01',
    hasKpiTracking: true,
    createdBySource: 'MANUAL',
    createdByWorkspaceMemberId: null,
    createdByName: 'Admin User',
  },

  // Accounting Department
  {
    id: MKT_STAFF_DATA_SEEDS_IDS.FINANCE_MANAGER,
    personId: null,
    workspaceMemberId: null, // Will be set during user account creation
    employeeId: 'EMP-FIN-001',
    position: MktStaffPosition.FINANCE_MANAGER,
    departmentId: MKT_DEPARTMENT_DATA_SEEDS_IDS.ACCOUNTING,
    organizationLevelId: MKT_ORGANIZATION_LEVEL_DATA_SEEDS_IDS.MANAGER,
    teamLeaderId: null,
    employmentStatusId: MKT_EMPLOYMENT_STATUS_DATA_SEEDS_IDS.PERMANENT,
    statusStartDate: '2024-01-01',
    statusExpectedEndDate: null,
    hasKpiTracking: false,
    createdBySource: 'MANUAL',
    createdByWorkspaceMemberId: null,
    createdByName: 'Admin User',
  },
  {
    id: MKT_STAFF_DATA_SEEDS_IDS.ACCOUNTANT,
    personId: null,
    workspaceMemberId: null, // Will be set during user account creation
    employeeId: 'EMP-FIN-002',
    position: MktStaffPosition.ACCOUNTANT,
    departmentId: MKT_DEPARTMENT_DATA_SEEDS_IDS.ACCOUNTING,
    organizationLevelId: MKT_ORGANIZATION_LEVEL_DATA_SEEDS_IDS.SENIOR_STAFF,
    teamLeaderId: MKT_STAFF_DATA_SEEDS_IDS.FINANCE_MANAGER,
    employmentStatusId: MKT_EMPLOYMENT_STATUS_DATA_SEEDS_IDS.PERMANENT,
    statusStartDate: '2024-01-15',
    statusExpectedEndDate: null,
    hasKpiTracking: false,
    createdBySource: 'MANUAL',
    createdByWorkspaceMemberId: null,
    createdByName: 'Admin User',
  },

  // HR Department
  {
    id: MKT_STAFF_DATA_SEEDS_IDS.HR_MANAGER,
    personId: null,
    workspaceMemberId: null, // Will be set during user account creation
    employeeId: 'EMP-HR-001',
    position: MktStaffPosition.HR_MANAGER,
    departmentId: MKT_DEPARTMENT_DATA_SEEDS_IDS.HR,
    organizationLevelId: MKT_ORGANIZATION_LEVEL_DATA_SEEDS_IDS.MANAGER,
    teamLeaderId: null,
    employmentStatusId: MKT_EMPLOYMENT_STATUS_DATA_SEEDS_IDS.PERMANENT,
    statusStartDate: '2024-01-01',
    statusExpectedEndDate: null,
    hasKpiTracking: false,
    createdBySource: 'MANUAL',
    createdByWorkspaceMemberId: null,
    createdByName: 'Admin User',
  },
  {
    id: MKT_STAFF_DATA_SEEDS_IDS.HR_SPECIALIST,
    personId: null,
    workspaceMemberId: null, // Will be set during user account creation
    employeeId: 'EMP-HR-002',
    position: MktStaffPosition.HR_SPECIALIST,
    departmentId: MKT_DEPARTMENT_DATA_SEEDS_IDS.HR,
    organizationLevelId: MKT_ORGANIZATION_LEVEL_DATA_SEEDS_IDS.SENIOR_STAFF,
    teamLeaderId: MKT_STAFF_DATA_SEEDS_IDS.HR_MANAGER,
    employmentStatusId: MKT_EMPLOYMENT_STATUS_DATA_SEEDS_IDS.PERMANENT,
    statusStartDate: '2024-01-20',
    statusExpectedEndDate: null,
    hasKpiTracking: false,
    createdBySource: 'MANUAL',
    createdByWorkspaceMemberId: null,
    createdByName: 'Admin User',
  },

  // Tech Department
  {
    id: MKT_STAFF_DATA_SEEDS_IDS.TECH_LEAD,
    personId: null,
    workspaceMemberId: null, // Will be set during user account creation
    employeeId: 'EMP-TECH-001',
    position: MktStaffPosition.TECH_LEAD,
    departmentId: MKT_DEPARTMENT_DATA_SEEDS_IDS.TECH,
    organizationLevelId: MKT_ORGANIZATION_LEVEL_DATA_SEEDS_IDS.MANAGER,
    teamLeaderId: null,
    employmentStatusId: MKT_EMPLOYMENT_STATUS_DATA_SEEDS_IDS.PERMANENT,
    statusStartDate: '2024-01-01',
    statusExpectedEndDate: null,
    hasKpiTracking: true,
    createdBySource: 'MANUAL',
    createdByWorkspaceMemberId: null,
    createdByName: 'Admin User',
  },
  {
    id: MKT_STAFF_DATA_SEEDS_IDS.DEVELOPER,
    personId: null,
    workspaceMemberId: null, // Will be set during user account creation
    employeeId: 'EMP-TECH-002',
    position: MktStaffPosition.DEVELOPER,
    departmentId: MKT_DEPARTMENT_DATA_SEEDS_IDS.TECH,
    organizationLevelId: MKT_ORGANIZATION_LEVEL_DATA_SEEDS_IDS.SENIOR_STAFF,
    teamLeaderId: MKT_STAFF_DATA_SEEDS_IDS.TECH_LEAD,
    employmentStatusId: MKT_EMPLOYMENT_STATUS_DATA_SEEDS_IDS.PERMANENT,
    statusStartDate: '2024-02-01',
    statusExpectedEndDate: null,
    hasKpiTracking: true,
    createdBySource: 'MANUAL',
    createdByWorkspaceMemberId: null,
    createdByName: 'Admin User',
  },

  // Admin Department
  {
    id: MKT_STAFF_DATA_SEEDS_IDS.ADMIN_MANAGER,
    personId: null,
    workspaceMemberId: null, // Will be set during user account creation
    employeeId: 'EMP-ADM-001',
    position: MktStaffPosition.ADMIN_MANAGER,
    departmentId: MKT_DEPARTMENT_DATA_SEEDS_IDS.ADMIN,
    organizationLevelId: MKT_ORGANIZATION_LEVEL_DATA_SEEDS_IDS.MANAGER,
    teamLeaderId: null,
    employmentStatusId: MKT_EMPLOYMENT_STATUS_DATA_SEEDS_IDS.PERMANENT,
    statusStartDate: '2024-01-01',
    statusExpectedEndDate: null,
    hasKpiTracking: false,
    createdBySource: 'MANUAL',
    createdByWorkspaceMemberId: null,
    createdByName: 'Admin User',
  },
  {
    id: MKT_STAFF_DATA_SEEDS_IDS.ADMIN_STAFF,
    personId: null,
    workspaceMemberId: null, // Will be set during user account creation
    employeeId: 'EMP-ADM-002',
    position: MktStaffPosition.ADMIN_STAFF,
    departmentId: MKT_DEPARTMENT_DATA_SEEDS_IDS.ADMIN,
    organizationLevelId: MKT_ORGANIZATION_LEVEL_DATA_SEEDS_IDS.SENIOR_STAFF,
    teamLeaderId: MKT_STAFF_DATA_SEEDS_IDS.ADMIN_MANAGER,
    employmentStatusId: MKT_EMPLOYMENT_STATUS_DATA_SEEDS_IDS.PERMANENT,
    statusStartDate: '2024-01-25',
    statusExpectedEndDate: null,
    hasKpiTracking: false,
    createdBySource: 'MANUAL',
    createdByWorkspaceMemberId: null,
    createdByName: 'Admin User',
  },
];
