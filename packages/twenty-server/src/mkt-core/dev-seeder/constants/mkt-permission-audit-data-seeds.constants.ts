import { DateTime } from 'luxon';

import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';
import {
  PermissionAuditAction,
  PermissionSource,
  CheckResult,
} from 'src/mkt-core/mkt-permission-audit/mkt-permission-audit.workspace-entity';

type MktPermissionAuditDataSeed = {
  id: string;
  workspaceMemberId: string;
  userId?: string | null;
  action: PermissionAuditAction;
  objectName: string;
  recordId?: string | null;
  permissionSource?: PermissionSource | null;
  checkResult: CheckResult;
  denialReason?: string | null;
  requestContext?: object | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  checkDurationMs?: number | null;
  position: number;
  createdAt: string;
};

export const MKT_PERMISSION_AUDIT_DATA_SEED_COLUMNS: (keyof MktPermissionAuditDataSeed)[] =
  [
    'id',
    'workspaceMemberId',
    'userId',
    'action',
    'objectName',
    'recordId',
    'permissionSource',
    'checkResult',
    'denialReason',
    'requestContext',
    'ipAddress',
    'userAgent',
    'checkDurationMs',
    'position',
    'createdAt',
  ];

export const MKT_PERMISSION_AUDIT_DATA_SEED_IDS = {
  SALES_READ_CUSTOMER_GRANTED: 'f5a6b7c8-d9e0-1f2a-3b4c-5d6e7f8a9b0c',
  SUPPORT_READ_TICKET_GRANTED: 'a6b7c8d9-e0f1-2a3b-4c5d-6e7f8a9b0c1d',
  ADMIN_DELETE_USER_DENIED: 'b7c8d9e0-f1a2-3b4c-5d6e-7f8a9b0c1d2e',
  TEMP_PERMISSION_READ_KPI: 'c8d9e0f1-a2b3-4c5d-6e7f-8a9b0c1d2e3f',
  DEPT_POLICY_EXPORT_DATA: 'd9e0f1a2-b3c4-5d6e-7f8a-9b0c1d2e3f4a',
  UNAUTHORIZED_DELETE_ATTEMPT: 'e0f1a2b3-c4d5-6e7f-8a9b-0c1d2e3f4a5b',
  ROLE_BASED_CREATE_ORDER: 'f1a2b3c4-d5e6-7f8a-9b0c-1d2e3f4a5b6c',
  HIGH_VOLUME_READ_ACCESS: 'a2b3c4d5-e6f7-8a9b-0c1d-2e3f4a5b6c7d',
  AUDIT_TRAIL_COMPLIANCE: 'b3c4d5e6-f7a8-9b0c-1d2e-3f4a5b6c7d8e',
  PERFORMANCE_SLOW_CHECK: 'c4d5e6f7-a8b9-0c1d-2e3f-4a5b6c7d8e9f',
};

export const MKT_PERMISSION_AUDIT_OBJECT_NAMES = {
  MKT_CUSTOMER: 'mktCustomer',
  MKT_ORDER: 'mktOrder',
  MKT_INVOICE: 'mktInvoice',
  MKT_KPI: 'mktKpi',
  MKT_PRODUCT: 'mktProduct',
  WORKSPACE_MEMBER: 'workspaceMember',
  MKT_CONTRACT: 'mktContract',
  MKT_LICENSE: 'mktLicense',
};

