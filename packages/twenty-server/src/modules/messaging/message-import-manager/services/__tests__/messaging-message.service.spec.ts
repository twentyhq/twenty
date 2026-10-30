import { type FindOperator } from 'typeorm';

import { type WorkspaceTransactionScope } from 'src/engine/twenty-orm/types/workspace-transaction-scope.type';
import { type WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { MessageDirection } from 'src/modules/messaging/common/enums/message-direction.enum';
import { MessagingMessageService } from 'src/modules/messaging/message-import-manager/services/messaging-message.service';
import { type MessageWithParticipants } from 'src/modules/messaging/message-import-manager/types/message.type';

jest.mock('src/engine/twenty-orm/workspace-orm.manager', () => ({
  WorkspaceOrmManager: jest.fn(),
}));
jest.mock('src/engine/twenty-orm/utils/build-system-auth-context.util', () => ({
  buildSystemAuthContext: jest.fn(),
}));

type AssociationCriteria = {
  messageChannelId: string;
  messageId?: FindOperator<string[]>;
  messageExternalId?: FindOperator<string[]>;
  messageThreadExternalId?: FindOperator<string[]>;
};

describe('MessagingMessageService draft synchronization', () => {
  const messageChannelId = 'channel-1';
  const workspaceId = 'workspace-1';
  const sentMessage: MessageWithParticipants = {
    externalId: 'immutable-message-id',
    messageThreadExternalId: 'conversation-id',
    headerMessageId: '<sent@example.com>',
    subject: 'Sent subject',
    receivedAt: new Date('2026-01-02T12:00:00Z'),
    text: 'Sent body',
    isDraft: false,
    direction: MessageDirection.OUTGOING,
    attachments: [],
    participants: [],
  };

  const makeExistingMessage = () => ({
    id: 'message-1',
    headerMessageId: sentMessage.headerMessageId,
    subject: 'Draft subject',
    receivedAt: new Date('2026-01-02T11:00:00Z'),
    text: 'Draft body',
    isDraft: true,
    messageThreadId: 'thread-1',
  });

  let existingMessage: ReturnType<typeof makeExistingMessage> | undefined;
  let associationChannelId: string;
  let associationThreadExternalId: string;
  let messageRepository: {
    find: jest.Mock;
    insert: jest.Mock;
    update: jest.Mock;
  };
  let associationRepository: {
    find: jest.Mock;
    insert: jest.Mock;
    update: jest.Mock;
  };
  let threadRepository: { insert: jest.Mock; upsert: jest.Mock };
  let service: MessagingMessageService;
  let transactionScope: WorkspaceTransactionScope;

  beforeEach(() => {
    existingMessage = makeExistingMessage();
    associationChannelId = messageChannelId;
    associationThreadExternalId = sentMessage.messageThreadExternalId;
    messageRepository = {
      find: jest
        .fn()
        .mockImplementation(
          ({
            where,
          }: {
            where: { headerMessageId: FindOperator<(string | null)[]> };
          }) =>
            existingMessage &&
            where.headerMessageId.value.includes(
              existingMessage.headerMessageId,
            )
              ? [existingMessage]
              : [],
        ),
      insert: jest.fn().mockResolvedValue({}),
      update: jest.fn().mockResolvedValue({}),
    };
    associationRepository = {
      find: jest
        .fn()
        .mockImplementation(
          ({
            where,
          }: {
            where: AssociationCriteria | AssociationCriteria[];
          }) => {
            const conditions = Array.isArray(where) ? where : [where];
            const matches = conditions.some(
              (condition) =>
                condition.messageChannelId === associationChannelId &&
                (!condition.messageId ||
                  condition.messageId.value.includes('message-1')) &&
                (!condition.messageExternalId ||
                  condition.messageExternalId.value.includes(
                    sentMessage.externalId,
                  )) &&
                (!condition.messageThreadExternalId ||
                  condition.messageThreadExternalId.value.includes(
                    associationThreadExternalId,
                  )),
            );

            return matches && existingMessage
              ? [
                  {
                    id: 'association-1',
                    messageChannelId: associationChannelId,
                    messageId: existingMessage.id,
                    messageExternalId: sentMessage.externalId,
                    messageThreadExternalId: associationThreadExternalId,
                    message: existingMessage,
                    direction: MessageDirection.INCOMING,
                  },
                ]
              : [];
          },
        ),
      insert: jest.fn().mockResolvedValue({}),
      update: jest.fn().mockResolvedValue({}),
    };
    threadRepository = {
      insert: jest.fn().mockResolvedValue({}),
      upsert: jest.fn().mockResolvedValue({}),
    };

    const repositories = {
      message: messageRepository,
      messageThread: threadRepository,
      messageChannelMessageAssociation: associationRepository,
    };

    transactionScope = {
      getRepository: jest.fn(
        (name: keyof typeof repositories) => repositories[name],
      ),
    } as unknown as WorkspaceTransactionScope;

    service = new MessagingMessageService({
      executeInWorkspaceContext: jest.fn((callback: () => Promise<unknown>) =>
        callback(),
      ),
    } as unknown as WorkspaceOrmManager);
  });

  const save = (messages: MessageWithParticipants[] = [sentMessage]) =>
    service.saveMessagesWithinTransaction(
      messages,
      messageChannelId,
      transactionScope,
      workspaceId,
    );

  it('updates a sent draft in place and preserves downstream message, association and thread IDs', async () => {
    const result = await save();

    expect(messageRepository.update).toHaveBeenCalledWith('message-1', {
      headerMessageId: sentMessage.headerMessageId,
      subject: sentMessage.subject,
      receivedAt: sentMessage.receivedAt,
      text: sentMessage.text,
      isDraft: false,
    });
    expect(associationRepository.update).toHaveBeenCalledWith('association-1', {
      messageExternalId: sentMessage.externalId,
      messageThreadExternalId: sentMessage.messageThreadExternalId,
      direction: MessageDirection.OUTGOING,
    });
    expect(threadRepository.upsert).toHaveBeenCalledWith(
      [{ id: 'thread-1', subject: sentMessage.subject }],
      ['id'],
    );
    expect(result.createdMessages).toEqual([]);
    expect(result.messageExternalIdsAndIdsMap.get(sentMessage.externalId)).toBe(
      'message-1',
    );
    expect(
      result.messageExternalIdToMessageChannelMessageAssociationIdMap.get(
        sentMessage.externalId,
      ),
    ).toBe('association-1');
    expect(
      result.messageExternalIdToMessageThreadIdMap.get(sentMessage.externalId),
    ).toBe('thread-1');
    expect(messageRepository.insert).toHaveBeenCalledWith([]);
    expect(associationRepository.insert).toHaveBeenCalledWith([]);
  });

  it('matches the immutable ID when sending changes both the header and conversation IDs', async () => {
    existingMessage = {
      ...makeExistingMessage(),
      headerMessageId: '<draft@example.com>',
    };
    associationThreadExternalId = 'draft-conversation-id';

    const result = await save();

    expect(messageRepository.update).toHaveBeenCalledWith(
      'message-1',
      expect.objectContaining({ isDraft: false }),
    );
    expect(result.messageExternalIdsAndIdsMap.get(sentMessage.externalId)).toBe(
      'message-1',
    );
    expect(result.createdMessages).toEqual([]);
  });

  it('does not match another channel by external ID', async () => {
    existingMessage = {
      ...makeExistingMessage(),
      headerMessageId: '<draft@example.com>',
    };
    associationChannelId = 'another-channel';

    const result = await save();

    expect(messageRepository.update).not.toHaveBeenCalled();
    expect(associationRepository.update).not.toHaveBeenCalled();
    expect(result.createdMessages).toHaveLength(1);
    expect(
      result.messageExternalIdsAndIdsMap.get(sentMessage.externalId),
    ).not.toBe('message-1');
  });

  it('does not downgrade a sent message on a stale draft import', async () => {
    existingMessage = { ...makeExistingMessage(), isDraft: false };

    await save([{ ...sentMessage, isDraft: true }]);

    expect(messageRepository.update).not.toHaveBeenCalled();
    expect(associationRepository.update).not.toHaveBeenCalled();
    expect(threadRepository.upsert).not.toHaveBeenCalled();
  });

  it('does not rewrite an already-sent message on a retry', async () => {
    existingMessage = { ...makeExistingMessage(), isDraft: false };

    await save();

    expect(messageRepository.update).not.toHaveBeenCalled();
    expect(associationRepository.update).not.toHaveBeenCalled();
  });

  it('does not finalize a message that is still a draft at the provider', async () => {
    await save([{ ...sentMessage, isDraft: true }]);

    expect(messageRepository.update).not.toHaveBeenCalled();
    expect(associationRepository.update).not.toHaveBeenCalled();
    expect(threadRepository.upsert).not.toHaveBeenCalled();
  });

  it('creates a new message when no draft exists', async () => {
    existingMessage = undefined;

    const result = await save();

    expect(result.createdMessages).toHaveLength(1);
    expect(messageRepository.insert).toHaveBeenCalledWith([
      expect.objectContaining({ subject: sentMessage.subject, isDraft: false }),
    ]);
    expect(associationRepository.insert).toHaveBeenCalledWith([
      expect.objectContaining({ messageExternalId: sentMessage.externalId }),
    ]);
    expect(messageRepository.update).not.toHaveBeenCalled();
  });
});
