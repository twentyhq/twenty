import { type CompositeProperty, FieldMetadataType } from 'twenty-shared/types';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import {
  isCompositePropertySupportedInGroupBy,
  isFlatFieldMetadataSupportedInGroupBy,
} from 'src/engine/metadata-modules/field-metadata/utils/is-supported-in-group-by.util';

const buildFlatFieldMetadata = (
  type: FieldMetadataType,
  name = 'field',
): FlatFieldMetadata => ({ type, name }) as FlatFieldMetadata;

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
