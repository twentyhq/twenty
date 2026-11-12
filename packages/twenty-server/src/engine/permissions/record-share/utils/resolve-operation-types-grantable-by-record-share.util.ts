/* @license Enterprise */

import {
  type FeatureFlagKey,
  type ObjectRecordsOperationType,
} from 'twenty-shared/types';

import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { OPERATIONS_GRANTABLE_BY_RECORD_SHARE } from 'src/engine/permissions/record-share/constants/operations-grantable-by-record-share.constant';
import { areRecordSharesApplied } from 'src/engine/permissions/record-share/utils/are-record-shares-applied.util';

export const resolveOperationTypesGrantableByRecordShare = ({
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
    ? OPERATIONS_GRANTABLE_BY_RECORD_SHARE.filter(
        ({ objectPermissionAction }) =>
          !flatObjectMetadata.disabledObjectPermissionActions?.includes(
            objectPermissionAction,
          ),
      ).map(({ operationType }) => operationType)
    : [];
