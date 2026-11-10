import { randomUUID } from 'crypto';

import { deleteUser } from 'test/integration/graphql/utils/delete-user.util';
import { signUpInNewWorkspace } from 'test/integration/graphql/utils/sign-up-in-new-workspace.util';
import { signUp } from 'test/integration/graphql/utils/sign-up.util';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';

describe('Successful user deletion with a pending workspace', () => {
  it('should delete the user and soft-delete the workspace that was never activated', async () => {
    const { data: signUpData } = await signUp({
      input: {
        email: `test-pending-deletion-${randomUUID()}@example.com`,
        password: 'Test123!@#',
      },
      expectToFail: false,
    });

    const workspaceAgnosticAccessToken =
      signUpData.signUp.tokens.accessOrWorkspaceAgnosticToken.token;

    const {
      data: { signUpInNewWorkspace: signUpInNewWorkspaceData },
    } = await signUpInNewWorkspace({
      accessToken: workspaceAgnosticAccessToken,
      expectToFail: false,
    });

    const workspaceId = signUpInNewWorkspaceData.workspace.id;

    const [workspaceBeforeDeletion] = await testDataSource.query(
      'SELECT "activationStatus" FROM core.workspace WHERE id = $1',
      [workspaceId],
    );

    expect(workspaceBeforeDeletion.activationStatus).toBe(
      WorkspaceActivationStatus.PENDING_CREATION,
    );

    const { data, errors } = await deleteUser({
      accessToken: workspaceAgnosticAccessToken,
      expectToFail: false,
    });

    expect(errors).toBeUndefined();
    expect(data.deleteUser.deletedAt).not.toBeNull();

    const [workspaceAfterDeletion] = await testDataSource.query(
      'SELECT "activationStatus", "deletedAt" FROM core.workspace WHERE id = $1',
      [workspaceId],
    );

    expect(workspaceAfterDeletion.activationStatus).toBe(
      WorkspaceActivationStatus.PENDING_CREATION,
    );
    expect(workspaceAfterDeletion.deletedAt).not.toBeNull();

    const userWorkspacesAfterDeletion = await testDataSource.query(
      'SELECT "deletedAt" FROM core."userWorkspace" WHERE "workspaceId" = $1',
      [workspaceId],
    );

    expect(userWorkspacesAfterDeletion).toHaveLength(1);
    expect(userWorkspacesAfterDeletion[0].deletedAt).not.toBeNull();
  });
});
