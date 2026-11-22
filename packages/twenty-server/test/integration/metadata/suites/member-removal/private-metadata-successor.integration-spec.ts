import { randomUUID } from 'node:crypto';

import {
  createCoreWorkflow,
  deleteCoreWorkflows,
} from 'test/integration/graphql/suites/workflow/utils/core-workflow.util';
import { currentUser } from 'test/integration/graphql/suites/user-session/utils/current-user.util';
import { deleteUserFromWorkspace } from 'test/integration/graphql/suites/user-session/utils/delete-user-from-workspace.util';
import { signUpInWorkspaceAndGetAccessToken } from 'test/integration/graphql/utils/sign-up-in-workspace-and-get-access-token.util';
import { createOneViewOnObject } from 'test/integration/metadata/suites/view/utils/create-one-view-on-object.util';
import { destroyOneView } from 'test/integration/metadata/suites/view/utils/destroy-one-view.util';
import { findViewOwnership } from 'test/integration/metadata/suites/view/utils/find-view-ownership.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { ViewVisibility } from 'twenty-shared/types';

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

describe('removing a member from the workspace', () => {
  let privateViewId: string;
  let sharedViewId: string;
  let privateCoreWorkflowId: string;
  let sharedCoreWorkflowId: string;

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
        visibility: ViewVisibility.UNLISTED,
      },
      token: leavingMemberAccessToken,
    });
    sharedViewId = await createOneViewOnObject({
      objectNameSingular: 'company',
      input: {
        name: 'Leaving member shared view',
        visibility: ViewVisibility.WORKSPACE,
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
  });

  it('hands their private views and workflows to the admin removing them', async () => {
    expect(await findViewOwnership(privateViewId)).toEqual({
      visibility: ViewVisibility.UNLISTED,
      createdByUserWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.JANE,
    });
    expect(await findWorkflowOwner(privateCoreWorkflowId)).toBe(
      USER_WORKSPACE_DATA_SEED_IDS.JANE,
    );
  });

  it('leaves their shared views and workflows shared, without a creator', async () => {
    expect(await findViewOwnership(sharedViewId)).toEqual({
      visibility: ViewVisibility.WORKSPACE,
      createdByUserWorkspaceId: null,
    });
    expect(await findWorkflowOwner(sharedCoreWorkflowId)).toBeNull();
  });
});
