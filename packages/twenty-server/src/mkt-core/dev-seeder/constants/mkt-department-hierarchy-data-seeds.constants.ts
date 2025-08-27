import { DateTime } from 'luxon';

import { MKT_DEPARTMENT_DATA_SEEDS_IDS } from './mkt-department-data-seeds.constants';

export enum MktDepartmentHierarchyRelationType {
  PARENT_CHILD = 'PARENT_CHILD',
  MATRIX = 'MATRIX',
  FUNCTIONAL = 'FUNCTIONAL',
  TEMPORARY = 'TEMPORARY',
}

type MktDepartmentHierarchyDataSeed = {
  id: string;
  parentDepartmentId: string;
  childDepartmentId: string;
  hierarchyLevel: number;
  relationshipType: MktDepartmentHierarchyRelationType;
  validFrom?: Date | null;
  validTo?: Date | null;
  inheritsPermissions?: boolean;
  canEscalateToParent?: boolean;
  allowsCrossBranchAccess?: boolean;
  displayOrder?: number;
  notes?: string;
  isActive?: boolean;
  position: number;
  createdBySource: string;
  createdByWorkspaceMemberId: string | null;
  createdByName: string;
  // New RBAC fields
  hierarchyPath?: string[];
  inheritsParentPermissions?: boolean;
  canViewTeamData?: boolean;
  canEditTeamData?: boolean;
  canExportTeamData?: boolean;
};

export const MKT_DEPARTMENT_HIERARCHY_DATA_SEED_COLUMNS: (keyof MktDepartmentHierarchyDataSeed)[] =
  [
    'id',
    'parentDepartmentId',
    'childDepartmentId',
    'hierarchyLevel',
    'relationshipType',
    'validFrom',
    'validTo',
    'inheritsPermissions',
    'canEscalateToParent',
    'allowsCrossBranchAccess',
    'displayOrder',
    'notes',
    'isActive',
    'position',
    'createdBySource',
    'createdByWorkspaceMemberId',
    'createdByName',
    'hierarchyPath',
    'inheritsParentPermissions',
    'canViewTeamData',
    'canEditTeamData',
    'canExportTeamData',
  ];

export const MKT_DEPARTMENT_HIERARCHY_DATA_SEED_IDS = {
  // Sales hierarchies
  SALES_SUPPORT: '7d8e9f0a-1b2c-3d4e-5f6a-7b8c9d0e1f2a',
  SALES_ACCOUNTING: '8e9f0a1b-2c3d-4e5f-6a7b-8c9d0e1f2a3b',

  // Tech hierarchies
  TECH_SUPPORT: '9f0a1b2c-3d4e-5f6a-7b8c-9d0e1f2a3b4c',

  // Admin hierarchies (as central coordination)
  ADMIN_HR: 'a0b1c2d3-4e5f-6a7b-8c9d-0e1f2a3b4c5d',
  ADMIN_ACCOUNTING: 'b1c2d3e4-5f6a-7b8c-9d0e-1f2a3b4c5d6e',

  // Matrix relationships
  SALES_TECH_MATRIX: 'c2d3e4f5-6a7b-8c9d-0e1f-2a3b4c5d6e7f',
};

