import { randomUUID } from 'node:crypto';

import request from 'supertest';

const baseUrl = `http://localhost:${APP_PORT}`;

type McpToolCallResult = {
  content?: Array<{ type: string; text: string }>;
  isError?: boolean;
};

const callMcpTool = async (
  name: string,
  args: Record<string, unknown>,
): Promise<McpToolCallResult> => {
  const res = await request(baseUrl)
    .post('/mcp')
    .set('Authorization', `Bearer ${API_KEY_ACCESS_TOKEN}`)
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json')
    .send(
      JSON.stringify({
        jsonrpc: '2.0',
        method: 'tools/call',
        id: `call-${randomUUID()}`,
        params: { name, arguments: args },
      }),
    )
    .expect(200);

  expect(res.body.error).toBeUndefined();

  return res.body.result as McpToolCallResult;
};

const buildCreateRecordStep = (objectRecord: Record<string, unknown>) => ({
  id: randomUUID(),
  name: 'Create Record',
  type: 'CREATE_RECORD',
  valid: true,
  nextStepIds: [],
  position: { x: 0, y: 100 },
  settings: {
    input: { objectName: 'note', objectRecord },
    outputSchema: {},
    errorHandlingOptions: {
      retryOnFailure: { value: false },
      continueOnFailure: { value: false },
    },
  },
});

const createCompleteWorkflow = (
  step: ReturnType<typeof buildCreateRecordStep>,
) =>
  callMcpTool('execute_tool', {
    toolName: 'create_complete_workflow',
    arguments: {
      name: `AI malformed test ${randomUUID().slice(0, 8)}`,
      trigger: {
        name: 'Manual Trigger',
        type: 'MANUAL',
        settings: { outputSchema: {} },
        position: { x: 0, y: 0 },
        nextStepIds: [step.id],
      },
      steps: [step],
      edges: [{ source: 'trigger', target: step.id }],
    },
  });

type ToolPayload = {
  success: boolean;
  error?: string;
  result?: { coreWorkflowId?: string };
};

const parsePayload = (result: McpToolCallResult): ToolPayload =>
  JSON.parse(result.content?.[0]?.text ?? '{}') as ToolPayload;

describe('Workflow AI tool validation (e2e)', () => {
  const createdCoreWorkflowIds: string[] = [];

  afterAll(async () => {
    for (const coreWorkflowId of createdCoreWorkflowIds) {
      await callMcpTool('execute_tool', {
        toolName: 'delete_workflow',
        arguments: { coreWorkflowId },
      });
    }
  });

  it('reports a failure (does not crash) when create_complete_workflow carries a bare-string rich text', async () => {
    const result = await createCompleteWorkflow(
      buildCreateRecordStep({ bodyV2: 'a plain string' }),
    );

    expect(result.isError).toBe(true);

    const payload = parsePayload(result);

    expect(payload.success).toBe(false);
    expect(payload.error).toMatch(/rich text/i);
  });

  it('creates the workflow when the rich text is a valid object', async () => {
    const result = await createCompleteWorkflow(
      buildCreateRecordStep({ bodyV2: { markdown: 'hello', blocknote: null } }),
    );

    const payload = parsePayload(result);

    expect(payload.success).toBe(true);
    expect(payload.result?.coreWorkflowId).toBeDefined();

    if (payload.result?.coreWorkflowId) {
      createdCoreWorkflowIds.push(payload.result.coreWorkflowId);
    }
  });

  it('creates the workflow when a record step is incomplete (fields not filled in)', async () => {
    const result = await createCompleteWorkflow(buildCreateRecordStep({}));

    const payload = parsePayload(result);

    expect(payload.success).toBe(true);
    expect(payload.result?.coreWorkflowId).toBeDefined();

    if (payload.result?.coreWorkflowId) {
      createdCoreWorkflowIds.push(payload.result.coreWorkflowId);
    }
  });
});
