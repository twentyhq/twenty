import { parseEmailFromAddress } from 'src/utils/parse-email-from-address';

describe('parseEmailFromAddress', () => {
  it('parses a plain email address', () => {
    const result = parseEmailFromAddress('user@example.com');

    expect(result).toEqual({ name: '', address: 'user@example.com' });
  });

  it('parses RFC 5322 format with quoted display name', () => {
    const result = parseEmailFromAddress('"Acme CRM" <noreply@acme.com>');

    expect(result).toEqual({ name: 'Acme CRM', address: 'noreply@acme.com' });
  });

  it('parses RFC 5322 format without quotes around display name', () => {
    const result = parseEmailFromAddress('Acme CRM <noreply@acme.com>');

    expect(result).toEqual({ name: 'Acme CRM', address: 'noreply@acme.com' });
  });

  it('handles display names containing commas', () => {
    const result = parseEmailFromAddress('"Doe, John" <john@example.com>');

    expect(result).toEqual({
      name: 'Doe, John',
      address: 'john@example.com',
    });
  });

  it('handles display name with special characters', () => {
    const result = parseEmailFromAddress(
      '"John O\'Reilly" <john@example.com>',
    );

    expect(result).toEqual({
      name: "John O'Reilly",
      address: 'john@example.com',
    });
  });

  it('takes only the first address when multiple are present', () => {
    const result = parseEmailFromAddress(
      'alice@example.com, bob@example.com',
    );

    expect(result).toEqual({ name: '', address: 'alice@example.com' });
  });

  it('returns empty name and raw value as address for unparseable input', () => {
    const result = parseEmailFromAddress('not-valid');

    expect(result.address).toBe('not-valid');
    expect(result.name).toBe('');
  });

  it('falls back gracefully on empty string', () => {
    const result = parseEmailFromAddress('');

    expect(result.address).toBe('');
    expect(result.name).toBe('');
  });
});
