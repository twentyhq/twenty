import { StepStatus } from 'twenty-shared/workflow';

import { type MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
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

  const completeAwaitedStep = () =>
    job.handle({
      workspaceId: WORKSPACE_ID,
      workflowRunId: WORKFLOW_RUN_ID,
      awaitedStepOutput: {
        stepId: AGENT_STEP_ID,
        actionOutput: { error: 'Agent failed' },
      },
    });

  beforeEach(() => {
    jest.clearAllMocks();
    workflowRunWorkspaceService.updateStepInfoIfPending.mockResolvedValue(true);
  });

  describe('ending a step that waited on a callback', () => {
    it('claims the step out of PENDING and ends it with its output like a step that just ran', async () => {
      await completeAwaitedStep();

      expect(
        workflowRunWorkspaceService.updateStepInfoIfPending,
      ).toHaveBeenCalledWith({
        stepId: AGENT_STEP_ID,
        stepInfo: { status: StepStatus.RUNNING },
        workflowRunId: WORKFLOW_RUN_ID,
        workspaceId: WORKSPACE_ID,
      });
      expect(
        workflowExecutorWorkspaceService.executeFromSteps,
      ).toHaveBeenCalledWith({
        stepIds: [AGENT_STEP_ID],
        workflowRunId: WORKFLOW_RUN_ID,
        workspaceId: WORKSPACE_ID,
        awaitedActionOutput: { error: 'Agent failed' },
      });
    });

    it('does nothing when the step can no longer be claimed', async () => {
      workflowRunWorkspaceService.updateStepInfoIfPending.mockResolvedValue(
        false,
      );

      await completeAwaitedStep();

      expect(
        workflowExecutorWorkspaceService.executeFromSteps,
      ).not.toHaveBeenCalled();
      expect(workflowRunWorkspaceService.endWorkflowRun).not.toHaveBeenCalled();
    });
  });

  describe('a run deleted while its job is in flight', () => {
    it('ends the job without failing the missing run', async () => {
      workflowExecutorWorkspaceService.executeFromSteps.mockRejectedValueOnce(
        new WorkflowRunException(
          'Workflow run not found',
          WorkflowRunExceptionCode.WORKFLOW_RUN_NOT_FOUND,
        ),
      );

      await expect(completeAwaitedStep()).resolves.toBeUndefined();

      expect(workflowRunWorkspaceService.endWorkflowRun).not.toHaveBeenCalled();
    });

    it('still fails the run on any other error', async () => {
      workflowExecutorWorkspaceService.executeFromSteps.mockRejectedValueOnce(
        new Error('Step blew up'),
      );

      await expect(completeAwaitedStep()).rejects.toThrow('Step blew up');

      expect(workflowRunWorkspaceService.endWorkflowRun).toHaveBeenCalledTimes(
        1,
      );
      expect(workflowRunWorkspaceService.endWorkflowRun).toHaveBeenCalledWith(
        expect.objectContaining({
          status: WorkflowRunStatus.FAILED,
          error: 'Step blew up',
        }),
      );
    });
  });
});
