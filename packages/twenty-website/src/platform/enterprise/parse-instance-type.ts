import {
  ENTERPRISE_INSTANCE_TYPE,
  type EnterpriseInstanceType,
} from './enterprise-instance-type';

export function parseInstanceType(value?: string): EnterpriseInstanceType {
  return value === ENTERPRISE_INSTANCE_TYPE.DEVELOPMENT
    ? ENTERPRISE_INSTANCE_TYPE.DEVELOPMENT
    : ENTERPRISE_INSTANCE_TYPE.PRODUCTION;
}
