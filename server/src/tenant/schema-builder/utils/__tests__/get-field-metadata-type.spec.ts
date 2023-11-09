import { FieldMetadataType } from 'src/database/typeorm/metadata/entities/field-metadata.entity';
import { getFieldMetadataType } from 'src/tenant/schema-builder/utils/get-field-metadata-type.util';

describe('getFieldMetadataType', () => {
  it.each([
    ['uuid', FieldMetadataType.UUID],
    ['timestamp', FieldMetadataType.DATE],
  ])(
    'should return correct FieldMetadataType for type %s',
    (type, expectedMetadataType) => {
      expect(getFieldMetadataType(type)).toBe(expectedMetadataType);
    },
  );

  it('should throw an error for an unknown type', () => {
    const unknownType = 'unknownType';
    expect(() => getFieldMetadataType(unknownType)).toThrow(
      `Unknown type ${unknownType}`,
    );
  });
});
