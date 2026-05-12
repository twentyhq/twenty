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

  it('should preserve display names alongside addresses', () => {
    expect(
      safeParseEmailAddresses(
        'Alice <alice@example.com>, "Bob Smith" <bob@example.com>',
      ),
    ).toEqual([
      { address: 'alice@example.com', name: 'Alice' },
      { address: 'bob@example.com', name: 'Bob Smith' },
    ]);
  });

  it('should default an absent display name to empty string, not undefined', () => {
    const [first] = safeParseEmailAddresses('alice@example.com');

    expect(first.name).toBe('');
  });

  it('should drop entries that parse without an address', () => {
    // addressparser yields entries with no `address` for tokens like a bare name —
    // those would produce participants with handle "" and break matching downstream.
    expect(safeParseEmailAddresses('NoAddressHere, bob@example.com')).toEqual([
      { address: 'bob@example.com', name: '' },
    ]);
  });
});
