import { validateFlatObjectMetadataDisabledObjectPermissionActions } from 'src/engine/metadata-modules/flat-object-metadata/validators/utils/validate-flat-object-metadata-disabled-object-permission-actions.util';
import { ObjectMetadataExceptionCode } from 'src/engine/metadata-modules/object-metadata/object-metadata.exception';

describe('validateFlatObjectMetadataDisabledObjectPermissionActions', () => {
  it('should accept known actions and an unset value', () => {
    expect(
      validateFlatObjectMetadataDisabledObjectPermissionActions({
        disabledObjectPermissionActions: [
          'canUpdateObjectRecords',
          'canDestroyObjectRecords',
        ],
      }),
    ).toEqual([]);
    expect(
      validateFlatObjectMetadataDisabledObjectPermissionActions({
        disabledObjectPermissionActions: null,
      }),
    ).toEqual([]);
  });

  it('should reject an unknown action', () => {
    expect(
      validateFlatObjectMetadataDisabledObjectPermissionActions({
        disabledObjectPermissionActions: [
          'canDestroyObjectRecords',
          'canShareObjectRecords',
        ],
      }),
    ).toEqual([
      expect.objectContaining({
        code: ObjectMetadataExceptionCode.INVALID_OBJECT_INPUT,
        value: 'canShareObjectRecords',
      }),
    ]);
  });

  it('should reject a value that is not a list', () => {
    expect(
      validateFlatObjectMetadataDisabledObjectPermissionActions({
        disabledObjectPermissionActions: { canDestroyObjectRecords: true },
      }),
    ).toHaveLength(1);
  });

  it('should reject a repeated action', () => {
    expect(
      validateFlatObjectMetadataDisabledObjectPermissionActions({
        disabledObjectPermissionActions: [
          'canDestroyObjectRecords',
          'canDestroyObjectRecords',
        ],
      }),
    ).toEqual([
      expect.objectContaining({
        code: ObjectMetadataExceptionCode.INVALID_OBJECT_INPUT,
      }),
    ]);
  });
});
