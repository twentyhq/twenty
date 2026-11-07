import { isDefined } from 'twenty-shared/utils';

import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/permissions/permissions.exception';
import { type RecordReadRestrictions } from 'src/engine/permissions/types/record-read-restrictions.type';

// properties holds other objects' field values, so querying it reveals restricted fields
export const assertTimelineActivityPropertiesAreQueryableOrThrow = ({
  objectNameSingular,
  fieldName,
  recordReadRestrictions,
}: {
  objectNameSingular: string;
  fieldName: string;
  recordReadRestrictions: RecordReadRestrictions | undefined;
}): void => {
  if (objectNameSingular !== 'timelineActivity' || fieldName !== 'properties') {
    return;
  }

  if (
    isDefined(recordReadRestrictions) &&
    (recordReadRestrictions.unreadableObjectMetadataIds.size > 0 ||
      recordReadRestrictions.unreadableFieldMetadataIds.size > 0)
  ) {
    throw new PermissionsException(
      PermissionsExceptionMessage.PERMISSION_DENIED,
      PermissionsExceptionCode.PERMISSION_DENIED,
    );
  }
};
