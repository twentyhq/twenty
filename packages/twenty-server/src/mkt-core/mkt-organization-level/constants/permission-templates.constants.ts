import {
  AccessLimitations,
  DefaultPermissions,
} from 'src/mkt-core/mkt-organization-level/types';

import {
  RBAC_RESOURCES,
  RBAC_ACTIONS,
  RBAC_SYSTEM_ACTIONS,
  RBAC_RESTRICTIONS,
  SENSITIVE_FIELDS,
  DEPARTMENT_CATEGORIES,
  COMMON_BLOCKED_ACTIONS,
  APPROVAL_REQUIRED_ACTIONS,
  ESCALATION_REQUIRED,
} from './rbac-definitions.constants';

// Permission Templates for each Organization Level
export const PERMISSION_TEMPLATES = {
  DIRECTOR: {
    defaultPermissions: {
      resources: {
        [RBAC_RESOURCES.CUSTOMERS]: [
          RBAC_ACTIONS.READ,
          RBAC_ACTIONS.CREATE,
          RBAC_ACTIONS.UPDATE,
          RBAC_ACTIONS.DELETE,
          RBAC_ACTIONS.EXPORT,
        ],
        [RBAC_RESOURCES.ORDERS]: [
          RBAC_ACTIONS.READ,
          RBAC_ACTIONS.CREATE,
          RBAC_ACTIONS.UPDATE,
          RBAC_ACTIONS.DELETE,
          RBAC_ACTIONS.APPROVE,
        ],
        [RBAC_RESOURCES.PRODUCTS]: [
          RBAC_ACTIONS.READ,
          RBAC_ACTIONS.CREATE,
          RBAC_ACTIONS.UPDATE,
          RBAC_ACTIONS.DELETE,
          RBAC_ACTIONS.CONFIGURE,
        ],
        [RBAC_RESOURCES.REPORTS]: [
          RBAC_ACTIONS.READ,
          RBAC_ACTIONS.CREATE,
          RBAC_ACTIONS.EXPORT,
          RBAC_ACTIONS.SHARE,
          RBAC_ACTIONS.PUBLISH,
        ],
        [RBAC_RESOURCES.SETTINGS]: [
          RBAC_ACTIONS.READ,
          RBAC_ACTIONS.UPDATE,
          RBAC_ACTIONS.CONFIGURE,
        ],
        [RBAC_RESOURCES.USERS]: [
          RBAC_ACTIONS.READ,
          RBAC_ACTIONS.CREATE,
          RBAC_ACTIONS.UPDATE,
        ],
        [RBAC_RESOURCES.DEPARTMENTS]: [
          RBAC_ACTIONS.READ,
          RBAC_ACTIONS.CREATE,
          RBAC_ACTIONS.UPDATE,
        ],
        [RBAC_RESOURCES.KPIS]: [
          RBAC_ACTIONS.READ,
          RBAC_ACTIONS.CREATE,
          RBAC_ACTIONS.UPDATE,
          RBAC_ACTIONS.DELETE,
        ],
        [RBAC_RESOURCES.FINANCIAL_DATA]: [
          RBAC_ACTIONS.READ,
          RBAC_ACTIONS.CREATE,
          RBAC_ACTIONS.UPDATE,
          RBAC_ACTIONS.DELETE,
        ],
      },
      actions: {
        [RBAC_SYSTEM_ACTIONS.DATA_EXPORT]: true,
        [RBAC_SYSTEM_ACTIONS.BULK_OPERATIONS]: true,
        [RBAC_SYSTEM_ACTIONS.ADMIN_FUNCTIONS]: true,
        [RBAC_SYSTEM_ACTIONS.CROSS_DEPARTMENT_VIEW]: true,
        [RBAC_SYSTEM_ACTIONS.ESCALATION_APPROVE]: true,
        [RBAC_SYSTEM_ACTIONS.BUDGET_APPROVE]: true,
        [RBAC_SYSTEM_ACTIONS.SYSTEM_CONFIGURATION]: true,
        [RBAC_SYSTEM_ACTIONS.USER_MANAGEMENT]: true,
      },
      restrictions: {
        [RBAC_RESTRICTIONS.MAX_RECORDS_PER_QUERY]: -1, // unlimited
        [RBAC_RESTRICTIONS.MAX_EXPORT_SIZE]: -1, // unlimited
        [RBAC_RESTRICTIONS.WORKING_HOURS_ONLY]: false,
        [RBAC_RESTRICTIONS.APPROVAL_REQUIRED]: false,
      },
    } as DefaultPermissions,

    accessLimitations: {
      temporal: {
        working_hours: {
          enabled: false,
        },
        session_timeout: 14400, // 4 hours
      },
      data_access: {
        sensitive_fields: [], // Full access
        restricted_departments: [], // Full access
        data_retention_days: -1, // unlimited
      },
      operational: {
        max_concurrent_sessions: -1, // unlimited
        ip_restrictions: [],
        require_2fa: true,
        audit_all_actions: true,
      },
      functional: {
        blocked_actions: COMMON_BLOCKED_ACTIONS.DIRECTOR,
        require_approval: APPROVAL_REQUIRED_ACTIONS.DIRECTOR,
        escalation_required: ESCALATION_REQUIRED.DIRECTOR,
      },
    } as AccessLimitations,
  },

  MANAGER: {
    defaultPermissions: {
      resources: {
        [RBAC_RESOURCES.CUSTOMERS]: [
          RBAC_ACTIONS.READ,
          RBAC_ACTIONS.CREATE,
          RBAC_ACTIONS.UPDATE,
        ],
        [RBAC_RESOURCES.ORDERS]: [
          RBAC_ACTIONS.READ,
          RBAC_ACTIONS.CREATE,
          RBAC_ACTIONS.UPDATE,
        ],
        [RBAC_RESOURCES.PRODUCTS]: [RBAC_ACTIONS.READ, RBAC_ACTIONS.UPDATE],
        [RBAC_RESOURCES.REPORTS]: [
          RBAC_ACTIONS.READ,
          RBAC_ACTIONS.CREATE,
          RBAC_ACTIONS.EXPORT,
        ],
        [RBAC_RESOURCES.SETTINGS]: [],
        [RBAC_RESOURCES.USERS]: [RBAC_ACTIONS.READ],
        [RBAC_RESOURCES.DEPARTMENTS]: [RBAC_ACTIONS.READ],
        [RBAC_RESOURCES.KPIS]: [
          RBAC_ACTIONS.READ,
          RBAC_ACTIONS.CREATE,
          RBAC_ACTIONS.UPDATE,
        ],
      },
      actions: {
        [RBAC_SYSTEM_ACTIONS.DATA_EXPORT]: true,
        [RBAC_SYSTEM_ACTIONS.BULK_OPERATIONS]: true,
        [RBAC_SYSTEM_ACTIONS.ADMIN_FUNCTIONS]: false,
        [RBAC_SYSTEM_ACTIONS.CROSS_DEPARTMENT_VIEW]: false,
        [RBAC_SYSTEM_ACTIONS.ESCALATION_APPROVE]: false,
        [RBAC_SYSTEM_ACTIONS.BUDGET_APPROVE]: false,
      },
      restrictions: {
        [RBAC_RESTRICTIONS.MAX_RECORDS_PER_QUERY]: 5000,
        [RBAC_RESTRICTIONS.MAX_EXPORT_SIZE]: 100000,
        [RBAC_RESTRICTIONS.WORKING_HOURS_ONLY]: false,
        [RBAC_RESTRICTIONS.APPROVAL_REQUIRED]: false,
      },
    } as DefaultPermissions,

    accessLimitations: {
      temporal: {
        working_hours: {
          enabled: true,
          start: '07:00',
          end: '20:00',
          timezone: 'Asia/Ho_Chi_Minh',
          weekdays_only: false,
        },
        session_timeout: 7200, // 2 hours
      },
      data_access: {
        sensitive_fields: [
          SENSITIVE_FIELDS.PERSONAL_ID,
          SENSITIVE_FIELDS.BANK_ACCOUNT,
        ],
        restricted_departments: [DEPARTMENT_CATEGORIES.HR],
        data_retention_days: 180,
      },
      operational: {
        max_concurrent_sessions: 5,
        ip_restrictions: [],
        require_2fa: true,
        audit_all_actions: true,
      },
      functional: {
        blocked_actions: COMMON_BLOCKED_ACTIONS.MANAGER,
        require_approval: APPROVAL_REQUIRED_ACTIONS.MANAGER,
        escalation_required: ESCALATION_REQUIRED.MANAGER,
      },
    } as AccessLimitations,
  },

  TEAM_LEAD: {
    defaultPermissions: {
      resources: {
        [RBAC_RESOURCES.CUSTOMERS]: [
          RBAC_ACTIONS.READ,
          RBAC_ACTIONS.CREATE,
          RBAC_ACTIONS.UPDATE,
        ],
        [RBAC_RESOURCES.ORDERS]: [
          RBAC_ACTIONS.READ,
          RBAC_ACTIONS.CREATE,
          RBAC_ACTIONS.UPDATE,
        ],
        [RBAC_RESOURCES.PRODUCTS]: [RBAC_ACTIONS.READ],
        [RBAC_RESOURCES.REPORTS]: [RBAC_ACTIONS.READ],
        [RBAC_RESOURCES.SETTINGS]: [],
        [RBAC_RESOURCES.USERS]: [],
        [RBAC_RESOURCES.DEPARTMENTS]: [],
        [RBAC_RESOURCES.KPIS]: [RBAC_ACTIONS.READ],
      },
      actions: {
        [RBAC_SYSTEM_ACTIONS.DATA_EXPORT]: false,
        [RBAC_SYSTEM_ACTIONS.BULK_OPERATIONS]: false,
        [RBAC_SYSTEM_ACTIONS.ADMIN_FUNCTIONS]: false,
        [RBAC_SYSTEM_ACTIONS.CROSS_DEPARTMENT_VIEW]: false,
        [RBAC_SYSTEM_ACTIONS.ESCALATION_APPROVE]: false,
        [RBAC_SYSTEM_ACTIONS.BUDGET_APPROVE]: false,
      },
      restrictions: {
        [RBAC_RESTRICTIONS.MAX_RECORDS_PER_QUERY]: 2000,
        [RBAC_RESTRICTIONS.MAX_EXPORT_SIZE]: 20000,
        [RBAC_RESTRICTIONS.WORKING_HOURS_ONLY]: true,
        [RBAC_RESTRICTIONS.APPROVAL_REQUIRED]: true,
      },
    } as DefaultPermissions,

    accessLimitations: {
      temporal: {
        working_hours: {
          enabled: true,
          start: '08:00',
          end: '18:00',
          timezone: 'Asia/Ho_Chi_Minh',
          weekdays_only: true,
        },
        session_timeout: 5400, // 1.5 hours
      },
      data_access: {
        sensitive_fields: [
          SENSITIVE_FIELDS.SALARY,
          SENSITIVE_FIELDS.PERSONAL_ID,
          SENSITIVE_FIELDS.BANK_ACCOUNT,
        ],
        restricted_departments: [
          DEPARTMENT_CATEGORIES.HR,
          DEPARTMENT_CATEGORIES.FINANCE,
          DEPARTMENT_CATEGORIES.EXECUTIVE,
        ],
        data_retention_days: 90,
      },
      operational: {
        max_concurrent_sessions: 3,
        ip_restrictions: ['192.168.1.0/24'],
        require_2fa: false,
        audit_all_actions: true,
      },
      functional: {
        blocked_actions: COMMON_BLOCKED_ACTIONS.TEAM_LEAD,
        require_approval: APPROVAL_REQUIRED_ACTIONS.TEAM_LEAD,
        escalation_required: ESCALATION_REQUIRED.TEAM_LEAD,
      },
    } as AccessLimitations,
  },

  SENIOR_STAFF: {
    defaultPermissions: {
      resources: {
        [RBAC_RESOURCES.CUSTOMERS]: [RBAC_ACTIONS.READ, RBAC_ACTIONS.CREATE],
        [RBAC_RESOURCES.ORDERS]: [RBAC_ACTIONS.READ, RBAC_ACTIONS.CREATE],
        [RBAC_RESOURCES.PRODUCTS]: [RBAC_ACTIONS.READ],
        [RBAC_RESOURCES.REPORTS]: [],
        [RBAC_RESOURCES.SETTINGS]: [],
        [RBAC_RESOURCES.USERS]: [],
        [RBAC_RESOURCES.DEPARTMENTS]: [],
        [RBAC_RESOURCES.KPIS]: [RBAC_ACTIONS.READ],
      },
      actions: {
        [RBAC_SYSTEM_ACTIONS.DATA_EXPORT]: false,
        [RBAC_SYSTEM_ACTIONS.BULK_OPERATIONS]: false,
        [RBAC_SYSTEM_ACTIONS.ADMIN_FUNCTIONS]: false,
        [RBAC_SYSTEM_ACTIONS.CROSS_DEPARTMENT_VIEW]: false,
        [RBAC_SYSTEM_ACTIONS.ESCALATION_APPROVE]: false,
        [RBAC_SYSTEM_ACTIONS.BUDGET_APPROVE]: false,
      },
      restrictions: {
        [RBAC_RESTRICTIONS.MAX_RECORDS_PER_QUERY]: 1000,
        [RBAC_RESTRICTIONS.MAX_EXPORT_SIZE]: 10000,
        [RBAC_RESTRICTIONS.WORKING_HOURS_ONLY]: true,
        [RBAC_RESTRICTIONS.APPROVAL_REQUIRED]: true,
      },
    } as DefaultPermissions,

    accessLimitations: {
      temporal: {
        working_hours: {
          enabled: true,
          start: '08:00',
          end: '18:00',
          timezone: 'Asia/Ho_Chi_Minh',
          weekdays_only: true,
        },
        session_timeout: 3600, // 1 hour
        max_daily_hours: 8,
      },
      data_access: {
        sensitive_fields: [
          SENSITIVE_FIELDS.SALARY,
          SENSITIVE_FIELDS.PERSONAL_ID,
          SENSITIVE_FIELDS.BANK_ACCOUNT,
          SENSITIVE_FIELDS.PROFIT_MARGIN,
        ],
        restricted_departments: [
          DEPARTMENT_CATEGORIES.HR,
          DEPARTMENT_CATEGORIES.FINANCE,
          DEPARTMENT_CATEGORIES.EXECUTIVE,
        ],
        data_retention_days: 60,
      },
      operational: {
        max_concurrent_sessions: 2,
        ip_restrictions: ['192.168.1.0/24'],
        require_2fa: false,
        audit_all_actions: true,
      },
      functional: {
        blocked_actions: COMMON_BLOCKED_ACTIONS.SENIOR_STAFF,
        require_approval: APPROVAL_REQUIRED_ACTIONS.SENIOR_STAFF,
        escalation_required: ESCALATION_REQUIRED.SENIOR_STAFF,
      },
    } as AccessLimitations,
  },

  JUNIOR_STAFF: {
    defaultPermissions: {
      resources: {
        [RBAC_RESOURCES.CUSTOMERS]: [RBAC_ACTIONS.READ],
        [RBAC_RESOURCES.ORDERS]: [RBAC_ACTIONS.READ],
        [RBAC_RESOURCES.PRODUCTS]: [RBAC_ACTIONS.READ],
        [RBAC_RESOURCES.REPORTS]: [],
        [RBAC_RESOURCES.SETTINGS]: [],
        [RBAC_RESOURCES.USERS]: [],
        [RBAC_RESOURCES.DEPARTMENTS]: [],
        [RBAC_RESOURCES.KPIS]: [],
      },
      actions: {
        [RBAC_SYSTEM_ACTIONS.DATA_EXPORT]: false,
        [RBAC_SYSTEM_ACTIONS.BULK_OPERATIONS]: false,
        [RBAC_SYSTEM_ACTIONS.ADMIN_FUNCTIONS]: false,
        [RBAC_SYSTEM_ACTIONS.CROSS_DEPARTMENT_VIEW]: false,
        [RBAC_SYSTEM_ACTIONS.ESCALATION_APPROVE]: false,
        [RBAC_SYSTEM_ACTIONS.BUDGET_APPROVE]: false,
      },
      restrictions: {
        [RBAC_RESTRICTIONS.MAX_RECORDS_PER_QUERY]: 500,
        [RBAC_RESTRICTIONS.MAX_EXPORT_SIZE]: 0, // no export
        [RBAC_RESTRICTIONS.WORKING_HOURS_ONLY]: true,
        [RBAC_RESTRICTIONS.APPROVAL_REQUIRED]: true,
      },
    } as DefaultPermissions,

    accessLimitations: {
      temporal: {
        working_hours: {
          enabled: true,
          start: '08:30',
          end: '17:30',
          timezone: 'Asia/Ho_Chi_Minh',
          weekdays_only: true,
        },
        session_timeout: 1800, // 30 minutes
        max_daily_hours: 6,
        break_required: true,
      },
      data_access: {
        sensitive_fields: [
          SENSITIVE_FIELDS.SALARY,
          SENSITIVE_FIELDS.PERSONAL_ID,
          SENSITIVE_FIELDS.BANK_ACCOUNT,
          SENSITIVE_FIELDS.PROFIT_MARGIN,
          SENSITIVE_FIELDS.COST,
          SENSITIVE_FIELDS.REVENUE,
        ],
        restricted_departments: [
          DEPARTMENT_CATEGORIES.HR,
          DEPARTMENT_CATEGORIES.FINANCE,
          DEPARTMENT_CATEGORIES.EXECUTIVE,
          DEPARTMENT_CATEGORIES.LEGAL,
        ],
        data_retention_days: 30,
        own_records_only: true,
        supervisor_approval_required: true,
      },
      operational: {
        max_concurrent_sessions: 1,
        ip_restrictions: ['192.168.1.100/32'],
        require_2fa: false,
        audit_all_actions: true,
        supervisor_oversight: true,
        screen_recording: true,
      },
      functional: {
        blocked_actions: COMMON_BLOCKED_ACTIONS.INTERN,
        require_approval: APPROVAL_REQUIRED_ACTIONS.INTERN,
        escalation_required: ESCALATION_REQUIRED.INTERN,
      },
    } as AccessLimitations,
  },
} as const;
