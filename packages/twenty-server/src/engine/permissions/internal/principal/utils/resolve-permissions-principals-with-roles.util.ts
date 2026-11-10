/* @license Enterprise */

import { assertUnreachable, isDefined } from 'twenty-shared/utils';

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
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type FlatWorkspaceMember } from 'src/engine/core-modules/user/types/flat-workspace-member.type';
import { type FlatWorkspaceMemberMaps } from 'src/engine/core-modules/user/types/flat-workspace-member-maps.type';
import { type FlatRoleTarget } from 'src/engine/metadata-modules/flat-role-target/types/flat-role-target.type';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type UserWorkspaceRoleMap } from 'src/engine/metadata-modules/role-target/types/user-workspace-role-map.type';
import { isPermissionMainPrincipalWorkspaceMember } from 'src/engine/permissions/internal/principal/utils/is-permission-main-principal-workspace-member.util';

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
  flatRoleTargetByApplicationIdMaps: Partial<
    Record<string, Pick<FlatRoleTarget, 'roleId'>>
  >;
  workspaceCustomApplicationId: string | undefined;
  flatRoleTargetMaps?: AllFlatEntityMaps['flatRoleTargetMaps'];
};

type PermissionsPrincipalsFlatApplication = NonNullable<
  PermissionsPrincipalsRoleMaps['flatApplicationMaps']['byId'][string]
>;

const findActiveFlatApplication = ({
  applicationId,
  roleMaps,
}: {
  applicationId: string;
  roleMaps: PermissionsPrincipalsRoleMaps;
}): PermissionsPrincipalsFlatApplication | undefined => {
  const flatApplication = roleMaps.flatApplicationMaps.byId[applicationId];

  return isDefined(flatApplication) && !isDefined(flatApplication.deletedAt)
    ? flatApplication
    : undefined;
};

const resolveApplicationPrincipalRole = ({
  flatApplication,
  userRoleId,
  workspaceId,
  roleMaps,
}: {
  flatApplication: PermissionsPrincipalsFlatApplication;
  userRoleId?: string;
  workspaceId: string;
  roleMaps: PermissionsPrincipalsRoleMaps;
}): { roleId: string; requestedRoleId?: string } | undefined => {
  const roleId = resolveApplicationRoleId({
    application: flatApplication,
    userRoleId,
    workspaceId,
    workspaceCustomApplicationId: roleMaps.workspaceCustomApplicationId,
    flatRoleTargetByApplicationIdMaps:
      roleMaps.flatRoleTargetByApplicationIdMaps,
  });

  if (!isDefined(roleId)) {
    return undefined;
  }

  return isDefined(flatApplication.defaultRoleId)
    ? { roleId, requestedRoleId: flatApplication.defaultRoleId }
    : { roleId };
};

const findWorkspaceMemberRoleId = ({
  workspaceMemberId,
  roleMaps,
}: {
  workspaceMemberId: string;
  roleMaps: Pick<
    PermissionsPrincipalsRoleMaps,
    'flatWorkspaceMemberMaps' | 'userWorkspaceRoleMap'
  >;
}): string | undefined => {
  const userId =
    roleMaps.flatWorkspaceMemberMaps?.byId[workspaceMemberId]?.userId;
  const userWorkspaceId = isDefined(userId)
    ? roleMaps.flatWorkspaceMemberMaps?.userWorkspaceIdByUserId[userId]
    : undefined;

  return isDefined(userWorkspaceId)
    ? roleMaps.userWorkspaceRoleMap[userWorkspaceId]
    : undefined;
};

const findMainPrincipalRoleId = ({
  mainPrincipal,
  roleMaps,
}: {
  mainPrincipal: Exclude<PermissionsMainPrincipal, { type: 'application' }>;
  roleMaps: PermissionsPrincipalsRoleMaps;
}): string | undefined => {
  switch (mainPrincipal.type) {
    case 'role':
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

const resolveMainPrincipal = ({
  mainPrincipal,
  workspaceId,
  roleMaps,
}: {
  mainPrincipal: PermissionsMainPrincipal;
  workspaceId: string;
  roleMaps: PermissionsPrincipalsRoleMaps;
}): PermissionsMainPrincipalWithRole | undefined => {
  if (mainPrincipal.type === 'application') {
    const flatApplication = findActiveFlatApplication({
      applicationId: mainPrincipal.applicationId,
      roleMaps,
    });
    const applicationRole = isDefined(flatApplication)
      ? resolveApplicationPrincipalRole({
          flatApplication,
          workspaceId,
          roleMaps,
        })
      : undefined;

    return isDefined(applicationRole)
      ? { ...mainPrincipal, ...applicationRole }
      : undefined;
  }

  const roleId = findMainPrincipalRoleId({ mainPrincipal, roleMaps });

  return isDefined(roleId) ? { ...mainPrincipal, roleId } : undefined;
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

  const applicationRole = isDefined(flatApplication)
    ? resolveApplicationPrincipalRole({
        flatApplication,
        userRoleId: isPermissionMainPrincipalWorkspaceMember(mainPrincipal)
          ? mainPrincipal.roleId
          : undefined,
        workspaceId,
        roleMaps,
      })
    : undefined;

  return isDefined(applicationRole)
    ? {
        type: 'application',
        applicationId: applicationPrincipal.applicationId,
        ...applicationRole,
      }
    : undefined;
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
  const mainPrincipal = resolveMainPrincipal({
    mainPrincipal: identities.mainPrincipal,
    workspaceId,
    roleMaps,
  });

  if (!isDefined(mainPrincipal)) {
    return undefined;
  }

  const applicationPrincipal = resolveApplicationPrincipal({
    applicationPrincipal: identities.applicationPrincipal,
    mainPrincipal,
    workspaceId,
    roleMaps,
  });

  if (!isDefined(applicationPrincipal)) {
    return undefined;
  }

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
    mainPrincipal,
    limitingPrincipal: limitingPrincipalWithRole,
    applicationPrincipal,
    ...(isDefined(identities.runtimeLimitingRole)
      ? { runtimeLimitingRole: identities.runtimeLimitingRole }
      : {}),
  };
};
