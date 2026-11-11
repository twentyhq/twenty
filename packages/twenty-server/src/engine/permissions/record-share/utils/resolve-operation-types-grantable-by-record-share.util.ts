/* @license Enterprise */

import {
  type FeatureFlagKey,
  type ObjectRecordsOperationType,
} from 'twenty-shared/types';

import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { OPERATIONS_GRANTABLE_BY_RECORD_SHARE } from 'src/engine/permissions/record-share/constants/operations-grantable-by-record-share.constant';
import { isRecordSharingEnabled } from 'src/engine/permissions/record-share/utils/is-record-sharing-enabled.util';

export const resolveOperationTypesGrantableByRecordShare = ({
  flatObjectMetadata: { disabledObjectPermissionActions },
  featureFlagsMap,
}: {
  flatObjectMetadata: Pick<
    FlatObjectMetadata,
    'disabledObjectPermissionActions'
  >;
  featureFlagsMap: Partial<Record<FeatureFlagKey, boolean>>;
}): ObjectRecordsOperationType[] =>
  isRecordSharingEnabled({ featureFlagsMap })
    ? OPERATIONS_GRANTABLE_BY_RECORD_SHARE.filter(
        ({ objectPermissionAction }) =>
          !disabledObjectPermissionActions?.includes(objectPermissionAction),
      ).map(({ operationType }) => operationType)
    : [];
