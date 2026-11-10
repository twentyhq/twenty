/* @license Enterprise */

import { FeatureFlagKey } from 'twenty-shared/types';

import { type PermissionsRowAccessRequest } from 'src/engine/permissions/internal/combine/types/row-access-policy.type';
import { isPrivateByDefaultObject } from 'src/engine/permissions/private-record/utils/is-private-by-default-object.util';

export const isRecordShareReadEnabled = ({
  flatObjectMetadata,
  metadataMaps: { featureFlagsMap },
}: Pick<
  PermissionsRowAccessRequest,
  'flatObjectMetadata' | 'metadataMaps'
>): boolean =>
  isPrivateByDefaultObject(flatObjectMetadata) ||
  (featureFlagsMap[FeatureFlagKey.IS_RECORD_LEVEL_SHARING_ENABLED] ?? false);
