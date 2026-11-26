/* @license Enterprise */

import { type ObjectRecordsOperationType } from 'twenty-shared/types';

import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { OPERATIONS_ACCESSIBLE_THROUGH_RECORD_SHARE } from 'src/engine/permissions/record-share/constants/operations-accessible-through-record-share.constant';

export const resolveOperationTypesAccessibleThroughRecordShare = ({
  flatObjectMetadata,
}: {
  flatObjectMetadata: Pick<
    FlatObjectMetadata,
    'disabledObjectPermissionActions'
  >;
}): ObjectRecordsOperationType[] =>
  OPERATIONS_ACCESSIBLE_THROUGH_RECORD_SHARE.filter(
    ({ objectPermissionAction }) =>
      !flatObjectMetadata.disabledObjectPermissionActions?.includes(
        objectPermissionAction,
      ),
  ).map(({ operationType }) => operationType);