export const MKT_PERMISSION_AUDIT_DATA_SEEDS: MktPermissionAuditDataSeed[] = [
  // Sales member successfully reading assigned customer
  {
    id: MKT_PERMISSION_AUDIT_DATA_SEED_IDS.SALES_READ_CUSTOMER_GRANTED,
    workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY, // Sales Manager
    userId: 'user-sales-001',
    action: PermissionAuditAction.READ,
    objectName: MKT_PERMISSION_AUDIT_OBJECT_NAMES.MKT_CUSTOMER,
    recordId: 'customer-001',
    permissionSource: PermissionSource.ROLE,
    checkResult: CheckResult.GRANTED,
    denialReason: null,
    requestContext: {
      endpoint: '/api/customers/customer-001',
      method: 'GET',
      sessionId: 'sess-12345',
      requestId: 'req-67890',
    },
    ipAddress: '192.168.1.100',
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0',
    checkDurationMs: 15,
    position: 1,
    createdAt: DateTime.now().minus({ hours: 2 }).toISO(),
  },

  // Support member accessing ticket data
  {
    id: MKT_PERMISSION_AUDIT_DATA_SEED_IDS.SUPPORT_READ_TICKET_GRANTED,
    workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY, // Support member
    userId: 'user-support-001',
    action: PermissionAuditAction.READ,
    objectName: MKT_PERMISSION_AUDIT_OBJECT_NAMES.MKT_CUSTOMER,
    recordId: 'customer-002',
    permissionSource: PermissionSource.DEPARTMENT,
    checkResult: CheckResult.GRANTED,
    denialReason: null,
    requestContext: {
      endpoint: '/api/customers/customer-002/support-tickets',
      method: 'GET',
      supportCase: 'CASE-2024-001',
      priority: 'high',
    },
    ipAddress: '192.168.1.101',
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Safari/537.36',
    checkDurationMs: 23,
    position: 2,
    createdAt: DateTime.now().minus({ hours: 1, minutes: 30 }).toISO(),
  },

  // Admin attempting to delete user - denied due to insufficient permissions
  {
    id: MKT_PERMISSION_AUDIT_DATA_SEED_IDS.ADMIN_DELETE_USER_DENIED,
    workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.PHIL, // Admin member
    userId: 'user-admin-001',
    action: PermissionAuditAction.DELETE,
    objectName: MKT_PERMISSION_AUDIT_OBJECT_NAMES.WORKSPACE_MEMBER,
    recordId: 'member-003',
    permissionSource: PermissionSource.ROLE,
    checkResult: CheckResult.DENIED,
    denialReason: 'Delete permission requires Super Admin role',
    requestContext: {
      endpoint: '/api/workspace-members/member-003',
      method: 'DELETE',
      attemptedAction: 'permanent_delete',
      adminLevel: 'standard',
    },
    ipAddress: '192.168.1.102',
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Edge/120.0.0.0',
    checkDurationMs: 8,
    position: 3,
    createdAt: DateTime.now().minus({ hours: 1, minutes: 15 }).toISO(),
  },

  // Temporary permission being used to read KPI data
  {
    id: MKT_PERMISSION_AUDIT_DATA_SEED_IDS.TEMP_PERMISSION_READ_KPI,
    workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM, // Tech member
    userId: 'user-tech-001',
    action: PermissionAuditAction.READ,
    objectName: MKT_PERMISSION_AUDIT_OBJECT_NAMES.MKT_KPI,
    recordId: 'kpi-quarterly-001',
    permissionSource: PermissionSource.TEMPORARY,
    checkResult: CheckResult.GRANTED,
    denialReason: null,
    requestContext: {
      endpoint: '/api/kpi/kpi-quarterly-001',
      method: 'GET',
      temporaryPermissionId: 'temp-perm-001',
      expiresAt: DateTime.now().plus({ hours: 24 }).toISO(),
      grantedBy: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
    },
    ipAddress: '192.168.1.103',
    userAgent:
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120.0.0.0',
    checkDurationMs: 42,
    position: 4,
    createdAt: DateTime.now().minus({ hours: 1 }).toISO(),
  },

  // Department policy allowing data export
  {
    id: MKT_PERMISSION_AUDIT_DATA_SEED_IDS.DEPT_POLICY_EXPORT_DATA,
    workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY, // Sales Manager
    userId: 'user-sales-001',
    action: PermissionAuditAction.EXPORT,
    objectName: MKT_PERMISSION_AUDIT_OBJECT_NAMES.MKT_ORDER,
    recordId: null, // Bulk export
    permissionSource: PermissionSource.DATA_ACCESS_POLICY,
    checkResult: CheckResult.GRANTED,
    denialReason: null,
    requestContext: {
      endpoint: '/api/orders/export',
      method: 'POST',
      exportFormat: 'csv',
      recordCount: 1250,
      dateRange: {
        from: '2024-01-01',
        to: '2024-03-31',
      },
      policyId: 'policy-sales-export',
    },
    ipAddress: '192.168.1.100',
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0',
    checkDurationMs: 156,
    position: 5,
    createdAt: DateTime.now().minus({ minutes: 45 }).toISO(),
  },

  // Unauthorized delete attempt from outside network
  {
    id: MKT_PERMISSION_AUDIT_DATA_SEED_IDS.UNAUTHORIZED_DELETE_ATTEMPT,
    workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE, // Support member
    userId: 'user-support-001',
    action: PermissionAuditAction.DELETE,
    objectName: MKT_PERMISSION_AUDIT_OBJECT_NAMES.MKT_CONTRACT,
    recordId: 'contract-important-001',
    permissionSource: PermissionSource.ROLE,
    checkResult: CheckResult.DENIED,
    denialReason:
      'Delete action not permitted for Support role on Contract objects',
    requestContext: {
      endpoint: '/api/contracts/contract-important-001',
      method: 'DELETE',
      suspiciousActivity: true,
      riskScore: 8.5,
      ipReputationCheck: 'failed',
    },
    ipAddress: '203.0.113.45', // External IP
    userAgent: 'curl/7.81.0',
    checkDurationMs: 5,
    position: 6,
    createdAt: DateTime.now().minus({ minutes: 30 }).toISO(),
  },

  // Role-based order creation
  {
    id: MKT_PERMISSION_AUDIT_DATA_SEED_IDS.ROLE_BASED_CREATE_ORDER,
    workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY, // Sales Manager
    userId: 'user-sales-001',
    action: PermissionAuditAction.CREATE,
    objectName: MKT_PERMISSION_AUDIT_OBJECT_NAMES.MKT_ORDER,
    recordId: null, // Not yet created
    permissionSource: PermissionSource.ROLE,
    checkResult: CheckResult.GRANTED,
    denialReason: null,
    requestContext: {
      endpoint: '/api/orders',
      method: 'POST',
      orderValue: 45000,
      customerId: 'customer-vip-001',
      salesQuote: 'SQ-2024-001',
    },
    ipAddress: '192.168.1.100',
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0',
    checkDurationMs: 28,
    position: 7,
    createdAt: DateTime.now().minus({ minutes: 15 }).toISO(),
  },

  // High volume read access showing good performance
  {
    id: MKT_PERMISSION_AUDIT_DATA_SEED_IDS.HIGH_VOLUME_READ_ACCESS,
    workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM, // Tech member
    userId: 'user-tech-001',
    action: PermissionAuditAction.READ,
    objectName: MKT_PERMISSION_AUDIT_OBJECT_NAMES.MKT_PRODUCT,
    recordId: null, // List view
    permissionSource: PermissionSource.ROLE,
    checkResult: CheckResult.GRANTED,
    denialReason: null,
    requestContext: {
      endpoint: '/api/products',
      method: 'GET',
      pagination: {
        limit: 100,
        offset: 0,
      },
      filters: {
        category: 'software',
        status: 'active',
      },
      totalRecords: 2847,
    },
    ipAddress: '192.168.1.103',
    userAgent:
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120.0.0.0',
    checkDurationMs: 12,
    position: 8,
    createdAt: DateTime.now().minus({ minutes: 10 }).toISO(),
  },

  // Audit trail compliance check
  {
    id: MKT_PERMISSION_AUDIT_DATA_SEED_IDS.AUDIT_TRAIL_COMPLIANCE,
    workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.PHIL, // Admin member
    userId: 'user-admin-001',
    action: PermissionAuditAction.READ,
    objectName: MKT_PERMISSION_AUDIT_OBJECT_NAMES.MKT_INVOICE,
    recordId: 'invoice-audit-001',
    permissionSource: PermissionSource.SUPPORT_ASSIGNMENT,
    checkResult: CheckResult.GRANTED,
    denialReason: null,
    requestContext: {
      endpoint: '/api/invoices/invoice-audit-001/audit-trail',
      method: 'GET',
      auditPurpose: 'compliance_review',
      reviewerId: 'auditor-ext-001',
      caseNumber: 'AUDIT-2024-Q1-001',
    },
    ipAddress: '192.168.1.102',
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Edge/120.0.0.0',
    checkDurationMs: 89,
    position: 9,
    createdAt: DateTime.now().minus({ minutes: 5 }).toISO(),
  },

  // Performance monitoring: slow permission check
  {
    id: MKT_PERMISSION_AUDIT_DATA_SEED_IDS.PERFORMANCE_SLOW_CHECK,
    workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.PHIL, // Support member
    userId: 'user-support-001',
    action: PermissionAuditAction.UPDATE,
    objectName: MKT_PERMISSION_AUDIT_OBJECT_NAMES.MKT_LICENSE,
    recordId: 'license-complex-001',
    permissionSource: PermissionSource.DATA_ACCESS_POLICY,
    checkResult: CheckResult.GRANTED,
    denialReason: null,
    requestContext: {
      endpoint: '/api/licenses/license-complex-001',
      method: 'PATCH',
      complexPolicyEvaluation: true,
      hierarchyLevels: 4,
      policyRulesEvaluated: 12,
      temporaryPermissionsChecked: 3,
    },
    ipAddress: '192.168.1.101',
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Safari/537.36',
    checkDurationMs: 347, // Slow performance flagged
    position: 10,
    createdAt: DateTime.now().minus({ minutes: 2 }).toISO(),
  },
];

