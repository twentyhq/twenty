/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import {
  type PermissionsPrincipalsContext,
  type PermissionsPrincipalIds,
  type PermissionsPrincipalApp,
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
  mainPrincipal: PermissionsPrincipalIds['mainPrincipal'];
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
const buildLimiting = ({
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

const buildApp = ({
  applicationRoleId,
  applicationId,
}: {
  applicationRoleId: string | null | undefined;
  applicationId: string | undefined;
}): PermissionsPrincipalApp => {
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
  principalIds,
}: {
  roleIdsBySource: RoleIdsBySource;
  principalIds: PermissionsPrincipalIds;
}): Omit<PermissionsPrincipalsContext, 'workspaceId'> | undefined => {
  const mainRoleIdKey = getMainRoleIdKey({
    mainPrincipal: principalIds.mainPrincipal,
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
    principalIds.mainPrincipal,
  )
    ? { ...principalIds.mainPrincipal, roleId: mainRoleId }
    : { roleId: mainRoleId, isDeprecatedRoleOnly: true };

  return {
    mainPrincipal,
    limiting:
      mainRoleIdKey === 'agentRoleId'
        ? undefined
        : buildLimiting({
            agentRoleId: roleIdsBySource.agentRoleId,
            agentId: principalIds.agentId,
          }),
    app: buildApp({
      applicationRoleId: roleIdsBySource.applicationRoleId,
      applicationId: principalIds.applicationId,
    }),
  };
};
