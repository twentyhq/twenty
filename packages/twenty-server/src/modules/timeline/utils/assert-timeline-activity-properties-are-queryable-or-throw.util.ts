import { type ObjectsPermissions } from 'twenty-shared/types';

import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/metadata-modules/permissions/permissions.exception';

// properties holds field values of other objects, so filtering or sorting on it
// would reveal what the response redacts
export const assertTimelineActivityPropertiesAreQueryableOrThrow = ({
  objectNameSingular,
  fieldName,
  objectsPermissions,
}: {
  objectNameSingular: string;
  fieldName: string;
  objectsPermissions: ObjectsPermissions | undefined;
}): void => {
  if (objectNameSingular !== 'timelineActivity' || fieldName !== 'properties') {
    return;
  }

  const hasReadDeniedObjectOrField = Object.values(
    objectsPermissions ?? {},
  ).some(
    (objectPermissions) =>
      !objectPermissions.canReadObjectRecords ||
      Object.values(objectPermissions.restrictedFields).some(
        (fieldPermissions) => fieldPermissions.canRead === false,
      ),
  );

  if (hasReadDeniedObjectOrField) {
    throw new PermissionsException(
      PermissionsExceptionMessage.PERMISSION_DENIED,
      PermissionsExceptionCode.PERMISSION_DENIED,
    );
  }
};
