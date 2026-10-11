import { type Redis } from 'ioredis';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { uploadApplicationFile } from 'test/integration/metadata/suites/application/utils/upload-application-file.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { v4 } from 'uuid';

import { type EventLogLiveService } from 'src/engine/core-modules/event-logs/live/event-log-live.service';
import { type LogicFunctionExecutorService } from 'src/engine/core-modules/logic-function/logic-function-executor/logic-function-executor.service';
import { type RedisClientService } from 'src/engine/core-modules/redis-client/redis-client.service';
import { LogicFunctionExecutionStatus } from 'src/engine/metadata-modules/logic-function/dtos/logic-function-execution-result.dto';
import { SubscriptionChannel } from 'src/engine/subscriptions/enums/subscription-channel.enum';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const applicationIdentifier = v4();
const functionIdentifier = v4();
const workspaceId = SEED_APPLE_WORKSPACE_ID;
const ACCESS_TOKEN = `private-credential-${v4()}`;
const PUBLIC_LOG = `ordinary-execution-${v4()}`;

const FUNCTION_CODE = `
  export const handler = async ({ accessToken, shouldFail }) => {
    console.log({ accessToken });
    console.error(accessToken);
    process.stdout.write(accessToken);
    process.stderr.write(accessToken);

    if (shouldFail === 'detached') {
      setTimeout(() => { throw new Error(accessToken); }, 5);
      await new Promise(() => {});
    }

    if (shouldFail) {
      const error = new Error(accessToken);
      error.name = accessToken;
      throw error;
    }

    return { externalAccountId: 'provider-account' };
  };
`;

describe('sensitive logic function execution', () => {
  let executor: LogicFunctionExecutorService;
  let subscriber: Redis;
  let logicFunctionId: string;

  beforeAll(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: applicationIdentifier,
      name: 'Sensitive execution tests',
      description: 'Sensitive execution tests',
      sourcePath: 'sensitive-execution-tests',
    });
    jest.useRealTimers();

    const { errors: uploadErrors } = await uploadApplicationFile({
      applicationUniversalIdentifier: applicationIdentifier,
      fileFolder: 'BuiltLogicFunction',
      filePath: 'dist/handler.mjs',
      fileBuffer: Buffer.from(FUNCTION_CODE),
      filename: 'handler.mjs',
      contentType: 'application/javascript',
    });

    expect(uploadErrors).toBeUndefined();

    const { errors } = await syncApplication({
      manifest: buildBaseManifest({
        appId: applicationIdentifier,
        roleId: v4(),
        overrides: {
          logicFunctions: [
            {
              universalIdentifier: functionIdentifier,
              name: 'Sensitive execution',
              description: 'Emits credentials in logs and errors',
              handlerName: 'handler',
              sourceHandlerPath: 'src/handler.ts',
              builtHandlerPath: 'dist/handler.mjs',
              builtHandlerChecksum: 'sensitive-execution-checksum',
              timeoutSeconds: 10,
            },
          ],
        },
      }),
    });

    expect(errors).toBeUndefined();
    jest.useRealTimers();

    const [logicFunction] = await globalThis.testDataSource.query(
      'SELECT id FROM core."logicFunction" WHERE "workspaceId" = $1 AND "universalIdentifier" = $2',
      [workspaceId, functionIdentifier],
    );

    logicFunctionId = logicFunction.id;
    executor = getAppProviderByClassName('LogicFunctionExecutorService');
    const redisClient =
      getAppProviderByClassName<RedisClientService>('RedisClientService');

    subscriber = redisClient.getClient().duplicate();
    await subscriber.subscribe(
      `${SubscriptionChannel.LOGIC_FUNCTION_LOGS_CHANNEL}:${workspaceId}`,
    );
    await getAppProviderByClassName<EventLogLiveService>(
      'EventLogLiveService',
    ).markWatched(workspaceId, SubscriptionChannel.LOGIC_FUNCTION_LOGS_CHANNEL);
  }, 120_000);

  afterAll(async () => {
    await subscriber?.quit();
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: applicationIdentifier,
    });
  });

  it('keeps credentials out of execution diagnostics and live logs while ordinary logging still works', async () => {
    const publishedMessages: string[] = [];
    let resolveOrdinaryLog: () => void = () => {};
    const ordinaryLogPublished = new Promise<void>((resolve) => {
      resolveOrdinaryLog = resolve;
    });
    const onMessage = (_channel: string, message: string) => {
      const payload: { logicFunctionLogs?: { id: string } } =
        JSON.parse(message);

      if (payload.logicFunctionLogs?.id !== logicFunctionId) {
        return;
      }

      publishedMessages.push(message);
      if (message.includes(PUBLIC_LOG)) {
        resolveOrdinaryLog();
      }
    };

    subscriber.on('message', onMessage);

    try {
      const success = await executor.execute({
        workspaceId,
        logicFunctionId,
        payload: { accessToken: ACCESS_TOKEN, shouldFail: false },
        shouldEnforceUsageLimits: false,
        shouldSuppressExecutionLogs: true,
      });

      expect(success.status).toBe(LogicFunctionExecutionStatus.SUCCESS);
      expect(success.data).toEqual({ externalAccountId: 'provider-account' });
      expect(success.logs).toBe('');

      for (const shouldFail of [true, 'detached']) {
        const failure = await executor.execute({
          workspaceId,
          logicFunctionId,
          payload: { accessToken: ACCESS_TOKEN, shouldFail },
          shouldEnforceUsageLimits: false,
          shouldSuppressExecutionLogs: true,
        });

        expect(failure.status).toBe(LogicFunctionExecutionStatus.ERROR);
        expect(failure.error).toEqual({
          errorType: 'Error',
          errorMessage: 'Logic function execution failed',
          stackTrace: [],
        });
        expect(JSON.stringify(failure)).not.toContain(ACCESS_TOKEN);
      }

      await getAppProviderByClassName<EventLogLiveService>(
        'EventLogLiveService',
      ).markWatched(
        workspaceId,
        SubscriptionChannel.LOGIC_FUNCTION_LOGS_CHANNEL,
      );

      const ordinary = await executor.execute({
        workspaceId,
        logicFunctionId,
        payload: { accessToken: PUBLIC_LOG, shouldFail: false },
        shouldEnforceUsageLimits: false,
      });

      expect(ordinary.logs).toContain(PUBLIC_LOG);

      await ordinaryLogPublished;

      expect(publishedMessages).toHaveLength(1);
      expect(publishedMessages[0]).toContain(PUBLIC_LOG);
      expect(publishedMessages.join('')).not.toContain(ACCESS_TOKEN);
    } finally {
      subscriber.off('message', onMessage);
    }
  }, 120_000);
});
