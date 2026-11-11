import { randomUUID } from 'crypto';

import { deleteUser } from 'test/integration/graphql/utils/delete-user.util';
import { signUpInNewWorkspace } from 'test/integration/graphql/utils/sign-up-in-new-workspace.util';
import { signUp } from 'test/integration/graphql/utils/sign-up.util';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';

describe('Successful user deletion with a workspace still in creation', () => {
  it.each([
    WorkspaceActivationStatus.PENDING_CREATION,
    WorkspaceActivationStatus.ONGOING_CREATION,
  ])(
    'should delete the user and soft-delete the %s workspace',
    async (activationStatus) => {
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

      await testDataSource.query(
        'UPDATE core.workspace SET "activationStatus" = $1 WHERE id = $2',
        [activationStatus, workspaceId],
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

      expect(workspaceAfterDeletion.activationStatus).toBe(activationStatus);
      expect(workspaceAfterDeletion.deletedAt).not.toBeNull();

      const userWorkspacesAfterDeletion = await testDataSource.query(
        'SELECT "deletedAt" FROM core."userWorkspace" WHERE "workspaceId" = $1',
        [workspaceId],
      );

      expect(userWorkspacesAfterDeletion).toHaveLength(1);
      expect(userWorkspacesAfterDeletion[0].deletedAt).not.toBeNull();
    },
  );
});
