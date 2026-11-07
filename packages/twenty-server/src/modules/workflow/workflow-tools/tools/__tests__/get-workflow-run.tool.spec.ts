import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { StepStatus } from 'twenty-shared/workflow';

import { buildWorkflowToolExecutor } from 'src/modules/workflow/workflow-tools/tools/__tests__/workflow-tool-executor.test-util';
import { GetWorkflowRunTool } from 'src/modules/workflow/workflow-tools/tools/get-workflow-run.tool';

const WORKSPACE_ID = '20202020-aaaa-4d02-bf25-6aeccf7ea419';
const WORKFLOW_RUN_ID = '20202020-bbbb-4d02-bf25-6aeccf7ea419';
const AUTH_CONTEXT = {
  type: 'user',
  workspace: { id: WORKSPACE_ID },
} as WorkspaceAuthContext;

const buildDeps = (findOneResult: unknown) => ({
  workspaceOrmManager: {
    executeInWorkspaceContext: jest.fn().mockImplementation(async (fn) => fn()),
    getRepository: jest.fn().mockReturnValue({
      findOne: jest.fn().mockResolvedValue(findOneResult),
    }),
  },
});

const buildContext = () => ({
  workspaceId: WORKSPACE_ID,
  authContext: AUTH_CONTEXT,
});

describe('get_workflow_run tool', () => {
  it('should read as the caller rather than bypassing permissions', async () => {
    const deps = buildDeps({ id: WORKFLOW_RUN_ID, state: {}, stepLogs: {} });
    const context = buildContext();

    const tool = buildWorkflowToolExecutor(
      new GetWorkflowRunTool(deps.workspaceOrmManager as never),
      context,
    );

    await tool.execute({ workflowRunId: WORKFLOW_RUN_ID });

    expect(deps.workspaceOrmManager.getRepository).toHaveBeenCalledWith(
      'workflowRun',
    );
    expect(
      deps.workspaceOrmManager.executeInWorkspaceContext,
    ).toHaveBeenCalledWith(expect.any(Function), AUTH_CONTEXT);
  });

  it('should return workflow run details on success', async () => {
    const workflowRun = {
      id: WORKFLOW_RUN_ID,
      name: 'Test Run',
      status: 'FAILED',
      startedAt: '2025-01-01T00:00:00Z',
      endedAt: '2025-01-01T00:01:00Z',
      enqueuedAt: null,
      coreWorkflowId: 'core-wf-1',
      coreWorkflowVersionId: 'core-wfv-1',
      state: {
        workflowRunError: 'Something went wrong',
        flow: {
          steps: [
            { id: 'step-1', name: 'Step 1', type: 'CODE' },
            { id: 'step-2', name: 'Step 2', type: 'SEND_EMAIL' },
          ],
        },
        stepInfos: {
          'step-1': { status: StepStatus.SUCCESS, result: { total: 3 } },
          'step-2': { status: StepStatus.FAILED, error: 'Email failed' },
        },
      },
      stepLogs: {
        'step-2': [{ message: 'SMTP error' }],
      },
    };

    const deps = buildDeps(workflowRun);
    const context = buildContext();

    const tool = buildWorkflowToolExecutor(
      new GetWorkflowRunTool(deps.workspaceOrmManager as never),
      context,
    );

    const result = await tool.execute({ workflowRunId: WORKFLOW_RUN_ID });

    expect(result).toMatchObject({
      success: true,
      result: {
        id: WORKFLOW_RUN_ID,
        error: 'Something went wrong',
        steps: [{ output: { total: 3 } }, { error: 'Email failed' }],
        failedStepLogs: { 'step-2': [{ message: 'SMTP error' }] },
      },
    });
  });

  it('should return a preview of a step output too large to inline', async () => {
    const largeOutput = {
      records: Array.from({ length: 500 }, (_, index) => ({
        id: `record-${index}`,
        name: 'x'.repeat(100),
      })),
    };

    const deps = buildDeps({
      id: WORKFLOW_RUN_ID,
      state: {
        flow: {
          steps: [{ id: 'step-1', name: 'Find', type: 'FIND_RECORDS' }],
        },
        stepInfos: {
          'step-1': { status: StepStatus.SUCCESS, result: largeOutput },
        },
      },
      stepLogs: {},
    });

    const tool = buildWorkflowToolExecutor(
      new GetWorkflowRunTool(deps.workspaceOrmManager as never),
      buildContext(),
    );

    const result = await tool.execute({ workflowRunId: WORKFLOW_RUN_ID });

    expect(result).toMatchObject({
      success: true,
      result: { steps: [{ isOutputTruncated: true }] },
    });
    expect(JSON.stringify(result).length).toBeLessThan(
      JSON.stringify(largeOutput).length,
    );
  });

  it('should return error when workflow run is not found', async () => {
    const deps = buildDeps(null);
    const context = buildContext();

    const tool = buildWorkflowToolExecutor(
      new GetWorkflowRunTool(deps.workspaceOrmManager as never),
      context,
    );

    const result = await tool.execute({ workflowRunId: WORKFLOW_RUN_ID });

    expect(result.success).toBe(false);
    expect(result.error).toContain(WORKFLOW_RUN_ID);
  });
});
