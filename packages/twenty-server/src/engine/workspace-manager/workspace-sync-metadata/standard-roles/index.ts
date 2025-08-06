import adminRole from './roles/admin-role.json';
import guestRole from './roles/guest-role.json';
import memberRole from './roles/member-role.json';
import { StandardRoleDefinition } from './types/standard-role-definition.interface';

export const standardRoleDefinitions: StandardRoleDefinition[] = [
  adminRole as StandardRoleDefinition,
  memberRole as StandardRoleDefinition,
  guestRole as StandardRoleDefinition,
];

export * from './types/standard-role-definition.interface';
