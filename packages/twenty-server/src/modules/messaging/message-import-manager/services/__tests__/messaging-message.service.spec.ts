import { type FindOperator } from 'typeorm';
import { MessageParticipantRole } from 'twenty-shared/types';

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

type StoredParticipant = {
  id: string;
  messageId: string;
  handle: string;
  displayName: string;
  role: MessageParticipantRole;
  personId: string | null;
};

type StoredFolderAssociation = {
  id: string;
  messageChannelMessageAssociationId: string;
  messageFolderId: string;
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
  let participants: StoredParticipant[];
  let folderAssociations: StoredFolderAssociation[];
  let participantRepository: {
    find: jest.Mock;
    delete: jest.Mock;
    update: jest.Mock;
  };
  let folderAssociationRepository: { find: jest.Mock; delete: jest.Mock };
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

    participants = [];
    folderAssociations = [];
    participantRepository = {
      update: jest.fn((id: string, update: Partial<StoredParticipant>) => {
        participants = participants.map((participant) =>
          participant.id === id ? { ...participant, ...update } : participant,
        );
        return Promise.resolve({});
      }),
      find: jest.fn(({ where }: { where: { messageId: string } }) =>
        Promise.resolve(
          participants.filter(({ messageId }) => messageId === where.messageId),
        ),
      ),
      delete: jest.fn(({ id }: { id: FindOperator<string[]> }) => {
        participants = participants.filter(
          (participant) => !id.value.includes(participant.id),
        );
        return Promise.resolve({});
      }),
    };
    folderAssociationRepository = {
      find: jest.fn(
        ({
          where,
        }: {
          where: { messageChannelMessageAssociationId: string };
        }) =>
          Promise.resolve(
            folderAssociations.filter(
              (association) =>
                association.messageChannelMessageAssociationId ===
                where.messageChannelMessageAssociationId,
            ),
          ),
      ),
      delete: jest.fn(({ id }: { id: FindOperator<string[]> }) => {
        folderAssociations = folderAssociations.filter(
          (association) => !id.value.includes(association.id),
        );
        return Promise.resolve({});
      }),
    };

    const repositories = {
      message: messageRepository,
      messageThread: threadRepository,
      messageChannelMessageAssociation: associationRepository,
      messageParticipant: participantRepository,
      messageChannelMessageAssociationMessageFolder:
        folderAssociationRepository,
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

    expect(messageRepository.update).toHaveBeenCalledTimes(1);

    expect(messageRepository.update).toHaveBeenCalledWith('message-1', {
      headerMessageId: sentMessage.headerMessageId,
      subject: sentMessage.subject,
      receivedAt: sentMessage.receivedAt,
      text: sentMessage.text,
      isDraft: false,
    });
    expect(associationRepository.update).toHaveBeenCalledTimes(1);
    expect(associationRepository.update).toHaveBeenCalledWith('association-1', {
      messageExternalId: sentMessage.externalId,
      messageThreadExternalId: sentMessage.messageThreadExternalId,
      direction: MessageDirection.OUTGOING,
    });
    expect(threadRepository.upsert).toHaveBeenCalledTimes(1);
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
    expect(messageRepository.insert).toHaveBeenCalledTimes(1);
    expect(messageRepository.insert).toHaveBeenCalledWith([]);
    expect(associationRepository.insert).toHaveBeenCalledTimes(1);
    expect(associationRepository.insert).toHaveBeenCalledWith([]);
  });

  it('matches the immutable ID when sending changes both the header and conversation IDs', async () => {
    existingMessage = {
      ...makeExistingMessage(),
      headerMessageId: '<draft@example.com>',
    };
    associationThreadExternalId = 'draft-conversation-id';

    const result = await save();

    expect(messageRepository.update).toHaveBeenCalledTimes(1);

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
    expect(messageRepository.insert).toHaveBeenCalledTimes(1);
    expect(messageRepository.insert).toHaveBeenCalledWith([
      expect.objectContaining({ subject: sentMessage.subject, isDraft: false }),
    ]);
    expect(associationRepository.insert).toHaveBeenCalledTimes(1);
    expect(associationRepository.insert).toHaveBeenCalledWith([
      expect.objectContaining({ messageExternalId: sentMessage.externalId }),
    ]);
    expect(messageRepository.update).not.toHaveBeenCalled();
  });

  it('removes a replaced recipient while retaining the final recipient identity and other messages', async () => {
    const alice = {
      id: 'alice-recipient',
      messageId: 'message-1',
      handle: 'alice@example.com',
      displayName: 'Alice',
      role: MessageParticipantRole.TO,
      personId: 'alice-person',
    };
    const bob = {
      ...alice,
      id: 'bob-recipient',
      handle: 'bob@example.com',
      displayName: 'Bob',
      personId: 'bob-person',
    };
    const unrelated = {
      ...alice,
      id: 'unrelated-recipient',
      messageId: 'another-message',
    };
    participants = [alice, bob, unrelated];

    await save([
      {
        ...sentMessage,
        participants: [
          {
            handle: bob.handle,
            displayName: bob.displayName,
            role: bob.role,
          },
        ],
      },
    ]);

    expect(participantRepository.delete).toHaveBeenCalledTimes(1);

    expect(participantRepository.delete).toHaveBeenCalledWith({
      id: expect.objectContaining({ value: ['alice-recipient'] }),
    });
    expect(participants).toEqual([bob, unrelated]);
  });

  it.each(['role', 'displayName'] as const)(
    'reconciles a changed participant %s before the final participant is saved',
    async (field) => {
      const participant = {
        id: 'recipient',
        messageId: 'message-1',
        handle: 'alice@example.com',
        displayName: 'Alice',
        role: MessageParticipantRole.TO,
        personId: 'alice-person',
      };
      participants = [participant];
      const finalParticipant = {
        handle: participant.handle,
        displayName:
          field === 'displayName' ? 'Alice Updated' : participant.displayName,
        role: field === 'role' ? MessageParticipantRole.CC : participant.role,
      };

      await save([{ ...sentMessage, participants: [finalParticipant] }]);

      if (field === 'role') {
        expect(participants).toEqual([]);
        expect(participantRepository.delete).toHaveBeenCalledTimes(1);
        expect(participantRepository.delete).toHaveBeenCalledWith({
          id: expect.objectContaining({ value: ['recipient'] }),
        });
        expect(participantRepository.update).not.toHaveBeenCalled();
      } else {
        expect(participants).toEqual([
          { ...participant, displayName: 'Alice Updated' },
        ]);
        expect(participantRepository.delete).not.toHaveBeenCalled();
        expect(participantRepository.update).toHaveBeenCalledTimes(1);
        expect(participantRepository.update).toHaveBeenCalledWith('recipient', {
          displayName: 'Alice Updated',
        });
      }
    },
  );

  it('removes the old Drafts folder link while retaining Sent Items and other channels', async () => {
    const draft = {
      id: 'draft-link',
      messageChannelMessageAssociationId: 'association-1',
      messageFolderId: 'draft-folder',
    };
    const sent = { ...draft, id: 'sent-link', messageFolderId: 'sent-folder' };
    const unrelated = {
      ...draft,
      id: 'other-channel-link',
      messageChannelMessageAssociationId: 'another-association',
    };
    folderAssociations = [draft, sent, unrelated];

    await save([{ ...sentMessage, messageFolderIds: ['sent-folder'] }]);

    expect(folderAssociationRepository.delete).toHaveBeenCalledTimes(1);

    expect(folderAssociationRepository.delete).toHaveBeenCalledWith({
      id: expect.objectContaining({ value: ['draft-link'] }),
    });
    expect(folderAssociations).toEqual([sent, unrelated]);
  });

  it('does not delete folder links when the provider did not supply folders', async () => {
    await save();

    expect(folderAssociationRepository.find).not.toHaveBeenCalled();
    expect(folderAssociationRepository.delete).not.toHaveBeenCalled();
  });

  it('leaves related records untouched for already-sent messages and still-unsent drafts', async () => {
    await save([{ ...sentMessage, isDraft: true }]);
    existingMessage = { ...makeExistingMessage(), isDraft: false };
    await save();

    expect(participantRepository.find).not.toHaveBeenCalled();
    expect(participantRepository.delete).not.toHaveBeenCalled();
    expect(folderAssociationRepository.find).not.toHaveBeenCalled();
    expect(folderAssociationRepository.delete).not.toHaveBeenCalled();
  });

  it('propagates a reconciliation failure before finalizing the draft', async () => {
    participantRepository.find.mockRejectedValueOnce(
      new Error('reconciliation failed'),
    );

    await expect(save()).rejects.toThrow('reconciliation failed');

    expect(messageRepository.update).not.toHaveBeenCalled();
    expect(associationRepository.update).not.toHaveBeenCalled();
  });

  it.each(['reply-first', 'draft-first'])(
    'keeps a changed conversation in its existing thread with %s ordering',
    async (order) => {
      existingMessage = {
        ...makeExistingMessage(),
        headerMessageId: '<draft@example.com>',
      };
      associationThreadExternalId = 'draft-conversation-id';
      const reply = {
        ...sentMessage,
        externalId: 'reply-id',
        headerMessageId: '<reply@example.com>',
        subject: 'Reply subject',
        receivedAt: new Date('2026-01-02T13:00:00Z'),
      };

      const result = await save(
        order === 'reply-first' ? [reply, sentMessage] : [sentMessage, reply],
      );

      expect(result.createdMessages).toHaveLength(1);
      expect(result.createdMessages[0].messageThreadId).toBe('thread-1');
      expect(
        result.messageExternalIdToMessageThreadIdMap.get(reply.externalId),
      ).toBe('thread-1');
      expect(
        result.messageExternalIdToMessageThreadIdMap.get(
          sentMessage.externalId,
        ),
      ).toBe('thread-1');
      expect(threadRepository.insert).not.toHaveBeenCalled();
      expect(threadRepository.upsert).toHaveBeenCalledTimes(1);
      expect(threadRepository.upsert).toHaveBeenCalledWith(
        [{ id: 'thread-1', subject: 'Reply subject' }],
        ['id'],
      );
    },
  );

  it('creates only one thread for multiple new messages in the same conversation', async () => {
    existingMessage = undefined;
    const reply = {
      ...sentMessage,
      externalId: 'reply-id',
      headerMessageId: '<reply@example.com>',
    };

    const result = await save([sentMessage, reply]);

    expect(threadRepository.insert).toHaveBeenCalledTimes(1);

    expect(threadRepository.insert).toHaveBeenCalledWith([
      expect.objectContaining({ subject: sentMessage.subject }),
    ]);
    expect(result.createdMessages).toHaveLength(2);
    expect(result.createdMessages[0].messageThreadId).toBe(
      result.createdMessages[1].messageThreadId,
    );
  });
});
