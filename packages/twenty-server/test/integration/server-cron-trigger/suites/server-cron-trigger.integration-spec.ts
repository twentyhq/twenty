import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { uploadApplicationFile } from 'test/integration/metadata/suites/application/utils/upload-application-file.util';
import { findLogicFunctionId } from 'test/integration/server-route-trigger/utils/find-logic-function-id.util';
import { insertApplication } from 'test/integration/server-route-trigger/utils/insert-application.util';
import { type LogicFunctionManifest } from 'twenty-shared/application';

import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { waitForAllJobsToFinish } from 'test/integration/utils/wait-for-all-jobs-to-finish.util';

import { type LogicFunctionExecutorService } from 'src/engine/core-modules/logic-function/logic-function-executor/logic-function-executor.service';
import { type ServerCronTriggerJobData } from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/server-cron/types/server-cron-trigger-job-data.type';
import { buildServerCronDispatchJobId } from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/server-cron/utils/build-server-cron-dispatch-job-id.util';
import { buildServerCronStepJobId } from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/server-cron/utils/build-server-cron-step-job-id.util';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { type MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { getQueueToken } from 'src/engine/core-modules/message-queue/utils/get-queue-token.util';
import {
  SEED_APPLE_WORKSPACE_ID,
  SEED_YCOMBINATOR_WORKSPACE_ID,
} from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const OWNER_WORKSPACE_ID = SEED_APPLE_WORKSPACE_ID;
const FOREIGN_WORKSPACE_ID = SEED_YCOMBINATOR_WORKSPACE_ID;
const NOT_INSTALLED_WORKSPACE_ID = '9f6e2a44-83a1-4c4e-9d2b-2f5b1c7e6a10';

const APP_UNIVERSAL_IDENTIFIER = '7c1d3e5f-2a4b-4c6d-8e0f-1a2b3c4d5e6f';
const ROLE_UNIVERSAL_IDENTIFIER = '8d2e4f60-3b5c-4d7e-9f10-2b3c4d5e6f70';
const DISPATCHER_UNIVERSAL_IDENTIFIER = '9e3f5a71-4c6d-4e8f-a021-3c4d5e6f7a81';
const TARGET_UNIVERSAL_IDENTIFIER = 'af406b82-5d7e-4f90-b132-4d5e6f7a8b92';
const UNKNOWN_TARGET_UNIVERSAL_IDENTIFIER =
  'b0517c93-6e8f-4a01-8243-5e6f7a8b9ca3';

const SCHEDULED_AT_EPOCH_MS = Date.parse('2026-09-23T04:30:00.000Z');

const DISPATCHER_BUILT_HANDLER_CODE = `export const main = async (payload) => ({
  dispatches: [
    {
      workspaceId: '${OWNER_WORKSPACE_ID}',
      targetLogicFunctionUniversalIdentifier: '${TARGET_UNIVERSAL_IDENTIFIER}',
      payload: { scheduledAt: payload.scheduledAt, step: payload.step },
    },
    {
      workspaceId: '${FOREIGN_WORKSPACE_ID}',
      targetLogicFunctionUniversalIdentifier: '${TARGET_UNIVERSAL_IDENTIFIER}',
    },
    {
      workspaceId: '${NOT_INSTALLED_WORKSPACE_ID}',
      targetLogicFunctionUniversalIdentifier: '${TARGET_UNIVERSAL_IDENTIFIER}',
    },
    {
      workspaceId: '${OWNER_WORKSPACE_ID}',
      targetLogicFunctionUniversalIdentifier: '${UNKNOWN_TARGET_UNIVERSAL_IDENTIFIER}',
    },
  ],
  ...(payload.step === 0 ? { next: { cursor: { page: 2 } } } : {}),
});
`;

const TARGET_BUILT_HANDLER_CODE = `export const main = async () => ({ received: true });
`;

const buildLogicFunctionManifest = ({
  universalIdentifier,
  name,
  triggerSettings,
}: {
  universalIdentifier: string;
  name: string;
  triggerSettings: Partial<LogicFunctionManifest>;
}): LogicFunctionManifest => ({
  universalIdentifier,
  name,
  handlerName: 'main',
  sourceHandlerPath: `src/${name}.ts`,
  builtHandlerPath: `dist/${name}.mjs`,
  builtHandlerChecksum: `checksum-${name}`,
  ...triggerSettings,
});

