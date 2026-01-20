import { computeGmailExcludeSearchFilter } from 'src/modules/messaging/message-import-manager/drivers/gmail/utils/compute-gmail-exclude-search-filter.util';

describe('computeGmailExcludeSearchFilter', () => {
  it('should return empty string with empty folder array', () => {
    const result = computeGmailExcludeSearchFilter([]);

    expect(result).toBe('');
  });

  it('should return correct exclude filter for one unsynced folder', () => {
    const result = computeGmailExcludeSearchFilter([
      {
        externalId: 'Label_123',
        name: 'Custom Folder',
        isSynced: false,
        parentFolderId: null,
      },
    ]);

    expect(result).toBe('-label:custom-folder');
  });

  it('should return correct exclude filter for multiple unsynced folders', () => {
    const result = computeGmailExcludeSearchFilter([
      {
        externalId: 'Label_1',
        name: 'Folder One',
        isSynced: false,
        parentFolderId: null,
      },
      {
        externalId: 'Label_2',
        name: 'Folder Two',
        isSynced: false,
        parentFolderId: null,
      },
    ]);

    expect(result).toBe('-label:folder-one -label:folder-two');
  });

  it('should return empty string when all folders are synced', () => {
    const result = computeGmailExcludeSearchFilter([
      {
        externalId: 'Label_1',
        name: 'Synced Folder',
        isSynced: true,
        parentFolderId: null,
      },
    ]);

    expect(result).toBe('');
  });

  it('should only exclude unsynced folders', () => {
    const result = computeGmailExcludeSearchFilter([
      {
        externalId: 'Label_1',
        name: 'Synced',
        isSynced: true,
        parentFolderId: null,
      },
      {
        externalId: 'Label_2',
        name: 'Not Synced',
        isSynced: false,
        parentFolderId: null,
      },
      {
        externalId: 'Label_3',
        name: 'Also Synced',
        isSynced: true,
        parentFolderId: null,
      },
    ]);

    expect(result).toBe('-label:not-synced');
  });

  it('should handle nested folders with parent path', () => {
    const folders = [
      {
        externalId: 'Label_parent',
        name: 'Parent Folder',
        isSynced: true,
        parentFolderId: null,
      },
      {
        externalId: 'Label_child',
        name: 'Child Folder',
        isSynced: false,
        parentFolderId: 'Label_parent',
      },
    ];

    const result = computeGmailExcludeSearchFilter(folders);

    expect(result).toBe('-label:parent-folder-child-folder');
  });

  it('should handle deeply nested folders', () => {
    const folders = [
      {
        externalId: 'Label_grandparent',
        name: 'Level One',
        isSynced: true,
        parentFolderId: null,
      },
      {
        externalId: 'Label_parent',
        name: 'Level Two',
        isSynced: true,
        parentFolderId: 'Label_grandparent',
      },
      {
        externalId: 'Label_child',
        name: 'Level Three',
        isSynced: false,
        parentFolderId: 'Label_parent',
      },
    ];

    const result = computeGmailExcludeSearchFilter(folders);

    expect(result).toBe('-label:level-one-level-two-level-three');
  });

  it('should skip folders without names', () => {
    const result = computeGmailExcludeSearchFilter([
      {
        externalId: 'Label_1',
        name: '',
        isSynced: false,
        parentFolderId: null,
      },
      {
        externalId: 'Label_2',
        name: 'Valid Folder',
        isSynced: false,
        parentFolderId: null,
      },
    ]);

    expect(result).toBe('-label:valid-folder');
  });
});
