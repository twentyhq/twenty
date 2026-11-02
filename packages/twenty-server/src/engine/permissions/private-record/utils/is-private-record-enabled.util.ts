/* @license Enterprise */

import { FeatureFlagKey } from 'twenty-shared/types';

// TODO(@charlesBochet): remove once 2.55 leaves the cross-upgrade window; the flag goes on once a workspace has the _isPrivate column
export const isPrivateRecordEnabled = (
  featureFlagsMap: Partial<Record<FeatureFlagKey, boolean>>,
): boolean =>
  featureFlagsMap[FeatureFlagKey.IS_PRIVATE_RECORD_ENABLED] === true;
