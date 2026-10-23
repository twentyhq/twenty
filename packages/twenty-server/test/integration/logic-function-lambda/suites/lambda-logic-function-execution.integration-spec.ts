import { randomUUID } from 'crypto';

import { ResourceNotFoundException } from '@aws-sdk/client-lambda';
import { DEPENDENCY_LAYER_FIXTURE } from 'test/integration/logic-function-lambda/constants/dependency-layer-fixture.constant';
import { type FlociLambdaDriver } from 'test/integration/logic-function-lambda/types/floci-lambda-driver.type';
import { getWorkspaceCustomFlatApplication } from 'test/integration/logic-function-lambda/utils/get-workspace-custom-flat-application.util';
import { publishDependencyLayerFixture } from 'test/integration/logic-function-lambda/utils/publish-dependency-layer-fixture.util';
import { switchToFlociLambdaDriver } from 'test/integration/logic-function-lambda/utils/switch-to-floci-lambda-driver.util';
import { createOneLogicFunction } from 'test/integration/metadata/suites/logic-function/utils/create-logic-function.util';
import { deleteLogicFunction } from 'test/integration/metadata/suites/logic-function/utils/delete-logic-function.util';
import { executeLogicFunction } from 'test/integration/metadata/suites/logic-function/utils/execute-logic-function.util';
import { updateLogicFunctionSource } from 'test/integration/metadata/suites/logic-function/utils/update-logic-function-source.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import { waitForAllJobsToFinish } from 'test/integration/utils/wait-for-all-jobs-to-finish.util';
import { isDefined } from 'twenty-shared/utils';

import { LAMBDA_PREBUILT_BUNDLE_CHECKSUM_TAG } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/constants/lambda-driver.constant';
import { type LogicFunctionExecutorService } from 'src/engine/core-modules/logic-function/logic-function-executor/logic-function-executor.service';
import { type SdkClientGenerationService } from 'src/engine/core-modules/sdk-client/sdk-client-generation.service';
import { LogicFunctionExecutionStatus } from 'src/engine/metadata-modules/logic-function/dtos/logic-function-execution-result.dto';
import {
  LogicFunctionEntity,
  LogicFunctionExecutionMode,
} from 'src/engine/metadata-modules/logic-function/logic-function.entity';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const LAMBDA_TEST_TIMEOUT_MS = 300_000;

const LAYER_PROBE_SOURCE = `import { createHash } from 'crypto';
import { readFile } from 'fs/promises';
import { greeting } from '${DEPENDENCY_LAYER_FIXTURE.packageName}';

export const main = async (): Promise<object> => ({
  greeting,
  sdkClientCoreChecksum: createHash('sha256')
    .update(await readFile('/opt/nodejs/node_modules/twenty-client-sdk/dist/core.mjs'))
    .digest('hex'),
});`;

const THROWING_SOURCE = `export const main = async (): Promise<object> => {
  throw new Error('Lambda handler failure');
};`;

const SLOW_SOURCE = `export const main = async (): Promise<object> => {
  await new Promise((resolve) => setTimeout(resolve, 30_000));
  return { finished: true };
};`;

const buildVersionedSource = (version: number) =>
  `export const main = async (): Promise<object> => ({ version: ${version} });`;

