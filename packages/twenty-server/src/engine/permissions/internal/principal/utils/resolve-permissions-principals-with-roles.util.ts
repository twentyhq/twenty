/* @license Enterprise */

import {
  assertUnreachable,
  isDefined,
  isNonEmptyArray,
} from 'twenty-shared/utils';

import { findFlatRoleTargetFromForeignKey } from 'src/engine/metadata-modules/flat-role-target/utils/find-flat-role-target-from-foreign-key.util';
import { type PermissionsAuthContext } from 'src/engine/permissions/principal/types/permissions-auth-context.type';
import {
  type PermissionsApplicationPrincipal,
  type PermissionsLimitingPrincipal,
  type PermissionsMainPrincipal,
} from 'src/engine/permissions/internal/principal/types/permissions-principal.type';
import { type RuntimeLimitingRole } from 'src/engine/permissions/principal/types/runtime-limiting-role.type';
import {
  type PermissionsApplicationPrincipalWithRole,
  type PermissionsLimitingPrincipalWithRole,
  type PermissionsMainPrincipalWithRole,
  type PermissionsPrincipalsWithRolesContext,
} from 'src/engine/permissions/principal/types/permissions-principals-with-roles-context.type';
import { resolveApplicationRoleId } from 'src/engine/permissions/internal/principal/utils/resolve-application-role-id.util';
import { isOAuthOnlyApplication } from 'src/engine/core-modules/application/utils/is-oauth-only-application.util';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type FlatWorkspaceMember } from 'src/engine/core-modules/user/types/flat-workspace-member.type';
import { type FlatWorkspaceMemberMaps } from 'src/engine/core-modules/user/types/flat-workspace-member-maps.type';
import { type FlatRoleTarget } from 'src/engine/metadata-modules/flat-role-target/types/flat-role-target.type';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type UserWorkspaceRoleMap } from 'src/engine/metadata-modules/role-target/types/user-workspace-role-map.type';
import { isPermissionMainPrincipalWorkspaceMember } from 'src/engine/permissions/internal/principal/utils/is-permission-main-principal-workspace-member.util';

type PermissionsPrincipalsFlatApplication = Pick<
  FlatApplication,
  'id' | 'requestedRoleId' | 'sourceType' | 'deletedAt'
>;

export type PermissionsPrincipalsRoleMaps = {
  flatWorkspaceMemberMaps?: {
    byId: Partial<Record<string, Pick<FlatWorkspaceMember, 'userId'>>>;
    userWorkspaceIdByUserId: FlatWorkspaceMemberMaps['userWorkspaceIdByUserId'];
  };
  userWorkspaceRoleMap: UserWorkspaceRoleMap;
  apiKeyRoleMap: Record<string, string>;
  flatRoleTargetByAgentIdMaps: Partial<
    Record<string, Pick<FlatRoleTarget, 'roleId'>>
  >;
  flatApplicationMaps: {
    byId: Partial<Record<string, PermissionsPrincipalsFlatApplication>>;
  };
  flatRoleTargetByApplicationIdMaps: Partial<
    Record<string, Pick<FlatRoleTarget, 'roleId'>>
  >;
  workspaceCustomApplicationId: string;
  flatRoleTargetMaps?: AllFlatEntityMaps['flatRoleTargetMaps'];
};

const findActiveFlatApplication = ({
  applicationId,
  roleMaps,
}: {
  applicationId: string;
  roleMaps: Pick<PermissionsPrincipalsRoleMaps, 'flatApplicationMaps'>;
}): PermissionsPrincipalsFlatApplication | undefined => {
  const flatApplication = roleMaps.flatApplicationMaps.byId[applicationId];

  return isDefined(flatApplication) && !isDefined(flatApplication.deletedAt)
    ? flatApplication
    : undefined;
};

const findApplicationRoleId = ({
  flatApplication,
  workspaceId,
  roleMaps,
}: {
  flatApplication: PermissionsPrincipalsFlatApplication;
  workspaceId: string;
  roleMaps: PermissionsPrincipalsRoleMaps;
}): string | undefined =>
  resolveApplicationRoleId({
    application: flatApplication,
    workspaceId,
    workspaceCustomApplicationId: roleMaps.workspaceCustomApplicationId,
    flatRoleTargetByApplicationIdMaps:
      roleMaps.flatRoleTargetByApplicationIdMaps,
  });

