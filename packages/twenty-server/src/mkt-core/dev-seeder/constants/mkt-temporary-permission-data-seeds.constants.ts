import { DateTime } from 'luxon';

import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

type MktTemporaryPermissionDataSeed = {
  id: string;
  granteeWorkspaceMemberId: string;
  granterWorkspaceMemberId: string;
  objectName: string;
  recordId?: string | null;
  canRead: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  expiresAt: string;
  reason: string;
  purpose?: string;
  isActive: boolean;
  revokedAt?: string | null;
  revokedById?: string | null;
  revokeReason?: string | null;
};

export const MKT_TEMPORARY_PERMISSION_DATA_SEED_COLUMNS: (keyof MktTemporaryPermissionDataSeed)[] =
  [
    'id',
    'granteeWorkspaceMemberId',
    'granterWorkspaceMemberId',
    'objectName',
    'recordId',
    'canRead',
    'canUpdate',
    'canDelete',
    'expiresAt',
    'reason',
    'purpose',
    'isActive',
    'revokedAt',
    'revokedById',
    'revokeReason',
  ];

export const MKT_TEMPORARY_PERMISSION_DATA_SEED_IDS = {
  COVERAGE_KPI: 'f2a3b4c5-6d7e-8f9a-0b1c-2d3e4f5a6b7c',
  CUSTOMER_SUPPORT: 'f3a4b5c6-7d8e-9f0a-1b2c-3d4e5f6a7b8c',
  QUARTERLY_ANALYSIS: 'f4a5b6c7-8d9e-0f1a-2b3c-4d5e6f7a8b9c',
  AUDIT_ACCESS: 'f5a6b7c8-9d0e-1f2a-3b4c-5d6e7f8a9b0c',
  TRAINING_ACCESS: 'f6a7b8c9-0d1e-2f3a-4b5c-6d7e8f9a0b1c',
  EXPIRED_TEST: 'f7a8b9c0-1d2e-3f4a-5b6c-7d8e9f0a1b2c',
  REVOKED_TEST: 'f8a9b0c1-2d3e-4f5a-6b7c-8d9e0f1a2b3c',
  DELEGATION: 'f9a0b1c2-3d4e-5f6a-7b8c-9d0e1f2a3b4c',
};

// Object names used in temporary permissions
export const MKT_TEMPORARY_PERMISSION_OBJECT_NAMES = {
  MKT_KPI: 'mktKpi',
  PERSON: 'person',
  MKT_ORDER: 'mktOrder',
  MKT_INVOICE: 'mktInvoice',
  MKT_KPI_TEMPLATE: 'mktKpiTemplate',
  MKT_LICENSE: 'mktLicense',
  COMPANY: 'company',
  MKT_CONTRACT: 'mktContract',
};

