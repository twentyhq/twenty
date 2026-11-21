import { FieldMetadataType } from 'twenty-shared/types';

import { getCompositeColumnPropertiesOrThrow } from 'src/engine/metadata-modules/field-metadata/utils/get-composite-column-properties-or-throw.util';

describe('getCompositeColumnPropertiesOrThrow', () => {
  it('should return the column properties of a composite type', () => {
    expect(
      getCompositeColumnPropertiesOrThrow(FieldMetadataType.RICH_TEXT).map(
        ({ name }) => name,
      ),
    ).toEqual(['blocknote', 'markdown', 'tiptap', 'fileIds']);
  });

  it('should throw for a type that is not composite', () => {
    expect(() =>
      getCompositeColumnPropertiesOrThrow(FieldMetadataType.TEXT),
    ).toThrow('Composite type not found for field metadata type: TEXT');
  });
});
