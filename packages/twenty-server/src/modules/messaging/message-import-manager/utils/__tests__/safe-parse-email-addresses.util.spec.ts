import { safeParseEmailAddresses } from 'src/modules/messaging/message-import-manager/utils/safe-parse-email-addresses.util';

describe('safeParseEmailAddresses', () => {
  it('should return every recipient from a multi-address header', () => {
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

    expect(first?.name).toBe('');
  });

  it('should drop entries that parse without an address', () => {
    // A bare name yields an entry with no address, which would become a participant with handle ""
    expect(safeParseEmailAddresses('NoAddressHere, bob@example.com')).toEqual([
      { address: 'bob@example.com', name: '' },
    ]);
  });

  it('should flatten RFC 5322 address groups into their members', () => {
    // addressparser nests group members under `group` with no top-level address
    expect(
      safeParseEmailAddresses(
        'Team: alice@example.com, Bob <bob@example.com>;, carol@example.com',
      ),
    ).toEqual([
      { address: 'alice@example.com', name: '' },
      { address: 'bob@example.com', name: 'Bob' },
      { address: 'carol@example.com', name: '' },
    ]);
  });

  it('should return nothing for an empty group', () => {
    expect(safeParseEmailAddresses('undisclosed-recipients:;')).toEqual([]);
  });

  it('should not split on commas inside quoted display names', () => {
    // RFC 5322 allows commas inside quoted strings
    expect(
      safeParseEmailAddresses('"Doe, John" <jd@example.com>, bob@example.com'),
    ).toEqual([
      { address: 'jd@example.com', name: 'Doe, John' },
      { address: 'bob@example.com', name: '' },
    ]);
  });
});