const buildManifest = (
  dispatcherTriggerSettings: Partial<LogicFunctionManifest>,
) =>
  buildBaseManifest({
    appId: APP_UNIVERSAL_IDENTIFIER,
    roleId: ROLE_UNIVERSAL_IDENTIFIER,
    overrides: {
      logicFunctions: [
        buildLogicFunctionManifest({
          universalIdentifier: DISPATCHER_UNIVERSAL_IDENTIFIER,
          name: 'dispatcher',
          triggerSettings: dispatcherTriggerSettings,
        }),
        buildLogicFunctionManifest({
          universalIdentifier: TARGET_UNIVERSAL_IDENTIFIER,
          name: 'target',
          triggerSettings: {},
        }),
      ],
    },
  });

const uploadBuiltHandlerFile = async ({
  builtHandlerPath,
  builtHandlerCode,
}: {
  builtHandlerPath: string;
  builtHandlerCode: string;
}) => {
  jest.useRealTimers();

  await uploadApplicationFile({
    applicationUniversalIdentifier: APP_UNIVERSAL_IDENTIFIER,
    fileFolder: 'BuiltLogicFunction',
    filePath: builtHandlerPath,
    fileBuffer: Buffer.from(builtHandlerCode),
    filename: builtHandlerPath.split('/').pop() as string,
    contentType: 'application/javascript',
    expectToFail: false,
  });
};

const insertForeignLogicFunction = async ({
  universalIdentifier,
  applicationId,
  serverCronTriggerSettings,
}: {
  universalIdentifier: string;
  applicationId: string;
  serverCronTriggerSettings: object | null;
}): Promise<string> => {
  const [{ id }] = await globalThis.testDataSource.query(
    `INSERT INTO core."logicFunction"
       ("universalIdentifier", name, "sourceHandlerPath", "builtHandlerPath",
        "handlerName", "serverCronTriggerSettings", "applicationId",
        "workspaceId")
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id`,
    [
      universalIdentifier,
      'foreign-copy',
      'src/foreign-copy.ts',
      'dist/foreign-copy.mjs',
      'main',
      serverCronTriggerSettings === null
        ? null
        : JSON.stringify(serverCronTriggerSettings),
      applicationId,
      FOREIGN_WORKSPACE_ID,
    ],
  );

  return id;
};

const getLogicFunctionQueueService = () =>
  global.app.get<MessageQueueService>(
    getQueueToken(MessageQueue.logicFunctionQueue),
    { strict: false },
  );

