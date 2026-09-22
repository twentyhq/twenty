import { getEmailIdentityKey } from '@/utils/email/getEmailIdentityKey';

describe('getEmailIdentityKey', () => {
  it.each([
    ['Admin@💩.LA', 'admin@xn--ls8h.la'],
    ['admin@XN--LS8H.LA', 'admin@xn--ls8h.la'],
    ['  Admin@💩。LA.  ', 'admin@xn--ls8h.la'],
    ['Admin@München．DE', 'admin@xn--mnchen-3ya.de'],
    ['Admin@München｡DE.', 'admin@xn--mnchen-3ya.de'],
    ['Admin@WWW.München.DE', 'admin@www.xn--mnchen-3ya.de'],
    ['JÖHN@EXAMPLE.COM', 'jöhn@example.com'],
  ])('canonicalizes %s to %s', (input, expected) => {
    expect(getEmailIdentityKey(input)).toBe(expected);
    expect(getEmailIdentityKey(expected)).toBe(expected);
  });

  it('leaves invalid domain syntax for the email validator to reject', () => {
    expect(getEmailIdentityKey('user@example.com/path')).toBe(
      'user@example.com/path',
    );
  });
});
