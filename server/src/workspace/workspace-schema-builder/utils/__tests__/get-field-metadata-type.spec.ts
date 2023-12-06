import { FieldMetadataType } from 'src/metadata/field-metadata/field-metadata.entity';
import { getFieldMetadataType } from 'src/workspace/workspace-schema-builder/utils/get-field-metadata-type.util';

describe('getFieldMetadataType', () => {
  it.each([
    ['uuid', FieldMetadataType.UUID],
    ['timestamp', FieldMetadataType.DATE_TIME],
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
