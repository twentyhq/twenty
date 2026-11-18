import {
  createCoreWorkflow,
  deleteCoreWorkflows,
} from 'test/integration/graphql/suites/workflow/utils/core-workflow.util';
import { createOneViewOnObject } from 'test/integration/metadata/suites/view/utils/create-one-view-on-object.util';
import { destroyOneView } from 'test/integration/metadata/suites/view/utils/destroy-one-view.util';
import { findViewOwnership } from 'test/integration/metadata/suites/view/utils/find-view-ownership.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import { ViewVisibility, WorkflowVisibility } from 'twenty-shared/types';

import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { type CoreWorkflowOwnershipTransferService } from 'src/engine/core-modules/workflow/services/core-workflow-ownership-transfer.service';
import { type ViewOwnershipTransferService } from 'src/engine/metadata-modules/view/services/view-ownership-transfer.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_WORKSPACE_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-user-workspaces.util';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const findWorkflowOwner = async (coreWorkflowId: string): Promise<string> => {
  const [{ createdByUserWorkspaceId }] = await global.testDataSource.query(
    `SELECT "createdByUserWorkspaceId" FROM core."workflow" WHERE id = $1`,
    [coreWorkflowId],
  );

  return createdByUserWorkspaceId;
};

const makeWorkflowOwnedByJony = async ({
  name,
  visibility,
}: {
  name: string;
  visibility: WorkflowVisibility;
}): Promise<string> => {
  const { coreWorkflowId } = await createCoreWorkflow({ name });

  await global.testDataSource.query(
    `UPDATE core."workflow" SET "createdByUserWorkspaceId" = $2, "visibility" = $3 WHERE id = $1`,
    [coreWorkflowId, USER_WORKSPACE_DATA_SEED_IDS.JONY, visibility],
  );

  await getAppProviderByClassName<WorkspaceCacheService>(
    'WorkspaceCacheService',
  ).invalidateAndRecompute(SEED_APPLE_WORKSPACE_ID, ['flatWorkflowMaps']);

  return coreWorkflowId;
};

describe('private views and workflows of a removed member', () => {
  let privateViewId: string;
  let sharedViewId: string;
  let privateCoreWorkflowId: string;
  let sharedCoreWorkflowId: string;

  beforeAll(async () => {
    privateViewId = await createOneViewOnObject({
      objectNameSingular: 'company',
      input: { name: 'Jony private view', visibility: ViewVisibility.UNLISTED },
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
    });
    sharedViewId = await createOneViewOnObject({
      objectNameSingular: 'company',
      input: { name: 'Jony shared view', visibility: ViewVisibility.WORKSPACE },
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
    });

    privateCoreWorkflowId = await makeWorkflowOwnedByJony({
      name: 'Jony private workflow',
      visibility: WorkflowVisibility.PRIVATE,
    });
    sharedCoreWorkflowId = await makeWorkflowOwnedByJony({
      name: 'Jony shared workflow',
      visibility: WorkflowVisibility.WORKSPACE,
    });

    const removedUserWorkspace = await getCoreRepository<UserWorkspaceEntity>(
      UserWorkspaceEntity,
    ).findOneByOrFail({ id: USER_WORKSPACE_DATA_SEED_IDS.JONY });

    await getAppProviderByClassName<ViewOwnershipTransferService>(
      'ViewOwnershipTransferService',
    ).transferPrivateViewsToSuccessor({
      removedUserWorkspace,
      actingUserWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.JANE,
    });

    await getAppProviderByClassName<CoreWorkflowOwnershipTransferService>(
      'CoreWorkflowOwnershipTransferService',
    ).transferPrivateWorkflowsToSuccessor({
      removedUserWorkspace,
      actingUserWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.JANE,
    });
  });

  afterAll(async () => {
    await destroyOneView({ viewId: privateViewId });
    await destroyOneView({ viewId: sharedViewId });
    await deleteCoreWorkflows({
      coreWorkflowIds: [privateCoreWorkflowId, sharedCoreWorkflowId],
    });
  });

  it('hands private views and workflows to the acting admin', async () => {
    expect(await findViewOwnership(privateViewId)).toEqual({
      visibility: ViewVisibility.UNLISTED,
      createdByUserWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.JANE,
    });
    expect(await findWorkflowOwner(privateCoreWorkflowId)).toBe(
      USER_WORKSPACE_DATA_SEED_IDS.JANE,
    );
  });

  it('leaves shared views and workflows with their creator', async () => {
    expect(await findViewOwnership(sharedViewId)).toEqual({
      visibility: ViewVisibility.WORKSPACE,
      createdByUserWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.JONY,
    });
    expect(await findWorkflowOwner(sharedCoreWorkflowId)).toBe(
      USER_WORKSPACE_DATA_SEED_IDS.JONY,
    );
  });
});