describe('Logic functions on the Lambda driver (integration)', () => {
  let flociLambdaDriver: FlociLambdaDriver;
  const createdLogicFunctionIds: string[] = [];

  const createLogicFunction = async ({
    sourceHandlerCode,
    timeoutSeconds,
  }: { sourceHandlerCode?: string; timeoutSeconds?: number } = {}) => {
    const { data } = await createOneLogicFunction({
      input: { name: `Lambda driver ${randomUUID()}`, timeoutSeconds },
      expectToFail: false,
    });
    const logicFunctionId: string = data.createOneLogicFunction.id;

    createdLogicFunctionIds.push(logicFunctionId);

    if (isDefined(sourceHandlerCode)) {
      await updateLogicFunctionSource({
        input: { id: logicFunctionId, update: { sourceHandlerCode } },
        expectToFail: false,
      });
    }

    return logicFunctionId;
  };

  const runLogicFunction = async (logicFunctionId: string) => {
    const { data } = await executeLogicFunction({
      input: { id: logicFunctionId, payload: {} },
      expectToFail: false,
    });

    return data.executeOneLogicFunction;
  };

  const runLayerProbe = async (logicFunctionId: string) => {
    const result = await runLogicFunction(logicFunctionId);

    if (result.status !== LogicFunctionExecutionStatus.SUCCESS) {
      throw new Error(JSON.stringify(result.error, null, 2));
    }

    return result.data;
  };

  const getCurrentSdkClientCoreChecksum = async () =>
    (await getWorkspaceCustomFlatApplication(SEED_APPLE_WORKSPACE_ID))
      .sdkClientCoreChecksum;

  const regenerateSdkClient = async () => {
    const customFlatApplication = await getWorkspaceCustomFlatApplication(
      SEED_APPLE_WORKSPACE_ID,
    );

    await getAppProviderByClassName<SdkClientGenerationService>(
      'SdkClientGenerationService',
    ).generateSdkClientForApplication({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      applicationId: customFlatApplication.id,
      applicationUniversalIdentifier: customFlatApplication.universalIdentifier,
    });
  };

  beforeAll(async () => {
    flociLambdaDriver = await switchToFlociLambdaDriver();

    await publishDependencyLayerFixture({
      lambdaClient: flociLambdaDriver.lambdaClient,
      resourceNamespace: flociLambdaDriver.resourceNamespace,
      workspaceId: SEED_APPLE_WORKSPACE_ID,
    });

    await regenerateSdkClient();
  }, LAMBDA_TEST_TIMEOUT_MS);

  afterAll(async () => {
    for (const logicFunctionId of createdLogicFunctionIds) {
      await deleteLogicFunction({
        input: { id: logicFunctionId },
        expectToFail: false,
      }).catch(() => undefined);
    }

    await waitForAllJobsToFinish();
    await flociLambdaDriver?.restore();
  }, LAMBDA_TEST_TIMEOUT_MS);

  it(
    'runs a function with its dependency and SDK layers mounted',
    async () => {
      const logicFunctionId = await createLogicFunction({
        sourceHandlerCode: LAYER_PROBE_SOURCE,
      });

      expect(await runLayerProbe(logicFunctionId)).toEqual({
        greeting: DEPENDENCY_LAYER_FIXTURE.greeting,
        sdkClientCoreChecksum: await getCurrentSdkClientCoreChecksum(),
      });
    },
    LAMBDA_TEST_TIMEOUT_MS,
  );

  it(
    'runs the new code once the source is updated',
    async () => {
      const logicFunctionId = await createLogicFunction({
        sourceHandlerCode: buildVersionedSource(1),
      });

      expect((await runLogicFunction(logicFunctionId)).data).toEqual({
        version: 1,
      });

      await updateLogicFunctionSource({
        input: {
          id: logicFunctionId,
          update: { sourceHandlerCode: buildVersionedSource(2) },
        },
        expectToFail: false,
      });

      expect((await runLogicFunction(logicFunctionId)).data).toEqual({
        version: 2,
      });
    },
    LAMBDA_TEST_TIMEOUT_MS,
  );

  it(
    'reports the error thrown by the handler',
    async () => {
      const logicFunctionId = await createLogicFunction({
        sourceHandlerCode: THROWING_SOURCE,
      });

      const result = await runLogicFunction(logicFunctionId);

      expect(result.status).toBe(LogicFunctionExecutionStatus.ERROR);
      expect(result.data).toBeNull();
      expect(result.error).toMatchObject({
        errorType: 'Error',
        errorMessage: expect.stringContaining('Lambda handler failure'),
      });
    },
    LAMBDA_TEST_TIMEOUT_MS,
  );

  it(
    'stops waiting for a handler that runs past its timeout',
    async () => {
      const logicFunctionId = await createLogicFunction({
        sourceHandlerCode: SLOW_SOURCE,
        timeoutSeconds: 2,
      });

      const result = await runLogicFunction(logicFunctionId);

      expect(result.status).toBe(LogicFunctionExecutionStatus.ERROR);
      expect(result.error).toMatchObject({ errorType: 'TimeoutError' });
    },
    LAMBDA_TEST_TIMEOUT_MS,
  );

  it(
    'rebuilds its Lambda on the run after it was deleted outside of Twenty',
    async () => {
      const logicFunctionId = await createLogicFunction({
        sourceHandlerCode: buildVersionedSource(1),
      });

      await runLogicFunction(logicFunctionId);
      await runLogicFunction(logicFunctionId);
      await flociLambdaDriver.lambdaClient.deleteFunction({
        FunctionName: logicFunctionId,
      });

      const { errors } = await executeLogicFunction({
        input: { id: logicFunctionId, payload: {} },
        expectToFail: true,
      });

      expect(errors).toBeDefined();

      const result = await runLogicFunction(logicFunctionId);

      expect(result.status).toBe(LogicFunctionExecutionStatus.SUCCESS);
      expect(result.data).toEqual({ version: 1 });
    },
    LAMBDA_TEST_TIMEOUT_MS,
  );

  it(
    'moves every function of the application to a regenerated SDK client',
    async () => {
      const firstLogicFunctionId = await createLogicFunction({
        sourceHandlerCode: LAYER_PROBE_SOURCE,
      });
      const siblingLogicFunctionId = await createLogicFunction({
        sourceHandlerCode: LAYER_PROBE_SOURCE,
      });

      const previousSdkClientCoreChecksum =
        await getCurrentSdkClientCoreChecksum();

      expect(await runLayerProbe(firstLogicFunctionId)).toMatchObject({
        sdkClientCoreChecksum: previousSdkClientCoreChecksum,
      });
      expect(await runLayerProbe(siblingLogicFunctionId)).toMatchObject({
        sdkClientCoreChecksum: previousSdkClientCoreChecksum,
      });

      const { data } = await createOneObjectMetadata({
        input: {
          nameSingular: 'lambdaSdkRegenerationProbe',
          namePlural: 'lambdaSdkRegenerationProbes',
          labelSingular: 'Lambda SDK regeneration probe',
          labelPlural: 'Lambda SDK regeneration probes',
          icon: 'IconCode',
        },
        expectToFail: false,
      });
      const objectMetadataId: string = data.createOneObject.id;

      try {
        await regenerateSdkClient();

        const regeneratedSdkClientCoreChecksum =
          await getCurrentSdkClientCoreChecksum();

        expect(regeneratedSdkClientCoreChecksum).not.toBe(
          previousSdkClientCoreChecksum,
        );
        expect(await runLayerProbe(firstLogicFunctionId)).toMatchObject({
          sdkClientCoreChecksum: regeneratedSdkClientCoreChecksum,
        });
        expect(await runLayerProbe(siblingLogicFunctionId)).toMatchObject({
          sdkClientCoreChecksum: regeneratedSdkClientCoreChecksum,
        });
      } finally {
        await updateOneObjectMetadata({
          input: {
            idToUpdate: objectMetadataId,
            updatePayload: { isActive: false },
          },
          expectToFail: false,
        });
        await deleteOneObjectMetadata({
          input: { idToDelete: objectMetadataId },
        });
      }
    },
    LAMBDA_TEST_TIMEOUT_MS,
  );

  it(
    'installs a prebuilt bundle once and serves later runs from it',
    async () => {
      const { lambdaClient } = flociLambdaDriver;
      const logicFunctionId = await createLogicFunction();
      const logicFunctionRepository =
        getCoreRepository<LogicFunctionEntity>(LogicFunctionEntity);

      await logicFunctionRepository.update(
        { id: logicFunctionId },
        { executionMode: LogicFunctionExecutionMode.PREBUILT },
      );
      await getAppProviderByClassName<WorkspaceCacheService>(
        'WorkspaceCacheService',
      ).invalidateAndRecompute(SEED_APPLE_WORKSPACE_ID, [
        'flatLogicFunctionMaps',
      ]);

      const runPrebuilt = () =>
        getAppProviderByClassName<LogicFunctionExecutorService>(
          'LogicFunctionExecutorService',
        ).execute({
          logicFunctionId,
          workspaceId: SEED_APPLE_WORKSPACE_ID,
          payload: { a: 'prebuilt', b: 1 },
        });

      expect(await runPrebuilt()).toMatchObject({
        status: LogicFunctionExecutionStatus.SUCCESS,
        data: { message: 'Hello, input: prebuilt and 1' },
      });

      const { checksum } = await logicFunctionRepository.findOneByOrFail({
        id: logicFunctionId,
      });
      const installedLambda = await lambdaClient.getFunction({
        FunctionName: logicFunctionId,
      });

      expect(installedLambda.Tags?.[LAMBDA_PREBUILT_BUNDLE_CHECKSUM_TAG]).toBe(
        checksum,
      );

      expect(await runPrebuilt()).toMatchObject({
        status: LogicFunctionExecutionStatus.SUCCESS,
      });
      expect(
        (await lambdaClient.getFunction({ FunctionName: logicFunctionId }))
          .Configuration?.LastModified,
      ).toBe(installedLambda.Configuration?.LastModified);
    },
    LAMBDA_TEST_TIMEOUT_MS,
  );

  it(
    'deletes its Lambda when the logic function is deleted',
    async () => {
      const logicFunctionId = await createLogicFunction({
        sourceHandlerCode: buildVersionedSource(1),
      });

      await runLogicFunction(logicFunctionId);
      await deleteLogicFunction({
        input: { id: logicFunctionId },
        expectToFail: false,
      });
      createdLogicFunctionIds.splice(
        createdLogicFunctionIds.indexOf(logicFunctionId),
        1,
      );
      await waitForAllJobsToFinish();

      await expect(
        flociLambdaDriver.lambdaClient.getFunction({
          FunctionName: logicFunctionId,
        }),
      ).rejects.toThrow(ResourceNotFoundException);
    },
    LAMBDA_TEST_TIMEOUT_MS,
  );
});
