import { mergeStandardOverrideTranslations } from 'src/engine/metadata-modules/utils/merge-standard-override-translations.util';

const OBJECT_KEYS = ['labelSingular', 'labelPlural', 'description'] as const;

describe('mergeStandardOverrideTranslations', () => {
  it('adds a per-locale override when there is none', () => {
    expect(
      mergeStandardOverrideTranslations({
        existingTranslations: undefined,
        translationsInput: { 'fr-FR': { labelSingular: 'Entreprise' } },
        allowedLabelKeys: OBJECT_KEYS,
      }),
    ).toEqual({ 'fr-FR': { labelSingular: 'Entreprise' } });
  });

  it('merges with existing translations, preserving other locales and keys', () => {
    expect(
      mergeStandardOverrideTranslations({
        existingTranslations: {
          'fr-FR': { labelPlural: 'Entreprises' },
          'de-DE': { labelSingular: 'Firma' },
        },
        translationsInput: { 'fr-FR': { labelSingular: 'Entreprise' } },
        allowedLabelKeys: OBJECT_KEYS,
      }),
    ).toEqual({
      'fr-FR': { labelPlural: 'Entreprises', labelSingular: 'Entreprise' },
      'de-DE': { labelSingular: 'Firma' },
    });
  });

  it('removes a key when the value is empty and drops the locale when emptied', () => {
    expect(
      mergeStandardOverrideTranslations({
        existingTranslations: { 'fr-FR': { labelSingular: 'Entreprise' } },
        translationsInput: { 'fr-FR': { labelSingular: '' } },
        allowedLabelKeys: OBJECT_KEYS,
      }),
    ).toBeUndefined();
  });

  it('ignores label keys that are not allowed', () => {
    expect(
      mergeStandardOverrideTranslations({
        existingTranslations: undefined,
        translationsInput: {
          'fr-FR': { icon: 'IconX', labelSingular: 'Entreprise' },
        },
        allowedLabelKeys: ['labelSingular'],
      }),
    ).toEqual({ 'fr-FR': { labelSingular: 'Entreprise' } });
  });
});
