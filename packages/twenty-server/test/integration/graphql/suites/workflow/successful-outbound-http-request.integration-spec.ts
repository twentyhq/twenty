import { randomUUID } from 'node:crypto';
import * as http from 'node:http';
import { type AddressInfo } from 'node:net';

import { findOutboundHttpOutcomeLine } from 'test/integration/graphql/suites/workflow/utils/find-outbound-http-outcome-line.util';
import { runWorkflowActionStep } from 'test/integration/graphql/suites/workflow/utils/run-workflow-action-step.util';
import { spyOnAppLogger } from 'test/integration/graphql/suites/workflow/utils/spy-on-app-logger.util';
import { testHttpRequest } from 'test/integration/graphql/suites/workflow/utils/test-http-request.util';
import { updateConfigVariable } from 'test/integration/twenty-config/utils/update-config-variable.util';

import { USER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-users.util';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

describe('Outbound HTTP requests should succeed', () => {
  let server: http.Server;
  let baseUrl: string;
  let logSpy: jest.SpyInstance;
  let warnSpy: jest.SpyInstance;

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

  beforeEach(() => {
    ({ logSpy, warnSpy } = spyOnAppLogger());
  });

  afterEach(() => {
    logSpy.mockRestore();
    warnSpy.mockRestore();
  });

  it('should return the response of a test request and log its outcome with the user who sent it', async () => {
    const path = `/items/${randomUUID()}`;

    const { data } = await testHttpRequest({
      input: { url: `${baseUrl}${path}?api_key=secret`, method: 'GET' },
    });

    expect(data.testHttpRequest).toMatchObject({
      success: true,
      result: { ok: true },
      status: 200,
    });

    const outcomeLine = findOutboundHttpOutcomeLine({
      spy: logSpy,
      containing: path,
    });

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

  it('should log the outcome of a workflow HTTP Request step with its run and step', async () => {
    const path = `/items/${randomUUID()}`;
    let workflowRun: { workflowRunId: string; stepId: string } | undefined;

    const { stepStatus } = await runWorkflowActionStep({
      name: 'Successful outbound HTTP request',
      stepType: 'HTTP_REQUEST',
      input: { url: `${baseUrl}${path}`, method: 'GET' },
      whileRunning: async (run) => {
        workflowRun = run;
      },
    });

    expect(stepStatus).toBe('SUCCESS');

    const outcomeLine = findOutboundHttpOutcomeLine({
      spy: logSpy,
      containing: path,
    });

    expect(outcomeLine).toContain('outcome=success');
    expect(outcomeLine).toMatch(/source=workflow-http( |$)/);
    expect(outcomeLine).toContain(`workflowRun=${workflowRun?.workflowRunId}`);
    expect(outcomeLine).toContain(`workflowStep=${workflowRun?.stepId}`);
  });
});
