import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import {
  ConnectedAccountProvider,
  MessageChannelSyncStage,
  MessageFolderPendingSyncAction,
} from 'twenty-shared/types';
import { In } from 'typeorm';

import { ConnectedAccountMetadataService } from 'src/engine/metadata-modules/connected-account/connected-account-metadata.service';
import { MessageChannelMetadataService } from 'src/engine/metadata-modules/message-channel/message-channel-metadata.service';
import { MessageFolderEntity } from 'src/engine/metadata-modules/message-folder/entities/message-folder.entity';
import { MessageFolderMetadataService } from 'src/engine/metadata-modules/message-folder/message-folder-metadata.service';

describe('MessageFolderMetadataService', () => {
  let service: MessageFolderMetadataService;
  let messageFolderRepository: {
    find: jest.Mock;
    findOne: jest.Mock;
    findOneOrFail: jest.Mock;
    update: jest.Mock;
  };
  let messageChannelMetadataService: {
    findById: jest.Mock;
    update: jest.Mock;
  };
  let connectedAccountMetadataService: {
    findById: jest.Mock;
    getUserConnectedAccountIds: jest.Mock;
  };

  beforeEach(async () => {
    messageFolderRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      findOneOrFail: jest.fn(),
      update: jest.fn().mockResolvedValue(undefined),
    };
    messageChannelMetadataService = {
      findById: jest.fn(),
      update: jest.fn().mockResolvedValue(undefined),
    };
    connectedAccountMetadataService = {
      findById: jest.fn(),
      getUserConnectedAccountIds: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessageFolderMetadataService,
        {
          provide: getRepositoryToken(MessageFolderEntity),
          useValue: messageFolderRepository,
        },
        {
          provide: MessageChannelMetadataService,
          useValue: messageChannelMetadataService,
        },
        {
          provide: ConnectedAccountMetadataService,
          useValue: connectedAccountMetadataService,
        },
      ],
    }).compile();

    service = module.get<MessageFolderMetadataService>(
      MessageFolderMetadataService,
    );
  });

  it('resets the Google channel cursor when disabled folders are enabled in bulk', async () => {
    messageFolderRepository.find
      .mockResolvedValueOnce([
        {
          id: 'folder-1',
          messageChannelId: 'google-channel',
        },
        {
          id: 'folder-2',
          messageChannelId: 'imap-channel',
        },
      ])
      .mockResolvedValueOnce([
        {
          id: 'folder-1',
          isSynced: true,
        },
        {
          id: 'folder-2',
          isSynced: true,
        },
      ]);

    messageChannelMetadataService.findById.mockImplementation(({ id }) => {
      if (id === 'google-channel') {
        return Promise.resolve({
          id,
          connectedAccountId: 'google-account',
        });
      }

      return Promise.resolve({
        id,
        connectedAccountId: 'imap-account',
      });
    });

    connectedAccountMetadataService.findById.mockImplementation(({ id }) => {
      if (id === 'google-account') {
        return Promise.resolve({
          id,
          provider: ConnectedAccountProvider.GOOGLE,
        });
      }

      return Promise.resolve({
        id,
        provider: ConnectedAccountProvider.IMAP_SMTP_CALDAV,
      });
    });

    await service.updateMany({
      ids: ['folder-1', 'folder-2'],
      workspaceId: 'workspace-id',
      data: { isSynced: true },
    });

    expect(messageFolderRepository.find).toHaveBeenNthCalledWith(1, {
      where: {
        id: In(['folder-1', 'folder-2']),
        workspaceId: 'workspace-id',
        isSynced: false,
      },
      select: ['id', 'messageChannelId'],
    });
    expect(messageChannelMetadataService.update).toHaveBeenCalledTimes(1);
    expect(messageChannelMetadataService.update).toHaveBeenCalledWith({
      id: 'google-channel',
      workspaceId: 'workspace-id',
      data: {
        syncCursor: '',
        syncStage: MessageChannelSyncStage.MESSAGE_LIST_FETCH_PENDING,
        syncStageStartedAt: null,
      },
    });
    expect(messageFolderRepository.update).toHaveBeenCalledWith(
      { id: In(['folder-1', 'folder-2']), workspaceId: 'workspace-id' },
      { isSynced: true },
    );
  });

  it('does not reset channel cursors when folders are disabled', async () => {
    messageFolderRepository.find.mockResolvedValueOnce([
      {
        id: 'folder-1',
        isSynced: false,
      },
    ]);

    await service.updateMany({
      ids: ['folder-1'],
      workspaceId: 'workspace-id',
      data: { isSynced: false },
    });

    expect(messageChannelMetadataService.findById).not.toHaveBeenCalled();
    expect(messageChannelMetadataService.update).not.toHaveBeenCalled();
    expect(messageFolderRepository.update).toHaveBeenCalledWith(
      { id: In(['folder-1']), workspaceId: 'workspace-id' },
      { isSynced: false },
    );
  });

  it('resets the Google channel cursor when one disabled folder is enabled', async () => {
    messageFolderRepository.find.mockResolvedValueOnce([
      {
        id: 'folder-1',
        messageChannelId: 'google-channel',
      },
    ]);
    messageFolderRepository.findOneOrFail.mockResolvedValueOnce({
      id: 'folder-1',
      isSynced: true,
      pendingSyncAction: MessageFolderPendingSyncAction.NONE,
    });
    messageChannelMetadataService.findById.mockResolvedValueOnce({
      id: 'google-channel',
      connectedAccountId: 'google-account',
    });
    connectedAccountMetadataService.findById.mockResolvedValueOnce({
      id: 'google-account',
      provider: ConnectedAccountProvider.GOOGLE,
    });

    await service.update({
      id: 'folder-1',
      workspaceId: 'workspace-id',
      data: { isSynced: true },
    });

    expect(messageChannelMetadataService.update).toHaveBeenCalledWith({
      id: 'google-channel',
      workspaceId: 'workspace-id',
      data: {
        syncCursor: '',
        syncStage: MessageChannelSyncStage.MESSAGE_LIST_FETCH_PENDING,
        syncStageStartedAt: null,
      },
    });
    expect(messageFolderRepository.update).toHaveBeenCalledWith(
      { id: 'folder-1', workspaceId: 'workspace-id' },
      { isSynced: true },
    );
  });
});
