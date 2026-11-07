import { randomUUID } from 'node:crypto';

import { executeToolThroughMcp } from 'test/integration/ai/utils/execute-tool-through-mcp.util';
import { listWebhookIdsThroughMcp } from 'test/integration/ai/utils/list-webhook-ids-through-mcp.util';
import { callMcpTool } from 'test/integration/graphql/suites/application-role-intersection/utils/call-mcp-tool.util';
import { getMcpToolCatalog } from 'test/integration/graphql/suites/application-role-intersection/utils/get-mcp-tool-catalog.util';
import { ToolCategory } from 'twenty-shared/ai';
import {
  type EachTestingContext,
  eachTestingContextFilter,
} from 'twenty-shared/testing';

type WebhookToolCallTestContext = {
  toolName: string;
  toolArguments: Record<string, unknown>;
};

const webhookToolCallTestCases: EachTestingContext<WebhookToolCallTestContext>[] =
  [
    {
      title: 'list_webhooks',
      context: { toolName: 'list_webhooks', toolArguments: {} },
    },
    {
      title: 'create_webhook',
      context: {
        toolName: 'create_webhook',
        toolArguments: {
          targetUrl: 'https://example.com/twenty-webhook',
          operations: [{ kind: 'record', object: 'person', event: 'created' }],
        },
      },
    },
    {
      title: 'update_webhook',
      context: {
        toolName: 'update_webhook',
        toolArguments: { id: randomUUID(), description: 'Updated' },
      },
    },
    {
      title: 'delete_webhook',
      context: {
        toolName: 'delete_webhook',
        toolArguments: { id: randomUUID() },
      },
    },
  ];

// The seeded member role lacks API_KEYS_AND_WEBHOOKS, which every webhook tool requires
describe('MCP webhook tools for a member without API_KEYS_AND_WEBHOOKS (integration)', () => {
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

  it('should not list the webhook tools', async () => {
    const catalog = await getMcpToolCatalog({
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
    });

    expect(Object.keys(catalog)).not.toContain(ToolCategory.WEBHOOK);
    expect(Object.keys(catalog).length).toBeGreaterThan(0);
  });

  it.each(eachTestingContextFilter(webhookToolCallTestCases))(
    'should refuse $title',
    async ({ context: { toolName, toolArguments } }) => {
      const result = await callMcpTool({
        toolName: 'execute_tool',
        toolArguments: { toolName, arguments: toolArguments },
        token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
      });

      expect(result.isError).toBe(true);
      expect(JSON.parse(result.content[0].text)).toMatchObject({
        success: false,
        message: `Tool "${toolName}" not found`,
      });
    },
  );

  it('should leave the webhooks unchanged', async () => {
    expect(await listWebhookIdsThroughMcp()).toEqual(webhookIdsBefore);
  });
});