// Export for specific use cases
export const GRANTED_PERMISSION_AUDITS = MKT_PERMISSION_AUDIT_DATA_SEEDS.filter(
  (audit) => audit.checkResult === CheckResult.GRANTED,
);

export const DENIED_PERMISSION_AUDITS = MKT_PERMISSION_AUDIT_DATA_SEEDS.filter(
  (audit) => audit.checkResult === CheckResult.DENIED,
);

export const HIGH_PERFORMANCE_AUDITS = MKT_PERMISSION_AUDIT_DATA_SEEDS.filter(
  (audit) => audit.checkDurationMs && audit.checkDurationMs > 100,
);

// Export for easy lookup by permission source
export const AUDITS_BY_PERMISSION_SOURCE = {
  ROLE: MKT_PERMISSION_AUDIT_DATA_SEEDS.filter(
    (audit) => audit.permissionSource === PermissionSource.ROLE,
  ),
  TEMPORARY: MKT_PERMISSION_AUDIT_DATA_SEEDS.filter(
    (audit) => audit.permissionSource === PermissionSource.TEMPORARY,
  ),
  DEPARTMENT: MKT_PERMISSION_AUDIT_DATA_SEEDS.filter(
    (audit) => audit.permissionSource === PermissionSource.DEPARTMENT,
  ),
  DATA_ACCESS_POLICY: MKT_PERMISSION_AUDIT_DATA_SEEDS.filter(
    (audit) => audit.permissionSource === PermissionSource.DATA_ACCESS_POLICY,
  ),
  SUPPORT_ASSIGNMENT: MKT_PERMISSION_AUDIT_DATA_SEEDS.filter(
    (audit) => audit.permissionSource === PermissionSource.SUPPORT_ASSIGNMENT,
  ),
};

