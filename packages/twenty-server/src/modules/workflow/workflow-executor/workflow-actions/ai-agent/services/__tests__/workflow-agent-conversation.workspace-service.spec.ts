import { FieldActorSource } from 'twenty-shared/types';

import { WorkflowAgentConversationWorkspaceService } from 'src/modules/workflow/workflow-executor/workflow-actions/ai-agent/services/workflow-agent-conversation.workspace-service';

const RUN_INFO = { workspaceId: 'workspace-id', workflowRunId: 'run-id' };
const SENDER = {
  type: 'workflow' as const,
  workflowId: 'workflow-id',
  workflowName: 'New deals',
};

const OPEN_ARGS = {
  runInfo: RUN_INFO,
  stepId: 'step-id',
  title: 'Draft the quote',
  threadKey: 'run-id:step-id',
};

const buildService = () => {
  const agentCallerConversationService = {
    openConversation: jest.fn().mockResolvedValue({
      status: 'OPENED',
      threadId: 'thread-id',
      isCreated: true,
    }),
  };
  const workflowRunRecordShareService = {
    findCreatorWorkspaceMemberId: jest.fn().mockResolvedValue('creator-id'),
  };

  const service = new WorkflowAgentConversationWorkspaceService(
    agentCallerConversationService as never,
    {
      findRunSenderOrThrow: jest.fn().mockResolvedValue(SENDER),
    } as never,
    workflowRunRecordShareService as never,
  );

  return {
    service,
    agentCallerConversationService,
    workflowRunRecordShareService,
  };
};

describe('WorkflowAgentConversationWorkspaceService', () => {
  describe('openConversation', () => {
    it('opens the conversation with the recipient the step names', async () => {
      const {
        service,
        agentCallerConversationService,
        workflowRunRecordShareService,
      } = buildService();

      await expect(
        service.openConversation({
          ...OPEN_ARGS,
          recipientWorkspaceMemberId: 'recipient-id',
        }),
      ).resolves.toMatchObject({ threadId: 'thread-id', isCreated: true });

      expect(
        agentCallerConversationService.openConversation,
      ).toHaveBeenCalledWith({
        workspaceId: 'workspace-id',
        sender: SENDER,
        title: 'Draft the quote',
        threadKey: 'run-id:step-id',
        fallbackThreadKey: 'run-id:step-id:run-id:step-id',
        recipientWorkspaceMemberId: 'recipient-id',
        fallbackRecipientWorkspaceMemberId: null,
      });
      expect(
        workflowRunRecordShareService.findCreatorWorkspaceMemberId,
      ).not.toHaveBeenCalled();
    });

    it("falls back to the workflow creator's inbox when the step names no recipient", async () => {
      const { service, agentCallerConversationService } = buildService();

      await service.openConversation({
        ...OPEN_ARGS,
        recipientWorkspaceMemberId: null,
      });

      expect(
        agentCallerConversationService.openConversation,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          recipientWorkspaceMemberId: null,
          fallbackRecipientWorkspaceMemberId: 'creator-id',
        }),
      );
    });

    it('fails when the recipient deleted the conversation', async () => {
      const { service, agentCallerConversationService } = buildService();

      agentCallerConversationService.openConversation.mockResolvedValue({
        status: 'DELETED',
      });

      await expect(
        service.openConversation({
          ...OPEN_ARGS,
          recipientWorkspaceMemberId: 'recipient-id',
        }),
      ).rejects.toThrow('The recipient deleted this conversation');
    });
  });

  describe('findTurnCreatedBy', () => {
    it('attributes turns to the workflow', async () => {
      const { service } = buildService();

      await expect(service.findTurnCreatedBy(RUN_INFO)).resolves.toEqual({
        source: FieldActorSource.WORKFLOW,
        name: 'New deals',
        workspaceMemberId: null,
        context: {},
      });
    });
  });
});
