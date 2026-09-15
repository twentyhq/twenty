import { filterMessageExternalIdsToDelete } from 'src/modules/messaging/message-import-manager/utils/filter-message-external-ids-to-delete.util';

describe('filterMessageExternalIdsToDelete', () => {
  it('keeps a message when one folder removes it while another still returns it', () => {
    expect(
      filterMessageExternalIdsToDelete({
        messageExternalIds: ['moved-message', 'current-message'],
        messageExternalIdsToDelete: ['moved-message', 'deleted-message'],
      }),
    ).toEqual(['deleted-message']);
  });

  it('deduplicates deletion events returned by multiple folders', () => {
    expect(
      filterMessageExternalIdsToDelete({
        messageExternalIds: [],
        messageExternalIdsToDelete: ['deleted-message', 'deleted-message'],
      }),
    ).toEqual(['deleted-message']);
  });
});
