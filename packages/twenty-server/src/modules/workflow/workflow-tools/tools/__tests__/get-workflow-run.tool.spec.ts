import { StepStatus } from 'twenty-shared/workflow';

import { type WorkflowToolDependencies } from 'src/modules/workflow/workflow-tools/types/workflow-tool-dependencies.type';

import { createGetWorkflowRunTool } from '../get-workflow-run.tool';

const WORKSPACE_ID = '20202020-aaaa-4d02-bf25-6aeccf7ea419';
const WORKFLOW_RUN_ID = '20202020-bbbb-4d02-bf25-6aeccf7ea419';
const ROLE_ID = '20202020-cccc-4d02-bf25-6aeccf7ea419';

const buildDeps = (findOneResult: unknown) => ({
  globalWorkspaceOrmManager: {
    executeInWorkspaceContext: jest.fn().mockImplementation(async (fn) => fn()),
    getRepository: jest.fn().mockResolvedValue({
      findOne: jest.fn().mockResolvedValue(findOneResult),
    }),
  },
});

const buildContext = () => ({
  workspaceId: WORKSPACE_ID,
  rolePermissionConfig: { intersectionOf: [ROLE_ID] },
});

describe('get_workflow_run tool', () => {
  it('should pass rolePermissionConfig to getRepository', async () => {
    const deps = buildDeps({ id: WORKFLOW_RUN_ID, state: {}, stepLogs: {} });
    const context = buildContext();

    const tool = createGetWorkflowRunTool(
      deps as unknown as Pick<
        WorkflowToolDependencies,
        'globalWorkspaceOrmManager'
      >,
      context,
    );

    await tool.execute({ workflowRunId: WORKFLOW_RUN_ID });

    expect(deps.globalWorkspaceOrmManager.getRepository).toHaveBeenCalledWith(
      WORKSPACE_ID,
      'workflowRun',
      context.rolePermissionConfig,
    );
  });

  it('should return workflow run details on success', async () => {
    const workflowRun = {
      id: WORKFLOW_RUN_ID,
      name: 'Test Run',
      status: 'FAILED',
      startedAt: '2025-01-01T00:00:00Z',
      endedAt: '2025-01-01T00:01:00Z',
      enqueuedAt: null,
      workflowId: 'wf-1',
      workflowVersionId: 'wfv-1',
      state: {
        workflowRunError: 'Something went wrong',
        flow: {
          steps: [
            { id: 'step-1', name: 'Step 1', type: 'CODE' },
            { id: 'step-2', name: 'Step 2', type: 'SEND_EMAIL' },
          ],
        },
        stepInfos: {
          'step-1': { status: StepStatus.COMPLETED },
          'step-2': { status: StepStatus.FAILED, error: 'Email failed' },
        },
      },
      stepLogs: {
        'step-2': [{ message: 'SMTP error' }],
      },
    };

    const deps = buildDeps(workflowRun);
    const context = buildContext();

    const tool = createGetWorkflowRunTool(
      deps as unknown as Pick<
        WorkflowToolDependencies,
        'globalWorkspaceOrmManager'
      >,
      context,
    );

    const result = await tool.execute({ workflowRunId: WORKFLOW_RUN_ID });

    expect(result.success).toBe(true);
    expect(result.workflowRun.id).toBe(WORKFLOW_RUN_ID);
    expect(result.workflowRun.error).toBe('Something went wrong');
    expect(result.workflowRun.steps).toHaveLength(2);
    expect(result.workflowRun.steps[1].error).toBe('Email failed');
    expect(result.workflowRun.failedStepLogs).toEqual({
      'step-2': [{ message: 'SMTP error' }],
    });
  });

  it('should return error when workflow run is not found', async () => {
    const deps = buildDeps(null);
    const context = buildContext();

    const tool = createGetWorkflowRunTool(
      deps as unknown as Pick<
        WorkflowToolDependencies,
        'globalWorkspaceOrmManager'
      >,
      context,
    );

    const result = await tool.execute({ workflowRunId: WORKFLOW_RUN_ID });

    expect(result.success).toBe(false);
    expect(result.error).toContain(WORKFLOW_RUN_ID);
  });
});
