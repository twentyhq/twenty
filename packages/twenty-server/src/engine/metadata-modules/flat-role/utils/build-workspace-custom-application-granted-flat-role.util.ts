import { v4 } from 'uuid';

import {
  WORKSPACE_CUSTOM_APPLICATION_GRANTED_ROLE_LABEL,
  WORKSPACE_CUSTOM_APPLICATION_GRANTED_ROLE_UNIVERSAL_IDENTIFIER,
} from 'src/engine/core-modules/application/constants/workspace-custom-application-granted-role.constant';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type FlatRole } from 'src/engine/metadata-modules/flat-role/types/flat-role.type';

export const buildWorkspaceCustomApplicationGrantedFlatRole = ({
  workspaceId,
  workspaceCustomFlatApplication,
}: {
  workspaceId: string;
  workspaceCustomFlatApplication: Pick<
    FlatApplication,
    'id' | 'universalIdentifier'
  >;
}): FlatRole => {
  const now = new Date().toISOString();

  return {
    id: v4(),
    universalIdentifier:
      WORKSPACE_CUSTOM_APPLICATION_GRANTED_ROLE_UNIVERSAL_IDENTIFIER,
    label: WORKSPACE_CUSTOM_APPLICATION_GRANTED_ROLE_LABEL,
    description: 'Default role of the workspace custom application',
    icon: 'IconApps',
    isEditable: false,
    isSystemSideEffect: false,
    canUpdateAllSettings: true,
    canAccessAllTools: true,
    canAccessAllAgentChatChannels: true,
    canReadAllObjectRecords: true,
    canCreateAllObjectRecords: true,
    canUpdateAllObjectRecords: true,
    canSoftDeleteAllObjectRecords: true,
    canDestroyAllObjectRecords: true,
    canBeAssignedToUsers: false,
    canBeAssignedToAgents: false,
    canBeAssignedToApiKeys: false,
    canBeAssignedToApplications: false,
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
    rowLevelPermissionRuleIds: [],
    fieldPermissionUniversalIdentifiers: [],
    rowLevelPermissionRuleUniversalIdentifiers: [],
    rowLevelPermissionPredicateIds: [],
    rowLevelPermissionPredicateUniversalIdentifiers: [],
    rowLevelPermissionPredicateGroupIds: [],
    rowLevelPermissionPredicateGroupUniversalIdentifiers: [],
    agentChatChannelRoleIds: [],
    agentChatChannelRoleUniversalIdentifiers: [],
  };
};
