import { validateFlatObjectMetadataDisabledRecordOperations } from 'src/engine/metadata-modules/flat-object-metadata/validators/utils/validate-flat-object-metadata-disabled-record-operations.util';
import { ObjectMetadataExceptionCode } from 'src/engine/metadata-modules/object-metadata/object-metadata.exception';

describe('validateFlatObjectMetadataDisabledRecordOperations', () => {
  it('should accept known operations and an unset value', () => {
    expect(
      validateFlatObjectMetadataDisabledRecordOperations({
        disabledRecordOperations: ['create', 'destroy'],
      }),
    ).toEqual([]);
    expect(
      validateFlatObjectMetadataDisabledRecordOperations({
        disabledRecordOperations: null,
      }),
    ).toEqual([]);
  });

  it('should reject an unknown operation', () => {
    expect(
      validateFlatObjectMetadataDisabledRecordOperations({
        disabledRecordOperations: ['destroy', 'share'],
      }),
    ).toEqual([
      expect.objectContaining({
        code: ObjectMetadataExceptionCode.INVALID_OBJECT_INPUT,
        value: 'share',
      }),
    ]);
  });

  it('should reject a value that is not a list', () => {
    expect(
      validateFlatObjectMetadataDisabledRecordOperations({
        disabledRecordOperations: { destroy: true },
      }),
    ).toHaveLength(1);
  });

  it('should reject a repeated operation', () => {
    expect(
      validateFlatObjectMetadataDisabledRecordOperations({
        disabledRecordOperations: ['destroy', 'destroy'],
      }),
    ).toEqual([
      expect.objectContaining({
        code: ObjectMetadataExceptionCode.INVALID_OBJECT_INPUT,
      }),
    ]);
  });
});
