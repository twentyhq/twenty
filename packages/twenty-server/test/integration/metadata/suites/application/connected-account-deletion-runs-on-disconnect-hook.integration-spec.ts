import { currentUser } from 'test/integration/graphql/suites/user-session/utils/current-user.util';
import { deleteUserFromWorkspace } from 'test/integration/graphql/suites/user-session/utils/delete-user-from-workspace.util';
import { signUpInWorkspaceAndGetAccessToken } from 'test/integration/graphql/utils/sign-up-in-workspace-and-get-access-token.util';
import { updateWorkspace } from 'test/integration/graphql/utils/update-workspace.util';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { findConnectionProvidersByApplication } from 'test/integration/metadata/suites/connection-provider/utils/find-connection-providers-by-application.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { deleteConnectedAccount } from 'test/integration/utils/query-messaging.util';
import { type Manifest } from 'twenty-shared/application';
import { ConnectedAccountProvider, HTTPMethod } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { v4 as uuidv4 } from 'uuid';

import { AppOAuthRevokeService } from 'src/engine/core-modules/application/connection-provider/refresh/services/app-oauth-revoke.service';
import { LogicFunctionExecutorService } from 'src/engine/core-modules/logic-function/logic-function-executor/logic-function-executor.service';
import { LogicFunctionExecutionStatus } from 'src/engine/metadata-modules/logic-function/dtos/logic-function-execution-result.dto';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const PROVIDER_NAME = 'fathom';
const ORIGINAL_ACCESS_TOKEN = 'enc:v2:original';
const REFRESHED_ACCESS_TOKEN = 'enc:v2:refreshed-by-hook';

const buildManifestWithConnectionProvider = ({
  appId,
  roleId,
  providerId,
  logicFunctionId,
  withOnDisconnectHook,
}: {
  appId: string;
  roleId: string;
  providerId: string;
  logicFunctionId: string;
  withOnDisconnectHook: boolean;
}): Manifest =>
  buildBaseManifest({
    appId,
    roleId,
    overrides: {
      connectionProviders: [
        {
          universalIdentifier: providerId,
          name: PROVIDER_NAME,
          displayName: 'Fathom',
          type: 'oauth',
          oauth: {
            authorizationEndpoint: 'https://fathom.video/oauth2/authorize',
            tokenEndpoint: 'https://api.fathom.ai/oauth2/token',
            scopes: ['public_api'],
            clientIdVariable: 'FATHOM_CLIENT_ID',
            clientSecretVariable: 'FATHOM_CLIENT_SECRET',
          },
          ...(withOnDisconnectHook
            ? {
                onDisconnectLogicFunction: {
                  universalIdentifier: logicFunctionId,
                },
              }
            : {}),
        },
      ],
      logicFunctions: [
        {
          universalIdentifier: logicFunctionId,
          name: 'Release remote resources',
          description: 'On-disconnect cleanup logic function',
          handlerName: 'handler',
          sourceHandlerPath: 'src/disconnect.ts',
          builtHandlerPath: 'dist/disconnect.mjs',
          builtHandlerChecksum: 'checksum-disconnect',
          httpRouteTriggerSettings: {
            path: '/disconnect',
            httpMethod: HTTPMethod.POST,
            isAuthRequired: true,
          },
        },
      ],
    },
  });

const countConnectedAccounts = async (
  connectedAccountId: string,
): Promise<number> => {
  const [{ count }] = await globalThis.testDataSource.query(
    `SELECT COUNT(*)::int AS count FROM core."connectedAccount" WHERE id = $1`,
    [connectedAccountId],
  );

  return count;
};

const findConnectedAccount = async (
  connectedAccountId: string,
): Promise<{
  accessToken: string | null;
  archivedAt: Date | null;
  userWorkspaceId: string;
}> => {
  const [connectedAccount] = await globalThis.testDataSource.query(
    `SELECT "accessToken", "archivedAt", "userWorkspaceId" FROM core."connectedAccount" WHERE id = $1`,
    [connectedAccountId],
  );

  return connectedAccount;
};

const findUserWorkspaceIdByEmail = async (email: string): Promise<string> => {
  const [userWorkspace] = await globalThis.testDataSource.query(
    `SELECT "userWorkspace".id FROM core."userWorkspace" "userWorkspace"
       JOIN core."user" "user" ON "user".id = "userWorkspace"."userId"
     WHERE "user".email = $1 AND "userWorkspace"."workspaceId" = $2`,
    [email, SEED_APPLE_WORKSPACE_ID],
  );

  return userWorkspace.id;
};

