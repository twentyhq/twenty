import { ConfigService } from '@nestjs/config';
import { Test, type TestingModule } from '@nestjs/testing';

import { ConnectedAccountProvider } from 'twenty-shared/types';

import { TwentyConfigModule } from 'src/engine/core-modules/twenty-config/twenty-config.module';
import { MicrosoftOAuth2ClientManagerService } from 'src/modules/connected-account/oauth2-client-manager/drivers/microsoft/microsoft-oauth2-client-manager.service';
import { OAuth2ClientManagerService } from 'src/modules/connected-account/oauth2-client-manager/services/oauth2-client-manager.service';
import { type ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { MessageChannelWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import {
  MessageFolderPendingSyncAction,
  MessageFolderWorkspaceEntity,
} from 'src/modules/messaging/common/standard-objects/message-folder.workspace-entity';
import { microsoftGraphWithMessagesDeltaLink } from 'src/modules/messaging/message-import-manager/drivers/microsoft/mocks/microsoft-api-examples';
import { MessageFolderName } from 'src/modules/messaging/message-import-manager/drivers/microsoft/types/folders';

import { MicrosoftGetMessageListService } from './microsoft-get-message-list.service';
import { MicrosoftMessageListFetchErrorHandler } from './microsoft-message-list-fetch-error-handler.service';

// in case you have "Please provide a valid token" it may be because you need to pass the env varible to the .env.test file
const accessToken = 'replace-with-your-access-token';
const refreshToken = 'replace-with-your-refresh-token';
const syncCursor = `replace-with-your-sync-cursor`;
const mockConnectedAccount: Pick<
  ConnectedAccountWorkspaceEntity,
  | 'provider'
  | 'accessToken'
  | 'refreshToken'
  | 'id'
  | 'handle'
  | 'connectionParameters'
> = {
  id: 'connected-account-id',
  provider: ConnectedAccountProvider.MICROSOFT,
  accessToken: accessToken,
  refreshToken: refreshToken,
  handle: 'test@gmail.com',
  connectionParameters: {},
};

const mockMessageChannel: Pick<
  MessageChannelWorkspaceEntity,
  'id' | 'syncCursor'
> = {
  id: 'message-channel-id',
  syncCursor: '', // Should be empty for Microsoft as cursors are stored at the folder level
};

xdescribe('Microsoft dev tests : get message list service', () => {
  let service: MicrosoftGetMessageListService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [TwentyConfigModule.forRoot()],
      providers: [
        MicrosoftGetMessageListService,
        OAuth2ClientManagerService,
        {
          provide: MicrosoftMessageListFetchErrorHandler,
          useValue: { handleError: jest.fn() },
        },
        MicrosoftOAuth2ClientManagerService,
        ConfigService,
      ],
    }).compile();

    service = module.get<MicrosoftGetMessageListService>(
      MicrosoftGetMessageListService,
    );
  });

  it('Should fetch and return message list successfully', async () => {
    const result = await service.getMessageLists({
      connectedAccount: mockConnectedAccount,
      messageChannel: mockMessageChannel,
      messageFolders: [
        {
          id: 'inbox-folder-id',
          name: MessageFolderName.INBOX,
          syncCursor: 'inbox-sync-cursor',
          isSynced: false,
          isSentFolder: false,
          externalId: null,
          parentFolderId: null,
          pendingSyncAction: MessageFolderPendingSyncAction.NONE,
        },
      ],
    });

    expect(result[0].messageExternalIds.length).toBeGreaterThan(0);
  });

  it('Should throw token error', async () => {
    const mockConnectedAccountUnvalid = {
      id: 'connected-account-id',
      provider: ConnectedAccountProvider.MICROSOFT,
      accessToken: 'invalid-token',
      refreshToken: 'invalid-token',
      handle: 'test@microsoft.com',
      connectionParameters: {},
    };

    await expect(
      service.getMessageLists({
        connectedAccount: mockConnectedAccountUnvalid,
        messageChannel: mockMessageChannel,
        messageFolders: [
          {
            id: 'inbox-folder-id',
            name: MessageFolderName.INBOX,
            syncCursor: 'inbox-sync-cursor',
            isSynced: false,
            isSentFolder: false,
            externalId: null,
            parentFolderId: null,
            pendingSyncAction: MessageFolderPendingSyncAction.NONE,
          },
        ],
      }),
    ).rejects.toThrowError('Access token is undefined or empty');
  });

  // if you need to run this test, you need to manually update the syncCursor to a valid one
  xit('Should fetch and return partial message list successfully', async () => {
    const result = await service.getMessageLists({
      connectedAccount: mockConnectedAccount,
      messageChannel: mockMessageChannel,
      messageFolders: [
        {
          id: 'inbox-folder-id',
          name: MessageFolderName.INBOX,
          syncCursor: syncCursor,
          isSynced: false,
          isSentFolder: false,
          externalId: null,
          parentFolderId: null,
          pendingSyncAction: MessageFolderPendingSyncAction.NONE,
        },
      ],
    });

    expect(result[0].nextSyncCursor).toBeTruthy();
  });

  it('Should fail partial message if syncCursor is invalid', async () => {
    await expect(
      service.getMessageLists({
        messageChannel: {
          id: 'message-channel-id',
          syncCursor: '',
        },
        connectedAccount: mockConnectedAccount,
        messageFolders: [
          {
            id: 'inbox-folder-id',
            name: MessageFolderName.INBOX,
            syncCursor: 'invalid-syncCursor',
            isSynced: false,
            isSentFolder: false,
            externalId: null,
            parentFolderId: null,
            pendingSyncAction: MessageFolderPendingSyncAction.NONE,
          },
        ],
      }),
    ).rejects.toThrowError(
      /Resource not found for the segment|Badly formed content/g,
    );
  });
});

