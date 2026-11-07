import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { buildWorkflowToolExecutor } from 'src/modules/workflow/workflow-tools/tools/__tests__/workflow-tool-executor.test-util';
import { DeleteWorkflowTool } from 'src/modules/workflow/workflow-tools/tools/delete-workflow.tool';

const CORE_WORKFLOW_ID = 'b3b8a4f0-0000-4000-8000-000000000000';
const AUTH_CONTEXT = {
  type: 'user',
  workspace: { id: 'workspace-id' },
} as WorkspaceAuthContext;
const INSTALLED_APPLICATION = {
  id: 'c0a7e1d2-0000-4000-8000-000000000000',
  sourceType: ApplicationRegistrationSourceType.NPM,
} as FlatApplication;

const buildTool = (application?: FlatApplication) => {
  const coreWorkflowListService = {
    findOneById: jest.fn().mockResolvedValue({ id: CORE_WORKFLOW_ID }),
  };
  const coreWorkflowMutationService = {
    deleteWorkflows: jest.fn().mockResolvedValue([]),
  };

  const tool = buildWorkflowToolExecutor(
    new DeleteWorkflowTool(
      coreWorkflowListService as never,
      coreWorkflowMutationService as never,
    ),
    {
      workspaceId: 'workspace-id',
      authContext: AUTH_CONTEXT,
      application,
    },
  );

  return { tool, coreWorkflowListService, coreWorkflowMutationService };
};

const baseInput = { coreWorkflowId: CORE_WORKFLOW_ID };

describe('delete_workflow tool', () => {
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
    expect(result.result).toEqual({ coreWorkflowId: CORE_WORKFLOW_ID });
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

  it('should refuse an installed application without reading or deleting the workflow', async () => {
    const { tool, coreWorkflowListService, coreWorkflowMutationService } =
      buildTool(INSTALLED_APPLICATION);

    const result = await tool.execute(baseInput);

    expect(coreWorkflowListService.findOneById).not.toHaveBeenCalled();
    expect(coreWorkflowMutationService.deleteWorkflows).not.toHaveBeenCalled();
    expect(result).toMatchObject({
      success: false,
      message: 'Tool "delete_workflow" is not available',
    });
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
