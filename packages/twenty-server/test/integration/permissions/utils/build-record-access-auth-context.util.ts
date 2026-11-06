import {
  type RecordAccessPrincipals,
  type RecordAccessWorkspace,
} from 'test/integration/permissions/utils/record-access-workspace.type';
import { resolveWorkspaceMemberAuthContext } from 'test/integration/utils/resolve-workspace-member-auth-context.util';
import { isDefined } from 'twenty-shared/utils';

import { type PermissionsAuthContext } from 'src/engine/permissions/principal/types/permissions-auth-context.type';

const findApplicationPrincipalId = ({
  applicationPrincipal,
  workspace,
}: {
  applicationPrincipal: RecordAccessPrincipals['applicationPrincipal'];
  workspace: Pick<
    RecordAccessWorkspace,
    'applicationIds' | 'mainApplicationId' | 'oauthApplicationId'
  >;
}): string | undefined => {
  switch (applicationPrincipal.type) {
    case 'application':
      return workspace.applicationIds[applicationPrincipal.role];
    case 'sameApplicationAsMain':
      return workspace.mainApplicationId;
    case 'oauthApplication':
      return workspace.oauthApplicationId;
    case 'customApplication':
      return undefined;
  }
};

const findLimitingAgentId = ({
  limitingPrincipal,
  workspace,
}: {
  limitingPrincipal: RecordAccessPrincipals['limitingPrincipal'];
  workspace: Pick<
    RecordAccessWorkspace,
    'limitingAgentIds' | 'limitingAgentWithoutRoleId'
  >;
}): string | undefined => {
  switch (limitingPrincipal.type) {
    case 'agent':
      return workspace.limitingAgentIds[limitingPrincipal.role];
    case 'agentWithoutRole':
      return workspace.limitingAgentWithoutRoleId;
    case 'none':
      return undefined;
  }
};

export const buildRecordAccessAuthContext = async ({
  principals: { mainPrincipal, limitingPrincipal, applicationPrincipal },
  workspace,
}: {
  principals: RecordAccessPrincipals;
  workspace: RecordAccessWorkspace;
}): Promise<PermissionsAuthContext> => {
  const applicationId = findApplicationPrincipalId({
    applicationPrincipal,
    workspace,
  });
  const workspaceReference = { id: workspace.workspaceId };
  const narrowing = {
    workspace: workspaceReference,
    agentId: findLimitingAgentId({ limitingPrincipal, workspace }),
    application: isDefined(applicationId) ? { id: applicationId } : undefined,
  };

  switch (mainPrincipal.type) {
    case 'workspaceMember':
      return {
        ...(await resolveWorkspaceMemberAuthContext({
          workspaceId: workspace.workspaceId,
          workspaceMemberId: workspace.workspaceMemberIds[mainPrincipal.role],
        })),
        ...narrowing,
      };
    case 'apiKey':
      return {
        ...narrowing,
        type: 'apiKey',
        apiKey: { id: workspace.apiKeyIds[mainPrincipal.role] },
      };
    case 'application':
      return {
        type: 'application',
        workspace: workspaceReference,
        application: { id: workspace.mainApplicationId },
      };
    case 'agent':
      return {
        type: 'application',
        workspace: workspaceReference,
        application: { id: applicationId as string },
        agentId: workspace.mainAgentId,
      };
    case 'webhook':
      return {
        type: 'webhook',
        workspace: workspaceReference,
        webhook: { id: workspace.webhookId },
      };
  }
};
