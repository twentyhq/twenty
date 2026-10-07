import { FieldMetadataType } from 'twenty-shared/types';

import { getGroupableSubFieldsForCompositeType } from 'src/engine/metadata-modules/field-metadata/utils/get-groupable-sub-fields-for-composite-type.util';

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
