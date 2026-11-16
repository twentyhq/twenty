import * as http from 'node:http';
import { type AddressInfo } from 'node:net';

import IORedis from 'ioredis';
import { testHttpRequest } from 'test/integration/graphql/suites/workflow/utils/test-http-request.util';
import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { createOneLogicFunction } from 'test/integration/metadata/suites/logic-function/utils/create-logic-function.util';
import { deleteLogicFunction } from 'test/integration/metadata/suites/logic-function/utils/delete-logic-function.util';
import { executeLogicFunction } from 'test/integration/metadata/suites/logic-function/utils/execute-logic-function.util';
import { deleteConfigVariable } from 'test/integration/twenty-config/utils/delete-config-variable.util';
import { updateConfigVariable } from 'test/integration/twenty-config/utils/update-config-variable.util';
import {
  type EachTestingContext,
  eachTestingContextFilter,
} from 'twenty-shared/testing';
import { isDefined } from 'twenty-shared/utils';

import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { TOKEN_BUCKET_THROTTLE_KEY_PREFIX } from 'src/engine/core-modules/throttler/constants/token-bucket-throttle-key-prefix.constant';
import { HTTP_TOOL_MAX_PAYLOAD_SIZE_BYTES } from 'src/engine/core-modules/tool/tools/http-tool/constants/http-tool-max-payload-size-bytes.constant';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const LOGIC_FUNCTION_EXECUTION_BUCKET_CACHE_KEY = `${CacheStorageNamespace.IntegrationTests}:${CacheStorageNamespace.EngineWorkspace}:${TOKEN_BUCKET_THROTTLE_KEY_PREFIX}:${SEED_APPLE_WORKSPACE_ID}-logic-function-execution`;

const clearLogicFunctionExecutionBucket = async (): Promise<void> => {
  const redis = new IORedis(process.env.REDIS_URL ?? 'redis://localhost:6379');

  try {
    await redis.del(LOGIC_FUNCTION_EXECUTION_BUCKET_CACHE_KEY);
  } finally {
    redis.disconnect();
  }
};

type CallerTestContext = {
  token: () => string;
};

const unauthorizedCallerTestCases: EachTestingContext<CallerTestContext>[] = [
  {
    // The seeded Member role lacks the WORKFLOWS permission flag
    title: 'with a member session without the WORKFLOWS permission',
    context: { token: () => APPLE_JONY_MEMBER_ACCESS_TOKEN },
  },
  {
    title: 'with an API key',
    context: { token: () => API_KEY_ACCESS_TOKEN },
  },
];

type InvalidInputTestContext = {
  input: { url: string; method: string };
};

const invalidInputTestCases: EachTestingContext<InvalidInputTestContext>[] = [
  {
    title: 'a non-HTTP URL',
    context: { input: { url: 'file:///etc/passwd', method: 'GET' } },
  },
  {
    title: 'an unsupported method',
    context: {
      input: { url: 'https://api.example.com/items', method: 'TRACE' },
    },
  },
];

