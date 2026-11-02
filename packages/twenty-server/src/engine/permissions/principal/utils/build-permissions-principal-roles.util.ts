/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import {
  type PermissionsPrincipalsContext,
  type PermissionsPrincipalActors,
  type PermissionsPrincipalApp,
  type PermissionsPrincipalLimiting,
  type PermissionsPrincipalMain,
} from 'src/engine/permissions/principal/types/permissions-principals-context.type';
import { type RoleIdsBySource } from 'src/engine/permissions/principal/types/role-permission-config.type';

const ACTORLESS_MAIN_ROLE_SOURCES: (keyof RoleIdsBySource)[] = [
  'userWorkspaceRoleId',
  'apiKeyRoleId',
  'webhookRoleId',
  'applicationRoleId',
  'agentRoleId',
];

const getMainRoleSource = ({
  mainActor,
  roleIdsBySource,
}: {
  mainActor: PermissionsPrincipalActors['main'];
  roleIdsBySource: RoleIdsBySource;
}): keyof RoleIdsBySource | undefined => {
  if (!isDefined(mainActor)) {
    return ACTORLESS_MAIN_ROLE_SOURCES.find(
      (source) => roleIdsBySource[source] !== undefined,
    );
  }

  if ('workspaceMemberId' in mainActor) {
    return 'userWorkspaceRoleId';
  }

  if ('apiKeyId' in mainActor) {
    return 'apiKeyRoleId';
  }

  if ('agentId' in mainActor) {
    return 'agentRoleId';
  }

  if ('applicationId' in mainActor) {
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

// undefined denies everything: the main actor has no role, or a source cannot be placed without losing its restriction
export const buildPermissionsPrincipalRoles = ({
  roleIdsBySource,
  actors,
}: {
  roleIdsBySource: RoleIdsBySource;
  actors: PermissionsPrincipalActors;
}): Omit<PermissionsPrincipalsContext, 'workspaceId'> | undefined => {
  const mainRoleSource = getMainRoleSource({
    mainActor: actors.main,
    roleIdsBySource,
  });

  if (!isDefined(mainRoleSource)) {
    return undefined;
  }

  const hasUnplacedSource = Object.entries(roleIdsBySource).some(
    ([source, roleId]) =>
      roleId !== undefined &&
      source !== mainRoleSource &&
      source !== 'agentRoleId' &&
      source !== 'applicationRoleId',
  );
  const mainRoleId = roleIdsBySource[mainRoleSource];

  if (hasUnplacedSource || !isDefined(mainRoleId)) {
    return undefined;
  }

  const mainPrincipal: PermissionsPrincipalMain = isDefined(actors.main)
    ? { ...actors.main, roleId: mainRoleId }
    : { roleId: mainRoleId, isDeprecatedRoleOnly: true };

  return {
    mainPrincipal,
    limiting:
      mainRoleSource === 'agentRoleId'
        ? undefined
        : buildLimiting({
            agentRoleId: roleIdsBySource.agentRoleId,
            agentId: actors.agentId,
          }),
    app: buildApp({
      applicationRoleId: roleIdsBySource.applicationRoleId,
      applicationId: actors.applicationId,
    }),
  };
};
