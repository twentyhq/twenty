import { createDeleteWorkflowTool } from 'src/modules/workflow/workflow-tools/tools/delete-workflow.tool';

const CORE_WORKFLOW_ID = 'b3b8a4f0-0000-4000-8000-000000000000';

const buildTool = () => {
  const coreWorkflowListService = {
    findOneById: jest.fn().mockResolvedValue({ id: CORE_WORKFLOW_ID }),
  };
  const coreWorkflowMutationService = {
    deleteWorkflows: jest.fn().mockResolvedValue([]),
  };

  const tool = createDeleteWorkflowTool(
    {
      coreWorkflowListService,
      coreWorkflowMutationService,
    } as never,
    {
      workspaceId: 'workspace-id',
      rolePermissionConfig: { shouldBypassPermissionChecks: true },
    },
  );

  return { tool, coreWorkflowListService, coreWorkflowMutationService };
};

const baseInput = { coreWorkflowId: CORE_WORKFLOW_ID };

describe('createDeleteWorkflowTool', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should delete the workflow through the core destroy path', async () => {
    const { tool, coreWorkflowMutationService } = buildTool();

    const result = (await tool.execute(baseInput)) as Record<string, unknown>;

    expect(coreWorkflowMutationService.deleteWorkflows).toHaveBeenCalledWith({
      workspaceId: 'workspace-id',
      userWorkspaceId: undefined,
      coreWorkflowIds: [CORE_WORKFLOW_ID],
    });
    expect(result.success).toBe(true);
    expect(result.coreWorkflowId).toBe(CORE_WORKFLOW_ID);
  });

  it('should delete a workflow that has no workspace mirror', async () => {
    const { tool, coreWorkflowMutationService } = buildTool();

    coreWorkflowMutationService.deleteWorkflows.mockResolvedValue([]);

    const result = (await tool.execute(baseInput)) as Record<string, unknown>;

    expect(result.success).toBe(true);
  });

  it('should report not found without deleting when the core workflow is absent', async () => {
    const { tool, coreWorkflowListService, coreWorkflowMutationService } =
      buildTool();

    coreWorkflowListService.findOneById.mockResolvedValue(null);

    const result = (await tool.execute(baseInput)) as Record<string, unknown>;

    expect(coreWorkflowMutationService.deleteWorkflows).not.toHaveBeenCalled();
    expect(result.success).toBe(false);
    expect(result.error).toBe('Workflow not found');
  });

  it('should return a failure result when deletion throws', async () => {
    const { tool, coreWorkflowMutationService } = buildTool();

    coreWorkflowMutationService.deleteWorkflows.mockRejectedValue(
      new Error('boom'),
    );

    const result = (await tool.execute(baseInput)) as Record<string, unknown>;

    expect(result.success).toBe(false);
    expect(result.error).toBe('boom');
    expect(result.message).toContain('boom');
  });
});
