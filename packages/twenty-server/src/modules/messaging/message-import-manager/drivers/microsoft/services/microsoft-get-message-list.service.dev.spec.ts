import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';

import { ConnectedAccountProvider } from 'twenty-shared';

import { EnvironmentModule } from 'src/engine/core-modules/environment/environment.module';
import { MicrosoftOAuth2ClientManagerService } from 'src/modules/connected-account/oauth2-client-manager/drivers/microsoft/microsoft-oauth2-client-manager.service';
import { MessageChannelWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import { MessageFolderWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-folder.workspace-entity';
import { microsoftGraphWithMessagesDeltaLink } from 'src/modules/messaging/message-import-manager/drivers/microsoft/mocks/microsoft-api-examples';
import { MicrosoftClientProvider } from 'src/modules/messaging/message-import-manager/drivers/microsoft/providers/microsoft-client.provider';
import { MessageFolderName } from 'src/modules/messaging/message-import-manager/drivers/microsoft/types/folders';

import { MicrosoftGetMessageListService } from './microsoft-get-message-list.service';
import { MicrosoftHandleErrorService } from './microsoft-handle-error.service';
// in case you have "Please provide a valid token" it may be because you need to pass the env varible to the .env.test file
const refreshToken = 'replace-with-your-refresh-token';
const syncCursor = `replace-with-your-sync-cursor`;
const mockConnectedAccount = {
  id: 'connected-account-id',
  provider: ConnectedAccountProvider.MICROSOFT,
  refreshToken: refreshToken,
};

xdescribe('Microsoft dev tests : get message list service', () => {
  let service: MicrosoftGetMessageListService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [EnvironmentModule.forRoot({})],
      providers: [
        MicrosoftGetMessageListService,
        MicrosoftClientProvider,
        MicrosoftHandleErrorService,
        MicrosoftOAuth2ClientManagerService,
        ConfigService,
      ],
    }).compile();

    service = module.get<MicrosoftGetMessageListService>(
      MicrosoftGetMessageListService,
    );
  });

  it('Should fetch and return message list successfully', async () => {
    const result = await service.getFullMessageList(
      mockConnectedAccount,
      MessageFolderName.INBOX,
    );

    expect(result.messageExternalIds.length).toBeGreaterThan(0);
  });

  it('Should throw token error', async () => {
    const mockConnectedAccountUnvalid = {
      id: 'connected-account-id',
      provider: ConnectedAccountProvider.MICROSOFT,
      refreshToken: 'invalid-token',
    };

    await expect(
      service.getFullMessageList(
        mockConnectedAccountUnvalid,
        MessageFolderName.INBOX,
      ),
    ).rejects.toThrowError('Access token is undefined or empty');
  });

  // if you need to run this test, you need to manually update the syncCursor to a valid one
  xit('Should fetch and return partial message list successfully', async () => {
    const result = await service.getPartialMessageList(
      mockConnectedAccount,
      syncCursor,
    );

    expect(result.nextSyncCursor).toBeTruthy();
  });

  it('Should fail partial message if syncCursor is invalid', async () => {
    await expect(
      service.getPartialMessageList(mockConnectedAccount, 'invalid-syncCursor'),
    ).rejects.toThrowError(
      /Resource not found for the segment|Badly formed content/g,
    );
  });

  it('Should fail partial message if syncCursor is missing', async () => {
    await expect(
      service.getPartialMessageList(mockConnectedAccount, ''),
    ).rejects.toThrowError(/Missing SyncCursor/g);
  });
});

