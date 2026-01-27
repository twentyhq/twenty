import { MessageFolderImportPolicy } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import { computeGmailExcludeSearchFilter } from 'src/modules/messaging/message-import-manager/drivers/gmail/utils/compute-gmail-exclude-search-filter.util';

describe('computeGmailExcludeSearchFilter', () => {
  describe('SELECTED_FOLDERS policy', () => {
    it('returns empty string when no folders are synced', () => {
      const result = computeGmailExcludeSearchFilter(
        [
          {
            externalId: 'INBOX',
            name: 'INBOX',
            isSynced: false,
            parentFolderId: null,
          },
        ],
        MessageFolderImportPolicy.SELECTED_FOLDERS,
      );

      expect(result).toBe('');
    });

    it('builds positive OR query for selected folders', () => {
      const result = computeGmailExcludeSearchFilter(
        [
          {
            externalId: 'Label_1',
            name: 'CRM',
            isSynced: true,
            parentFolderId: null,
          },
          {
            externalId: 'Label_2',
            name: 'Twenty visible',
            isSynced: true,
            parentFolderId: null,
          },
          {
            externalId: 'INBOX',
            name: 'INBOX',
            isSynced: false,
            parentFolderId: null,
          },
        ],
        MessageFolderImportPolicy.SELECTED_FOLDERS,
      );

      expect(result).toContain('(label:crm OR label:twenty-visible)');
      expect(result).not.toContain('-label:inbox');
    });

    it('returns only default exclusions when all folders are synced', () => {
      const result = computeGmailExcludeSearchFilter(
        [
          {
            externalId: 'INBOX',
            name: 'INBOX',
            isSynced: true,
            parentFolderId: null,
          },
          {
            externalId: 'Label_1',
            name: 'CRM',
            isSynced: true,
            parentFolderId: null,
          },
        ],
        MessageFolderImportPolicy.SELECTED_FOLDERS,
      );

      expect(result).toContain('-label:spam');
      expect(result).toContain('-category:promotions');
      expect(result).not.toContain('label:inbox');
      expect(result).not.toContain('label:crm');
    });

    it('handles nested folder paths correctly', () => {
      const result = computeGmailExcludeSearchFilter(
        [
          {
            externalId: 'Label_parent',
            name: 'Projects',
            isSynced: false,
            parentFolderId: null,
          },
          {
            externalId: 'Label_child',
            name: 'Active',
            isSynced: true,
            parentFolderId: 'Label_parent',
          },
        ],
        MessageFolderImportPolicy.SELECTED_FOLDERS,
      );

      expect(result).toContain('label:projects-active');
    });
  });

  describe('ALL_FOLDERS policy', () => {
    it('returns only default exclusions', () => {
      const result = computeGmailExcludeSearchFilter(
        [
          {
            externalId: 'INBOX',
            name: 'INBOX',
            isSynced: true,
            parentFolderId: null,
          },
        ],
        MessageFolderImportPolicy.ALL_FOLDERS,
      );

      expect(result).toContain('-label:spam');
      expect(result).toContain('-category:promotions');
      expect(result).not.toContain('label:inbox');
    });
  });

  it('uses correct Gmail search syntax for labels and categories', () => {
    const result = computeGmailExcludeSearchFilter(
      [
        {
          externalId: 'Label_1',
          name: 'Work',
          isSynced: true,
          parentFolderId: null,
        },
      ],
      MessageFolderImportPolicy.SELECTED_FOLDERS,
    );

    expect(result).toContain('-label:trash');
    expect(result).toContain('-label:spam');
    expect(result).toContain('-category:promotions');
    expect(result).toContain('-category:social');
  });
});