const findWorkspaceMemberUserWorkspaceId = ({
  workspaceMemberId,
  roleMaps,
}: {
  workspaceMemberId: string;
  roleMaps: Pick<PermissionsPrincipalsRoleMaps, 'flatWorkspaceMemberMaps'>;
}): string | undefined => {
  const userId =
    roleMaps.flatWorkspaceMemberMaps?.byId[workspaceMemberId]?.userId;

  return isDefined(userId)
    ? roleMaps.flatWorkspaceMemberMaps?.userWorkspaceIdByUserId[userId]
    : undefined;
};

const findWorkspaceMemberRoleIds = ({
  workspaceMemberId,
  roleMaps,
}: {
  workspaceMemberId: string;
  roleMaps: PermissionsPrincipalsRoleMaps;
}): string[] => {
  const userWorkspaceId = findWorkspaceMemberUserWorkspaceId({
    workspaceMemberId,
    roleMaps,
  });

  return isDefined(userWorkspaceId)
    ? (roleMaps.userWorkspaceRoleMap[userWorkspaceId] ?? [])
    : [];
};

const findMainPrincipalRoleIds = ({
  mainPrincipal,
  workspaceId,
  roleMaps,
}: {
  mainPrincipal: PermissionsMainPrincipal;
  workspaceId: string;
  roleMaps: PermissionsPrincipalsRoleMaps;
}): string[] => {
  switch (mainPrincipal.type) {
    case 'role':
      return [];
    case 'workspaceMember':
      return findWorkspaceMemberRoleIds({
        workspaceMemberId: mainPrincipal.workspaceMemberId,
        roleMaps,
      });
    case 'apiKey':
      return [roleMaps.apiKeyRoleMap[mainPrincipal.apiKeyId]].filter(isDefined);
    case 'agent':
      return [
        roleMaps.flatRoleTargetByAgentIdMaps[mainPrincipal.agentId]?.roleId,
      ].filter(isDefined);
    case 'application': {
      const flatApplication = findActiveFlatApplication({
        applicationId: mainPrincipal.applicationId,
        roleMaps,
      });

      return [
        isDefined(flatApplication)
          ? findApplicationRoleId({ flatApplication, workspaceId, roleMaps })
          : undefined,
      ].filter(isDefined);
    }
    case 'webhook':
      return [
        isDefined(roleMaps.flatRoleTargetMaps)
          ? findFlatRoleTargetFromForeignKey({
              flatRoleTargetMaps: roleMaps.flatRoleTargetMaps,
              targetMetadataForeignKey: 'webhookId',
              targetId: mainPrincipal.webhookId,
            })?.roleId
          : undefined,
      ].filter(isDefined);
  }
};

const resolveLimitingPrincipal = ({
  limitingPrincipal,
  roleMaps,
}: {
  limitingPrincipal: PermissionsLimitingPrincipal;
  roleMaps: PermissionsPrincipalsRoleMaps;
}): PermissionsLimitingPrincipalWithRole | undefined => {
  const roleId =
    roleMaps.flatRoleTargetByAgentIdMaps[limitingPrincipal.agentId]?.roleId;

  return isDefined(roleId)
    ? { type: 'agent', roleId, agentId: limitingPrincipal.agentId }
    : undefined;
};

const resolveApplicationPrincipal = ({
  applicationPrincipal,
  mainPrincipal,
  workspaceId,
  roleMaps,
}: {
  applicationPrincipal: PermissionsApplicationPrincipal;
  mainPrincipal: PermissionsMainPrincipalWithRole;
  workspaceId: string;
  roleMaps: PermissionsPrincipalsRoleMaps;
}): PermissionsApplicationPrincipalWithRole | undefined => {
  if (applicationPrincipal.type !== 'application') {
    return applicationPrincipal;
  }

  const flatApplication = findActiveFlatApplication({
    applicationId: applicationPrincipal.applicationId,
    roleMaps,
  });

  if (!isDefined(flatApplication)) {
    return undefined;
  }

  const applicationRoleId = findApplicationRoleId({
    flatApplication,
    workspaceId,
    roleMaps,
  });

  if (
    !isDefined(applicationRoleId) &&
    !(
      isOAuthOnlyApplication(flatApplication) &&
      isPermissionMainPrincipalWorkspaceMember(mainPrincipal)
    )
  ) {
    return undefined;
  }

  return {
    type: 'application',
    roleId: applicationRoleId,
    applicationId: applicationPrincipal.applicationId,
  };
};

type PermissionsIdentities = {
  mainPrincipal: PermissionsMainPrincipal;
  limitingPrincipal?: PermissionsLimitingPrincipal;
  applicationPrincipal: PermissionsApplicationPrincipal;
  runtimeLimitingRole?: RuntimeLimitingRole;
};

