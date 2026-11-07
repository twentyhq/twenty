/* @license Enterprise */

import { FeatureFlagKey } from 'twenty-shared/types';

import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { isPrivateByDefaultObject } from 'src/engine/permissions/private-record/utils/is-private-by-default-object.util';

// Sharing used to gate private writes, so its workspaces may hold private records until the 2.57 backfill has run everywhere
export const arePrivateRecordsEnabled = ({
  flatObjectMetadata,
  featureFlagsMap,
}: {
  flatObjectMetadata: Pick<FlatObjectMetadata, 'universalIdentifier'>;
  featureFlagsMap: Partial<Record<FeatureFlagKey, boolean>>;
}): boolean =>
  isPrivateByDefaultObject(flatObjectMetadata) ||
  (featureFlagsMap[FeatureFlagKey.IS_PRIVATE_RECORDS_ENABLED] ?? false) ||
  (featureFlagsMap[FeatureFlagKey.IS_RECORD_LEVEL_SHARING_ENABLED] ?? false);
