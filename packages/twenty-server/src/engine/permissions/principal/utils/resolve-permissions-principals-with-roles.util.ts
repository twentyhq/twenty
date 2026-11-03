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

export type PermissionsPrincipalRoleMaps = {
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

const findWorkspaceMemberRoleId = ({
  workspaceMemberId,
  roleMaps,
}: {
  workspaceMemberId: string;
  roleMaps: Pick<
    PermissionsPrincipalRoleMaps,
    'flatWorkspaceMemberMaps' | 'userWorkspaceRoleMap'
  >;
}): string | undefined => {
  const userId =
    roleMaps.flatWorkspaceMemberMaps.byId[workspaceMemberId]?.userId;
  const userWorkspaceId = isDefined(userId)
    ? roleMaps.flatWorkspaceMemberMaps.userWorkspaceIdByUserId[userId]
    : undefined;

  return isDefined(userWorkspaceId)
    ? roleMaps.userWorkspaceRoleMap[userWorkspaceId]
    : undefined;
};

const findMainPrincipalRoleId = ({
  mainPrincipal,
  roleMaps,
}: {
  mainPrincipal: PermissionsMainPrincipal;
  roleMaps: PermissionsPrincipalRoleMaps;
}): string | undefined => {
  switch (mainPrincipal.type) {
    case 'deprecatedRoleOnly':
      return mainPrincipal.roleId;
    case 'workspaceMember':
      return findWorkspaceMemberRoleId({
        workspaceMemberId: mainPrincipal.workspaceMemberId,
        roleMaps,
      });
    case 'apiKey':
      return roleMaps.apiKeyRoleMap[mainPrincipal.apiKeyId];
    case 'agent':
      return roleMaps.flatRoleTargetByAgentIdMaps[mainPrincipal.agentId]
        ?.roleId;
    case 'application': {
      const flatApplication =
        roleMaps.flatApplicationMaps.byId[mainPrincipal.applicationId];

      return isDefined(flatApplication) && !isDefined(flatApplication.deletedAt)
        ? (flatApplication.defaultRoleId ?? undefined)
        : undefined;
    }
    case 'webhook':
      return isDefined(roleMaps.flatRoleTargetMaps)
        ? findFlatRoleTargetFromForeignKey({
            flatRoleTargetMaps: roleMaps.flatRoleTargetMaps,
            targetMetadataForeignKey: 'webhookId',
            targetId: mainPrincipal.webhookId,
          })?.roleId
        : undefined;
  }
};

const resolveLimitingPrincipal = ({
  limitingPrincipal,
  roleMaps,
}: {
  limitingPrincipal: PermissionsLimitingPrincipal;
  roleMaps: PermissionsPrincipalRoleMaps;
}): PermissionsLimitingPrincipalWithRole | undefined => {
  if (limitingPrincipal.type === 'deprecatedRoleOnly') {
    return limitingPrincipal;
  }

  const roleId =
    roleMaps.flatRoleTargetByAgentIdMaps[limitingPrincipal.agentId]?.roleId;

  return isDefined(roleId)
    ? { type: 'agent', roleId, agentId: limitingPrincipal.agentId }
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
  if (applicationPrincipal.type !== 'application') {
    return applicationPrincipal;
  }

  const flatApplication =
    roleMaps.flatApplicationMaps.byId[applicationPrincipal.applicationId];

  if (!isDefined(flatApplication) || isDefined(flatApplication.deletedAt)) {
    return undefined;
  }

  const applicationRoleId = resolveApplicationRoleId({
    application: flatApplication,
    userRoleId:
      mainPrincipal.type === 'workspaceMember'
        ? mainPrincipal.roleId
        : undefined,
  });

  return isDefined(applicationRoleId)
    ? {
        type: 'application',
        roleId: applicationRoleId,
        applicationId: applicationPrincipal.applicationId,
      }
    : undefined;
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

  const { limitingPrincipal } = principalsContext;
  const limitingPrincipalWithRole = isDefined(limitingPrincipal)
    ? resolveLimitingPrincipal({ limitingPrincipal, roleMaps })
    : undefined;

  // Dropping a limiting agent that lost its role would widen access, so deny instead
  if (isDefined(limitingPrincipal) && !isDefined(limitingPrincipalWithRole)) {
    return undefined;
  }

  return {
    workspaceId: principalsContext.workspaceId,
    mainPrincipal,
    limitingPrincipal: limitingPrincipalWithRole,
    applicationPrincipal,
    ...(isDefined(principalsContext.scope)
      ? { scope: principalsContext.scope }
      : {}),
  };
};
