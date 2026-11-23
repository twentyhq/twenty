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

const JOB_FAILURE_HANDLER_NAME = 'onJobFailure';
const BULLMQ_STALLED_JOB_FAILURE_REASON_FIELD = 'defa';

const FUNCTION_CODE = `export const main = async () => {
  throw new Error('Agent run crashed');
};

export const onJobFailure = async (failure) => ({
  handledRequestId: failure.payload.requestId,
});
`;

const failingFunctionManifest: LogicFunctionManifest = {
  universalIdentifier: FAILING_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'answer-request',
  handlerName: 'main',
  jobFailureHandlerName: JOB_FAILURE_HANDLER_NAME,
  sourceHandlerPath: 'src/answer-request.ts',
  builtHandlerPath: 'dist/answer-request.mjs',
  builtHandlerChecksum: 'checksum-answer-request',
};

describe('Logic function job failure handler (integration)', () => {
  let redisConnection: IORedis;
  let logicFunctionInspectionQueue: Queue<LogicFunctionTriggerJobData>;
  let failingFunctionId: string;

  const enqueueFailingFunctionRun = ({
    payload,
    jobFailureHandlerName,
    delay,
  }: {
    payload: object;
    jobFailureHandlerName?: string;
    delay?: number;
  }) =>
    global.app
      .get<MessageQueueService>(
        getQueueToken(MessageQueue.logicFunctionQueue),
        { strict: false },
      )
      .add<LogicFunctionTriggerJobData>(
        LogicFunctionTriggerJob.name,
        {
          logicFunctionId: failingFunctionId,
          workspaceId: SEED_APPLE_WORKSPACE_ID,
          payload,
          ...(isDefined(jobFailureHandlerName)
            ? { jobFailureHandlerName }
            : {}),
        },
        {
          retryLimit: 0,
          ...(isDefined(delay) ? { delay } : {}),
          workspaceId: SEED_APPLE_WORKSPACE_ID,
          applicationUniversalIdentifier: APP_UNIVERSAL_IDENTIFIER,
        },
      );

  const getJobFailureHandlerJobs = async () =>
    (
      await logicFunctionInspectionQueue.getJobs(['completed', 'failed'])
    ).filter(
      (job) => job.data.jobFailureHandlerName === JOB_FAILURE_HANDLER_NAME,
    );

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
      name: 'Logic Function Job Failure Handler Test App',
      description: 'App for testing the onJobFailure handler',
      sourcePath: 'logic-function-job-failure-handler-test-app',
    });

    jest.useRealTimers();

    await uploadApplicationFile({
      applicationUniversalIdentifier: APP_UNIVERSAL_IDENTIFIER,
      fileFolder: 'BuiltLogicFunction',
      filePath: 'dist/answer-request.mjs',
      fileBuffer: Buffer.from(FUNCTION_CODE),
      filename: 'answer-request.mjs',
      contentType: 'application/javascript',
      expectToFail: false,
    });

    await syncApplication({
      manifest: buildBaseManifest({
        appId: APP_UNIVERSAL_IDENTIFIER,
        roleId: ROLE_UNIVERSAL_IDENTIFIER,
        overrides: { logicFunctions: [failingFunctionManifest] },
      }),
      expectToFail: false,
    });

    failingFunctionId = await findLogicFunctionId({
      universalIdentifier: FAILING_FUNCTION_UNIVERSAL_IDENTIFIER,
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

  it('runs onJobFailure with the original payload when a queued run fails', async () => {
    const originalPayload = { requestId: 'request-1' };

    const queueJobId = await enqueueFailingFunctionRun({
      payload: originalPayload,
    });

    await waitForAllJobsToFinish();

    const jobFailureHandlerJob = await logicFunctionInspectionQueue.getJob(
      `${queueJobId}.on-failure`,
    );

    expect(await jobFailureHandlerJob?.getState()).toBe('completed');
    expect(jobFailureHandlerJob?.data).toMatchObject({
      logicFunctionId: failingFunctionId,
      jobFailureHandlerName: JOB_FAILURE_HANDLER_NAME,
      payload: {
        payload: originalPayload,
        error: { type: 'Error', message: 'Agent run crashed' },
        job: { id: queueJobId, attemptsMade: 1 },
      },
    });
  }, 120000);

  it('runs onJobFailure when the queue fails a job whose workers kept crashing', async () => {
    const queueJobId = await enqueueFailingFunctionRun({
      payload: { requestId: 'request-crashed' },
      delay: 60_000,
    });

    if (!isDefined(queueJobId)) {
      throw new Error('The crashed run job was not enqueued');
    }

    await redisConnection.hset(
      logicFunctionInspectionQueue.toKey(queueJobId),
      BULLMQ_STALLED_JOB_FAILURE_REASON_FIELD,
      'job stalled more than allowable limit',
    );

    await waitForAllJobsToFinish();

    const jobFailureHandlerJob = await logicFunctionInspectionQueue.getJob(
      `${queueJobId}.on-failure`,
    );

    expect(await jobFailureHandlerJob?.getState()).toBe('completed');
    expect(jobFailureHandlerJob?.data.payload).toMatchObject({
      job: { id: queueJobId },
      error: {
        type: 'UnrecoverableError',
        message: 'job stalled more than allowable limit',
      },
    });
  }, 120000);

  it('does not run onJobFailure again when the onJobFailure run itself fails', async () => {
    const jobFailureHandlerJobCountBefore = (await getJobFailureHandlerJobs())
      .length;

    // 'main' always throws, so this stands in for a failing onJobFailure run.
    await enqueueFailingFunctionRun({
      payload: { requestId: 'request-2' },
      jobFailureHandlerName: 'main',
    });

    await waitForAllJobsToFinish();

    expect((await getJobFailureHandlerJobs()).length).toBe(
      jobFailureHandlerJobCountBefore,
    );
  }, 120000);
});
