import { PermissionsExceptionMessage } from 'src/engine/metadata-modules/permissions/permissions.exception';
import { validateFieldReadPermissionOrThrow } from 'src/engine/metadata-modules/permissions/utils/validate-field-read-permission-or-throw.util';

describe('validateFieldReadPermissionOrThrow', () => {
  it('should not throw when the field is readable', () => {
    expect(() =>
      validateFieldReadPermissionOrThrow({
        restrictedFields: {},
        fieldMetadataId: 'field-id',
        fieldName: 'secretField',
        entityName: 'person',
      }),
    ).not.toThrow();
  });

  it('should throw when the field is not readable', () => {
    expect(() =>
      validateFieldReadPermissionOrThrow({
        restrictedFields: {
          'field-id': { canRead: false, canUpdate: null },
        },
        fieldMetadataId: 'field-id',
        fieldName: 'secretField',
        entityName: 'person',
      }),
    ).toThrow(
      `${PermissionsExceptionMessage.PERMISSION_DENIED}: no permission to read field "secretField" on "person"`,
    );
  });
});
