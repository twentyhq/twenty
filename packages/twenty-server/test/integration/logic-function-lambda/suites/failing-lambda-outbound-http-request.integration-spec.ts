import { testHttpRequest } from 'test/integration/graphql/suites/workflow/utils/test-http-request.util';
import { type FlociLambdaDriver } from 'test/integration/logic-function-lambda/types/floci-lambda-driver.type';
import { switchToFlociLambdaDriver } from 'test/integration/logic-function-lambda/utils/switch-to-floci-lambda-driver.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { updateConfigVariable } from 'test/integration/twenty-config/utils/update-config-variable.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import {
  type EachTestingContext,
  eachTestingContextFilter,
} from 'twenty-shared/testing';
import { FeatureFlagKey } from 'twenty-shared/types';

import { type HttpTool } from 'src/engine/core-modules/tool/tools/http-tool/http-tool';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const LAMBDA_TEST_TIMEOUT_MS = 300_000;

type BlockedAddressTestContext = {
  url: string;
  blockedIp: string;
};

const blockedAddressTestCases: EachTestingContext<BlockedAddressTestContext>[] =
  [
    {
      title: 'the Lambda Runtime API on loopback',
      context: {
        url: 'http://127.0.0.1:9001/2018-06-01/runtime/invocation/next',
        blockedIp: '127.0.0.1',
      },
    },
    {
      title: 'a private network host',
      context: {
        url: 'http://10.0.0.1/internal',
        blockedIp: '10.0.0.1',
      },
    },
  ];

describe('Outbound HTTP requests on the Lambda driver should fail', () => {
  let flociLambdaDriver: FlociLambdaDriver;

  beforeAll(async () => {
    flociLambdaDriver = await switchToFlociLambdaDriver();

    await updateFeatureFlag({
      featureFlag: FeatureFlagKey.IS_HTTP_EGRESS_LAMBDA_ENABLED,
      value: true,
      expectToFail: false,
    });
    // Allowed for the server only: the Lambda must refuse them whatever the server allows.
    await updateConfigVariable({
      input: {
        key: 'OUTBOUND_HTTP_ALLOWED_INTERNAL_HOSTS',
        value: ['127.0.0.1', '10.0.0.1'],
      },
    });
  }, LAMBDA_TEST_TIMEOUT_MS);

  afterAll(async () => {
    await updateConfigVariable({
      input: { key: 'OUTBOUND_HTTP_ALLOWED_INTERNAL_HOSTS', value: [] },
    });
    await updateFeatureFlag({
      featureFlag: FeatureFlagKey.IS_HTTP_EGRESS_LAMBDA_ENABLED,
      value: false,
      expectToFail: false,
    });
    await flociLambdaDriver?.restore();
  }, LAMBDA_TEST_TIMEOUT_MS);

  describe.each(eachTestingContextFilter(blockedAddressTestCases))(
    'with $title',
    ({ context }) => {
      it(
        'should refuse the test request inside the Lambda',
        async () => {
          const { data } = await testHttpRequest({
            input: { url: context.url, method: 'GET' },
          });

          expect(data.testHttpRequest).toMatchObject({
            success: false,
            error: `Request to internal IP address ${context.blockedIp} is not allowed.`,
          });
        },
        LAMBDA_TEST_TIMEOUT_MS,
      );
    },
  );

  it(
    'should refuse a request too large for a Lambda invoke',
    async () => {
      // The test app keeps the default 100 KB JSON body limit, so the request goes to HttpTool directly.
      const output = await getAppProviderByClassName<HttpTool>(
        'HttpTool',
      ).execute(
        {
          url: 'https://twenty.com',
          method: 'POST',
          body: 'x'.repeat(6 * 1024 * 1024),
        },
        { workspaceId: SEED_APPLE_WORKSPACE_ID },
      );

      expect(output).toMatchObject({
        success: false,
        error: 'The request is too large to send',
      });
    },
    LAMBDA_TEST_TIMEOUT_MS,
  );
});
