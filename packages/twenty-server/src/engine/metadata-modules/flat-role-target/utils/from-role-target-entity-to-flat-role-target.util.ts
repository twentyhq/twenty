import { type FlatRoleTarget } from 'src/engine/metadata-modules/flat-role-target/types/flat-role-target.type';
import { type RoleTargetsEntity } from 'src/engine/metadata-modules/role/role-targets.entity';

export const fromRoleTargetsEntityToFlatRoleTarget = (
  roleTarget: RoleTargetsEntity,
): FlatRoleTarget => {
  return {
    id: roleTarget.id,
    workspaceId: roleTarget.workspaceId,
    roleId: roleTarget.roleId,
    userWorkspaceId: roleTarget.userWorkspaceId,
    agentId: roleTarget.agentId,
    apiKeyId: roleTarget.apiKeyId,
    applicationId: roleTarget.applicationId,
    universalIdentifier: roleTarget.universalIdentifier ?? roleTarget.id,
    createdAt: roleTarget.createdAt,
    updatedAt: roleTarget.updatedAt,
  };
};