export const MKT_DEPARTMENT_HIERARCHY_DATA_SEEDS: MktDepartmentHierarchyDataSeed[] =
  [
    // Sales Department supervises Support Department
    {
      id: MKT_DEPARTMENT_HIERARCHY_DATA_SEED_IDS.SALES_SUPPORT,
      parentDepartmentId: MKT_DEPARTMENT_DATA_SEEDS_IDS.SALES,
      childDepartmentId: MKT_DEPARTMENT_DATA_SEEDS_IDS.SUPPORT,
      hierarchyLevel: 1,
      relationshipType: MktDepartmentHierarchyRelationType.PARENT_CHILD,
      validFrom: DateTime.fromISO('2024-01-01').toJSDate(),
      validTo: null,
      inheritsPermissions: true,
      canEscalateToParent: true,
      allowsCrossBranchAccess: true,
      displayOrder: 1,
      notes:
        'Sales department provides strategic direction for customer support operations',
      isActive: true,
      position: 1,
      createdBySource: 'MANUAL',
      createdByWorkspaceMemberId: null,
      createdByName: 'Admin User',
      // New RBAC fields
      hierarchyPath: [
        MKT_DEPARTMENT_DATA_SEEDS_IDS.SALES,
        MKT_DEPARTMENT_DATA_SEEDS_IDS.SUPPORT,
      ],
      inheritsParentPermissions: true,
      canViewTeamData: true,
      canEditTeamData: false,
      canExportTeamData: false,
    },

    // Sales Department has oversight of Accounting for revenue tracking
    {
      id: MKT_DEPARTMENT_HIERARCHY_DATA_SEED_IDS.SALES_ACCOUNTING,
      parentDepartmentId: MKT_DEPARTMENT_DATA_SEEDS_IDS.SALES,
      childDepartmentId: MKT_DEPARTMENT_DATA_SEEDS_IDS.ACCOUNTING,
      hierarchyLevel: 1,
      relationshipType: MktDepartmentHierarchyRelationType.FUNCTIONAL,
      validFrom: DateTime.fromISO('2024-01-01').toJSDate(),
      validTo: null,
      inheritsPermissions: false,
      canEscalateToParent: true,
      allowsCrossBranchAccess: false,
      displayOrder: 2,
      notes:
        'Functional relationship for revenue tracking and financial reporting',
      isActive: true,
      position: 2,
      createdBySource: 'MANUAL',
      createdByWorkspaceMemberId: null,
      createdByName: 'Admin User',
      // New RBAC fields
      hierarchyPath: [
        MKT_DEPARTMENT_DATA_SEEDS_IDS.SALES,
        MKT_DEPARTMENT_DATA_SEEDS_IDS.ACCOUNTING,
      ],
      inheritsParentPermissions: false,
      canViewTeamData: true,
      canEditTeamData: false,
      canExportTeamData: true,
    },

    // Tech Department provides technical support to Support Department
    {
      id: MKT_DEPARTMENT_HIERARCHY_DATA_SEED_IDS.TECH_SUPPORT,
      parentDepartmentId: MKT_DEPARTMENT_DATA_SEEDS_IDS.TECH,
      childDepartmentId: MKT_DEPARTMENT_DATA_SEEDS_IDS.SUPPORT,
      hierarchyLevel: 1,
      relationshipType: MktDepartmentHierarchyRelationType.MATRIX,
      validFrom: DateTime.fromISO('2024-01-01').toJSDate(),
      validTo: null,
      inheritsPermissions: false,
      canEscalateToParent: true,
      allowsCrossBranchAccess: true,
      displayOrder: 3,
      notes: 'Matrix relationship for technical escalation and product support',
      isActive: true,
      position: 3,
      createdBySource: 'MANUAL',
      createdByWorkspaceMemberId: null,
      createdByName: 'Admin User',
      // New RBAC fields
      hierarchyPath: [
        MKT_DEPARTMENT_DATA_SEEDS_IDS.TECH,
        MKT_DEPARTMENT_DATA_SEEDS_IDS.SUPPORT,
      ],
      inheritsParentPermissions: false,
      canViewTeamData: false,
      canEditTeamData: false,
      canExportTeamData: false,
    },

    // Admin Department coordinates with HR Department
    {
      id: MKT_DEPARTMENT_HIERARCHY_DATA_SEED_IDS.ADMIN_HR,
      parentDepartmentId: MKT_DEPARTMENT_DATA_SEEDS_IDS.ADMIN,
      childDepartmentId: MKT_DEPARTMENT_DATA_SEEDS_IDS.HR,
      hierarchyLevel: 1,
      relationshipType: MktDepartmentHierarchyRelationType.PARENT_CHILD,
      validFrom: DateTime.fromISO('2024-01-01').toJSDate(),
      validTo: null,
      inheritsPermissions: true,
      canEscalateToParent: true,
      allowsCrossBranchAccess: true,
      displayOrder: 4,
      notes: 'Administrative oversight of human resources activities',
      isActive: true,
      position: 4,
      createdBySource: 'MANUAL',
      createdByWorkspaceMemberId: null,
      createdByName: 'Admin User',
      // New RBAC fields
      hierarchyPath: [
        MKT_DEPARTMENT_DATA_SEEDS_IDS.ADMIN,
        MKT_DEPARTMENT_DATA_SEEDS_IDS.HR,
      ],
      inheritsParentPermissions: true,
      canViewTeamData: true,
      canEditTeamData: true,
      canExportTeamData: true,
    },

    // Admin Department coordinates with Accounting for administrative compliance
    {
      id: MKT_DEPARTMENT_HIERARCHY_DATA_SEED_IDS.ADMIN_ACCOUNTING,
      parentDepartmentId: MKT_DEPARTMENT_DATA_SEEDS_IDS.ADMIN,
      childDepartmentId: MKT_DEPARTMENT_DATA_SEEDS_IDS.ACCOUNTING,
      hierarchyLevel: 1,
      relationshipType: MktDepartmentHierarchyRelationType.FUNCTIONAL,
      validFrom: DateTime.fromISO('2024-01-01').toJSDate(),
      validTo: null,
      inheritsPermissions: false,
      canEscalateToParent: true,
      allowsCrossBranchAccess: false,
      displayOrder: 5,
      notes: 'Administrative oversight for compliance and regulatory reporting',
      isActive: true,
      position: 5,
      createdBySource: 'MANUAL',
      createdByWorkspaceMemberId: null,
      createdByName: 'Admin User',
      // New RBAC fields
      hierarchyPath: [
        MKT_DEPARTMENT_DATA_SEEDS_IDS.ADMIN,
        MKT_DEPARTMENT_DATA_SEEDS_IDS.ACCOUNTING,
      ],
      inheritsParentPermissions: false,
      canViewTeamData: true,
      canEditTeamData: false,
      canExportTeamData: true,
    },

    // Sales-Tech Matrix relationship for product development input
    {
      id: MKT_DEPARTMENT_HIERARCHY_DATA_SEED_IDS.SALES_TECH_MATRIX,
      parentDepartmentId: MKT_DEPARTMENT_DATA_SEEDS_IDS.SALES,
      childDepartmentId: MKT_DEPARTMENT_DATA_SEEDS_IDS.TECH,
      hierarchyLevel: 1,
      relationshipType: MktDepartmentHierarchyRelationType.MATRIX,
      validFrom: DateTime.fromISO('2024-01-01').toJSDate(),
      validTo: null,
      inheritsPermissions: false,
      canEscalateToParent: false,
      allowsCrossBranchAccess: true,
      displayOrder: 6,
      notes:
        'Matrix relationship for product roadmap and customer feedback integration',
      isActive: true,
      position: 6,
      createdBySource: 'MANUAL',
      createdByWorkspaceMemberId: null,
      createdByName: 'Admin User',
      // New RBAC fields
      hierarchyPath: [
        MKT_DEPARTMENT_DATA_SEEDS_IDS.SALES,
        MKT_DEPARTMENT_DATA_SEEDS_IDS.TECH,
      ],
      inheritsParentPermissions: false,
      canViewTeamData: false,
      canEditTeamData: false,
      canExportTeamData: false,
    },
  ];

