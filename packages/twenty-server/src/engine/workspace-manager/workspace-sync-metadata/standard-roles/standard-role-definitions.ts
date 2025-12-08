import { ADMIN_ROLE } from './roles/admin-role';
import { DASHBOARD_MANAGER_ROLE } from './roles/dashboard-manager-role';
import { DATA_MANIPULATOR_ROLE } from './roles/data-manipulator-role';
import { DATA_MODEL_MANAGER_ROLE } from './roles/data-model-manager-role';
import { WORKFLOW_MANAGER_ROLE } from './roles/workflow-manager-role';
import { type StandardRoleDefinition } from './types/standard-role-definition.interface';

export const STANDARD_ROLE_DEFINITIONS = [
  ADMIN_ROLE,
  WORKFLOW_MANAGER_ROLE,
  DATA_MANIPULATOR_ROLE,
  DASHBOARD_MANAGER_ROLE,
  DATA_MODEL_MANAGER_ROLE,
] as const satisfies StandardRoleDefinition[];
