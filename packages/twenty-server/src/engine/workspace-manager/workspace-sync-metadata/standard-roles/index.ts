import { ADMIN_ROLE } from './roles/admin-role';
import { MEMBER_ROLE } from './roles/member-role';
import { StandardRoleDefinition } from './types/standard-role-definition.interface';

export const standardRoleDefinitions = [
  ADMIN_ROLE,
  MEMBER_ROLE,
] as const satisfies StandardRoleDefinition[];
