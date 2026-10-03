import { FeatureFlagKey } from '@/types';
import { isFeatureFlagEnabled } from '@/utils';

describe('isFeatureFlagEnabled', () => {
  it('reads an explicit value as is', () => {
    expect(
      isFeatureFlagEnabled({
        featureFlagKey: FeatureFlagKey.IS_RECORD_LEVEL_SHARING_ENABLED,
        value: true,
      }),
    ).toBe(true);
    expect(
      isFeatureFlagEnabled({
        featureFlagKey:
          FeatureFlagKey.IS_RECORD_SHARE_VISIBILITY_GATING_ENABLED,
        value: false,
      }),
    ).toBe(false);
  });

  it('treats a missing flag as disabled', () => {
    expect(
      isFeatureFlagEnabled({
        featureFlagKey: FeatureFlagKey.IS_RECORD_LEVEL_SHARING_ENABLED,
        value: undefined,
      }),
    ).toBe(false);
  });

  it('treats a missing flag that is enabled by default as enabled', () => {
    expect(
      isFeatureFlagEnabled({
        featureFlagKey:
          FeatureFlagKey.IS_RECORD_SHARE_VISIBILITY_GATING_ENABLED,
        value: undefined,
      }),
    ).toBe(true);
  });
});
