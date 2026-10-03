import { FEATURE_FLAG_KEYS_ENABLED_BY_DEFAULT } from '@/constants/FeatureFlagKeysEnabledByDefault';
import { type FeatureFlagKey } from '@/types/FeatureFlagKey';

export const isFeatureFlagEnabled = ({
  featureFlagKey,
  value,
}: {
  featureFlagKey: `${FeatureFlagKey}`;
  value: boolean | null | undefined;
}): boolean =>
  value ??
  FEATURE_FLAG_KEYS_ENABLED_BY_DEFAULT.some(
    (featureFlagKeyEnabledByDefault) =>
      featureFlagKeyEnabledByDefault === featureFlagKey,
  );
