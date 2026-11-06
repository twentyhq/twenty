import { isDefined } from 'twenty-shared/utils';

import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { buildAiRunScope } from 'src/engine/permissions/__tests__/framework/build-permission-cache-values.util';
import { type GivenPrincipals } from 'src/engine/permissions/__tests__/framework/given-principals.util';
import {
  API_KEY_ID,
  APPLICATION_ID,
  LIMITING_AGENT_ID,
  MAIN_AGENT_ID,
  MAIN_APPLICATION_ID,
  MEMBER_ID,
  OAUTH_APPLICATION_ID,
  USER_ID,
  USER_WORKSPACE_ID,
  WEBHOOK_ID,
  WORKSPACE_ID,
} from 'src/engine/permissions/__tests__/framework/permission-test-ids.constant';

export const USER_AUTH_CONTEXT = {
  type: 'user',
  workspace: { id: WORKSPACE_ID },
  userWorkspaceId: USER_WORKSPACE_ID,
  workspaceMemberId: MEMBER_ID,
  user: { id: USER_ID },
  workspaceMember: { id: MEMBER_ID },
  userSessionVariant: 'standard',
} as unknown as WorkspaceAuthContext;

export const API_KEY_AUTH_CONTEXT = {
  type: 'apiKey',
  workspace: { id: WORKSPACE_ID },
  apiKey: { id: API_KEY_ID },
} as unknown as WorkspaceAuthContext;

export const APPLICATION_AUTH_CONTEXT = {
  type: 'application',
  workspace: { id: WORKSPACE_ID },
  application: { id: MAIN_APPLICATION_ID },
} as unknown as WorkspaceAuthContext;

export const WEBHOOK_AUTH_CONTEXT = {
  type: 'webhook',
  workspace: { id: WORKSPACE_ID },
  webhook: { id: WEBHOOK_ID },
} as unknown as WorkspaceAuthContext;

const buildUnreachablePrincipalsError = (reason: string) =>
  new Error(`These principals cannot be reached: ${reason}`);

const findActingApplicationIdOrThrow = (
  applicationPrincipal: GivenPrincipals<unknown>['applicationPrincipal'],
) => {
  switch (applicationPrincipal.type) {
    case 'application':
      return APPLICATION_ID;
    case 'oauthApplication':
      return OAUTH_APPLICATION_ID;
    case 'customApplication':
      return undefined;
    case 'sameApplicationAsMain':
      throw buildUnreachablePrincipalsError(
        'only a main application shares its application',
      );
  }
};

const buildMemberOrApiKeyAuthContextOrThrow = ({
  baseAuthContext,
  limitingPrincipal,
  applicationPrincipal,
}: Pick<
  GivenPrincipals<unknown>,
  'limitingPrincipal' | 'applicationPrincipal'
> & {
  baseAuthContext: WorkspaceAuthContext;
}) => {
  const actingApplicationId =
    findActingApplicationIdOrThrow(applicationPrincipal);

  return {
    ...baseAuthContext,
    ...(limitingPrincipal.type === 'agent' && { agentId: LIMITING_AGENT_ID }),
    ...(isDefined(actingApplicationId) && {
      application: { id: actingApplicationId },
    }),
  };
};

const buildAuthContextFromPrincipalsOrThrow = ({
  mainPrincipal,
  limitingPrincipal,
  applicationPrincipal,
}: GivenPrincipals<unknown>): object | undefined => {
  if (
    limitingPrincipal.type !== 'none' &&
    mainPrincipal.type !== 'workspaceMember' &&
    mainPrincipal.type !== 'apiKey'
  ) {
    throw buildUnreachablePrincipalsError(
      `a ${mainPrincipal.type} takes no limiting principal`,
    );
  }

  switch (mainPrincipal.type) {
    case 'workspaceMember':
      return buildMemberOrApiKeyAuthContextOrThrow({
        baseAuthContext: USER_AUTH_CONTEXT,
        limitingPrincipal,
        applicationPrincipal,
      });
    case 'apiKey':
      return buildMemberOrApiKeyAuthContextOrThrow({
        baseAuthContext: API_KEY_AUTH_CONTEXT,
        limitingPrincipal,
        applicationPrincipal,
      });
    case 'application':
      if (applicationPrincipal.type !== 'sameApplicationAsMain') {
        throw buildUnreachablePrincipalsError(
          'a main application acts as its own application',
        );
      }

      return APPLICATION_AUTH_CONTEXT;
    case 'agent':
      if (applicationPrincipal.type !== 'application') {
        throw buildUnreachablePrincipalsError(
          'a main agent runs inside an application with a role',
        );
      }

      return {
        ...APPLICATION_AUTH_CONTEXT,
        agentId: MAIN_AGENT_ID,
        application: { id: APPLICATION_ID },
      };
    case 'webhook':
      if (applicationPrincipal.type !== 'customApplication') {
        throw buildUnreachablePrincipalsError('a webhook has no application');
      }

      return WEBHOOK_AUTH_CONTEXT;
    case 'role':
      if (applicationPrincipal.type !== 'customApplication') {
        throw buildUnreachablePrincipalsError('a bare role has no application');
      }

      return undefined;
  }
};

// A bare role main principal has no auth context, callers build its principals directly
export const buildAuthContextOrThrow = ({
  principals,
  aiRunScope,
}: {
  principals: GivenPrincipals<unknown>;
  aiRunScope?: 'none' | 'allRecords';
}): WorkspaceAuthContext | undefined => {
  const authContext = buildAuthContextFromPrincipalsOrThrow(principals);

  if (!isDefined(authContext)) {
    return undefined;
  }

  return {
    ...authContext,
    ...(isDefined(aiRunScope) && { aiRunScope: buildAiRunScope(aiRunScope) }),
  } as WorkspaceAuthContext;
};