xdescribe('Microsoft dev tests : get full message list service for folders', () => {
  let service: MicrosoftGetMessageListService;

  const inboxFolder = new MessageFolderWorkspaceEntity();

  inboxFolder.id = 'inbox-folder-id';
  inboxFolder.name = MessageFolderName.INBOX;
  inboxFolder.syncCursor = 'inbox-sync-cursor';
  inboxFolder.messageChannelId = 'message-channel-1';

  const sentFolder = new MessageFolderWorkspaceEntity();

  sentFolder.id = 'sent-folder-id';
  sentFolder.name = MessageFolderName.SENT_ITEMS;
  sentFolder.syncCursor = 'sent-sync-cursor';
  sentFolder.messageChannelId = 'message-channel-1';

  const otherFolder = new MessageFolderWorkspaceEntity();

  otherFolder.id = 'other-folder-id';
  otherFolder.name = 'other';
  otherFolder.syncCursor = 'other-sync-cursor';
  otherFolder.messageChannelId = 'message-channel-2';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [EnvironmentModule.forRoot({})],
      providers: [
        MicrosoftGetMessageListService,
        MicrosoftClientProvider,
        MicrosoftHandleErrorService,
        MicrosoftOAuth2ClientManagerService,
        ConfigService,
      ],
    }).compile();

    service = module.get<MicrosoftGetMessageListService>(
      MicrosoftGetMessageListService,
    );
  });

  it('Should return empty array', async () => {
    const result = await service.getFullMessageListForFolders(
      mockConnectedAccount,
      [],
    );

    expect(result.length).toBe(0);
  });

  it('Should return an array of one item', async () => {
    const result = await service.getFullMessageListForFolders(
      mockConnectedAccount,
      [inboxFolder],
    );

    expect(result.length).toBe(1);
    expect(result[0].folderId).toBe(inboxFolder.id);
    expect(result[0].messageExternalIds.length).toBeGreaterThan(0);
  });

  it('Should return an array of two items', async () => {
    const result = await service.getFullMessageListForFolders(
      mockConnectedAccount,
      [inboxFolder, sentFolder],
    );

    expect(result.length).toBe(2);
  });
});

xdescribe('Microsoft dev tests : get partial message list service for folders', () => {
  let service: MicrosoftGetMessageListService;

  const inboxFolder = new MessageFolderWorkspaceEntity();

  inboxFolder.id = 'inbox-folder-id';
  inboxFolder.name = MessageFolderName.INBOX;
  inboxFolder.syncCursor = 'inbox-sync-cursor';
  inboxFolder.messageChannelId = 'message-channel-1';

  const sentFolder = new MessageFolderWorkspaceEntity();

  sentFolder.id = 'sent-folder-id';
  sentFolder.name = MessageFolderName.SENT_ITEMS;
  sentFolder.syncCursor = 'sent-sync-cursor';
  sentFolder.messageChannelId = 'message-channel-1';

  const otherFolder = new MessageFolderWorkspaceEntity();

  otherFolder.id = 'other-folder-id';
  otherFolder.name = 'other';
  otherFolder.syncCursor = 'other-sync-cursor';
  otherFolder.messageChannelId = 'message-channel-2';

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
      imports: [EnvironmentModule.forRoot({})],
      providers: [
        MicrosoftGetMessageListService,
        MicrosoftClientProvider,
        MicrosoftHandleErrorService,
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
      .spyOn(MicrosoftClientProvider.prototype, 'getMicrosoftClient')
      .mockResolvedValue(mockMicrosoftClient as any);
  });

  it('Should return empty array', async () => {
    const result = await service.getPartialMessageListForFolders(
      mockConnectedAccount,
      messageChannelNoFolders,
    );

    expect(result.length).toBe(0);
  });

  it('Should return an array of one items', async () => {
    const result = await service.getPartialMessageListForFolders(
      mockConnectedAccount,
      messageChannelMicrosoftOneFolder,
    );

    expect(result.length).toBe(1);
    expect(result[0].folderId).toBe(inboxFolder.id);
    expect(result[0].messageExternalIds.length).toBeGreaterThan(0);
  });

  it('Should return an array of two items', async () => {
    const result = await service.getPartialMessageListForFolders(
      mockConnectedAccount,
      messageChannelMicrosoft,
    );

    expect(result.length).toBe(2);
  });
});
