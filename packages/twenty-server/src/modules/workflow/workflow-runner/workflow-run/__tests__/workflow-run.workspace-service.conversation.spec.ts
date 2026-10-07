import { StepStatus, WorkflowActionType } from 'twenty-shared/workflow';

import { WorkflowRunStatus } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { WorkflowRunWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.workspace-service';

describe('WorkflowRunWorkspaceService waiting steps', () => {
  const buildService = ({
    status = WorkflowRunStatus.RUNNING,
    stepInfo = {
      status: StepStatus.PENDING,
      threadId: 'thread-id',
    } as Record<string, unknown>,
  } = {}) => {
    const agentRunService = {
      releaseForCaller: jest.fn().mockResolvedValue(undefined),
    };

    const service = new WorkflowRunWorkspaceService(
      {} as never,
      {} as never,
      { incrementCounterForEvent: jest.fn() } as never,
      {} as never,
      { cancelRunWaits: jest.fn().mockResolvedValue(undefined) } as never,
      agentRunService as never,
    );

    // The run lock serializes these methods with every other step write.
    Object.assign(service, {
      cacheLockService: {
        withLock: jest.fn().mockImplementation((work) => work()),
      },
    });

    const step = {
      id: 'step-id',
      name: 'Ask',
      type: WorkflowActionType.AI_AGENT,
    };
    const workflowRun: {
      id: string;
      status: WorkflowRunStatus;
      state: {
        flow: { steps: { id: string; name: string; type: string }[] };
        stepInfos: Record<string, Record<string, unknown>>;
      };
    } = {
      id: 'workflow-run-id',
      status,
      state: { flow: { steps: [step] }, stepInfos: { 'step-id': stepInfo } },
    };

    jest
      .spyOn(service, 'getWorkflowRunOrFail')
      .mockResolvedValue(workflowRun as never);

    const updateWorkflowRun = jest
      .spyOn(service, 'updateWorkflowRun')
      .mockResolvedValue(undefined);

    return {
      service,
      step,
      workflowRun,
      agentRunService,
      updateWorkflowRun,
    };
  };

  describe('updateStepInfoIfPending', () => {
    const claim = (service: WorkflowRunWorkspaceService) =>
      service.updateStepInfoIfPending({
        stepId: 'step-id',
        stepInfo: { status: StepStatus.SUCCESS },
        workflowRunId: 'workflow-run-id',
        workspaceId: 'workspace-id',
      });

    it('claims a PENDING step only once', async () => {
      const { service, updateWorkflowRun } = buildService({
        stepInfo: { status: StepStatus.PENDING, threadId: 'other-thread' },
      });
      updateWorkflowRun.mockImplementation(async ({ partialUpdate }) => {
        jest.spyOn(service, 'getWorkflowRunOrFail').mockResolvedValue({
          id: 'workflow-run-id',
          status: WorkflowRunStatus.RUNNING,
          state: partialUpdate.state,
        } as never);
      });

      expect(await claim(service)).toBe(true);
      expect(await claim(service)).toBe(false);
      expect(updateWorkflowRun).toHaveBeenCalledTimes(1);
    });
  });

  describe('endWorkflowRun', () => {
    const endRun = (service: WorkflowRunWorkspaceService) =>
      service.endWorkflowRun({
        workflowRunId: 'workflow-run-id',
        workspaceId: 'workspace-id',
        status: WorkflowRunStatus.STOPPED,
      });

    it('drops the runs its steps wait on and closes the calls they wait on', async () => {
      const { service, agentRunService } = buildService();

      await endRun(service);

      expect(agentRunService.releaseForCaller).toHaveBeenCalledWith({
        workspaceId: 'workspace-id',
        caller: {
          type: 'WORKFLOW_STEP',
          ref: { workflowRunId: 'workflow-run-id' },
        },
      });
    });

    it('still ends the run when its conversations cannot be closed', async () => {
      const { service, agentRunService, updateWorkflowRun } =
        buildService();

      agentRunService.releaseForCaller.mockRejectedValue(
        new Error('db down'),
      );

      await endRun(service);

      expect(updateWorkflowRun).toHaveBeenCalled();
    });
  });
});
