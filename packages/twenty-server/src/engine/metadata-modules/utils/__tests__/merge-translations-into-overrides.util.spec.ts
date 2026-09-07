import { mergeTranslationsIntoOverrides } from 'src/engine/metadata-modules/utils/merge-translations-into-overrides.util';

describe('mergeTranslationsIntoOverrides', () => {
  it('returns existing overrides untouched when there is nothing to merge', () => {
    const existingOverrides = { labelSingular: 'Client' };

    expect(
      mergeTranslationsIntoOverrides({
        existingOverrides,
        translationEntries: [],
      }),
    ).toBe(existingOverrides);
  });

  it('adds a translation without touching other overrides', () => {
    expect(
      mergeTranslationsIntoOverrides({
        existingOverrides: { labelSingular: 'Client' },
        translationEntries: [
          { locale: 'fr-FR', property: 'labelSingular', value: 'Entreprise' },
        ],
      }),
    ).toEqual({
      labelSingular: 'Client',
      translations: { 'fr-FR': { labelSingular: 'Entreprise' } },
    });
  });

  it('merges into an existing locale group without dropping siblings', () => {
    expect(
      mergeTranslationsIntoOverrides({
        existingOverrides: {
          translations: {
            'fr-FR': { labelSingular: 'Entreprise' },
            'de-DE': { labelSingular: 'Unternehmen' },
          },
        },
        translationEntries: [
          { locale: 'fr-FR', property: 'labelPlural', value: 'Entreprises' },
        ],
      }),
    ).toEqual({
      translations: {
        'fr-FR': { labelSingular: 'Entreprise', labelPlural: 'Entreprises' },
        'de-DE': { labelSingular: 'Unternehmen' },
      },
    });
  });

  it('deletes an entry on empty value and prunes the emptied locale group', () => {
    expect(
      mergeTranslationsIntoOverrides({
        existingOverrides: {
          labelSingular: 'Client',
          translations: {
            'fr-FR': { labelSingular: 'Entreprise' },
            'de-DE': { labelSingular: 'Unternehmen' },
          },
        },
        translationEntries: [
          { locale: 'fr-FR', property: 'labelSingular', value: null },
        ],
      }),
    ).toEqual({
      labelSingular: 'Client',
      translations: { 'de-DE': { labelSingular: 'Unternehmen' } },
    });
  });

  it('collapses to null when the last translation of an otherwise empty blob is removed', () => {
    expect(
      mergeTranslationsIntoOverrides({
        existingOverrides: {
          translations: { 'fr-FR': { labelSingular: 'Entreprise' } },
        },
        translationEntries: [
          { locale: 'fr-FR', property: 'labelSingular', value: '' },
        ],
      }),
    ).toBeNull();
  });

  it('removing an absent entry is a no-op that still returns a copy', () => {
    expect(
      mergeTranslationsIntoOverrides({
        existingOverrides: null,
        translationEntries: [
          { locale: 'fr-FR', property: 'labelSingular', value: null },
        ],
      }),
    ).toBeNull();
  });

  it('does not mutate the existing overrides', () => {
    const existingOverrides = {
      translations: { 'fr-FR': { labelSingular: 'Entreprise' } },
    };

    mergeTranslationsIntoOverrides({
      existingOverrides,
      translationEntries: [
        { locale: 'fr-FR', property: 'labelSingular', value: 'Société' },
        { locale: 'it-IT', property: 'labelSingular', value: 'Azienda' },
      ],
    });

    expect(existingOverrides).toEqual({
      translations: { 'fr-FR': { labelSingular: 'Entreprise' } },
    });
  });
});
