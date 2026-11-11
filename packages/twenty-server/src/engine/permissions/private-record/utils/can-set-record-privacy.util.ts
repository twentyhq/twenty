/* @license Enterprise */

import { FeatureFlagKey } from 'twenty-shared/types';

import { isRecordSharingEnabled } from 'src/engine/permissions/record-share/utils/is-record-sharing-enabled.util';

export const canSetRecordPrivacy = ({
  featureFlagsMap,
}: {
  featureFlagsMap: Partial<Record<FeatureFlagKey, boolean>>;
}): boolean =>
  isRecordSharingEnabled({ featureFlagsMap }) ||
  (featureFlagsMap[FeatureFlagKey.IS_PRIVATE_RECORDS_ENABLED] ?? false);
