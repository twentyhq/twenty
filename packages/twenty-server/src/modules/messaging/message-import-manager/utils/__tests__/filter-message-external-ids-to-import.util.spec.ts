import { ConnectedAccountProvider } from 'twenty-shared/types';

import { filterMessageExternalIdsToImport } from 'src/modules/messaging/message-import-manager/utils/filter-message-external-ids-to-import.util';

describe('filterMessageExternalIdsToImport', () => {
  const existingAssociations = [
    { messageExternalId: 'draft', message: { isDraft: true } },
    { messageExternalId: 'sent', message: { isDraft: false } },
    { messageExternalId: 'missing-message', message: null },
  ];
  const messageExternalIds = ['draft', 'sent', 'missing-message', 'new'];

  it('reimports Microsoft drafts returned by delta or full sync', () => {
    expect(
      filterMessageExternalIdsToImport({
        messageExternalIds,
        existingAssociations,
        provider: ConnectedAccountProvider.MICROSOFT,
      }),
    ).toEqual(['draft', 'new']);
  });

  it.each([
    ConnectedAccountProvider.GOOGLE,
    ConnectedAccountProvider.IMAP_SMTP_CALDAV,
  ])('keeps the existing deduplication for %s', (provider) => {
    expect(
      filterMessageExternalIdsToImport({
        messageExternalIds,
        existingAssociations,
        provider,
      }),
    ).toEqual(['new']);
  });

  it('imports new messages when the channel has no associations', () => {
    expect(
      filterMessageExternalIdsToImport({
        messageExternalIds: ['new'],
        existingAssociations: [],
        provider: ConnectedAccountProvider.MICROSOFT,
      }),
    ).toEqual(['new']);
  });
});
