import { runWorkflowActionStep } from 'test/integration/graphql/suites/workflow/utils/run-workflow-action-step.util';
import {
  type FakeMcpServer,
  startFakeMcpServer,
} from 'test/integration/metadata/suites/utils/mcp-server-fake-server.util';
import {
  createMcpServer,
  deleteMcpServer,
  getMcpServer,
} from 'test/integration/metadata/suites/utils/mcp-server-test.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { updateConfigVariable } from 'test/integration/twenty-config/utils/update-config-variable.util';
import { FeatureFlagKey } from 'twenty-shared/types';
import { v4 as uuidv4 } from 'uuid';

describe('MCP_TOOL workflow action (integration)', () => {
  let fakeMcpServer: FakeMcpServer;
  let mcpServerId: string;

  const runSearchDocsStep = () =>
    runWorkflowActionStep({
      name: 'MCP tool workflow',
      stepType: 'MCP_TOOL',
      defaultSettings: { input: { mcpServerId, toolName: 'search_docs' } },
      input: { toolInput: { query: '{{trigger.query}}', limit: null } },
      payload: { query: 'invoices' },
    });

  beforeAll(async () => {
    await updateFeatureFlag({
      featureFlag: FeatureFlagKey.IS_MCP_SERVERS_ENABLED,
      value: true,
      expectToFail: false,
    });
    await updateConfigVariable({
      input: {
        key: 'OUTBOUND_HTTP_ALLOWED_INTERNAL_HOSTS',
        value: ['127.0.0.1'],
      },
    });
    fakeMcpServer = await startFakeMcpServer();

    const response = await createMcpServer({
      name: `fake_${uuidv4().slice(0, 8)}`,
      label: 'Fake docs',
      url: fakeMcpServer.url,
    });

    expect(response.body.errors).toBeUndefined();
    mcpServerId = response.body.data.createMcpServer.id;
  });

  afterAll(async () => {
    await deleteMcpServer(mcpServerId);
    await fakeMcpServer.close();
    await updateConfigVariable({
      input: { key: 'OUTBOUND_HTTP_ALLOWED_INTERNAL_HOSTS', value: [] },
    });
  });

  it('calls the tool with the filled-in arguments and returns its content', async () => {
    expect(await runSearchDocsStep()).toMatchObject({
      status: 'COMPLETED',
      stepStatus: 'SUCCESS',
      stepResult: {
        content: [{ type: 'text', text: 'results for invoices' }],
      },
    });
  });

  it('fails the step and refreshes the cached tools once the server stops offering the tool', async () => {
    fakeMcpServer.stopOfferingSearchDocs();

    expect(await runSearchDocsStep()).toMatchObject({
      status: 'FAILED',
      stepStatus: 'FAILED',
      stepError: expect.stringContaining('search_docs not found'),
    });

    const { body } = await getMcpServer(mcpServerId);

    expect(body.data.mcpServer.tools).not.toContainEqual(
      expect.objectContaining({ name: 'search_docs' }),
    );
  });
});
