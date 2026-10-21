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

  it('should describe the webhook tools to the model', async () => {
    const result = await callMcpTool({
      toolName: 'learn_tools',
      toolArguments: {
        toolNames: [
          'list_webhooks',
          'create_webhook',
          'update_webhook',
          'delete_webhook',
        ],
      },
      token: API_KEY_ACCESS_TOKEN,
    });

    expect(result.isError).toBe(false);

    const payload = JSON.parse(result.content[0].text);

    expect(payload.notFound).toEqual([]);
    expect(payload.tools).toMatchSnapshot();
  });

  it('should create, update and delete a webhook', async () => {
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
    expect(created.result).toEqual({
      id: webhookId,
      targetUrl: TARGET_URL,
      operations: ['person.created'],
      description: null,
    });
    expect(await listWebhookIdsThroughMcp()).toContain(webhookId);

    const updated = await executeToolThroughMcp({
      toolName: 'update_webhook',
      toolArguments: {
        id: webhookId,
        description: 'Notify the sales channel',
        operations: [{ kind: 'metadata', metadataName: '*', operation: '*' }],
      },
    });

    expect(updated).toEqual({
      success: true,
      message: `Webhook ${webhookId} updated`,
      result: {
        id: webhookId,
        targetUrl: TARGET_URL,
        operations: ['metadata.*.*'],
        description: 'Notify the sales channel',
      },
    });

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
