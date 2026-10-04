import { StepStatus } from 'twenty-shared/workflow';

import { WorkflowRunStatus } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { RUN_WORKFLOW_JOB_NAME } from 'src/modules/workflow/workflow-runner/constants/run-workflow-job-name';
import { WorkflowStepWaitResolverWorkspaceService } from 'src/modules/workflow/workflow-wait/services/workflow-step-wait-resolver.workspace-service';

const WORKSPACE_ID = 'workspace-id';
const WORKFLOW_RUN_ID = 'workflow-run-id';
const STEP_ID = 'step-id';
const WAIT_ID = 'wait-id';

const EVENT = {
  eventName: 'company.updated',
  recordId: 'company-id',
  record: { id: 'company-id' },
};

const buildService = ({
  claimedWait = {
    id: WAIT_ID,
    workflowRunId: WORKFLOW_RUN_ID,
    stepId: STEP_ID,
    wait: { type: 'EVENT', eventName: 'company.updated' },
  },
  runStatus = WorkflowRunStatus.RUNNING,
  stepStatus = StepStatus.PENDING,
  stepType = 'WAIT_FOR_EVENT',
  resolveWait,
}: {
  claimedWait?: object | null;
  runStatus?: WorkflowRunStatus;
  stepStatus?: StepStatus;
  stepType?: string;
  resolveWait?: jest.Mock;
} = {}) => {
  const workflowStepWaitWorkspaceService = {
    claim: jest.fn().mockResolvedValue(claimedWait),
  };
  const workflowRunWorkspaceService = {
    getWorkflowRun: jest.fn().mockResolvedValue({
      status: runStatus,
      state: {
        flow: { steps: [{ id: STEP_ID, type: stepType }] },
        stepInfos: { [STEP_ID]: { status: stepStatus, threadId: 'thread-id' } },
      },
    }),
    updateStepInfoIfPending: jest.fn().mockResolvedValue(true),
    endWorkflowRun: jest.fn(),
  };
  const workflowActionFactory = {
    get: jest.fn().mockReturnValue({ execute: jest.fn(), resolveWait }),
  };
  const messageQueueService = { add: jest.fn() };

  const service = new WorkflowStepWaitResolverWorkspaceService(
    workflowStepWaitWorkspaceService as never,
    workflowRunWorkspaceService as never,
    workflowActionFactory as never,
    messageQueueService as never,
  );

  return {
    service,
    workflowRunWorkspaceService,
    messageQueueService,
  };
};

describe('WorkflowStepWaitResolverWorkspaceService', () => {
  it('does nothing when another resolution already claimed the wait', async () => {
    const { service, workflowRunWorkspaceService, messageQueueService } =
      buildService({ claimedWait: null });

    await service.resolve({ workspaceId: WORKSPACE_ID, waitId: WAIT_ID });

    expect(workflowRunWorkspaceService.getWorkflowRun).not.toHaveBeenCalled();
    expect(messageQueueService.add).not.toHaveBeenCalled();
  });

  it('completes the step with the event and resumes the run', async () => {
    const { service, workflowRunWorkspaceService, messageQueueService } =
      buildService();

    await service.resolve({
      workspaceId: WORKSPACE_ID,
      waitId: WAIT_ID,
      event: EVENT,
    });

    expect(
      workflowRunWorkspaceService.updateStepInfoIfPending,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        stepId: STEP_ID,
        stepInfo: {
          status: StepStatus.SUCCESS,
          result: { hasTimedOut: false, ...EVENT },
        },
      }),
    );
    expect(messageQueueService.add).toHaveBeenCalledWith(
      RUN_WORKFLOW_JOB_NAME,
      {
        workspaceId: WORKSPACE_ID,
        workflowRunId: WORKFLOW_RUN_ID,
        lastExecutedStepId: STEP_ID,
      },
      expect.anything(),
    );
  });

  it('reports a timeout when an event wait expires', async () => {
    const { service, workflowRunWorkspaceService } = buildService();

    await service.resolve({ workspaceId: WORKSPACE_ID, waitId: WAIT_ID });

    expect(
      workflowRunWorkspaceService.updateStepInfoIfPending,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        stepInfo: { status: StepStatus.SUCCESS, result: { hasTimedOut: true } },
      }),
    );
  });

  it('runs a step again on its conversation when the step resolves the wait itself', async () => {
    const resolveWait = jest
      .fn()
      .mockResolvedValue({ resumedThreadId: 'thread-id' });
    const { service, workflowRunWorkspaceService, messageQueueService } =
      buildService({ stepType: 'AI_AGENT', resolveWait });

    await service.resolve({
      workspaceId: WORKSPACE_ID,
      waitId: WAIT_ID,
      event: EVENT,
    });

    expect(resolveWait).toHaveBeenCalledWith(
      expect.objectContaining({
        outcome: { type: 'EVENT_RECEIVED', event: EVENT },
      }),
    );
    expect(
      workflowRunWorkspaceService.updateStepInfoIfPending,
    ).not.toHaveBeenCalled();
    expect(messageQueueService.add).toHaveBeenCalledWith(
      RUN_WORKFLOW_JOB_NAME,
      {
        workspaceId: WORKSPACE_ID,
        workflowRunId: WORKFLOW_RUN_ID,
        stepToResume: { stepId: STEP_ID, threadId: 'thread-id' },
      },
      expect.anything(),
    );
  });

  it('leaves a run that is no longer running alone', async () => {
    const { service, messageQueueService } = buildService({
      runStatus: WorkflowRunStatus.STOPPED,
    });

    await service.resolve({ workspaceId: WORKSPACE_ID, waitId: WAIT_ID });

    expect(messageQueueService.add).not.toHaveBeenCalled();
  });

  it('fails the run when the step cannot resume, since its wait is gone', async () => {
    const resolveWait = jest.fn().mockRejectedValue(new Error('boom'));
    const { service, workflowRunWorkspaceService } = buildService({
      stepType: 'AI_AGENT',
      resolveWait,
    });

    await expect(
      service.resolve({ workspaceId: WORKSPACE_ID, waitId: WAIT_ID }),
    ).rejects.toThrow('boom');

    expect(workflowRunWorkspaceService.endWorkflowRun).toHaveBeenCalledWith(
      expect.objectContaining({
        workflowRunId: WORKFLOW_RUN_ID,
        status: WorkflowRunStatus.FAILED,
      }),
    );
  });
});
