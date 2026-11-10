import * as http from 'node:http';
import { type AddressInfo } from 'node:net';

import { testHttpRequest } from 'test/integration/graphql/suites/workflow/utils/test-http-request.util';
import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { updateConfigVariable } from 'test/integration/twenty-config/utils/update-config-variable.util';
import {
  type EachTestingContext,
  eachTestingContextFilter,
} from 'twenty-shared/testing';

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

    server = http.createServer((_request, response) => {
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
