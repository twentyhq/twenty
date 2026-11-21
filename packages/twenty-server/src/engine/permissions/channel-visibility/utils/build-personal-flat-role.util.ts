import { v4 } from 'uuid';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type FlatRole } from 'src/engine/metadata-modules/flat-role/types/flat-role.type';
import { PERSONAL_ROLE_LABEL_PREFIX } from 'src/engine/permissions/channel-visibility/constants/personal-role.constant';
import { getPersonalRoleUniversalIdentifier } from 'src/engine/permissions/channel-visibility/utils/get-personal-role-universal-identifier.util';

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
    description: 'Channel visibility of one workspace member',
    icon: 'IconLock',
    isEditable: false,
    isSystemSideEffect: true,
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
