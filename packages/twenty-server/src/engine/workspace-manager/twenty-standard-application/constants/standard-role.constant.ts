import { ADMIN_ROLE } from 'src/engine/workspace-manager/workspace-sync-metadata/standard-roles/roles/admin-role';
import { DASHBOARD_MANAGER_ROLE } from 'src/engine/workspace-manager/workspace-sync-metadata/standard-roles/roles/dashboard-manager-role';
import { DATA_MANIPULATOR_ROLE } from 'src/engine/workspace-manager/workspace-sync-metadata/standard-roles/roles/data-manipulator-role';
import { DATA_MODEL_MANAGER_ROLE } from 'src/engine/workspace-manager/workspace-sync-metadata/standard-roles/roles/data-model-manager-role';
import { WORKFLOW_MANAGER_ROLE } from 'src/engine/workspace-manager/workspace-sync-metadata/standard-roles/roles/workflow-manager-role';

export const STANDARD_ROLE = {
  admin: { universalIdentifier: ADMIN_ROLE.standardId },
  dashboardManager: { universalIdentifier: DASHBOARD_MANAGER_ROLE.standardId },
  dataManipulator: { universalIdentifier: DATA_MANIPULATOR_ROLE.standardId },
  dataModelManager: { universalIdentifier: DATA_MODEL_MANAGER_ROLE.standardId },
  workflowManager: { universalIdentifier: WORKFLOW_MANAGER_ROLE.standardId },
} as const satisfies Record<string, { universalIdentifier: string }>;
