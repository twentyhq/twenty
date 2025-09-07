import { computeGmailExcludeSearchFilter } from 'src/modules/messaging/message-import-manager/drivers/gmail/utils/compute-gmail-exclude-search-filter.util';

describe('computeGmailExcludeSearchFilter', () => {
  it('should return correct exclude search filter with empty label array', () => {
    const result = computeGmailExcludeSearchFilter([]);

    expect(result).toBe('');
  });

  it('should return correct exclude search filter with one label', () => {
    const result = computeGmailExcludeSearchFilter([
      {
        externalId: 'LABEL1',
        isSynced: false,
      },
    ]);

    expect(result).toBe('-label:LABEL1');
  });

  it('should return correct exclude search filter with multiple categories', () => {
    const result = computeGmailExcludeSearchFilter([
      {
        externalId: 'LABEL1',
        isSynced: false,
      },
      {
        externalId: 'LABEL2',
        isSynced: false,
      },
      {
        externalId: 'LABEL3',
        isSynced: false,
      },
    ]);

    expect(result).toBe('-label:LABEL1 -label:LABEL2 -label:LABEL3');
  });

  it('should return correct exclude search filter with one label that is synced', () => {
    const result = computeGmailExcludeSearchFilter([
      {
        externalId: 'LABEL1',
        isSynced: true,
      },
    ]);

    expect(result).toBe('');
  });

  it('should return correct exclude search filter with multiple categories that are synced', () => {
    const result = computeGmailExcludeSearchFilter([
      {
        externalId: 'LABEL1',
        isSynced: true,
      },
      {
        externalId: 'LABEL2',
        isSynced: false,
      },
      {
        externalId: 'LABEL3',
        isSynced: true,
      },
    ]);

    expect(result).toBe('-label:LABEL2');
  });
});
