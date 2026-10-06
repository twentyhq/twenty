import { captureCodeInterpreterSandboxToken } from 'test/integration/graphql/suites/user-session/utils/capture-code-interpreter-sandbox-token.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { isDefined } from 'twenty-shared/utils';

import { type UserWorkspaceAuthContextService } from 'src/engine/core-modules/user-workspace/services/user-workspace-auth-context.service';
import { type AgentActorContextService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-actor-context.service';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_WORKSPACE_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-user-workspaces.util';

const requireToken = (token: string | undefined): string => {
  if (!isDefined(token)) {
    throw new Error('Expected the sandbox to receive a token');
  }

  return token;
};

export type CodeInterpreterSandboxTokens = {
  applicationRunAsJaneToken: string;
  janeDirectRunToken: string;
};

export const captureCodeInterpreterSandboxTokens = async ({
  applicationId,
}: {
  applicationId: string;
}): Promise<CodeInterpreterSandboxTokens> => {
  const { flatApplicationMaps } =
    await getAppProviderByClassName<WorkspaceCacheService>(
      'WorkspaceCacheService',
    ).getOrRecompute(SEED_APPLE_WORKSPACE_ID, ['flatApplicationMaps']);

  const flatApplication = flatApplicationMaps.byId[applicationId];

  if (!isDefined(flatApplication)) {
    throw new Error(`Application ${applicationId} is not in the cache`);
  }

  const { authContext: runAsJaneContext, roleId: janeRoleId } =
    await getAppProviderByClassName<AgentActorContextService>(
      'AgentActorContextService',
    ).buildRunAsWorkspaceMemberContext({
      workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      viaApplication: flatApplication,
    });

  const janeContext =
    await getAppProviderByClassName<UserWorkspaceAuthContextService>(
      'UserWorkspaceAuthContextService',
    ).resolve({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.JANE,
    });

  return {
    applicationRunAsJaneToken: requireToken(
      await captureCodeInterpreterSandboxToken({
        authContext: runAsJaneContext,
        roleId: janeRoleId,
      }),
    ),
    janeDirectRunToken: requireToken(
      await captureCodeInterpreterSandboxToken({
        authContext: janeContext,
        roleId: janeRoleId,
      }),
    ),
  };
};
