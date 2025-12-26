import { type FlatRoleTarget } from 'src/engine/metadata-modules/flat-role-target/types/flat-role-target.type';
import { type RoleTargetEntity } from 'src/engine/metadata-modules/role-target/role-target.entity';

export const fromRoleTargetsEntityToFlatRoleTarget = (
  roleTarget: RoleTargetEntity,
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
    createdAt: roleTarget.createdAt.toISOString(),
    updatedAt: roleTarget.updatedAt.toISOString(),
  };
};
