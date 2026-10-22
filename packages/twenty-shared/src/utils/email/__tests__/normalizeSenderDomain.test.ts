import { normalizeSenderDomain } from '@/utils/email/normalizeSenderDomain';

describe('normalizeSenderDomain', () => {
  it('trims, removes a leading @ and lowercases', () => {
    expect(normalizeSenderDomain(' @GetIndexed.AI ')).toBe('getindexed.ai');
  });

  it('returns null for empty or missing values', () => {
    expect(normalizeSenderDomain('')).toBeNull();
    expect(normalizeSenderDomain(' @ ')).toBeNull();
    expect(normalizeSenderDomain(null)).toBeNull();
    expect(normalizeSenderDomain(undefined)).toBeNull();
  });
});
