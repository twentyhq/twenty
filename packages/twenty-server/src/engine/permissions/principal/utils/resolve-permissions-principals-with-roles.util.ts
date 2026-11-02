/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { findFlatRoleTargetFromForeignKey } from 'src/engine/metadata-modules/flat-role-target/utils/find-flat-role-target-from-foreign-key.util';
import {
  type PermissionsApplicationPrincipal,
  type PermissionsLimitingPrincipal,
  type PermissionsMainPrincipal,
  type PermissionsPrincipalsContext,
} from 'src/engine/permissions/principal/types/permissions-principals-context.type';
import { type PermissionsPrincipalRoleMaps } from 'src/engine/permissions/principal/types/permissions-principal-role-maps.type';
import {
  type PermissionsApplicationPrincipalWithRole,
  type PermissionsLimitingPrincipalWithRole,
  type PermissionsMainPrincipalWithRole,
  type PermissionsPrincipalsWithRolesContext,
} from 'src/engine/permissions/principal/types/permissions-principals-with-roles-context.type';
import { resolveApplicationRoleId } from 'src/engine/permissions/principal/utils/resolve-application-role-id.util';

const findMainPrincipalRoleId = ({
  mainPrincipal,
  roleMaps,
}: {
  mainPrincipal: PermissionsMainPrincipal;
  roleMaps: PermissionsPrincipalRoleMaps;
}): string | undefined => {
  if ('isDeprecatedRoleOnly' in mainPrincipal) {
    return mainPrincipal.roleId;
  }

  if ('workspaceMemberId' in mainPrincipal) {
    const userId =
      roleMaps.flatWorkspaceMemberMaps.byId[mainPrincipal.workspaceMemberId]
        ?.userId;
    const userWorkspaceId = isDefined(userId)
      ? roleMaps.flatWorkspaceMemberMaps.userWorkspaceIdByUserId[userId]
      : undefined;

    return isDefined(userWorkspaceId)
      ? roleMaps.userWorkspaceRoleMap[userWorkspaceId]
      : undefined;
  }

  if ('apiKeyId' in mainPrincipal) {
    return roleMaps.apiKeyRoleMap[mainPrincipal.apiKeyId];
  }

  if ('agentId' in mainPrincipal) {
    return roleMaps.flatRoleTargetByAgentIdMaps[mainPrincipal.agentId]?.roleId;
  }

  if ('applicationId' in mainPrincipal) {
    const flatApplication =
      roleMaps.flatApplicationMaps.byId[mainPrincipal.applicationId];

    return isDefined(flatApplication) && !isDefined(flatApplication.deletedAt)
      ? (flatApplication.defaultRoleId ?? undefined)
      : undefined;
  }

  if (!isDefined(roleMaps.flatRoleTargetMaps)) {
    return undefined;
  }

  return findFlatRoleTargetFromForeignKey({
    flatRoleTargetMaps: roleMaps.flatRoleTargetMaps,
    targetMetadataForeignKey: 'webhookId',
    targetId: mainPrincipal.webhookId,
  })?.roleId;
};

// TODO(@charlesBochet): an agent or application always needs a role; until then one without counts as the custom app
const resolveLimitingPrincipal = ({
  limitingPrincipal,
  roleMaps,
}: {
  limitingPrincipal: PermissionsLimitingPrincipal | undefined;
  roleMaps: PermissionsPrincipalRoleMaps;
}): PermissionsLimitingPrincipalWithRole | undefined => {
  if (
    !isDefined(limitingPrincipal) ||
    'isDeprecatedRoleOnly' in limitingPrincipal
  ) {
    return limitingPrincipal;
  }

  const roleId =
    roleMaps.flatRoleTargetByAgentIdMaps[limitingPrincipal.agentId]?.roleId;

  return isDefined(roleId)
    ? { roleId, agentId: limitingPrincipal.agentId }
    : undefined;
};

const resolveApplicationPrincipal = ({
  applicationPrincipal,
  mainPrincipal,
  roleMaps,
}: {
  applicationPrincipal: PermissionsApplicationPrincipal;
  mainPrincipal: PermissionsMainPrincipalWithRole;
  roleMaps: PermissionsPrincipalRoleMaps;
}): PermissionsApplicationPrincipalWithRole => {
  if (!('applicationId' in applicationPrincipal)) {
    return applicationPrincipal;
  }

  const { applicationRoleId } = resolveApplicationRoleId({
    application:
      roleMaps.flatApplicationMaps.byId[applicationPrincipal.applicationId],
    userRoleId:
      'workspaceMemberId' in mainPrincipal ? mainPrincipal.roleId : undefined,
  });

  return isDefined(applicationRoleId)
    ? {
        roleId: applicationRoleId,
        applicationId: applicationPrincipal.applicationId,
      }
    : { isCustomApp: true };
};

// undefined denies everything: the main principal has no role
export const resolvePermissionsPrincipalsWithRoles = ({
  principalsContext,
  roleMaps,
}: {
  principalsContext: PermissionsPrincipalsContext;
  roleMaps: PermissionsPrincipalRoleMaps;
}): PermissionsPrincipalsWithRolesContext | undefined => {
  const mainRoleId = findMainPrincipalRoleId({
    mainPrincipal: principalsContext.mainPrincipal,
    roleMaps,
  });

  if (!isDefined(mainRoleId)) {
    return undefined;
  }

  const mainPrincipal: PermissionsMainPrincipalWithRole = {
    ...principalsContext.mainPrincipal,
    roleId: mainRoleId,
  };

  return {
    workspaceId: principalsContext.workspaceId,
    mainPrincipal,
    limitingPrincipal: resolveLimitingPrincipal({
      limitingPrincipal: principalsContext.limitingPrincipal,
      roleMaps,
    }),
    applicationPrincipal: resolveApplicationPrincipal({
      applicationPrincipal: principalsContext.applicationPrincipal,
      mainPrincipal,
      roleMaps,
    }),
  };
};
