import { parseEmailAddressList } from '@/utils';

describe('parseEmailAddressList', () => {
  it('should parse a bare email address', () => {
    expect(parseEmailAddressList('jane@example.com')).toEqual([
      { address: 'jane@example.com', displayName: undefined },
    ]);
  });

  it('should parse a display name with angle brackets', () => {
    expect(parseEmailAddressList('Jane Doe <jane@example.com>')).toEqual([
      { address: 'jane@example.com', displayName: 'Jane Doe' },
    ]);
  });

  it('should parse a quoted display name containing a comma', () => {
    expect(
      parseEmailAddressList('"Doe, Jane" <jane@example.com>, bob@example.com'),
    ).toEqual([
      { address: 'jane@example.com', displayName: 'Doe, Jane' },
      { address: 'bob@example.com', displayName: undefined },
    ]);
  });

  it('should parse comma separated addresses', () => {
    expect(parseEmailAddressList('a@example.com, b@example.com')).toEqual([
      { address: 'a@example.com', displayName: undefined },
      { address: 'b@example.com', displayName: undefined },
    ]);
  });

  it('should parse semicolon separated addresses', () => {
    expect(parseEmailAddressList('a@example.com; b@example.com')).toEqual([
      { address: 'a@example.com', displayName: undefined },
      { address: 'b@example.com', displayName: undefined },
    ]);
  });

  it('should parse newline separated addresses', () => {
    expect(parseEmailAddressList('a@example.com\nb@example.com')).toEqual([
      { address: 'a@example.com', displayName: undefined },
      { address: 'b@example.com', displayName: undefined },
    ]);
  });

  it('should skip empty entries between separators', () => {
    expect(parseEmailAddressList('a@example.com,, ,b@example.com')).toEqual([
      { address: 'a@example.com', displayName: undefined },
      { address: 'b@example.com', displayName: undefined },
    ]);
  });

  it('should flatten address groups', () => {
    expect(
      parseEmailAddressList('Friends: a@example.com, b@example.com;'),
    ).toEqual([
      { address: 'a@example.com', displayName: undefined },
      { address: 'b@example.com', displayName: undefined },
    ]);
  });

  it('should return an empty list for empty groups', () => {
    expect(parseEmailAddressList('undisclosed-recipients:;')).toEqual([]);
  });

  it('should return an empty list for whitespace only input', () => {
    expect(parseEmailAddressList('   ')).toEqual([]);
  });

  it('should drop entries that parse without an address', () => {
    expect(parseEmailAddressList('NoAddressHere, bob@example.com')).toEqual([
      { address: 'bob@example.com', displayName: undefined },
    ]);
  });
});
