import { MessageFolderImportPolicy } from 'twenty-shared/types';
import { computeGmailFullSyncListQueries } from 'src/modules/messaging/message-import-manager/drivers/gmail/utils/compute-gmail-full-sync-list-queries.util';

describe('computeGmailFullSyncListQueries', () => {
  describe('SELECTED_FOLDERS policy', () => {
    it('returns no query when no folders are synced', () => {
      const result = computeGmailFullSyncListQueries({
        messageFolders: [{ externalId: 'INBOX', isSynced: false }],
        messageFolderImportPolicy: MessageFolderImportPolicy.SELECTED_FOLDERS,
      });

      expect(result).toEqual([]);
    });

    it('lists each selected label by its id, whatever its name', () => {
      const result = computeGmailFullSyncListQueries({
        messageFolders: [
          { externalId: 'Label_1', isSynced: true },
          { externalId: 'Label_2', isSynced: true },
          { externalId: 'INBOX', isSynced: false },
        ],
        messageFolderImportPolicy: MessageFolderImportPolicy.SELECTED_FOLDERS,
      });

      expect(result.map((query) => query.labelIds)).toEqual([
        ['Label_1'],
        ['Label_2'],
      ]);

      for (const { searchFilter } of result) {
        expect(searchFilter).not.toContain('label:label_');
        expect(searchFilter).toContain('-label:spam');
        expect(searchFilter).toContain('-label:trash');
        expect(searchFilter).not.toContain('-category:promotions');
      }
    });

    it('excludes categories when only INBOX is selected', () => {
      const result = computeGmailFullSyncListQueries({
        messageFolders: [
          { externalId: 'INBOX', isSynced: true },
          { externalId: 'Label_1', isSynced: false },
        ],
        messageFolderImportPolicy: MessageFolderImportPolicy.SELECTED_FOLDERS,
      });

      expect(result).toHaveLength(1);
      expect(result[0].labelIds).toEqual(['INBOX']);
      expect(result[0].searchFilter).toContain('-category:promotions');
      expect(result[0].searchFilter).toContain('-category:social');
      expect(result[0].searchFilter).toContain('-label:spam');
    });

    it('keeps categories when a custom label is selected next to INBOX', () => {
      const result = computeGmailFullSyncListQueries({
        messageFolders: [
          { externalId: 'INBOX', isSynced: true },
          { externalId: 'Label_1', isSynced: true },
          { externalId: 'SENT', isSynced: false },
        ],
        messageFolderImportPolicy: MessageFolderImportPolicy.SELECTED_FOLDERS,
      });

      expect(result.map((query) => query.labelIds)).toEqual([
        ['INBOX'],
        ['Label_1'],
      ]);

      for (const { searchFilter } of result) {
        expect(searchFilter).not.toContain('-category:promotions');
        expect(searchFilter).toContain('-label:spam');
      }
    });

    it('lists the whole mailbox once when every folder is synced', () => {
      const result = computeGmailFullSyncListQueries({
        messageFolders: [
          { externalId: 'INBOX', isSynced: true },
          { externalId: 'Label_1', isSynced: true },
        ],
        messageFolderImportPolicy: MessageFolderImportPolicy.SELECTED_FOLDERS,
      });

      expect(result).toHaveLength(1);
      expect(result[0].labelIds).toBeUndefined();
      expect(result[0].searchFilter).toContain('-label:spam');
      expect(result[0].searchFilter).toContain('-category:promotions');
    });

    it('skips synced folders without an external id', () => {
      const result = computeGmailFullSyncListQueries({
        messageFolders: [
          { externalId: null, isSynced: true },
          { externalId: 'Label_1', isSynced: true },
          { externalId: 'INBOX', isSynced: false },
        ],
        messageFolderImportPolicy: MessageFolderImportPolicy.SELECTED_FOLDERS,
      });

      expect(result.map((query) => query.labelIds)).toEqual([['Label_1']]);
    });

    it('keeps categories when a synced folder has no external id, like the name-based query did', () => {
      const result = computeGmailFullSyncListQueries({
        messageFolders: [
          { externalId: null, isSynced: true },
          { externalId: 'INBOX', isSynced: true },
          { externalId: 'SENT', isSynced: false },
        ],
        messageFolderImportPolicy: MessageFolderImportPolicy.SELECTED_FOLDERS,
      });

      expect(result).toHaveLength(1);
      expect(result[0].labelIds).toEqual(['INBOX']);
      expect(result[0].searchFilter).not.toContain('-category:promotions');
    });

    it('lists only the child label when a nested child is selected without its parent', () => {
      const result = computeGmailFullSyncListQueries({
        messageFolders: [
          { externalId: 'Label_parent', isSynced: false },
          { externalId: 'Label_child', isSynced: true },
          { externalId: 'Label_grandchild', isSynced: false },
        ],
        messageFolderImportPolicy: MessageFolderImportPolicy.SELECTED_FOLDERS,
      });

      expect(result.map((query) => query.labelIds)).toEqual([['Label_child']]);
    });

    it('lists only the parent label when a parent is selected without its children', () => {
      const result = computeGmailFullSyncListQueries({
        messageFolders: [
          { externalId: 'Label_parent', isSynced: true },
          { externalId: 'Label_child', isSynced: false },
          { externalId: 'Label_grandchild', isSynced: false },
        ],
        messageFolderImportPolicy: MessageFolderImportPolicy.SELECTED_FOLDERS,
      });

      expect(result.map((query) => query.labelIds)).toEqual([['Label_parent']]);
    });

    it('lists skipped levels separately when a parent and grandchild are selected', () => {
      const result = computeGmailFullSyncListQueries({
        messageFolders: [
          { externalId: 'Label_parent', isSynced: true },
          { externalId: 'Label_child', isSynced: false },
          { externalId: 'Label_grandchild', isSynced: true },
        ],
        messageFolderImportPolicy: MessageFolderImportPolicy.SELECTED_FOLDERS,
      });

      expect(result.map((query) => query.labelIds)).toEqual([
        ['Label_parent'],
        ['Label_grandchild'],
      ]);
    });

    it('treats STARRED, UNREAD and DRAFT as custom labels that keep categories', () => {
      for (const systemLabelId of ['STARRED', 'UNREAD', 'DRAFT']) {
        const result = computeGmailFullSyncListQueries({
          messageFolders: [
            { externalId: systemLabelId, isSynced: true },
            { externalId: 'INBOX', isSynced: false },
          ],
          messageFolderImportPolicy: MessageFolderImportPolicy.SELECTED_FOLDERS,
        });

        expect(result).toHaveLength(1);
        expect(result[0].labelIds).toEqual([systemLabelId]);
        expect(result[0].searchFilter).not.toContain('-category:promotions');
        expect(result[0].searchFilter).toContain('-label:spam');
      }
    });

    it('excludes categories when only SENT and IMPORTANT are selected', () => {
      const result = computeGmailFullSyncListQueries({
        messageFolders: [
          { externalId: 'SENT', isSynced: true },
          { externalId: 'IMPORTANT', isSynced: true },
          { externalId: 'INBOX', isSynced: false },
        ],
        messageFolderImportPolicy: MessageFolderImportPolicy.SELECTED_FOLDERS,
      });

      expect(result.map((query) => query.labelIds)).toEqual([
        ['SENT'],
        ['IMPORTANT'],
      ]);

      for (const { searchFilter } of result) {
        expect(searchFilter).toContain('-category:promotions');
      }
    });
  });

  describe('ALL_FOLDERS policy', () => {
    it('lists the whole mailbox once with every default exclusion', () => {
      const result = computeGmailFullSyncListQueries({
        messageFolders: [{ externalId: 'INBOX', isSynced: false }],
        messageFolderImportPolicy: MessageFolderImportPolicy.ALL_FOLDERS,
      });

      expect(result).toHaveLength(1);
      expect(result[0].labelIds).toBeUndefined();
      expect(result[0].searchFilter).toContain('-label:trash');
      expect(result[0].searchFilter).toContain('-label:spam');
      expect(result[0].searchFilter).toContain('-label:chat');
      expect(result[0].searchFilter).not.toContain('-label:draft');
      expect(result[0].searchFilter).toContain('-category:promotions');
      expect(result[0].searchFilter).toContain('-category:social');
      expect(result[0].searchFilter).toContain('-category:forums');
      expect(result[0].searchFilter).toContain('-category:updates');
    });
  });
});