describe('Connected account deletion runs the on-disconnect hook', () => {
  let appId: string;
  let roleId: string;
  let providerId: string;
  let logicFunctionId: string;
  let connectedAccountId: string;
  let executeSpy: jest.SpyInstance;
  let revokeSpy: jest.SpyInstance;
  let connectedAccountCountDuringHook: number | undefined;
  let accessTokenDuringHook: string | null | undefined;

  const syncTestApplication = ({
    withOnDisconnectHook,
  }: {
    withOnDisconnectHook: boolean;
  }) =>
    syncApplication({
      manifest: buildManifestWithConnectionProvider({
        appId,
        roleId,
        providerId,
        logicFunctionId,
        withOnDisconnectHook,
      }),
      expectToFail: false,
    });

  const insertAppConnectedAccount = async ({
    userWorkspaceId,
    archivedAt = null,
  }: {
    userWorkspaceId?: string;
    archivedAt?: Date | null;
  } = {}): Promise<void> => {
    const [provider] = await findConnectionProvidersByApplication(appId);
    const [firstUserWorkspace] = await globalThis.testDataSource.query(
      `SELECT id FROM core."userWorkspace" WHERE "workspaceId" = $1 LIMIT 1`,
      [SEED_APPLE_WORKSPACE_ID],
    );

    await globalThis.testDataSource.query(
      `INSERT INTO core."connectedAccount"
         (id, handle, provider, scope, "workspaceId", "userWorkspaceId", "applicationId", "connectionProviderId", "accessToken", "archivedAt")
       VALUES ($1, $2, $3, 'WORKSPACE', $4, $5, $6, $7, $8, $9)`,
      [
        connectedAccountId,
        'fathom-user@apple.dev',
        ConnectedAccountProvider.APP,
        SEED_APPLE_WORKSPACE_ID,
        userWorkspaceId ?? firstUserWorkspace.id,
        provider.applicationId,
        provider.id,
        isDefined(archivedAt) ? null : ORIGINAL_ACCESS_TOKEN,
        archivedAt,
      ],
    );
  };

  const findHookExecutionsForConnectedAccount = () =>
    executeSpy.mock.calls.filter(
      ([{ payload }]) => payload?.connectedAccountId === connectedAccountId,
    );

  beforeEach(async () => {
    appId = uuidv4();
    roleId = uuidv4();
    providerId = uuidv4();
    logicFunctionId = uuidv4();
    connectedAccountId = uuidv4();
    connectedAccountCountDuringHook = undefined;
    accessTokenDuringHook = undefined;

    await setupApplicationForSync({
      applicationUniversalIdentifier: appId,
      name: 'Test Application',
      description: 'App for testing the on-disconnect logic function hook',
      sourcePath: 'test-on-disconnect-hook',
    });

    const logicFunctionExecutorService =
      getAppProviderByClassName<LogicFunctionExecutorService>(
        'LogicFunctionExecutorService',
      );

    // setupApplicationForSync leaves fake timers on, and the delete helper
    // polls the job queues with real setTimeout calls.
    jest.useRealTimers();

    revokeSpy = jest
      .spyOn(
        getAppProviderByClassName<AppOAuthRevokeService>(
          'AppOAuthRevokeService',
        ),
        'revokeIfApp',
      )
      .mockResolvedValue(undefined);

    // Stands in for the token refresh getConnection performs inside a hook.
    executeSpy = jest
      .spyOn(logicFunctionExecutorService, 'execute')
      .mockImplementation(async () => {
        connectedAccountCountDuringHook =
          await countConnectedAccounts(connectedAccountId);
        accessTokenDuringHook = (await findConnectedAccount(connectedAccountId))
          ?.accessToken;
        await globalThis.testDataSource.query(
          `UPDATE core."connectedAccount" SET "accessToken" = $1 WHERE id = $2`,
          [REFRESHED_ACCESS_TOKEN, connectedAccountId],
        );

        return {
          data: {},
          duration: 1,
          billedDurationMs: 1,
          logs: '',
          status: LogicFunctionExecutionStatus.SUCCESS,
        };
      });
  }, 60000);

  afterEach(async () => {
    executeSpy.mockRestore();
    revokeSpy.mockRestore();

    await globalThis.testDataSource.query(
      `DELETE FROM core."connectedAccount" WHERE id = $1`,
      [connectedAccountId],
    );
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: appId,
    });
  });

  it('executes the hook while the connected account still exists, revokes the tokens it left behind, then deletes it', async () => {
    await syncTestApplication({ withOnDisconnectHook: true });
    await insertAppConnectedAccount();
    const [provider] = await findConnectionProvidersByApplication(appId);

    await deleteConnectedAccount(connectedAccountId);

    expect(executeSpy).toHaveBeenCalledTimes(1);
    expect(executeSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        payload: {
          connectionProviderId: provider.id,
          connectionProviderName: PROVIDER_NAME,
          connectedAccountId,
        },
      }),
    );
    expect(connectedAccountCountDuringHook).toBe(1);
    expect(revokeSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        id: connectedAccountId,
        accessToken: REFRESHED_ACCESS_TOKEN,
      }),
    );
    expect(await countConnectedAccounts(connectedAccountId)).toBe(0);
  }, 60000);

  it('still deletes the connected account when the hook returns an error', async () => {
    executeSpy.mockResolvedValue({
      data: null,
      duration: 1,
      billedDurationMs: 1,
      logs: '',
      status: LogicFunctionExecutionStatus.ERROR,
      error: {
        errorType: 'UnhandledError',
        errorMessage: 'On-disconnect hook failed on purpose',
        stackTrace: '',
      },
    });

    await syncTestApplication({ withOnDisconnectHook: true });
    await insertAppConnectedAccount();

    await deleteConnectedAccount(connectedAccountId);

    expect(executeSpy).toHaveBeenCalledTimes(1);
    expect(await countConnectedAccounts(connectedAccountId)).toBe(0);
  }, 60000);

  it('does not execute any hook when the provider declares no on-disconnect logic function', async () => {
    await syncTestApplication({ withOnDisconnectHook: false });
    await insertAppConnectedAccount();

    await deleteConnectedAccount(connectedAccountId);

    expect(executeSpy).not.toHaveBeenCalled();
    expect(await countConnectedAccounts(connectedAccountId)).toBe(0);
  }, 60000);

  describe('when the member who owns it is removed from the workspace', () => {
    let initialIsPublicInviteLinkEnabled: boolean | undefined;
    let memberWorkspaceMemberId: string;
    let memberUserWorkspaceId: string;

    beforeEach(async () => {
      const { data: workspaceData } = await currentUser({
        gqlFields: 'currentWorkspace { isPublicInviteLinkEnabled }',
      });

      initialIsPublicInviteLinkEnabled =
        workspaceData.currentUser.currentWorkspace?.isPublicInviteLinkEnabled;

      const memberEmail = `connection-owner-${uuidv4()}@example.com`;
      const memberToken = await signUpInWorkspaceAndGetAccessToken(memberEmail);
      const { data: memberData } = await currentUser({
        token: memberToken,
        gqlFields: 'workspaceMember { id }',
      });

      memberWorkspaceMemberId = memberData.currentUser.workspaceMember.id;
      memberUserWorkspaceId = await findUserWorkspaceIdByEmail(memberEmail);
    }, 60000);

    afterEach(async () => {
      await updateWorkspace({
        data: { isPublicInviteLinkEnabled: initialIsPublicInviteLinkEnabled },
      });
    });

    it('executes the hook before the tokens are wiped, revokes the token it left behind, and archives the account', async () => {
      await syncTestApplication({ withOnDisconnectHook: true });
      await insertAppConnectedAccount({
        userWorkspaceId: memberUserWorkspaceId,
      });
      const [provider] = await findConnectionProvidersByApplication(appId);

      const { errors } = await deleteUserFromWorkspace({
        input: { workspaceMemberIdToDelete: memberWorkspaceMemberId },
      });

      expect(errors).toBeUndefined();
      expect(findHookExecutionsForConnectedAccount()).toEqual([
        [
          expect.objectContaining({
            workspaceId: SEED_APPLE_WORKSPACE_ID,
            payload: {
              connectionProviderId: provider.id,
              connectionProviderName: PROVIDER_NAME,
              connectedAccountId,
            },
          }),
        ],
      ]);
      expect(accessTokenDuringHook).toBe(ORIGINAL_ACCESS_TOKEN);
      expect(revokeSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          id: connectedAccountId,
          accessToken: REFRESHED_ACCESS_TOKEN,
        }),
      );

      const transferredConnectedAccount =
        await findConnectedAccount(connectedAccountId);

      expect(transferredConnectedAccount.accessToken).toBeNull();
      expect(transferredConnectedAccount.archivedAt).not.toBeNull();
      expect(transferredConnectedAccount.userWorkspaceId).not.toBe(
        memberUserWorkspaceId,
      );
    }, 60000);

    it('does not execute the hook again for an account that was already disconnected', async () => {
      await syncTestApplication({ withOnDisconnectHook: true });
      await insertAppConnectedAccount({
        userWorkspaceId: memberUserWorkspaceId,
        archivedAt: new Date(),
      });

      const { errors } = await deleteUserFromWorkspace({
        input: { workspaceMemberIdToDelete: memberWorkspaceMemberId },
      });

      expect(errors).toBeUndefined();
      expect(findHookExecutionsForConnectedAccount()).toEqual([]);
    }, 60000);
  });
});
