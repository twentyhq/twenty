import { computeGmailExcludeSearchFilter } from 'src/modules/messaging/message-import-manager/drivers/gmail/utils/compute-gmail-exclude-search-filter.util';

describe('computeGmailExcludeSearchFilter', () => {
  it('returns empty string when no folders are synced', () => {
    const result = computeGmailExcludeSearchFilter([
      {
        externalId: 'INBOX',
        name: 'INBOX',
        isSynced: false,
        parentFolderId: null,
      },
    ]);

    expect(result).toBe('');
  });

  it('builds positive OR query for selected folders instead of negative exclusions', () => {
    const result = computeGmailExcludeSearchFilter([
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
      {
        externalId: 'SENT',
        name: 'SENT',
        isSynced: false,
        parentFolderId: null,
      },
    ]);

    expect(result).toContain('(label:crm OR label:twenty-visible)');

    expect(result).not.toContain('-label:inbox');
    expect(result).not.toContain('-label:sent');
  });

  it('uses correct Gmail search syntax for labels and categories', () => {
    const result = computeGmailExcludeSearchFilter([
      {
        externalId: 'Label_1',
        name: 'Work',
        isSynced: true,
        parentFolderId: null,
      },
    ]);

    expect(result).toContain('-label:trash');
    expect(result).toContain('-label:spam');
    expect(result).toContain('-category:promotions');
    expect(result).toContain('-category:social');
  });

  it('handles nested folder paths correctly', () => {
    const result = computeGmailExcludeSearchFilter([
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
    ]);

    expect(result).toContain('label:projects-active');
  });
});
