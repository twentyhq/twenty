/* @license Enterprise */

import {
  type FeatureFlagKey,
  type ObjectRecordsOperationType,
} from 'twenty-shared/types';

import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { OPERATIONS_ACCESSIBLE_THROUGH_RECORD_SHARE } from 'src/engine/permissions/record-share/constants/operations-accessible-through-record-share.constant';
import { areRecordSharesApplied } from 'src/engine/permissions/record-share/utils/are-record-shares-applied.util';

export const resolveOperationTypesAccessibleThroughRecordShare = ({
  flatObjectMetadata,
  featureFlagsMap,
}: {
  flatObjectMetadata: Pick<
    FlatObjectMetadata,
    'universalIdentifier' | 'disabledObjectPermissionActions'
  >;
  featureFlagsMap: Partial<Record<FeatureFlagKey, boolean>>;
}): ObjectRecordsOperationType[] =>
  areRecordSharesApplied({ flatObjectMetadata, featureFlagsMap })
    ? OPERATIONS_ACCESSIBLE_THROUGH_RECORD_SHARE.filter(
        ({ objectPermissionAction }) =>
          !flatObjectMetadata.disabledObjectPermissionActions?.includes(
            objectPermissionAction,
          ),
      ).map(({ operationType }) => operationType)
    : [];
