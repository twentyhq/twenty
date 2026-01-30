import { Test, TestingModule } from '@nestjs/testing';

import { In, Repository } from 'typeorm';
import { v4 } from 'uuid';

import { FileUploadService } from 'src/engine/core-modules/file/file-upload/services/file-upload.service';
import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { type MessageChannelMessageAssociationWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel-message-association.workspace-entity';
import { type MessageThreadWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-thread.workspace-entity';
import { type MessageWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message.workspace-entity';
import { type MessageAttachmentWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-attachment.workspace-entity';
import { MessagingMessageService } from 'src/modules/messaging/message-import-manager/services/messaging-message.service';
import { MessageDirection } from 'src/modules/messaging/common/enums/message-direction.enum';
import { type MessageWithParticipants } from 'src/modules/messaging/message-import-manager/types/message';

jest.mock('uuid', () => ({
  v4: jest.fn(),
}));

describe('MessagingMessageService', () => {
  let service: MessagingMessageService;
  let mockGlobalWorkspaceOrmManager: Partial<GlobalWorkspaceOrmManager>;
  let mockFileUploadService: Partial<FileUploadService>;
  let mockMessageRepository: Partial<Repository<MessageWorkspaceEntity>>;
  let mockMessageThreadRepository: Partial<
    Repository<MessageThreadWorkspaceEntity>
  >;
  let mockMessageChannelMessageAssociationRepository: Partial<
    Repository<MessageChannelMessageAssociationWorkspaceEntity>
  >;
  let mockMessageAttachmentRepository: Partial<
    Repository<MessageAttachmentWorkspaceEntity>
  >;

  const WORKSPACE_ID = 'workspace-id';
  const MESSAGE_CHANNEL_ID = 'channel-id';
  const TRANSACTION_MANAGER = {} as any;

  const mockMessage: MessageWithParticipants = {
    externalId: 'ext-id-1',
    messageThreadExternalId: 'thread-ext-id-1',
    headerMessageId: 'header-id-1',
    subject: 'Test Subject',
    text: 'Test Body',
    receivedAt: new Date(),
    direction: MessageDirection.INBOUND,
    attachments: [
      {
        filename: 'file.txt',
        content: Buffer.from('test content'),
        contentType: 'text/plain',
      },
    ],
    participants: [],
  };

  beforeEach(async () => {
    (v4 as jest.Mock).mockReturnValue('new-uuid');

    mockMessageRepository = {
      find: jest.fn().mockResolvedValue([]),
      insert: jest.fn().mockResolvedValue(undefined),
    };
    mockMessageThreadRepository = {
      insert: jest.fn().mockResolvedValue(undefined),
    };
    mockMessageChannelMessageAssociationRepository = {
      find: jest.fn().mockResolvedValue([]),
      insert: jest.fn().mockResolvedValue(undefined),
    };
    mockMessageAttachmentRepository = {
      insert: jest.fn().mockResolvedValue(undefined),
    };

    mockGlobalWorkspaceOrmManager = {
      executeInWorkspaceContext: jest.fn(async (callback) => callback()),
      getRepository: jest.fn((_, entityName) => {
        if (entityName === 'message') return mockMessageRepository;
        if (entityName === 'messageThread') return mockMessageThreadRepository;
        if (entityName === 'messageChannelMessageAssociation')
          return mockMessageChannelMessageAssociationRepository;
        if (entityName === 'messageAttachment')
          return mockMessageAttachmentRepository;
        return {} as any;
      }),
    };

    mockFileUploadService = {
      uploadFilesFieldFile: jest.fn().mockResolvedValue({
        id: 'file-id-1',
        size: 12,
      } as FileEntity),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessagingMessageService,
        {
          provide: GlobalWorkspaceOrmManager,
          useValue: mockGlobalWorkspaceOrmManager,
        },
        { provide: FileUploadService, useValue: mockFileUploadService },
      ],
    }).compile();

    service = module.get<MessagingMessageService>(MessagingMessageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a new message, thread, association, and attachment', async () => {
    const result = await service.saveMessagesWithinTransaction(
      [mockMessage],
      MESSAGE_CHANNEL_ID,
      TRANSACTION_MANAGER,
      WORKSPACE_ID,
    );

    // Assert thread creation
    expect(mockMessageThreadRepository.insert).toHaveBeenCalledWith(
      [{ id: 'new-uuid' }],
      TRANSACTION_MANAGER,
    );

    // Assert file upload
    expect(mockFileUploadService.uploadFilesFieldFile).toHaveBeenCalledWith({
      file: mockMessage.attachments[0].content,
      filename: mockMessage.attachments[0].filename,
      declaredMimeType: mockMessage.attachments[0].contentType,
      workspaceId: WORKSPACE_ID,
      applicationId: '00000000-0000-0000-0000-000000000000',
    });

    // Assert message creation
    expect(mockMessageRepository.insert).toHaveBeenCalledWith(
      [
        expect.objectContaining({
          id: 'new-uuid',
          headerMessageId: mockMessage.headerMessageId,
          messageThreadId: 'new-uuid',
        }),
      ],
      TRANSACTION_MANAGER,
    );

    // Assert association creation
    expect(
      mockMessageChannelMessageAssociationRepository.insert,
    ).toHaveBeenCalledWith(
      [
        expect.objectContaining({
          messageChannelId: MESSAGE_CHANNEL_ID,
          messageId: 'new-uuid',
          messageExternalId: mockMessage.externalId,
        }),
      ],
      TRANSACTION_MANAGER,
    );

    // Assert attachment creation
    expect(mockMessageAttachmentRepository.insert).toHaveBeenCalledWith(
      [
        expect.objectContaining({
          messageId: 'new-uuid',
          fileId: 'file-id-1',
          filename: mockMessage.attachments[0].filename,
          mimeType: mockMessage.attachments[0].contentType,
          size: 12,
        }),
      ],
      TRANSACTION_MANAGER,
    );

    expect(result.createdMessages.length).toBe(1);
    expect(result.messageExternalIdsAndIdsMap.get('ext-id-1')).toBe('new-uuid');
  });

  it('should update an existing message and create a new attachment', async () => {
    const existingMessage: MessageWorkspaceEntity = {
      id: 'existing-uuid',
      headerMessageId: 'header-id-1',
      messageThreadId: 'existing-thread-id',
    } as MessageWorkspaceEntity;

    mockMessageRepository.find = jest
      .fn()
      .mockResolvedValue([existingMessage]);

    const result = await service.saveMessagesWithinTransaction(
      [mockMessage],
      MESSAGE_CHANNEL_ID,
      TRANSACTION_MANAGER,
      WORKSPACE_ID,
    );

    // Assert thread is not created
    expect(mockMessageThreadRepository.insert).not.toHaveBeenCalled();

    // Assert message is not created (it's updated implicitly by the flow)
    expect(mockMessageRepository.insert).toHaveBeenCalledWith([], TRANSACTION_MANAGER);

    // Assert file upload
    expect(mockFileUploadService.uploadFilesFieldFile).toHaveBeenCalled();

    // Assert attachment creation uses existing message ID
    expect(mockMessageAttachmentRepository.insert).toHaveBeenCalledWith(
      [
        expect.objectContaining({
          messageId: 'existing-uuid',
          fileId: 'file-id-1',
        }),
      ],
      TRANSACTION_MANAGER,
    );

    expect(result.createdMessages.length).toBe(0);
    expect(result.messageExternalIdsAndIdsMap.get('ext-id-1')).toBe(
      'existing-uuid',
    );
  });
});
