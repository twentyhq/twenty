import { type CompositeProperty, FieldMetadataType } from '@/types';
import { isCompositePropertySupportedInGroupBy } from '@/utils/fieldMetadata/isCompositePropertySupportedInGroupBy';

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
