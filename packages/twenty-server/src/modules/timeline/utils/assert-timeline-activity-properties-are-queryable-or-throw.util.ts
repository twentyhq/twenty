import { type ObjectsPermissions } from 'twenty-shared/types';

import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/metadata-modules/permissions/permissions.exception';

// properties holds other objects' field values, so querying it reveals restricted fields
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
