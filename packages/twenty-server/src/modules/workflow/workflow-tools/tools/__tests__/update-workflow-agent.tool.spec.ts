import { createUpdateWorkflowAgentTool } from 'src/modules/workflow/workflow-tools/tools/update-workflow-agent.tool';

const AGENT_ID = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
const WORKSPACE_ID = 'workspace-id';

const buildTool = ({
  isStepOwnedAgent = true,
}: { isStepOwnedAgent?: boolean } = {}) => {
  const agentService = {
    updateOneAgent: jest.fn().mockResolvedValue({ id: AGENT_ID }),
  };
  const workflowAiAgentStepAgentService = {
    findStepOwnedAgent: jest
      .fn()
      .mockResolvedValue(
        isStepOwnedAgent ? { id: AGENT_ID, label: 'Lead qualifier' } : null,
      ),
  };
  const deps: Parameters<typeof createUpdateWorkflowAgentTool>[0] = {
    agentService,
    workflowAiAgentStepAgentService,
  };
  const tool = createUpdateWorkflowAgentTool(deps, {
    workspaceId: WORKSPACE_ID,
    rolePermissionConfig: { shouldBypassPermissionChecks: true },
  });

  return { tool, agentService };
};

describe('createUpdateWorkflowAgentTool', () => {
  it('updates the prompt and model of a step-owned agent', async () => {
    const { tool, agentService } = buildTool();

    const result = await tool.execute({
      agentId: AGENT_ID,
      prompt: 'Qualify the lead',
      modelId: 'gpt-4o',
    });

    expect(result.success).toBe(true);
    expect(agentService.updateOneAgent).toHaveBeenCalledWith({
      input: { id: AGENT_ID, prompt: 'Qualify the lead', modelId: 'gpt-4o' },
      workspaceId: WORKSPACE_ID,
    });
  });

  it('refuses a reusable agent, which is edited on its own', async () => {
    const { tool, agentService } = buildTool({ isStepOwnedAgent: false });

    const result = await tool.execute({
      agentId: AGENT_ID,
      prompt: 'Qualify the lead',
    });

    expect(result.success).toBe(false);
    expect(agentService.updateOneAgent).not.toHaveBeenCalled();
  });
});
