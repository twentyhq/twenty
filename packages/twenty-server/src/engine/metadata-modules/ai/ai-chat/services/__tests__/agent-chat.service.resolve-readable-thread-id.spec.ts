import { AgentChatService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat.service';
import { AiExceptionCode } from 'src/engine/metadata-modules/ai/ai.exception';

const WORKSPACE = {
  id: 'workspace-id',
  workspaceCustomApplicationId: 'custom',
};
const APPLICATION = { id: 'application-id' };
const BY_KEY = {
  agentUniversalIdentifier: 'agent-universal-identifier',
  threadKey: 'deal-42',
};

const buildService = () => {
  const sharingService = {
    getReadableThread: jest.fn().mockResolvedValue({ id: 'thread-id' }),
  };
  const agentRunService = {
    resolveConversationThreadIdOrThrow: jest
      .fn()
      .mockResolvedValue('keyed-thread-id'),
  };
  const service = new AgentChatService(
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    sharingService as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    agentRunService as never,
  );

  return { service, sharingService, agentRunService };
};

describe('AgentChatService resolveReadableThreadIdOrThrow', () => {
  it('resolves the conversation an application names by its agent and key', async () => {
    const { service, agentRunService, sharingService } = buildService();

    await expect(
      service.resolveReadableThreadIdOrThrow({
        workspace: WORKSPACE,
        callerApplication: APPLICATION as never,
        workspaceMemberId: undefined,
        conversation: BY_KEY,
      }),
    ).resolves.toBe('keyed-thread-id');
    expect(
      agentRunService.resolveConversationThreadIdOrThrow,
    ).toHaveBeenCalledWith({
      workspace: WORKSPACE,
      callerApplication: APPLICATION,
      ...BY_KEY,
    });
    expect(sharingService.getReadableThread).not.toHaveBeenCalled();
  });

  it('refuses a conversation named by key without an application', async () => {
    const { service } = buildService();

    await expect(
      service.resolveReadableThreadIdOrThrow({
        workspace: WORKSPACE,
        callerApplication: undefined,
        workspaceMemberId: 'member-id',
        conversation: BY_KEY,
      }),
    ).rejects.toMatchObject({ code: AiExceptionCode.INVALID_AGENT_INPUT });
  });

  it('refuses a thread id together with a key', async () => {
    const { service } = buildService();

    await expect(
      service.resolveReadableThreadIdOrThrow({
        workspace: WORKSPACE,
        callerApplication: APPLICATION as never,
        workspaceMemberId: undefined,
        conversation: { ...BY_KEY, threadId: 'thread-id' },
      }),
    ).rejects.toMatchObject({ code: AiExceptionCode.INVALID_AGENT_INPUT });
  });

  it('checks a thread id against the member, as the chat does', async () => {
    const { service, sharingService } = buildService();

    await expect(
      service.resolveReadableThreadIdOrThrow({
        workspace: WORKSPACE,
        callerApplication: undefined,
        workspaceMemberId: 'member-id',
        conversation: { threadId: 'thread-id' },
      }),
    ).resolves.toBe('thread-id');
    expect(sharingService.getReadableThread).toHaveBeenCalledWith({
      workspaceId: WORKSPACE.id,
      threadId: 'thread-id',
      workspaceMemberId: 'member-id',
    });
  });

  it('refuses a thread id without a member', async () => {
    const { service, sharingService } = buildService();

    await expect(
      service.resolveReadableThreadIdOrThrow({
        workspace: WORKSPACE,
        callerApplication: APPLICATION as never,
        workspaceMemberId: undefined,
        conversation: { threadId: 'thread-id' },
      }),
    ).rejects.toMatchObject({ code: AiExceptionCode.THREAD_NOT_FOUND });
    expect(sharingService.getReadableThread).not.toHaveBeenCalled();
  });
});
