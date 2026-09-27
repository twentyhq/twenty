import { type ImapFlow } from 'imapflow';

import { ImapSyncService } from 'src/modules/messaging/message-import-manager/drivers/imap/services/imap-sync.service';
import { type MailboxState } from 'src/modules/messaging/message-import-manager/drivers/imap/utils/extract-mailbox-state.util';
import { type ImapSyncCursor } from 'src/modules/messaging/message-import-manager/drivers/imap/utils/parse-sync-cursor.util';

type ExtendedSyncCursor = ImapSyncCursor & {
  knownUids?: number[];
  messageCount?: number;
};

type SyncResultWithExpunged = {
  messageUids: number[];
  expungedUids?: number[];
};

type MockClient = {
  search: jest.Mock;
};

const createMockClient = (): MockClient => ({
  search: jest.fn(),
});

describe('ImapSyncService', () => {
  let service: ImapSyncService;

  beforeEach(() => {
    service = new ImapSyncService();
  });

  describe('syncFolder', () => {
    it('detects expunged UIDs when a draft is rewritten with a new UID', async () => {
      const client = createMockClient();

      client.search.mockResolvedValue([2886]);

      const previousCursor: ExtendedSyncCursor = {
        highestUid: 2884,
        uidValidity: 1,
        knownUids: [2884],
        messageCount: 1,
      };

      const mailboxState: MailboxState = {
        uidValidity: 1,
        uidNext: 2887,
        maxUid: 2886,
      };

      const result = (await service.syncFolder(
        client as unknown as ImapFlow,
        'Drafts',
        previousCursor,
        mailboxState,
      )) as SyncResultWithExpunged;

      expect(result.messageUids).toEqual([2886]);
      expect(result.expungedUids).toEqual([2884]);
    });

    it('isolates expunged UIDs in a multi-message mailbox without affecting retained messages', async () => {
      const client = createMockClient();

      client.search.mockResolvedValue([2880, 2886]);

      const previousCursor: ExtendedSyncCursor = {
        highestUid: 2884,
        uidValidity: 1,
        knownUids: [2880, 2884],
        messageCount: 2,
      };

      const mailboxState: MailboxState = {
        uidValidity: 1,
        uidNext: 2887,
        maxUid: 2886,
      };

      const result = (await service.syncFolder(
        client as unknown as ImapFlow,
        'Drafts',
        previousCursor,
        mailboxState,
      )) as SyncResultWithExpunged;

      expect(result.messageUids).toEqual([2886]);
      expect(result.expungedUids).toEqual([2884]);
    });

    it('detects expunged UIDs when drafts folder becomes empty after draft is discarded or sent', async () => {
      const client = createMockClient();

      client.search.mockResolvedValue([]);

      const previousCursor: ExtendedSyncCursor = {
        highestUid: 2886,
        uidValidity: 1,
        knownUids: [2886],
        messageCount: 1,
      };

      const mailboxState: MailboxState = {
        uidValidity: 1,
        uidNext: 2887,
        maxUid: 2886,
      };

      const result = (await service.syncFolder(
        client as unknown as ImapFlow,
        'Drafts',
        previousCursor,
        mailboxState,
      )) as SyncResultWithExpunged;

      expect(result.messageUids).toEqual([]);
      expect(result.expungedUids).toEqual([2886]);
    });

    it('handles legacy cursors without knownUids safely without throwing or reporting false expunges', async () => {
      const client = createMockClient();

      client.search.mockResolvedValue([2884, 2886]);

      const previousCursor: ExtendedSyncCursor = {
        highestUid: 2884,
        uidValidity: 1,
      };

      const mailboxState: MailboxState = {
        uidValidity: 1,
        uidNext: 2887,
        maxUid: 2886,
      };

      const result = (await service.syncFolder(
        client as unknown as ImapFlow,
        'Drafts',
        previousCursor,
        mailboxState,
      )) as SyncResultWithExpunged;

      expect(result.messageUids).toEqual([2886]);
      expect(result.expungedUids ?? []).toEqual([]);
    });
  });
});
