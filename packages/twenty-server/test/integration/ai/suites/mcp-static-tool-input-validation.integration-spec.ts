import { executeToolThroughMcp } from 'test/integration/ai/utils/execute-tool-through-mcp.util';

const listAgentIds = async (): Promise<string[]> => {
  const output = await executeToolThroughMcp<{ agents: { id: string }[] }>({
    toolName: 'list_agents',
    toolArguments: {},
  });

  expect(output.success).toBe(true);

  return (output.result?.agents ?? []).map((agent) => agent.id);
};

describe('MCP static tool input validation (integration)', () => {
  let agentIdsBefore: string[];

  beforeAll(async () => {
    agentIdsBefore = await listAgentIds();
  });

  afterAll(async () => {
    const leakedAgentIds = (await listAgentIds()).filter(
      (id) => !agentIdsBefore.includes(id),
    );

    for (const id of leakedAgentIds) {
      await executeToolThroughMcp({
        toolName: 'delete_agent',
        toolArguments: { id },
      });
    }
  });

  it.each([
    ['a label of the wrong type', { label: 42, prompt: 'Watch new deals.' }],
    [
      'a role id that is not a UUID',
      {
        label: 'Deal watcher',
        prompt: 'Watch new deals.',
        roleId: 'not-a-uuid',
      },
    ],
  ])(
    'should refuse create_agent with %s without creating an agent',
    async (_, toolArguments) => {
      const output = await executeToolThroughMcp({
        toolName: 'create_agent',
        toolArguments,
      });

      expect(output).toMatchSnapshot();
      expect(await listAgentIds()).toEqual(agentIdsBefore);
    },
  );

  it('should refuse delete_role with a role id that is not a UUID', async () => {
    const output = await executeToolThroughMcp({
      toolName: 'delete_role',
      toolArguments: { roleId: 'not-a-uuid' },
    });

    expect(output).toMatchSnapshot();
  });
});
