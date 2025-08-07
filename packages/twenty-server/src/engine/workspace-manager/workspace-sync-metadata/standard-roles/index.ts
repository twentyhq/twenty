import { ADMIN_ROLE } from './roles/admin-role';
import { StandardRoleDefinition } from './types/standard-role-definition.interface';

export const standardRoleDefinitions = [
  ADMIN_ROLE,
] as const satisfies StandardRoleDefinition[];
