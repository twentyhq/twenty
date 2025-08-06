import adminRole from './roles/admin-role.json';
import guestRole from './roles/guest-role.json';
import memberRole from './roles/member-role.json';
import { StandardRoleDefinition } from './types/standard-role-definition.interface';

export const standardRoleDefinitions: StandardRoleDefinition[] = [
  adminRole,
  memberRole,
  guestRole,
];

export * from './types/standard-role-definition.interface';
