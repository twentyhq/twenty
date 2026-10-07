import { StepStatus } from 'twenty-shared/workflow';

import { PendingWakeUpOwnerHandlerRegistryService } from 'src/engine/core-modules/pending-wake-up/services/pending-wake-up-owner-handler-registry.service';
import { PendingWakeUpResolverService } from 'src/engine/core-modules/pending-wake-up/services/pending-wake-up-resolver.service';
import { AgentRunCallerHandlerRegistryService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-run-caller-handler-registry.service';
import { WorkflowRunStatus } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { RUN_WORKFLOW_JOB_NAME } from 'src/modules/workflow/workflow-runner/constants/run-workflow-job-name';
import { WorkflowWaitingStepWorkspaceService } from 'src/modules/workflow/workflow-runner/workspace-services/workflow-waiting-step.workspace-service';

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
  workspaceId: WORKSPACE_ID,
  ownerType: 'WORKFLOW_STEP',
  ownerId: WORKFLOW_RUN_ID,
  ownerKey: STEP_ID,
  condition: { type: 'EVENT', eventName: 'company.updated' },
};

const buildService = ({
  storedWait = STORED_WAIT,
  runStatus = WorkflowRunStatus.RUNNING,
  stepStatus = StepStatus.PENDING,
  stepError,
  readableRecords = [READABLE_RECORD],
  isRecordReadFailing = false,
}: {
  storedWait?: object | null;
  runStatus?: WorkflowRunStatus;
  stepStatus?: StepStatus;
  stepError?: string;
  readableRecords?: object[];
  isRecordReadFailing?: boolean;
} = {}) => {
  const pendingWakeUpService = {
    find: jest.fn().mockResolvedValue(storedWait),
    claim: jest.fn().mockResolvedValue(storedWait),
    scheduleResolution: jest.fn(),
  };
  const workflowRunWorkspaceService = {
    getWorkflowRun: jest.fn().mockResolvedValue({
      status: runStatus,
      state: {
        flow: { steps: [{ id: STEP_ID, type: 'WAIT_FOR_EVENT' }] },
        stepInfos: { [STEP_ID]: { status: stepStatus, error: stepError } },
      },
    }),
    updateStepInfoIfPending: jest
      .fn()
      .mockResolvedValue(
        runStatus === WorkflowRunStatus.RUNNING &&
          stepStatus === StepStatus.PENDING,
      ),
    endWorkflowRun: jest.fn(),
  };
  const workflowExecutionContextService = {
    getExecutionContext: jest.fn().mockResolvedValue({
      authContext: { type: 'system' },
      rolePermissionConfig: { unionOf: ['role-id'] },
    }),
  };
  const findRecordsService = {
    execute: jest
      .fn()
      .mockResolvedValue(
        isRecordReadFailing
          ? { success: false, error: 'Connection terminated unexpectedly' }
          : { success: true, result: { records: readableRecords } },
      ),
  };
  const messageQueueService = { add: jest.fn() };

  const registry = new PendingWakeUpOwnerHandlerRegistryService();

  new WorkflowWaitingStepWorkspaceService(
    new AgentRunCallerHandlerRegistryService(),
    registry,
    workflowRunWorkspaceService as never,
    {} as never,
    workflowExecutionContextService as never,
    {} as never,
    messageQueueService as never,
  ).onModuleInit();

  const service = new PendingWakeUpResolverService(
    pendingWakeUpService as never,
    registry,
    findRecordsService as never,
  );

  return {
    service,
    pendingWakeUpService,
    workflowRunWorkspaceService,
    findRecordsService,
    messageQueueService,
  };
};

