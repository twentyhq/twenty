import { getEmailDomain } from '@/utils/email/getEmailDomain';

describe('getEmailDomain', () => {
  it('returns the lowercased part after the last @', () => {
    expect(getEmailDomain('Jane@Example.COM')).toBe('example.com');
    expect(getEmailDomain('"a@b"@example.com')).toBe('example.com');
  });

  it('returns null without a domain', () => {
    expect(getEmailDomain('no-at-sign')).toBeNull();
    expect(getEmailDomain('jane@')).toBeNull();
  });

  it('returns null for a value without an @, even if it looks like a domain', () => {
    expect(getEmailDomain('example.com')).toBeNull();
  });
});