// Export for specific use cases
export const ACTIVE_DEPARTMENT_HIERARCHIES =
  MKT_DEPARTMENT_HIERARCHY_DATA_SEEDS.filter((hierarchy) => hierarchy.isActive);

export const PARENT_CHILD_HIERARCHIES =
  MKT_DEPARTMENT_HIERARCHY_DATA_SEEDS.filter(
    (hierarchy) =>
      hierarchy.relationshipType ===
      MktDepartmentHierarchyRelationType.PARENT_CHILD,
  );

export const MATRIX_HIERARCHIES = MKT_DEPARTMENT_HIERARCHY_DATA_SEEDS.filter(
  (hierarchy) =>
    hierarchy.relationshipType === MktDepartmentHierarchyRelationType.MATRIX,
);

export const FUNCTIONAL_HIERARCHIES =
  MKT_DEPARTMENT_HIERARCHY_DATA_SEEDS.filter(
    (hierarchy) =>
      hierarchy.relationshipType ===
      MktDepartmentHierarchyRelationType.FUNCTIONAL,
  );

// Export for easy lookup by department
export const HIERARCHIES_BY_PARENT_DEPARTMENT = {
  SALES: MKT_DEPARTMENT_HIERARCHY_DATA_SEEDS.filter(
    (h) => h.parentDepartmentId === MKT_DEPARTMENT_DATA_SEEDS_IDS.SALES,
  ),
  TECH: MKT_DEPARTMENT_HIERARCHY_DATA_SEEDS.filter(
    (h) => h.parentDepartmentId === MKT_DEPARTMENT_DATA_SEEDS_IDS.TECH,
  ),
  ADMIN: MKT_DEPARTMENT_HIERARCHY_DATA_SEEDS.filter(
    (h) => h.parentDepartmentId === MKT_DEPARTMENT_DATA_SEEDS_IDS.ADMIN,
  ),
};

export const HIERARCHIES_BY_CHILD_DEPARTMENT = {
  SUPPORT: MKT_DEPARTMENT_HIERARCHY_DATA_SEEDS.filter(
    (h) => h.childDepartmentId === MKT_DEPARTMENT_DATA_SEEDS_IDS.SUPPORT,
  ),
  ACCOUNTING: MKT_DEPARTMENT_HIERARCHY_DATA_SEEDS.filter(
    (h) => h.childDepartmentId === MKT_DEPARTMENT_DATA_SEEDS_IDS.ACCOUNTING,
  ),
  HR: MKT_DEPARTMENT_HIERARCHY_DATA_SEEDS.filter(
    (h) => h.childDepartmentId === MKT_DEPARTMENT_DATA_SEEDS_IDS.HR,
  ),
  TECH: MKT_DEPARTMENT_HIERARCHY_DATA_SEEDS.filter(
    (h) => h.childDepartmentId === MKT_DEPARTMENT_DATA_SEEDS_IDS.TECH,
  ),
};
