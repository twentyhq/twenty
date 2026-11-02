/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import {
  type PermissionsPrincipalsContext,
  type PermissionsPrincipals,
  type PermissionsPrincipalApplication,
  type PermissionsPrincipalLimiting,
  type PermissionsPrincipalMain,
} from 'src/engine/permissions/principal/types/permissions-principals-context.type';
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
  mainPrincipal: PermissionsPrincipals['mainPrincipal'];
  roleIdsBySource: RoleIdsBySource;
}): keyof RoleIdsBySource | undefined => {
  if (!isDefined(mainPrincipal)) {
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
}): PermissionsPrincipalLimiting | undefined => {
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
}): PermissionsPrincipalApplication => {
  if (!isDefined(applicationRoleId)) {
    return { isCustomApp: true };
  }

  return isDefined(applicationId)
    ? { roleId: applicationRoleId, applicationId }
    : { roleId: applicationRoleId, isDeprecatedRoleOnly: true };
};

// undefined denies everything: the main principal has no role, or a role id cannot be placed without losing its restriction
export const buildPermissionsPrincipalRoles = ({
  roleIdsBySource,
  principals,
}: {
  roleIdsBySource: RoleIdsBySource;
  principals: PermissionsPrincipals;
}): Omit<PermissionsPrincipalsContext, 'workspaceId'> | undefined => {
  const mainRoleIdKey = getMainRoleIdKey({
    mainPrincipal: principals.mainPrincipal,
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

  const mainPrincipal: PermissionsPrincipalMain = isDefined(
    principals.mainPrincipal,
  )
    ? { ...principals.mainPrincipal, roleId: mainRoleId }
    : { roleId: mainRoleId, isDeprecatedRoleOnly: true };

  return {
    mainPrincipal,
    limitingPrincipal:
      mainRoleIdKey === 'agentRoleId'
        ? undefined
        : buildLimitingPrincipal({
            agentRoleId: roleIdsBySource.agentRoleId,
            agentId: principals.agentId,
          }),
    applicationPrincipal: buildApplicationPrincipal({
      applicationRoleId: roleIdsBySource.applicationRoleId,
      applicationId: principals.applicationId,
    }),
  };
};
