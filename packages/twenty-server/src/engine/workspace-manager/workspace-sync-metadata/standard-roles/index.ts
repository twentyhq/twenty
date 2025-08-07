import { adminRole } from './roles/admin-role';
import { memberRole } from './roles/member-role';
import { StandardRoleDefinition } from './types/standard-role-definition.interface';

export const standardRoleDefinitions = [
  adminRole,
  memberRole,
] as const satisfies StandardRoleDefinition[];
