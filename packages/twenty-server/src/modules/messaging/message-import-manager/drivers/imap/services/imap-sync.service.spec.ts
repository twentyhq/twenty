import { Test, type TestingModule } from '@nestjs/testing';
import { ImapSyncService } from './imap-sync.service';
import { type ImapFlow } from 'imapflow';
import { createSyncCursor } from '../utils/create-sync-cursor.util';

describe('ImapSyncService', () => {
  let service: ImapSyncService;

  const mockImapClient = {
    capabilities: new Set<string>([]),
    search: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ImapSyncService],
    }).compile();

    service = module.get<ImapSyncService>(ImapSyncService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('syncFolder', () => {
    it('should use UID range when QRESYNC is not available', async () => {
      const folderPath = 'INBOX';
      const previousCursor = { highestUid: 100, uidValidity: 12345 };
      const mailboxState = {
        maxUid: 500,
        uidValidity: 12345,
        highestModSeq: '1000',
      };

      mockImapClient.search.mockResolvedValue([101, 102, 103]);

      const result = await service.syncFolder(
        mockImapClient as unknown as ImapFlow,
        folderPath,
        previousCursor,
        mailboxState as any,
      );

      expect(mockImapClient.search).toHaveBeenCalledWith(
        { uid: '101:500' },
        { uid: true },
      );
      expect(result.messageUids).toEqual([101, 102, 103]);
      expect(result.isPartial).toBe(false);
    });

    it('should chunk the UID range if it exceeds MAX_UID_FETCH_SIZE', async () => {
      const folderPath = 'INBOX';
      const previousCursor = { highestUid: 100, uidValidity: 12345 };
      const mailboxState = {
        maxUid: 50000,
        uidValidity: 12345,
        highestModSeq: '1000',
      };

      mockImapClient.search.mockResolvedValue([]);

      const result = await service.syncFolder(
        mockImapClient as unknown as ImapFlow,
        folderPath,
        previousCursor,
        mailboxState as any,
      );

      expect(mockImapClient.search).toHaveBeenCalledWith(
        { uid: '101:1100' },
        { uid: true },
      );
      expect(result.isPartial).toBe(true);
    });

    it('should chunk QRESYNC results if they exceed MAX_UID_FETCH_SIZE', async () => {
      const folderPath = 'INBOX';
      const previousCursor = {
        highestUid: 100,
        uidValidity: 12345,
        modSeq: '500',
      };
      const mailboxState = {
        maxUid: 50000,
        uidValidity: 12345,
        highestModSeq: '1000',
      };

      mockImapClient.capabilities.add('QRESYNC');

      const manyUids = Array.from({ length: 1500 }, (_, i) => 101 + i);
      mockImapClient.search.mockResolvedValue(manyUids);

      const result = await service.syncFolder(
        mockImapClient as unknown as ImapFlow,
        folderPath,
        previousCursor,
        mailboxState as any,
      );

      expect(mockImapClient.search).toHaveBeenCalledWith(
        { modseq: BigInt(501), uid: '101:*' },
        { uid: true },
      );
      expect(result.messageUids.length).toBe(1000);
      expect(result.isPartial).toBe(true);

      mockImapClient.capabilities.delete('QRESYNC');
    });
  });

  describe('createSyncCursor', () => {
    it('should update modSeq if not partial', () => {
      const previousCursor = {
        highestUid: 100,
        uidValidity: 12345,
        modSeq: '500',
      };
      const mailboxState = {
        maxUid: 200,
        uidValidity: 12345,
        highestModSeq: '1000',
      };
      const messageUids = [101, 102];

      const nextCursor = createSyncCursor(
        messageUids,
        previousCursor,
        mailboxState as any,
        false,
      );

      expect(nextCursor.modSeq).toBe('1000');
      expect(nextCursor.highestUid).toBe(102);
    });

    it('should NOT update modSeq if partial', () => {
      const previousCursor = {
        highestUid: 100,
        uidValidity: 12345,
        modSeq: '500',
      };
      const mailboxState = {
        maxUid: 50000,
        uidValidity: 12345,
        highestModSeq: '1000',
      };
      const messageUids = [101, 102]; // Only first 2 of many

      const nextCursor = createSyncCursor(
        messageUids,
        previousCursor,
        mailboxState as any,
        true,
      );

      expect(nextCursor.modSeq).toBe('500');
      expect(nextCursor.highestUid).toBe(102);
    });
  });
});
