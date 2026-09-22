import { normalizeEmailForStorage } from 'src/utils/normalize-email-for-storage.util';

describe('normalizeEmailForStorage', () => {
  it.each([
    ['Admin@💩。LA.', 'admin@💩.la'],
    ['Admin@XN--LS8H.LA', 'admin@💩.la'],
    ['Admin@München．DE', 'admin@münchen.de'],
    ['Admin@XN--MNCHEN-3YA.DE', 'admin@münchen.de'],
    ['Admin@WWW.XN--MNCHEN-3YA.DE', 'admin@www.münchen.de'],
  ])('stores %s as %s', (input, expected) => {
    expect(normalizeEmailForStorage(input)).toBe(expected);
    expect(normalizeEmailForStorage(expected)).toBe(expected);
  });
});
