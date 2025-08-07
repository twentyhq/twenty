import { adminRole } from './roles/admin-role';
import { guestRole } from './roles/guest-role';
import { memberRole } from './roles/member-role';
import { StandardRoleDefinition } from './types/standard-role-definition.interface';

export const standardRoleDefinitions = [
  adminRole,
  memberRole,
  guestRole,
] as const satisfies StandardRoleDefinition[];
