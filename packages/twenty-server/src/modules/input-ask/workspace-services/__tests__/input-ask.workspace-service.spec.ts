import { IsNull, Not } from 'typeorm';

import {
  TwentyOrmException,
  TwentyOrmExceptionCode,
} from 'src/engine/twenty-orm/exceptions/twenty-orm.exception';
import { InputAskStatus } from 'src/modules/input-ask/enums/input-ask-status.enum';
import { InputAskWorkspaceService } from 'src/modules/input-ask/workspace-services/input-ask.workspace-service';

const QUESTIONS_FORM = {
  questions: [
    {
      header: 'Plan',
      question: 'Which plan?',
      options: [{ label: 'Pro' }, { label: 'Team' }],
    },
  ],
};

describe('InputAskWorkspaceService', () => {
  const buildService = ({ hasInputAskObject = true } = {}) => {
    const inputAskRepository = {
      insert: jest.fn().mockResolvedValue(undefined),
      update: jest.fn().mockResolvedValue({ affected: 1 }),
      findOne: jest.fn().mockResolvedValue(null),
    };
    const workspaceOrmManager = {
      executeInWorkspaceContext: jest.fn().mockImplementation((work) => work()),
      getRepository: jest.fn().mockReturnValue(inputAskRepository),
      getRepositoryWithContextPermissions: jest
        .fn()
        .mockReturnValue(inputAskRepository),
    };
    const recordPositionService = {
      buildRecordPosition: jest.fn().mockResolvedValue(-1),
    };
    const workspaceCacheService = {
      getOrRecompute: jest.fn().mockResolvedValue({
        flatObjectMetadataMaps: {
          byUniversalIdentifier: hasInputAskObject
            ? new Proxy({}, { get: () => ({ id: 'input-ask-object-id' }) })
            : {},
        },
      }),
    };

    const service = new InputAskWorkspaceService(
      workspaceOrmManager as never,
      recordPositionService as never,
      workspaceCacheService as never,
    );

    return { service, inputAskRepository, workspaceOrmManager };
  };

  describe('open', () => {
    const toolCallAsk = {
      name: 'Which plan?',
      form: QUESTIONS_FORM,
      threadId: 'thread-id',
      toolCallId: 'tool-call-id',
      assigneeId: 'member-id',
    };

    it('inserts a pending Ask', async () => {
      const { service, inputAskRepository } = buildService();

      await service.open({ workspaceId: 'workspace-id', inputAsk: toolCallAsk });

      expect(inputAskRepository.insert).toHaveBeenCalledWith({
        ...toolCallAsk,
        status: InputAskStatus.PENDING,
        position: -1,
      });
      expect(inputAskRepository.update).not.toHaveBeenCalled();
    });

    it('asks a form step again when the run re-enters it', async () => {
      const { service, inputAskRepository } = buildService();

      inputAskRepository.insert.mockRejectedValue(
        new TwentyOrmException(
          'duplicate',
          TwentyOrmExceptionCode.DUPLICATE_ENTRY_DETECTED,
        ),
      );

      await service.open({
        workspaceId: 'workspace-id',
        inputAsk: {
          name: 'Approve',
          form: { fields: [] },
          workflowRunId: 'workflow-run-id',
          stepId: 'step-id',
          assigneeId: null,
        },
      });

      expect(inputAskRepository.update).toHaveBeenCalledWith(
        {
          workflowRunId: 'workflow-run-id',
          stepId: 'step-id',
          toolCallId: IsNull(),
          status: Not(InputAskStatus.PENDING),
        },
        {
          name: 'Approve',
          form: { fields: [] },
          status: InputAskStatus.PENDING,
          response: null,
          answeredAt: null,
        },
      );
    });

    it('rethrows any other write failure', async () => {
      const { service, inputAskRepository } = buildService();

      inputAskRepository.insert.mockRejectedValue(new Error('db down'));

      await expect(
        service.open({ workspaceId: 'workspace-id', inputAsk: toolCallAsk }),
      ).rejects.toThrow('db down');
    });

    it('refuses to pause a tool call in a workspace without Asks yet', async () => {
      const { service, inputAskRepository } = buildService({
        hasInputAskObject: false,
      });

      await expect(
        service.open({ workspaceId: 'workspace-id', inputAsk: toolCallAsk }),
      ).rejects.toMatchObject({ code: 'INPUT_ASK_OBJECT_MISSING' });
      expect(inputAskRepository.insert).not.toHaveBeenCalled();
    });

    it('lets a form step wait without an Ask in a workspace without Asks yet', async () => {
      const { service, inputAskRepository } = buildService({
        hasInputAskObject: false,
      });

      await service.open({
        workspaceId: 'workspace-id',
        inputAsk: {
          name: 'Approve',
          form: { fields: [] },
          workflowRunId: 'workflow-run-id',
          stepId: 'step-id',
          assigneeId: null,
        },
      });

      expect(inputAskRepository.insert).not.toHaveBeenCalled();
    });
  });

  describe('answer', () => {
    it('answers only a pending Ask, reporting whether it was the one to answer it', async () => {
      const { service, inputAskRepository } = buildService();

      inputAskRepository.update
        .mockResolvedValueOnce({ affected: 1 })
        .mockResolvedValueOnce({ affected: 0 });

      const answer = () =>
        service.answer({
          workspaceId: 'workspace-id',
          key: { threadId: 'thread-id', toolCallId: 'tool-call-id' },
          response: { answers: [] },
        });

      expect(await answer()).toBe(true);
      expect(await answer()).toBe(false);
      expect(inputAskRepository.update).toHaveBeenCalledWith(
        {
          threadId: 'thread-id',
          toolCallId: 'tool-call-id',
          status: InputAskStatus.PENDING,
        },
        {
          status: InputAskStatus.ANSWERED,
          response: { answers: [] },
          answeredAt: expect.any(String),
        },
      );
    });
  });

  describe('cancel', () => {
    it('cancels one pending Ask by its key', async () => {
      const { service, inputAskRepository } = buildService();

      expect(
        await service.cancel({
          workspaceId: 'workspace-id',
          match: { threadId: 'thread-id', toolCallId: 'tool-call-id' },
        }),
      ).toBe(true);
      expect(inputAskRepository.update).toHaveBeenCalledWith(
        {
          threadId: 'thread-id',
          toolCallId: 'tool-call-id',
          status: InputAskStatus.PENDING,
        },
        { status: InputAskStatus.CANCELED },
      );
    });

    it('cancels what an ended run left pending without failing the run', async () => {
      const { service, inputAskRepository } = buildService();

      inputAskRepository.update.mockRejectedValue(new Error('db down'));

      expect(
        await service.cancel({
          workspaceId: 'workspace-id',
          match: { workflowRunId: 'workflow-run-id' },
        }),
      ).toBe(false);
      expect(inputAskRepository.update).toHaveBeenCalledWith(
        { workflowRunId: 'workflow-run-id', status: InputAskStatus.PENDING },
        { status: InputAskStatus.CANCELED },
      );
    });

    it('surfaces a failure to cancel a single Ask', async () => {
      const { service, inputAskRepository } = buildService();

      inputAskRepository.update.mockRejectedValue(new Error('db down'));

      await expect(
        service.cancel({
          workspaceId: 'workspace-id',
          match: { threadId: 'thread-id', toolCallId: 'tool-call-id' },
        }),
      ).rejects.toThrow('db down');
    });
  });
});
