import { FieldMetadataType } from 'twenty-shared/types';

import { COMPOSITE_PROPERTIES_PROVISIONED_AHEAD_OF_RUNTIME } from 'src/engine/metadata-modules/field-metadata/constants/composite-properties-provisioned-ahead-of-runtime.constant';
import { getCompositeColumnProperties } from 'src/engine/metadata-modules/field-metadata/utils/get-composite-column-properties.util';

const getPropertyNames = (fieldType: FieldMetadataType) =>
  getCompositeColumnProperties(fieldType).map(({ name }) => name);

describe('getCompositeColumnProperties', () => {
  afterEach(() => {
    delete COMPOSITE_PROPERTIES_PROVISIONED_AHEAD_OF_RUNTIME[
      FieldMetadataType.FULL_NAME
    ];
  });

  it('should add the properties provisioned ahead of the runtime to the declared ones', () => {
    COMPOSITE_PROPERTIES_PROVISIONED_AHEAD_OF_RUNTIME[
      FieldMetadataType.FULL_NAME
    ] = [
      {
        name: 'nickname',
        type: FieldMetadataType.TEXT,
        hidden: true,
        isRequired: false,
      },
    ];

    expect(getPropertyNames(FieldMetadataType.FULL_NAME)).toEqual([
      'firstName',
      'lastName',
      'nickname',
    ]);
  });

  it('should return only the declared properties of a composite type with nothing provisioned ahead', () => {
    expect(getPropertyNames(FieldMetadataType.RICH_TEXT)).toEqual([
      'blocknote',
      'markdown',
      'tiptap',
      'fileIds',
    ]);
  });

  it('should return no property for a type that is not composite', () => {
    expect(getPropertyNames(FieldMetadataType.TEXT)).toEqual([]);
  });
});
