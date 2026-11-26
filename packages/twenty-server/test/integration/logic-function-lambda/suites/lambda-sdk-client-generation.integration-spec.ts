import { buildDefaultObjectManifest } from 'test/integration/metadata/suites/application/utils/build-default-object-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { type FlociLambdaDriver } from 'test/integration/logic-function-lambda/types/floci-lambda-driver.type';
import { switchToFlociLambdaDriver } from 'test/integration/logic-function-lambda/utils/switch-to-floci-lambda-driver.util';
import { buildCommentClosingDescription } from 'test/integration/sdk-client/utils/build-comment-closing-description.util';
import { buildUniqueMetadataName } from 'test/integration/sdk-client/utils/build-unique-metadata-name.util';
import { createSdkClientCanaryFile } from 'test/integration/sdk-client/utils/create-sdk-client-canary-file.util';
import { loadSdkClientCoreModule } from 'test/integration/sdk-client/utils/load-sdk-client-core-module.util';
import { syncSdkClientProbeApplication } from 'test/integration/sdk-client/utils/sync-sdk-client-probe-application.util';
import { v4 as uuidv4 } from 'uuid';

import { SDK_CLIENT_GENERATOR_FUNCTION_NAME_PREFIX } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/constants/sdk-client-generation-lambda.constant';

const LAMBDA_TEST_TIMEOUT_MS = 300_000;

describe('SDK client generation on the Lambda driver', () => {
  let flociLambdaDriver: FlociLambdaDriver;

  beforeAll(async () => {
    flociLambdaDriver = await switchToFlociLambdaDriver();
  }, LAMBDA_TEST_TIMEOUT_MS);

  afterAll(async () => {
    await flociLambdaDriver?.restore();
  }, LAMBDA_TEST_TIMEOUT_MS);

  it(
    'builds the client in the generator Lambda and serves a module that loads',
    async () => {
      const canary = await createSdkClientCanaryFile();
      const applicationUniversalIdentifier = uuidv4();
      const nameSingular = buildUniqueMetadataName('sdkProbeLambda');

      try {
        const { applyErrors, coreModuleResponse } =
          await syncSdkClientProbeApplication({
            applicationUniversalIdentifier,
            objects: [
              buildDefaultObjectManifest({
                applicationUniversalIdentifier,
                nameSingular,
                namePlural: `${nameSingular}s`,
                labelSingular: nameSingular,
                labelPlural: `${nameSingular}s`,
                description: buildCommentClosingDescription({
                  canaryPath: canary.canaryPath,
                  position: 'type',
                }),
              }),
            ],
          });

        expect(applyErrors).toBeUndefined();
        expect(coreModuleResponse.status).toBe(200);
        expect(coreModuleResponse.text).not.toContain(canary.marker);

        const coreModule = await loadSdkClientCoreModule(
          coreModuleResponse.text,
        );

        expect(typeof coreModule.CoreApiClient).toBe('function');

        const { Functions: functions = [] } =
          await flociLambdaDriver.lambdaClient.listFunctions({});

        expect(
          functions.some((lambdaFunction) =>
            lambdaFunction.FunctionName?.startsWith(
              `${SDK_CLIENT_GENERATOR_FUNCTION_NAME_PREFIX}-`,
            ),
          ),
        ).toBe(true);
      } finally {
        await cleanupApplicationAndAppRegistration({
          applicationUniversalIdentifier,
        });
        await canary.removeCanaryFile();
      }
    },
    LAMBDA_TEST_TIMEOUT_MS,
  );
});
