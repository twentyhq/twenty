import { type CompositeProperty, FieldMetadataType } from 'twenty-shared/types';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { getGroupableSubFieldsForCompositeType } from 'src/engine/metadata-modules/field-metadata/utils/get-groupable-sub-fields-for-composite-type.util';
import { isCompositePropertySupportedInGroupBy } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-property-supported-in-group-by.util';
import { isFlatFieldMetadataSupportedInGroupBy } from 'src/engine/metadata-modules/field-metadata/utils/is-supported-in-group-by.util';

const buildFlatFieldMetadata = (
  type: FieldMetadataType,
  name = 'field',
  isSystem = false,
): FlatFieldMetadata => ({ type, name, isSystem }) as FlatFieldMetadata;

const buildCompositeProperty = (
  type: FieldMetadataType,
  hidden: CompositeProperty['hidden'] = false,
): CompositeProperty => ({
  name: 'subField',
  type,
  hidden,
  isRequired: false,
});

describe('isFlatFieldMetadataSupportedInGroupBy', () => {
  it('returns false for low-level field types', () => {
    expect(
      isFlatFieldMetadataSupportedInGroupBy(
        buildFlatFieldMetadata(FieldMetadataType.TS_VECTOR),
      ),
    ).toBe(false);
    expect(
      isFlatFieldMetadataSupportedInGroupBy(
        buildFlatFieldMetadata(FieldMetadataType.RAW_JSON),
      ),
    ).toBe(false);
    expect(
      isFlatFieldMetadataSupportedInGroupBy(
        buildFlatFieldMetadata(FieldMetadataType.FILES),
      ),
    ).toBe(false);
    expect(
      isFlatFieldMetadataSupportedInGroupBy(
        buildFlatFieldMetadata(FieldMetadataType.POSITION),
      ),
    ).toBe(false);
  });

  it('returns true for regular field types', () => {
    expect(
      isFlatFieldMetadataSupportedInGroupBy(
        buildFlatFieldMetadata(FieldMetadataType.TEXT),
      ),
    ).toBe(true);
  });

  it('returns false for internal/system field names', () => {
    expect(
      isFlatFieldMetadataSupportedInGroupBy(
        buildFlatFieldMetadata(FieldMetadataType.TEXT, 'id'),
      ),
    ).toBe(false);
    expect(
      isFlatFieldMetadataSupportedInGroupBy(
        buildFlatFieldMetadata(FieldMetadataType.DATE_TIME, 'deletedAt'),
      ),
    ).toBe(false);
    expect(
      isFlatFieldMetadataSupportedInGroupBy(
        buildFlatFieldMetadata(FieldMetadataType.TS_VECTOR, 'searchVector'),
      ),
    ).toBe(false);
    expect(
      isFlatFieldMetadataSupportedInGroupBy(
        buildFlatFieldMetadata(FieldMetadataType.ACTOR, 'createdBy'),
      ),
    ).toBe(false);
  });

  it('returns true for createdAt and updatedAt date fields even if system', () => {
    expect(
      isFlatFieldMetadataSupportedInGroupBy(
        buildFlatFieldMetadata(FieldMetadataType.DATE_TIME, 'createdAt', true),
      ),
    ).toBe(true);
    expect(
      isFlatFieldMetadataSupportedInGroupBy(
        buildFlatFieldMetadata(FieldMetadataType.DATE_TIME, 'updatedAt', true),
      ),
    ).toBe(true);
  });

  it('returns false for other system fields', () => {
    expect(
      isFlatFieldMetadataSupportedInGroupBy(
        buildFlatFieldMetadata(
          FieldMetadataType.TEXT,
          'customSystemField',
          true,
        ),
      ),
    ).toBe(false);
  });
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
