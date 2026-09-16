import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { MessageChannelType } from 'twenty-shared/types';

import { EmailingDomainService } from 'src/engine/core-modules/emailing-domain/services/emailing-domain.service';
import { InboxQueueEntity } from 'src/engine/core-modules/inbox/entities/inbox-queue.entity';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { ConnectedAccountMetadataService } from 'src/engine/metadata-modules/connected-account/connected-account-metadata.service';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { MessageChannelExceptionCode } from 'src/engine/metadata-modules/message-channel/message-channel.exception';
import { MessageChannelMetadataService } from 'src/engine/metadata-modules/message-channel/message-channel-metadata.service';
import { getWorkspaceScopedRepositoryToken } from 'src/engine/twenty-orm/workspace-scoped-repository/get-workspace-scoped-repository-token.util';
import { WorkspaceEventEmitter } from 'src/engine/workspace-event-emitter/workspace-event-emitter';

const WORKSPACE_ID = 'workspace-id';
const USER_WORKSPACE_ID = 'user-workspace-id';
const CHANNEL_ID = 'channel-id';
const CONNECTED_ACCOUNT_ID = 'connected-account-id';
const SUPPORT_QUEUE_ID = 'support-queue-id';

const buildChannel = (overrides: Partial<MessageChannelEntity> = {}) =>
  ({
    id: CHANNEL_ID,
    workspaceId: WORKSPACE_ID,
    connectedAccountId: CONNECTED_ACCOUNT_ID,
    type: MessageChannelType.EMAIL_GROUP,
    handle: 'hello@example.invalid',
    displayName: 'Support',
    defaultInboxQueueId: null,
    ...overrides,
  }) as MessageChannelEntity;

describe('MessageChannelMetadataService', () => {
  let service: MessageChannelMetadataService;

  const repository = {
    findOne: jest.fn(),
    findOneOrFail: jest.fn(),
    update: jest.fn(),
  };
  const inboxQueueRepository = { findOne: jest.fn() };
  const connectedAccountMetadataService = {
    findById: jest.fn(),
    isAdministrableByCaller: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    repository.findOne.mockResolvedValue(buildChannel());
    repository.update.mockResolvedValue({ affected: 1 });
    repository.findOneOrFail.mockImplementation(() =>
      Promise.resolve(buildChannel()),
    );
    inboxQueueRepository.findOne.mockResolvedValue({ id: SUPPORT_QUEUE_ID });
    connectedAccountMetadataService.findById.mockResolvedValue({
      id: CONNECTED_ACCOUNT_ID,
    });
    connectedAccountMetadataService.isAdministrableByCaller.mockResolvedValue(
      true,
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessageChannelMetadataService,
        {
          provide: getRepositoryToken(MessageChannelEntity),
          useValue: repository,
        },
        {
          provide: getWorkspaceScopedRepositoryToken(InboxQueueEntity),
          useValue: inboxQueueRepository,
        },
        {
          provide: ConnectedAccountMetadataService,
          useValue: connectedAccountMetadataService,
        },
        { provide: TwentyConfigService, useValue: { get: jest.fn() } },
        { provide: EmailingDomainService, useValue: {} },
        {
          provide: WorkspaceEventEmitter,
          useValue: { emitCustomBatchEvent: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<MessageChannelMetadataService>(
      MessageChannelMetadataService,
    );
  });

  describe('updateEmailGroupChannel', () => {
    it('should point the channel at the shared inbox its mail should land in', async () => {
      await service.updateEmailGroupChannel({
        id: CHANNEL_ID,
        defaultInboxQueueId: SUPPORT_QUEUE_ID,
        userWorkspaceId: USER_WORKSPACE_ID,
        workspaceId: WORKSPACE_ID,
      });

      expect(repository.update).toHaveBeenCalledWith(
        { id: CHANNEL_ID, workspaceId: WORKSPACE_ID },
        { defaultInboxQueueId: SUPPORT_QUEUE_ID },
      );
    });

    // A queue from another workspace would satisfy the foreign key and become
    // an address nobody here can see into.
    it('should reject a shared inbox that does not belong to the workspace', async () => {
      inboxQueueRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updateEmailGroupChannel({
          id: CHANNEL_ID,
          defaultInboxQueueId: SUPPORT_QUEUE_ID,
          userWorkspaceId: USER_WORKSPACE_ID,
          workspaceId: WORKSPACE_ID,
        }),
      ).rejects.toMatchObject({
        code: MessageChannelExceptionCode.INVALID_MESSAGE_CHANNEL_INPUT,
      });

      expect(repository.update).not.toHaveBeenCalled();
    });

    it('should send the channel back to the default routing on an explicit null', async () => {
      await service.updateEmailGroupChannel({
        id: CHANNEL_ID,
        defaultInboxQueueId: null,
        userWorkspaceId: USER_WORKSPACE_ID,
        workspaceId: WORKSPACE_ID,
      });

      expect(inboxQueueRepository.findOne).not.toHaveBeenCalled();
      expect(repository.update).toHaveBeenCalledWith(
        { id: CHANNEL_ID, workspaceId: WORKSPACE_ID },
        { defaultInboxQueueId: null },
      );
    });

    // Changing one setting must not blank out the other.
    it('should leave the sender name alone when only the shared inbox is given', async () => {
      await service.updateEmailGroupChannel({
        id: CHANNEL_ID,
        defaultInboxQueueId: SUPPORT_QUEUE_ID,
        userWorkspaceId: USER_WORKSPACE_ID,
        workspaceId: WORKSPACE_ID,
      });

      expect(repository.update).toHaveBeenCalledWith(
        expect.anything(),
        expect.not.objectContaining({ displayName: expect.anything() }),
      );
    });

    it('should leave the shared inbox alone when only the sender name is given', async () => {
      await service.updateEmailGroupChannel({
        id: CHANNEL_ID,
        displayName: 'Customer support',
        userWorkspaceId: USER_WORKSPACE_ID,
        workspaceId: WORKSPACE_ID,
      });

      expect(repository.update).toHaveBeenCalledWith(
        { id: CHANNEL_ID, workspaceId: WORKSPACE_ID },
        { displayName: 'Customer support' },
      );
    });

    it('should not write at all when neither setting is given', async () => {
      await service.updateEmailGroupChannel({
        id: CHANNEL_ID,
        userWorkspaceId: USER_WORKSPACE_ID,
        workspaceId: WORKSPACE_ID,
      });

      expect(repository.update).not.toHaveBeenCalled();
    });

    it('should refuse a channel that is not an email group', async () => {
      repository.findOne.mockResolvedValue(
        buildChannel({ type: MessageChannelType.EMAIL }),
      );

      await expect(
        service.updateEmailGroupChannel({
          id: CHANNEL_ID,
          defaultInboxQueueId: SUPPORT_QUEUE_ID,
          userWorkspaceId: USER_WORKSPACE_ID,
          workspaceId: WORKSPACE_ID,
        }),
      ).rejects.toMatchObject({
        code: MessageChannelExceptionCode.INVALID_MESSAGE_CHANNEL_INPUT,
      });
    });
  });
});
