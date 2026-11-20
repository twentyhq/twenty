import process from 'process';

import {
  type ClickHouseClient,
  ClickHouseLogLevel,
  createClient,
} from '@clickhouse/client';
import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { uploadApplicationFile } from 'test/integration/metadata/suites/application/utils/upload-application-file.util';
import { findLogicFunctionId } from 'test/integration/server-route-trigger/utils/find-logic-function-id.util';
import { expectEventually } from 'test/integration/utils/expect-eventually.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { waitForAllJobsToFinish } from 'test/integration/utils/wait-for-all-jobs-to-finish.util';
import { type LogicFunctionManifest } from 'twenty-shared/application';

import { LOGIC_FUNCTION_QUEUE_RETRY_BACKOFF } from 'src/engine/core-modules/logic-function/logic-function-trigger/constants/logic-function-queue-retry-backoff.constant';
import {
  LogicFunctionTriggerJob,
  type LogicFunctionTriggerJobData,
} from 'src/engine/core-modules/logic-function/logic-function-trigger/jobs/logic-function-trigger.job';
import { type LogicFunctionJobRunnerService } from 'src/engine/core-modules/logic-function/logic-function-trigger/logic-function-job-runner.service';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { type MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { getQueueToken } from 'src/engine/core-modules/message-queue/utils/get-queue-token.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const APP_UNIVERSAL_IDENTIFIER = '6b4c9e3d-af50-4c8b-ad4e-5f6a7b8c9dae';
const ROLE_UNIVERSAL_IDENTIFIER = '7c5daf4e-b061-4d9c-be5f-6a7b8c9daebf';
const QUEUED_FUNCTION_UNIVERSAL_IDENTIFIER =
  '8d6eb05f-c172-4ead-8f6a-7b8c9daebfc0';
const DIRECT_FUNCTION_UNIVERSAL_IDENTIFIER =
  '9e7fc16a-d283-4fbe-9a7b-8c9daebfc0d1';

const RETRYABLE_HANDLER_CODE = `export const main = async () => {
  const error = new Error('Upstream API is busy');
  error.name = 'RetryableLogicFunctionError';
  throw error;
};
`;

const buildRetryableFunctionManifest = ({
  universalIdentifier,
  name,
}: {
  universalIdentifier: string;
  name: string;
}): LogicFunctionManifest => ({
  universalIdentifier,
  name,
  handlerName: 'main',
  sourceHandlerPath: `src/${name}.ts`,
  builtHandlerPath: `dist/${name}.mjs`,
  builtHandlerChecksum: `checksum-${name}`,
});

const queuedFunctionManifest = buildRetryableFunctionManifest({
  universalIdentifier: QUEUED_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'queued-retryable-function',
});

const directFunctionManifest = buildRetryableFunctionManifest({
  universalIdentifier: DIRECT_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'direct-retryable-function',
});

type LevelCountRow = { level: string; count: string };

describe('Logic function retry monitoring (integration)', () => {
  let clickHouseClient: ClickHouseClient;
  let redisConnection: IORedis;
  let logicFunctionInspectionQueue: Queue<LogicFunctionTriggerJobData>;
  let queuedFunctionId: string;
  let directFunctionId: string;

  const countMetricEventsByLevel = async (
    logicFunctionId: string,
  ): Promise<Record<string, number>> => {
    const result = await clickHouseClient.query({
      query: `SELECT level, count() AS count
        FROM applicationMetricEvent
        WHERE source = 'LOGIC_FUNCTION' AND logicFunctionId = {logicFunctionId:String}
        GROUP BY level`,
      query_params: { logicFunctionId },
      format: 'JSONEachRow',
    });
    const rows = await result.json<LevelCountRow>();

    return Object.fromEntries(
      rows.map(({ level, count }) => [level, Number(count)]),
    );
  };

  beforeAll(async () => {
    clickHouseClient = createClient({
      url: process.env.CLICKHOUSE_URL,
      log: { level: ClickHouseLogLevel.OFF },
    });

    redisConnection = new IORedis(
      process.env.REDIS_QUEUE_URL ??
        process.env.REDIS_URL ??
        'redis://localhost:6379',
      { maxRetriesPerRequest: null },
    );

    logicFunctionInspectionQueue = new Queue<LogicFunctionTriggerJobData>(
      MessageQueue.logicFunctionQueue,
      { connection: redisConnection },
    );

    await setupApplicationForSync({
      applicationUniversalIdentifier: APP_UNIVERSAL_IDENTIFIER,
      name: 'Logic Function Retry Monitoring Test App',
      description:
        'App for testing how retried logic function runs are recorded',
      sourcePath: 'logic-function-retry-monitoring-test-app',
    });

    jest.useRealTimers();

    for (const manifest of [queuedFunctionManifest, directFunctionManifest]) {
      await uploadApplicationFile({
        applicationUniversalIdentifier: APP_UNIVERSAL_IDENTIFIER,
        fileFolder: 'BuiltLogicFunction',
        filePath: manifest.builtHandlerPath,
        fileBuffer: Buffer.from(RETRYABLE_HANDLER_CODE),
        filename: `${manifest.name}.mjs`,
        contentType: 'application/javascript',
        expectToFail: false,
      });
    }

    await syncApplication({
      manifest: buildBaseManifest({
        appId: APP_UNIVERSAL_IDENTIFIER,
        roleId: ROLE_UNIVERSAL_IDENTIFIER,
        overrides: {
          logicFunctions: [queuedFunctionManifest, directFunctionManifest],
        },
      }),
      expectToFail: false,
    });

    queuedFunctionId = await findLogicFunctionId({
      universalIdentifier: QUEUED_FUNCTION_UNIVERSAL_IDENTIFIER,
      workspaceId: SEED_APPLE_WORKSPACE_ID,
    });

    directFunctionId = await findLogicFunctionId({
      universalIdentifier: DIRECT_FUNCTION_UNIVERSAL_IDENTIFIER,
      workspaceId: SEED_APPLE_WORKSPACE_ID,
    });
  }, 60000);

  afterAll(async () => {
    await clickHouseClient.command({
      query:
        'ALTER TABLE applicationMetricEvent DELETE WHERE logicFunctionId IN ({logicFunctionIds:Array(String)})',
      query_params: { logicFunctionIds: [queuedFunctionId, directFunctionId] },
    });

    await clickHouseClient.close();
    await logicFunctionInspectionQueue.close();
    await redisConnection.quit();

    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: APP_UNIVERSAL_IDENTIFIER,
    });
  }, 60000);

  it('records retried attempts as warnings and only the last attempt as an error', async () => {
    const jobId = await global.app
      .get<MessageQueueService>(
        getQueueToken(MessageQueue.logicFunctionQueue),
        {
          strict: false,
        },
      )
      .add<LogicFunctionTriggerJobData>(
        LogicFunctionTriggerJob.name,
        {
          logicFunctionId: queuedFunctionId,
          workspaceId: SEED_APPLE_WORKSPACE_ID,
          payload: {},
        },
        {
          retryLimit: 3,
          backoff: LOGIC_FUNCTION_QUEUE_RETRY_BACKOFF,
          workspaceId: SEED_APPLE_WORKSPACE_ID,
          applicationUniversalIdentifier: APP_UNIVERSAL_IDENTIFIER,
        },
      );

    await waitForAllJobsToFinish();

    const job = await logicFunctionInspectionQueue.getJob(jobId ?? '');

    expect(await job?.getState()).toBe('completed');
    expect(job?.attemptsStarted).toBe(4);

    await expectEventually(async () => {
      expect(await countMetricEventsByLevel(queuedFunctionId)).toEqual({
        WARN: 3,
        ERROR: 1,
      });
    });
  }, 120000);

  it('records the attempt as an error once platform failures used up the queue retries', async () => {
    const persistRetryCount = jest.fn();

    await expect(
      getAppProviderByClassName<LogicFunctionJobRunnerService>(
        'LogicFunctionJobRunnerService',
      ).run({
        logicFunctionPayload: {
          logicFunctionId: directFunctionId,
          workspaceId: SEED_APPLE_WORKSPACE_ID,
          applicationRetryCount: 2,
        },
        retryLimit: 3,
        attemptsMade: 3,
        persistRetryCount,
      }),
    ).resolves.toBeUndefined();

    expect(persistRetryCount).not.toHaveBeenCalled();

    await expectEventually(async () => {
      expect(await countMetricEventsByLevel(directFunctionId)).toEqual({
        ERROR: 1,
      });
    });
  }, 60000);
});
