import adminRole from './roles/admin-role.json';
import memberRole from './roles/member-role.json';
import { StandardRoleDefinition } from './types/standard-role-definition.interface';
export const standardRoleDefinitions = [
  adminRole,
  memberRole,
] as const satisfies StandardRoleDefinition[];
