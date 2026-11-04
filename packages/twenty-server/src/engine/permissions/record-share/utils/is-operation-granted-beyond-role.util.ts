/* @license Enterprise */

import {
  type FeatureFlagKey,
  type ObjectRecordsOperationType,
} from 'twenty-shared/types';

import { resolveObjectSharing } from 'src/engine/permissions/record-share/utils/resolve-object-sharing.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export const isOperationGrantedBeyondRole = ({
  flatObjectMetadata,
  featureFlagsMap,
  operationType,
}: {
  flatObjectMetadata: Pick<
    FlatObjectMetadata,
    'universalIdentifier' | 'isSystem' | 'disabledObjectPermissionActions'
  >;
  featureFlagsMap: Partial<Record<FeatureFlagKey, boolean>>;
  operationType: ObjectRecordsOperationType;
}): boolean =>
  resolveObjectSharing({
    flatObjectMetadata,
    featureFlagsMap,
  }).operationTypesGrantedBeyondRole.includes(operationType);
