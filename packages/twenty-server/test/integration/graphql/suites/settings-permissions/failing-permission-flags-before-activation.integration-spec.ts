import { findCoreWorkflows } from 'test/integration/graphql/suites/workflow/utils/find-core-workflows.util';
import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { setWorkspaceActivationStatus } from 'test/integration/graphql/utils/set-workspace-activation-status.util';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

describe('Permission flags while the workspace is pending creation', () => {
  beforeAll(async () => {
    await setWorkspaceActivationStatus({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      activationStatus: WorkspaceActivationStatus.PENDING_CREATION,
    });
  });

  afterAll(async () => {
    await setWorkspaceActivationStatus({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      activationStatus: WorkspaceActivationStatus.ACTIVE,
    });
  });

  it('should refuse an operation that requires a permission flag', async () => {
    const { errors } = await findCoreWorkflows({
      input: {},
      expectToFail: true,
    });

    expectOneNotInternalServerErrorSnapshot({ errors });
  });
});
