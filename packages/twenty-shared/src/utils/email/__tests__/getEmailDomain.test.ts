import { getEmailDomain } from '@/utils/email/getEmailDomain';

describe('getEmailDomain', () => {
  it('returns the lowercased part after the last @', () => {
    expect(getEmailDomain('Jane@Example.COM')).toBe('example.com');
    expect(getEmailDomain('weird@local@Sub.Example.com')).toBe(
      'sub.example.com',
    );
  });

  it('returns null without a domain', () => {
    expect(getEmailDomain('example.com')).toBeNull();
    expect(getEmailDomain('jane@')).toBeNull();
    expect(getEmailDomain(null)).toBeNull();
    expect(getEmailDomain(undefined)).toBeNull();
  });
});
