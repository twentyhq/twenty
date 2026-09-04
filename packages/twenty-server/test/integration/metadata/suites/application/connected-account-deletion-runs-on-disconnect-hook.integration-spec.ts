import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { findConnectionProvidersByApplication } from 'test/integration/metadata/suites/connection-provider/utils/find-connection-providers-by-application.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { deleteConnectedAccount } from 'test/integration/utils/query-messaging.util';
import { type Manifest } from 'twenty-shared/application';
import { ConnectedAccountProvider } from 'twenty-shared/types';
import { v4 as uuidv4 } from 'uuid';

import { AppOAuthRevokeService } from 'src/engine/core-modules/application/connection-provider/refresh/services/app-oauth-revoke.service';
import { LogicFunctionExecutorService } from 'src/engine/core-modules/logic-function/logic-function-executor/logic-function-executor.service';
import { LogicFunctionExecutionStatus } from 'src/engine/metadata-modules/logic-function/dtos/logic-function-execution-result.dto';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const PROVIDER_NAME = 'fathom';
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
            httpMethod: 'POST',
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

describe('Connected account deletion runs the on-disconnect hook', () => {
  let appId: string;
  let roleId: string;
  let providerId: string;
  let logicFunctionId: string;
  let connectedAccountId: string;
  let executeSpy: jest.SpyInstance;
  let revokeSpy: jest.SpyInstance;
  let connectedAccountCountDuringHook: number | undefined;

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

  const insertAppConnectedAccount = async (): Promise<void> => {
    const [provider] = await findConnectionProvidersByApplication(appId);
    const [userWorkspace] = await globalThis.testDataSource.query(
      `SELECT id FROM core."userWorkspace" WHERE "workspaceId" = $1 LIMIT 1`,
      [SEED_APPLE_WORKSPACE_ID],
    );

    await globalThis.testDataSource.query(
      `INSERT INTO core."connectedAccount"
         (id, handle, provider, visibility, "workspaceId", "userWorkspaceId", "applicationId", "connectionProviderId")
       VALUES ($1, $2, $3, 'workspace', $4, $5, $6, $7)`,
      [
        connectedAccountId,
        'fathom-user@apple.dev',
        ConnectedAccountProvider.APP,
        SEED_APPLE_WORKSPACE_ID,
        userWorkspace.id,
        provider.applicationId,
        provider.id,
      ],
    );
  };

  beforeEach(async () => {
    appId = uuidv4();
    roleId = uuidv4();
    providerId = uuidv4();
    logicFunctionId = uuidv4();
    connectedAccountId = uuidv4();
    connectedAccountCountDuringHook = undefined;

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
});
