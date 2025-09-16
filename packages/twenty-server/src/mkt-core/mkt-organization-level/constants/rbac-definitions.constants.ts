// RBAC Resource Definitions
export const RBAC_RESOURCES = {
  // Customer Management
  CUSTOMERS: 'customers',
  CUSTOMER_TAGS: 'customer_tags',
  CUSTOMER_HISTORY: 'customer_history',

  // Order Management
  ORDERS: 'orders',
  ORDER_ITEMS: 'order_items',
  CONTRACTS: 'contracts',
  INVOICES: 'invoices',

  // Product Management
  PRODUCTS: 'products',
  VARIANTS: 'variants',
  ATTRIBUTES: 'attributes',
  COMBOS: 'combos',

  // Reports & Analytics
  REPORTS: 'reports',
  DASHBOARDS: 'dashboards',
  KPI_TEMPLATES: 'kpi_templates',
  KPIS: 'kpis',
  ANALYTICS: 'analytics',

  // System Management
  SETTINGS: 'settings',
  USERS: 'users',
  DEPARTMENTS: 'departments',
  ORGANIZATION_LEVELS: 'organization_levels',

  // Financial Data
  FINANCIAL_DATA: 'financial_data',
  BUDGET: 'budget',
  PROFIT_LOSS: 'profit_loss',

  // HR & Personnel
  HR_DATA: 'hr_data',
  PERSONNEL_RECORDS: 'personnel_records',
  EMPLOYMENT_STATUS: 'employment_status',

  // Audit & Compliance
  AUDIT_LOGS: 'audit_logs',
  PERMISSION_AUDITS: 'permission_audits',
  COMPLIANCE_REPORTS: 'compliance_reports',
} as const;

// RBAC Action Definitions
export const RBAC_ACTIONS = {
  // Basic CRUD operations
  READ: 'read',
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',

  // Advanced operations
  EXPORT: 'export',
  IMPORT: 'import',
  SHARE: 'share',
  PUBLISH: 'publish',

  // Approval operations
  APPROVE: 'approve',
  REJECT: 'reject',
  ESCALATE: 'escalate',

  // Bulk operations
  BULK_UPDATE: 'bulk_update',
  BULK_DELETE: 'bulk_delete',
  BULK_EXPORT: 'bulk_export',

  // Administrative operations
  CONFIGURE: 'configure',
  MANAGE_PERMISSIONS: 'manage_permissions',
  SYSTEM_ADMIN: 'system_admin',
} as const;

// RBAC System Actions (high-level capabilities)
export const RBAC_SYSTEM_ACTIONS = {
  // Data operations
  DATA_EXPORT: 'data_export',
  DATA_IMPORT: 'data_import',
  BULK_OPERATIONS: 'bulk_operations',

  // Administrative functions
  ADMIN_FUNCTIONS: 'admin_functions',
  SYSTEM_CONFIGURATION: 'system_configuration',
  USER_MANAGEMENT: 'user_management',

  // Cross-functional access
  CROSS_DEPARTMENT_VIEW: 'cross_department_view',
  CROSS_DEPARTMENT_EDIT: 'cross_department_edit',

  // Approval powers
  ESCALATION_APPROVE: 'escalation_approve',
  BUDGET_APPROVE: 'budget_approve',
  CONTRACT_APPROVE: 'contract_approve',

  // Security & Compliance
  AUDIT_VIEW: 'audit_view',
  COMPLIANCE_MANAGE: 'compliance_manage',
  SECURITY_OVERRIDE: 'security_override',
} as const;

// RBAC Restriction Keys
export const RBAC_RESTRICTIONS = {
  // Query limitations
  MAX_RECORDS_PER_QUERY: 'max_records_per_query',
  MAX_EXPORT_SIZE: 'max_export_size',
  MAX_IMPORT_SIZE: 'max_import_size',

  // Time-based restrictions
  WORKING_HOURS_ONLY: 'working_hours_only',
  SESSION_TIMEOUT: 'session_timeout',
  MAX_DAILY_HOURS: 'max_daily_hours',

  // Approval requirements
  APPROVAL_REQUIRED: 'approval_required',
  SUPERVISOR_APPROVAL: 'supervisor_approval',
  MANAGER_APPROVAL: 'manager_approval',

  // Data access restrictions
  OWN_RECORDS_ONLY: 'own_records_only',
  DEPARTMENT_RECORDS_ONLY: 'department_records_only',
  TEAM_RECORDS_ONLY: 'team_records_only',

  // Security restrictions
  REQUIRE_2FA: 'require_2fa',
  IP_RESTRICTIONS: 'ip_restrictions',
  VPN_REQUIRED: 'vpn_required',
} as const;

