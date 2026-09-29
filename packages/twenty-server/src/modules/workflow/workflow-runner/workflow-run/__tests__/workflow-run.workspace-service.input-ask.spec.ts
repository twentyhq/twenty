import { FieldActorSource } from 'twenty-shared/types';
import { StepStatus } from 'twenty-shared/workflow';

import { WorkflowRunStatus } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { WorkflowRunWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.workspace-service';

const QUESTIONS_FORM = {
  questions: [
    {
      header: 'Plan',
      question: 'Which plan?',
      options: [{ label: 'Pro' }, { label: 'Team' }],
    },
  ],
};

describe('WorkflowRunWorkspaceService Ask lifecycle', () => {
  const buildService = ({
    status = WorkflowRunStatus.RUNNING,
    stepInfo = {
      status: StepStatus.PENDING,
      threadId: 'thread-id',
    } as Record<string, unknown>,
    hasAnswered = true,
  } = {}) => {
    const inputAskWorkspaceService = {
      open: jest.fn().mockResolvedValue(undefined),
      answer: jest.fn().mockResolvedValue(hasAnswered),
      cancel: jest.fn().mockResolvedValue(true),
    };
    const service = new WorkflowRunWorkspaceService(
      {} as never,
      {} as never,
      { incrementCounterForEvent: jest.fn() } as never,
      inputAskWorkspaceService as never,
      {} as never,
    );

    // The run lock serializes these methods with every other step write.
    Object.assign(service, {
      cacheLockService: {
        withLock: jest.fn().mockImplementation((work) => work()),
      },
    });

    const workflowRun = {
      id: 'workflow-run-id',
      status,
      createdBy: {
        source: FieldActorSource.MANUAL,
        workspaceMemberId: 'initiator-member-id',
      },
      state: { flow: { steps: [] }, stepInfos: { 'step-id': stepInfo } },
    };

    jest
      .spyOn(service, 'getWorkflowRunOrFail')
      .mockResolvedValue(workflowRun as never);

    const updateWorkflowRun = jest
      .spyOn(service, 'updateWorkflowRun')
      .mockResolvedValue(undefined);

    return { service, inputAskWorkspaceService, updateWorkflowRun };
  };

  describe('resolveStepAwaitingToolCall', () => {
    const resolveArguments = {
      threadId: 'thread-id',
      toolCallId: 'tool-call-id',
      response: { answers: [] },
      workflowRunId: 'workflow-run-id',
      workspaceId: 'workspace-id',
    };

    it('answers the Ask and hands the step back to the executor', async () => {
      const { service, inputAskWorkspaceService, updateWorkflowRun } =
        buildService();

      expect(await service.resolveStepAwaitingToolCall(resolveArguments)).toEqual(
        { status: 'RESOLVED', stepId: 'step-id' },
      );
      expect(inputAskWorkspaceService.answer).toHaveBeenCalledWith({
        workspaceId: 'workspace-id',
        key: { threadId: 'thread-id', toolCallId: 'tool-call-id' },
        response: { answers: [] },
      });
      expect(updateWorkflowRun).toHaveBeenCalledWith(
        expect.objectContaining({
          partialUpdate: {
            state: expect.objectContaining({
              stepInfos: {
                'step-id': {
                  status: StepStatus.NOT_STARTED,
                  threadId: 'thread-id',
                },
              },
            }),
          },
        }),
      );
    });

    it('moves nothing when another answer already claimed the Ask', async () => {
      const { service, updateWorkflowRun } = buildService({
        hasAnswered: false,
      });

      expect(await service.resolveStepAwaitingToolCall(resolveArguments)).toEqual(
        { status: 'NOT_AWAITING' },
      );
      expect(updateWorkflowRun).not.toHaveBeenCalled();
    });

    it.each([
      ['the run is stopping', { status: WorkflowRunStatus.STOPPING }],
      [
        'the step already moved on',
        { stepInfo: { status: StepStatus.SUCCESS, threadId: 'thread-id' } },
      ],
      [
        'a retry replaced the conversation',
        { stepInfo: { status: StepStatus.PENDING, threadId: 'other-thread' } },
      ],
      [
        'the step waits on a retry',
        {
          stepInfo: {
            status: StepStatus.PENDING,
            threadId: 'thread-id',
            error: 'boom',
          },
        },
      ],
    ])(
      'answers nothing when %s',
      async (_description, overrides) => {
        const { service, inputAskWorkspaceService, updateWorkflowRun } =
          buildService(overrides);

        expect(
          await service.resolveStepAwaitingToolCall(resolveArguments),
        ).toEqual({ status: 'NOT_AWAITING' });
        expect(inputAskWorkspaceService.answer).not.toHaveBeenCalled();
        expect(updateWorkflowRun).not.toHaveBeenCalled();
      },
    );
  });

  describe('updateWorkflowRunStepInfo', () => {
    it('opens the Ask of a step it parks, assigned to whoever started the run', async () => {
      const { service, inputAskWorkspaceService, updateWorkflowRun } =
        buildService({ stepInfo: { status: StepStatus.RUNNING } });

      await service.updateWorkflowRunStepInfo({
        stepId: 'step-id',
        stepInfo: { status: StepStatus.PENDING },
        pendingAsk: {
          name: 'Which plan?',
          form: QUESTIONS_FORM,
          threadId: 'thread-id',
          toolCallId: 'tool-call-id',
        },
        workflowRunId: 'workflow-run-id',
        workspaceId: 'workspace-id',
      });

      expect(inputAskWorkspaceService.open).toHaveBeenCalledWith({
        workspaceId: 'workspace-id',
        inputAsk: {
          name: 'Which plan?',
          form: QUESTIONS_FORM,
          threadId: 'thread-id',
          toolCallId: 'tool-call-id',
          workflowRunId: 'workflow-run-id',
          stepId: 'step-id',
          assigneeId: 'initiator-member-id',
        },
      });
      expect(
        inputAskWorkspaceService.open.mock.invocationCallOrder[0],
      ).toBeLessThan(updateWorkflowRun.mock.invocationCallOrder[0]);
    });

    it('does not park the step when its Ask cannot be opened', async () => {
      const { service, inputAskWorkspaceService, updateWorkflowRun } =
        buildService({ stepInfo: { status: StepStatus.RUNNING } });

      inputAskWorkspaceService.open.mockRejectedValue(new Error('db down'));

      await expect(
        service.updateWorkflowRunStepInfo({
          stepId: 'step-id',
          stepInfo: { status: StepStatus.PENDING },
          pendingAsk: { name: 'Approve', form: { fields: [] } },
          workflowRunId: 'workflow-run-id',
          workspaceId: 'workspace-id',
        }),
      ).rejects.toThrow('db down');
      expect(updateWorkflowRun).not.toHaveBeenCalled();
    });

    it('opens no Ask for a step that does not wait on a person', async () => {
      const { service, inputAskWorkspaceService } = buildService({
        stepInfo: { status: StepStatus.RUNNING },
      });

      await service.updateWorkflowRunStepInfo({
        stepId: 'step-id',
        stepInfo: { status: StepStatus.SUCCESS, result: {} },
        workflowRunId: 'workflow-run-id',
        workspaceId: 'workspace-id',
      });

      expect(inputAskWorkspaceService.open).not.toHaveBeenCalled();
    });
  });

  describe('updateStepInfoIfPending', () => {
    it('answers the form Ask in the write that accepts the submission', async () => {
      const { service, inputAskWorkspaceService, updateWorkflowRun } =
        buildService({ stepInfo: { status: StepStatus.PENDING } });

      expect(
        await service.updateStepInfoIfPending({
          stepId: 'step-id',
          stepInfo: { status: StepStatus.SUCCESS, result: { name: 'Tim' } },
          inputAskResponse: { name: 'Tim' },
          workflowRunId: 'workflow-run-id',
          workspaceId: 'workspace-id',
        }),
      ).toBe(true);
      expect(inputAskWorkspaceService.answer).toHaveBeenCalledWith({
        workspaceId: 'workspace-id',
        key: { workflowRunId: 'workflow-run-id', stepId: 'step-id' },
        response: { name: 'Tim' },
      });
      expect(updateWorkflowRun).toHaveBeenCalled();
    });

    it('answers nothing for a refused submission', async () => {
      const { service, inputAskWorkspaceService } = buildService({
        stepInfo: { status: StepStatus.SUCCESS },
      });

      expect(
        await service.updateStepInfoIfPending({
          stepId: 'step-id',
          stepInfo: { status: StepStatus.SUCCESS },
          inputAskResponse: { name: 'Tim' },
          workflowRunId: 'workflow-run-id',
          workspaceId: 'workspace-id',
        }),
      ).toBe(false);
      expect(inputAskWorkspaceService.answer).not.toHaveBeenCalled();
    });
  });

  describe('endWorkflowRun', () => {
    it('cancels what the run leaves pending', async () => {
      const { service, inputAskWorkspaceService } = buildService();

      await service.endWorkflowRun({
        workflowRunId: 'workflow-run-id',
        workspaceId: 'workspace-id',
        status: WorkflowRunStatus.STOPPED,
      });

      expect(inputAskWorkspaceService.cancel).toHaveBeenCalledWith({
        workspaceId: 'workspace-id',
        match: { workflowRunId: 'workflow-run-id' },
      });
    });
  });
});
