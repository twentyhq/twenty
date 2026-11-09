import * as http from 'http';
import { type AddressInfo } from 'net';

import request from 'supertest';
import { runWorkflowActionStep } from 'test/integration/graphql/suites/workflow/utils/run-workflow-action-step.util';
import { updateConfigVariable } from 'test/integration/twenty-config/utils/update-config-variable.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { type SecureHttpClientService } from 'src/engine/core-modules/secure-http-client/secure-http-client.service';
import { USER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-users.util';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

const client = request(`http://localhost:${APP_PORT}`);

const OUTCOME_LINE_PREFIX = 'Outbound HTTP outcome:';

const testHttpRequest = async (input: Record<string, unknown>) => {
  const response = await client
    .post('/graphql')
    .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
    .send({
      query: `
        mutation TestHttpRequest($input: TestHttpRequestInput!) {
          testHttpRequest(input: $input) {
            success
            message
            result
            error
            status
          }
        }
      `,
      variables: { input },
    });

  expect(response.body.errors).toBeUndefined();

  return response.body.data.testHttpRequest;
};

describe('Outbound HTTP requests (e2e)', () => {
  let server: http.Server;
  let baseUrl: string;
  let logSpy: jest.SpyInstance;
  let warnSpy: jest.SpyInstance;

  // The app's Logger lives in the global setup's module registry, not this file's.
  const getAppLoggerPrototype = () =>
    Object.getPrototypeOf(
      (
        getAppProviderByClassName<SecureHttpClientService>(
          'SecureHttpClientService',
        ) as unknown as { logger: object }
      ).logger,
    );

  const findOutcomeLines = (spy: jest.SpyInstance): string[] =>
    spy.mock.calls
      .map(([message]) => String(message))
      .filter((message) => message.startsWith(OUTCOME_LINE_PREFIX));

  beforeAll(async () => {
    await updateConfigVariable({
      input: {
        key: 'OUTBOUND_HTTP_ALLOWED_INTERNAL_HOSTS',
        value: ['127.0.0.1'],
      },
    });

    server = http.createServer((incomingRequest, response) => {
      if (incomingRequest.url === '/redirect-to-metadata') {
        response
          .writeHead(302, {
            Location: 'http://169.254.169.254/latest/meta-data/',
          })
          .end();

        return;
      }

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

  beforeEach(() => {
    const appLoggerPrototype = getAppLoggerPrototype();

    logSpy = jest.spyOn(appLoggerPrototype, 'log');
    warnSpy = jest.spyOn(appLoggerPrototype, 'warn');
  });

  afterEach(() => {
    logSpy.mockRestore();
    warnSpy.mockRestore();
  });

  describe('testHttpRequest', () => {
    it('returns the response and logs its outcome with the user who sent it', async () => {
      const output = await testHttpRequest({
        url: `${baseUrl}/items?api_key=secret`,
        method: 'GET',
      });

      expect(output).toMatchObject({
        success: true,
        result: { ok: true },
        status: 200,
      });

      const [outcomeLine] = findOutcomeLines(logSpy);

      expect(outcomeLine).toContain('outcome=success');
      expect(outcomeLine).toContain('status=200');
      expect(outcomeLine).toContain('source=workflow-http-test');
      expect(outcomeLine).toContain(`user=${USER_DATA_SEED_IDS.JANE}`);
      expect(outcomeLine).toContain(
        `workspaceMember=${WORKSPACE_MEMBER_DATA_SEED_IDS.JANE}`,
      );
      expect(outcomeLine).toContain('api_key=REDACTED');
      expect(outcomeLine).not.toContain('secret');
    });

    it('refuses the cloud metadata address and logs the block', async () => {
      const output = await testHttpRequest({
        url: 'http://169.254.169.254/latest/meta-data/',
        method: 'GET',
      });

      expect(output.success).toBe(false);
      expect(output.error).toContain(
        'Request to internal IP address 169.254.169.254 is not allowed.',
      );

      const [outcomeLine] = findOutcomeLines(warnSpy);

      expect(outcomeLine).toContain('outcome=blocked');
      expect(outcomeLine).toContain('host=169.254.169.254');
      expect(outcomeLine).toContain(`user=${USER_DATA_SEED_IDS.JANE}`);
    });

    it('refuses a redirect to the cloud metadata address', async () => {
      const output = await testHttpRequest({
        url: `${baseUrl}/redirect-to-metadata`,
        method: 'GET',
      });

      expect(output.success).toBe(false);

      const [outcomeLine] = findOutcomeLines(warnSpy);

      expect(outcomeLine).toContain('outcome=blocked');
      expect(outcomeLine).toContain('169.254.169.254');
    });

    it.each([
      ['a non-HTTP URL', { url: 'file:///etc/passwd', method: 'GET' }],
      [
        'an unsupported method',
        { url: 'https://api.example.com/items', method: 'TRACE' },
      ],
    ])('rejects %s without sending anything', async (_label, input) => {
      const output = await testHttpRequest(input);

      expect(output).toMatchObject({
        success: false,
        message: 'Invalid arguments for http_request',
      });
      expect(findOutcomeLines(logSpy)).toEqual([]);
      expect(findOutcomeLines(warnSpy)).toEqual([]);
    });
  });

  describe('workflow HTTP Request step', () => {
    it('logs the outcome with the workflow run and step', async () => {
      let workflowRun: { workflowRunId: string; stepId: string } | undefined;

      const { stepStatus } = await runWorkflowActionStep({
        name: 'Outbound HTTP request logging',
        stepType: 'HTTP_REQUEST',
        input: { url: `${baseUrl}/items`, method: 'GET' },
        whileRunning: async (run) => {
          workflowRun = run;
        },
      });

      expect(stepStatus).toBe('SUCCESS');

      const outcomeLine = findOutcomeLines(logSpy).find((line) =>
        line.includes(`workflowRun=${workflowRun?.workflowRunId}`),
      );

      expect(outcomeLine).toContain('outcome=success');
      expect(outcomeLine).toMatch(/source=workflow-http( |$)/);
      expect(outcomeLine).toContain(`workflowStep=${workflowRun?.stepId}`);
    });
  });
});
