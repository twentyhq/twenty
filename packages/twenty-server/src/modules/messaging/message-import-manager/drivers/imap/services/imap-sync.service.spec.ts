import { Test, TestingModule } from '@nestjs/testing';

import { ImapFlow } from 'imapflow';

import { MessageImportDriverException } from 'src/modules/messaging/message-import-manager/drivers/exceptions/message-import-driver.exception';
import { ImapSyncService } from 'src/modules/messaging/message-import-manager/drivers/imap/services/imap-sync.service';
import { ImapSyncCursor } from 'src/modules/messaging/message-import-manager/drivers/imap/utils/parse-sync-cursor.util';

describe('ImapSyncService', () => {
  let service: ImapSyncService;
  let mockClient: ImapFlow;

  const FOLDER_PATH = 'INBOX';
  const MAILBOX_STATE = {
    uidValidity: 1000,
    maxUid: 50,
    exists: 50,
    highestModSeq: 100n,
  };

  beforeEach(async () => {
    mockClient = {
      search: jest.fn(),
      options: {
        capabilities: ['QRESYNC'],
      },
    } as unknown as ImapFlow;

    const module: TestingModule = await Test.createTestingModule({
      providers: [ImapSyncService],
    }).compile();

    service = module.get<ImapSyncService>(ImapSyncService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('syncFolder', () => {
    it('should throw an error if uidValidity changes', async () => {
      const previousCursor: ImapSyncCursor = {
        highestUid: 10,
        uidValidity: 999,
        modSeq: 50n,
      };

      await expect(
        service.syncFolder(mockClient, FOLDER_PATH, previousCursor, MAILBOX_STATE),
      ).rejects.toThrow(MessageImportDriverException);
    });

    it('should use UID range fetch if no previous cursor', async () => {
      (mockClient.search as jest.Mock).mockResolvedValue([1, 2, 3]);

      const result = await service.syncFolder(
        mockClient,
        FOLDER_PATH,
        null,
        MAILBOX_STATE,
      );

      expect(mockClient.search).toHaveBeenCalledWith(
        { uid: '1:50' },
        { uid: true },
      );
      expect(result.messageUids).toEqual([1, 2, 3]);
    });

    it('should use UID range fetch for incremental sync when QRESYNC is not available', async () => {
      mockClient.options.capabilities = [];
      (mockClient.search as jest.Mock).mockResolvedValue([11, 12, 13]);

      const previousCursor: ImapSyncCursor = {
        highestUid: 10,
        uidValidity: 1000,
        modSeq: 50n,
      };

      const result = await service.syncFolder(
        mockClient,
        FOLDER_PATH,
        previousCursor,
        MAILBOX_STATE,
      );

      expect(mockClient.search).toHaveBeenCalledWith(
        { uid: '11:50' },
        { uid: true },
      );
      expect(result.messageUids).toEqual([11, 12, 13]);
    });

    it('should use QRESYNC for incremental sync when available', async () => {
      (mockClient.search as jest.Mock).mockResolvedValue([11, 12, 13]);

      const previousCursor: ImapSyncCursor = {
        highestUid: 10,
        uidValidity: 1000,
        modSeq: 50n,
      };

      const result = await service.syncFolder(
        mockClient,
        FOLDER_PATH,
        previousCursor,
        MAILBOX_STATE,
      );

      expect(mockClient.search).toHaveBeenCalledWith(
        { modseq: 51n, uid: '11:*' },
        { uid: true },
      );
      expect(result.messageUids).toEqual([11, 12, 13]);
    });

    it('should fall back to UID range if QRESYNC fails', async () => {
      (mockClient.search as jest.Mock)
        .mockRejectedValueOnce(new Error('QRESYNC failed'))
        .mockResolvedValueOnce([11, 12, 13]);

      const previousCursor: ImapSyncCursor = {
        highestUid: 10,
        uidValidity: 1000,
        modSeq: 50n,
      };

      const result = await service.syncFolder(
        mockClient,
        FOLDER_PATH,
        previousCursor,
        MAILBOX_STATE,
      );

      expect(mockClient.search).toHaveBeenCalledTimes(2);
      expect(mockClient.search).toHaveBeenCalledWith(
        { uid: '11:50' },
        { uid: true },
      );
      expect(result.messageUids).toEqual([11, 12, 13]);
    });
  });
});
