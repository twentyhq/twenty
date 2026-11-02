/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { findFlatRoleTargetFromForeignKey } from 'src/engine/metadata-modules/flat-role-target/utils/find-flat-role-target-from-foreign-key.util';
import {
  type PermissionsApplicationPrincipal,
  type PermissionsLimitingPrincipal,
  type PermissionsMainPrincipal,
  type PermissionsPrincipalsContext,
} from 'src/engine/permissions/principal/types/permissions-principals-context.type';
import {
  type PermissionsApplicationPrincipalWithRole,
  type PermissionsLimitingPrincipalWithRole,
  type PermissionsMainPrincipalWithRole,
  type PermissionsPrincipalsWithRolesContext,
} from 'src/engine/permissions/principal/types/permissions-principals-with-roles-context.type';
import { resolveApplicationRoleId } from 'src/engine/permissions/principal/utils/resolve-application-role-id.util';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type FlatWorkspaceMember } from 'src/engine/core-modules/user/types/flat-workspace-member.type';
import { type FlatWorkspaceMemberMaps } from 'src/engine/core-modules/user/types/flat-workspace-member-maps.type';
import { type FlatRoleTarget } from 'src/engine/metadata-modules/flat-role-target/types/flat-role-target.type';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type UserWorkspaceRoleMap } from 'src/engine/metadata-modules/role-target/types/user-workspace-role-map.type';

type PermissionsPrincipalRoleMaps = {
  flatWorkspaceMemberMaps: {
    byId: Partial<Record<string, Pick<FlatWorkspaceMember, 'userId'>>>;
    userWorkspaceIdByUserId: FlatWorkspaceMemberMaps['userWorkspaceIdByUserId'];
  };
  userWorkspaceRoleMap: UserWorkspaceRoleMap;
  apiKeyRoleMap: Record<string, string>;
  flatRoleTargetByAgentIdMaps: Partial<
    Record<string, Pick<FlatRoleTarget, 'roleId'>>
  >;
  flatApplicationMaps: {
    byId: Partial<
      Record<
        string,
        Pick<
          FlatApplication,
          'id' | 'defaultRoleId' | 'sourceType' | 'deletedAt'
        >
      >
    >;
  };
  flatRoleTargetMaps?: AllFlatEntityMaps['flatRoleTargetMaps'];
};

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
}): PermissionsApplicationPrincipalWithRole | undefined => {
  if (!('applicationId' in applicationPrincipal)) {
    return applicationPrincipal;
  }

  const flatApplication =
    roleMaps.flatApplicationMaps.byId[applicationPrincipal.applicationId];

  if (!isDefined(flatApplication) || isDefined(flatApplication.deletedAt)) {
    return undefined;
  }

  const { applicationRoleId } = resolveApplicationRoleId({
    application: flatApplication,
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

  const applicationPrincipal = resolveApplicationPrincipal({
    applicationPrincipal: principalsContext.applicationPrincipal,
    mainPrincipal,
    roleMaps,
  });

  if (!isDefined(applicationPrincipal)) {
    return undefined;
  }

  return {
    workspaceId: principalsContext.workspaceId,
    mainPrincipal,
    limitingPrincipal: resolveLimitingPrincipal({
      limitingPrincipal: principalsContext.limitingPrincipal,
      roleMaps,
    }),
    applicationPrincipal,
  };
};
