import { randomUUID } from 'crypto';

import gql from 'graphql-tag';
import { deleteUserFromWorkspace } from 'test/integration/graphql/suites/user-session/utils/delete-user-from-workspace.util';
import { deleteUser } from 'test/integration/graphql/utils/delete-user.util';
import { signUpInWorkspaceAndGetAccessToken } from 'test/integration/graphql/utils/sign-up-in-workspace-and-get-access-token.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import { In } from 'typeorm';

import { type CoreEntityCacheService } from 'src/engine/core-entity-cache/services/core-entity-cache.service';
import { ErrorCode } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';
import { PermissionsExceptionMessage } from 'src/engine/permissions/permissions.exception';

type ServerAdmin = {
  id: string;
  workspaceMemberId: string;
  accessToken: string;
};

const currentUserOperation = {
  query: gql`
    query CurrentUser {
      currentUser {
        id
        workspaceMember {
          id
        }
      }
    }
  `,
};

const setCanAccessFullAdminPanel = async (
  userIds: string[],
  canAccessFullAdminPanel: boolean,
) => {
  await getCoreRepository<UserEntity>(UserEntity).update(
    { id: In(userIds) },
    { canAccessFullAdminPanel },
  );

  const coreEntityCacheService =
    getAppProviderByClassName<CoreEntityCacheService>('CoreEntityCacheService');

  await Promise.all(
    userIds.map((userId) => coreEntityCacheService.invalidate('user', userId)),
  );
};

const signUpServerAdmin = async (): Promise<ServerAdmin> => {
  const accessToken = await signUpInWorkspaceAndGetAccessToken(
    `last-server-admin-${randomUUID()}@example.com`,
  );

  const response = await makeMetadataApiRequest(
    currentUserOperation,
    accessToken,
  );

  const { id, workspaceMember } = response.body.data.currentUser;

  await setCanAccessFullAdminPanel([id], true);

  return { id, workspaceMemberId: workspaceMember.id, accessToken };
};

const expectServerAdminToBeUntouched = async (serverAdmin: ServerAdmin) => {
  const user = await getCoreRepository<UserEntity>(UserEntity).findOne({
    where: { id: serverAdmin.id },
  });

  expect(user?.canAccessFullAdminPanel).toBe(true);

  const response = await makeMetadataApiRequest(
    currentUserOperation,
    serverAdmin.accessToken,
  );

  expect(response.body.data.currentUser.workspaceMember.id).toBe(
    serverAdmin.workspaceMemberId,
  );
};

describe('Removing the last server admin', () => {
  let otherServerAdminIds: string[];
  let serverAdmin: ServerAdmin;

  beforeAll(async () => {
    const otherServerAdmins = await getCoreRepository<UserEntity>(
      UserEntity,
    ).find({
      select: { id: true },
      where: { canAccessFullAdminPanel: true },
    });

    otherServerAdminIds = otherServerAdmins.map(({ id }) => id);
  });

  beforeEach(async () => {
    serverAdmin = await signUpServerAdmin();
  });

  afterEach(async () => {
    await setCanAccessFullAdminPanel(otherServerAdminIds, true);

    const isServerAdminStillActive = await getCoreRepository<UserEntity>(
      UserEntity,
    ).exists({ where: { id: serverAdmin.id } });

    if (isServerAdminStillActive) {
      await deleteUser({
        accessToken: serverAdmin.accessToken,
        expectToFail: false,
      });
    }
  });

  describe('when no other server admin is left', () => {
    beforeEach(async () => {
      await setCanAccessFullAdminPanel(otherServerAdminIds, false);
    });

    it('should refuse to remove their member from their only workspace', async () => {
      const { data, errors } = await deleteUserFromWorkspace({
        input: { workspaceMemberIdToDelete: serverAdmin.workspaceMemberId },
        expectToFail: true,
        token: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      expect(data).toBeNull();
      expect(errors[0].message).toBe(
        PermissionsExceptionMessage.CANNOT_DELETE_LAST_SERVER_ADMIN,
      );
      expect(errors[0].extensions.code).toBe(ErrorCode.FORBIDDEN);

      await expectServerAdminToBeUntouched(serverAdmin);
    });

    it('should refuse to delete their account', async () => {
      const { data, errors } = await deleteUser({
        accessToken: serverAdmin.accessToken,
        expectToFail: true,
      });

      expect(data).toBeNull();
      expect(errors[0].message).toBe(
        PermissionsExceptionMessage.CANNOT_DELETE_LAST_SERVER_ADMIN,
      );
      expect(errors[0].extensions.code).toBe(ErrorCode.FORBIDDEN);

      await expectServerAdminToBeUntouched(serverAdmin);
    });
  });

  it('should remove a server admin from their only workspace when another server admin is left', async () => {
    const { errors } = await deleteUserFromWorkspace({
      input: { workspaceMemberIdToDelete: serverAdmin.workspaceMemberId },
      expectToFail: false,
      token: APPLE_JANE_ADMIN_ACCESS_TOKEN,
    });

    expect(errors).toBeUndefined();

    const removedUser = await getCoreRepository<UserEntity>(UserEntity).findOne(
      {
        where: { id: serverAdmin.id },
        withDeleted: true,
      },
    );

    expect(removedUser?.deletedAt).not.toBeNull();
  });
});
