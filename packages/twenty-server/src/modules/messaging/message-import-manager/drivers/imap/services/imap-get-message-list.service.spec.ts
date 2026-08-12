import { Test, type TestingModule } from '@nestjs/testing';

import {
  ConnectedAccountProvider,
  MessageFolderImportPolicy,
  MessageFolderPendingSyncAction,
} from 'twenty-shared/types';

import { type MessageFolder } from 'src/modules/messaging/message-folder-manager/interfaces/message-folder-driver.interface';

import { type EncryptedString } from 'src/engine/core-modules/secret-encryption/branded-strings/encrypted-string.type';
import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { ImapClientProvider } from 'src/modules/messaging/message-import-manager/drivers/imap/providers/imap-client.provider';
import { ImapGetMessageListService } from 'src/modules/messaging/message-import-manager/drivers/imap/services/imap-get-message-list.service';
import { ImapMessageListFetchErrorHandler } from 'src/modules/messaging/message-import-manager/drivers/imap/services/imap-message-list-fetch-error-handler.service';
import { ImapSyncService } from 'src/modules/messaging/message-import-manager/drivers/imap/services/imap-sync.service';

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

describe('ImapGetMessageListService', () => {
  let service: ImapGetMessageListService;
  let imapClientProvider: ImapClientProvider;
  let imapSyncService: ImapSyncService;

  const mockConnectedAccount: Pick<
    ConnectedAccountEntity,
    | 'provider'
    | 'accessToken'
    | 'refreshToken'
    | 'id'
    | 'handle'
    | 'connectionParameters'
    | 'workspaceId'
  > = {
    id: 'connected-account-id',
    provider: ConnectedAccountProvider.IMAP_SMTP_CALDAV,
    accessToken: 'access-token' as EncryptedString,
    refreshToken: 'refresh-token' as EncryptedString,
    handle: 'test@example.com',
    connectionParameters: {},
    workspaceId: 'workspace-id',
  };

  const mockImapClient = {
    getMailboxLock: jest.fn().mockResolvedValue({ release: jest.fn() }),
    mailbox: {
      uidValidity: 12345,
      uidNext: 100,
      highestModseq: '1000',
    },
    capabilities: new Set(['CONDSTORE']),
    enabled: new Set<string>(),
    status: jest.fn().mockResolvedValue({
      uidValidity: 12345,
      uidNext: 100,
      highestModseq: '1000',
    }),
  };

  beforeEach(async () => {
    mockImapClient.getMailboxLock.mockResolvedValue({ release: jest.fn() });
    mockImapClient.enabled.clear();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImapGetMessageListService,
        {
          provide: ImapClientProvider,
          useValue: {
            getClient: jest.fn().mockResolvedValue(mockImapClient),
            closeClient: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: ImapSyncService,
          useValue: {
            syncFolder: jest.fn().mockResolvedValue({ messageUids: [1, 2, 3] }),
          },
        },
        {
          provide: ImapMessageListFetchErrorHandler,
          useValue: {
            handleError: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ImapGetMessageListService>(ImapGetMessageListService);
    imapClientProvider = module.get<ImapClientProvider>(ImapClientProvider);
    imapSyncService = module.get<ImapSyncService>(ImapSyncService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('folder filtering based on import policy', () => {
    it('should only process synced folders when SELECTED_FOLDERS policy is set', async () => {
      const syncedFolder = createMockFolder({
        name: 'INBOX',
        externalId: 'INBOX:1',
        isSynced: true,
      });

      const nonSyncedFolder = createMockFolder({
        name: 'Personal',
        externalId: 'Personal:1',
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
    });

    it('should process all folders when ALL_FOLDERS policy is set', async () => {
      const syncedFolder = createMockFolder({
        name: 'INBOX',
        externalId: 'INBOX:1',
        isSynced: true,
      });

      const nonSyncedFolder = createMockFolder({
        name: 'Personal',
        externalId: 'Personal:1',
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
        externalId: 'Personal:1',
        isSynced: false,
      });

      const nonSyncedFolder2 = createMockFolder({
        name: 'Work',
        externalId: 'Work:1',
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

      expect(result).toHaveLength(0);
    });

    it('should process all non-synced folders when ALL_FOLDERS policy is set', async () => {
      const nonSyncedFolder1 = createMockFolder({
        name: 'Personal',
        externalId: 'Personal:1',
        isSynced: false,
      });

      const nonSyncedFolder2 = createMockFolder({
        name: 'Work',
        externalId: 'Work:1',
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

    it('should always close the IMAP client regardless of policy', async () => {
      const folder = createMockFolder({
        name: 'INBOX',
        externalId: 'INBOX:1',
        isSynced: true,
      });

      await service.getMessageLists({
        connectedAccount: mockConnectedAccount,
        messageChannel: {
          syncCursor: '',
          id: 'channel-1',
          messageFolderImportPolicy: MessageFolderImportPolicy.ALL_FOLDERS,
        },
        messageFolders: [folder],
      });

      expect(imapClientProvider.closeClient).toHaveBeenCalledTimes(1);
    });
  });

  describe('incremental sync skip', () => {
    const syncedFolder = createMockFolder({
      name: 'INBOX',
      externalId: 'INBOX:12345',
      isSynced: true,
      syncCursor: JSON.stringify({
        highestUid: 99,
        uidValidity: 12345,
        modSeq: '1000',
      }),
    });

    const runSync = () =>
      service.getMessageLists({
        connectedAccount: mockConnectedAccount,
        messageChannel: {
          syncCursor: '',
          id: 'channel-1',
          messageFolderImportPolicy: MessageFolderImportPolicy.ALL_FOLDERS,
        },
        messageFolders: [syncedFolder],
      });

    it('skips folders whose cursor already covers the latest UID', async () => {
      const [result] = await runSync();

      expect(imapSyncService.syncFolder).not.toHaveBeenCalled();
      expect(result.messageExternalIds).toEqual([]);
    });

    it('does not skip when the server omits UIDNEXT on STATUS', async () => {
      mockImapClient.status.mockResolvedValueOnce({
        uidValidity: 12345,
        highestModseq: '1000',
      });

      const [result] = await runSync();

      expect(imapSyncService.syncFolder).toHaveBeenCalledTimes(1);
      expect(result.messageExternalIds).not.toEqual([]);
    });
  });

  describe('unavailable mailboxes', () => {
    const runSync = (messageFolders: MessageFolder[]) =>
      service.getMessageLists({
        connectedAccount: mockConnectedAccount,
        messageChannel: {
          syncCursor: '',
          id: 'channel-1',
          messageFolderImportPolicy: MessageFolderImportPolicy.ALL_FOLDERS,
        },
        messageFolders,
      });

    it('normalizes Unicode mailbox names only when UTF8=ACCEPT is enabled', async () => {
      mockImapClient.enabled.add('UTF8=ACCEPT');
      const folder = createMockFolder({
        name: 'Ane\u0301mo+',
        externalId: 'Parent/Ane\u0301mo+:12345',
        isSynced: true,
      });

      await runSync([folder]);

      expect(mockImapClient.getMailboxLock).toHaveBeenCalledWith(
        'Parent/An\u00e9mo+',
      );
      expect(imapSyncService.syncFolder).toHaveBeenCalledWith(
        mockImapClient,
        'Parent/An\u00e9mo+',
        null,
        expect.anything(),
      );
    });

    it('skips an explicitly missing mailbox and continues with later folders', async () => {
      const missingMailboxError = Object.assign(
        new Error("Mailbox doesn't exist: Missing (0.001 + 0.000 secs)."),
        {
          responseStatus: 'NO',
          responseText: "Mailbox doesn't exist: Missing (0.001 + 0.000 secs).",
        },
      );
      mockImapClient.getMailboxLock
        .mockRejectedValueOnce(missingMailboxError)
        .mockResolvedValueOnce({ release: jest.fn() });
      const missingFolder = createMockFolder({
        name: 'Missing',
        externalId: 'Missing:1',
        isSynced: true,
      });
      const availableFolder = createMockFolder({
        name: 'Available',
        externalId: 'Available:1',
        isSynced: true,
      });

      const result = await runSync([missingFolder, availableFolder]);

      expect(result.map(({ folderId }) => folderId)).toEqual([
        availableFolder.id,
      ]);
      expect(imapSyncService.syncFolder).toHaveBeenCalledTimes(1);
    });

    it('fails the channel flow for errors other than an explicit missing mailbox', async () => {
      const accountError = Object.assign(new Error('Connection lost'), {
        code: 'ECONNRESET',
      });
      mockImapClient.getMailboxLock.mockRejectedValueOnce(accountError);
      const firstFolder = createMockFolder({
        name: 'First',
        externalId: 'First:1',
        isSynced: true,
      });
      const laterFolder = createMockFolder({
        name: 'Later',
        externalId: 'Later:1',
        isSynced: true,
      });

      await expect(runSync([firstFolder, laterFolder])).rejects.toThrow(
        'Connection lost',
      );

      expect(mockImapClient.getMailboxLock).toHaveBeenCalledTimes(1);
      expect(imapSyncService.syncFolder).not.toHaveBeenCalled();
    });
  });
});
