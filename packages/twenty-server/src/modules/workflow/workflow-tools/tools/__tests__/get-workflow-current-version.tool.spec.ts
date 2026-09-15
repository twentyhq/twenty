import { WorkflowVersionStatus } from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';
import { type WorkflowToolDependencies } from 'src/modules/workflow/workflow-tools/types/workflow-tool-dependencies.type';

import { createGetWorkflowCurrentVersionTool } from '../get-workflow-current-version.tool';

const WORKSPACE_ID = '20202020-aaaa-4d02-bf25-6aeccf7ea419';
const WORKFLOW_ID = '20202020-bbbb-4d02-bf25-6aeccf7ea419';
const ROLE_ID = '20202020-cccc-4d02-bf25-6aeccf7ea419';

const buildContext = () => ({
  workspaceId: WORKSPACE_ID,
  rolePermissionConfig: { intersectionOf: [ROLE_ID] },
});

const buildDeps = ({
  workflow,
  versions,
}: {
  workflow: unknown;
  versions: unknown[];
}) => {
  const getRepositoryMock = jest.fn();

  getRepositoryMock.mockReturnValueOnce({
    findOne: jest.fn().mockResolvedValue(workflow),
  });

  getRepositoryMock.mockReturnValueOnce({
    find: jest.fn().mockResolvedValue(versions),
  });

  return {
    workspaceOrmManager: {
      executeInWorkspaceContext: jest
        .fn()
        .mockImplementation(async (fn) => fn()),
      getRepository: getRepositoryMock,
    },
  };
};

describe('get_workflow_current_version tool', () => {
  it('should pass rolePermissionConfig to both getRepository calls', async () => {
    const context = buildContext();
    const deps = buildDeps({
      workflow: { id: WORKFLOW_ID },
      versions: [
        {
          id: 'v1',
          status: WorkflowVersionStatus.DRAFT,
          workflowId: WORKFLOW_ID,
        },
      ],
    });

    const tool = createGetWorkflowCurrentVersionTool(
      deps as unknown as Pick<WorkflowToolDependencies, 'workspaceOrmManager'>,
      context,
    );

    await tool.execute({ workflowId: WORKFLOW_ID });

    expect(deps.workspaceOrmManager.getRepository).toHaveBeenNthCalledWith(
      1,
      'workflow',
      context.rolePermissionConfig,
    );
    expect(deps.workspaceOrmManager.getRepository).toHaveBeenNthCalledWith(
      2,
      'workflowVersion',
      context.rolePermissionConfig,
    );
  });

  it('should return draft version over active version', async () => {
    const context = buildContext();
    const deps = buildDeps({
      workflow: { id: WORKFLOW_ID },
      versions: [
        {
          id: 'v-active',
          name: 'Active',
          status: WorkflowVersionStatus.ACTIVE,
          workflowId: WORKFLOW_ID,
          trigger: null,
          steps: [],
        },
        {
          id: 'v-draft',
          name: 'Draft',
          status: WorkflowVersionStatus.DRAFT,
          workflowId: WORKFLOW_ID,
          trigger: null,
          steps: [],
        },
      ],
    });

    const tool = createGetWorkflowCurrentVersionTool(
      deps as unknown as Pick<WorkflowToolDependencies, 'workspaceOrmManager'>,
      context,
    );

    const result = await tool.execute({ workflowId: WORKFLOW_ID });

    expect(result.success).toBe(true);

    if (
      !('workflowVersion' in result) ||
      result.workflowVersion === undefined
    ) {
      throw new Error('Expected workflowVersion to be present in the result');
    }

    expect(result.workflowVersion.id).toBe('v-draft');
  });

  it('should return error when workflow is not found', async () => {
    const context = buildContext();
    const deps = buildDeps({ workflow: null, versions: [] });

    const tool = createGetWorkflowCurrentVersionTool(
      deps as unknown as Pick<WorkflowToolDependencies, 'workspaceOrmManager'>,
      context,
    );

    const result = await tool.execute({ workflowId: WORKFLOW_ID });

    expect(result.success).toBe(false);
    expect(result.error).toContain(WORKFLOW_ID);
  });

  it('should return error when no draft or active version exists', async () => {
    const context = buildContext();
    const deps = buildDeps({ workflow: { id: WORKFLOW_ID }, versions: [] });

    const tool = createGetWorkflowCurrentVersionTool(
      deps as unknown as Pick<WorkflowToolDependencies, 'workspaceOrmManager'>,
      context,
    );

    const result = await tool.execute({ workflowId: WORKFLOW_ID });

    expect(result.success).toBe(false);
    expect(result.error).toContain('no draft or active version');
  });
});