describe('WorkflowWaitingStepWorkspaceService as a wake-up owner', () => {
  it('does nothing when the wait was already resolved or cancelled', async () => {
    const { service, workflowRunWorkspaceService, messageQueueService } =
      buildService({ storedWait: null });

    await service.resolve({ workspaceId: WORKSPACE_ID, wakeUpId: WAIT_ID });

    expect(workflowRunWorkspaceService.getWorkflowRun).not.toHaveBeenCalled();
    expect(messageQueueService.add).not.toHaveBeenCalled();
  });

  it('completes the step with the record as the run reads it and resumes the run', async () => {
    const { service, workflowRunWorkspaceService, messageQueueService } =
      buildService();

    await service.resolve({
      workspaceId: WORKSPACE_ID,
      wakeUpId: WAIT_ID,
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
    const { service, pendingWakeUpService, workflowRunWorkspaceService } =
      buildService({ readableRecords: [] });

    await service.resolve({
      workspaceId: WORKSPACE_ID,
      wakeUpId: WAIT_ID,
      event: EVENT,
    });

    expect(pendingWakeUpService.claim).not.toHaveBeenCalled();
    expect(
      workflowRunWorkspaceService.updateStepInfoIfPending,
    ).not.toHaveBeenCalled();
  });

  it('keeps the event and tries again when reading its record fails', async () => {
    const { service, pendingWakeUpService } = buildService({
      isRecordReadFailing: true,
    });

    await service.resolve({
      workspaceId: WORKSPACE_ID,
      wakeUpId: WAIT_ID,
      event: EVENT,
    });

    expect(pendingWakeUpService.claim).not.toHaveBeenCalled();
    expect(pendingWakeUpService.scheduleResolution).toHaveBeenCalledWith(
      expect.objectContaining({ event: EVENT, recordReadAttempt: 1 }),
    );
  });

  it('keeps waiting for another event once reading the record kept failing', async () => {
    const { service, pendingWakeUpService, workflowRunWorkspaceService } =
      buildService({ isRecordReadFailing: true });

    await service.resolve({
      workspaceId: WORKSPACE_ID,
      wakeUpId: WAIT_ID,
      event: EVENT,
      recordReadAttempt: 8,
    });

    expect(pendingWakeUpService.claim).not.toHaveBeenCalled();
    expect(pendingWakeUpService.scheduleResolution).not.toHaveBeenCalled();
    expect(workflowRunWorkspaceService.endWorkflowRun).not.toHaveBeenCalled();
  });

  it('keeps fields the run cannot read out of the previous snapshot', async () => {
    const { service, workflowRunWorkspaceService } = buildService();

    await service.resolve({
      workspaceId: WORKSPACE_ID,
      wakeUpId: WAIT_ID,
      event: {
        ...EVENT,
        before: { id: 'company-id', name: 'Old', secret: 'old secret' },
        updatedFields: ['name', 'secret'],
      },
    });

    const [{ stepInfo }] =
      workflowRunWorkspaceService.updateStepInfoIfPending.mock.calls[0];

    expect(stepInfo.result.before).toEqual({ id: 'company-id', name: 'Old' });
    expect(stepInfo.result.updatedFields).toEqual(['name']);
  });

  it('reads deleted records when the event is a deletion', async () => {
    const { service, findRecordsService } = buildService();

    await service.resolve({
      workspaceId: WORKSPACE_ID,
      wakeUpId: WAIT_ID,
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
    const { service, pendingWakeUpService } = buildService({
      stepStatus: StepStatus.RUNNING,
    });

    await service.resolve({
      workspaceId: WORKSPACE_ID,
      wakeUpId: WAIT_ID,
      event: EVENT,
    });

    expect(pendingWakeUpService.claim).not.toHaveBeenCalled();
    expect(pendingWakeUpService.scheduleResolution).toHaveBeenCalledWith(
      expect.objectContaining({
        wakeUp: STORED_WAIT,
        event: EVENT,
        attempt: 1,
      }),
    );
  });

  it('keeps putting the resolution off, at most a minute apart, while the step is pausing', async () => {
    const { service, pendingWakeUpService } = buildService({
      stepStatus: StepStatus.RUNNING,
    });

    await service.resolve({
      workspaceId: WORKSPACE_ID,
      wakeUpId: WAIT_ID,
      event: EVENT,
      attempt: 20,
    });

    expect(pendingWakeUpService.claim).not.toHaveBeenCalled();
    expect(pendingWakeUpService.scheduleResolution).toHaveBeenCalledWith(
      expect.objectContaining({ event: EVENT, attempt: 21, delayMs: 60_000 }),
    );
  });

  it('reports a timeout when an event wait expires', async () => {
    const { service, workflowRunWorkspaceService } = buildService();

    await service.resolve({ workspaceId: WORKSPACE_ID, wakeUpId: WAIT_ID });

    expect(
      workflowRunWorkspaceService.updateStepInfoIfPending,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        stepInfo: { status: StepStatus.SUCCESS, result: { hasTimedOut: true } },
      }),
    );
  });

  it('removes the wait of a run that is no longer running without resuming it', async () => {
    const { service, pendingWakeUpService, messageQueueService } = buildService(
      { runStatus: WorkflowRunStatus.STOPPED },
    );

    await service.resolve({ workspaceId: WORKSPACE_ID, wakeUpId: WAIT_ID });

    expect(pendingWakeUpService.claim).toHaveBeenCalled();
    expect(messageQueueService.add).not.toHaveBeenCalled();
  });

  it('removes the wait of a step that now waits on a retry without resuming it', async () => {
    const {
      service,
      pendingWakeUpService,
      workflowRunWorkspaceService,
      messageQueueService,
    } = buildService({ stepError: 'Step failed' });

    await service.resolve({ workspaceId: WORKSPACE_ID, wakeUpId: WAIT_ID });

    expect(pendingWakeUpService.claim).toHaveBeenCalled();
    expect(
      workflowRunWorkspaceService.updateStepInfoIfPending,
    ).not.toHaveBeenCalled();
    expect(messageQueueService.add).not.toHaveBeenCalled();
  });

  it('fails the run when the step cannot resume, since its wait is gone', async () => {
    const { service, workflowRunWorkspaceService, messageQueueService } =
      buildService();

    messageQueueService.add.mockRejectedValue(new Error('boom'));

    await expect(
      service.resolve({ workspaceId: WORKSPACE_ID, wakeUpId: WAIT_ID }),
    ).rejects.toThrow('boom');

    expect(workflowRunWorkspaceService.endWorkflowRun).toHaveBeenCalledWith(
      expect.objectContaining({
        workflowRunId: WORKFLOW_RUN_ID,
        status: WorkflowRunStatus.FAILED,
      }),
    );
  });
});
