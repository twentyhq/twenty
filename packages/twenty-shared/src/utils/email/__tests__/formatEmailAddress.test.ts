import { formatEmailAddress } from '../formatEmailAddress';
import { parseEmailAddressList } from '../parseEmailAddressList';

describe('formatEmailAddress', () => {
  it('should return the bare address when there is no name', () => {
    expect(formatEmailAddress({ address: 'alice@example.com' })).toBe(
      'alice@example.com',
    );
    expect(formatEmailAddress({ address: 'alice@example.com', name: '' })).toBe(
      'alice@example.com',
    );
  });

  it('should append the name unquoted when it contains no special characters', () => {
    expect(
      formatEmailAddress({ address: 'alice@example.com', name: 'Alice Doe' }),
    ).toBe('Alice Doe <alice@example.com>');
  });

  it('should quote names containing special characters', () => {
    expect(
      formatEmailAddress({ address: 'jd@example.com', name: 'Doe, John' }),
    ).toBe('"Doe, John" <jd@example.com>');
  });

  it('should escape double quotes inside quoted names', () => {
    expect(
      formatEmailAddress({ address: 'a@example.com', name: 'A "B" C' }),
    ).toBe('"A \\"B\\" C" <a@example.com>');
  });

  it('should not quote RFC 2047 encoded words', () => {
    expect(
      formatEmailAddress({
        address: 'user@example.com',
        name: '=?UTF-8?B?VGVzdCBVc2Vy?=',
      }),
    ).toBe('=?UTF-8?B?VGVzdCBVc2Vy?= <user@example.com>');
  });

  it('should round-trip through parseEmailAddressList', () => {
    const formatted = formatEmailAddress({
      address: 'jd@example.com',
      name: 'Doe, John',
    });

    expect(parseEmailAddressList(formatted)).toEqual([
      { address: 'jd@example.com', name: 'Doe, John' },
    ]);
  });
});