describe('ServerCronTrigger (integration)', () => {
  let applicationRegistrationId: string;
  let dispatcherLogicFunctionId: string;
  let foreignDispatcherLogicFunctionId: string;
  let foreignApplicationId: string;

  beforeAll(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: APP_UNIVERSAL_IDENTIFIER,
      name: 'Server Cron Test App',
      description: 'App for testing server cron triggers',
      sourcePath: 'server-cron-test-app',
    });

    await uploadBuiltHandlerFile({
      builtHandlerPath: 'dist/dispatcher.mjs',
      builtHandlerCode: DISPATCHER_BUILT_HANDLER_CODE,
    });

    await uploadBuiltHandlerFile({
      builtHandlerPath: 'dist/target.mjs',
      builtHandlerCode: TARGET_BUILT_HANDLER_CODE,
    });

    await syncApplication({
      manifest: buildManifest({
        serverCronTriggerSettings: { pattern: '30 4 * * *' },
      }),
      expectToFail: false,
    });

    [{ id: applicationRegistrationId }] = await globalThis.testDataSource.query(
      `SELECT id FROM core."applicationRegistration" WHERE "universalIdentifier" = $1`,
      [APP_UNIVERSAL_IDENTIFIER],
    );

    dispatcherLogicFunctionId = await findLogicFunctionId({
      universalIdentifier: DISPATCHER_UNIVERSAL_IDENTIFIER,
      workspaceId: OWNER_WORKSPACE_ID,
    });

    foreignApplicationId = await insertApplication({
      universalIdentifier: APP_UNIVERSAL_IDENTIFIER,
      name: 'Installed copy',
      workspaceId: FOREIGN_WORKSPACE_ID,
      applicationRegistrationId,
    });

    foreignDispatcherLogicFunctionId = await insertForeignLogicFunction({
      universalIdentifier: DISPATCHER_UNIVERSAL_IDENTIFIER,
      applicationId: foreignApplicationId,
      serverCronTriggerSettings: { pattern: '30 4 * * *' },
    });

    await insertForeignLogicFunction({
      universalIdentifier: TARGET_UNIVERSAL_IDENTIFIER,
      applicationId: foreignApplicationId,
      serverCronTriggerSettings: null,
    });

    await global.workflowTestServices.workspaceCache.invalidateAndRecompute(
      FOREIGN_WORKSPACE_ID,
      ['flatLogicFunctionMaps', 'flatApplicationMaps'],
    );
  }, 60000);

  afterAll(async () => {
    await globalThis.testDataSource.query(
      `DELETE FROM core."file" WHERE "applicationId" = $1`,
      [foreignApplicationId],
    );
    await globalThis.testDataSource.query(
      `DELETE FROM core."application" WHERE id = $1`,
      [foreignApplicationId],
    );

    await global.workflowTestServices.workspaceCache.invalidateAndRecompute(
      FOREIGN_WORKSPACE_ID,
      ['flatLogicFunctionMaps', 'flatApplicationMaps'],
    );

    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: APP_UNIVERSAL_IDENTIFIER,
    });
  }, 60000);

  it('dispatches to installs of the same registration and enqueues the next step', async () => {
    const stepJobData: ServerCronTriggerJobData = {
      workspaceId: OWNER_WORKSPACE_ID,
      logicFunctionId: dispatcherLogicFunctionId,
      logicFunctionUniversalIdentifier: DISPATCHER_UNIVERSAL_IDENTIFIER,
      applicationRegistrationId,
      scheduledAtEpochMs: SCHEDULED_AT_EPOCH_MS,
      step: 0,
    };
    const stepJobId = buildServerCronStepJobId(stepJobData);
    const buildDispatchJobId = (
      workspaceId: string,
      targetLogicFunctionUniversalIdentifier: string,
    ) =>
      buildServerCronDispatchJobId({
        stepJobId,
        workspaceId,
        targetLogicFunctionUniversalIdentifier,
      });

    await getLogicFunctionQueueService().bulkAdd<ServerCronTriggerJobData>(
      'ServerCronTriggerJob',
      [{ data: stepJobData, jobId: stepJobId }],
      { allowDuplicatedPrefixes: true },
    );
    await waitForAllJobsToFinish();

    const jobsById = await getLogicFunctionQueueService().getJobs([
      buildDispatchJobId(OWNER_WORKSPACE_ID, TARGET_UNIVERSAL_IDENTIFIER),
      buildDispatchJobId(FOREIGN_WORKSPACE_ID, TARGET_UNIVERSAL_IDENTIFIER),
      buildDispatchJobId(
        NOT_INSTALLED_WORKSPACE_ID,
        TARGET_UNIVERSAL_IDENTIFIER,
      ),
      buildDispatchJobId(
        OWNER_WORKSPACE_ID,
        UNKNOWN_TARGET_UNIVERSAL_IDENTIFIER,
      ),
      buildServerCronStepJobId({ ...stepJobData, step: 1 }),
    ]);

    expect(Object.keys(jobsById).sort()).toEqual(
      [
        buildDispatchJobId(OWNER_WORKSPACE_ID, TARGET_UNIVERSAL_IDENTIFIER),
        buildDispatchJobId(FOREIGN_WORKSPACE_ID, TARGET_UNIVERSAL_IDENTIFIER),
        buildServerCronStepJobId({ ...stepJobData, step: 1 }),
      ].sort(),
    );
    expect(
      jobsById[
        buildDispatchJobId(OWNER_WORKSPACE_ID, TARGET_UNIVERSAL_IDENTIFIER)
      ]?.data,
    ).toEqual(
      expect.objectContaining({
        workspaceId: OWNER_WORKSPACE_ID,
        payload: { scheduledAt: '2026-09-23T04:30:00.000Z', step: 0 },
      }),
    );
  }, 60000);

  it('refuses to run a server cron function outside the owner workspace', async () => {
    await expect(
      getAppProviderByClassName<LogicFunctionExecutorService>(
        'LogicFunctionExecutorService',
      ).execute({
        logicFunctionId: foreignDispatcherLogicFunctionId,
        workspaceId: FOREIGN_WORKSPACE_ID,
        payload: {},
      }),
    ).rejects.toMatchObject({ code: 'LOGIC_FUNCTION_NOT_FOUND' });
  });

  it('rejects a server cron pattern that does not have 5 fields', async () => {
    const { errors } = await syncApplication({
      manifest: buildManifest({
        serverCronTriggerSettings: { pattern: '0 30 4 * * *' },
      }),
      expectToFail: true,
    });

    expect(errors).toBeDefined();
  });

  it('rejects a server cron combined with another trigger', async () => {
    const { errors } = await syncApplication({
      manifest: buildManifest({
        serverCronTriggerSettings: { pattern: '30 4 * * *' },
        cronTriggerSettings: { pattern: '30 4 * * *' },
      }),
      expectToFail: true,
    });

    expect(errors).toBeDefined();
  });
});
