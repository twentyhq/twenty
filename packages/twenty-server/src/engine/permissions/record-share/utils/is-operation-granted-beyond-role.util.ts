/* @license Enterprise */

import { type FeatureFlagKey } from 'twenty-shared/types';

import { resolveObjectSharing } from 'src/engine/permissions/record-share/utils/resolve-object-sharing.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type OperationType } from 'src/engine/permissions/role/utils/validate-operation-is-permitted-or-throw.util';

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
  operationType: OperationType;
}): boolean =>
  resolveObjectSharing({
    flatObjectMetadata,
    featureFlagsMap,
  }).operationTypesGrantedBeyondRole.includes(operationType);
