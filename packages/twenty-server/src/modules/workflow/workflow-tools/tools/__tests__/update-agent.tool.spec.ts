import { createUpdateAgentTool } from 'src/modules/workflow/workflow-tools/tools/update-agent.tool';

const AGENT_ID = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
const WORKSPACE_ID = 'workspace-id';

const buildAiAgentStep = (agentId: string, stepId = 'step-1') => ({
  id: stepId,
  name: 'AI Agent',
  type: 'AI_AGENT',
  valid: true,
  settings: { input: { agentId }, outputSchema: {} },
});

const buildTool = ({
  draftVersions = [],
}: {
  draftVersions?: { id: string; status: string; steps: unknown[] | null }[];
} = {}) => {
  const agentService = {
    updateOneAgent: jest.fn().mockResolvedValue({ id: AGENT_ID }),
  };
  const workflowVersionStepService = {
    updateWorkflowVersionStep: jest.fn().mockResolvedValue(undefined),
  };
  const workflowVersionRepository = {
    find: jest.fn().mockResolvedValue(draftVersions),
  };
  const globalWorkspaceOrmManager = {
    getRepository: jest.fn().mockResolvedValue(workflowVersionRepository),
  };
  const flatEntityMapsCacheService = {
    invalidateFlatEntityMaps: jest.fn().mockResolvedValue(undefined),
  };

  const tool = createUpdateAgentTool(
    {
      agentService,
      workflowVersionStepService,
      globalWorkspaceOrmManager,
      flatEntityMapsCacheService,
    } as never,
    { workspaceId: WORKSPACE_ID },
  );

  return {
    tool,
    agentService,
    workflowVersionStepService,
    globalWorkspaceOrmManager,
    flatEntityMapsCacheService,
  };
};

describe('createUpdateAgentTool', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should resync the linked AI_AGENT step output schema when responseFormat changes', async () => {
    const step = buildAiAgentStep(AGENT_ID);
    const { tool, workflowVersionStepService, flatEntityMapsCacheService } =
      buildTool({
        draftVersions: [{ id: 'version-1', status: 'DRAFT', steps: [step] }],
      });

    const result = (await tool.execute({
      agentId: AGENT_ID,
      responseFormat: {
        type: 'json',
        schema: {
          type: 'object',
          properties: { summary: { type: 'string' } },
        },
      },
    } as never)) as Record<string, unknown>;

    expect(result.success).toBe(true);
    expect(
      flatEntityMapsCacheService.invalidateFlatEntityMaps,
    ).toHaveBeenCalledWith({
      workspaceId: WORKSPACE_ID,
      flatMapsKeys: ['flatAgentMaps'],
    });
    expect(
      workflowVersionStepService.updateWorkflowVersionStep,
    ).toHaveBeenCalledWith({
      workspaceId: WORKSPACE_ID,
      workflowVersionId: 'version-1',
      step,
    });
  });

  it('should not resync when responseFormat is not provided', async () => {
    const step = buildAiAgentStep(AGENT_ID);
    const { tool, workflowVersionStepService, globalWorkspaceOrmManager } =
      buildTool({
        draftVersions: [{ id: 'version-1', status: 'DRAFT', steps: [step] }],
      });

    const result = (await tool.execute({
      agentId: AGENT_ID,
      prompt: 'You are a helpful assistant',
    } as never)) as Record<string, unknown>;

    expect(result.success).toBe(true);
    expect(globalWorkspaceOrmManager.getRepository).not.toHaveBeenCalled();
    expect(
      workflowVersionStepService.updateWorkflowVersionStep,
    ).not.toHaveBeenCalled();
  });

  it('should skip steps referencing a different agent', async () => {
    const { tool, workflowVersionStepService } = buildTool({
      draftVersions: [
        {
          id: 'version-1',
          status: 'DRAFT',
          steps: [buildAiAgentStep('another-agent-id')],
        },
      ],
    });

    await tool.execute({
      agentId: AGENT_ID,
      responseFormat: { type: 'text' },
    } as never);

    expect(
      workflowVersionStepService.updateWorkflowVersionStep,
    ).not.toHaveBeenCalled();
  });

  it('should still report agent update success when the resync fails', async () => {
    const step = buildAiAgentStep(AGENT_ID);
    const { tool, workflowVersionStepService } = buildTool({
      draftVersions: [{ id: 'version-1', status: 'DRAFT', steps: [step] }],
    });

    workflowVersionStepService.updateWorkflowVersionStep.mockRejectedValue(
      new Error('boom'),
    );

    const result = (await tool.execute({
      agentId: AGENT_ID,
      responseFormat: { type: 'text' },
    } as never)) as Record<string, unknown>;

    expect(result.success).toBe(true);
    expect(result.message).toContain('failed to resync');
  });
});