// Sensitive Fields that require special protection
export const SENSITIVE_FIELDS = {
  // Personal Information
  PERSONAL_ID: 'personal_id',
  SOCIAL_SECURITY: 'social_security',
  PASSPORT_NUMBER: 'passport_number',
  PHONE_PERSONAL: 'phone_personal',

  // Financial Information
  SALARY: 'salary',
  BANK_ACCOUNT: 'bank_account',
  CREDIT_CARD: 'credit_card',
  TAX_ID: 'tax_id',

  // Business Financial Data
  PROFIT_MARGIN: 'profit_margin',
  COST: 'cost',
  REVENUE: 'revenue',
  COMMISSION: 'commission',

  // Strategic Information
  PRICING_STRATEGY: 'pricing_strategy',
  BUSINESS_PLAN: 'business_plan',
  COMPETITOR_DATA: 'competitor_data',

  // Authentication & Security
  PASSWORD: 'password',
  API_KEY: 'api_key',
  ACCESS_TOKEN: 'access_token',
} as const;

// Department Categories for access control
export const DEPARTMENT_CATEGORIES = {
  // Core Business
  SALES: 'sales',
  MARKETING: 'marketing',
  CUSTOMER_SERVICE: 'customer_service',
  OPERATIONS: 'operations',

  // Support Functions
  HR: 'hr',
  FINANCE: 'finance',
  LEGAL: 'legal',
  IT: 'it',

  // Management
  EXECUTIVE: 'executive',
  MANAGEMENT: 'management',
  ADMIN: 'admin',

  // Specialized
  COMPLIANCE: 'compliance',
  AUDIT: 'audit',
  SECURITY: 'security',
} as const;

// Blocked Actions for different levels
export const COMMON_BLOCKED_ACTIONS = {
  INTERN: [
    'delete_any_record',
    'modify_any_record',
    'export_data',
    'create_reports',
    'approve_anything',
    'escalate_to_external',
    'system_configuration',
    'user_management',
  ],

  STAFF: [
    'delete_any_record',
    'bulk_operations',
    'admin_functions',
    'export_data',
    'system_configuration',
    'user_management',
    'approve_contracts',
  ],

  SENIOR_STAFF: [
    'delete_users',
    'system_configuration',
    'budget_approve',
    'admin_functions',
    'cross_department_manage',
  ],

  TEAM_LEAD: [
    'delete_users',
    'system_configuration',
    'budget_approve',
    'cross_department_manage',
    'financial_admin',
  ],

  MANAGER: ['delete_user_accounts', 'system_configuration', 'database_admin'],

  DIRECTOR: ['system_shutdown', 'database_reset'],
} as const;

// Actions requiring approval by level
export const APPROVAL_REQUIRED_ACTIONS = {
  INTERN: [
    'create_customer',
    'update_customer_info',
    'access_customer_history',
    'view_reports',
    'contact_customers',
    'access_any_data',
  ],

  STAFF: [
    'create_high_value_customer',
    'update_important_data',
    'access_historical_data',
    'export_customer_data',
    'cross_department_access',
  ],

  SENIOR_STAFF: [
    'team_data_access',
    'escalate_issues',
    'approve_small_orders',
    'customer_refunds',
  ],

  TEAM_LEAD: [
    'department_budget_view',
    'hire_team_members',
    'performance_reviews',
    'escalate_to_management',
  ],

  MANAGER: [
    'large_data_export',
    'department_budget_changes',
    'cross_department_initiatives',
    'strategic_decisions',
  ],

  DIRECTOR: [
    'system_shutdown',
    'database_backup',
    'company_wide_changes',
    'legal_commitments',
  ],
} as const;

// Escalation required scenarios
export const ESCALATION_REQUIRED = {
  INTERN: [
    'any_financial_data',
    'customer_complaints',
    'system_errors',
    'data_access_outside_scope',
    'unusual_activity',
    'security_incidents',
  ],

  STAFF: [
    'customer_complaints',
    'data_discrepancies',
    'system_errors',
    'financial_irregularities',
    'compliance_issues',
  ],

  SENIOR_STAFF: [
    'financial_data',
    'hr_issues',
    'legal_matters',
    'system_failures',
    'security_breaches',
  ],

  TEAM_LEAD: [
    'financial_data',
    'hr_issues',
    'cross_department_conflicts',
    'major_system_issues',
    'compliance_violations',
  ],

  MANAGER: [
    'hr_data_access',
    'legal_issues',
    'major_financial_decisions',
    'strategic_changes',
  ],

  DIRECTOR: [
    'regulatory_investigations',
    'major_security_breaches',
    'company_critical_issues',
  ],
} as const;

// Type definitions for better type safety
export type RbacResource = (typeof RBAC_RESOURCES)[keyof typeof RBAC_RESOURCES];
export type RbacAction = (typeof RBAC_ACTIONS)[keyof typeof RBAC_ACTIONS];
export type RbacSystemAction =
  (typeof RBAC_SYSTEM_ACTIONS)[keyof typeof RBAC_SYSTEM_ACTIONS];
export type RbacRestriction =
  (typeof RBAC_RESTRICTIONS)[keyof typeof RBAC_RESTRICTIONS];
export type SensitiveField =
  (typeof SENSITIVE_FIELDS)[keyof typeof SENSITIVE_FIELDS];
export type DepartmentCategory =
  (typeof DEPARTMENT_CATEGORIES)[keyof typeof DEPARTMENT_CATEGORIES];
