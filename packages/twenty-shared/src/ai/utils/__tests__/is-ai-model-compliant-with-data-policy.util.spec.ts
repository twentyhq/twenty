import { isAiModelCompliantWithDataPolicy } from '../is-ai-model-compliant-with-data-policy.util';

const WORLDWIDE = {
  aiDataResidency: null,
  isAiZeroDataRetentionRequired: false,
};

const EU_ONLY = {
  aiDataResidency: 'eu' as const,
  isAiZeroDataRetentionRequired: false,
};

const ZDR_ONLY = { aiDataResidency: null, isAiZeroDataRetentionRequired: true };

const EU_AND_ZDR = {
  aiDataResidency: 'eu' as const,
  isAiZeroDataRetentionRequired: true,
};

describe('isAiModelCompliantWithDataPolicy', () => {
  it('accepts any model when no policy is set', () => {
    expect(isAiModelCompliantWithDataPolicy({}, WORLDWIDE)).toBe(true);
  });

  it('treats an unasserted residency as outside the EU', () => {
    expect(isAiModelCompliantWithDataPolicy({}, EU_ONLY)).toBe(false);
  });

  it('accepts EU countries for the EU policy', () => {
    expect(
      isAiModelCompliantWithDataPolicy({ dataResidency: 'de' }, EU_ONLY),
    ).toBe(true);
    expect(
      isAiModelCompliantWithDataPolicy({ dataResidency: 'eu' }, EU_ONLY),
    ).toBe(true);
  });

  it('rejects global and US residencies for the EU policy', () => {
    expect(
      isAiModelCompliantWithDataPolicy({ dataResidency: 'global' }, EU_ONLY),
    ).toBe(false);
    expect(
      isAiModelCompliantWithDataPolicy({ dataResidency: 'us' }, EU_ONLY),
    ).toBe(false);
  });

  it('requires an explicit zero data retention assertion', () => {
    expect(isAiModelCompliantWithDataPolicy({}, ZDR_ONLY)).toBe(false);
    expect(
      isAiModelCompliantWithDataPolicy({ zeroDataRetention: false }, ZDR_ONLY),
    ).toBe(false);
    expect(
      isAiModelCompliantWithDataPolicy({ zeroDataRetention: true }, ZDR_ONLY),
    ).toBe(true);
  });

  it('requires both when both are set', () => {
    expect(
      isAiModelCompliantWithDataPolicy(
        { dataResidency: 'eu', zeroDataRetention: false },
        EU_AND_ZDR,
      ),
    ).toBe(false);
    expect(
      isAiModelCompliantWithDataPolicy(
        { dataResidency: 'us', zeroDataRetention: true },
        EU_AND_ZDR,
      ),
    ).toBe(false);
    expect(
      isAiModelCompliantWithDataPolicy(
        { dataResidency: 'eu', zeroDataRetention: true },
        EU_AND_ZDR,
      ),
    ).toBe(true);
  });
});
