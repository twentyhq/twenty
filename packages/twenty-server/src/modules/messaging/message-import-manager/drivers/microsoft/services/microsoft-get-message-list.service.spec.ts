import { Test, type TestingModule } from '@nestjs/testing';

import { ConnectedAccountProvider } from 'twenty-shared/types';

import { type MessageFolder } from 'src/modules/messaging/message-folder-manager/interfaces/message-folder-driver.interface';

import { OAuth2ClientManagerService } from 'src/modules/connected-account/oauth2-client-manager/services/oauth2-client-manager.service';
import { type ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { MessageFolderImportPolicy } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import { MessageFolderPendingSyncAction } from 'src/modules/messaging/common/standard-objects/message-folder.workspace-entity';
import { MicrosoftGetMessageListService } from 'src/modules/messaging/message-import-manager/drivers/microsoft/services/microsoft-get-message-list.service';
import { MicrosoftMessageListFetchErrorHandler } from 'src/modules/messaging/message-import-manager/drivers/microsoft/services/microsoft-message-list-fetch-error-handler.service';

const createMockFolder = (
  overrides: Partial<MessageFolder> &
    Pick<MessageFolder, 'name' | 'externalId' | 'isSynced'>,
): MessageFolder => ({
  id: `folder-${overrides.externalId}`,
  syncCursor: null,
  isSentFolder: false,
  parentFolderId: null,
  pendingSyncAction: MessageFolderPendingSyncAction.NONE,
  ...overrides,
});

describe('MicrosoftGetMessageListService', () => {
  let service: MicrosoftGetMessageListService;
  let oAuth2ClientManagerService: OAuth2ClientManagerService;

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
    accessToken: 'access-token',
    refreshToken: 'refresh-token',
    handle: 'test@outlook.com',
    connectionParameters: {},
  };

  const createMockMicrosoftClient = () => ({
    api: jest.fn().mockReturnThis(),
    version: jest.fn().mockReturnThis(),
    headers: jest.fn().mockReturnThis(),
    get: jest.fn().mockResolvedValue({
      value: [{ id: 'msg-1' }, { id: 'msg-2' }],
      '@odata.deltaLink': 'https://graph.microsoft.com/delta?token=abc',
    }),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MicrosoftGetMessageListService,
        {
          provide: OAuth2ClientManagerService,
          useValue: {
            getMicrosoftOAuth2Client: jest.fn(),
          },
        },
        {
          provide: MicrosoftMessageListFetchErrorHandler,
          useValue: {
            handleError: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<MicrosoftGetMessageListService>(
      MicrosoftGetMessageListService,
    );
    oAuth2ClientManagerService = module.get<OAuth2ClientManagerService>(
      OAuth2ClientManagerService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('folder filtering based on import policy', () => {
    it('should only process synced folders when SELECTED_FOLDERS policy is set', async () => {
      const mockClient = createMockMicrosoftClient();

      (
        oAuth2ClientManagerService.getMicrosoftOAuth2Client as jest.Mock
      ).mockResolvedValue(mockClient);

      const syncedFolder = createMockFolder({
        name: 'Inbox',
        externalId: 'inbox-id',
        isSynced: true,
      });

      const nonSyncedFolder = createMockFolder({
        name: 'Personal',
        externalId: 'personal-id',
        isSynced: false,
      });

      const result = await service.getMessageLists({
        connectedAccount: mockConnectedAccount,
        messageChannel: {
          syncCursor: '',
          id: 'channel-1',
          messageFolderImportPolicy: MessageFolderImportPolicy.SELECTED_FOLDERS,
        },
        messageFolders: [syncedFolder, nonSyncedFolder],
      });

      expect(result).toHaveLength(1);
      expect(result[0].folderId).toBe(syncedFolder.id);
      expect(
        oAuth2ClientManagerService.getMicrosoftOAuth2Client,
      ).toHaveBeenCalledTimes(1);
    });

    it('should process all folders when ALL_FOLDERS policy is set', async () => {
      const mockClient = createMockMicrosoftClient();

      (
        oAuth2ClientManagerService.getMicrosoftOAuth2Client as jest.Mock
      ).mockResolvedValue(mockClient);

      const syncedFolder = createMockFolder({
        name: 'Inbox',
        externalId: 'inbox-id',
        isSynced: true,
      });

      const nonSyncedFolder = createMockFolder({
        name: 'Personal',
        externalId: 'personal-id',
        isSynced: false,
      });

      const result = await service.getMessageLists({
        connectedAccount: mockConnectedAccount,
        messageChannel: {
          syncCursor: '',
          id: 'channel-1',
          messageFolderImportPolicy: MessageFolderImportPolicy.ALL_FOLDERS,
        },
        messageFolders: [syncedFolder, nonSyncedFolder],
      });

      expect(result).toHaveLength(2);
      expect(result.map((r) => r.folderId)).toEqual([
        syncedFolder.id,
        nonSyncedFolder.id,
      ]);
    });

    it('should return empty array when SELECTED_FOLDERS policy and no folders are synced', async () => {
      const nonSyncedFolder1 = createMockFolder({
        name: 'Personal',
        externalId: 'personal-id',
        isSynced: false,
      });

      const nonSyncedFolder2 = createMockFolder({
        name: 'Work',
        externalId: 'work-id',
        isSynced: false,
      });

      const result = await service.getMessageLists({
        connectedAccount: mockConnectedAccount,
        messageChannel: {
          syncCursor: '',
          id: 'channel-1',
          messageFolderImportPolicy: MessageFolderImportPolicy.SELECTED_FOLDERS,
        },
        messageFolders: [nonSyncedFolder1, nonSyncedFolder2],
      });

      expect(result).toEqual([]);
    });

    it('should process all non-synced folders when ALL_FOLDERS policy is set', async () => {
      const mockClient = createMockMicrosoftClient();

      (
        oAuth2ClientManagerService.getMicrosoftOAuth2Client as jest.Mock
      ).mockResolvedValue(mockClient);

      const nonSyncedFolder1 = createMockFolder({
        name: 'Personal',
        externalId: 'personal-id',
        isSynced: false,
      });

      const nonSyncedFolder2 = createMockFolder({
        name: 'Work',
        externalId: 'work-id',
        isSynced: false,
      });

      const result = await service.getMessageLists({
        connectedAccount: mockConnectedAccount,
        messageChannel: {
          syncCursor: '',
          id: 'channel-1',
          messageFolderImportPolicy: MessageFolderImportPolicy.ALL_FOLDERS,
        },
        messageFolders: [nonSyncedFolder1, nonSyncedFolder2],
      });

      expect(result).toHaveLength(2);
    });

    it('should return empty array when ALL_FOLDERS policy but messageFolders array is empty', async () => {
      const result = await service.getMessageLists({
        connectedAccount: mockConnectedAccount,
        messageChannel: {
          syncCursor: '',
          id: 'channel-1',
          messageFolderImportPolicy: MessageFolderImportPolicy.ALL_FOLDERS,
        },
        messageFolders: [],
      });

      expect(result).toEqual([]);
    });
  });
});