xdescribe('Microsoft dev tests : get message list service for folders', () => {
  let service: MicrosoftGetMessageListService;

  const inboxFolder = new MessageFolderWorkspaceEntity();

  inboxFolder.id = 'inbox-folder-id';
  inboxFolder.name = MessageFolderName.INBOX;
  inboxFolder.syncCursor = 'inbox-sync-cursor';
  inboxFolder.messageChannelId = 'message-channel-1';
  inboxFolder.parentFolderId = null;

  const sentFolder = new MessageFolderWorkspaceEntity();

  sentFolder.id = 'sent-folder-id';
  sentFolder.name = MessageFolderName.SENT_ITEMS;
  sentFolder.syncCursor = 'sent-sync-cursor';
  sentFolder.messageChannelId = 'message-channel-1';
  sentFolder.parentFolderId = null;

  const otherFolder = new MessageFolderWorkspaceEntity();

  otherFolder.id = 'other-folder-id';
  otherFolder.name = 'other';
  otherFolder.syncCursor = 'other-sync-cursor';
  otherFolder.messageChannelId = 'message-channel-2';
  otherFolder.parentFolderId = null;

  const messageChannelNoFolders = new MessageChannelWorkspaceEntity();

  messageChannelNoFolders.id = 'message-channel-0';
  messageChannelNoFolders.messageFolders = [];
  messageChannelNoFolders.syncCursor = '';

  const messageChannelMicrosoftOneFolder = new MessageChannelWorkspaceEntity();

  messageChannelMicrosoftOneFolder.id = 'message-channel-1';
  messageChannelMicrosoftOneFolder.messageFolders = [inboxFolder];
  messageChannelMicrosoftOneFolder.syncCursor = '';

  const messageChannelMicrosoft = new MessageChannelWorkspaceEntity();

  messageChannelMicrosoft.id = 'message-channel-2';
  messageChannelMicrosoft.messageFolders = [inboxFolder, sentFolder];
  messageChannelMicrosoft.syncCursor = '';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [TwentyConfigModule.forRoot()],
      providers: [
        MicrosoftGetMessageListService,
        OAuth2ClientManagerService,
        {
          provide: MicrosoftMessageListFetchErrorHandler,
          useValue: { handleError: jest.fn() },
        },
        MicrosoftOAuth2ClientManagerService,
        ConfigService,
      ],
    }).compile();

    service = module.get<MicrosoftGetMessageListService>(
      MicrosoftGetMessageListService,
    );

    const mockMicrosoftClient = {
      api: jest.fn().mockReturnThis(),
      version: jest.fn().mockReturnThis(),
      headers: jest.fn().mockReturnThis(),
      get: jest.fn().mockResolvedValue(microsoftGraphWithMessagesDeltaLink),
    };

    jest
      .spyOn(OAuth2ClientManagerService.prototype, 'getMicrosoftOAuth2Client')
      .mockResolvedValue(mockMicrosoftClient as any);
  });

  it('Should return empty array', async () => {
    const result = await service.getMessageLists({
      messageChannel: messageChannelNoFolders,
      connectedAccount: mockConnectedAccount,
      messageFolders: [],
    });

    expect(result.length).toBe(0);
  });

  it('Should return an array of one items', async () => {
    const result = await service.getMessageLists({
      messageChannel: messageChannelMicrosoftOneFolder,
      connectedAccount: mockConnectedAccount,
      messageFolders: [inboxFolder],
    });

    expect(result.length).toBe(1);
    expect(result[0].folderId).toBe(inboxFolder.id);
    expect(result[0].messageExternalIds.length).toBeGreaterThan(0);
  });

  it('Should return an array of two items', async () => {
    const result = await service.getMessageLists({
      messageChannel: messageChannelMicrosoft,
      connectedAccount: mockConnectedAccount,
      messageFolders: [inboxFolder, sentFolder],
    });

    expect(result.length).toBe(2);
  });
});
