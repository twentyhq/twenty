import { type ObjectsPermissions } from 'twenty-shared/types';
import { isPlainObject } from 'twenty-shared/utils';

import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/metadata-modules/permissions/permissions.exception';

const LOGICAL_FILTER_KEYS = new Set(['and', 'or', 'not']);

const QUERY_ARG_KEYS = ['filter', 'orderBy', 'orderByForRecords'];

const referencesProperties = (value: unknown): boolean => {
  if (Array.isArray(value)) {
    return value.some(referencesProperties);
  }

  if (!isPlainObject(value)) {
    return false;
  }

  return Object.entries(value).some(
    ([key, nestedValue]) =>
      key === 'properties' ||
      (LOGICAL_FILTER_KEYS.has(key) && referencesProperties(nestedValue)),
  );
};

export const assertTimelineActivityPropertiesAreNotQueriedOrThrow = ({
  queryArgs,
  objectsPermissions,
}: {
  queryArgs: object;
  objectsPermissions: ObjectsPermissions;
}): void => {
  const hasReadDeniedObjectOrField = Object.values(objectsPermissions).some(
    (objectPermissions) =>
      !objectPermissions.canReadObjectRecords ||
      Object.values(objectPermissions.restrictedFields).some(
        (fieldPermissions) => fieldPermissions.canRead === false,
      ),
  );

  const queriesProperties = Object.entries(queryArgs).some(
    ([key, value]) =>
      QUERY_ARG_KEYS.includes(key) && referencesProperties(value),
  );

  if (hasReadDeniedObjectOrField && queriesProperties) {
    throw new PermissionsException(
      PermissionsExceptionMessage.PERMISSION_DENIED,
      PermissionsExceptionCode.PERMISSION_DENIED,
    );
  }
};
