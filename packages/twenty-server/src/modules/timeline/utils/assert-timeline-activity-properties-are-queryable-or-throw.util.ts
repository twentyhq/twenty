import { canReachSomeRecords, isDefined } from 'twenty-shared/utils';

import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/permissions/permissions.exception';
import { type RoleRecordsPermissions } from 'src/engine/permissions/types/role-records-permissions.type';

// properties holds other objects' field values, so querying it reveals restricted fields
export const assertTimelineActivityPropertiesAreQueryableOrThrow = ({
  objectNameSingular,
  fieldName,
  recordsPermissions,
}: {
  objectNameSingular: string;
  fieldName: string;
  recordsPermissions: Pick<RoleRecordsPermissions, 'objects'> | undefined;
}): void => {
  if (objectNameSingular !== 'timelineActivity' || fieldName !== 'properties') {
    return;
  }

  const hasReadDeniedObjectOrField = Object.values(
    recordsPermissions?.objects ?? {},
  ).some(
    (objectRecordsPermissions) =>
      isDefined(objectRecordsPermissions) &&
      (!canReachSomeRecords({
        objectRecordsPermissions,
        operationType: 'select',
      }) ||
        Object.values(objectRecordsPermissions.restrictedFields).some(
          (fieldPermissions) => fieldPermissions.canRead === false,
        )),
  );

  if (hasReadDeniedObjectOrField) {
    throw new PermissionsException(
      PermissionsExceptionMessage.PERMISSION_DENIED,
      PermissionsExceptionCode.PERMISSION_DENIED,
    );
  }
};
