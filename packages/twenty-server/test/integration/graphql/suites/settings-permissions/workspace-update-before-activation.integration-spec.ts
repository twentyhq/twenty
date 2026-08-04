import gql from 'graphql-tag';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';

import { ErrorCode } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { PermissionsExceptionMessage } from 'src/engine/metadata-modules/permissions/permissions.exception';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const updateWorkspaceOperation = (data: Record<string, unknown>) => ({
  query: gql`
    mutation UpdateWorkspace($data: UpdateWorkspaceInput!) {
      updateWorkspace(data: $data) {
        id
      }
    }
  `,
  variables: { data },
});

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
      updateWorkspaceOperation({
        allowImpersonation: !originalAllowImpersonation,
      }),
    );

    expect(response.body.data?.updateWorkspace).toBeFalsy();
    expect(response.body.errors[0].message).toBe(
      PermissionsExceptionMessage.PERMISSION_DENIED,
    );
    expect(response.body.errors[0].extensions.code).toBe(ErrorCode.FORBIDDEN);

    const [workspace] = await testDataSource.query(
      'SELECT "allowImpersonation" FROM core.workspace WHERE id = $1',
      [SEED_APPLE_WORKSPACE_ID],
    );

    expect(workspace.allowImpersonation).toBe(originalAllowImpersonation);
  });

  it('rejects the whole update when a setup field is mixed with a security sensitive one', async () => {
    const response = await makeMetadataAPIRequest(
      updateWorkspaceOperation({
        displayName: 'Should not be applied',
        isPublicInviteLinkEnabled: true,
      }),
    );

    expect(response.body.data?.updateWorkspace).toBeFalsy();
    expect(response.body.errors[0].extensions.code).toBe(ErrorCode.FORBIDDEN);

    const [workspace] = await testDataSource.query(
      'SELECT "displayName" FROM core.workspace WHERE id = $1',
      [SEED_APPLE_WORKSPACE_ID],
    );

    expect(workspace.displayName).toBe(originalDisplayName);
  });

  it('still allows the fields needed to set the workspace up', async () => {
    const displayName = `Pending setup ${Date.now()}`;

    const response = await makeMetadataAPIRequest(
      updateWorkspaceOperation({ displayName }),
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