// Export for easy lookup by action
export const AUDITS_BY_ACTION = {
  READ: MKT_PERMISSION_AUDIT_DATA_SEEDS.filter(
    (audit) => audit.action === PermissionAuditAction.READ,
  ),
  create: MKT_PERMISSION_AUDIT_DATA_SEEDS.filter(
    (audit) => audit.action === PermissionAuditAction.CREATE,
  ),
  update: MKT_PERMISSION_AUDIT_DATA_SEEDS.filter(
    (audit) => audit.action === PermissionAuditAction.UPDATE,
  ),
  delete: MKT_PERMISSION_AUDIT_DATA_SEEDS.filter(
    (audit) => audit.action === PermissionAuditAction.DELETE,
  ),
  export: MKT_PERMISSION_AUDIT_DATA_SEEDS.filter(
    (audit) => audit.action === PermissionAuditAction.EXPORT,
  ),
};

// Export for easy lookup by workspace member
export const AUDITS_BY_MEMBER = {
  JONY: MKT_PERMISSION_AUDIT_DATA_SEEDS.filter(
    (audit) => audit.workspaceMemberId === WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
  ),
  CHARLES: MKT_PERMISSION_AUDIT_DATA_SEEDS.filter(
    (audit) => audit.workspaceMemberId === WORKSPACE_MEMBER_DATA_SEED_IDS.PHIL,
  ),
  PHIL: MKT_PERMISSION_AUDIT_DATA_SEEDS.filter(
    (audit) => audit.workspaceMemberId === WORKSPACE_MEMBER_DATA_SEED_IDS.PHIL,
  ),
  TIM: MKT_PERMISSION_AUDIT_DATA_SEEDS.filter(
    (audit) => audit.workspaceMemberId === WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
  ),
};
