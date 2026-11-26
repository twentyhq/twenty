/* @license Enterprise */

import { type ObjectRecordsOperationType } from 'twenty-shared/types';

import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { resolveOperationTypesAccessibleThroughRecordShare } from 'src/engine/permissions/record-share/utils/resolve-operation-types-accessible-through-record-share.util';

export const canRecordShareAccessOperation = ({
  flatObjectMetadata,
  operationType,
}: {
  flatObjectMetadata: Pick<
    FlatObjectMetadata,
    'universalIdentifier' | 'disabledObjectPermissionActions'
  >;
  operationType: ObjectRecordsOperationType;
}): boolean =>
  resolveOperationTypesAccessibleThroughRecordShare({
    flatObjectMetadata,
  }).includes(operationType);
