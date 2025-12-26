import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { FieldActorSource, MessageParticipantRole } from 'twenty-shared/types';

import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { getQueueToken } from 'src/engine/core-modules/message-queue/utils/get-queue-token.util';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { type ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { CreateCompanyAndContactJob } from 'src/modules/contact-creation-manager/jobs/create-company-and-contact.job';
import { MessageDirection } from 'src/modules/messaging/common/enums/message-direction.enum';
import {
  MessageChannelContactAutoCreationPolicy,
  type MessageChannelWorkspaceEntity,
} from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import { MessagingMessageService } from 'src/modules/messaging/message-import-manager/services/messaging-message.service';
import { MessagingSaveMessagesAndEnqueueContactCreationService } from 'src/modules/messaging/message-import-manager/services/messaging-save-messages-and-enqueue-contact-creation.service';
import { type MessageWithParticipants } from 'src/modules/messaging/message-import-manager/types/message';
import { MessagingMessageParticipantService } from 'src/modules/messaging/message-participant-manager/services/messaging-message-participant.service';

describe('MessagingSaveMessagesAndEnqueueContactCreationService', () => {
  let service: MessagingSaveMessagesAndEnqueueContactCreationService;
  let messageQueueService: MessageQueueService;
  let messageService: MessagingMessageService;
  let messageParticipantService: MessagingMessageParticipantService;

  let datasourceInstance: { transaction: jest.Mock };

  const workspaceId = 'workspace-id';

  const mockConnectedAccount: ConnectedAccountWorkspaceEntity = {
    id: 'connected-account-id',
    handle: 'test@example.com',
    handleAliases: 'alias1@example.com,alias2@example.com',
  } as ConnectedAccountWorkspaceEntity;

  const mockMessageChannel: MessageChannelWorkspaceEntity = {
    id: 'message-channel-id',
    isContactAutoCreationEnabled: true,
    contactAutoCreationPolicy:
      MessageChannelContactAutoCreationPolicy.SENT_AND_RECEIVED,
    excludeNonProfessionalEmails: true,
    excludeGroupEmails: true,
  } as MessageChannelWorkspaceEntity;

  const mockMessages: MessageWithParticipants[] = [
    {
      externalId: 'message-1',
      headerMessageId: 'header-message-id-1',
      subject: 'Test Subject 1',
      text: 'Test content 1',
      receivedAt: new Date(),
      attachments: [],
      messageThreadExternalId: 'thread-1',
      direction: MessageDirection.OUTGOING,
      participants: [
        {
          role: MessageParticipantRole.FROM,
          handle: 'test@example.com',
          displayName: 'Test User',
        },
        {
          role: MessageParticipantRole.TO,
          handle: 'contact@company.com',
          displayName: 'Contact',
        },
      ],
    },
    {
      externalId: 'message-2',
      headerMessageId: 'header-message-id-2',
      subject: 'Test Subject 2',
      text: 'Test content 2',
      receivedAt: new Date(),
      attachments: [],
      messageThreadExternalId: 'thread-1',
      direction: MessageDirection.INCOMING,
      participants: [
        {
          role: MessageParticipantRole.FROM,
          handle: 'contact@company.com',
          displayName: 'Contact',
        },
        {
          role: MessageParticipantRole.TO,
          handle: 'test@example.com',
          displayName: 'Test User',
        },
        {
          role: MessageParticipantRole.TO,
          handle: 'personal@gmail.com',
          displayName: 'Personal',
        },
        {
          role: MessageParticipantRole.TO,
          handle: 'team@lists.company.com',
          displayName: 'Group email',
        },
      ],
    },
  ];

  beforeEach(async () => {
    datasourceInstance = {
      transaction: jest.fn().mockImplementation(async (callback) => {
        return callback({});
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessagingSaveMessagesAndEnqueueContactCreationService,
        {
          provide: MessageQueueService,
          useValue: {
            add: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: getQueueToken(MessageQueue.contactCreationQueue),
          useValue: {
            add: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: getRepositoryToken(ObjectMetadataEntity),
          useValue: {
            findOneOrFail: jest.fn(),
          },
        },
        {
          provide: MessagingMessageService,
          useValue: {
            saveMessagesWithinTransaction: jest.fn().mockResolvedValue({
              messageExternalIdsAndIdsMap: new Map([
                ['message-1', 'db-message-id-1'],
                ['message-2', 'db-message-id-2'],
              ]),
              createdMessages: [
                { id: 'db-message-id-1' },
                { id: 'db-message-id-2' },
              ],
            }),
          },
        },
        {
          provide: MessagingMessageParticipantService,
          useValue: {
            saveMessageParticipants: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: GlobalWorkspaceOrmManager,
          useValue: {
            getGlobalWorkspaceDataSource: jest
              .fn()
              .mockResolvedValue(datasourceInstance),
            executeInWorkspaceContext: jest
              .fn()
              .mockImplementation((_authContext: any, fn: () => any) => fn()),
          },
        },
      ],
    }).compile();

    service = module.get<MessagingSaveMessagesAndEnqueueContactCreationService>(
      MessagingSaveMessagesAndEnqueueContactCreationService,
    );
    messageQueueService = module.get<MessageQueueService>(
      getQueueToken(MessageQueue.contactCreationQueue),
    );
    messageService = module.get<MessagingMessageService>(
      MessagingMessageService,
    );
    messageParticipantService = module.get<MessagingMessageParticipantService>(
      MessagingMessageParticipantService,
    );
  });

  it('should save messages and enqueue contact creation', async () => {
    await service.saveMessagesAndEnqueueContactCreation(
      mockMessages,
      mockMessageChannel,
      mockConnectedAccount,
      workspaceId,
    );

    expect(messageService.saveMessagesWithinTransaction).toHaveBeenCalledWith(
      mockMessages,
      mockMessageChannel.id,
      expect.any(Object),
      workspaceId,
    );

    expect(
      messageParticipantService.saveMessageParticipants,
    ).toHaveBeenCalled();
    expect(messageQueueService.add).toHaveBeenCalled();
  });

  it('should not enqueue contact creation when it is disabled', async () => {
    await service.saveMessagesAndEnqueueContactCreation(
      mockMessages,
      {
        ...mockMessageChannel,
        isContactAutoCreationEnabled: false,
      },
      mockConnectedAccount,
      workspaceId,
    );

    expect(messageService.saveMessagesWithinTransaction).toHaveBeenCalled();
    expect(messageQueueService.add).not.toHaveBeenCalled();
  });

  it('should create external contacts', async () => {
    await service.saveMessagesAndEnqueueContactCreation(
      [
        {
          ...mockMessages[1],
          participants: [
            {
              role: MessageParticipantRole.FROM,
              handle: 'tim@apple.com',
              displayName: 'participant email',
            },
          ],
        },
      ],
      mockMessageChannel,
      mockConnectedAccount,
      workspaceId,
    );

    expect(messageQueueService.add).toHaveBeenCalledWith(
      CreateCompanyAndContactJob.name,
      {
        workspaceId,
        connectedAccount: mockConnectedAccount,
        source: FieldActorSource.EMAIL,
        contactsToCreate: [
          {
            handle: 'tim@apple.com',
            displayName: 'participant email',
            role: MessageParticipantRole.FROM,
            shouldCreateContact: true,
            messageId: 'db-message-id-2',
          },
        ],
      },
    );
  });

  it('should not create personal emails contacts', async () => {
    await service.saveMessagesAndEnqueueContactCreation(
      [
        {
          ...mockMessages[0],
          participants: [
            {
              role: MessageParticipantRole.FROM,
              handle: 'test@gmail.com',
              displayName: 'participant personal email',
            },
          ],
        },
      ],
      mockMessageChannel,
      mockConnectedAccount,
      workspaceId,
    );

    expect(messageQueueService.add).toHaveBeenCalledWith(
      CreateCompanyAndContactJob.name,
      {
        workspaceId,
        connectedAccount: mockConnectedAccount,
        source: FieldActorSource.EMAIL,
        contactsToCreate: [],
      },
    );
  });
  it('should not create contact if the participant is the connected account', async () => {
    const mockMessagesWithConnectedAccount = [
      {
        ...mockMessages[0],
        participants: [
          {
            role: MessageParticipantRole.FROM,
            handle: 'connected@account.com',
            displayName: 'participant that is the Connected Account',
          },
        ],
      },
    ];

    await service.saveMessagesAndEnqueueContactCreation(
      mockMessagesWithConnectedAccount,
      mockMessageChannel,
      {
        ...mockConnectedAccount,
        handle: 'connected@account.com',
      },
      workspaceId,
    );

    expect(messageQueueService.add).toHaveBeenCalledWith(
      CreateCompanyAndContactJob.name,
      {
        workspaceId,
        connectedAccount: {
          ...mockConnectedAccount,
          handle: 'connected@account.com',
        },
        source: FieldActorSource.EMAIL,
        contactsToCreate: [],
      },
    );
  });
});
