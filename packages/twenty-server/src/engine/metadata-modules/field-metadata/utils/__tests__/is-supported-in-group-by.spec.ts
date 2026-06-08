import { type CompositeProperty, FieldMetadataType } from 'twenty-shared/types';

import { getGroupableSubFieldsForCompositeType } from 'src/engine/metadata-modules/field-metadata/utils/get-groupable-sub-fields-for-composite-type.util';
import { isCompositePropertySupportedInGroupBy } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-property-supported-in-group-by.util';

const buildCompositeProperty = (
  type: FieldMetadataType,
  hidden: CompositeProperty['hidden'] = false,
): CompositeProperty => ({
  name: 'subField',
  type,
  hidden,
  isRequired: false,
});

describe('isCompositePropertySupportedInGroupBy', () => {
  it('returns false for hidden or raw_json composite properties', () => {
    expect(
      isCompositePropertySupportedInGroupBy(
        buildCompositeProperty(FieldMetadataType.TEXT, true),
      ),
    ).toBe(false);
    expect(
      isCompositePropertySupportedInGroupBy(
        buildCompositeProperty(FieldMetadataType.RAW_JSON),
      ),
    ).toBe(false);
  });

  it('returns true for visible non-raw_json composite properties', () => {
    expect(
      isCompositePropertySupportedInGroupBy(
        buildCompositeProperty(FieldMetadataType.TEXT),
      ),
    ).toBe(true);
  });
});

describe('getGroupableSubFieldsForCompositeType', () => {
  it('returns null for non-composite field types', () => {
    expect(getGroupableSubFieldsForCompositeType(FieldMetadataType.TEXT)).toBe(
      null,
    );
  });

  it('returns supported subfields for composite field types', () => {
    expect(
      getGroupableSubFieldsForCompositeType(FieldMetadataType.CURRENCY),
    ).toEqual(expect.arrayContaining(['amountMicros', 'currencyCode']));
  });
});
