import { isDefined } from 'twenty-shared/utils';

import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import {
  type GivenApplicationPrincipal,
  type GivenLimitingPrincipal,
  type GivenMainPrincipal,
  type GivenPrincipals,
} from 'src/engine/permissions/__tests__/framework/given-principals.util';
import {
  API_KEY_ID,
  APPLICATION_ID,
  APPLICATION_ROLE_ID,
  LIMITING_AGENT_ID,
  LIMITING_ROLE_ID,
  MAIN_AGENT_ID,
  MAIN_APPLICATION_ID,
  MAIN_ROLE_ID,
  MEMBER_ID,
  OAUTH_APPLICATION_ID,
  WEBHOOK_ID,
  WORKSPACE_ID,
} from 'src/engine/permissions/__tests__/framework/permission-test-ids.constant';
import { buildAiRunScope } from 'src/engine/permissions/__tests__/framework/role-fixtures.util';
import {
  type PermissionsApplicationPrincipalWithRole,
  type PermissionsLimitingPrincipalWithRole,
  type PermissionsMainPrincipalWithRole,
  type PermissionsPrincipalsWithRolesContext,
} from 'src/engine/permissions/principal/types/permissions-principals-with-roles-context.type';

// The fake PrincipalPermissionsService returns the given principals without reading it
export const UNREAD_AUTH_CONTEXT = { type: 'user' } as WorkspaceAuthContext;

const buildMainPrincipal = ({
  type,
}: GivenMainPrincipal<unknown>): PermissionsMainPrincipalWithRole => {
  const roleId = MAIN_ROLE_ID;

  switch (type) {
    case 'workspaceMember':
      return { type, workspaceMemberId: MEMBER_ID, roleId };
    case 'apiKey':
      return { type, apiKeyId: API_KEY_ID, roleId };
    case 'agent':
      return { type, agentId: MAIN_AGENT_ID, roleId };
    case 'application':
      return { type, applicationId: MAIN_APPLICATION_ID, roleId };
    case 'webhook':
      return { type, webhookId: WEBHOOK_ID, roleId };
    case 'role':
      return { type, roleId };
  }
};

const buildLimitingPrincipal = (
  limitingPrincipal: GivenLimitingPrincipal<unknown>,
): PermissionsLimitingPrincipalWithRole | undefined =>
  limitingPrincipal.type === 'agent'
    ? { type: 'agent', agentId: LIMITING_AGENT_ID, roleId: LIMITING_ROLE_ID }
    : undefined;

const buildApplicationPrincipal = ({
  type,
}: GivenApplicationPrincipal<unknown>): PermissionsApplicationPrincipalWithRole => {
  switch (type) {
    case 'application':
      return {
        type,
        applicationId: APPLICATION_ID,
        roleId: APPLICATION_ROLE_ID,
      };
    case 'oauthApplication':
      return {
        type: 'application',
        applicationId: OAUTH_APPLICATION_ID,
        roleId: MAIN_ROLE_ID,
      };
    case 'sameApplicationAsMain':
      return {
        type: 'application',
        applicationId: MAIN_APPLICATION_ID,
        roleId: MAIN_ROLE_ID,
      };
    case 'customApplication':
      return { type };
  }
};

export const buildPrincipals = ({
  mainPrincipal,
  limitingPrincipal,
  applicationPrincipal,
  aiRunScope,
}: GivenPrincipals<unknown> & {
  aiRunScope?: 'none' | 'allRecords';
}): PermissionsPrincipalsWithRolesContext => {
  const limitingPrincipalWithRole = buildLimitingPrincipal(limitingPrincipal);

  return {
    workspaceId: WORKSPACE_ID,
    mainPrincipal: buildMainPrincipal(mainPrincipal),
    ...(isDefined(limitingPrincipalWithRole) && {
      limitingPrincipal: limitingPrincipalWithRole,
    }),
    applicationPrincipal: buildApplicationPrincipal(applicationPrincipal),
    ...(isDefined(aiRunScope) && { aiRunScope: buildAiRunScope(aiRunScope) }),
  };
};
