import { v4 } from 'uuid';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type FlatRole } from 'src/engine/metadata-modules/flat-role/types/flat-role.type';
import { ADMIN_ROLE_UNIVERSAL_IDENTIFIER } from 'src/engine/metadata-modules/role/constants/admin-role-universal-identifier.constant';

export const buildWorkspaceCustomApplicationAdminFlatRole = ({
  workspaceId,
  ownerFlatApplication,
}: {
  workspaceId: string;
  ownerFlatApplication: Pick<FlatApplication, 'id' | 'universalIdentifier'>;
}): FlatRole => {
  const now = new Date().toISOString();

  return {
    id: v4(),
    universalIdentifier: ADMIN_ROLE_UNIVERSAL_IDENTIFIER,
    label: 'Admin',
    description: 'Admin role',
    icon: 'IconUserCog',
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
    canBeAssignedToUsers: true,
    canBeAssignedToAgents: false,
    canBeAssignedToApiKeys: true,
    canBeAssignedToApplications: false,
    workspaceId,
    createdAt: now,
    updatedAt: now,
    applicationId: ownerFlatApplication.id,
    applicationUniversalIdentifier: ownerFlatApplication.universalIdentifier,
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
