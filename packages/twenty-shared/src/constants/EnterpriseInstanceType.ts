export const ENTERPRISE_INSTANCE_TYPE = {
  PRODUCTION: 'production',
  DEVELOPMENT: 'development',
} as const;

export type EnterpriseInstanceType =
  (typeof ENTERPRISE_INSTANCE_TYPE)[keyof typeof ENTERPRISE_INSTANCE_TYPE];
