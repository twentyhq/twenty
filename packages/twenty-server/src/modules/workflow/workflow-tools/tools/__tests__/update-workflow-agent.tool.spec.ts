import { createUpdateWorkflowAgentTool } from 'src/modules/workflow/workflow-tools/tools/update-workflow-agent.tool';

const AGENT_ID = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
const WORKSPACE_ID = 'workspace-id';

const buildAiAgentStep = (agentId: string, stepId = 'step-1') => ({
  id: stepId,
  name: 'Agent',
  type: 'AI_AGENT',
  valid: true,
  settings: { input: { agentId }, outputSchema: {} },
});

const buildTool = ({
  draftCoreVersions = [],
}: {
  draftCoreVersions?: { id: string; steps: unknown[] | null }[];
} = {}) => {
  const agentService = {
    updateOneAgent: jest.fn().mockResolvedValue({ id: AGENT_ID }),
  };
  const coreWorkflowVersionMutationService = {
    updateStep: jest.fn().mockResolvedValue(undefined),
  };
  const coreWorkflowVersionListService = {
    findDraftCoreWorkflowVersions: jest
      .fn()
      .mockResolvedValue(draftCoreVersions),
  };
  const tool = createUpdateWorkflowAgentTool(
    {
      agentService,
      coreWorkflowVersionMutationService,
      coreWorkflowVersionListService,
    } as never,
    {
      workspaceId: WORKSPACE_ID,
      rolePermissionConfig: { shouldBypassPermissionChecks: true },
    },
  );

  return {
    tool,
    agentService,
    coreWorkflowVersionMutationService,
    coreWorkflowVersionListService,
  };
};

describe('createUpdateWorkflowAgentTool', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should set the response format on the linked AI_AGENT steps rather than on the agent', async () => {
    const step = buildAiAgentStep(AGENT_ID);
    const responseFormat = {
      type: 'json',
      schema: {
        type: 'object',
        properties: { summary: { type: 'string' } },
      },
    };
    const { tool, agentService, coreWorkflowVersionMutationService } =
      buildTool({
        draftCoreVersions: [{ id: 'core-version-1', steps: [step] }],
      });

    const result = (await tool.execute({
      agentId: AGENT_ID,
      responseFormat,
    } as never)) as Record<string, unknown>;

    expect(result.success).toBe(true);
    expect(agentService.updateOneAgent).not.toHaveBeenCalled();
    expect(coreWorkflowVersionMutationService.updateStep).toHaveBeenCalledTimes(
      1,
    );
    expect(coreWorkflowVersionMutationService.updateStep).toHaveBeenCalledWith({
      workspaceId: WORKSPACE_ID,
      coreWorkflowVersionId: 'core-version-1',
      step: {
        ...step,
        settings: {
          ...step.settings,
          input: { agentId: AGENT_ID, responseFormat },
        },
      },
    });
  });

  it('should set the response format on every step using the agent in a draft', async () => {
    const firstStep = buildAiAgentStep(AGENT_ID, 'step-1');
    const secondStep = buildAiAgentStep(AGENT_ID, 'step-2');
    const { tool, coreWorkflowVersionMutationService } = buildTool({
      draftCoreVersions: [
        { id: 'core-version-1', steps: [firstStep, secondStep] },
      ],
    });

    await tool.execute({
      agentId: AGENT_ID,
      responseFormat: { type: 'text' },
    } as never);

    expect(coreWorkflowVersionMutationService.updateStep).toHaveBeenCalledTimes(
      2,
    );
    expect(
      coreWorkflowVersionMutationService.updateStep.mock.calls.map(
        ([{ step }]) => step.id,
      ),
    ).toEqual(['step-1', 'step-2']);
  });

  it('should only update the agent when responseFormat is not provided', async () => {
    const step = buildAiAgentStep(AGENT_ID);
    const {
      tool,
      agentService,
      coreWorkflowVersionMutationService,
      coreWorkflowVersionListService,
    } = buildTool({
      draftCoreVersions: [{ id: 'core-version-1', steps: [step] }],
    });

    const result = (await tool.execute({
      agentId: AGENT_ID,
      prompt: 'You are a helpful assistant',
    } as never)) as Record<string, unknown>;

    expect(result.success).toBe(true);
    expect(agentService.updateOneAgent).toHaveBeenCalledTimes(1);
    expect(agentService.updateOneAgent).toHaveBeenCalledWith({
      input: { id: AGENT_ID, prompt: 'You are a helpful assistant' },
      workspaceId: WORKSPACE_ID,
    });
    expect(
      coreWorkflowVersionListService.findDraftCoreWorkflowVersions,
    ).not.toHaveBeenCalled();
    expect(
      coreWorkflowVersionMutationService.updateStep,
    ).not.toHaveBeenCalled();
  });

  it('should skip steps referencing a different agent', async () => {
    const { tool, coreWorkflowVersionMutationService } = buildTool({
      draftCoreVersions: [
        {
          id: 'core-version-1',
          steps: [buildAiAgentStep('another-agent-id')],
        },
      ],
    });

    const result = await tool.execute({
      agentId: AGENT_ID,
      responseFormat: { type: 'text' },
    } as never);

    expect(
      coreWorkflowVersionMutationService.updateStep,
    ).not.toHaveBeenCalled();
    expect(result.success).toBe(false);
    expect(result.message).toContain('no draft AI_AGENT step uses agent');
  });

  it('should report a failure when the steps cannot be updated', async () => {
    const step = buildAiAgentStep(AGENT_ID);
    const { tool, coreWorkflowVersionMutationService } = buildTool({
      draftCoreVersions: [{ id: 'core-version-1', steps: [step] }],
    });

    coreWorkflowVersionMutationService.updateStep.mockRejectedValue(
      new Error('boom'),
    );

    const result = (await tool.execute({
      agentId: AGENT_ID,
      responseFormat: { type: 'text' },
    } as never)) as Record<string, unknown>;

    expect(result.success).toBe(false);
    expect(result.error).toBe('boom');
  });
});
