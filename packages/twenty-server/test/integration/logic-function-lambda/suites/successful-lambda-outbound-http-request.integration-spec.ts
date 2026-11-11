import { testHttpRequest } from 'test/integration/graphql/suites/workflow/utils/test-http-request.util';
import { type FlociLambdaDriver } from 'test/integration/logic-function-lambda/types/floci-lambda-driver.type';
import { switchToFlociLambdaDriver } from 'test/integration/logic-function-lambda/utils/switch-to-floci-lambda-driver.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { FeatureFlagKey } from 'twenty-shared/types';

import { HTTP_EGRESS_FUNCTION_NAME_PREFIX } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/constants/lambda-driver.constant';

const LAMBDA_TEST_TIMEOUT_MS = 300_000;

describe('Outbound HTTP requests on the Lambda driver should succeed', () => {
  let flociLambdaDriver: FlociLambdaDriver;

  beforeAll(async () => {
    flociLambdaDriver = await switchToFlociLambdaDriver();

    await updateFeatureFlag({
      featureFlag: FeatureFlagKey.IS_HTTP_EGRESS_LAMBDA_ENABLED,
      value: true,
      expectToFail: false,
    });
  }, LAMBDA_TEST_TIMEOUT_MS);

  afterAll(async () => {
    await updateFeatureFlag({
      featureFlag: FeatureFlagKey.IS_HTTP_EGRESS_LAMBDA_ENABLED,
      value: false,
      expectToFail: false,
    });
    await flociLambdaDriver?.restore();
  }, LAMBDA_TEST_TIMEOUT_MS);

  it(
    'should send a test request from the egress Lambda',
    async () => {
      const { data } = await testHttpRequest({
        input: { url: 'https://twenty.com', method: 'GET' },
      });

      expect(data.testHttpRequest).toMatchObject({
        success: true,
        status: 200,
      });

      const { Functions = [] } =
        await flociLambdaDriver.lambdaClient.listFunctions({});

      expect(
        Functions.some(({ FunctionName }) =>
          FunctionName?.startsWith(HTTP_EGRESS_FUNCTION_NAME_PREFIX),
        ),
      ).toBe(true);
    },
    LAMBDA_TEST_TIMEOUT_MS,
  );
});
