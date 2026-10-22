import { getEmailDomain } from '@/utils/email/getEmailDomain';

describe('getEmailDomain', () => {
  it('returns the lowercased part after the last @', () => {
    expect(getEmailDomain('Jane@GetIndexed.AI')).toBe('getindexed.ai');
    expect(getEmailDomain('"a@b"@example.com')).toBe('example.com');
  });

  it('returns null without a domain', () => {
    expect(getEmailDomain('no-at-sign')).toBeNull();
    expect(getEmailDomain('jane@')).toBeNull();
  });
});
