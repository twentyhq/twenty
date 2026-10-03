import { FieldMetadataType } from 'twenty-shared/types';

import { FieldMetadataExceptionCode } from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { FlatFieldMetadataTypeValidatorService } from 'src/engine/metadata-modules/flat-field-metadata/services/flat-field-metadata-type-validator.service';
import { type FlatFieldMetadataTypeValidationArgs } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-type-validator.type';

const validateFieldType = (type: string) =>
  new FlatFieldMetadataTypeValidatorService().validateFlatFieldMetadataTypeSpecificities(
    {
      flatEntityToValidate: { type, name: 'testField', label: 'Test field' },
    } as unknown as FlatFieldMetadataTypeValidationArgs<FieldMetadataType>,
  );

describe('FlatFieldMetadataTypeValidatorService', () => {
  it('should run the validator of a known type', () => {
    expect(validateFieldType(FieldMetadataType.TEXT)).toEqual([]);
  });

  it.each([
    'constructor',
    'toString',
    '__proto__',
    'hasOwnProperty',
    'TEXTT',
    'text',
  ])('should return a single unsupported type error for %s', (type) => {
    expect(validateFieldType(type)).toEqual([
      expect.objectContaining({
        code: FieldMetadataExceptionCode.UNCOVERED_FIELD_METADATA_TYPE_VALIDATION,
        message: `Unsupported field metadata type ${type}`,
        value: type,
      }),
    ]);
  });
});
