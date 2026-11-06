import { type RecordAccessWorkspace } from 'test/integration/permissions/utils/record-access-workspace.type';
import { resolveWorkspaceMemberAuthContext } from 'test/integration/utils/resolve-workspace-member-auth-context.util';

import { type GivenPrincipals } from 'src/engine/permissions/__tests__/framework/given-principals.util';
import { type RoleGrant } from 'src/engine/permissions/__tests__/framework/record-access-scenario.type';
import { type PermissionsAuthContext } from 'src/engine/permissions/principal/types/permissions-auth-context.type';

const findApplicationPrincipalId = ({
  applicationPrincipal,
  workspace,
}: {
  applicationPrincipal: GivenPrincipals<RoleGrant>['applicationPrincipal'];
  workspace: RecordAccessWorkspace;
}): string | undefined => {
  switch (applicationPrincipal.type) {
    case 'application':
      return workspace.applicationIds[applicationPrincipal.role];
    case 'sameApplicationAsMain':
      return workspace.mainApplicationId;
    case 'customApplication':
      return undefined;
    case 'oauthApplication':
      return workspace.oauthApplicationId;
  }
};

export const buildRecordAccessAuthContext = async ({
  given: { mainPrincipal, limitingPrincipal, applicationPrincipal },
  workspace,
}: {
  given: GivenPrincipals<RoleGrant>;
  workspace: RecordAccessWorkspace;
}): Promise<PermissionsAuthContext> => {
  const applicationId = findApplicationPrincipalId({
    applicationPrincipal,
    workspace,
  });
  const narrowing = {
    workspace: { id: workspace.workspaceId },
    agentId:
      limitingPrincipal.type === 'agent'
        ? workspace.limitingAgentIds[limitingPrincipal.role]
        : undefined,
    application:
      applicationId === undefined ? undefined : { id: applicationId },
  };

  switch (mainPrincipal.type) {
    case 'workspaceMember':
      return {
        ...(await resolveWorkspaceMemberAuthContext({
          workspaceId: workspace.workspaceId,
          workspaceMemberId:
            workspace.members[mainPrincipal.role].workspaceMemberId,
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
        workspace: narrowing.workspace,
        application: { id: workspace.mainApplicationId },
      };
    case 'agent':
      return {
        type: 'application',
        workspace: narrowing.workspace,
        application: { id: applicationId as string },
        agentId: workspace.mainAgentId,
      };
    case 'webhook':
      return {
        type: 'webhook',
        workspace: narrowing.workspace,
        webhook: { id: workspace.webhookId },
      };
    case 'role':
      throw new Error('No auth context resolves to a bare role');
  }
};
