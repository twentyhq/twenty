import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { updateWorkspaceOperationFactory } from 'test/integration/graphql/utils/update-workspace-operation-factory.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const setActivationStatus = (activationStatus: WorkspaceActivationStatus) =>
  testDataSource.query(
    'UPDATE core.workspace SET "activationStatus" = $1 WHERE id = $2',
    [activationStatus, SEED_APPLE_WORKSPACE_ID],
  );

describe('updateWorkspace while the workspace is pending creation', () => {
  let originalDisplayName: string;
  let originalAllowImpersonation: boolean;

  beforeAll(async () => {
    const [workspace] = await testDataSource.query(
      'SELECT "displayName", "allowImpersonation" FROM core.workspace WHERE id = $1',
      [SEED_APPLE_WORKSPACE_ID],
    );

    originalDisplayName = workspace.displayName;
    originalAllowImpersonation = workspace.allowImpersonation;

    await setActivationStatus(WorkspaceActivationStatus.PENDING_CREATION);
  });

  afterAll(async () => {
    await setActivationStatus(WorkspaceActivationStatus.ACTIVE);

    await testDataSource.query(
      'UPDATE core.workspace SET "displayName" = $1 WHERE id = $2',
      [originalDisplayName, SEED_APPLE_WORKSPACE_ID],
    );
  });

  it('rejects security sensitive fields', async () => {
    const response = await makeMetadataAPIRequest(
      updateWorkspaceOperationFactory({
        data: { allowImpersonation: !originalAllowImpersonation },
      }),
    );

    expect(response.body.data?.updateWorkspace).toBeFalsy();
    expectOneNotInternalServerErrorSnapshot({ errors: response.body.errors });

    const [workspace] = await testDataSource.query(
      'SELECT "allowImpersonation" FROM core.workspace WHERE id = $1',
      [SEED_APPLE_WORKSPACE_ID],
    );

    expect(workspace.allowImpersonation).toBe(originalAllowImpersonation);
  });

  it('rejects the whole update when a setup field is mixed with a security sensitive one', async () => {
    const response = await makeMetadataAPIRequest(
      updateWorkspaceOperationFactory({
        data: {
          displayName: 'Should not be applied',
          isPublicInviteLinkEnabled: true,
        },
      }),
    );

    expect(response.body.data?.updateWorkspace).toBeFalsy();
    expectOneNotInternalServerErrorSnapshot({ errors: response.body.errors });

    const [workspace] = await testDataSource.query(
      'SELECT "displayName" FROM core.workspace WHERE id = $1',
      [SEED_APPLE_WORKSPACE_ID],
    );

    expect(workspace.displayName).toBe(originalDisplayName);
  });

  it('still allows the fields needed to set the workspace up', async () => {
    const displayName = `Pending setup ${Date.now()}`;

    const response = await makeMetadataAPIRequest(
      updateWorkspaceOperationFactory({ data: { displayName } }),
    );

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.updateWorkspace.id).toBe(SEED_APPLE_WORKSPACE_ID);

    const [workspace] = await testDataSource.query(
      'SELECT "displayName" FROM core.workspace WHERE id = $1',
      [SEED_APPLE_WORKSPACE_ID],
    );

    expect(workspace.displayName).toBe(displayName);
  });
});