describe('Outbound HTTP requests should fail', () => {
  let server: http.Server;
  let baseUrl: string;

  beforeAll(async () => {
    await updateConfigVariable({
      input: {
        key: 'OUTBOUND_HTTP_ALLOWED_INTERNAL_HOSTS',
        value: ['127.0.0.1'],
      },
    });

    server = http.createServer((request, response) => {
      if (request.url === '/not-found') {
        response
          .writeHead(404, { 'Content-Type': 'application/json' })
          .end(JSON.stringify({ error: 'nope' }));

        return;
      }

      if (request.url === '/large') {
        response.end('x'.repeat(HTTP_TOOL_MAX_PAYLOAD_SIZE_BYTES + 1));

        return;
      }

      response
        .writeHead(302, {
          Location: 'http://169.254.169.254/latest/meta-data/',
        })
        .end();
    });

    await new Promise<void>((resolve) =>
      server.listen(0, '127.0.0.1', resolve),
    );
    baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  });

  afterAll(async () => {
    server.closeAllConnections();
    await new Promise((resolve) => server.close(resolve));
    await updateConfigVariable({
      input: { key: 'OUTBOUND_HTTP_ALLOWED_INTERNAL_HOSTS', value: [] },
    });
  });

  describe.each(eachTestingContextFilter(unauthorizedCallerTestCases))(
    '$title',
    ({ context }) => {
      it('should refuse to test an HTTP request', async () => {
        const { errors } = await testHttpRequest({
          input: { url: 'https://api.example.com/items', method: 'GET' },
          token: context.token(),
          expectToFail: true,
        });

        expectOneNotInternalServerErrorSnapshot({ errors });
      });
    },
  );

  it('should refuse a test request to the cloud metadata address', async () => {
    const { data } = await testHttpRequest({
      input: { url: 'http://169.254.169.254/latest/meta-data/', method: 'GET' },
    });

    expect(data.testHttpRequest).toMatchObject({
      success: false,
      error: 'Request to internal IP address 169.254.169.254 is not allowed.',
    });
  });

  it('should refuse a test request redirected to the cloud metadata address', async () => {
    const { data } = await testHttpRequest({
      input: { url: `${baseUrl}/redirect`, method: 'GET' },
    });

    expect(data.testHttpRequest).toMatchObject({
      success: false,
      error:
        'Redirected request failed: Request to internal IP address 169.254.169.254 is not allowed.',
    });
  });

  it('should report a non-2xx response as a failure with its body', async () => {
    const { data } = await testHttpRequest({
      input: { url: `${baseUrl}/not-found`, method: 'GET' },
    });

    expect(data.testHttpRequest).toMatchObject({
      success: false,
      status: 404,
      error: { error: 'nope' },
    });
  });

  it('should refuse a response larger than the payload limit', async () => {
    const { data } = await testHttpRequest({
      input: { url: `${baseUrl}/large`, method: 'GET' },
    });

    expect(data.testHttpRequest).toMatchObject({
      success: false,
      error: expect.stringContaining('maxContentLength'),
    });
  });

  describe('once a logic function run has spent the workspace token', () => {
    let logicFunctionId: string | undefined;

    beforeAll(async () => {
      await clearLogicFunctionExecutionBucket();
      await updateConfigVariable({
        input: { key: 'LOGIC_FUNCTION_EXEC_THROTTLE_LIMIT', value: 1 },
      });
    });

    afterAll(async () => {
      await deleteConfigVariable({
        input: { key: 'LOGIC_FUNCTION_EXEC_THROTTLE_LIMIT' },
      });
      await clearLogicFunctionExecutionBucket();

      if (isDefined(logicFunctionId)) {
        await deleteLogicFunction({
          input: { id: logicFunctionId },
          expectToFail: false,
        });
      }
    });

    it('should refuse the test request', async () => {
      const { data: createData } = await createOneLogicFunction({
        input: { name: 'Spends the logic function execution token' },
        expectToFail: false,
      });

      logicFunctionId = createData.createOneLogicFunction.id;

      await executeLogicFunction({
        input: { id: createData.createOneLogicFunction.id, payload: {} },
        expectToFail: false,
      });

      const { data } = await testHttpRequest({
        input: { url: `${baseUrl}/not-found`, method: 'GET' },
      });

      expect(data.testHttpRequest).toMatchObject({
        success: false,
        error:
          'Too many HTTP requests and logic function runs for this workspace. Try again shortly.',
      });
    });
  });

  describe.each(eachTestingContextFilter(invalidInputTestCases))(
    'with $title',
    ({ context }) => {
      it('should reject the test request', async () => {
        const { data } = await testHttpRequest({ input: context.input });

        expect(data.testHttpRequest).toMatchObject({
          success: false,
          message: 'Invalid arguments for http_request',
        });
      });
    },
  );
});
