import { QueryFailedError } from 'typeorm';
import { v5 } from 'uuid';

import { INBOX_MESSAGE_ID_NAMESPACE } from 'src/engine/metadata-modules/ai/ai-chat/constants/inbox-message-id-namespace.constant';

import { AgentInboxService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-inbox.service';
import { buildInboxConversationKey } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-inbox-conversation-key.util';
import { buildInboxThreadId } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-inbox-thread-id.util';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';

const SENDER = {
  type: 'workflow' as const,
  workflowId: 'workflow-id',
  workflowName: 'New deals',
};

const APP_SECRET = 'app-secret';

const OPEN_ARGS = {
  workspaceId: 'workspace-id',
  sender: SENDER,
  threadKey: 'run-id',
  title: 'Draft the quote',
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
      .mockImplementation(({ id, workspaceMemberId }) =>
        Promise.resolve({ id, workspaceMemberId }),
      ),
    addParticipants: jest
      .fn()
      .mockImplementation(({ participantWorkspaceMemberIds }) =>
        Promise.resolve(participantWorkspaceMemberIds),
      ),
    recordThreadActivity: jest.fn().mockResolvedValue(undefined),
  };
  const conversationWriterService = {
    insertTurn: jest.fn().mockResolvedValue(undefined),
    insertMessage: jest.fn().mockResolvedValue(undefined),
  };
  const sharingService = {
    getAuthContext: jest.fn().mockResolvedValue({}),
  };
  const messageRepository = {
    findOne: jest.fn().mockResolvedValue(null),
  };

  const service = new AgentInboxService(
    threadRepository as never,
    messageRepository as never,
    {} as never,
    threadService as never,
    sharingService as never,
    conversationWriterService as never,
    {} as never,
    { get: () => APP_SECRET } as never,
  );

  return {
    service,
    threadRepository,
    threadService,
    sharingService,
    messageRepository,
    conversationWriterService,
  };
};

const THREAD_ID = buildInboxThreadId({
  conversationKey: buildInboxConversationKey({
    appSecret: APP_SECRET,
    workspaceId: 'workspace-id',
    senderKey: 'workflow:workflow-id',
    threadKey: 'run-id',
  }),
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
    expect(threadService.addParticipants).not.toHaveBeenCalled();
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
    });
    expect(threadService.addParticipants).toHaveBeenCalledWith({
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

    expect(threadService.addParticipants).toHaveBeenCalledWith(
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
    expect(threadService.addParticipants).not.toHaveBeenCalled();
  });

  it('fails when a member cannot join the conversation', async () => {
    const { service, threadService } = buildService();

    threadService.addParticipants.mockResolvedValue([]);

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

  it('refuses to give members a conversation no inbox receives', async () => {
    const { service, threadRepository, threadService } = buildService();

    threadRepository.findOne.mockResolvedValue({
      id: THREAD_ID,
      workspaceMemberId: null,
    });

    await expect(
      service.openThread({ ...OPEN_ARGS, workspaceMemberIds: ['member-id'] }),
    ).rejects.toMatchObject({ code: AiExceptionCode.THREAD_NOT_FOUND });
    expect(threadService.addParticipants).not.toHaveBeenCalled();
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
    expect(threadService.addParticipants).not.toHaveBeenCalled();
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

describe('AgentInboxService ids', () => {
  it('writes nothing under an id a member can compute from the sender and keys', async () => {
    const { service, conversationWriterService } = buildService();

    const { threadId, toolCallId } = await service.sendMessage({
      workspaceId: 'workspace-id',
      sender: SENDER,
      input: {
        workspaceMemberIds: ['member-id'],
        threadKey: 'run-id',
        idempotencyKey: 'step-id',
        title: 'Draft the quote',
        text: 'Here is the quote',
      },
    });
    const writtenIds = [
      threadId,
      toolCallId,
      ...[
        ...conversationWriterService.insertTurn.mock.calls,
        ...conversationWriterService.insertMessage.mock.calls,
      ].map(([{ id }]) => id),
    ];
    const guessableIds = [
      'workflow:workflow-id:run-id',
      'workspace-id:workflow:workflow-id:run-id',
    ].flatMap((name) => {
      const guessedThreadId = v5(name, INBOX_MESSAGE_ID_NAMESPACE);
      const guessedMessageId = v5(
        `${guessedThreadId}:message:step-id`,
        INBOX_MESSAGE_ID_NAMESPACE,
      );

      return [
        guessedThreadId,
        guessedMessageId,
        `call_${guessedMessageId.replace(/-/g, '')}`,
        v5(`${guessedThreadId}:turn`, INBOX_MESSAGE_ID_NAMESPACE),
        v5(`${guessedThreadId}:opening`, INBOX_MESSAGE_ID_NAMESPACE),
      ];
    });

    expect(writtenIds).toHaveLength(5);
    expect(writtenIds.filter((id) => guessableIds.includes(id))).toEqual([]);
  });
});

describe('AgentInboxService.sendMessage', () => {
  it('adds the members a repeated message lists without writing it again', async () => {
    const { service, threadRepository, threadService, messageRepository } =
      buildService();

    threadRepository.findOne.mockResolvedValue({
      id: THREAD_ID,
      workspaceMemberId: 'member-id',
    });
    messageRepository.findOne.mockResolvedValue({ id: 'message-id' });

    await expect(
      service.sendMessage({
        workspaceId: 'workspace-id',
        sender: SENDER,
        input: {
          workspaceMemberIds: ['member-id', 'other-member-id'],
          threadKey: 'run-id',
          idempotencyKey: 'step-id',
          title: 'Draft the quote',
          text: 'Here is the quote',
        },
      }),
    ).resolves.toMatchObject({ threadId: THREAD_ID, isDismissed: false });
    expect(threadService.createThread).not.toHaveBeenCalled();
    expect(threadService.addParticipants).toHaveBeenCalledWith(
      expect.objectContaining({
        threadId: THREAD_ID,
        participantWorkspaceMemberIds: ['other-member-id'],
      }),
    );
  });
});
