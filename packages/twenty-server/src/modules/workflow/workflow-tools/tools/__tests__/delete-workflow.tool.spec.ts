import { createDeleteWorkflowTool } from 'src/modules/workflow/workflow-tools/tools/delete-workflow.tool';

const WORKFLOW_ID = 'b3b8a4f0-0000-4000-8000-000000000000';

const buildTool = () => {
  const workflowRepository = {
    softDelete: jest.fn().mockResolvedValue({ affected: 1 }),
  };
  const globalWorkspaceOrmManager = {
    executeInWorkspaceContext: jest.fn((callback: () => unknown) => callback()),
    getRepository: jest.fn().mockResolvedValue(workflowRepository),
  };
  const workflowCommonService = {
    handleWorkflowSubEntities: jest.fn().mockResolvedValue(undefined),
  };

  const tool = createDeleteWorkflowTool(
    {
      globalWorkspaceOrmManager,
      workflowCommonService,
    } as never,
    {
      workspaceId: 'workspace-id',
      rolePermissionConfig: { shouldBypassPermissionChecks: true },
    } as never,
  );

  return {
    tool,
    workflowRepository,
    globalWorkspaceOrmManager,
    workflowCommonService,
  };
};

const baseInput = {
  workflowId: WORKFLOW_ID,
} as unknown as Parameters<
  ReturnType<typeof createDeleteWorkflowTool>['execute']
>[0];

describe('createDeleteWorkflowTool', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should soft delete the workflow and clean up sub-entities', async () => {
    const { tool, workflowRepository, workflowCommonService } = buildTool();

    const result = (await tool.execute(baseInput)) as Record<string, unknown>;

    expect(workflowRepository.softDelete).toHaveBeenCalledWith(WORKFLOW_ID);
    expect(
      workflowCommonService.handleWorkflowSubEntities,
    ).toHaveBeenCalledWith({
      workflowIds: [WORKFLOW_ID],
      workspaceId: 'workspace-id',
      operation: 'delete',
    });
    expect(result.success).toBe(true);
    expect(result.workflowId).toBe(WORKFLOW_ID);
  });

  it('should return a failure result when deletion throws', async () => {
    const { tool, workflowRepository } = buildTool();

    workflowRepository.softDelete.mockRejectedValue(new Error('boom'));

    const result = (await tool.execute(baseInput)) as Record<string, unknown>;

    expect(result.success).toBe(false);
    expect(result.error).toBe('boom');
    expect(result.message).toContain('boom');
  });
});
