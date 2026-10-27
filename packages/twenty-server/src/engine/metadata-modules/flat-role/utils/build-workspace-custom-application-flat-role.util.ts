import { v4 } from 'uuid';

import {
  WORKSPACE_CUSTOM_APPLICATION_ROLE_LABEL,
  WORKSPACE_CUSTOM_APPLICATION_ROLE_UNIVERSAL_IDENTIFIER,
} from 'src/engine/core-modules/application/constants/workspace-custom-application-role.constant';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type FlatRole } from 'src/engine/metadata-modules/flat-role/types/flat-role.type';

export const buildWorkspaceCustomApplicationFlatRole = ({
  workspaceId,
  workspaceCustomFlatApplication,
  label = WORKSPACE_CUSTOM_APPLICATION_ROLE_LABEL,
}: {
  workspaceId: string;
  workspaceCustomFlatApplication: Pick<
    FlatApplication,
    'id' | 'universalIdentifier'
  >;
  label?: string;
}): FlatRole => {
  const now = new Date().toISOString();

  return {
    id: v4(),
    universalIdentifier: WORKSPACE_CUSTOM_APPLICATION_ROLE_UNIVERSAL_IDENTIFIER,
    label,
    description: 'Default role of the workspace custom application',
    icon: 'IconApps',
    isEditable: false,
    canUpdateAllSettings: true,
    canAccessAllTools: true,
    canAccessAllAgentChatChannels: true,
    canReadAllObjectRecords: true,
    canUpdateAllObjectRecords: true,
    canSoftDeleteAllObjectRecords: true,
    canDestroyAllObjectRecords: true,
    canBeAssignedToUsers: false,
    canBeAssignedToAgents: false,
    canBeAssignedToApiKeys: false,
    workspaceId,
    createdAt: now,
    updatedAt: now,
    applicationId: workspaceCustomFlatApplication.id,
    applicationUniversalIdentifier:
      workspaceCustomFlatApplication.universalIdentifier,
    roleTargetIds: [],
    roleTargetUniversalIdentifiers: [],
    objectPermissionIds: [],
    rolePermissionFlagIds: [],
    objectPermissionUniversalIdentifiers: [],
    rolePermissionFlagUniversalIdentifiers: [],
    fieldPermissionIds: [],
    fieldPermissionUniversalIdentifiers: [],
    rowLevelPermissionPredicateIds: [],
    rowLevelPermissionPredicateUniversalIdentifiers: [],
    rowLevelPermissionPredicateGroupIds: [],
    rowLevelPermissionPredicateGroupUniversalIdentifiers: [],
    agentChatChannelRoleIds: [],
    agentChatChannelRoleUniversalIdentifiers: [],
  };
};
