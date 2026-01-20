import { MESSAGING_GMAIL_DEFAULT_NOT_SYNCED_LABELS } from 'src/modules/messaging/message-import-manager/drivers/gmail/constants/messaging-gmail-default-not-synced-labels';
import { computeGmailExcludeSearchFilter } from 'src/modules/messaging/message-import-manager/drivers/gmail/utils/compute-gmail-exclude-search-filter.util';

describe('computeGmailExcludeSearchFilter', () => {
  it('should always include default excluded labels', () => {
    const result = computeGmailExcludeSearchFilter([]);
    const expectedLabels = MESSAGING_GMAIL_DEFAULT_NOT_SYNCED_LABELS.map(
      (label) => `-label:${label}`,
    ).join(' ');

    expect(result).toBe(expectedLabels);
  });

  it('should include user disabled label', () => {
    const result = computeGmailExcludeSearchFilter([
      { externalId: 'Label_personal', isSynced: false },
    ]);

    expect(result).toContain('-label:Label_personal');
  });

  it('should include multiple user disabled labels', () => {
    const result = computeGmailExcludeSearchFilter([
      { externalId: 'Label_personal', isSynced: false },
      { externalId: 'Label_newsletters', isSynced: false },
    ]);

    expect(result).toContain('-label:Label_personal');
    expect(result).toContain('-label:Label_newsletters');
  });

  it('should not include synced folders', () => {
    const result = computeGmailExcludeSearchFilter([
      { externalId: 'Label_work', isSynced: true },
    ]);

    expect(result).not.toContain('-label:Label_work');
  });

  it('should only exclude non-synced user folders', () => {
    const result = computeGmailExcludeSearchFilter([
      { externalId: 'Label_work', isSynced: true },
      { externalId: 'Label_personal', isSynced: false },
      { externalId: 'Label_newsletters', isSynced: true },
    ]);

    expect(result).toContain('-label:Label_personal');
    expect(result).not.toContain('-label:Label_work');
    expect(result).not.toContain('-label:Label_newsletters');
  });
});
