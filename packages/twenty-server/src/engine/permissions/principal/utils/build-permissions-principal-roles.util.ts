/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { WORKSPACE_APP_ROLE_ID } from 'src/engine/permissions/principal/constants/workspace-app-role-id.constant';
import {
  type PermissionsPrincipal,
  type PermissionsPrincipalMainActor,
} from 'src/engine/permissions/principal/types/permissions-principal.type';
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
  mainActor: PermissionsPrincipalMainActor | undefined;
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

// A source left over once the actor, agent and app are placed would lose its restriction, so it denies
export const buildPermissionsPrincipalRoles = ({
  roleIdsBySource,
  mainActor,
}: {
  roleIdsBySource: RoleIdsBySource;
  mainActor: PermissionsPrincipalMainActor | undefined;
}): Omit<PermissionsPrincipal, 'workspaceId'> => {
  const mainRoleSource = getMainRoleSource({ mainActor, roleIdsBySource });
  const { agentRoleId, applicationRoleId } = roleIdsBySource;

  const hasUnplacedSource = Object.entries(roleIdsBySource).some(
    ([source, roleId]) =>
      roleId !== undefined &&
      source !== mainRoleSource &&
      source !== 'agentRoleId' &&
      source !== 'applicationRoleId',
  );

  const mainRoleId = hasUnplacedSource
    ? null
    : isDefined(mainRoleSource)
      ? (roleIdsBySource[mainRoleSource] ?? null)
      : null;

  return {
    main: { ...mainActor, roleId: mainRoleId },
    limitingRoleId: mainRoleSource === 'agentRoleId' ? undefined : agentRoleId,
    appRoleId:
      applicationRoleId === undefined
        ? WORKSPACE_APP_ROLE_ID
        : applicationRoleId,
  };
};
