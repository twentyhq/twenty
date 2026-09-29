import { StepStatus } from 'twenty-shared/workflow';

import { type MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { type WorkflowVersionCoreSyncService } from 'src/engine/core-modules/workflow/services/workflow-version-core-sync.service';
import { type WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { type CodeStepBuildService } from 'src/modules/workflow/workflow-builder/workflow-version-step/code-step/services/code-step-build.service';
import { type WorkflowExecutorWorkspaceService } from 'src/modules/workflow/workflow-executor/workspace-services/workflow-executor.workspace-service';
import { RunWorkflowJob } from 'src/modules/workflow/workflow-runner/jobs/run-workflow.job';
import { type WorkflowRunWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.workspace-service';

const WORKSPACE_ID = 'workspace-id';
const WORKFLOW_RUN_ID = 'workflow-run-id';
const AGENT_STEP_ID = 'agent-step-id';
const THREAD_ID = 'thread-id';

describe('RunWorkflowJob', () => {
  const workflowRunWorkspaceService = {
    updateStepInfoIfPending: jest.fn(),
    updateWorkflowRunStepInfos: jest.fn(),
    endWorkflowRun: jest.fn(),
  };

  const workflowExecutorWorkspaceService = {
    executeFromSteps: jest.fn(),
  };

  const workspaceOrmManager = {
    executeInWorkspaceContext: jest.fn((callback: () => Promise<void>) =>
      callback(),
    ),
  };

  const job = new RunWorkflowJob(
    {} as WorkflowVersionCoreSyncService,
    {} as CodeStepBuildService,
    workflowExecutorWorkspaceService as unknown as WorkflowExecutorWorkspaceService,
    workflowRunWorkspaceService as unknown as WorkflowRunWorkspaceService,
    {} as MetricsService,
    workspaceOrmManager as unknown as WorkspaceOrmManager,
  );

  const resume = () =>
    job.handle({
      workspaceId: WORKSPACE_ID,
      workflowRunId: WORKFLOW_RUN_ID,
      stepToResume: { stepId: AGENT_STEP_ID, threadId: THREAD_ID },
    });

  beforeEach(() => {
    jest.clearAllMocks();
    workflowRunWorkspaceService.updateStepInfoIfPending.mockResolvedValue(true);
  });

  describe('resuming an answered step', () => {
    it('claims the step out of PENDING in its conversation and resumes it', async () => {
      await resume();

      expect(
        workflowRunWorkspaceService.updateStepInfoIfPending,
      ).toHaveBeenCalledWith({
        stepId: AGENT_STEP_ID,
        stepInfo: { status: StepStatus.RUNNING },
        expectedThreadId: THREAD_ID,
        workflowRunId: WORKFLOW_RUN_ID,
        workspaceId: WORKSPACE_ID,
      });
      expect(
        workflowExecutorWorkspaceService.executeFromSteps,
      ).toHaveBeenCalledWith({
        stepIds: [AGENT_STEP_ID],
        workflowRunId: WORKFLOW_RUN_ID,
        workspaceId: WORKSPACE_ID,
        resumedThreadId: THREAD_ID,
      });
      expect(
        workflowRunWorkspaceService.updateWorkflowRunStepInfos,
      ).not.toHaveBeenCalled();
    });

    it('does nothing when the step can no longer be claimed', async () => {
      workflowRunWorkspaceService.updateStepInfoIfPending.mockResolvedValue(
        false,
      );

      await resume();

      expect(
        workflowExecutorWorkspaceService.executeFromSteps,
      ).not.toHaveBeenCalled();
      expect(workflowRunWorkspaceService.endWorkflowRun).not.toHaveBeenCalled();
    });
  });
});
