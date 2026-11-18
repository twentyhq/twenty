import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { uploadApplicationFile } from 'test/integration/metadata/suites/application/utils/upload-application-file.util';
import { findLogicFunctionId } from 'test/integration/server-route-trigger/utils/find-logic-function-id.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import { waitForAllJobsToFinish } from 'test/integration/utils/wait-for-all-jobs-to-finish.util';
import { type LogicFunctionManifest } from 'twenty-shared/application';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';

import { type CoreEntityCacheService } from 'src/engine/core-entity-cache/services/core-entity-cache.service';
import { type LogicFunctionDriverFactory } from 'src/engine/core-modules/logic-function/logic-function-drivers/logic-function-driver.factory';
import { type LogicFunctionExecutorService } from 'src/engine/core-modules/logic-function/logic-function-executor/logic-function-executor.service';
import { LOGIC_FUNCTION_QUEUE_RETRY_BACKOFF } from 'src/engine/core-modules/logic-function/logic-function-trigger/constants/logic-function-queue-retry-backoff.constant';
import {
  LogicFunctionTriggerJob,
  type LogicFunctionTriggerJobData,
} from 'src/engine/core-modules/logic-function/logic-function-trigger/jobs/logic-function-trigger.job';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { type MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { getQueueToken } from 'src/engine/core-modules/message-queue/utils/get-queue-token.util';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { LogicFunctionExecutionStatus } from 'src/engine/metadata-modules/logic-function/dtos/logic-function-execution-result.dto';
import { LogicFunctionExceptionCode } from 'src/engine/metadata-modules/logic-function/logic-function.exception';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const APP_UNIVERSAL_IDENTIFIER = '3e1f6b0a-7c2d-4f5e-9a1b-2c3d4e5f6a7b';
const ROLE_UNIVERSAL_IDENTIFIER = '4f2a7c1b-8d3e-4a6f-8b2c-3d4e5f6a7b8c';
const LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER =
  '5a3b8d2c-9e4f-4b7a-9c3d-4e5f6a7b8c9d';

const LOGIC_FUNCTION_RESPONSE = { ran: true };

const BUILT_HANDLER_CODE = 'export const main = async () => ({ ran: true });\n';

const logicFunctionManifest: LogicFunctionManifest = {
  universalIdentifier: LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'suspended-workspace-function',
  handlerName: 'main',
  sourceHandlerPath: 'src/suspended-workspace-function.ts',
  builtHandlerPath: 'dist/suspended-workspace-function.mjs',
  builtHandlerChecksum: 'checksum-suspended-workspace-function',
};

// The executor reads the workspace from the core entity cache, so the cached entry must follow the row.
const setAppleWorkspaceActivationStatus = async (
  activationStatus: WorkspaceActivationStatus,
) => {
  await getCoreRepository<WorkspaceEntity>(WorkspaceEntity).update(
    SEED_APPLE_WORKSPACE_ID,
    {
      activationStatus,
      suspendedAt:
        activationStatus === WorkspaceActivationStatus.SUSPENDED
          ? new Date()
          : null,
    },
  );

  await getAppProviderByClassName<CoreEntityCacheService>(
    'CoreEntityCacheService',
  ).invalidate('workspaceEntity', SEED_APPLE_WORKSPACE_ID);
};

describe('Logic function runs on a suspended workspace (integration)', () => {
  let logicFunctionId: string;
  let logicFunctionExecutorService: LogicFunctionExecutorService;
  let redisConnection: IORedis;
  let logicFunctionInspectionQueue: Queue<LogicFunctionTriggerJobData>;

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
      name: 'Suspended Workspace Logic Function Test App',
      description:
        'App for testing logic function runs on a suspended workspace',
      sourcePath: 'suspended-workspace-logic-function-test-app',
    });

    jest.useRealTimers();

    await uploadApplicationFile({
      applicationUniversalIdentifier: APP_UNIVERSAL_IDENTIFIER,
      fileFolder: 'BuiltLogicFunction',
      filePath: logicFunctionManifest.builtHandlerPath,
      fileBuffer: Buffer.from(BUILT_HANDLER_CODE),
      filename: 'suspended-workspace-function.mjs',
      contentType: 'application/javascript',
      expectToFail: false,
    });

    await syncApplication({
      manifest: buildBaseManifest({
        appId: APP_UNIVERSAL_IDENTIFIER,
        roleId: ROLE_UNIVERSAL_IDENTIFIER,
        overrides: { logicFunctions: [logicFunctionManifest] },
      }),
      expectToFail: false,
    });

    logicFunctionId = await findLogicFunctionId({
      universalIdentifier: LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
      workspaceId: SEED_APPLE_WORKSPACE_ID,
    });

    logicFunctionExecutorService =
      getAppProviderByClassName<LogicFunctionExecutorService>(
        'LogicFunctionExecutorService',
      );
  }, 60000);

  afterEach(async () => {
    jest.restoreAllMocks();
    await setAppleWorkspaceActivationStatus(WorkspaceActivationStatus.ACTIVE);
  });

  afterAll(async () => {
    await logicFunctionInspectionQueue.close();
    await redisConnection.quit();

    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: APP_UNIVERSAL_IDENTIFIER,
    });
  }, 60000);

  it('runs the function while the workspace is active', async () => {
    const result = await logicFunctionExecutorService.execute({
      logicFunctionId,
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      payload: {},
    });

    expect(result).toMatchObject({
      status: LogicFunctionExecutionStatus.SUCCESS,
      data: LOGIC_FUNCTION_RESPONSE,
    });
  }, 60000);

  it.each([
    WorkspaceActivationStatus.SUSPENDED,
    WorkspaceActivationStatus.INACTIVE,
  ])(
    'refuses the run once the workspace is %s',
    async (activationStatus) => {
      await setAppleWorkspaceActivationStatus(activationStatus);

      await expect(
        logicFunctionExecutorService.execute({
          logicFunctionId,
          workspaceId: SEED_APPLE_WORKSPACE_ID,
          payload: {},
        }),
      ).rejects.toMatchObject({
        code: LogicFunctionExceptionCode.LOGIC_FUNCTION_WORKSPACE_SUSPENDED,
      });
    },
    60000,
  );

  it('still refuses a suspended workspace when only usage limits are skipped', async () => {
    await setAppleWorkspaceActivationStatus(
      WorkspaceActivationStatus.SUSPENDED,
    );

    await expect(
      logicFunctionExecutorService.execute({
        logicFunctionId,
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        payload: {},
        shouldEnforceUsageLimits: false,
      }),
    ).rejects.toMatchObject({
      code: LogicFunctionExceptionCode.LOGIC_FUNCTION_WORKSPACE_SUSPENDED,
    });
  }, 60000);

  it('still runs a cleanup hook that opts out on a suspended workspace', async () => {
    await setAppleWorkspaceActivationStatus(
      WorkspaceActivationStatus.SUSPENDED,
    );

    const result = await logicFunctionExecutorService.execute({
      logicFunctionId,
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      payload: {},
      shouldEnforceUsageLimits: false,
      shouldRefuseSuspendedWorkspace: false,
    });

    expect(result).toMatchObject({
      status: LogicFunctionExecutionStatus.SUCCESS,
      data: LOGIC_FUNCTION_RESPONSE,
    });
  }, 60000);

  it('completes a queued run on a suspended workspace without retrying it', async () => {
    await setAppleWorkspaceActivationStatus(
      WorkspaceActivationStatus.SUSPENDED,
    );

    const driverExecuteSpy = jest.spyOn(
      getAppProviderByClassName<LogicFunctionDriverFactory>(
        'LogicFunctionDriverFactory',
      ).getCurrentDriver(),
      'execute',
    );

    const jobId = await global.app
      .get<MessageQueueService>(
        getQueueToken(MessageQueue.logicFunctionQueue),
        {
          strict: false,
        },
      )
      .add<LogicFunctionTriggerJobData>(
        LogicFunctionTriggerJob.name,
        { logicFunctionId, workspaceId: SEED_APPLE_WORKSPACE_ID, payload: {} },
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
    expect(job?.attemptsStarted).toBe(1);
    expect(job?.data.applicationRetryCount).toBeUndefined();
    expect(driverExecuteSpy).not.toHaveBeenCalled();
  }, 120000);
});