const toApplicationPrincipal = (
  applicationId: string | undefined,
): PermissionsApplicationPrincipal =>
  isDefined(applicationId)
    ? { type: 'application', applicationId }
    : { type: 'customApplication' };

const toLimitingPrincipal = (
  agentId: string | undefined,
): PermissionsLimitingPrincipal | undefined =>
  isDefined(agentId) ? { type: 'agent', agentId } : undefined;

const getPermissionsIdentitiesFromAuthContext = (
  authContext: PermissionsAuthContext,
): PermissionsIdentities | undefined => {
  switch (authContext.type) {
    case 'user':
      return {
        mainPrincipal: {
          type: 'workspaceMember',
          workspaceMemberId: authContext.workspaceMemberId,
        },
        limitingPrincipal: toLimitingPrincipal(authContext.agentId),
        applicationPrincipal: toApplicationPrincipal(
          authContext.application?.id,
        ),
        runtimeLimitingRole: authContext.runtimeLimitingRole,
      };
    case 'apiKey':
      return {
        mainPrincipal: { type: 'apiKey', apiKeyId: authContext.apiKey.id },
        limitingPrincipal: toLimitingPrincipal(authContext.agentId),
        applicationPrincipal: toApplicationPrincipal(
          authContext.application?.id,
        ),
        runtimeLimitingRole: authContext.runtimeLimitingRole,
      };
    case 'application':
      return {
        mainPrincipal: isDefined(authContext.agentId)
          ? { type: 'agent', agentId: authContext.agentId }
          : { type: 'application', applicationId: authContext.application.id },
        applicationPrincipal: toApplicationPrincipal(
          authContext.application.id,
        ),
        runtimeLimitingRole: authContext.runtimeLimitingRole,
      };
    case 'webhook':
      return {
        mainPrincipal: { type: 'webhook', webhookId: authContext.webhook.id },
        applicationPrincipal: { type: 'customApplication' },
      };
    case 'system':
    case 'pendingActivationUser':
      return undefined;
    default:
      return assertUnreachable(authContext);
  }
};

export const resolvePermissionsPrincipalsWithRoles = ({
  authContext,
  roleMaps,
}: {
  authContext: PermissionsAuthContext;
  roleMaps: PermissionsPrincipalsRoleMaps;
}): PermissionsPrincipalsWithRolesContext | undefined => {
  const identities = getPermissionsIdentitiesFromAuthContext(authContext);

  if (!isDefined(identities)) {
    return undefined;
  }

  const workspaceId = authContext.workspace.id;
  const roleIds = findMainPrincipalRoleIds({
    mainPrincipal: identities.mainPrincipal,
    workspaceId,
    roleMaps,
  });

  if (!isNonEmptyArray(roleIds)) {
    return undefined;
  }

  const mainPrincipal: PermissionsMainPrincipalWithRole = {
    ...identities.mainPrincipal,
    roleIds,
  };

  const applicationPrincipal = resolveApplicationPrincipal({
    applicationPrincipal: identities.applicationPrincipal,
    mainPrincipal,
    workspaceId,
    roleMaps,
  });

  if (!isDefined(applicationPrincipal)) {
    return undefined;
  }

  const applicationRoleId =
    applicationPrincipal.type === 'application'
      ? applicationPrincipal.roleId
      : undefined;

  // A limiting role drops its row-level rules, so an application acting with
  // one of the main roles narrows them to that role rather than limiting them
  const actingMainPrincipal: PermissionsMainPrincipalWithRole =
    isDefined(applicationRoleId) && roleIds.includes(applicationRoleId)
      ? { ...mainPrincipal, roleIds: [applicationRoleId] }
      : mainPrincipal;

  const { limitingPrincipal } = identities;
  const limitingPrincipalWithRole = isDefined(limitingPrincipal)
    ? resolveLimitingPrincipal({ limitingPrincipal, roleMaps })
    : undefined;

  // Dropping a limiting agent that lost its role would widen access, so deny instead
  if (isDefined(limitingPrincipal) && !isDefined(limitingPrincipalWithRole)) {
    return undefined;
  }

  return {
    workspaceId,
    mainPrincipal: actingMainPrincipal,
    limitingPrincipal: limitingPrincipalWithRole,
    applicationPrincipal,
    ...(isDefined(identities.runtimeLimitingRole)
      ? { runtimeLimitingRole: identities.runtimeLimitingRole }
      : {}),
  };
};
