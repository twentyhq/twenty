import { type ImapFlow } from 'imapflow';

import {
  ConnectedAccountProvider,
  MessageFolderImportPolicy,
} from 'twenty-shared/types';

import { type MessageFolder } from 'src/modules/messaging/message-folder-manager/interfaces/message-folder-driver.interface';
import { type ImapClientProvider } from 'src/modules/messaging/message-import-manager/drivers/imap/providers/imap-client.provider';
import { type ImapMessageListFetchErrorHandler } from 'src/modules/messaging/message-import-manager/drivers/imap/services/imap-message-list-fetch-error-handler.service';
import { ImapGetMessageListService } from 'src/modules/messaging/message-import-manager/drivers/imap/services/imap-get-message-list.service';
import { type ImapSyncService } from 'src/modules/messaging/message-import-manager/drivers/imap/services/imap-sync.service';
import { type GetMessageListsArgs } from 'src/modules/messaging/message-import-manager/types/get-message-lists-args.type';

type MockClient = {
  capabilities: Set<string>;
  enabled: Set<string>;
  status: jest.Mock;
  getMailboxLock: jest.Mock;
  mailbox: NonNullable<ImapFlow['mailbox']>;
};

const createFolder = (
  overrides: Partial<MessageFolder> = {},
): MessageFolder => ({
  id: 'folder-drafts-id',
  name: 'Drafts',
  isSynced: true,
  isSentFolder: false,
  externalId: 'Drafts',
  parentFolderId: null,
  syncCursor: null,
  pendingSyncAction: null,
  ...overrides,
});

const createArgs = (folder: MessageFolder): GetMessageListsArgs => ({
  connectedAccount: {
    id: 'account-1',
    provider: ConnectedAccountProvider.IMAP_SMTP_CALDAV,
    handle: 'user@example.com',
  },
  messageChannel: {
    id: 'channel-1',
    messageFolderImportPolicy: MessageFolderImportPolicy.ALL_FOLDERS,
    syncCursor: null,
  },
  messageFolders: [folder],
});

describe('ImapGetMessageListService', () => {
  let service: ImapGetMessageListService;
  let mockClient: MockClient;
  let mockImapClientProvider: {
    getClient: jest.Mock;
    closeClient: jest.Mock;
  };
  let mockImapSyncService: {
    syncFolder: jest.Mock;
  };
  let mockErrorHandler: {
    handleError: jest.Mock;
  };

  beforeEach(() => {
    mockClient = {
      capabilities: new Set<string>(),
      enabled: new Set<string>(),
      status: jest.fn(),
      getMailboxLock: jest.fn().mockResolvedValue({ release: jest.fn() }),
      mailbox: {
        uidValidity: BigInt(1),
        uidNext: 2887,
        highestModseq: BigInt(0),
      } as NonNullable<ImapFlow['mailbox']>,
    };

    mockImapClientProvider = {
      getClient: jest.fn().mockResolvedValue(mockClient as unknown as ImapFlow),
      closeClient: jest.fn().mockResolvedValue(undefined),
    };

    mockImapSyncService = {
      syncFolder: jest.fn(),
    };

    mockErrorHandler = {
      handleError: jest.fn(),
    };

    service = new ImapGetMessageListService(
      mockImapClientProvider as unknown as ImapClientProvider,
      mockImapSyncService as unknown as ImapSyncService,
      mockErrorHandler as unknown as ImapMessageListFetchErrorHandler,
    );
  });

  describe('getMessageLists', () => {
    it('returns messageExternalIdsToDelete and updates cursor when draft is rewritten with a new UID', async () => {
      const folder = createFolder({
        syncCursor: JSON.stringify({
          highestUid: 2884,
          uidValidity: 1,
          knownUids: [2884],
          messageCount: 1,
        }),
      });

      mockClient.status.mockResolvedValue({
        uidNext: 2887,
        uidValidity: 1,
        messages: 1,
      });

      mockImapSyncService.syncFolder.mockResolvedValue({
        messageUids: [2886],
        expungedUids: [2884],
        currentUids: [2886],
      });

      const results = await service.getMessageLists(createArgs(folder));

      expect(results).toHaveLength(1);
      expect(results[0].messageExternalIds).toEqual(['Drafts:2886']);
      expect(results[0].messageExternalIdsToDelete).toEqual(['Drafts:2884']);
      expect(JSON.parse(results[0].nextSyncCursor)).toEqual(
        expect.objectContaining({
          highestUid: 2886,
          uidValidity: 1,
          knownUids: [2886],
          messageCount: 1,
        }),
      );
    });

    it('executes folder sync and emits messageExternalIdsToDelete when draft is discarded or sent', async () => {
      const folder = createFolder({
        syncCursor: JSON.stringify({
          highestUid: 2886,
          uidValidity: 1,
          knownUids: [2886],
          messageCount: 1,
        }),
      });

      mockClient.status.mockResolvedValue({
        uidNext: 2887,
        uidValidity: 1,
        messages: 0,
      });

      mockImapSyncService.syncFolder.mockResolvedValue({
        messageUids: [],
        expungedUids: [2886],
        currentUids: [],
      });

      const results = await service.getMessageLists(createArgs(folder));

      expect(mockImapSyncService.syncFolder).toHaveBeenCalled();
      expect(results).toHaveLength(1);
      expect(results[0].messageExternalIds).toEqual([]);
      expect(results[0].messageExternalIdsToDelete).toEqual(['Drafts:2886']);
      expect(JSON.parse(results[0].nextSyncCursor)).toEqual(
        expect.objectContaining({
          highestUid: 2886,
          uidValidity: 1,
          knownUids: [],
          messageCount: 0,
        }),
      );
    });

    it('skips folder sync when messageCount is unchanged and highestUid >= maxUid', async () => {
      const folder = createFolder({
        syncCursor: JSON.stringify({
          highestUid: 2886,
          uidValidity: 1,
          knownUids: [2886],
          messageCount: 1,
        }),
      });

      mockClient.status.mockResolvedValue({
        uidNext: 2887,
        uidValidity: 1,
        messages: 1,
      });

      const results = await service.getMessageLists(createArgs(folder));

      expect(mockImapSyncService.syncFolder).not.toHaveBeenCalled();
      expect(results).toHaveLength(1);
      expect(results[0].messageExternalIds).toEqual([]);
      expect(results[0].messageExternalIdsToDelete).toEqual([]);
    });
  });
});
