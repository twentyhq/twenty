import { QueryFailedError } from 'typeorm';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type ApplicationWorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { AgentInboxService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-inbox.service';
import { buildInboxMessageIds } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-inbox-message-ids.util';
import { buildInboxThreadId } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-inbox-thread-id.util';
import { buildInboxThreadMessageIds } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-inbox-thread-message-ids.util';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';

const SENDER = {
  type: 'workflow' as const,
  workflowId: 'workflow-id',
  workflowName: 'New deals',
};

const APPLICATION_SENDER = {
  type: 'application' as const,
  application: {
    id: 'application-id',
    name: 'Call recorder',
    defaultRoleId: 'role-id',
  } as FlatApplication,
};

const AUTH_CONTEXT = {
  type: 'application',
  application: APPLICATION_SENDER.application,
} as ApplicationWorkspaceAuthContext;

const OPEN_ARGS = {
  workspaceId: 'workspace-id',
  sender: SENDER,
  threadKey: 'run-id',
  title: 'Draft the quote',
};

const KEYED_INPUT = {
  addressing: { threadKey: 'run-id', title: 'Draft the quote' },
  idempotencyKey: 'step-id',
  text: 'Here is the quote',
  workspaceMemberIds: ['member-id', 'other-member-id'],
  mentionedWorkspaceMemberIds: [],
  recordTargets: [],
};

const EXISTING_INPUT = {
  ...KEYED_INPUT,
  addressing: { threadId: 'thread-id' },
  workspaceMemberIds: [],
};

const buildUniqueViolation = () =>
  Object.assign(new QueryFailedError('INSERT', [], new Error('duplicate')), {
    code: '23505',
  });

const buildService = () => {
  const threadRepository = {
    findOne: jest.fn().mockResolvedValue(null),
    findOneOrFail: jest
      .fn()
      .mockImplementation(
        (_workspaceId: string, { where }: { where: { id: string } }) =>
          Promise.resolve({ id: where.id, workspaceMemberId: null }),
      ),
    insert: jest.fn().mockResolvedValue(undefined),
  };
  const threadService = {
    createThread: jest
      .fn()
      .mockImplementation(({ id, workspaceMemberId, channelId }) =>
        Promise.resolve({ id, workspaceMemberId, channelId }),
      ),
    createUnownedChannelThread: jest
      .fn()
      .mockImplementation(({ id, channelId }) =>
        Promise.resolve({ id, workspaceMemberId: null, channelId }),
      ),
    deliverToParticipants: jest
      .fn()
      .mockImplementation(({ participantWorkspaceMemberIds }) =>
        Promise.resolve(participantWorkspaceMemberIds),
      ),
    mentionParticipants: jest
      .fn()
      .mockImplementation(({ participantWorkspaceMemberIds }) =>
        Promise.resolve(participantWorkspaceMemberIds),
      ),
    recordThreadActivity: jest.fn().mockResolvedValue(undefined),
  };
  const sharingService = {
    getAuthContext: jest.fn().mockResolvedValue({}),
  };
  const channelAccessService = {
    assertChannelOpenToRole: jest.fn().mockResolvedValue(undefined),
  };
  const inboxAccessService = {
    assertThreadIsWritableOrThrow: jest.fn().mockResolvedValue(undefined),
  };
  const threadTargetService = {
    attachThreadToRecord: jest.fn().mockResolvedValue(undefined),
  };
  const messageRepository = {
    findOne: jest.fn().mockResolvedValue(null),
  };
  const conversationWriterService = {
    insertTurn: jest.fn().mockResolvedValue('turn-id'),
    insertMessage: jest.fn().mockResolvedValue('message-id'),
  };

  const service = new AgentInboxService(
    threadRepository as never,
    messageRepository as never,
    {} as never,
    threadService as never,
    sharingService as never,
    channelAccessService as never,
    inboxAccessService as never,
    threadTargetService as never,
    conversationWriterService as never,
    {} as never,
  );

  return {
    service,
    threadRepository,
    threadService,
    sharingService,
    channelAccessService,
    inboxAccessService,
    threadTargetService,
    messageRepository,
    conversationWriterService,
  };
};

const THREAD_ID = buildInboxThreadId({
  senderKey: 'workflow:workflow-id',
  threadKey: 'run-id',
});

describe('AgentInboxService.openThread', () => {
  it('continues the conversation the sender already has under that key', async () => {
    const { service, threadRepository, threadService } = buildService();
    const existingThread = {
      id: 'existing-thread-id',
      workspaceMemberId: 'member-id',
    };

    threadRepository.findOne.mockResolvedValue(existingThread);

    await expect(
      service.openThread({ ...OPEN_ARGS, workspaceMemberIds: ['member-id'] }),
    ).resolves.toEqual({ thread: existingThread, isCreated: false });
    expect(threadService.createThread).not.toHaveBeenCalled();
    expect(threadService.deliverToParticipants).not.toHaveBeenCalled();
  });

  it('creates the conversation owned by the first member and adds the others', async () => {
    const { service, threadService } = buildService();

    const { thread, isCreated } = await service.openThread({
      ...OPEN_ARGS,
      workspaceMemberIds: ['member-id', 'other-member-id'],
      isArchivedOnCreate: true,
    });

    expect(isCreated).toBe(true);
    expect(thread.id).toBe(THREAD_ID);
    expect(threadService.createThread).toHaveBeenCalledWith({
      workspaceId: 'workspace-id',
      workspaceMemberId: 'member-id',
      id: THREAD_ID,
      title: 'Draft the quote',
      isArchived: true,
      channelId: undefined,
    });
    expect(threadService.deliverToParticipants).toHaveBeenCalledWith({
      workspaceId: 'workspace-id',
      threadId: THREAD_ID,
      workspaceMemberId: 'member-id',
      participantWorkspaceMemberIds: ['other-member-id'],
    });
  });

  it('adds only the members the conversation does not have yet', async () => {
    const { service, threadRepository, threadService, sharingService } =
      buildService();

    threadRepository.findOne.mockResolvedValue({
      id: THREAD_ID,
      workspaceMemberId: 'member-id',
      writerWorkspaceMemberIds: ['second-member-id'],
    });

    await service.openThread({
      ...OPEN_ARGS,
      workspaceMemberIds: [
        'member-id',
        'second-member-id',
        'third-member-id',
        'third-member-id',
      ],
    });

    expect(threadService.deliverToParticipants).toHaveBeenCalledWith(
      expect.objectContaining({
        participantWorkspaceMemberIds: ['third-member-id'],
      }),
    );
    expect(sharingService.getAuthContext).toHaveBeenCalledTimes(1);
    expect(sharingService.getAuthContext).toHaveBeenCalledWith({
      workspaceId: 'workspace-id',
      workspaceMemberId: 'third-member-id',
    });
  });

  it('neither creates nor shares the conversation when a member cannot have it', async () => {
    const { service, threadService, sharingService } = buildService();

    sharingService.getAuthContext.mockImplementation(
      ({ workspaceMemberId }: { workspaceMemberId: string }) =>
        workspaceMemberId === 'invalid-member-id'
          ? Promise.reject(
              new AiException(
                'Thread not found',
                AiExceptionCode.THREAD_NOT_FOUND,
              ),
            )
          : Promise.resolve({}),
    );

    await expect(
      service.openThread({
        ...OPEN_ARGS,
        workspaceMemberIds: ['member-id', 'invalid-member-id'],
      }),
    ).rejects.toMatchObject({ code: AiExceptionCode.THREAD_NOT_FOUND });
    expect(threadService.createThread).not.toHaveBeenCalled();
    expect(threadService.deliverToParticipants).not.toHaveBeenCalled();
  });

  it('fails when a member cannot join the conversation', async () => {
    const { service, threadService } = buildService();

    threadService.deliverToParticipants.mockResolvedValue([]);

    await expect(
      service.openThread({
        ...OPEN_ARGS,
        workspaceMemberIds: ['member-id', 'other-member-id'],
      }),
    ).rejects.toMatchObject({ code: AiExceptionCode.THREAD_NOT_FOUND });
  });

  it('keeps a conversation with no member out of every inbox, under the same key', async () => {
    const { service, threadRepository, threadService } = buildService();

    const { thread, isCreated } = await service.openThread({
      ...OPEN_ARGS,
      workspaceMemberIds: [],
    });

    expect(isCreated).toBe(true);
    expect(thread.id).toBe(THREAD_ID);
    expect(threadService.createThread).not.toHaveBeenCalled();
    expect(threadRepository.insert).toHaveBeenCalledWith('workspace-id', {
      id: THREAD_ID,
      title: 'Draft the quote',
    });
  });

  it('files the conversation in a channel the sender reaches, owned by the first member', async () => {
    const { service, threadService, channelAccessService } = buildService();

    await service.openThread({
      ...OPEN_ARGS,
      sender: APPLICATION_SENDER,
      workspaceMemberIds: ['member-id'],
      channelId: 'channel-id',
    });

    expect(channelAccessService.assertChannelOpenToRole).toHaveBeenCalledWith({
      workspaceId: 'workspace-id',
      channelId: 'channel-id',
      roleId: 'role-id',
    });
    expect(threadService.createThread).toHaveBeenCalledWith(
      expect.objectContaining({
        workspaceMemberId: 'member-id',
        channelId: 'channel-id',
      }),
    );
  });

  it('files a conversation with no member in the channel, for the roles that reach it', async () => {
    const { service, threadRepository, threadService } = buildService();

    const { thread, isCreated } = await service.openThread({
      ...OPEN_ARGS,
      sender: APPLICATION_SENDER,
      workspaceMemberIds: [],
      channelId: 'channel-id',
    });

    expect(isCreated).toBe(true);
    expect(thread.channelId).toBe('channel-id');
    expect(threadService.createUnownedChannelThread).toHaveBeenCalledWith({
      workspaceId: 'workspace-id',
      id: buildInboxThreadId({
        senderKey: 'application:application-id',
        threadKey: 'run-id',
      }),
      title: 'Draft the quote',
      channelId: 'channel-id',
    });
    expect(threadService.createThread).not.toHaveBeenCalled();
    expect(threadRepository.insert).not.toHaveBeenCalled();
  });

  it('refuses a channel the sender cannot reach before creating anything', async () => {
    const { service, threadService, channelAccessService } = buildService();

    channelAccessService.assertChannelOpenToRole.mockRejectedValue(
      new AiException(
        'Channel not found',
        AiExceptionCode.CHAT_CHANNEL_NOT_FOUND,
      ),
    );

    await expect(
      service.openThread({
        ...OPEN_ARGS,
        workspaceMemberIds: ['member-id'],
        channelId: 'channel-id',
      }),
    ).rejects.toMatchObject({ code: AiExceptionCode.CHAT_CHANNEL_NOT_FOUND });
    expect(threadService.createThread).not.toHaveBeenCalled();
    expect(threadService.createUnownedChannelThread).not.toHaveBeenCalled();
  });

  it('leaves the channel of a conversation that exists as it is', async () => {
    const { service, threadRepository, channelAccessService } = buildService();

    threadRepository.findOne.mockResolvedValue({
      id: THREAD_ID,
      workspaceMemberId: 'member-id',
      channelId: null,
    });

    await service.openThread({
      ...OPEN_ARGS,
      workspaceMemberIds: ['member-id'],
      channelId: 'channel-id',
    });

    expect(channelAccessService.assertChannelOpenToRole).not.toHaveBeenCalled();
  });

  it('refuses to give members a conversation no inbox receives', async () => {
    const { service, threadRepository, threadService } = buildService();

    threadRepository.findOne.mockResolvedValue({
      id: THREAD_ID,
      workspaceMemberId: null,
    });

    await expect(
      service.openThread({ ...OPEN_ARGS, workspaceMemberIds: ['member-id'] }),
    ).rejects.toMatchObject({ code: AiExceptionCode.THREAD_NOT_FOUND });
    expect(threadService.deliverToParticipants).not.toHaveBeenCalled();
  });

  it('returns a deleted conversation without adding anyone to it', async () => {
    const { service, threadRepository, threadService } = buildService();
    const deletedThread = {
      id: THREAD_ID,
      workspaceMemberId: 'member-id',
      deletedAt: '2026-01-01',
    };

    threadRepository.findOne.mockResolvedValue(deletedThread);

    await expect(
      service.openThread({
        ...OPEN_ARGS,
        workspaceMemberIds: ['member-id', 'other-member-id'],
      }),
    ).resolves.toEqual({ thread: deletedThread, isCreated: false });
    expect(threadService.deliverToParticipants).not.toHaveBeenCalled();
  });

  it('returns the conversation a concurrent open created first', async () => {
    const { service, threadRepository, threadService } = buildService();
    const concurrentThread = {
      id: 'concurrent-thread-id',
      workspaceMemberId: 'member-id',
    };

    threadService.createThread.mockRejectedValue(buildUniqueViolation());
    threadRepository.findOne
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(concurrentThread);

    await expect(
      service.openThread({ ...OPEN_ARGS, workspaceMemberIds: ['member-id'] }),
    ).resolves.toEqual({ thread: concurrentThread, isCreated: false });
  });
});

describe('AgentInboxService.sendMessage', () => {
  it('adds the members a repeated message lists without writing it again', async () => {
    const {
      service,
      threadRepository,
      threadService,
      messageRepository,
      conversationWriterService,
    } = buildService();

    threadRepository.findOne.mockResolvedValue({
      id: THREAD_ID,
      workspaceMemberId: 'member-id',
    });
    messageRepository.findOne.mockResolvedValue({ id: 'message-id' });

    await expect(
      service.sendMessage({
        workspaceId: 'workspace-id',
        sender: SENDER,
        input: { ...KEYED_INPUT, mentionedWorkspaceMemberIds: ['member-id'] },
      }),
    ).resolves.toMatchObject({
      threadId: THREAD_ID,
      isNewThread: false,
      isDismissed: false,
    });
    expect(threadService.createThread).not.toHaveBeenCalled();
    expect(threadService.deliverToParticipants).toHaveBeenCalledWith(
      expect.objectContaining({
        threadId: THREAD_ID,
        participantWorkspaceMemberIds: ['other-member-id'],
      }),
    );
    expect(conversationWriterService.insertMessage).not.toHaveBeenCalled();
    expect(threadService.mentionParticipants).not.toHaveBeenCalled();
  });

  it('opens the conversation with the message, and mentions the members once it is written', async () => {
    const { service, threadService, conversationWriterService } =
      buildService();
    const { messageId, openingMessageId } = buildInboxMessageIds({
      senderKey: 'workflow:workflow-id',
      threadKey: 'run-id',
      idempotencyKey: 'step-id',
    });

    await expect(
      service.sendMessage({
        workspaceId: 'workspace-id',
        sender: SENDER,
        input: {
          ...KEYED_INPUT,
          mentionedWorkspaceMemberIds: ['member-id', 'other-member-id'],
        },
      }),
    ).resolves.toMatchObject({
      threadId: THREAD_ID,
      messageId,
      isNewThread: true,
      isDismissed: false,
    });
    expect(
      conversationWriterService.insertMessage.mock.calls.map(([{ id }]) => id),
    ).toEqual([openingMessageId, messageId]);
    expect(threadService.mentionParticipants).toHaveBeenCalledWith({
      workspaceId: 'workspace-id',
      threadId: THREAD_ID,
      workspaceMemberId: 'member-id',
      participantWorkspaceMemberIds: ['member-id', 'other-member-id'],
    });
  });

  it('writes the message in a conversation the caller may write, without an opener', async () => {
    const {
      service,
      threadRepository,
      threadService,
      inboxAccessService,
      conversationWriterService,
    } = buildService();
    const { messageId, turnId } = buildInboxThreadMessageIds({
      threadId: 'thread-id',
      senderScope: 'application:application-id',
      idempotencyKey: 'step-id',
    });

    threadRepository.findOne.mockResolvedValue({
      id: 'thread-id',
      workspaceMemberId: 'owner-id',
    });

    await expect(
      service.sendMessage({
        workspaceId: 'workspace-id',
        sender: APPLICATION_SENDER,
        input: EXISTING_INPUT,
        authContext: AUTH_CONTEXT,
      }),
    ).resolves.toMatchObject({
      threadId: 'thread-id',
      messageId,
      isNewThread: false,
      isDismissed: false,
    });
    expect(
      inboxAccessService.assertThreadIsWritableOrThrow,
    ).toHaveBeenCalledWith({
      authContext: AUTH_CONTEXT,
      threadId: 'thread-id',
    });
    expect(threadService.createThread).not.toHaveBeenCalled();
    expect(conversationWriterService.insertTurn).toHaveBeenCalledWith(
      expect.objectContaining({ id: turnId, threadId: 'thread-id' }),
    );
    expect(conversationWriterService.insertMessage).toHaveBeenCalledTimes(1);
    expect(conversationWriterService.insertMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        id: messageId,
        turnId,
        senderApplicationId: 'application-id',
      }),
    );
  });

  it('refuses a conversation the caller cannot write without touching it', async () => {
    const {
      service,
      threadRepository,
      inboxAccessService,
      conversationWriterService,
    } = buildService();

    inboxAccessService.assertThreadIsWritableOrThrow.mockRejectedValue(
      new AiException('Thread not found', AiExceptionCode.THREAD_NOT_FOUND),
    );

    await expect(
      service.sendMessage({
        workspaceId: 'workspace-id',
        sender: APPLICATION_SENDER,
        input: EXISTING_INPUT,
        authContext: AUTH_CONTEXT,
      }),
    ).rejects.toMatchObject({ code: AiExceptionCode.THREAD_NOT_FOUND });
    expect(threadRepository.findOne).not.toHaveBeenCalled();
    expect(conversationWriterService.insertMessage).not.toHaveBeenCalled();
  });

  it('refuses an existing conversation to a sender with no access of its own', async () => {
    const { service, inboxAccessService } = buildService();

    await expect(
      service.sendMessage({
        workspaceId: 'workspace-id',
        sender: SENDER,
        input: EXISTING_INPUT,
      }),
    ).rejects.toMatchObject({ code: AiExceptionCode.THREAD_NOT_FOUND });
    expect(
      inboxAccessService.assertThreadIsWritableOrThrow,
    ).not.toHaveBeenCalled();
  });

  it('attaches the records under the caller before writing the message', async () => {
    const { service, threadTargetService, conversationWriterService } =
      buildService();
    const recordTarget = {
      objectNameSingular: 'company',
      recordId: 'company-id',
    };

    await service.sendMessage({
      workspaceId: 'workspace-id',
      sender: APPLICATION_SENDER,
      input: {
        ...KEYED_INPUT,
        workspaceMemberIds: ['member-id'],
        recordTargets: [recordTarget],
      },
      authContext: AUTH_CONTEXT,
    });

    expect(threadTargetService.attachThreadToRecord).toHaveBeenCalledWith({
      workspaceId: 'workspace-id',
      threadId: buildInboxThreadId({
        senderKey: 'application:application-id',
        threadKey: 'run-id',
      }),
      authContext: AUTH_CONTEXT,
      ...recordTarget,
    });
    expect(
      threadTargetService.attachThreadToRecord.mock.invocationCallOrder[0],
    ).toBeLessThan(
      conversationWriterService.insertMessage.mock.invocationCallOrder[0],
    );
  });

  it('leaves the message unwritten when a record cannot be read', async () => {
    const { service, threadTargetService, conversationWriterService } =
      buildService();

    threadTargetService.attachThreadToRecord.mockRejectedValue(
      new AiException('Record not found', AiExceptionCode.RECORD_NOT_FOUND),
    );

    await expect(
      service.sendMessage({
        workspaceId: 'workspace-id',
        sender: APPLICATION_SENDER,
        input: {
          ...KEYED_INPUT,
          recordTargets: [
            { objectNameSingular: 'company', recordId: 'company-id' },
          ],
        },
        authContext: AUTH_CONTEXT,
      }),
    ).rejects.toMatchObject({ code: AiExceptionCode.RECORD_NOT_FOUND });
    expect(conversationWriterService.insertMessage).not.toHaveBeenCalled();
  });
});
