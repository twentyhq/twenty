import { randomUUID } from 'node:crypto';

import { TEST_AI_MODEL_ID } from 'test/integration/constants/test-ai-model-ids.constants';
import {
  coreWorkflowGraphqlRequest,
  createCoreWorkflow,
  deleteCoreWorkflows,
} from 'test/integration/graphql/suites/workflow/utils/core-workflow.util';
import { currentUser } from 'test/integration/graphql/suites/user-session/utils/current-user.util';
import { deleteUserFromWorkspace } from 'test/integration/graphql/suites/user-session/utils/delete-user-from-workspace.util';
import { signUpInWorkspaceAndGetAccessToken } from 'test/integration/graphql/utils/sign-up-in-workspace-and-get-access-token.util';
import { createOneAgent } from 'test/integration/metadata/suites/agent/utils/create-one-agent.util';
import { deleteOneAgent } from 'test/integration/metadata/suites/agent/utils/delete-one-agent.util';
import { updateOneAgent } from 'test/integration/metadata/suites/agent/utils/update-one-agent.util';
import { createOneViewOnObject } from 'test/integration/metadata/suites/view/utils/create-one-view-on-object.util';
import { destroyOneView } from 'test/integration/metadata/suites/view/utils/destroy-one-view.util';
import { findViewOwnership } from 'test/integration/metadata/suites/view/utils/find-view-ownership.util';
import { updateOneView } from 'test/integration/metadata/suites/view/utils/update-one-view.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_WORKSPACE_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-user-workspaces.util';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const findUserWorkspaceIdByEmail = async (email: string): Promise<string> => {
  const [{ id }] = await global.testDataSource.query(
    `SELECT "userWorkspace".id FROM core."userWorkspace" "userWorkspace"
      JOIN core."user" "user" ON "user".id = "userWorkspace"."userId"
      WHERE "user".email = $1 AND "userWorkspace"."workspaceId" = $2`,
    [email, SEED_APPLE_WORKSPACE_ID],
  );

  return id;
};

const findWorkflowOwner = async (
  coreWorkflowId: string,
): Promise<string | null> => {
  const [{ createdByUserWorkspaceId }] = await global.testDataSource.query(
    `SELECT "createdByUserWorkspaceId" FROM core."workflow" WHERE id = $1`,
    [coreWorkflowId],
  );

  return createdByUserWorkspaceId;
};

const createWorkflowOwnedBy = async ({
  name,
  isPrivate,
  userWorkspaceId,
}: {
  name: string;
  isPrivate: boolean;
  userWorkspaceId: string;
}): Promise<string> => {
  const { coreWorkflowId } = await createCoreWorkflow({ name });

  await global.testDataSource.query(
    `UPDATE core."workflow" SET "createdByUserWorkspaceId" = $2, "isPrivate" = $3 WHERE id = $1`,
    [coreWorkflowId, userWorkspaceId, isPrivate],
  );

  await getAppProviderByClassName<WorkspaceCacheService>(
    'WorkspaceCacheService',
  ).invalidateAndRecompute(SEED_APPLE_WORKSPACE_ID, ['flatWorkflowMaps']);

  return coreWorkflowId;
};

const findAgentOwner = async (agentId: string): Promise<string | null> => {
  const [{ createdByUserWorkspaceId }] = await global.testDataSource.query(
    `SELECT "createdByUserWorkspaceId" FROM core."agent" WHERE id = $1`,
    [agentId],
  );

  return createdByUserWorkspaceId;
};

const createSharedAgentOwnedBy = async (
  userWorkspaceId: string,
): Promise<string> => {
  const { data } = await createOneAgent({
    input: {
      label: 'Leaving member shared agent',
      prompt: 'Shared agent prompt',
      modelId: TEST_AI_MODEL_ID,
      responseFormat: { type: 'text' },
      isPrivate: false,
    },
    gqlFields: 'id',
    expectToFail: false,
    token: APPLE_JANE_ADMIN_ACCESS_TOKEN,
  });

  await global.testDataSource.query(
    `UPDATE core."agent" SET "createdByUserWorkspaceId" = $2 WHERE id = $1`,
    [data.createOneAgent.id, userWorkspaceId],
  );

  await getAppProviderByClassName<WorkspaceCacheService>(
    'WorkspaceCacheService',
  ).invalidateAndRecompute(SEED_APPLE_WORKSPACE_ID, ['flatAgentMaps']);

  return data.createOneAgent.id;
};

