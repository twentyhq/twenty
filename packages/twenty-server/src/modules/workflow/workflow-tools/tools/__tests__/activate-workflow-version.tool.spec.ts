import { createActivateWorkflowVersionTool } from 'src/modules/workflow/workflow-tools/tools/activate-workflow-version.tool';

const CORE_WORKFLOW_VERSION_ID = 'b3b8a4f0-0000-4000-8000-000000000002';

const buildTool = () => {
  const coreWorkflowLifecycleService = {
    activateCoreWorkflowVersion: jest.fn().mockResolvedValue(true),
  };

  const tool = createActivateWorkflowVersionTool(
    { coreWorkflowLifecycleService } as never,
    {
      workspaceId: 'workspace-id',
      userWorkspaceId: 'user-workspace-id',
      rolePermissionConfig: { shouldBypassPermissionChecks: true },
    },
  );

  return { tool, coreWorkflowLifecycleService };
};

describe('createActivateWorkflowVersionTool', () => {
  it('activates through the core lifecycle service', async () => {
    const { tool, coreWorkflowLifecycleService } = buildTool();

    const result = await tool.execute({
      coreWorkflowVersionId: CORE_WORKFLOW_VERSION_ID,
    });

    expect(
      coreWorkflowLifecycleService.activateCoreWorkflowVersion,
    ).toHaveBeenCalledWith({
      workspaceId: 'workspace-id',
      userWorkspaceId: 'user-workspace-id',
      coreWorkflowVersionId: CORE_WORKFLOW_VERSION_ID,
    });
    expect(result).toBe(true);
  });

  it('returns a failure when activation throws', async () => {
    const { tool, coreWorkflowLifecycleService } = buildTool();

    coreWorkflowLifecycleService.activateCoreWorkflowVersion.mockRejectedValue(
      new Error('Workflow version changed during activation'),
    );

    const result = (await tool.execute({
      coreWorkflowVersionId: CORE_WORKFLOW_VERSION_ID,
    })) as Record<string, unknown>;

    expect(result.success).toBe(false);
    expect(result.error).toBe('Workflow version changed during activation');
    expect(result.message).toContain('Failed to activate workflow version');
  });
});
