import {
  type PermissionTestPrincipals,
  type PermissionTestWorkspace,
} from 'test/integration/permissions/utils/permission-test-workspace.type';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import { resolveWorkspaceMemberAuthContext } from 'test/integration/utils/resolve-workspace-member-auth-context.util';

import { ApiKeyEntity } from 'src/engine/core-modules/api-key/api-key.entity';
import { fromApiKeyEntityToFlat } from 'src/engine/core-modules/api-key/utils/from-api-key-entity-to-flat.util';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { fromApplicationEntityToFlatApplication } from 'src/engine/core-modules/application/utils/from-application-entity-to-flat-application.util';
import { buildApiKeyAuthContext } from 'src/engine/core-modules/auth/utils/build-api-key-auth-context.util';
import { buildApplicationAuthContext } from 'src/engine/core-modules/auth/utils/build-application-auth-context.util';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { fromWorkspaceEntityToFlat } from 'src/engine/core-modules/workspace/utils/from-workspace-entity-to-flat.util';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

type ApplicationPrincipalQuestion = {
  applicationPrincipal: PermissionTestPrincipals['applicationPrincipal'];
  workspace: Pick<
    PermissionTestWorkspace,
    'applicationIds' | 'mainApplicationId' | 'oauthApplicationId'
  >;
};

const findApplicationOrThrow = async ({
  applicationPrincipal,
  workspace,
}: ApplicationPrincipalQuestion) => {
  const findApplicationById = async (id: string) =>
    fromApplicationEntityToFlatApplication(
      await getCoreRepository<ApplicationEntity>(
        ApplicationEntity,
      ).findOneByOrFail({ id }),
    );

  switch (applicationPrincipal.type) {
    case 'application':
      return findApplicationById(
        workspace.applicationIds[applicationPrincipal.role],
      );
    case 'sameApplicationAsMain':
      return findApplicationById(workspace.mainApplicationId);
    case 'oauthApplication':
      return findApplicationById(workspace.oauthApplicationId);
    case 'customApplication':
      throw new Error('A custom application has no application principal');
  }
};

const buildApplicationNarrowing = async ({
  applicationPrincipal,
  workspace,
}: ApplicationPrincipalQuestion) =>
  applicationPrincipal.type === 'customApplication'
    ? {}
    : {
        application: await findApplicationOrThrow({
          applicationPrincipal,
          workspace,
        }),
      };

const buildLimitingNarrowing = ({
  limitingPrincipal,
  workspace,
}: {
  limitingPrincipal: PermissionTestPrincipals['limitingPrincipal'];
  workspace: Pick<
    PermissionTestWorkspace,
    'limitingAgentIds' | 'limitingAgentWithoutRoleId'
  >;
}) => {
  switch (limitingPrincipal.type) {
    case 'agent':
      return { agentId: workspace.limitingAgentIds[limitingPrincipal.role] };
    case 'agentWithoutRole':
      return { agentId: workspace.limitingAgentWithoutRoleId };
    case 'none':
      return {};
  }
};

export const buildPermissionTestAuthContext = async ({
  principals: { mainPrincipal, limitingPrincipal, applicationPrincipal },
  workspace,
}: {
  principals: PermissionTestPrincipals;
  workspace: PermissionTestWorkspace;
}): Promise<WorkspaceAuthContext> => {
  const flatWorkspace = fromWorkspaceEntityToFlat(
    await getCoreRepository<WorkspaceEntity>(WorkspaceEntity).findOneByOrFail({
      id: workspace.workspaceId,
    }),
  );
  const limitingNarrowing = buildLimitingNarrowing({
    limitingPrincipal,
    workspace,
  });

  switch (mainPrincipal.type) {
    case 'workspaceMember':
      return {
        ...(await resolveWorkspaceMemberAuthContext({
          workspaceId: workspace.workspaceId,
          workspaceMemberId: workspace.workspaceMemberIds[mainPrincipal.role],
        })),
        ...limitingNarrowing,
        ...(await buildApplicationNarrowing({
          applicationPrincipal,
          workspace,
        })),
      };
    case 'apiKey':
      return {
        ...buildApiKeyAuthContext({
          workspace: flatWorkspace,
          apiKey: fromApiKeyEntityToFlat(
            await getCoreRepository<ApiKeyEntity>(ApiKeyEntity).findOneByOrFail(
              { id: workspace.apiKeyIds[mainPrincipal.role] },
            ),
          ),
        }),
        ...limitingNarrowing,
        ...(await buildApplicationNarrowing({
          applicationPrincipal,
          workspace,
        })),
      };
    case 'application':
      return buildApplicationAuthContext({
        workspace: flatWorkspace,
        application: await findApplicationOrThrow({
          applicationPrincipal,
          workspace,
        }),
      });
    case 'agent':
      return buildApplicationAuthContext({
        workspace: flatWorkspace,
        application: await findApplicationOrThrow({
          applicationPrincipal,
          workspace,
        }),
        agentId: workspace.mainAgentId,
      });
  }
};