describe('removing a member from the workspace', () => {
  let privateViewId: string;
  let sharedViewId: string;
  let privateCoreWorkflowId: string;
  let sharedCoreWorkflowId: string;
  let sharedAgentId: string;

  beforeAll(async () => {
    const email = `private-metadata-successor-${randomUUID()}@example.com`;
    const leavingMemberAccessToken =
      await signUpInWorkspaceAndGetAccessToken(email);
    const leavingUserWorkspaceId = await findUserWorkspaceIdByEmail(email);

    const { data } = await currentUser({
      token: leavingMemberAccessToken,
      gqlFields: 'workspaceMember { id }',
      expectToFail: false,
    });

    privateViewId = await createOneViewOnObject({
      objectNameSingular: 'company',
      input: {
        name: 'Leaving member private view',
        isPrivate: true,
      },
      token: leavingMemberAccessToken,
    });
    sharedViewId = await createOneViewOnObject({
      objectNameSingular: 'company',
      input: {
        name: 'Leaving member shared view',
        isPrivate: false,
      },
      token: leavingMemberAccessToken,
    });

    privateCoreWorkflowId = await createWorkflowOwnedBy({
      name: 'Leaving member private workflow',
      isPrivate: true,
      userWorkspaceId: leavingUserWorkspaceId,
    });
    sharedCoreWorkflowId = await createWorkflowOwnedBy({
      name: 'Leaving member shared workflow',
      isPrivate: false,
      userWorkspaceId: leavingUserWorkspaceId,
    });
    sharedAgentId = await createSharedAgentOwnedBy(leavingUserWorkspaceId);

    await deleteUserFromWorkspace({
      input: {
        workspaceMemberIdToDelete: data.currentUser.workspaceMember.id,
      },
      expectToFail: false,
      token: APPLE_JANE_ADMIN_ACCESS_TOKEN,
    });
  });

  afterAll(async () => {
    await destroyOneView({ viewId: privateViewId });
    await destroyOneView({ viewId: sharedViewId });
    await deleteCoreWorkflows({
      coreWorkflowIds: [privateCoreWorkflowId, sharedCoreWorkflowId],
    });
    await deleteOneAgent({
      input: { id: sharedAgentId },
      expectToFail: false,
      token: APPLE_JANE_ADMIN_ACCESS_TOKEN,
    });
  });

  it('hands their private views and workflows to the admin removing them', async () => {
    expect(await findViewOwnership(privateViewId)).toEqual({
      isPrivate: true,
      createdByUserWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.JANE,
    });
    expect(await findWorkflowOwner(privateCoreWorkflowId)).toBe(
      USER_WORKSPACE_DATA_SEED_IDS.JANE,
    );
  });

  it('leaves their shared views, workflows and agents shared, without a creator', async () => {
    expect(await findViewOwnership(sharedViewId)).toEqual({
      isPrivate: false,
      createdByUserWorkspaceId: null,
    });
    expect(await findWorkflowOwner(sharedCoreWorkflowId)).toBeNull();
    expect(await findAgentOwner(sharedAgentId)).toBeNull();
  });

  it('lets no member change who sees what they shared', async () => {
    const { coreWorkflowById } = await coreWorkflowGraphqlRequest<{
      coreWorkflowById: { canChangeVisibility: boolean };
    }>({
      query: `
        query CoreWorkflowById($coreWorkflowId: UUID!) {
          coreWorkflowById(coreWorkflowId: $coreWorkflowId) {
            canChangeVisibility
          }
        }
      `,
      variables: { coreWorkflowId: sharedCoreWorkflowId },
    });

    const { errors: agentErrors } = await updateOneAgent({
      input: { id: sharedAgentId, isPrivate: true },
      gqlFields: 'isPrivate',
      expectToFail: true,
      token: APPLE_JANE_ADMIN_ACCESS_TOKEN,
    });

    const { errors: viewErrors } = await updateOneView({
      viewId: sharedViewId,
      input: { id: sharedViewId, isPrivate: true },
      gqlFields: 'id',
      expectToFail: true,
      token: APPLE_JANE_ADMIN_ACCESS_TOKEN,
    });

    expect(coreWorkflowById.canChangeVisibility).toBe(false);
    for (const errors of [agentErrors, viewErrors]) {
      expect(errors?.[0]?.extensions?.code).toBe('METADATA_VALIDATION_FAILED');
    }
    expect(await findAgentOwner(sharedAgentId)).toBeNull();
    expect(await findViewOwnership(sharedViewId)).toEqual({
      isPrivate: false,
      createdByUserWorkspaceId: null,
    });
  });
});
