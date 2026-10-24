import { isAiModelCompliantWithDataPolicy } from '../is-ai-model-compliant-with-data-policy.util';

const WORLDWIDE = {
  aiDataResidency: null,
  isAiZeroDataRetentionRequired: false,
};

const EU_ONLY = {
  aiDataResidency: 'eu' as const,
  isAiZeroDataRetentionRequired: false,
};

const ZERO_DATA_RETENTION_ONLY = {
  aiDataResidency: null,
  isAiZeroDataRetentionRequired: true,
};

const EU_AND_ZERO_DATA_RETENTION = {
  aiDataResidency: 'eu' as const,
  isAiZeroDataRetentionRequired: true,
};

describe('isAiModelCompliantWithDataPolicy', () => {
  it('accepts any model when no policy is set', () => {
    expect(
      isAiModelCompliantWithDataPolicy({ model: {}, aiDataPolicy: WORLDWIDE }),
    ).toBe(true);
  });

  it('treats an unasserted residency as outside the EU', () => {
    expect(
      isAiModelCompliantWithDataPolicy({ model: {}, aiDataPolicy: EU_ONLY }),
    ).toBe(false);
  });

  it('accepts EU countries for the EU policy', () => {
    expect(
      isAiModelCompliantWithDataPolicy({
        model: { dataResidency: 'de' },
        aiDataPolicy: EU_ONLY,
      }),
    ).toBe(true);
    expect(
      isAiModelCompliantWithDataPolicy({
        model: { dataResidency: 'eu' },
        aiDataPolicy: EU_ONLY,
      }),
    ).toBe(true);
  });

  it('rejects global and US residencies for the EU policy', () => {
    expect(
      isAiModelCompliantWithDataPolicy({
        model: { dataResidency: 'global' },
        aiDataPolicy: EU_ONLY,
      }),
    ).toBe(false);
    expect(
      isAiModelCompliantWithDataPolicy({
        model: { dataResidency: 'us' },
        aiDataPolicy: EU_ONLY,
      }),
    ).toBe(false);
  });

  it('requires an explicit zero data retention assertion', () => {
    expect(
      isAiModelCompliantWithDataPolicy({
        model: {},
        aiDataPolicy: ZERO_DATA_RETENTION_ONLY,
      }),
    ).toBe(false);
    expect(
      isAiModelCompliantWithDataPolicy({
        model: { zeroDataRetention: false },
        aiDataPolicy: ZERO_DATA_RETENTION_ONLY,
      }),
    ).toBe(false);
    expect(
      isAiModelCompliantWithDataPolicy({
        model: { zeroDataRetention: true },
        aiDataPolicy: ZERO_DATA_RETENTION_ONLY,
      }),
    ).toBe(true);
  });

  it('requires both when both are set', () => {
    expect(
      isAiModelCompliantWithDataPolicy({
        model: { dataResidency: 'eu', zeroDataRetention: false },
        aiDataPolicy: EU_AND_ZERO_DATA_RETENTION,
      }),
    ).toBe(false);
    expect(
      isAiModelCompliantWithDataPolicy({
        model: { dataResidency: 'us', zeroDataRetention: true },
        aiDataPolicy: EU_AND_ZERO_DATA_RETENTION,
      }),
    ).toBe(false);
    expect(
      isAiModelCompliantWithDataPolicy({
        model: { dataResidency: 'eu', zeroDataRetention: true },
        aiDataPolicy: EU_AND_ZERO_DATA_RETENTION,
      }),
    ).toBe(true);
  });
});
