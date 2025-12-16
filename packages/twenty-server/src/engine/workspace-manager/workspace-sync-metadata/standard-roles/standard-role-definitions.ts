import { ADMIN_ROLE } from './roles/admin-role';
import { type StandardRoleDefinition } from './types/standard-role-definition.interface';

export const STANDARD_ROLE_DEFINITIONS = [
  ADMIN_ROLE,
] as const satisfies StandardRoleDefinition[];
