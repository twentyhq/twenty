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
          toolName: 'ask_questions',
          toolInput: { questions: QUESTIONS },
          toolOutput: { result: { questions: QUESTIONS, status: 'pending' } },
        },
      ]),
      update: jest.fn().mockResolvedValue({ affected: 1 }),
    };
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
    const workflowRun = {
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
    ])('claims nothing when %s', async (_description, overrides) => {
      const { service, updateWorkflowRun } = buildService(overrides);

      expect(await claimInConversation(service)).toBe(false);
      expect(updateWorkflowRun).not.toHaveBeenCalled();
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
      expect(messagePartRepository.update).toHaveBeenCalledWith(
        'workspace-id',
        { id: 'part-id' },
        {
          toolOutput: expect.objectContaining({
            result: { questions: QUESTIONS, status: 'skipped' },
          }),
        },
      );
    });

    it('leaves a conversation to the answer holding its claim', async () => {
      const { service, threadRepository, messagePartRepository } =
        buildService();

      threadRepository.update.mockResolvedValue({ affected: 0 });

      await endRun(service);

      expect(messagePartRepository.update).not.toHaveBeenCalled();
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
