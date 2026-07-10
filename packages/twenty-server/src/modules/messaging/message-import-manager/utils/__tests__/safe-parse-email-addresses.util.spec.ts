import { safeParseEmailAddresses } from 'src/modules/messaging/message-import-manager/utils/safe-parse-email-addresses.util';

describe('safeParseEmailAddresses', () => {
  it('should return every recipient from a multi-address header', () => {
    // Regression: previously only the first recipient survived, silently dropping
    // CCs/BCCs and additional TOs for any Gmail-synced message with >1 recipient.
    expect(
      safeParseEmailAddresses(
        'alice@example.com, bob@example.com, carol@example.com',
      ),
    ).toHaveLength(3);
  });

  it('should map display names to the name field', () => {
    expect(
      safeParseEmailAddresses(
        'Alice <alice@example.com>, "Bob Smith" <bob@example.com>',
      ),
    ).toEqual([
      { address: 'alice@example.com', name: 'Alice' },
      { address: 'bob@example.com', name: 'Bob Smith' },
    ]);
  });
});
