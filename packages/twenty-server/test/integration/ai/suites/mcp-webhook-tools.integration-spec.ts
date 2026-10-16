import { executeToolThroughMcp } from 'test/integration/ai/utils/execute-tool-through-mcp.util';
import { listWebhookIdsThroughMcp } from 'test/integration/ai/utils/list-webhook-ids-through-mcp.util';
import { callMcpTool } from 'test/integration/graphql/suites/application-role-intersection/utils/call-mcp-tool.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';

const TARGET_URL = 'https://example.com/twenty-webhook';

describe('MCP webhook tools (integration)', () => {
  let webhookIdsBefore: string[];

  beforeAll(async () => {
    webhookIdsBefore = await listWebhookIdsThroughMcp();
  });

  afterAll(async () => {
    const leakedWebhookIds = (await listWebhookIdsThroughMcp()).filter(
      (id) => !webhookIdsBefore.includes(id),
    );

    for (const id of leakedWebhookIds) {
      await executeToolThroughMcp({
        toolName: 'delete_webhook',
        toolArguments: { id },
      });
    }
  });

  it('should describe delete_webhook to the model', async () => {
    const result = await callMcpTool({
      toolName: 'learn_tools',
      toolArguments: { toolNames: ['delete_webhook'] },
      token: API_KEY_ACCESS_TOKEN,
    });

    expect(result.isError).toBe(false);

    const payload = JSON.parse(result.content[0].text);

    expect(payload.notFound).toEqual([]);
    expect(payload.tools).toMatchSnapshot();
  });

  it('should delete a webhook created through create_webhook', async () => {
    const created = await executeToolThroughMcp<{ id: string }>({
      toolName: 'create_webhook',
      toolArguments: {
        targetUrl: TARGET_URL,
        operations: [{ kind: 'record', object: 'person', event: 'created' }],
      },
    });

    expect(created.success).toBe(true);

    const webhookId = created.result?.id;

    jestExpectToBeDefined(webhookId);
    expect(await listWebhookIdsThroughMcp()).toContain(webhookId);

    const deleted = await executeToolThroughMcp({
      toolName: 'delete_webhook',
      toolArguments: { id: webhookId },
    });

    expect(deleted).toEqual({
      success: true,
      message: `Webhook ${webhookId} deleted`,
      result: { deletedWebhookId: webhookId, targetUrl: TARGET_URL },
    });
    expect(await listWebhookIdsThroughMcp()).not.toContain(webhookId);
  });

  it('should refuse delete_webhook with an id that is not a UUID', async () => {
    const output = await executeToolThroughMcp({
      toolName: 'delete_webhook',
      toolArguments: { id: 'not-a-uuid' },
    });

    expect(output).toMatchSnapshot();
  });
});
