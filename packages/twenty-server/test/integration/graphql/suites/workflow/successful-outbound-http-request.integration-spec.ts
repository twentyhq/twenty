import * as http from 'node:http';
import { type AddressInfo } from 'node:net';

import { runWorkflowActionStep } from 'test/integration/graphql/suites/workflow/utils/run-workflow-action-step.util';
import { testHttpRequest } from 'test/integration/graphql/suites/workflow/utils/test-http-request.util';
import { updateConfigVariable } from 'test/integration/twenty-config/utils/update-config-variable.util';

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

    server = http.createServer((_request, response) => {
      response
        .writeHead(200, { 'Content-Type': 'application/json' })
        .end(JSON.stringify({ ok: true }));
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
    });
  });

  it('should run a workflow HTTP Request step', async () => {
    const { stepStatus } = await runWorkflowActionStep({
      name: 'Successful outbound HTTP request',
      stepType: 'HTTP_REQUEST',
      input: { url: `${baseUrl}/items`, method: 'GET' },
    });

    expect(stepStatus).toBe('SUCCESS');
  });
});
