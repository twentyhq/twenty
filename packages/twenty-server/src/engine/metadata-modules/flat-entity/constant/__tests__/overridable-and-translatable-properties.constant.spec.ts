import { FIELD_METADATA_STANDARD_OVERRIDES_PROPERTIES } from 'src/engine/metadata-modules/field-metadata/constants/field-metadata-standard-overrides-properties.constant';
import { ALL_OVERRIDABLE_PROPERTIES_BY_METADATA_NAME } from 'src/engine/metadata-modules/flat-entity/constant/all-overridable-properties-by-metadata-name.constant';
import { ALL_TRANSLATABLE_PROPERTIES_BY_METADATA_NAME } from 'src/engine/metadata-modules/flat-entity/constant/all-translatable-properties-by-metadata-name.constant';
import { OBJECT_METADATA_STANDARD_OVERRIDES_PROPERTIES } from 'src/engine/metadata-modules/object-metadata/constants/object-metadata-standard-overrides-properties.constant';

const asSortedSet = (values: readonly string[]): string[] => [...values].sort();

describe('registry-derived overridable properties', () => {
  it('derives the object overridable set from the legacy hardcoded list', () => {
    expect(
      asSortedSet(ALL_OVERRIDABLE_PROPERTIES_BY_METADATA_NAME.objectMetadata),
    ).toEqual(asSortedSet(OBJECT_METADATA_STANDARD_OVERRIDES_PROPERTIES));
  });

  it('derives the field overridable set from the legacy hardcoded list', () => {
    expect(
      asSortedSet(ALL_OVERRIDABLE_PROPERTIES_BY_METADATA_NAME.fieldMetadata),
    ).toEqual(asSortedSet(FIELD_METADATA_STANDARD_OVERRIDES_PROPERTIES));
  });
});

describe('registry-derived translatable properties', () => {
  it('marks the object label/description properties as translatable', () => {
    expect(
      asSortedSet(ALL_TRANSLATABLE_PROPERTIES_BY_METADATA_NAME.objectMetadata),
    ).toEqual(asSortedSet(['labelSingular', 'labelPlural', 'description']));
  });

  it('marks the field label/description properties as translatable', () => {
    expect(
      asSortedSet(ALL_TRANSLATABLE_PROPERTIES_BY_METADATA_NAME.fieldMetadata),
    ).toEqual(asSortedSet(['label', 'description']));
  });

  it('keeps icon and color non-translatable', () => {
    expect(
      ALL_TRANSLATABLE_PROPERTIES_BY_METADATA_NAME.objectMetadata,
    ).not.toContain('icon');
    expect(
      ALL_TRANSLATABLE_PROPERTIES_BY_METADATA_NAME.objectMetadata,
    ).not.toContain('color');
    expect(
      ALL_TRANSLATABLE_PROPERTIES_BY_METADATA_NAME.fieldMetadata,
    ).not.toContain('icon');
  });
});
