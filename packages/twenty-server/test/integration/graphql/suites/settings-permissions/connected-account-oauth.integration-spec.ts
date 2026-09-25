import { randomUUID } from 'crypto';

import request from 'supertest';
import { setupGoogleMock } from 'test/integration/google/mocks/setup-google-mock.util';
import { upsertPermissionFlags } from 'test/integration/metadata/suites/role-permission-flag/utils/upsert-permission-flags.util';
import { createOneRole } from 'test/integration/metadata/suites/role/utils/create-one-role.util';
import { deleteOneRole } from 'test/integration/metadata/suites/role/utils/delete-one-role.util';
import { findOneRoleByLabel } from 'test/integration/metadata/suites/role/utils/find-one-role-by-label.util';
import { updateWorkspaceMemberRole } from 'test/integration/metadata/suites/role/utils/update-workspace-member-role.util';
import { setupMicrosoftMock } from 'test/integration/microsoft/mocks/setup-microsoft-mock.util';
import { generateTransientTokenResponse } from 'test/integration/utils/generate-transient-token.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import { waitForAllJobsToFinish } from 'test/integration/utils/wait-for-all-jobs-to-finish.util';
import { PermissionFlagType } from 'twenty-shared/constants';
import { ConnectedAccountProvider } from 'twenty-shared/types';
import { assertIsDefinedOrThrow, isDefined } from 'twenty-shared/utils';

import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { type ConnectedAccountMetadataService } from 'src/engine/metadata-modules/connected-account/connected-account-metadata.service';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-users.util';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

describe.each([
  {
    provider: ConnectedAccountProvider.GOOGLE,
    path: '/auth/google-apis',
    authorizationHostname: 'accounts.google.com',
    setupProviderMock: setupGoogleMock,
  },
  {
    provider: ConnectedAccountProvider.MICROSOFT,
    path: '/auth/microsoft-apis',
    authorizationHostname: 'login.microsoftonline.com',
    setupProviderMock: setupMicrosoftMock,
  },
])(
  '$provider connected account OAuth permissions (integration)',
  ({ provider, path, authorizationHostname, setupProviderMock }) => {
    const handle = `oauth-permission-${randomUUID()}@apple.dev`;
    const client = request(`http://localhost:${APP_PORT}`);

    setupProviderMock({ handle });

    let roleId: string | undefined;
    let originalRoleId: string | undefined;
    let userWorkspaceId: string;

    const setAccountPermission = async (isAllowed: boolean) => {
      assertIsDefinedOrThrow(roleId);

      await upsertPermissionFlags({
        input: {
          roleId,
          permissionFlagKeys: isAllowed
            ? [PermissionFlagType.CONNECTED_ACCOUNTS]
            : [],
        },
      });
    };

    const generateMemberTransientToken = async () => {
      const { data } = await generateTransientTokenResponse({
        token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
      });

      return data.generateTransientToken.transientToken.token;
    };

    const findConnectedAccount = () =>
      getCoreRepository<ConnectedAccountEntity>(
        ConnectedAccountEntity,
      ).findOneBy({
        handle,
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        provider,
      });

    const startAuthorization = async (transientToken: string) => {
      const response = await client
        .get(path)
        .query({ transientToken })
        .expect(302);

      return new URL(response.headers.location);
    };

    const completeAuthorization = async (state: string) => {
      const response = await client
        .get(`${path}/get-access-token`)
        .query({ code: 'mock-authorization-code', state })
        .expect(302);

      return new URL(response.headers.location);
    };

    beforeAll(async () => {
      originalRoleId = (await findOneRoleByLabel({ label: 'Member' })).id;
      userWorkspaceId = (
        await getCoreRepository<UserWorkspaceEntity>(
          UserWorkspaceEntity,
        ).findOneByOrFail({
          userId: USER_DATA_SEED_IDS.JONY,
          workspaceId: SEED_APPLE_WORKSPACE_ID,
        })
      ).id;

      const { data } = await createOneRole({
        input: {
          label: `Account sync permissions ${randomUUID()}`,
          canUpdateAllSettings: false,
          canAccessAllTools: false,
          canReadAllObjectRecords: false,
          canUpdateAllObjectRecords: false,
          canSoftDeleteAllObjectRecords: false,
          canDestroyAllObjectRecords: false,
          canBeAssignedToUsers: true,
        },
      });

      roleId = data.createOneRole.id;

      await updateWorkspaceMemberRole({
        input: {
          workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
          roleId,
        },
      });
    });

    beforeEach(async () => {
      await setAccountPermission(false);
    });

    afterEach(async () => {
      const connectedAccount = await findConnectedAccount();

      if (!isDefined(connectedAccount)) {
        return;
      }

      await getAppProviderByClassName<ConnectedAccountMetadataService>(
        'ConnectedAccountMetadataService',
      ).delete({
        id: connectedAccount.id,
        workspaceId: SEED_APPLE_WORKSPACE_ID,
      });
      await waitForAllJobsToFinish();
    });

    afterAll(async () => {
      if (isDefined(originalRoleId)) {
        await updateWorkspaceMemberRole({
          input: {
            workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
            roleId: originalRoleId,
          },
        });
      }

      if (isDefined(roleId)) {
        await deleteOneRole({ input: { idToDelete: roleId } });
      }
    });

    it('rejects starting OAuth for a role without account syncing access', async () => {
      const redirect = await startAuthorization(
        await generateMemberTransientToken(),
      );

      expect(redirect.searchParams.get('errorMessage')).toBe(
        'You do not have permission to connect accounts',
      );
      expect(await findConnectedAccount()).toBeNull();
    });

    it('connects an account when the role grants account syncing access', async () => {
      await setAccountPermission(true);

      const authorizationUrl = await startAuthorization(
        await generateMemberTransientToken(),
      );

      expect(authorizationUrl.hostname).toBe(authorizationHostname);

      const state = authorizationUrl.searchParams.get('state');

      assertIsDefinedOrThrow(state);

      const redirect = await completeAuthorization(state);
      const connectedAccount = await findConnectedAccount();

      expect(redirect.searchParams.has('errorMessage')).toBe(false);
      expect(connectedAccount).toMatchObject({
        handle,
        provider,
        userWorkspaceId,
      });
    });

    it('rejects saving an account when permission is revoked during OAuth', async () => {
      await setAccountPermission(true);

      const authorizationUrl = await startAuthorization(
        await generateMemberTransientToken(),
      );

      expect(authorizationUrl.hostname).toBe(authorizationHostname);

      const state = authorizationUrl.searchParams.get('state');

      assertIsDefinedOrThrow(state);
      await setAccountPermission(false);

      const redirect = await completeAuthorization(state);

      expect(redirect.searchParams.get('errorMessage')).toBe(
        'You do not have permission to connect accounts',
      );
      expect(await findConnectedAccount()).toBeNull();
    });
  },
);
