import {
  ENTERPRISE_INSTANCE_TYPE,
  type EnterpriseInstanceType,
} from './enterprise-instance-type';

// Validity token emissions are rate-limited independently per instance type,
// so each type gets its own timestamps bucket in the Stripe metadata.
export const VALIDITY_TOKEN_EMISSIONS_KEY_BY_INSTANCE_TYPE = {
  [ENTERPRISE_INSTANCE_TYPE.PRODUCTION]: 'validityTokenEmissionsProduction',
  [ENTERPRISE_INSTANCE_TYPE.DEVELOPMENT]: 'validityTokenEmissionsDevelopment',
} as const satisfies Record<EnterpriseInstanceType, string>;
