import { Test } from '@nestjs/testing';

import { type WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import { MessageDirection } from 'src/modules/messaging/common/enums/message-direction.enum';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { MessagingMessageService } from 'src/modules/messaging/message-import-manager/services/messaging-message.service';
import { type MessageWithParticipants } from 'src/modules/messaging/message-import-manager/types/message';

describe('MessagingMessageService', () => {
  let service: MessagingMessageService;

  const messageAssociationFindMock = jest.fn();
  const messageAssociationInsertMock = jest.fn();
  const messageFindMock = jest.fn();
  const messageInsertMock = jest.fn();
  const messageThreadInsertMock = jest.fn();
  const messageThreadUpsertMock = jest.fn();

  const repositoriesByName: Record<string, object> = {
    messageChannelMessageAssociation: {
      find: messageAssociationFindMock,
      insert: messageAssociationInsertMock,
    },
    message: {
      find: messageFindMock,
      insert: messageInsertMock,
    },
    messageThread: {
      insert: messageThreadInsertMock,
      upsert: messageThreadUpsertMock,
    },
  };

  const buildMessage = (
    externalId: string,
    headerMessageId: string,
  ): MessageWithParticipants =>
    ({
      externalId,
      headerMessageId,
      messageThreadExternalId: 'thread-external-1',
      subject: 'Subject',
      receivedAt: new Date('2026-01-01T00:00:00Z'),
      text: 'Text',
      isDraft: false,
      direction: MessageDirection.INCOMING,
      participants: [],
      attachments: [],
    }) as unknown as MessageWithParticipants;

  beforeEach(async () => {
    jest.clearAllMocks();

    const moduleRef = await Test.createTestingModule({
      providers: [
        MessagingMessageService,
        {
          provide: GlobalWorkspaceOrmManager,
          useValue: {
            executeInWorkspaceContext: jest.fn(
              async (callback: () => Promise<unknown>) => callback(),
            ),
            getRepository: jest.fn(
              async (_workspaceId: string, objectName: string) =>
                repositoriesByName[objectName],
            ),
          },
        },
      ],
    }).compile();

    service = moduleRef.get(MessagingMessageService);
  });

  it('should create a single association when two batch messages resolve to the same existing message', async () => {
    const existingMessage = {
      id: 'message-1',
      headerMessageId: '<shared@example.com>',
      messageThreadId: 'thread-1',
    };

    messageFindMock.mockResolvedValue([existingMessage]);
    messageAssociationFindMock.mockResolvedValue([]);

    const result = await service.saveMessagesWithinTransaction(
      [
        buildMessage('external-1', '<shared@example.com>'),
        buildMessage('external-2', '<shared@example.com>'),
      ],
      'channel-1',
      {} as WorkspaceEntityManager,
      'workspace-1',
    );

    expect(messageAssociationInsertMock).toHaveBeenCalledTimes(1);

    const insertedAssociations = messageAssociationInsertMock.mock.calls[0][0];

    expect(insertedAssociations).toHaveLength(1);
    expect(insertedAssociations[0]).toMatchObject({
      messageChannelId: 'channel-1',
      messageId: 'message-1',
    });

    expect(
      result.messageExternalIdToMessageChannelMessageAssociationIdMap.get(
        'external-1',
      ),
    ).toBe(insertedAssociations[0].id);
    expect(
      result.messageExternalIdToMessageChannelMessageAssociationIdMap.get(
        'external-2',
      ),
    ).toBe(insertedAssociations[0].id);
  });

  it('should create one association per message when messages are distinct', async () => {
    messageFindMock.mockResolvedValue([]);
    messageAssociationFindMock.mockResolvedValue([]);

    await service.saveMessagesWithinTransaction(
      [
        buildMessage('external-1', '<first@example.com>'),
        buildMessage('external-2', '<second@example.com>'),
      ],
      'channel-1',
      {} as WorkspaceEntityManager,
      'workspace-1',
    );

    expect(messageAssociationInsertMock).toHaveBeenCalledTimes(1);
    expect(messageAssociationInsertMock.mock.calls[0][0]).toHaveLength(2);
  });
});
