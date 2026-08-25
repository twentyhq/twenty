import { findInvalidTranslationOverrideProperties } from 'src/engine/metadata-modules/utils/find-invalid-translation-override-properties.util';

describe('findInvalidTranslationOverrideProperties', () => {
  it('returns nothing when every property is translatable', () => {
    expect(
      findInvalidTranslationOverrideProperties(
        [
          { locale: 'fr-FR', property: 'labelSingular', value: 'Entreprise' },
          { locale: 'fr-FR', property: 'labelPlural', value: 'Entreprises' },
          {
            locale: 'de-DE',
            property: 'description',
            value: 'Ein Unternehmen',
          },
        ],
        'objectMetadata',
      ),
    ).toEqual([]);
  });

  it('returns nothing when there is no entry at all', () => {
    expect(
      findInvalidTranslationOverrideProperties([], 'objectMetadata'),
    ).toEqual([]);
  });

  it('returns the properties outside the allowlist', () => {
    expect(
      findInvalidTranslationOverrideProperties(
        [
          { locale: 'fr-FR', property: 'labelSingular', value: 'Entreprise' },
          { locale: 'fr-FR', property: 'icon', value: 'IconBuilding' },
          { locale: 'fr-FR', property: 'nameSingular', value: 'entreprise' },
        ],
        'objectMetadata',
      ),
    ).toEqual(['icon', 'nameSingular']);
  });

  it('reports a property invalid for the metadata name even when another one allows it', () => {
    expect(
      findInvalidTranslationOverrideProperties(
        [{ locale: 'fr-FR', property: 'labelSingular', value: 'Entreprise' }],
        'fieldMetadata',
      ),
    ).toEqual(['labelSingular']);
  });

  it('reports an invalid property once however many locales carry it', () => {
    expect(
      findInvalidTranslationOverrideProperties(
        [
          { locale: 'fr-FR', property: 'icon', value: 'IconBuilding' },
          { locale: 'de-DE', property: 'icon', value: 'IconBuilding' },
          { locale: 'es-ES', property: 'icon', value: 'IconBuilding' },
        ],
        'objectMetadata',
      ),
    ).toEqual(['icon']);
  });

  it('rejects every property for a metadata name that translates nothing', () => {
    expect(
      findInvalidTranslationOverrideProperties(
        [
          { locale: 'fr-FR', property: 'label', value: 'Entreprise' },
          { locale: 'fr-FR', property: 'name', value: 'entreprise' },
        ],
        // Absent from the registry, so the `?? []` fallback makes every
        // property invalid rather than silently accepting the write.
        'agent',
      ),
    ).toEqual(['label', 'name']);
  });
});
