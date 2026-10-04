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
  record: { id: 'company-id', secret: 'hidden from the run' },
};

const READABLE_RECORD = { id: 'company-id', name: 'Acme' };

const STORED_WAIT = {
  id: WAIT_ID,
  workflowRunId: WORKFLOW_RUN_ID,
  stepId: STEP_ID,
  wait: { type: 'EVENT', eventName: 'company.updated' },
};

const buildService = ({
  storedWait = STORED_WAIT,
  runStatus = WorkflowRunStatus.RUNNING,
  stepStatus = StepStatus.PENDING,
  stepType = 'WAIT_FOR_EVENT',
  readableRecords = [READABLE_RECORD],
  resolveWait,
}: {
  storedWait?: object | null;
  runStatus?: WorkflowRunStatus;
  stepStatus?: StepStatus;
  stepType?: string;
  readableRecords?: object[];
  resolveWait?: jest.Mock;
} = {}) => {
  const workflowStepWaitWorkspaceService = {
    findWait: jest.fn().mockResolvedValue(storedWait),
    claim: jest.fn().mockResolvedValue(storedWait),
    scheduleResolution: jest.fn(),
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
  const workflowExecutionContextService = {
    getExecutionContext: jest.fn().mockResolvedValue({
      authContext: { type: 'system' },
      rolePermissionConfig: { unionOf: ['role-id'] },
    }),
  };
  const findRecordsService = {
    execute: jest.fn().mockResolvedValue({
      success: true,
      result: { records: readableRecords },
    }),
  };
  const messageQueueService = { add: jest.fn() };

  const service = new WorkflowStepWaitResolverWorkspaceService(
    workflowStepWaitWorkspaceService as never,
    workflowRunWorkspaceService as never,
    workflowActionFactory as never,
    workflowExecutionContextService as never,
    findRecordsService as never,
    messageQueueService as never,
  );

  return {
    service,
    workflowStepWaitWorkspaceService,
    workflowRunWorkspaceService,
    findRecordsService,
    messageQueueService,
  };
};

describe('WorkflowStepWaitResolverWorkspaceService', () => {
  it('does nothing when the wait was already resolved or cancelled', async () => {
    const { service, workflowRunWorkspaceService, messageQueueService } =
      buildService({ storedWait: null });

    await service.resolve({ workspaceId: WORKSPACE_ID, waitId: WAIT_ID });

    expect(workflowRunWorkspaceService.getWorkflowRun).not.toHaveBeenCalled();
    expect(messageQueueService.add).not.toHaveBeenCalled();
  });

  it('completes the step with the record as the run reads it and resumes the run', async () => {
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
          result: { hasTimedOut: false, ...EVENT, record: READABLE_RECORD },
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

  it('keeps waiting when the run cannot read the record of the event', async () => {
    const {
      service,
      workflowStepWaitWorkspaceService,
      workflowRunWorkspaceService,
    } = buildService({ readableRecords: [] });

    await service.resolve({
      workspaceId: WORKSPACE_ID,
      waitId: WAIT_ID,
      event: EVENT,
    });

    expect(workflowStepWaitWorkspaceService.claim).not.toHaveBeenCalled();
    expect(
      workflowRunWorkspaceService.updateStepInfoIfPending,
    ).not.toHaveBeenCalled();
  });

  it('reads deleted records when the event is a deletion', async () => {
    const { service, findRecordsService } = buildService();

    await service.resolve({
      workspaceId: WORKSPACE_ID,
      waitId: WAIT_ID,
      event: { ...EVENT, eventName: 'company.deleted' },
    });

    expect(findRecordsService.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        objectName: 'company',
        filter: { id: { eq: 'company-id' }, deletedAt: { is: 'NOT_NULL' } },
      }),
    );
  });

  it('puts the resolution off while the step is still pausing', async () => {
    const { service, workflowStepWaitWorkspaceService } = buildService({
      stepStatus: StepStatus.RUNNING,
    });

    await service.resolve({
      workspaceId: WORKSPACE_ID,
      waitId: WAIT_ID,
      event: EVENT,
    });

    expect(workflowStepWaitWorkspaceService.claim).not.toHaveBeenCalled();
    expect(
      workflowStepWaitWorkspaceService.scheduleResolution,
    ).toHaveBeenCalledWith(
      expect.objectContaining({ waitId: WAIT_ID, event: EVENT, attempt: 1 }),
    );
  });

  it('keeps putting the resolution off, at most a minute apart, while the step is pausing', async () => {
    const { service, workflowStepWaitWorkspaceService } = buildService({
      stepStatus: StepStatus.RUNNING,
    });

    await service.resolve({
      workspaceId: WORKSPACE_ID,
      waitId: WAIT_ID,
      event: EVENT,
      attempt: 20,
    });

    expect(workflowStepWaitWorkspaceService.claim).not.toHaveBeenCalled();
    expect(
      workflowStepWaitWorkspaceService.scheduleResolution,
    ).toHaveBeenCalledWith(
      expect.objectContaining({ event: EVENT, attempt: 21, delayMs: 60_000 }),
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
        outcome: {
          type: 'EVENT_RECEIVED',
          event: { ...EVENT, record: READABLE_RECORD },
        },
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

  it('removes the wait of a run that is no longer running without resuming it', async () => {
    const {
      service,
      workflowStepWaitWorkspaceService,
      workflowRunWorkspaceService,
      messageQueueService,
    } = buildService({ runStatus: WorkflowRunStatus.STOPPED });

    await service.resolve({ workspaceId: WORKSPACE_ID, waitId: WAIT_ID });

    expect(workflowStepWaitWorkspaceService.claim).toHaveBeenCalled();
    expect(
      workflowRunWorkspaceService.updateStepInfoIfPending,
    ).not.toHaveBeenCalled();
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
