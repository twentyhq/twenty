import { v4, v5 } from 'uuid';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type FlatRole } from 'src/engine/metadata-modules/flat-role/types/flat-role.type';
import {
  PERSONAL_ROLE_LABEL_PREFIX,
  PERSONAL_ROLE_UNIVERSAL_IDENTIFIER_NAMESPACE,
} from 'src/engine/permissions/channel-visibility/constants/personal-role.constant';

export const getPersonalRoleUniversalIdentifier = (
  userWorkspaceId: string,
): string => v5(userWorkspaceId, PERSONAL_ROLE_UNIVERSAL_IDENTIFIER_NAMESPACE);

export const buildPersonalFlatRole = ({
  workspaceId,
  userWorkspaceId,
  flatApplication,
}: {
  workspaceId: string;
  userWorkspaceId: string;
  flatApplication: Pick<FlatApplication, 'id' | 'universalIdentifier'>;
}): FlatRole => {
  const now = new Date().toISOString();

  return {
    id: v4(),
    universalIdentifier: getPersonalRoleUniversalIdentifier(userWorkspaceId),
    label: `${PERSONAL_ROLE_LABEL_PREFIX}${userWorkspaceId}`,
    description: 'Grants a member what message and calendar channels share',
    icon: 'IconUser',
    isEditable: false,
    canUpdateAllSettings: false,
    canAccessAllTools: false,
    canAccessAllAgentChatChannels: false,
    canReadAllObjectRecords: false,
    canCreateAllObjectRecords: false,
    canUpdateAllObjectRecords: false,
    canSoftDeleteAllObjectRecords: false,
    canDestroyAllObjectRecords: false,
    canBeAssignedToUsers: false,
    canBeAssignedToAgents: false,
    canBeAssignedToApiKeys: false,
    canBeAssignedToApplications: false,
    workspaceId,
    createdAt: now,
    updatedAt: now,
    applicationId: flatApplication.id,
    applicationUniversalIdentifier: flatApplication.universalIdentifier,
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
