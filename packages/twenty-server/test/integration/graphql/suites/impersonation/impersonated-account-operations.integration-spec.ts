import { randomUUID } from 'crypto';

import { updateUserEmail } from 'test/integration/graphql/suites/user-session/utils/update-user-email.util';
import { deleteUser } from 'test/integration/graphql/utils/delete-user.util';
import { getAuthTokensFromLoginToken } from 'test/integration/graphql/utils/get-auth-tokens-from-login-token.util';
import { getCurrentUser } from 'test/integration/graphql/utils/get-current-user.util';
import { impersonate } from 'test/integration/graphql/utils/impersonate.util';
import { signUpInWorkspaceAndGetAccessToken } from 'test/integration/graphql/utils/sign-up-in-workspace-and-get-access-token.util';
import { createPermissionTestActiveWorkspace } from 'test/integration/permissions/utils/create-permission-test-active-workspace.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';

import {
  type BaseGraphQLError,
  ErrorCode,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AUTH_PRINCIPAL_REFUSED_MESSAGE } from 'src/engine/guards/constants/auth-principal-refused-message.constant';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const expectRefusedByAccessPolicy = (errors: BaseGraphQLError[]) => {
  expect(errors).toHaveLength(1);
  expect(errors[0].message).toBe(AUTH_PRINCIPAL_REFUSED_MESSAGE);
  expect(errors[0].extensions.code).toBe(ErrorCode.FORBIDDEN);
};

const findUser = (userId: string) =>
  getCoreRepository<UserEntity>(UserEntity).findOneOrFail({
    where: { id: userId },
    relations: { userWorkspaces: true },
    withDeleted: true,
  });

const getCurrentUserId = async (accessToken: string): Promise<string> => {
  const { data } = await getCurrentUser({ accessToken, expectToFail: false });

  return data.currentUser.id;
};

const getImpersonationAccessToken = async ({
  userId,
  workspaceId,
}: {
  userId: string;
  workspaceId: string;
}): Promise<string> => {
  const { data: impersonateData } = await impersonate({
    userId,
    workspaceId,
    accessToken: APPLE_JANE_ADMIN_ACCESS_TOKEN,
    expectToFail: false,
  });

  const { data: tokensData } = await getAuthTokensFromLoginToken({
    loginToken: impersonateData.impersonate.loginToken.token,
    origin: impersonateData.impersonate.workspace.workspaceUrls.subdomainUrl,
    expectToFail: false,
  });

  return tokensData.getAuthTokensFromLoginToken.tokens
    .accessOrWorkspaceAgnosticToken.token;
};

// Throwaway targets, so a regression cannot delete or rename a seeded user.
describe('Impersonation - account operations (integration)', () => {
  describe('workspace-level impersonation', () => {
    const originalEmail = `workspace-impersonated-${randomUUID()}@example.com`;
    let ownAccessToken: string;
    let userId: string;
    let impersonationAccessToken: string;

    beforeAll(async () => {
      ownAccessToken = await signUpInWorkspaceAndGetAccessToken(originalEmail);
      userId = await getCurrentUserId(ownAccessToken);
      impersonationAccessToken = await getImpersonationAccessToken({
        userId,
        workspaceId: SEED_APPLE_WORKSPACE_ID,
      });
    });

    afterAll(async () => {
      await deleteUser({ accessToken: ownAccessToken, expectToFail: false });
    });

    it('should refuse to change the impersonated user email', async () => {
      const { errors } = await updateUserEmail({
        input: { newEmail: `impersonator-chosen-${randomUUID()}@example.com` },
        token: impersonationAccessToken,
        expectToFail: true,
      });

      expectRefusedByAccessPolicy(errors);
      expect((await findUser(userId)).email).toBe(originalEmail);
    });

    it('should refuse to delete the impersonated user', async () => {
      const { errors } = await deleteUser({
        accessToken: impersonationAccessToken,
        expectToFail: true,
      });

      expectRefusedByAccessPolicy(errors);

      const user = await findUser(userId);

      expect(user.deletedAt).toBeNull();
      expect(user.userWorkspaces.map(({ workspaceId }) => workspaceId)).toEqual(
        [SEED_APPLE_WORKSPACE_ID],
      );
    });
  });

  describe('server-level impersonation', () => {
    let workspaceId: string;
    let userId: string;
    let impersonationAccessToken: string;

    beforeAll(async () => {
      const workspace = await createPermissionTestActiveWorkspace();

      workspaceId = workspace.workspaceId;
      userId = await getCurrentUserId(workspace.adminAccessToken);
      impersonationAccessToken = await getImpersonationAccessToken({
        userId,
        workspaceId,
      });
    });

    it('should change the impersonated user email', async () => {
      const newEmail = `server-impersonated-${randomUUID()}@example.com`;

      const { data, errors } = await updateUserEmail({
        input: { newEmail },
        token: impersonationAccessToken,
        expectToFail: false,
      });

      expect(errors).toBeUndefined();
      expect(data.updateUserEmail).toBe(true);
      expect((await findUser(userId)).email).toBe(newEmail);
    });

    it('should delete the impersonated user', async () => {
      const { data, errors } = await deleteUser({
        accessToken: impersonationAccessToken,
        expectToFail: false,
      });

      expect(errors).toBeUndefined();
      expect(data.deleteUser.id).toBe(userId);

      const user = await findUser(userId);

      expect(user.deletedAt).not.toBeNull();

      const workspace = await getCoreRepository<WorkspaceEntity>(
        WorkspaceEntity,
      ).findOneOrFail({ where: { id: workspaceId }, withDeleted: true });

      expect(workspace.deletedAt).not.toBeNull();
    });
  });
});
