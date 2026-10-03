import { StepStatus } from 'twenty-shared/workflow';
import { IsNull } from 'typeorm';

import { WorkflowRunStatus } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { WorkflowRunWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.workspace-service';

const QUESTIONS = [
  {
    header: 'Plan',
    question: 'Which plan?',
    options: [{ label: 'Pro' }, { label: 'Team' }],
  },
];

describe('WorkflowRunWorkspaceService conversations', () => {
  const buildService = ({
    status = WorkflowRunStatus.RUNNING,
    stepInfo = {
      status: StepStatus.PENDING,
      threadId: 'thread-id',
    } as Record<string, unknown>,
  } = {}) => {
    const threadRepository = {
      find: jest
        .fn()
        .mockResolvedValue([
          { id: 'thread-id', pendingQuestionMessageId: 'message-id' },
        ]),
      update: jest.fn().mockResolvedValue({ affected: 1 }),
    };
    const messagePartRepository = {
      find: jest.fn().mockResolvedValue([
        {
          id: 'part-id',
          toolName: 'ask_question',
          toolInput: QUESTIONS[0],
          toolOutput: { result: { question: QUESTIONS[0], status: 'pending' } },
        },
      ]),
      writePart: jest.fn(),
      query: jest.fn(),
    };

    messagePartRepository.query.mockImplementation(async (_workspaceId, run) =>
      run({
        table: (name: string) => name,
        manager: { query: messagePartRepository.writePart },
      }),
    );
    const service = new WorkflowRunWorkspaceService(
      {} as never,
      {} as never,
      { incrementCounterForEvent: jest.fn() } as never,
      {} as never,
      threadRepository as never,
      messagePartRepository as never,
    );

    // The run lock serializes these methods with every other step write.
    Object.assign(service, {
      cacheLockService: {
        withLock: jest.fn().mockImplementation((work) => work()),
      },
    });

    const step = { id: 'step-id', name: 'Ask' };
    const workflowRun: {
      id: string;
      status: WorkflowRunStatus;
      state: {
        flow: { steps: { id: string; name: string }[] };
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
      threadRepository,
      messagePartRepository,
      updateWorkflowRun,
    };
  };

  describe('findStepAwaitingAnswer', () => {
    const findStep = (service: WorkflowRunWorkspaceService) =>
      service.findStepAwaitingAnswer({
        threadId: 'thread-id',
        workflowRunId: 'workflow-run-id',
        workspaceId: 'workspace-id',
      });

    it('finds the PENDING step whose current execution holds the conversation', async () => {
      const { service, step } = buildService();

      expect(await findStep(service)).toEqual(step);
    });

    it('finds the step a call names among steps sharing one inbox conversation', async () => {
      const { service, workflowRun } = buildService();
      const approvalStep = { id: 'second-step-id', name: 'Approve' };

      workflowRun.state = {
        flow: { steps: [...workflowRun.state.flow.steps, approvalStep] },
        stepInfos: {
          'step-id': { status: StepStatus.SUCCESS, threadId: 'thread-id' },
          'second-step-id': {
            status: StepStatus.PENDING,
            threadId: 'thread-id',
          },
        },
      };

      const findNamedStep = (expectedStepId: string) =>
        service.findStepAwaitingAnswer({
          threadId: 'thread-id',
          workflowRunId: 'workflow-run-id',
          workspaceId: 'workspace-id',
          expectedStepId,
        });

      expect(await findNamedStep('second-step-id')).toEqual(approvalStep);
      expect(await findNamedStep('step-id')).toBeNull();
      expect(await findStep(service)).toEqual(approvalStep);
    });

    it.each([
      ['the run is no longer running', { status: WorkflowRunStatus.STOPPED }],
      [
        'the step already resumed',
        { stepInfo: { status: StepStatus.RUNNING, threadId: 'thread-id' } },
      ],
      [
        'a retry or a loop iteration replaced the conversation',
        { stepInfo: { status: StepStatus.PENDING, threadId: 'other-thread' } },
      ],
      [
        'the step failed while waiting',
        {
          stepInfo: {
            status: StepStatus.PENDING,
            threadId: 'thread-id',
            error: 'boom',
          },
        },
      ],
    ])('finds nothing when %s', async (_description, overrides) => {
      const { service } = buildService(overrides);

      expect(await findStep(service)).toBeNull();
    });
  });

  describe('updateStepInfoIfPending in a conversation', () => {
    const claimInConversation = (service: WorkflowRunWorkspaceService) =>
      service.updateStepInfoIfPending({
        stepId: 'step-id',
        stepInfo: { status: StepStatus.RUNNING },
        expectedThreadId: 'thread-id',
        workflowRunId: 'workflow-run-id',
        workspaceId: 'workspace-id',
      });

    it('claims a PENDING step still holding the expected conversation', async () => {
      const { service, updateWorkflowRun } = buildService();

      expect(await claimInConversation(service)).toBe(true);
      expect(updateWorkflowRun).toHaveBeenCalledWith(
        expect.objectContaining({
          partialUpdate: {
            state: expect.objectContaining({
              stepInfos: {
                'step-id': {
                  status: StepStatus.RUNNING,
                  threadId: 'thread-id',
                },
              },
            }),
          },
        }),
      );
    });

    it.each([
      ['the run is no longer running', { status: WorkflowRunStatus.STOPPED }],
      [
        'the step already resumed',
        { stepInfo: { status: StepStatus.RUNNING, threadId: 'thread-id' } },
      ],
      [
        'the step holds another conversation',
        { stepInfo: { status: StepStatus.PENDING, threadId: 'other-thread' } },
      ],
      [
        'the step failed while waiting',
        {
          stepInfo: {
            status: StepStatus.PENDING,
            threadId: 'thread-id',
            error: 'boom',
          },
        },
      ],
    ])('claims nothing when %s', async (_description, overrides) => {
      const { service, updateWorkflowRun } = buildService(overrides);

      expect(await claimInConversation(service)).toBe(false);
      expect(updateWorkflowRun).not.toHaveBeenCalled();
    });
  });

  describe('updateStepInfoIfPending without an expected conversation', () => {
    const claim = (service: WorkflowRunWorkspaceService) =>
      service.updateStepInfoIfPending({
        stepId: 'step-id',
        stepInfo: { status: StepStatus.SUCCESS },
        workflowRunId: 'workflow-run-id',
        workspaceId: 'workspace-id',
      });

    it('claims a PENDING step whatever conversation it holds, only once', async () => {
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

    it('stops its conversations waiting and closes their calls as skipped', async () => {
      const { service, threadRepository, messagePartRepository } =
        buildService();

      await endRun(service);

      expect(threadRepository.update).toHaveBeenCalledWith(
        'workspace-id',
        {
          id: 'thread-id',
          pendingQuestionMessageId: 'message-id',
          activeStreamId: IsNull(),
        },
        { pendingQuestionMessageId: null },
      );
      const [[, [partId, closedToolOutput, expectedStatus]]] =
        messagePartRepository.writePart.mock.calls;

      expect({
        partId,
        result: JSON.parse(closedToolOutput).result,
        expectedStatus,
      }).toEqual({
        partId: 'part-id',
        result: { question: QUESTIONS[0], status: 'skipped' },
        expectedStatus: 'pending',
      });
    });

    it('leaves a conversation to the answer holding its claim', async () => {
      const { service, threadRepository, messagePartRepository } =
        buildService();

      threadRepository.update.mockResolvedValue({ affected: 0 });

      await endRun(service);

      expect(messagePartRepository.writePart).not.toHaveBeenCalled();
    });

    it('still ends the run when its conversations cannot be closed', async () => {
      const { service, threadRepository, updateWorkflowRun } = buildService();

      threadRepository.find.mockRejectedValue(new Error('db down'));

      await endRun(service);

      expect(updateWorkflowRun).toHaveBeenCalled();
    });

    it('leaves conversations alone for a run that never had one', async () => {
      const { service, threadRepository } = buildService({
        stepInfo: { status: StepStatus.SUCCESS },
      });

      await endRun(service);

      expect(threadRepository.find).not.toHaveBeenCalled();
    });
  });
});