// Sample temporary permission data seeds
export const MKT_TEMPORARY_PERMISSION_DATA_SEEDS: MktTemporaryPermissionDataSeed[] =
  [
    // Case 1: Sales Rep gets temporary access to manager's KPIs for coverage
    {
      id: MKT_TEMPORARY_PERMISSION_DATA_SEED_IDS.COVERAGE_KPI,
      granteeWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM, // Sales Rep
      granterWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY, // Sales Manager
      objectName: MKT_TEMPORARY_PERMISSION_OBJECT_NAMES.MKT_KPI,
      recordId: null, // Access to all KPIs
      canRead: true,
      canUpdate: false,
      canDelete: false,
      expiresAt: DateTime.now().plus({ days: 7 }).toISO(), // 7 days from now
      reason: 'Manager on sick leave - temporary coverage needed',
      purpose: 'Tim covers for Jony during sick leave period',
      isActive: true,
      revokedAt: null,
      revokedById: null,
      revokeReason: null,
    },

    // Case 2: Support gets temporary access to specific customer for urgent issue
    {
      id: MKT_TEMPORARY_PERMISSION_DATA_SEED_IDS.CUSTOMER_SUPPORT,
      granteeWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.PHIL, // Support
      granterWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY, // Sales Manager
      objectName: MKT_TEMPORARY_PERMISSION_OBJECT_NAMES.PERSON,
      recordId: '20202020-1553-4014-a209-3a004756b5c2', // Specific customer
      canRead: true,
      canUpdate: true,
      canDelete: false,
      expiresAt: DateTime.now().plus({ days: 2 }).toISO(), // 2 days from now
      reason: 'Urgent customer escalation requires immediate access',
      purpose:
        'Resolve critical customer complaint requiring account history access',
      isActive: true,
      revokedAt: null,
      revokedById: null,
      revokeReason: null,
    },

    // Case 3: Temporary analyst access for quarterly review
    {
      id: MKT_TEMPORARY_PERMISSION_DATA_SEED_IDS.QUARTERLY_ANALYSIS,
      granteeWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE, // Analyst
      granterWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY, // Sales Manager
      objectName: MKT_TEMPORARY_PERMISSION_OBJECT_NAMES.MKT_ORDER,
      recordId: null, // All orders
      canRead: true,
      canUpdate: false,
      canDelete: false,
      expiresAt: DateTime.now().plus({ days: 14 }).toISO(), // 14 days from now
      reason: 'Q1 performance analysis and reporting',
      purpose: 'Comprehensive quarterly sales performance review',
      isActive: true,
      revokedAt: null,
      revokedById: null,
      revokeReason: null,
    },

    // Case 4: Emergency access to invoices for audit
    {
      id: MKT_TEMPORARY_PERMISSION_DATA_SEED_IDS.AUDIT_ACCESS,
      granteeWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.PHIL, // Support as auditor
      granterWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY, // Sales Manager
      objectName: MKT_TEMPORARY_PERMISSION_OBJECT_NAMES.MKT_INVOICE,
      recordId: null,
      canRead: true,
      canUpdate: false,
      canDelete: false,
      expiresAt: DateTime.now().plus({ days: 30 }).toISO(), // 30 days from now
      reason: 'External audit compliance requirement',
      purpose: 'Year-end financial audit - invoice verification',
      isActive: true,
      revokedAt: null,
      revokedById: null,
      revokeReason: null,
    },

    // Case 5: Training access for new employee
    {
      id: MKT_TEMPORARY_PERMISSION_DATA_SEED_IDS.TRAINING_ACCESS,
      granteeWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM, // Employee for training
      granterWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY, // Sales Manager
      objectName: MKT_TEMPORARY_PERMISSION_OBJECT_NAMES.MKT_KPI_TEMPLATE,
      recordId: null,
      canRead: true,
      canUpdate: false,
      canDelete: false,
      expiresAt: DateTime.now().plus({ days: 60 }).toISO(), // 60 days from now
      reason: 'New employee onboarding and training',
      purpose: 'Learn KPI structure and templates during probation period',
      isActive: true,
      revokedAt: null,
      revokedById: null,
      revokeReason: null,
    },

    // Case 6: Expired permission (for testing cleanup)
    {
      id: MKT_TEMPORARY_PERMISSION_DATA_SEED_IDS.EXPIRED_TEST,
      granteeWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
      granterWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
      objectName: MKT_TEMPORARY_PERMISSION_OBJECT_NAMES.MKT_LICENSE,
      recordId: null,
      canRead: true,
      canUpdate: false,
      canDelete: false,
      expiresAt: DateTime.now().minus({ days: 1 }).toISO(), // Expired yesterday
      reason: 'Previous license review project',
      purpose: 'Completed project access',
      isActive: false, // Should be auto-deactivated
      revokedAt: null,
      revokedById: null,
      revokeReason: null,
    },

    // Case 7: Revoked permission (for testing revocation)
    {
      id: MKT_TEMPORARY_PERMISSION_DATA_SEED_IDS.REVOKED_TEST,
      granteeWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.PHIL,
      granterWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
      objectName: MKT_TEMPORARY_PERMISSION_OBJECT_NAMES.COMPANY,
      recordId: '20202020-88ab-4ac2-8777-b5bf690d5781', // Specific company
      canRead: true,
      canUpdate: true,
      canDelete: false,
      expiresAt: DateTime.now().plus({ days: 7 }).toISO(), // Still valid
      reason: 'Special project access',
      purpose: 'Company integration project',
      isActive: false, // Revoked
      revokedAt: DateTime.now().minus({ hours: 2 }).toISO(), // Revoked 2 hours ago
      revokedById: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY, // Same person who granted
      revokeReason: 'Project scope changed, access no longer needed',
    },

    // Case 8: Delegation scenario - manager delegates to assistant
    {
      id: MKT_TEMPORARY_PERMISSION_DATA_SEED_IDS.DELEGATION,
      granteeWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE, // Assistant
      granterWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY, // Sales Manager
      objectName: MKT_TEMPORARY_PERMISSION_OBJECT_NAMES.MKT_CONTRACT,
      recordId: null,
      canRead: true,
      canUpdate: true,
      canDelete: false,
      expiresAt: DateTime.now().plus({ weeks: 3 }).toISO(), // 3 weeks
      reason: 'Manager delegation during business trip',
      purpose:
        'Handle contract approvals and reviews while manager is traveling',
      isActive: true,
      revokedAt: null,
      revokedById: null,
      revokeReason: null,
    },
  ];

