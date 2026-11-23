import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { uploadApplicationFile } from 'test/integration/metadata/suites/application/utils/upload-application-file.util';
import { findLogicFunctionId } from 'test/integration/server-route-trigger/utils/find-logic-function-id.util';
import { waitForAllJobsToFinish } from 'test/integration/utils/wait-for-all-jobs-to-finish.util';
import { type LogicFunctionManifest } from 'twenty-shared/application';
import { type LogicFunctionFailureHandlerPayload } from 'twenty-shared/logic-function';
import { isDefined } from 'twenty-shared/utils';

import {
  LogicFunctionTriggerJob,
  type LogicFunctionTriggerJobData,
} from 'src/engine/core-modules/logic-function/logic-function-trigger/jobs/logic-function-trigger.job';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { type MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { getQueueToken } from 'src/engine/core-modules/message-queue/utils/get-queue-token.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const APP_UNIVERSAL_IDENTIFIER = '1da3273d-32a2-442f-a4cd-7baad9f5c212';
const ROLE_UNIVERSAL_IDENTIFIER = 'd6fb8a36-73c4-4b01-8972-45d8ee5719a3';
const FAILING_FUNCTION_UNIVERSAL_IDENTIFIER =
  'ab753ffb-f248-4484-bcca-361bbcea4f20';
const FAILURE_HANDLER_UNIVERSAL_IDENTIFIER =
  '6bde7857-4021-41e5-bf75-d473c8bfcf4f';
const UNKNOWN_FUNCTION_UNIVERSAL_IDENTIFIER =
  'b1a95f51-73fa-4842-ab54-1e4e419b053c';

type CrashedRunPayload = { requestId: string };

const FAILING_HANDLER_CODE = `export const main = async () => {
  throw new Error('Agent run crashed');
};
`;

const FAILURE_HANDLER_CODE = `export const main = async (payload) => ({
  handledFailureOf: payload.failedLogicFunctionUniversalIdentifier,
});
`;

const buildFunctionManifest = ({
  universalIdentifier,
  name,
  onFailureUniversalIdentifier,
}: {
  universalIdentifier: string;
  name: string;
  onFailureUniversalIdentifier?: string;
}): LogicFunctionManifest => ({
  universalIdentifier,
  name,
  handlerName: 'main',
  sourceHandlerPath: `src/${name}.ts`,
  builtHandlerPath: `dist/${name}.mjs`,
  builtHandlerChecksum: `checksum-${name}`,
  ...(isDefined(onFailureUniversalIdentifier)
    ? {
        onFailureLogicFunction: {
          universalIdentifier: onFailureUniversalIdentifier,
        },
      }
    : {}),
});

const failureHandlerManifest = buildFunctionManifest({
  universalIdentifier: FAILURE_HANDLER_UNIVERSAL_IDENTIFIER,
  name: 'fail-request',
});

const buildManifest = (onFailureUniversalIdentifier: string) =>
  buildBaseManifest({
    appId: APP_UNIVERSAL_IDENTIFIER,
    roleId: ROLE_UNIVERSAL_IDENTIFIER,
    overrides: {
      logicFunctions: [
        buildFunctionManifest({
          universalIdentifier: FAILING_FUNCTION_UNIVERSAL_IDENTIFIER,
          name: 'answer-request',
          onFailureUniversalIdentifier,
        }),
        failureHandlerManifest,
      ],
    },
  });

describe('Logic function failure handler (integration)', () => {
  let redisConnection: IORedis;
  let logicFunctionInspectionQueue: Queue<LogicFunctionTriggerJobData>;
  let failingFunctionId: string;
  let failureHandlerId: string;

  const getFailureHandlerJobs = async () =>
    (
      await logicFunctionInspectionQueue.getJobs(['completed', 'failed'])
    ).filter((job) => job.data.logicFunctionId === failureHandlerId);

  beforeAll(async () => {
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
      name: 'Logic Function Failure Handler Test App',
      description: 'App for testing the onFailureLogicFunction hook',
      sourcePath: 'logic-function-failure-handler-test-app',
    });

    jest.useRealTimers();

    for (const [name, code] of [
      ['answer-request', FAILING_HANDLER_CODE],
      ['fail-request', FAILURE_HANDLER_CODE],
    ]) {
      await uploadApplicationFile({
        applicationUniversalIdentifier: APP_UNIVERSAL_IDENTIFIER,
        fileFolder: 'BuiltLogicFunction',
        filePath: `dist/${name}.mjs`,
        fileBuffer: Buffer.from(code),
        filename: `${name}.mjs`,
        contentType: 'application/javascript',
        expectToFail: false,
      });
    }

    await syncApplication({
      manifest: buildManifest(FAILURE_HANDLER_UNIVERSAL_IDENTIFIER),
      expectToFail: false,
    });

    failingFunctionId = await findLogicFunctionId({
      universalIdentifier: FAILING_FUNCTION_UNIVERSAL_IDENTIFIER,
      workspaceId: SEED_APPLE_WORKSPACE_ID,
    });

    failureHandlerId = await findLogicFunctionId({
      universalIdentifier: FAILURE_HANDLER_UNIVERSAL_IDENTIFIER,
      workspaceId: SEED_APPLE_WORKSPACE_ID,
    });
  }, 60000);

  afterAll(async () => {
    await logicFunctionInspectionQueue.close();
    await redisConnection.quit();

    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: APP_UNIVERSAL_IDENTIFIER,
    });
  }, 60000);

  it('runs the failure handler with the original payload when a queued run fails', async () => {
    const originalPayload = { requestId: 'request-1' };

    await global.app
      .get<MessageQueueService>(
        getQueueToken(MessageQueue.logicFunctionQueue),
        { strict: false },
      )
      .add<LogicFunctionTriggerJobData>(
        LogicFunctionTriggerJob.name,
        {
          logicFunctionId: failingFunctionId,
          workspaceId: SEED_APPLE_WORKSPACE_ID,
          payload: originalPayload,
        },
        {
          retryLimit: 0,
          workspaceId: SEED_APPLE_WORKSPACE_ID,
          applicationUniversalIdentifier: APP_UNIVERSAL_IDENTIFIER,
        },
      );

    await waitForAllJobsToFinish();

    const failureHandlerJobs = await getFailureHandlerJobs();

    expect(failureHandlerJobs).toHaveLength(1);
    expect(await failureHandlerJobs[0].getState()).toBe('completed');
    expect(failureHandlerJobs[0].data).toMatchObject({
      isFailureHandlerRun: true,
      payload: {
        failedLogicFunctionUniversalIdentifier:
          FAILING_FUNCTION_UNIVERSAL_IDENTIFIER,
        jobId: expect.any(String),
        attemptsMade: 1,
        payload: originalPayload,
        error: { errorType: 'Error', errorMessage: 'Agent run crashed' },
      },
    });
  }, 120000);

  it('runs the failure handler when the queue fails a job whose workers kept crashing', async () => {
    const queueJobId = await global.app
      .get<MessageQueueService>(
        getQueueToken(MessageQueue.logicFunctionQueue),
        { strict: false },
      )
      .add<LogicFunctionTriggerJobData>(
        LogicFunctionTriggerJob.name,
        {
          logicFunctionId: failingFunctionId,
          workspaceId: SEED_APPLE_WORKSPACE_ID,
          payload: { requestId: 'request-crashed' },
        },
        {
          retryLimit: 0,
          delay: 60_000,
          workspaceId: SEED_APPLE_WORKSPACE_ID,
          applicationUniversalIdentifier: APP_UNIVERSAL_IDENTIFIER,
        },
      );

    // BullMQ flags a job this way once it stalled more than maxStalledCount times.
    await redisConnection.hset(
      logicFunctionInspectionQueue.toKey(queueJobId ?? ''),
      'defa',
      'job stalled more than allowable limit',
    );

    await waitForAllJobsToFinish();

    const crashedRunHandlerJobs = (await getFailureHandlerJobs()).filter(
      (job) =>
        (
          job.data
            .payload as LogicFunctionFailureHandlerPayload<CrashedRunPayload>
        ).payload.requestId === 'request-crashed',
    );

    expect(crashedRunHandlerJobs).toHaveLength(1);
    expect(crashedRunHandlerJobs[0].data.payload).toMatchObject({
      jobId: queueJobId,
      error: {
        errorType: 'UnrecoverableError',
        errorMessage: 'job stalled more than allowable limit',
      },
    });
  }, 120000);

  it('does not run a failure handler when a failure handler run fails', async () => {
    const failureHandlerJobCountBefore = (await getFailureHandlerJobs()).length;

    await global.app
      .get<MessageQueueService>(
        getQueueToken(MessageQueue.logicFunctionQueue),
        { strict: false },
      )
      .add<LogicFunctionTriggerJobData>(
        LogicFunctionTriggerJob.name,
        {
          logicFunctionId: failingFunctionId,
          workspaceId: SEED_APPLE_WORKSPACE_ID,
          payload: { requestId: 'request-2' },
          isFailureHandlerRun: true,
        },
        {
          retryLimit: 0,
          workspaceId: SEED_APPLE_WORKSPACE_ID,
          applicationUniversalIdentifier: APP_UNIVERSAL_IDENTIFIER,
        },
      );

    await waitForAllJobsToFinish();

    expect((await getFailureHandlerJobs()).length).toBe(
      failureHandlerJobCountBefore,
    );
  }, 120000);

  it('rejects a failure handler that is not a logic function of the application', async () => {
    await syncApplication({
      manifest: buildManifest(UNKNOWN_FUNCTION_UNIVERSAL_IDENTIFIER),
      expectToFail: true,
    });
  }, 60000);
});
