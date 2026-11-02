/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import {
  type PermissionsMainPrincipal,
  type PermissionsPrincipalsContext,
} from 'src/engine/permissions/principal/types/permissions-principals-context.type';
import {
  type PermissionsApplicationPrincipalWithRole,
  type PermissionsLimitingPrincipalWithRole,
  type PermissionsMainPrincipalWithRole,
  type PermissionsPrincipalsWithRolesContext,
} from 'src/engine/permissions/principal/types/permissions-principals-with-roles-context.type';
import { type RoleIdsBySource } from 'src/engine/permissions/principal/types/role-permission-config.type';

const FALLBACK_MAIN_ROLE_ID_KEYS: (keyof RoleIdsBySource)[] = [
  'userWorkspaceRoleId',
  'apiKeyRoleId',
  'webhookRoleId',
  'applicationRoleId',
  'agentRoleId',
];

const getMainRoleIdKey = ({
  mainPrincipal,
  roleIdsBySource,
}: {
  mainPrincipal: PermissionsMainPrincipal | undefined;
  roleIdsBySource: RoleIdsBySource;
}): keyof RoleIdsBySource | undefined => {
  if (!isDefined(mainPrincipal) || 'isDeprecatedRoleOnly' in mainPrincipal) {
    return FALLBACK_MAIN_ROLE_ID_KEYS.find(
      (roleIdKey) => roleIdsBySource[roleIdKey] !== undefined,
    );
  }

  if ('workspaceMemberId' in mainPrincipal) {
    return 'userWorkspaceRoleId';
  }

  if ('apiKeyId' in mainPrincipal) {
    return 'apiKeyRoleId';
  }

  if ('agentId' in mainPrincipal) {
    return 'agentRoleId';
  }

  if ('applicationId' in mainPrincipal) {
    return 'applicationRoleId';
  }

  return 'webhookRoleId';
};

// TODO(@charlesBochet): an agent or application always needs a role; until then one without counts as the custom app
const buildLimitingPrincipal = ({
  agentRoleId,
  agentId,
}: {
  agentRoleId: string | null | undefined;
  agentId: string | undefined;
}): PermissionsLimitingPrincipalWithRole | undefined => {
  if (!isDefined(agentRoleId)) {
    return undefined;
  }

  return isDefined(agentId)
    ? { roleId: agentRoleId, agentId }
    : { roleId: agentRoleId, isDeprecatedRoleOnly: true };
};

const buildApplicationPrincipal = ({
  applicationRoleId,
  applicationId,
}: {
  applicationRoleId: string | null | undefined;
  applicationId: string | undefined;
}): PermissionsApplicationPrincipalWithRole => {
  if (!isDefined(applicationRoleId)) {
    return { isCustomApp: true };
  }

  return isDefined(applicationId)
    ? { roleId: applicationRoleId, applicationId }
    : { roleId: applicationRoleId, isDeprecatedRoleOnly: true };
};

const getIdentifiedMainPrincipal = (
  principalsContext: PermissionsPrincipalsContext | undefined,
) => {
  const mainPrincipal = principalsContext?.mainPrincipal;

  return isDefined(mainPrincipal) && !('isDeprecatedRoleOnly' in mainPrincipal)
    ? mainPrincipal
    : undefined;
};

export const buildPermissionsPrincipalRoles = ({
  roleIdsBySource,
  principalsContext,
}: {
  roleIdsBySource: RoleIdsBySource;
  principalsContext: PermissionsPrincipalsContext | undefined;
}): Omit<PermissionsPrincipalsWithRolesContext, 'workspaceId'> | undefined => {
  const identifiedMainPrincipal = getIdentifiedMainPrincipal(principalsContext);
  const mainRoleIdKey = getMainRoleIdKey({
    mainPrincipal: identifiedMainPrincipal,
    roleIdsBySource,
  });

  if (!isDefined(mainRoleIdKey)) {
    return undefined;
  }

  const hasUnplacedRoleId = Object.entries(roleIdsBySource).some(
    ([roleIdKey, roleId]) =>
      roleId !== undefined &&
      roleIdKey !== mainRoleIdKey &&
      roleIdKey !== 'agentRoleId' &&
      roleIdKey !== 'applicationRoleId',
  );
  const mainRoleId = roleIdsBySource[mainRoleIdKey];

  if (hasUnplacedRoleId || !isDefined(mainRoleId)) {
    return undefined;
  }

  const mainPrincipal: PermissionsMainPrincipalWithRole = isDefined(
    identifiedMainPrincipal,
  )
    ? { ...identifiedMainPrincipal, roleId: mainRoleId }
    : { roleId: mainRoleId, isDeprecatedRoleOnly: true };

  const limitingPrincipal = principalsContext?.limitingPrincipal;
  const applicationPrincipal = principalsContext?.applicationPrincipal;

  return {
    mainPrincipal,
    limitingPrincipal:
      mainRoleIdKey === 'agentRoleId'
        ? undefined
        : buildLimitingPrincipal({
            agentRoleId: roleIdsBySource.agentRoleId,
            agentId:
              isDefined(limitingPrincipal) && 'agentId' in limitingPrincipal
                ? limitingPrincipal.agentId
                : undefined,
          }),
    applicationPrincipal: buildApplicationPrincipal({
      applicationRoleId: roleIdsBySource.applicationRoleId,
      applicationId:
        isDefined(applicationPrincipal) &&
        'applicationId' in applicationPrincipal
          ? applicationPrincipal.applicationId
          : undefined,
    }),
  };
};
