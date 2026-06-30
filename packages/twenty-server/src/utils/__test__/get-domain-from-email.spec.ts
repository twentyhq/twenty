import { getDomainFromEmail } from 'src/utils/get-domain-from-email';

describe('getDomainFromEmail', () => {
  it('returns the domain of a simple address', () => {
    expect(getDomainFromEmail('user@example.com')).toBe('example.com');
  });

  it('returns the domain after the last "@" for a quoted local part', () => {
    expect(getDomainFromEmail('"a@b"@example.com')).toBe('example.com');
  });

  it('returns subdomains intact', () => {
    expect(getDomainFromEmail('user@mail.example.com')).toBe(
      'mail.example.com',
    );
  });

  it('preserves the original case', () => {
    expect(getDomainFromEmail('User@Example.COM')).toBe('Example.COM');
  });

  it('returns an empty string when the domain part is missing', () => {
    expect(getDomainFromEmail('user@')).toBe('');
  });

  it('returns undefined when there is no "@"', () => {
    expect(getDomainFromEmail('not-an-email')).toBeUndefined();
  });
});
