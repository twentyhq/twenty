import { executeToolThroughMcp } from 'test/integration/ai/utils/execute-tool-through-mcp.util';

export const listWebhookIdsThroughMcp = async (): Promise<string[]> => {
  const output = await executeToolThroughMcp<{ webhooks: { id: string }[] }>({
    toolName: 'list_webhooks',
    toolArguments: {},
  });

  expect(output.success).toBe(true);

  return (output.result?.webhooks ?? []).map((webhook) => webhook.id);
};
