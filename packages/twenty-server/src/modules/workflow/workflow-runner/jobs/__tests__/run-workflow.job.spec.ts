import { StepStatus, type WorkflowRunStepInfos } from 'twenty-shared/workflow';

import { type MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { type WorkflowVersionCoreSyncService } from 'src/engine/core-modules/workflow/services/workflow-version-core-sync.service';
import { type WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { WorkflowRunStatus } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { type CodeStepBuildService } from 'src/modules/workflow/workflow-builder/workflow-version-step/code-step/services/code-step-build.service';
import { type WorkflowExecutorWorkspaceService } from 'src/modules/workflow/workflow-executor/workspace-services/workflow-executor.workspace-service';
import { RunWorkflowJob } from 'src/modules/workflow/workflow-runner/jobs/run-workflow.job';
import { type WorkflowRunWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.workspace-service';

const WORKSPACE_ID = 'workspace-id';
const WORKFLOW_RUN_ID = 'workflow-run-id';
const AGENT_STEP_ID = 'agent-step-id';

describe('RunWorkflowJob', () => {
  const workflowRunWorkspaceService = {
    getWorkflowRunOrFail: jest.fn(),
    updateStepInfoIfPending: jest.fn(),
    updateWorkflowRunStepInfos: jest.fn(),
    endWorkflowRun: jest.fn(),
  };

  const workflowExecutorWorkspaceService = {
    resumeAnsweredStep: jest.fn(),
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

  const mockWorkflowRun = ({
    status = WorkflowRunStatus.RUNNING,
    stepInfos,
  }: {
    status?: WorkflowRunStatus;
    stepInfos: WorkflowRunStepInfos;
  }) =>
    workflowRunWorkspaceService.getWorkflowRunOrFail.mockResolvedValue({
      id: WORKFLOW_RUN_ID,
      status,
      state: {
        flow: { steps: [{ id: AGENT_STEP_ID }] },
        stepInfos,
      },
    });

  const resume = () =>
    job.handle({
      workspaceId: WORKSPACE_ID,
      workflowRunId: WORKFLOW_RUN_ID,
      stepIdToResume: AGENT_STEP_ID,
    });

  beforeEach(() => {
    jest.clearAllMocks();
    workflowRunWorkspaceService.updateStepInfoIfPending.mockResolvedValue(true);
  });

  describe('resuming an answered step', () => {
    it('claims the step out of PENDING and resumes it', async () => {
      mockWorkflowRun({
        stepInfos: {
          [AGENT_STEP_ID]: { status: StepStatus.PENDING, threadId: 'thread' },
        },
      });

      await resume();

      expect(
        workflowRunWorkspaceService.updateStepInfoIfPending,
      ).toHaveBeenCalledWith({
        stepId: AGENT_STEP_ID,
        stepInfo: { status: StepStatus.RUNNING },
        workflowRunId: WORKFLOW_RUN_ID,
        workspaceId: WORKSPACE_ID,
      });
      expect(
        workflowExecutorWorkspaceService.resumeAnsweredStep,
      ).toHaveBeenCalledWith({
        stepId: AGENT_STEP_ID,
        workflowRunId: WORKFLOW_RUN_ID,
        workspaceId: WORKSPACE_ID,
      });
      expect(
        workflowExecutorWorkspaceService.executeFromSteps,
      ).not.toHaveBeenCalled();
      expect(
        workflowRunWorkspaceService.updateWorkflowRunStepInfos,
      ).not.toHaveBeenCalled();
    });

    it('does nothing once another resume has claimed the step', async () => {
      mockWorkflowRun({
        stepInfos: {
          [AGENT_STEP_ID]: { status: StepStatus.PENDING, threadId: 'thread' },
        },
      });
      workflowRunWorkspaceService.updateStepInfoIfPending.mockResolvedValue(
        false,
      );

      await resume();

      expect(
        workflowExecutorWorkspaceService.resumeAnsweredStep,
      ).not.toHaveBeenCalled();
    });

    it.each([
      [
        'the run is no longer running',
        WorkflowRunStatus.STOPPED,
        { status: StepStatus.PENDING, threadId: 'thread' },
      ],
      [
        'the step already resumed',
        WorkflowRunStatus.RUNNING,
        { status: StepStatus.RUNNING, threadId: 'thread' },
      ],
      [
        'the step waits on something other than a question',
        WorkflowRunStatus.RUNNING,
        { status: StepStatus.PENDING },
      ],
    ])('does nothing when %s', async (_, status, stepInfo) => {
      mockWorkflowRun({ status, stepInfos: { [AGENT_STEP_ID]: stepInfo } });

      await resume();

      expect(
        workflowRunWorkspaceService.updateStepInfoIfPending,
      ).not.toHaveBeenCalled();
      expect(
        workflowExecutorWorkspaceService.resumeAnsweredStep,
      ).not.toHaveBeenCalled();
      expect(workflowRunWorkspaceService.endWorkflowRun).not.toHaveBeenCalled();
    });
  });
});
