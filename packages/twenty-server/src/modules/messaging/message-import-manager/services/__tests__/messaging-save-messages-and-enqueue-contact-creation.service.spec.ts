import { Test, type TestingModule } from '@nestjs/testing';

import {
  MessageChannelContactAutoCreationPolicy,
  MessageParticipantRole,
} from 'twenty-shared/types';

import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { type MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { getQueueToken } from 'src/engine/core-modules/message-queue/utils/get-queue-token.util';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { MessageDirection } from 'src/modules/messaging/common/enums/message-direction.enum';
import { MessagingMessageFolderAssociationService } from 'src/modules/messaging/message-import-manager/services/messaging-message-folder-association.service';
import { MessagingMessageService } from 'src/modules/messaging/message-import-manager/services/messaging-message.service';
import { MessagingSaveMessagesAndEnqueueContactCreationService } from 'src/modules/messaging/message-import-manager/services/messaging-save-messages-and-enqueue-contact-creation.service';
import { type MessageWithParticipants } from 'src/modules/messaging/message-import-manager/types/message.type';
import { MessagingMessageParticipantService } from 'src/modules/messaging/message-participant-manager/services/messaging-message-participant.service';

const WORKSPACE_ID = '33333333-3333-4333-8333-333333333333';
const MESSAGE_ID = '77777777-7777-4777-8777-777777777777';

describe('MessagingSaveMessagesAndEnqueueContactCreationService', () => {
  let service: MessagingSaveMessagesAndEnqueueContactCreationService;
  let messageQueueService: { add: jest.Mock };

  beforeEach(async () => {
    messageQueueService = { add: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessagingSaveMessagesAndEnqueueContactCreationService,
        {
          provide: getQueueToken(MessageQueue.contactCreationQueue),
          useValue: messageQueueService,
        },
        {
          provide: MessagingMessageService,
          useValue: {
            saveMessagesWithinTransaction: jest.fn().mockResolvedValue({
              messageExternalIdsAndIdsMap: new Map([
                ['external-1', MESSAGE_ID],
              ]),
              messageExternalIdToMessageChannelMessageAssociationIdMap:
                new Map(),
              messageExternalIdToMessageThreadIdMap: new Map(),
            }),
          },
        },
        {
          provide: MessagingMessageParticipantService,
          useValue: {
            saveMessageParticipants: jest.fn().mockResolvedValue([]),
            matchMessageParticipants: jest.fn(),
          },
        },
        {
          provide: MessagingMessageFolderAssociationService,
          useValue: { saveMessageFolderAssociations: jest.fn() },
        },
        {
          provide: WorkspaceOrmManager,
          useValue: {
            executeInWorkspaceContext: (callback: () => unknown) => callback(),
            runInWorkspaceTransaction: (
              callback: (scope: unknown) => unknown,
            ) => callback({}),
          },
        },
      ],
    }).compile();

    service = module.get(MessagingSaveMessagesAndEnqueueContactCreationService);
  });

  const aSentMessage = (fromHandle: string): MessageWithParticipants =>
    ({
      externalId: 'external-1',
      messageThreadExternalId: 'thread-1',
      headerMessageId: '<message-1@acme.com>',
      subject: 'Proposal',
      text: 'Hello',
      receivedAt: new Date('2026-09-01T10:00:00Z'),
      direction: MessageDirection.OUTGOING,
      attachments: [],
      isDraft: false,
      participants: [
        {
          role: MessageParticipantRole.FROM,
          handle: fromHandle,
          displayName: 'John Doe',
        },
        {
          role: MessageParticipantRole.TO,
          handle: 'jane@customer.com',
          displayName: 'Jane',
        },
      ],
    }) as unknown as MessageWithParticipants;

  const aMessageChannel = () =>
    ({
      id: 'message-channel-1',
      isContactAutoCreationEnabled: true,
      contactAutoCreationPolicy: MessageChannelContactAutoCreationPolicy.SENT,
      excludeNonProfessionalEmails: true,
      excludeGroupEmails: true,
    }) as unknown as MessageChannelEntity;

  const getContactsToCreate = () =>
    messageQueueService.add.mock.calls[0][1].contactsToCreate.map(
      ({ handle }: { handle: string }) => handle,
    );

  it('should create contacts for recipients of a sent message', async () => {
    await service.saveMessagesAndEnqueueContactCreation(
      [aSentMessage('john.doe@acme.com')],
      aMessageChannel(),
      {
        handle: 'john.doe@acme.com',
        handleAliases: [],
      } as unknown as ConnectedAccountEntity,
      WORKSPACE_ID,
    );

    expect(getContactsToCreate()).toEqual(['jane@customer.com']);
  });

  it('should match a connected account handle that has uppercase letters', async () => {
    // Participant handles are stored lowercased, while an IMAP handle is
    // saved as the user typed it.
    await service.saveMessagesAndEnqueueContactCreation(
      [aSentMessage('john.doe@acme.com')],
      aMessageChannel(),
      {
        handle: 'John.Doe@Acme.com',
        handleAliases: [],
      } as unknown as ConnectedAccountEntity,
      WORKSPACE_ID,
    );

    expect(getContactsToCreate()).toEqual(['jane@customer.com']);
  });

  it('should match a handle alias that has uppercase letters', async () => {
    // Gmail send-as aliases are stored as configured in Gmail.
    await service.saveMessagesAndEnqueueContactCreation(
      [aSentMessage('sales@acme.com')],
      aMessageChannel(),
      {
        handle: 'john.doe@acme.com',
        handleAliases: ['Sales@Acme.com'],
      } as unknown as ConnectedAccountEntity,
      WORKSPACE_ID,
    );

    expect(getContactsToCreate()).toEqual(['jane@customer.com']);
  });
});
