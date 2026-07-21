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

  it('should quote and escape backslashes so they cannot neutralize quote escaping', () => {
    expect(
      formatEmailAddress({ address: 'a@example.com', name: 'A \\ B' }),
    ).toBe('"A \\\\ B" <a@example.com>');
    expect(
      formatEmailAddress({ address: 'a@example.com', name: 'x\\"y' }),
    ).toBe('"x\\\\\\"y" <a@example.com>');
  });

  it('should keep a backslash-and-quote name inside one recipient when reparsed', () => {
    const formatted = formatEmailAddress({
      address: 'a@example.com',
      name: 'x\\"y',
    });
    const reparsed = parseEmailAddressList(`${formatted}, b@example.com`);

    expect(reparsed).toHaveLength(2);
    expect(reparsed[0].address).toBe('a@example.com');
    // addressparser collapses the escaped backslash: containment is the
    // contract here, not byte fidelity of exotic display names.
    expect(reparsed[0].name).toBe('x"y');
    expect(reparsed[1]).toEqual({ address: 'b@example.com', name: '' });
  });

  it('should quote names containing group or comment syntax so they round-trip', () => {
    const colonFormatted = formatEmailAddress({
      address: 'a@b.com',
      name: 'Re: update',
    });

    expect(colonFormatted).toBe('"Re: update" <a@b.com>');
    expect(parseEmailAddressList(colonFormatted)).toEqual([
      { address: 'a@b.com', name: 'Re: update' },
    ]);

    const parenthesesFormatted = formatEmailAddress({
      address: 'b@c.com',
      name: 'Bob (Sales)',
    });

    expect(parenthesesFormatted).toBe('"Bob (Sales)" <b@c.com>');
    expect(parseEmailAddressList(parenthesesFormatted)).toEqual([
      { address: 'b@c.com', name: 'Bob (Sales)' },
    ]);
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
