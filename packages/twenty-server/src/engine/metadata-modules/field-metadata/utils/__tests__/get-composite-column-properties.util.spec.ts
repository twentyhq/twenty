import { FieldMetadataType } from 'twenty-shared/types';

import { getCompositeColumnPropertiesOrThrow } from 'src/engine/metadata-modules/field-metadata/utils/get-composite-column-properties-or-throw.util';
import { getCompositeColumnProperties } from 'src/engine/metadata-modules/field-metadata/utils/get-composite-column-properties.util';

const getPropertyNames = (fieldType: FieldMetadataType) =>
  getCompositeColumnProperties(fieldType).map(({ name }) => name);

describe('getCompositeColumnProperties', () => {
  it('should add the properties provisioned ahead of the runtime to the declared ones', () => {
    expect(getPropertyNames(FieldMetadataType.RICH_TEXT)).toEqual([
      'blocknote',
      'markdown',
      'tiptap',
      'fileIds',
    ]);
  });

  it('should return only the declared properties of a composite type with nothing provisioned ahead', () => {
    expect(getPropertyNames(FieldMetadataType.FULL_NAME)).toEqual([
      'firstName',
      'lastName',
    ]);
  });

  it('should return no property for a type that is not composite', () => {
    expect(getPropertyNames(FieldMetadataType.TEXT)).toEqual([]);
  });
});

describe('getCompositeColumnPropertiesOrThrow', () => {
  it('should throw for a type that is not composite', () => {
    expect(() =>
      getCompositeColumnPropertiesOrThrow(FieldMetadataType.TEXT),
    ).toThrow('Composite type not found for field metadata type: TEXT');
  });
});