// Export for specific use cases
export const ACTIVE_TEMPORARY_PERMISSIONS =
  MKT_TEMPORARY_PERMISSION_DATA_SEEDS.filter(
    (permission) =>
      permission.isActive &&
      DateTime.fromISO(permission.expiresAt) > DateTime.now(),
  );

export const EXPIRED_TEMPORARY_PERMISSIONS =
  MKT_TEMPORARY_PERMISSION_DATA_SEEDS.filter(
    (permission) => DateTime.fromISO(permission.expiresAt) < DateTime.now(),
  );

export const REVOKED_TEMPORARY_PERMISSIONS =
  MKT_TEMPORARY_PERMISSION_DATA_SEEDS.filter(
    (permission) =>
      permission.revokedAt !== null && permission.revokedAt !== undefined,
  );

// Export for easy lookup by scenario type
export const TEMPORARY_PERMISSION_BY_SCENARIO = {
  COVERAGE: MKT_TEMPORARY_PERMISSION_DATA_SEEDS.find(
    (p) => p.id === MKT_TEMPORARY_PERMISSION_DATA_SEED_IDS.COVERAGE_KPI,
  ),
  SUPPORT: MKT_TEMPORARY_PERMISSION_DATA_SEEDS.find(
    (p) => p.id === MKT_TEMPORARY_PERMISSION_DATA_SEED_IDS.CUSTOMER_SUPPORT,
  ),
  ANALYSIS: MKT_TEMPORARY_PERMISSION_DATA_SEEDS.find(
    (p) => p.id === MKT_TEMPORARY_PERMISSION_DATA_SEED_IDS.QUARTERLY_ANALYSIS,
  ),
  AUDIT: MKT_TEMPORARY_PERMISSION_DATA_SEEDS.find(
    (p) => p.id === MKT_TEMPORARY_PERMISSION_DATA_SEED_IDS.AUDIT_ACCESS,
  ),
  TRAINING: MKT_TEMPORARY_PERMISSION_DATA_SEEDS.find(
    (p) => p.id === MKT_TEMPORARY_PERMISSION_DATA_SEED_IDS.TRAINING_ACCESS,
  ),
  EXPIRED: MKT_TEMPORARY_PERMISSION_DATA_SEEDS.find(
    (p) => p.id === MKT_TEMPORARY_PERMISSION_DATA_SEED_IDS.EXPIRED_TEST,
  ),
  REVOKED: MKT_TEMPORARY_PERMISSION_DATA_SEEDS.find(
    (p) => p.id === MKT_TEMPORARY_PERMISSION_DATA_SEED_IDS.REVOKED_TEST,
  ),
  DELEGATION: MKT_TEMPORARY_PERMISSION_DATA_SEEDS.find(
    (p) => p.id === MKT_TEMPORARY_PERMISSION_DATA_SEED_IDS.DELEGATION,
  ),
};
