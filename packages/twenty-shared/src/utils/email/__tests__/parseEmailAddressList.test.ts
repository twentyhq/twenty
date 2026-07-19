import { parseEmailAddressList } from '../parseEmailAddressList';

describe('parseEmailAddressList', () => {
  it('should parse a comma-separated list of bare addresses', () => {
    expect(parseEmailAddressList('alice@example.com, bob@example.com')).toEqual(
      [
        { address: 'alice@example.com', name: '' },
        { address: 'bob@example.com', name: '' },
      ],
    );
  });

  it('should parse display names in angle-bracket form', () => {
    expect(
      parseEmailAddressList(
        'Alice <alice@example.com>, "Bob Smith" <bob@example.com>',
      ),
    ).toEqual([
      { address: 'alice@example.com', name: 'Alice' },
      { address: 'bob@example.com', name: 'Bob Smith' },
    ]);
  });

  it('should not split on commas inside quoted display names', () => {
    expect(
      parseEmailAddressList('"Doe, John" <jd@example.com>, bob@example.com'),
    ).toEqual([
      { address: 'jd@example.com', name: 'Doe, John' },
      { address: 'bob@example.com', name: '' },
    ]);
  });

  it('should split on semicolons', () => {
    expect(parseEmailAddressList('alice@example.com; bob@example.com')).toEqual(
      [
        { address: 'alice@example.com', name: '' },
        { address: 'bob@example.com', name: '' },
      ],
    );
  });

  it('should flatten address groups into their members', () => {
    expect(
      parseEmailAddressList(
        'Team: alice@example.com, Bob <bob@example.com>;, carol@example.com',
      ),
    ).toEqual([
      { address: 'alice@example.com', name: '' },
      { address: 'bob@example.com', name: 'Bob' },
      { address: 'carol@example.com', name: '' },
    ]);
  });

  it('should drop empty groups without emitting entries', () => {
    expect(parseEmailAddressList('undisclosed-recipients:;')).toEqual([]);
  });

  it('should flatten nested groups recursively', () => {
    expect(parseEmailAddressList('Outer: Inner: a@b.com;;, c@d.com')).toEqual([
      { address: 'a@b.com', name: '' },
      { address: 'c@d.com', name: '' },
    ]);
  });

  it('should keep name-only tokens with an empty address', () => {
    expect(parseEmailAddressList('NoAddressHere, bob@example.com')).toEqual([
      { address: '', name: 'NoAddressHere' },
      { address: 'bob@example.com', name: '' },
    ]);
  });

  it('should return an empty list for empty input', () => {
    expect(parseEmailAddressList('')).toEqual([]);
    expect(parseEmailAddressList('   ')).toEqual([]);
  });
});
