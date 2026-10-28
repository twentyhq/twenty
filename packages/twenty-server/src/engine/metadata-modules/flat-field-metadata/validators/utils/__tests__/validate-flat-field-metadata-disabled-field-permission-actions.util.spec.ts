import { FieldMetadataExceptionCode } from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { validateFlatFieldMetadataDisabledFieldPermissionActions } from 'src/engine/metadata-modules/flat-field-metadata/validators/utils/validate-flat-field-metadata-disabled-field-permission-actions.util';

describe('validateFlatFieldMetadataDisabledFieldPermissionActions', () => {
  it('should accept known actions and an unset value', () => {
    expect(
      validateFlatFieldMetadataDisabledFieldPermissionActions({
        disabledFieldPermissionActions: [
          'canReadFieldValue',
          'canUpdateFieldValue',
        ],
      }),
    ).toEqual([]);
    expect(
      validateFlatFieldMetadataDisabledFieldPermissionActions({
        disabledFieldPermissionActions: null,
      }),
    ).toEqual([]);
  });

  it('should reject an unknown action', () => {
    expect(
      validateFlatFieldMetadataDisabledFieldPermissionActions({
        disabledFieldPermissionActions: [
          'canUpdateFieldValue',
          'canDestroyObjectRecords',
        ],
      }),
    ).toEqual([
      expect.objectContaining({
        code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
        value: 'canDestroyObjectRecords',
      }),
    ]);
  });

  it('should reject a value that is not a list', () => {
    expect(
      validateFlatFieldMetadataDisabledFieldPermissionActions({
        disabledFieldPermissionActions: { canUpdateFieldValue: true },
      }),
    ).toHaveLength(1);
  });

  it('should reject a repeated action', () => {
    expect(
      validateFlatFieldMetadataDisabledFieldPermissionActions({
        disabledFieldPermissionActions: [
          'canUpdateFieldValue',
          'canUpdateFieldValue',
        ],
      }),
    ).toEqual([
      expect.objectContaining({
        code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
      }),
    ]);
  });
});
