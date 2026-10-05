import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
import { WorkflowAgentConversationWorkspaceService } from 'src/modules/workflow/workflow-executor/workflow-actions/ai-agent/services/workflow-agent-conversation.workspace-service';

const RUN_INFO = { workspaceId: 'workspace-id', workflowRunId: 'run-id' };
const SENDER = {
  type: 'workflow' as const,
  workflowId: 'workflow-id',
  workflowName: 'New deals',
};
const PRIOR_MESSAGES = [{ id: 'message-id', role: 'assistant', parts: [] }];

const OPEN_ARGS = {
  runInfo: RUN_INFO,
  stepId: 'step-id',
  title: 'Draft the quote',
  threadKey: 'run-id:step-id',
};

const buildService = ({
  creatorWorkspaceMemberId = 'creator-id' as string | null,
  isCreated = true,
} = {}) => {
  const messagePartRepository = { update: jest.fn() };
  const messageRepository = { find: jest.fn().mockResolvedValue([]) };
  const agentInboxService = {
    openThread: jest.fn().mockImplementation(({ workspaceMemberId }) =>
      Promise.resolve({
        thread: { id: `thread-for-${workspaceMemberId ?? 'nobody'}` },
        isCreated,
      }),
    ),
  };
  const conversationReaderService = {
    loadMessages: jest.fn().mockResolvedValue(PRIOR_MESSAGES),
  };
  const workflowRunWorkspaceService = {
    setStepThreadId: jest.fn().mockResolvedValue(undefined),
  };
  const workflowRunRecordShareService = {
    findCreatorWorkspaceMemberId: jest
      .fn()
      .mockResolvedValue(creatorWorkspaceMemberId),
  };

  const service = new WorkflowAgentConversationWorkspaceService(
    messageRepository as never,
    messagePartRepository as never,
    agentInboxService as never,
    conversationReaderService as never,
    {} as never,
    {} as never,
    {
      findRunSenderOrThrow: jest.fn().mockResolvedValue(SENDER),
    } as never,
    workflowRunWorkspaceService as never,
    workflowRunRecordShareService as never,
  );

  return {
    service,
    agentInboxService,
    conversationReaderService,
    messageRepository,
    messagePartRepository,
    workflowRunWorkspaceService,
  };
};

describe('WorkflowAgentConversationWorkspaceService', () => {
  describe('openConversation', () => {
    it('opens the conversation with the recipient the step names, filed under done', async () => {
      const { service, agentInboxService, workflowRunWorkspaceService } =
        buildService();

      const conversation = await service.openConversation({
        ...OPEN_ARGS,
        recipientWorkspaceMemberId: 'recipient-id',
      });

      expect(conversation).toEqual({
        threadId: 'thread-for-recipient-id',
        priorMessages: [],
      });
      expect(agentInboxService.openThread).toHaveBeenCalledWith({
        workspaceId: 'workspace-id',
        sender: SENDER,
        workspaceMemberId: 'recipient-id',
        threadKey: 'run-id:step-id',
        title: 'Draft the quote',
        isArchivedOnCreate: true,
      });
      expect(workflowRunWorkspaceService.setStepThreadId).toHaveBeenCalledWith({
        stepId: 'step-id',
        threadId: 'thread-for-recipient-id',
        workflowRunId: 'run-id',
        workspaceId: 'workspace-id',
      });
    });

    it("falls back to the workflow creator's inbox when the step names no recipient", async () => {
      const { service } = buildService();

      await expect(
        service.openConversation({
          ...OPEN_ARGS,
          recipientWorkspaceMemberId: null,
        }),
      ).resolves.toMatchObject({ threadId: 'thread-for-creator-id' });
    });

    it('keeps a conversation no inbox receives when the creator cannot have it', async () => {
      const { service, agentInboxService } = buildService();

      agentInboxService.openThread.mockRejectedValueOnce(
        new AiException(
          'Thread owner is no longer a workspace member',
          AiExceptionCode.THREAD_NOT_FOUND,
        ),
      );

      await expect(
        service.openConversation({
          ...OPEN_ARGS,
          recipientWorkspaceMemberId: null,
        }),
      ).resolves.toMatchObject({ threadId: 'thread-for-nobody' });
    });

    it('keeps a conversation no inbox receives for a workflow without a member creator', async () => {
      const { service } = buildService({ creatorWorkspaceMemberId: null });

      await expect(
        service.openConversation({
          ...OPEN_ARGS,
          recipientWorkspaceMemberId: null,
        }),
      ).resolves.toMatchObject({ threadId: 'thread-for-nobody' });
    });

    it('fails when the named recipient cannot have the conversation', async () => {
      const { service, agentInboxService } = buildService();

      agentInboxService.openThread.mockRejectedValueOnce(
        new AiException(
          'Thread owner is no longer a workspace member',
          AiExceptionCode.THREAD_NOT_FOUND,
        ),
      );

      await expect(
        service.openConversation({
          ...OPEN_ARGS,
          recipientWorkspaceMemberId: 'recipient-id',
        }),
      ).rejects.toMatchObject({ code: AiExceptionCode.THREAD_NOT_FOUND });
    });

    it('continues from what an existing conversation holds', async () => {
      const { service, conversationReaderService } = buildService({
        isCreated: false,
      });

      await expect(
        service.openConversation({
          ...OPEN_ARGS,
          recipientWorkspaceMemberId: 'recipient-id',
        }),
      ).resolves.toEqual({
        threadId: 'thread-for-recipient-id',
        priorMessages: PRIOR_MESSAGES,
      });
      expect(conversationReaderService.loadMessages).toHaveBeenCalledWith({
        workspaceId: 'workspace-id',
        threadId: 'thread-for-recipient-id',
      });
    });
  });

  describe('recordWaitOutcome', () => {
    const waitPart = (id: string, workflowStep: Record<string, string>) => ({
      id,
      toolName: 'wait_for_duration',
      toolOutput: { result: { status: 'pending' }, workflowStep },
    });

    it("settles the step's own wait, not another run's waiting in the same conversation", async () => {
      const { service, messageRepository, messagePartRepository } =
        buildService();

      messageRepository.find.mockResolvedValue([
        {
          parts: [
            waitPart('other-run-part', {
              workflowRunId: 'other-run-id',
              stepId: 'step-id',
            }),
          ],
        },
        {
          parts: [
            waitPart('own-part', {
              workflowRunId: 'run-id',
              stepId: 'step-id',
            }),
          ],
        },
      ]);

      await service.recordWaitOutcome({
        workspaceId: 'workspace-id',
        threadId: 'thread-id',
        workflowStep: { workflowRunId: 'run-id', stepId: 'step-id' },
        toolOutput: { success: true },
      });

      expect(messagePartRepository.update).toHaveBeenCalledWith(
        'workspace-id',
        { id: 'own-part' },
        { toolOutput: { success: true } },
      );
    });

    it('refuses to settle a wait the step never posted', async () => {
      const { service, messageRepository } = buildService();

      messageRepository.find.mockResolvedValue([
        {
          parts: [
            waitPart('other-run-part', {
              workflowRunId: 'other-run-id',
              stepId: 'step-id',
            }),
          ],
        },
      ]);

      await expect(
        service.recordWaitOutcome({
          workspaceId: 'workspace-id',
          threadId: 'thread-id',
          workflowStep: { workflowRunId: 'run-id', stepId: 'step-id' },
          toolOutput: { success: true },
        }),
      ).rejects.toMatchObject({ code: AiExceptionCode.TOOL_CALL_NOT_FOUND });
    });
  });
});
