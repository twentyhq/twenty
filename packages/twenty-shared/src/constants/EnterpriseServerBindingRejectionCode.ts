// Machine codes returned when a server binding is refused, shared so the
// self-hosted server, the admin UI and twenty.com match on the same strings.
export const ENTERPRISE_SERVER_BINDING_REJECTION_CODE = {
  BOUND_TO_ANOTHER_SERVER: 'ENTERPRISE_KEY_BOUND_TO_ANOTHER_SERVER',
  MISSING_SERVER_ID: 'ENTERPRISE_MISSING_SERVER_ID',
  DEV_REQUIRES_ACTIVE_PRODUCTION: 'ENTERPRISE_DEV_REQUIRES_ACTIVE_PRODUCTION',
  DEV_SLOT_IN_USE: 'ENTERPRISE_DEV_SLOT_IN_USE',
} as const;

export type EnterpriseServerBindingRejectionCode =
  (typeof ENTERPRISE_SERVER_BINDING_REJECTION_CODE)[keyof typeof ENTERPRISE_SERVER_BINDING_REJECTION_CODE];
