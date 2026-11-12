import { testMcpToolStep } from 'test/integration/graphql/suites/workflow/utils/test-mcp-tool-step.util';
import {
  type FakeMcpServer,
  startFakeMcpServer,
} from 'test/integration/metadata/suites/utils/mcp-server-fake-server.util';
import {
  createMcpServer,
  deleteMcpServer,
  updateMcpServer,
} from 'test/integration/metadata/suites/utils/mcp-server-test.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { updateConfigVariable } from 'test/integration/twenty-config/utils/update-config-variable.util';
import { FeatureFlagKey } from 'twenty-shared/types';
import { v4 as uuidv4 } from 'uuid';

describe('testMcpToolStep (integration)', () => {
  let fakeMcpServer: FakeMcpServer;
  let mcpServerId: string;

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

  it('calls the tool with the null arguments dropped and returns its content', async () => {
    const { data, errors } = await testMcpToolStep({
      input: {
        mcpServerId,
        toolName: 'search_docs',
        toolArguments: { query: 'invoices', limit: null },
      },
    });

    expect(errors).toBeUndefined();
    expect(data.testMcpToolStep).toEqual({
      success: true,
      result: {
        content: [{ type: 'text', text: 'results for invoices' }],
      },
      error: null,
    });
  });

  it('returns the tool error instead of failing the mutation', async () => {
    const { data, errors } = await testMcpToolStep({
      input: { mcpServerId, toolName: 'search_docs', toolArguments: {} },
    });

    expect(errors).toBeUndefined();
    expect(data.testMcpToolStep).toMatchObject({
      success: false,
      error: expect.stringContaining('query'),
    });
  });

  it('rejects a tool the server does not offer', async () => {
    const { errors } = await testMcpToolStep({
      input: { mcpServerId, toolName: 'delete_page', toolArguments: {} },
      expectToFail: true,
    });

    expect(errors[0].message).toBe(
      'MCP server Fake docs no longer offers the tool delete_page',
    );
  });

  it('rejects an inactive server without calling it', async () => {
    await updateMcpServer({ id: mcpServerId, update: { isActive: false } });
    const callsBefore = fakeMcpServer.receivedAuthorizationHeaders.length;

    const { errors } = await testMcpToolStep({
      input: { mcpServerId, toolName: 'search_docs', toolArguments: {} },
      expectToFail: true,
    });

    expect(errors[0].message).toBe('MCP server Fake docs is inactive');
    expect(fakeMcpServer.receivedAuthorizationHeaders).toHaveLength(
      callsBefore,
    );

    await updateMcpServer({ id: mcpServerId, update: { isActive: true } });
  });
});
