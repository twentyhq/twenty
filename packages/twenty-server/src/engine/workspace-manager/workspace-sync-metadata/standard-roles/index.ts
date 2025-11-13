import { ADMIN_ROLE } from './roles/admin-role';
import { DATA_MANIPULATOR_ROLE } from './roles/data-manipulator-role';
import { WORKFLOW_MANAGER_ROLE } from './roles/workflow-manager-role';
import { type StandardRoleDefinition } from './types/standard-role-definition.interface';

export const standardRoleDefinitions = [
  ADMIN_ROLE,
  WORKFLOW_MANAGER_ROLE,
  DATA_MANIPULATOR_ROLE,
] as const satisfies StandardRoleDefinition[];
