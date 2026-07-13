import { type RestrictedFieldsPermissions } from 'twenty-shared/types';

import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/metadata-modules/permissions/permissions.exception';

export const buildFieldPermissionDeniedMessage = ({
  action,
  fieldName,
  entityName,
}: {
  action: 'read' | 'write';
  fieldName: string;
  entityName: string;
}): string =>
  `${PermissionsExceptionMessage.PERMISSION_DENIED}: no permission to ${action} field "${fieldName}" on "${entityName}"`;

export const validateFieldReadPermissionOrThrow = ({
  restrictedFields,
  fieldMetadataId,
  fieldName,
  entityName,
}: {
  restrictedFields: RestrictedFieldsPermissions;
  fieldMetadataId: string;
  fieldName: string;
  entityName: string;
}): void => {
  if (restrictedFields[fieldMetadataId]?.canRead !== false) {
    return;
  }

  throw new PermissionsException(
    buildFieldPermissionDeniedMessage({
      action: 'read',
      fieldName,
      entityName,
    }),
    PermissionsExceptionCode.PERMISSION_DENIED,
  );
};
