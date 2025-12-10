import { Test, type TestingModule } from '@nestjs/testing';

import { FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED } from 'twenty-shared/constants';

import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { MessageChannelVisibility } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import { type MessageWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message.workspace-entity';

import { ApplyMessagesVisibilityRestrictionsService } from './apply-messages-visibility-restrictions.service';

const createMockMessage = (
  id: string,
  subject: string,
  text: string,
): MessageWorkspaceEntity => ({
  id,
  subject,
  text,
  headerMessageId: '',
  receivedAt: new Date('2024-03-20T10:00:00Z'),
  messageThreadId: '',
  messageThread: null,
  messageChannelMessageAssociations: [],
  messageParticipants: [],
  deletedAt: null,
  createdAt: '2024-03-20T09:00:00Z',
  updatedAt: '2024-03-20T09:00:00Z',
});

describe('ApplyMessagesVisibilityRestrictionsService', () => {
  let service: ApplyMessagesVisibilityRestrictionsService;

  const mockMessageChannelMessageAssociationRepository = {
    find: jest.fn(),
  };

  const mockConnectedAccountRepository = {
    find: jest.fn(),
  };

  const mockWorkspaceMemberRepository = {
    findOneByOrFail: jest.fn(),
  };

  const mockGlobalWorkspaceOrmManager = {
    getRepository: jest.fn().mockImplementation((workspaceId, name) => {
      if (name === 'messageChannelMessageAssociation') {
        return mockMessageChannelMessageAssociationRepository;
      }
      if (name === 'connectedAccount') {
        return mockConnectedAccountRepository;
      }
      if (name === 'workspaceMember') {
        return mockWorkspaceMemberRepository;
      }
    }),
    executeInWorkspaceContext: jest
      .fn()
      .mockImplementation((_authContext: any, fn: () => any) => fn()),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplyMessagesVisibilityRestrictionsService,
        {
          provide: GlobalWorkspaceOrmManager,
          useValue: mockGlobalWorkspaceOrmManager,
        },
      ],
    }).compile();

    service = module.get<ApplyMessagesVisibilityRestrictionsService>(
      ApplyMessagesVisibilityRestrictionsService,
    );

    jest.clearAllMocks();
  });

  it('should return message without obfuscated subject and text if the visibility is SHARE_EVERYTHING', async () => {
    const messages = [
      createMockMessage('messageId', 'Test Subject', 'Test Message'),
    ];

    mockMessageChannelMessageAssociationRepository.find.mockResolvedValue([
      {
        messageId: 'messageId',
        messageChannel: {
          id: 'messageChannelId',
          visibility: MessageChannelVisibility.SHARE_EVERYTHING,
        },
      },
    ]);

    const result = await service.applyMessagesVisibilityRestrictions(
      messages,
      'test-workspace-id',
      'user-id',
    );

    expect(result).toEqual(messages);
    expect(
      result.every(
        (item) =>
          item.subject === 'Test Subject' && item.text === 'Test Message',
      ),
    ).toBe(true);
    expect(mockConnectedAccountRepository.find).not.toHaveBeenCalled();
  });

  it('should return message without obfuscated subject and with obfuscated text if the visibility is SUBJECT', async () => {
    const messages = [
      createMockMessage('messageId', 'Test Subject', 'Test Message'),
    ];

    mockMessageChannelMessageAssociationRepository.find.mockResolvedValue([
      {
        messageId: 'messageId',
        messageChannel: {
          id: 'messageChannelId',
          visibility: MessageChannelVisibility.SUBJECT,
        },
      },
    ]);

    mockConnectedAccountRepository.find.mockResolvedValue([]);

    mockWorkspaceMemberRepository.findOneByOrFail.mockResolvedValue({
      id: 'workspace-member-id',
    });

    const result = await service.applyMessagesVisibilityRestrictions(
      messages,
      'test-workspace-id',
      'user-id',
    );

    expect(result).toEqual([
      {
        ...messages[0],
        text: FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED,
      },
    ]);
  });

  it('should return message with obfuscated subject and text if the visibility is METADATA', async () => {
    const messages = [
      createMockMessage('messageId', 'Test Subject', 'Test Message'),
    ];

    mockMessageChannelMessageAssociationRepository.find.mockResolvedValue([
      {
        messageId: 'messageId',
        messageChannel: {
          id: 'messageChannelId',
          visibility: MessageChannelVisibility.METADATA,
        },
      },
    ]);

    mockConnectedAccountRepository.find.mockResolvedValue([]);

    mockWorkspaceMemberRepository.findOneByOrFail.mockResolvedValue({
      id: 'workspace-member-id',
    });

    const result = await service.applyMessagesVisibilityRestrictions(
      messages,
      'test-workspace-id',
      'user-id',
    );

    expect(result).toEqual([
      {
        ...messages[0],
        subject: FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED,
        text: FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED,
      },
    ]);
  });

  it('should return message without obfuscated subject and text if the visibility is METADATA and the workspace member is the channel owner', async () => {
    const messages = [
      createMockMessage('messageId', 'Test Subject', 'Test Message'),
    ];

    mockMessageChannelMessageAssociationRepository.find.mockResolvedValue([
      {
        messageId: 'messageId',
        messageChannel: {
          id: 'messageChannelId',
          visibility: MessageChannelVisibility.METADATA,
        },
      },
    ]);

    mockWorkspaceMemberRepository.findOneByOrFail.mockResolvedValue({
      id: 'workspace-member-account-owner-id',
    });

    mockConnectedAccountRepository.find.mockResolvedValue([{ id: '1' }]);

    const result = await service.applyMessagesVisibilityRestrictions(
      messages,
      'test-workspace-id',
      'user-id',
    );

    expect(result).toEqual(messages);
    expect(
      result.every(
        (item) =>
          item.subject === 'Test Subject' && item.text === 'Test Message',
      ),
    ).toBe(true);
  });

  it('should not return message if visibility is not SHARE_EVERYTHING, SUBJECT or METADATA and the workspace member is not the channel owner', async () => {
    const messages = [
      createMockMessage('messageId', 'Test Subject', 'Test Message'),
    ];

    mockMessageChannelMessageAssociationRepository.find.mockResolvedValue([
      {
        messageId: 'messageId',
        messageChannel: {
          id: 'messageChannelId',
        },
      },
    ]);

    mockWorkspaceMemberRepository.findOneByOrFail.mockResolvedValue({
      id: 'workspace-member-not-account-owner-id',
    });

    mockConnectedAccountRepository.find.mockResolvedValue([]);

    const result = await service.applyMessagesVisibilityRestrictions(
      messages,
      'test-workspace-id',
      'user-id',
    );

    expect(result).toEqual([]);
  });

  it('should return all messages with the right visibility', async () => {
    const messages = [
      createMockMessage('1', 'Subject 1', 'Message 1'),
      createMockMessage('2', 'Subject 2', 'Message 2'),
      createMockMessage('3', 'Subject 3', 'Message 3'),
    ];

    mockMessageChannelMessageAssociationRepository.find.mockResolvedValue([
      {
        messageId: '1',
        messageChannel: {
          id: '1',
          visibility: MessageChannelVisibility.SHARE_EVERYTHING,
        },
      },
      {
        messageId: '2',
        messageChannel: {
          id: '2',
          visibility: MessageChannelVisibility.SUBJECT,
        },
      },
      {
        messageId: '3',
        messageChannel: {
          id: '3',
          visibility: MessageChannelVisibility.METADATA,
        },
      },
    ]);

    mockWorkspaceMemberRepository.findOneByOrFail.mockResolvedValue({
      id: 'workspace-member-id',
    });

    mockConnectedAccountRepository.find
      .mockResolvedValueOnce([]) // request for message 3
      .mockResolvedValueOnce([]); // request for message 2

    const result = await service.applyMessagesVisibilityRestrictions(
      messages,
      'test-workspace-id',
      'user-id',
    );

    expect(result).toEqual([
      messages[0],
      {
        ...messages[1],
        text: FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED,
      },
      {
        ...messages[2],
        subject: FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED,
        text: FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED,
      },
    ]);
  });

  it('should return all messages with the right visibility when userId is undefined (api key request)', async () => {
    const messages = [
      createMockMessage('1', 'Subject 1', 'Message 1'),
      createMockMessage('2', 'Subject 2', 'Message 2'),
      createMockMessage('3', 'Subject 3', 'Message 3'),
    ];

    mockMessageChannelMessageAssociationRepository.find.mockResolvedValue([
      {
        messageId: '1',
        messageChannel: {
          id: '1',
          visibility: MessageChannelVisibility.SHARE_EVERYTHING,
        },
      },
      {
        messageId: '2',
        messageChannel: {
          id: '2',
          visibility: MessageChannelVisibility.SUBJECT,
        },
      },
      {
        messageId: '3',
        messageChannel: {
          id: '3',
          visibility: MessageChannelVisibility.METADATA,
        },
      },
    ]);

    mockWorkspaceMemberRepository.findOneByOrFail.mockResolvedValue({
      id: 'workspace-member-id',
    });

    mockConnectedAccountRepository.find
      .mockResolvedValueOnce([]) // request for message 3
      .mockResolvedValueOnce([]); // request for message 2

    const result = await service.applyMessagesVisibilityRestrictions(
      messages,
      'test-workspace-id',
      undefined,
    );

    expect(result).toEqual([
      messages[0],
      {
        ...messages[1],
        text: FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED,
      },
      {
        ...messages[2],
        subject: FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED,
        text: FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED,
      },
    ]);
  });
});
