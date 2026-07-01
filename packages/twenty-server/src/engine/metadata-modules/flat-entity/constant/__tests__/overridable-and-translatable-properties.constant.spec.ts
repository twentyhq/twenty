import { ALL_OVERRIDABLE_PROPERTIES_BY_METADATA_NAME } from 'src/engine/metadata-modules/flat-entity/constant/all-overridable-properties-by-metadata-name.constant';
import { ALL_TRANSLATABLE_PROPERTIES_BY_METADATA_NAME } from 'src/engine/metadata-modules/flat-entity/constant/all-translatable-properties-by-metadata-name.constant';

const asSortedSet = (values: readonly string[]): string[] => [...values].sort();

describe('registry-derived overridable properties', () => {
  it('exposes the object presentation properties as overridable', () => {
    expect(
      asSortedSet(ALL_OVERRIDABLE_PROPERTIES_BY_METADATA_NAME.objectMetadata),
    ).toEqual(
      asSortedSet([
        'color',
        'labelSingular',
        'labelPlural',
        'description',
        'icon',
      ]),
    );
  });

  it('exposes the field presentation properties as overridable', () => {
    expect(
      asSortedSet(ALL_OVERRIDABLE_PROPERTIES_BY_METADATA_NAME.fieldMetadata),
    ).toEqual(asSortedSet(['label', 'description', 'icon']));
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
