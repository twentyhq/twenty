/* @license Enterprise */

import {
  type FeatureFlagKey,
  type ObjectRecordsOperationType,
} from 'twenty-shared/types';

import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { resolveOperationTypesGrantableByRecordShare } from 'src/engine/permissions/record-share/utils/resolve-operation-types-grantable-by-record-share.util';

export const canRecordShareGrantOperation = ({
  flatObjectMetadata,
  featureFlagsMap,
  operationType,
}: {
  flatObjectMetadata: Pick<
    FlatObjectMetadata,
    'universalIdentifier' | 'disabledObjectPermissionActions'
  >;
  featureFlagsMap: Partial<Record<FeatureFlagKey, boolean>>;
  operationType: ObjectRecordsOperationType;
}): boolean =>
  resolveOperationTypesGrantableByRecordShare({
    flatObjectMetadata,
    featureFlagsMap,
  }).includes(operationType);
