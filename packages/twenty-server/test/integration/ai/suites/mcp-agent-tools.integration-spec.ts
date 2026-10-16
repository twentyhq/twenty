import { randomUUID } from 'node:crypto';

import request from 'supertest';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';

type AgentSummary = {
  id: string;
  label: string;
  prompt: string;
  triggers: {
    id: string;
    type: string;
    isActive: boolean;
    instructions: string | null;
    settings: Record<string, unknown>;
  }[];
};

type ToolPayload<TResult> = {
  success: boolean;
  message: string;
  result?: TResult;
  error?: string;
};

const baseUrl = `http://localhost:${APP_PORT}`;

const executeTool = async <TResult>(
  toolName: string,
  args: Record<string, unknown>,
): Promise<ToolPayload<TResult>> => {
  const response = await request(baseUrl)
    .post('/mcp')
    .set('Authorization', `Bearer ${API_KEY_ACCESS_TOKEN}`)
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json')
    .send(
      JSON.stringify({
        jsonrpc: '2.0',
        method: 'tools/call',
        id: `call-${randomUUID()}`,
        params: {
          name: 'execute_tool',
          arguments: { toolName, arguments: args },
        },
      }),
    )
    .expect(200);

  const text = response.body.result?.content?.[0]?.text;

  jestExpectToBeDefined(text);

  return JSON.parse(text) as ToolPayload<TResult>;
};

const listAgentIds = async (): Promise<string[]> => {
  const payload = await executeTool<{ agents: AgentSummary[] }>(
    'list_agents',
    {},
  );

  expect(payload.success).toBe(true);

  return (payload.result?.agents ?? []).map((agent) => agent.id);
};

describe('MCP agent tools (integration)', () => {
  const createdAgentIds: string[] = [];

  afterAll(async () => {
    for (const id of createdAgentIds) {
      await executeTool('delete_agent', { id });
    }
  });

  it('creates an agent with triggers, updates it and deletes it', async () => {
    const created = await executeTool<AgentSummary>('create_agent', {
      label: `Deal watcher ${randomUUID().slice(0, 8)}`,
      prompt: 'Keep an eye on new deals and write a short note about them.',
      triggers: [
        {
          type: 'DATABASE_EVENT',
          instructions: 'Write a note about the new opportunity.',
          settings: { eventName: 'opportunity.created' },
        },
        { type: 'CRON', settings: { pattern: '0 9 * * 1' } },
      ],
    });

    expect(created.success).toBe(true);
    jestExpectToBeDefined(created.result);

    const agent = created.result;

    createdAgentIds.push(agent.id);

    expect(agent.triggers).toHaveLength(2);
    expect(agent.triggers[0]).toMatchObject({
      type: 'DATABASE_EVENT',
      isActive: true,
      instructions: 'Write a note about the new opportunity.',
      settings: { eventName: 'opportunity.created' },
    });
    expect(await listAgentIds()).toContain(agent.id);

    const [databaseEventTrigger] = agent.triggers;

    const updated = await executeTool<AgentSummary>('update_agent', {
      id: agent.id,
      prompt: 'Summarize new deals.',
      triggers: [{ ...databaseEventTrigger, isActive: false }],
    });

    expect(updated.success).toBe(true);
    expect(updated.result?.prompt).toBe('Summarize new deals.');
    expect(updated.result?.triggers).toEqual([
      { ...databaseEventTrigger, isActive: false },
    ]);

    const deleted = await executeTool('delete_agent', { id: agent.id });

    expect(deleted.success).toBe(true);
    createdAgentIds.splice(createdAgentIds.indexOf(agent.id), 1);
    expect(await listAgentIds()).not.toContain(agent.id);
  });

  it('reports invalid triggers instead of creating the agent', async () => {
    const created = await executeTool<AgentSummary>('create_agent', {
      label: `Broken schedule ${randomUUID().slice(0, 8)}`,
      prompt: 'Never runs.',
      triggers: [{ type: 'CRON', settings: { pattern: 'every monday' } }],
    });

    if (created.success && created.result) {
      createdAgentIds.push(created.result.id);
    }

    expect(created.success).toBe(false);
    expect(created.error).toContain('cron');
  });
});
