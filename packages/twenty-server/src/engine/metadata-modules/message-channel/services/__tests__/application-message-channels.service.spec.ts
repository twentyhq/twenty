import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import {
  ConnectedAccountProvider,
  MessageChannelType,
  MessageChannelVisibility,
} from 'twenty-shared/types';
import { type Repository } from 'typeorm';

import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import {
  MessageChannelException,
  MessageChannelExceptionCode,
} from 'src/engine/metadata-modules/message-channel/message-channel.exception';
import { ApplicationMessageChannelsService } from 'src/engine/metadata-modules/message-channel/services/application-message-channels.service';
import { WorkspaceEventEmitter } from 'src/engine/workspace-event-emitter/workspace-event-emitter';

const APPLICATION_ID = '11111111-1111-4111-8111-111111111111';
const OTHER_APPLICATION_ID = '22222222-2222-4222-8222-222222222222';
const WORKSPACE_ID = '33333333-3333-4333-8333-333333333333';
const CONNECTED_ACCOUNT_ID = '44444444-4444-4444-8444-444444444444';
const MESSAGE_CHANNEL_ID = '55555555-5555-4555-8555-555555555555';

describe('ApplicationMessageChannelsService', () => {
  let service: ApplicationMessageChannelsService;
  let messageChannelRepository: jest.Mocked<Repository<MessageChannelEntity>>;
  let connectedAccountRepository: jest.Mocked<
    Repository<ConnectedAccountEntity>
  >;
  let workspaceEventEmitter: jest.Mocked<WorkspaceEventEmitter>;

  const scope = { applicationId: APPLICATION_ID, workspaceId: WORKSPACE_ID };

  beforeEach(async () => {
    messageChannelRepository = {
      find: jest.fn().mockResolvedValue([]),
      findOne: jest.fn().mockResolvedValue(null),
      findOneOrFail: jest.fn(),
      create: jest.fn().mockImplementation((data) => data),
      save: jest.fn().mockImplementation(async (data) => data),
      update: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<Repository<MessageChannelEntity>>;

    connectedAccountRepository = {
      find: jest.fn().mockResolvedValue([]),
      findOne: jest.fn().mockResolvedValue(null),
    } as unknown as jest.Mocked<Repository<ConnectedAccountEntity>>;

    workspaceEventEmitter = {
      emitCustomBatchEvent: jest.fn(),
    } as unknown as jest.Mocked<WorkspaceEventEmitter>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationMessageChannelsService,
        {
          provide: getRepositoryToken(MessageChannelEntity),
          useValue: messageChannelRepository,
        },
        {
          provide: getRepositoryToken(ConnectedAccountEntity),
          useValue: connectedAccountRepository,
        },
        { provide: WorkspaceEventEmitter, useValue: workspaceEventEmitter },
      ],
    }).compile();

    service = module.get(ApplicationMessageChannelsService);
  });

  const givenTheAppOwnsTheConnection = () => {
    connectedAccountRepository.findOne.mockResolvedValue({
      id: CONNECTED_ACCOUNT_ID,
      applicationId: APPLICATION_ID,
      workspaceId: WORKSPACE_ID,
      provider: ConnectedAccountProvider.APP,
    } as ConnectedAccountEntity);
    connectedAccountRepository.find.mockResolvedValue([
      { id: CONNECTED_ACCOUNT_ID },
    ] as ConnectedAccountEntity[]);
  };

  describe('create', () => {
    it('creates an APP channel on a connection the app owns', async () => {
      givenTheAppOwnsTheConnection();

      const channel = await service.create({
        ...scope,
        connectedAccountId: CONNECTED_ACCOUNT_ID,
        handle: 'urn:li:person:abc',
        displayName: '  Ada Lovelace  ',
        visibility: MessageChannelVisibility.METADATA,
      });

      expect(channel).toEqual(
        expect.objectContaining({
          workspaceId: WORKSPACE_ID,
          connectedAccountId: CONNECTED_ACCOUNT_ID,
          handle: 'urn:li:person:abc',
          displayName: 'Ada Lovelace',
          type: MessageChannelType.APP,
          visibility: MessageChannelVisibility.METADATA,
          isSyncEnabled: true,
        }),
      );
    });

    it('persists the visibility the app asked for rather than a default', async () => {
      givenTheAppOwnsTheConnection();

      const channel = await service.create({
        ...scope,
        connectedAccountId: CONNECTED_ACCOUNT_ID,
        handle: 'urn:li:person:abc',
        visibility: MessageChannelVisibility.SHARE_EVERYTHING,
      });

      expect(channel.visibility).toBe(
        MessageChannelVisibility.SHARE_EVERYTHING,
      );
    });

    it('refuses a connection belonging to another application', async () => {
      connectedAccountRepository.findOne.mockResolvedValue(null);

      await expect(
        service.create({
          applicationId: OTHER_APPLICATION_ID,
          workspaceId: WORKSPACE_ID,
          connectedAccountId: CONNECTED_ACCOUNT_ID,
          handle: 'urn:li:person:abc',
          visibility: MessageChannelVisibility.METADATA,
        }),
      ).rejects.toThrow(MessageChannelException);

      expect(messageChannelRepository.save).not.toHaveBeenCalled();
    });

    it('refuses a second channel for the same handle on one connection', async () => {
      givenTheAppOwnsTheConnection();
      messageChannelRepository.findOne.mockResolvedValue({
        id: MESSAGE_CHANNEL_ID,
      } as MessageChannelEntity);

      await expect(
        service.create({
          ...scope,
          connectedAccountId: CONNECTED_ACCOUNT_ID,
          handle: 'urn:li:person:abc',
          visibility: MessageChannelVisibility.METADATA,
        }),
      ).rejects.toMatchObject({
        code: MessageChannelExceptionCode.INVALID_MESSAGE_CHANNEL_INPUT,
      });
    });
  });

  describe('update', () => {
    it('refuses a channel owned by another application', async () => {
      messageChannelRepository.findOne.mockResolvedValue({
        id: MESSAGE_CHANNEL_ID,
        connectedAccountId: CONNECTED_ACCOUNT_ID,
        type: MessageChannelType.APP,
      } as MessageChannelEntity);
      connectedAccountRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update({
          applicationId: OTHER_APPLICATION_ID,
          workspaceId: WORKSPACE_ID,
          id: MESSAGE_CHANNEL_ID,
          displayName: 'stolen',
        }),
      ).rejects.toMatchObject({
        code: MessageChannelExceptionCode.MESSAGE_CHANNEL_OWNERSHIP_VIOLATION,
      });

      expect(messageChannelRepository.update).not.toHaveBeenCalled();
    });

    it('clears the display name on an explicit null but leaves it on omission', async () => {
      const existing = {
        id: MESSAGE_CHANNEL_ID,
        connectedAccountId: CONNECTED_ACCOUNT_ID,
        type: MessageChannelType.APP,
        displayName: 'Ada',
      } as MessageChannelEntity;

      messageChannelRepository.findOne.mockResolvedValue(existing);
      messageChannelRepository.findOneOrFail.mockResolvedValue(existing);
      givenTheAppOwnsTheConnection();

      await service.update({ ...scope, id: MESSAGE_CHANNEL_ID });
      expect(messageChannelRepository.update).not.toHaveBeenCalled();

      await service.update({
        ...scope,
        id: MESSAGE_CHANNEL_ID,
        displayName: null,
      });
      expect(messageChannelRepository.update).toHaveBeenCalledWith(
        { id: MESSAGE_CHANNEL_ID, workspaceId: WORKSPACE_ID },
        { displayName: null },
      );
    });

    it('does not resolve a channel that is not app-owned', async () => {
      messageChannelRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update({
          ...scope,
          id: MESSAGE_CHANNEL_ID,
          isSyncEnabled: false,
        }),
      ).rejects.toMatchObject({
        code: MessageChannelExceptionCode.MESSAGE_CHANNEL_NOT_FOUND,
      });

      expect(messageChannelRepository.findOne).toHaveBeenCalledWith({
        where: {
          id: MESSAGE_CHANNEL_ID,
          workspaceId: WORKSPACE_ID,
          type: MessageChannelType.APP,
        },
      });
    });
  });

  describe('delete', () => {
    it('emits the channel-deleted event so ingested messages are cleaned up', async () => {
      messageChannelRepository.findOne.mockResolvedValue({
        id: MESSAGE_CHANNEL_ID,
        connectedAccountId: CONNECTED_ACCOUNT_ID,
        type: MessageChannelType.APP,
      } as MessageChannelEntity);
      givenTheAppOwnsTheConnection();

      await service.delete({ ...scope, id: MESSAGE_CHANNEL_ID });

      expect(messageChannelRepository.delete).toHaveBeenCalledWith({
        id: MESSAGE_CHANNEL_ID,
        workspaceId: WORKSPACE_ID,
      });
      expect(workspaceEventEmitter.emitCustomBatchEvent).toHaveBeenCalledWith(
        expect.any(String),
        [{ messageChannelId: MESSAGE_CHANNEL_ID }],
        WORKSPACE_ID,
      );
    });
  });

  describe('list', () => {
    it('returns nothing when the app holds no connections', async () => {
      connectedAccountRepository.find.mockResolvedValue([]);

      await expect(service.list(scope)).resolves.toEqual([]);
      expect(messageChannelRepository.find).not.toHaveBeenCalled();
    });

    it('refuses to filter by a connection the app does not own', async () => {
      connectedAccountRepository.find.mockResolvedValue([
        { id: CONNECTED_ACCOUNT_ID },
      ] as ConnectedAccountEntity[]);

      await expect(
        service.list({ ...scope, connectedAccountId: 'someone-elses' }),
      ).rejects.toMatchObject({
        code: MessageChannelExceptionCode.MESSAGE_CHANNEL_OWNERSHIP_VIOLATION,
      });
    });
  });
});
