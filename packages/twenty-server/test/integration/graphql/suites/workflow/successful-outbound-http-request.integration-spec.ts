import * as http from 'node:http';
import { type AddressInfo } from 'node:net';

import { runWorkflowActionStep } from 'test/integration/graphql/suites/workflow/utils/run-workflow-action-step.util';
import { testHttpRequest } from 'test/integration/graphql/suites/workflow/utils/test-http-request.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { deleteConfigVariable } from 'test/integration/twenty-config/utils/delete-config-variable.util';
import { updateConfigVariable } from 'test/integration/twenty-config/utils/update-config-variable.util';
import {
  type EachTestingContext,
  eachTestingContextFilter,
} from 'twenty-shared/testing';
import { FeatureFlagKey } from 'twenty-shared/types';

import { LogicFunctionDriverType } from 'src/engine/core-modules/logic-function/logic-function-drivers/interfaces/logic-function-driver.interface';

type BodyEncodingTestContext = {
  contentType: string;
  body: object;
  expectedBody: string;
};

const bodyEncodingTestCases: EachTestingContext<BodyEncodingTestContext>[] = [
  {
    title: 'a JSON body',
    context: {
      contentType: 'application/json',
      body: { name: 'Acme', count: 3 },
      expectedBody: '{"name":"Acme","count":3}',
    },
  },
  {
    title: 'a form body',
    context: {
      contentType: 'application/x-www-form-urlencoded',
      body: { a: '1', b: 'two words' },
      expectedBody: 'a=1&b=two+words',
    },
  },
  {
    title: 'a text body',
    context: {
      contentType: 'text/plain',
      body: { a: '1', b: 'two' },
      expectedBody: 'a=1\nb=two',
    },
  },
];

type LogicFunctionDriverTestContext = {
  driverType: LogicFunctionDriverType;
};

const logicFunctionDriverTestCases: EachTestingContext<LogicFunctionDriverTestContext>[] =
  [
    {
      title: 'the local logic function driver',
      context: { driverType: LogicFunctionDriverType.LOCAL },
    },
    {
      title: 'logic functions disabled',
      context: { driverType: LogicFunctionDriverType.DISABLED },
    },
  ];

describe('Outbound HTTP requests should succeed', () => {
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
      let body = '';

      request.on('data', (chunk) => (body += chunk));
      request.on('end', () => {
        if (request.url === '/text') {
          response.end('hello');

          return;
        }

        if (request.url === '/echo') {
          response.writeHead(200, { 'Content-Type': 'application/json' }).end(
            JSON.stringify({
              method: request.method,
              contentType: request.headers['content-type'],
              body,
            }),
          );

          return;
        }

        response
          .writeHead(200, {
            'Content-Type': 'application/json',
            'Set-Cookie': ['a=1', 'b=2'],
          })
          .end(JSON.stringify({ ok: true }));
      });
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

  it('should return the response of a test request', async () => {
    const { data } = await testHttpRequest({
      input: { url: `${baseUrl}/items`, method: 'GET' },
    });

    expect(data.testHttpRequest).toMatchObject({
      success: true,
      result: { ok: true },
      status: 200,
      statusText: 'OK',
    });
    expect(data.testHttpRequest?.headers?.['set-cookie']).toBe('a=1, b=2');
  });

  it('should return a text response as a string', async () => {
    const { data } = await testHttpRequest({
      input: { url: `${baseUrl}/text`, method: 'GET' },
    });

    expect(data.testHttpRequest).toMatchObject({
      success: true,
      result: 'hello',
    });
  });

  describe.each(eachTestingContextFilter(bodyEncodingTestCases))(
    'with $title',
    ({ context }) => {
      it('should send the body in its content type', async () => {
        const { data } = await testHttpRequest({
          input: {
            url: `${baseUrl}/echo`,
            method: 'POST',
            headers: { 'Content-Type': context.contentType },
            body: context.body,
          },
        });

        expect(data.testHttpRequest?.result).toEqual({
          method: 'POST',
          contentType: context.contentType,
          body: context.expectedBody,
        });
      });
    },
  );

  it('should send a multipart body with a generated boundary', async () => {
    const { data } = await testHttpRequest({
      input: {
        url: `${baseUrl}/echo`,
        method: 'PUT',
        headers: { 'Content-Type': 'multipart/form-data' },
        body: { a: '1', b: 'two' },
      },
    });

    expect(data.testHttpRequest?.result).toMatchObject({
      method: 'PUT',
      contentType: expect.stringMatching(/^multipart\/form-data; boundary=/),
      body: expect.stringContaining('name="b"'),
    });
  });

  describe.each(eachTestingContextFilter(logicFunctionDriverTestCases))(
    'through $title',
    ({ context }) => {
      beforeAll(async () => {
        await updateConfigVariable({
          input: { key: 'LOGIC_FUNCTION_TYPE', value: context.driverType },
        });
        await updateFeatureFlag({
          featureFlag: FeatureFlagKey.IS_HTTP_EGRESS_LAMBDA_ENABLED,
          value: true,
          expectToFail: false,
        });
      });

      afterAll(async () => {
        await updateFeatureFlag({
          featureFlag: FeatureFlagKey.IS_HTTP_EGRESS_LAMBDA_ENABLED,
          value: false,
          expectToFail: false,
        });
        await deleteConfigVariable({ input: { key: 'LOGIC_FUNCTION_TYPE' } });
      });

      it('should return the response of a test request', async () => {
        const { data } = await testHttpRequest({
          input: { url: `${baseUrl}/items`, method: 'GET' },
        });

        expect(data.testHttpRequest).toMatchObject({
          success: true,
          result: { ok: true },
          status: 200,
        });
      });
    },
  );

  it('should run a workflow HTTP Request step', async () => {
    const { stepStatus } = await runWorkflowActionStep({
      name: 'Successful outbound HTTP request',
      stepType: 'HTTP_REQUEST',
      input: { url: `${baseUrl}/items`, method: 'GET' },
    });

    expect(stepStatus).toBe('SUCCESS');
  });
});
