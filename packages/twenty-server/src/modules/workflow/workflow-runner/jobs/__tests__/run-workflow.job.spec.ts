import { StepStatus } from 'twenty-shared/workflow';

import { type MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { type WorkflowCoreSyncService } from 'src/engine/core-modules/workflow/services/workflow-core-sync.service';
import { type WorkflowVersionCoreSyncService } from 'src/engine/core-modules/workflow/services/workflow-version-core-sync.service';
import { type WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { type CodeStepBuildService } from 'src/modules/workflow/workflow-builder/workflow-version-step/code-step/services/code-step-build.service';
import { WorkflowRunStatus } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { type WorkflowExecutorWorkspaceService } from 'src/modules/workflow/workflow-executor/workspace-services/workflow-executor.workspace-service';
import {
  WorkflowRunException,
  WorkflowRunExceptionCode,
} from 'src/modules/workflow/workflow-runner/exceptions/workflow-run.exception';
import { RunWorkflowJob } from 'src/modules/workflow/workflow-runner/jobs/run-workflow.job';
import { type WorkflowRunWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.workspace-service';

const WORKSPACE_ID = 'workspace-id';
const WORKFLOW_RUN_ID = 'workflow-run-id';
const AGENT_STEP_ID = 'agent-step-id';
const THREAD_ID = 'thread-id';
const DELAY_STEP_ID = 'delay-step-id';
const CORE_WORKFLOW_ID = 'core-workflow-id';

describe('RunWorkflowJob', () => {
  const workflowRunWorkspaceService = {
    getWorkflowRunOrFail: jest.fn(),
    updateStepInfoIfPending: jest.fn(),
    updateWorkflowRunStepInfos: jest.fn(),
    endWorkflowRun: jest.fn(),
  };

  const workflowExecutorWorkspaceService = {
    executeFromSteps: jest.fn(),
    getNextStepIdsToExecute: jest.fn(),
  };

  const workflowCoreSyncService = {
    findCoreWorkflowById: jest.fn(),
  };

  const workspaceOrmManager = {
    executeInWorkspaceContext: jest.fn((callback: () => Promise<void>) =>
      callback(),
    ),
  };

  const job = new RunWorkflowJob(
    {} as WorkflowVersionCoreSyncService,
    workflowCoreSyncService as unknown as WorkflowCoreSyncService,
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

  describe('a run whose workflow was deleted', () => {
    it('ends the run STOPPED instead of FAILED', async () => {
      workflowExecutorWorkspaceService.executeFromSteps.mockRejectedValueOnce(
        new WorkflowRunException(
          'Workflow run belongs to a deleted workflow',
          WorkflowRunExceptionCode.WORKFLOW_DELETED,
        ),
      );

      await expect(resume()).resolves.toBeUndefined();

      expect(workflowRunWorkspaceService.endWorkflowRun).toHaveBeenCalledTimes(
        1,
      );
      expect(workflowRunWorkspaceService.endWorkflowRun).toHaveBeenCalledWith({
        workspaceId: WORKSPACE_ID,
        workflowRunId: WORKFLOW_RUN_ID,
        status: WorkflowRunStatus.STOPPED,
      });
    });

    it('stops the run instead of completing it when its last waiting step resumes', async () => {
      workflowRunWorkspaceService.getWorkflowRunOrFail.mockResolvedValue({
        id: WORKFLOW_RUN_ID,
        status: WorkflowRunStatus.RUNNING,
        coreWorkflowId: CORE_WORKFLOW_ID,
        state: {
          flow: { steps: [{ id: DELAY_STEP_ID, nextStepIds: [] }] },
          stepInfos: { [DELAY_STEP_ID]: { status: StepStatus.SUCCESS } },
        },
      });
      workflowExecutorWorkspaceService.getNextStepIdsToExecute.mockResolvedValue(
        { nextStepIdsToExecute: [] },
      );
      workflowCoreSyncService.findCoreWorkflowById.mockResolvedValue(null);

      await job.handle({
        workspaceId: WORKSPACE_ID,
        workflowRunId: WORKFLOW_RUN_ID,
        lastExecutedStepId: DELAY_STEP_ID,
      });

      expect(workflowRunWorkspaceService.endWorkflowRun).toHaveBeenCalledTimes(
        1,
      );
      expect(workflowRunWorkspaceService.endWorkflowRun).toHaveBeenCalledWith({
        workspaceId: WORKSPACE_ID,
        workflowRunId: WORKFLOW_RUN_ID,
        status: WorkflowRunStatus.STOPPED,
      });
    });

    it('still ends the run FAILED on any other error', async () => {
      workflowExecutorWorkspaceService.executeFromSteps.mockRejectedValueOnce(
        new Error('Step blew up'),
      );

      await expect(resume()).rejects.toThrow('Step blew up');

      expect(workflowRunWorkspaceService.endWorkflowRun).toHaveBeenCalledWith(
        expect.objectContaining({
          status: WorkflowRunStatus.FAILED,
          error: 'Step blew up',
        }),
      );
    });
  });
});
