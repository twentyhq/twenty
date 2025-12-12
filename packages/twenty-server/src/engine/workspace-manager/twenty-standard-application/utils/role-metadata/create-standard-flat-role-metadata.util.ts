import { type FlatRole } from 'src/engine/metadata-modules/flat-role/types/flat-role.type';
import { STANDARD_ROLE } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-role.constant';
import { type AllStandardRoleName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-role-name.type';
import {
  type CreateStandardRoleArgs,
  createStandardRoleFlatMetadata,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/role-metadata/create-standard-role-flat-metadata.util';

export const STANDARD_FLAT_ROLE_METADATA_BUILDERS_BY_ROLE_NAME = {
  admin: (args: Omit<CreateStandardRoleArgs, 'context'>) =>
    createStandardRoleFlatMetadata({
      ...args,
      context: {
        roleName: 'admin',
        universalIdentifier: STANDARD_ROLE.admin.universalIdentifier,
        standardId: STANDARD_ROLE.admin.universalIdentifier,
        label: 'Admin',
        description: 'Admin role',
        icon: 'IconUserCog',
        isEditable: false,
        canUpdateAllSettings: true,
        canAccessAllTools: true,
        canReadAllObjectRecords: true,
        canUpdateAllObjectRecords: true,
        canSoftDeleteAllObjectRecords: true,
        canDestroyAllObjectRecords: true,
        canBeAssignedToUsers: true,
        canBeAssignedToAgents: false,
        canBeAssignedToApiKeys: true,
        canBeAssignedToApplications: false,
      },
    }),
  dashboardManager: (args: Omit<CreateStandardRoleArgs, 'context'>) =>
    createStandardRoleFlatMetadata({
      ...args,
      context: {
        roleName: 'dashboardManager',
        universalIdentifier: STANDARD_ROLE.dashboardManager.universalIdentifier,
        standardId: STANDARD_ROLE.dashboardManager.universalIdentifier,
        label: 'Dashboard Manager',
        description: 'Role for creating and managing dashboards',
        icon: 'IconLayoutDashboard',
        isEditable: false,
        canUpdateAllSettings: false,
        canAccessAllTools: false,
        canReadAllObjectRecords: true,
        canUpdateAllObjectRecords: true,
        canSoftDeleteAllObjectRecords: false,
        canDestroyAllObjectRecords: false,
        canBeAssignedToUsers: false,
        canBeAssignedToAgents: true,
        canBeAssignedToApiKeys: false,
        canBeAssignedToApplications: true,
      },
    }),
  dataManipulator: (args: Omit<CreateStandardRoleArgs, 'context'>) =>
    createStandardRoleFlatMetadata({
      ...args,
      context: {
        roleName: 'dataManipulator',
        universalIdentifier: STANDARD_ROLE.dataManipulator.universalIdentifier,
        standardId: STANDARD_ROLE.dataManipulator.universalIdentifier,
        label: 'Data Manipulator',
        description: 'Read and write access to all object records',
        icon: 'IconEdit',
        isEditable: false,
        canUpdateAllSettings: false,
        canAccessAllTools: false,
        canReadAllObjectRecords: true,
        canUpdateAllObjectRecords: true,
        canSoftDeleteAllObjectRecords: false,
        canDestroyAllObjectRecords: false,
        canBeAssignedToUsers: false,
        canBeAssignedToAgents: true,
        canBeAssignedToApiKeys: false,
        canBeAssignedToApplications: true,
      },
    }),
  dataModelManager: (args: Omit<CreateStandardRoleArgs, 'context'>) =>
    createStandardRoleFlatMetadata({
      ...args,
      context: {
        roleName: 'dataModelManager',
        universalIdentifier: STANDARD_ROLE.dataModelManager.universalIdentifier,
        standardId: STANDARD_ROLE.dataModelManager.universalIdentifier,
        label: 'Data Model Manager',
        description: 'Role for managing the workspace data model',
        icon: 'IconDatabaseEdit',
        isEditable: false,
        canUpdateAllSettings: false,
        canAccessAllTools: false,
        canReadAllObjectRecords: true,
        canUpdateAllObjectRecords: false,
        canSoftDeleteAllObjectRecords: false,
        canDestroyAllObjectRecords: false,
        canBeAssignedToUsers: false,
        canBeAssignedToAgents: true,
        canBeAssignedToApiKeys: false,
        canBeAssignedToApplications: true,
      },
    }),
  workflowManager: (args: Omit<CreateStandardRoleArgs, 'context'>) =>
    createStandardRoleFlatMetadata({
      ...args,
      context: {
        roleName: 'workflowManager',
        universalIdentifier: STANDARD_ROLE.workflowManager.universalIdentifier,
        standardId: STANDARD_ROLE.workflowManager.universalIdentifier,
        label: 'Workflow Manager',
        description: 'Role for managing workflows',
        icon: 'IconSettingsAutomation',
        isEditable: false,
        canUpdateAllSettings: false,
        canAccessAllTools: false,
        canReadAllObjectRecords: false,
        canUpdateAllObjectRecords: true,
        canSoftDeleteAllObjectRecords: false,
        canDestroyAllObjectRecords: false,
        canBeAssignedToUsers: false,
        canBeAssignedToAgents: true,
        canBeAssignedToApiKeys: false,
        canBeAssignedToApplications: true,
      },
    }),
} satisfies {
  [P in AllStandardRoleName]: (
    args: Omit<CreateStandardRoleArgs, 'context'>,
  ) => FlatRole;
};
