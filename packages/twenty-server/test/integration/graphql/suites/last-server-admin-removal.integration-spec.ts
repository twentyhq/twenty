import { randomUUID } from 'crypto';

import gql from 'graphql-tag';
import { authenticator } from 'otplib';
import { deleteUserFromWorkspace } from 'test/integration/graphql/suites/user-session/utils/delete-user-from-workspace.util';
import { deleteUser } from 'test/integration/graphql/utils/delete-user.util';
import { initiateOtpProvisioningForAuthenticatedUser } from 'test/integration/graphql/utils/initiate-otp-provisioning-for-authenticated-user.util';
import { signUpInWorkspaceAndGetAccessToken } from 'test/integration/graphql/utils/sign-up-in-workspace-and-get-access-token.util';
import { verifyTwoFactorAuthenticationMethod } from 'test/integration/graphql/utils/verify-two-factor-authentication-method.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { makeAdminPanelApiRequest } from 'test/integration/twenty-config/utils/make-admin-panel-api-request.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import { In } from 'typeorm';

import { type PostgresAdvisoryLockService } from 'src/database/typeorm/postgres-advisory-lock.service';
import { type CoreEntityCacheService } from 'src/engine/core-entity-cache/services/core-entity-cache.service';
import { ErrorCode } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { SERVER_ADMINS_LOCK_NAME } from 'src/engine/core-modules/user/constants/server-admins-lock-name.constant';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';
import { PermissionsExceptionMessage } from 'src/engine/permissions/permissions.exception';
import { USER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-users.util';

const TOTP_STEP_MS = 30_000;
const MINIMUM_TOTP_STEP_REMAINING_MS = 10_000;

type Member = {
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

const signUpMember = async (): Promise<Member> => {
  const accessToken = await signUpInWorkspaceAndGetAccessToken(
    `last-server-admin-${randomUUID()}@example.com`,
  );

  const response = await makeMetadataApiRequest(
    currentUserOperation,
    accessToken,
  );

  const { id, workspaceMember } = response.body.data.currentUser;

  return { id, workspaceMemberId: workspaceMember.id, accessToken };
};

const signUpServerAdmin = async (): Promise<Member> => {
  const serverAdmin = await signUpMember();

  await setCanAccessFullAdminPanel([serverAdmin.id], true);

  return serverAdmin;
};

const enableTwoFactorAuthentication = async (accessToken: string) => {
  const { data } = await initiateOtpProvisioningForAuthenticatedUser({
    accessToken,
    expectToFail: false,
  });

  const secret =
    new URL(
      data.initiateOTPProvisioningForAuthenticatedUser.uri,
    ).searchParams.get('secret') ?? '';

  await verifyTwoFactorAuthenticationMethod({
    otp: authenticator.generate(secret),
    accessToken,
    expectToFail: false,
  });

  return secret;
};

const waitUntilSafelyInsideTotpStep = async () => {
  const millisecondsRemainingInStep =
    TOTP_STEP_MS - (Date.now() % TOTP_STEP_MS);

  if (millisecondsRemainingInStep < MINIMUM_TOTP_STEP_REMAINING_MS) {
    await new Promise((resolve) =>
      setTimeout(resolve, millisecondsRemainingInStep + 100),
    );
  }
};

const updateServerAdminAccess = ({
  userId,
  canAccessFullAdminPanel,
  canImpersonate,
  secret,
  totpStepOffset = 1,
  accessToken,
}: {
  userId: string;
  canAccessFullAdminPanel: boolean;
  canImpersonate?: boolean;
  secret: string;
  totpStepOffset?: number;
  accessToken: string;
}) =>
  makeAdminPanelApiRequest(
    {
      query: gql`
        mutation UpdateServerAdminAccess(
          $userId: UUID!
          $canAccessFullAdminPanel: Boolean
          $canImpersonate: Boolean
          $otp: String
        ) {
          updateServerAdminAccess(
            userId: $userId
            canAccessFullAdminPanel: $canAccessFullAdminPanel
            canImpersonate: $canImpersonate
            otp: $otp
          ) {
            id
          }
        }
      `,
      variables: {
        userId,
        canAccessFullAdminPanel,
        canImpersonate,
        otp: authenticator
          .clone({ epoch: Date.now() + totpStepOffset * TOTP_STEP_MS })
          .generate(secret),
      },
    },
    accessToken,
  );

const holdServerAdminsLockFromAnotherInstance = async (
  callback: () => Promise<void>,
  { isShared }: { isShared: boolean },
) => {
  const lockResult =
    await getAppProviderByClassName<PostgresAdvisoryLockService>(
      'PostgresAdvisoryLockService',
    ).tryWithLock(SERVER_ADMINS_LOCK_NAME, callback, { isShared });

  expect(lockResult.acquired).toBe(true);
};

const runWhileServerAdminsChange = (callback: () => Promise<void>) =>
  holdServerAdminsLockFromAnotherInstance(callback, { isShared: false });

const runWhileAUserIsRemoved = (callback: () => Promise<void>) =>
  holdServerAdminsLockFromAnotherInstance(callback, { isShared: true });

const expectServerAdminToBeUntouched = async (serverAdmin: Member) => {
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
  let serverAdmin: Member;
  let extraMembers: Member[];

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
    extraMembers = [];
  });

  afterEach(async () => {
    await setCanAccessFullAdminPanel(otherServerAdminIds, true);
    await setCanAccessFullAdminPanel([USER_DATA_SEED_IDS.SCOTT], false);

    for (const member of [serverAdmin, ...extraMembers]) {
      const isMemberStillActive = await getCoreRepository<UserEntity>(
        UserEntity,
      ).exists({ where: { id: member.id } });

      if (isMemberStillActive) {
        await deleteUser({
          accessToken: member.accessToken,
          expectToFail: false,
        });
      }
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

  describe('while server admins are being changed', () => {
    it('should refuse to remove a server admin before touching their member', async () => {
      await runWhileServerAdminsChange(async () => {
        const { data, errors } = await deleteUserFromWorkspace({
          input: { workspaceMemberIdToDelete: serverAdmin.workspaceMemberId },
          expectToFail: true,
          token: APPLE_JANE_ADMIN_ACCESS_TOKEN,
        });

        expect(data).toBeNull();
        expect(errors[0].extensions.code).toBe(ErrorCode.CONFLICT);
      });

      await expectServerAdminToBeUntouched(serverAdmin);
    });

    it('should refuse to remove a member before touching them', async () => {
      const member = await signUpMember();

      extraMembers.push(member);

      await runWhileServerAdminsChange(async () => {
        const { data, errors } = await deleteUserFromWorkspace({
          input: { workspaceMemberIdToDelete: member.workspaceMemberId },
          expectToFail: true,
          token: APPLE_JANE_ADMIN_ACCESS_TOKEN,
        });

        expect(data).toBeNull();
        expect(errors[0].extensions.code).toBe(ErrorCode.CONFLICT);
      });

      const response = await makeMetadataApiRequest(
        currentUserOperation,
        member.accessToken,
      );

      expect(response.body.data.currentUser.workspaceMember.id).toBe(
        member.workspaceMemberId,
      );
    });

    it('should refuse to revoke admin panel access from another server admin', async () => {
      const secret = await enableTwoFactorAuthentication(
        serverAdmin.accessToken,
      );

      await runWhileServerAdminsChange(async () => {
        const response = await updateServerAdminAccess({
          userId: USER_DATA_SEED_IDS.JANE,
          canAccessFullAdminPanel: false,
          secret,
          accessToken: serverAdmin.accessToken,
        });

        expect(response.body.errors[0].extensions.code).toBe(
          ErrorCode.CONFLICT,
        );
      });

      const jane = await getCoreRepository<UserEntity>(
        UserEntity,
      ).findOneOrFail({ where: { id: USER_DATA_SEED_IDS.JANE } });

      expect(jane.canAccessFullAdminPanel).toBe(true);
    });
  });

  describe('while a user is being removed', () => {
    it('should refuse to promote a user to server admin', async () => {
      const secret = await enableTwoFactorAuthentication(
        serverAdmin.accessToken,
      );

      await runWhileAUserIsRemoved(async () => {
        const response = await updateServerAdminAccess({
          userId: USER_DATA_SEED_IDS.SCOTT,
          canAccessFullAdminPanel: true,
          secret,
          accessToken: serverAdmin.accessToken,
        });

        expect(response.body.errors[0].extensions.code).toBe(
          ErrorCode.CONFLICT,
        );
      });

      const scott = await getCoreRepository<UserEntity>(
        UserEntity,
      ).findOneOrFail({ where: { id: USER_DATA_SEED_IDS.SCOTT } });

      expect(scott.canAccessFullAdminPanel).toBe(false);
    });

    it('should still remove another member', async () => {
      const member = await signUpMember();

      await runWhileAUserIsRemoved(async () => {
        const { errors } = await deleteUserFromWorkspace({
          input: { workspaceMemberIdToDelete: member.workspaceMemberId },
          expectToFail: false,
          token: APPLE_JANE_ADMIN_ACCESS_TOKEN,
        });

        expect(errors).toBeUndefined();
      });

      const removedMember = await getCoreRepository<UserEntity>(
        UserEntity,
      ).findOne({ where: { id: member.id }, withDeleted: true });

      expect(removedMember?.deletedAt).not.toBeNull();
    });
  });

  it('should apply overlapping admin access changes on top of each other', async () => {
    const target = await signUpMember();

    extraMembers.push(target);

    await getCoreRepository<UserEntity>(UserEntity).update(
      { id: target.id },
      { canImpersonate: true },
    );

    await waitUntilSafelyInsideTotpStep();

    const secret = await enableTwoFactorAuthentication(serverAdmin.accessToken);

    const responses = await Promise.all([
      updateServerAdminAccess({
        userId: target.id,
        canAccessFullAdminPanel: true,
        canImpersonate: false,
        secret,
        totpStepOffset: 1,
        accessToken: serverAdmin.accessToken,
      }),
      updateServerAdminAccess({
        userId: target.id,
        canAccessFullAdminPanel: true,
        secret,
        totpStepOffset: -1,
        accessToken: serverAdmin.accessToken,
      }),
    ]);

    expect(responses.map(({ body }) => body.errors)).toEqual([
      undefined,
      undefined,
    ]);

    const updatedTarget = await getCoreRepository<UserEntity>(
      UserEntity,
    ).findOneOrFail({ where: { id: target.id } });

    expect(updatedTarget.canAccessFullAdminPanel).toBe(true);
    expect(updatedTarget.canImpersonate).toBe(false);
  });

  it('should remove more members at once than the database pool has connections', async () => {
    const members: Member[] = [];
    const poolSize = Number(process.env.PG_POOL_MAX_CONNECTIONS ?? 10);

    for (let index = 0; index < poolSize + 2; index++) {
      members.push(await signUpMember());
    }

    const removals = await Promise.all(
      members.map((member) =>
        deleteUserFromWorkspace({
          input: { workspaceMemberIdToDelete: member.workspaceMemberId },
          expectToFail: false,
          token: APPLE_JANE_ADMIN_ACCESS_TOKEN,
        }),
      ),
    );

    expect(removals.every(({ errors }) => errors === undefined)).toBe(true);
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
