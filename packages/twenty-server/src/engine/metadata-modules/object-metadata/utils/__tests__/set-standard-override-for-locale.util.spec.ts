import { SOURCE_LOCALE } from 'twenty-shared/translations';

import { setStandardOverrideForLocale } from 'src/engine/metadata-modules/object-metadata/utils/set-standard-override-for-locale.util';

describe('setStandardOverrideForLocale', () => {
  describe('Source locale (English)', () => {
    it('should set labelSingular at top level for source locale', () => {
      const result = setStandardOverrideForLocale({
        overrides: null,
        property: 'labelSingular',
        value: 'Custom Label',
        locale: SOURCE_LOCALE,
      });

      expect(result).toEqual({ labelSingular: 'Custom Label' });
    });

    it('should set description at top level for source locale', () => {
      const result = setStandardOverrideForLocale({
        overrides: { icon: 'IconCustom' },
        property: 'description',
        value: 'Custom Description',
        locale: SOURCE_LOCALE,
      });

      expect(result).toEqual({
        icon: 'IconCustom',
        description: 'Custom Description',
      });
    });

    it('should preserve existing overrides when adding new one', () => {
      const result = setStandardOverrideForLocale({
        overrides: {
          labelSingular: 'Existing Label',
          translations: {
            'fr-FR': { labelSingular: 'French Label' },
          },
        },
        property: 'description',
        value: 'New Description',
        locale: SOURCE_LOCALE,
      });

      expect(result).toEqual({
        labelSingular: 'Existing Label',
        description: 'New Description',
        translations: {
          'fr-FR': { labelSingular: 'French Label' },
        },
      });
    });
  });

  describe('Non-source locale (e.g., French)', () => {
    it('should set labelSingular in translations for non-source locale', () => {
      const result = setStandardOverrideForLocale({
        overrides: null,
        property: 'labelSingular',
        value: 'Libellé personnalisé',
        locale: 'fr-FR',
      });

      expect(result).toEqual({
        translations: {
          'fr-FR': { labelSingular: 'Libellé personnalisé' },
        },
      });
    });

    it('should set description in translations for non-source locale', () => {
      const result = setStandardOverrideForLocale({
        overrides: { icon: 'IconCustom' },
        property: 'description',
        value: 'Description personnalisée',
        locale: 'fr-FR',
      });

      expect(result).toEqual({
        icon: 'IconCustom',
        translations: {
          'fr-FR': { description: 'Description personnalisée' },
        },
      });
    });

    it('should preserve existing translations for other locales', () => {
      const result = setStandardOverrideForLocale({
        overrides: {
          translations: {
            'es-ES': { labelSingular: 'Etiqueta española' },
          },
        },
        property: 'labelSingular',
        value: 'French Label',
        locale: 'fr-FR',
      });

      expect(result).toEqual({
        translations: {
          'es-ES': { labelSingular: 'Etiqueta española' },
          'fr-FR': { labelSingular: 'French Label' },
        },
      });
    });

    it('should preserve existing properties for the same locale', () => {
      const result = setStandardOverrideForLocale({
        overrides: {
          translations: {
            'fr-FR': { labelSingular: 'Libellé existant' },
          },
        },
        property: 'description',
        value: 'Nouvelle description',
        locale: 'fr-FR',
      });

      expect(result).toEqual({
        translations: {
          'fr-FR': {
            labelSingular: 'Libellé existant',
            description: 'Nouvelle description',
          },
        },
      });
    });
  });

  describe('Icon property', () => {
    it('should always set icon at top level regardless of locale', () => {
      const result = setStandardOverrideForLocale({
        overrides: null,
        property: 'icon',
        value: 'IconCustom',
        locale: 'fr-FR',
      });

      expect(result).toEqual({ icon: 'IconCustom' });
    });

    it('should set icon at top level for source locale', () => {
      const result = setStandardOverrideForLocale({
        overrides: null,
        property: 'icon',
        value: 'IconCustom',
        locale: SOURCE_LOCALE,
      });

      expect(result).toEqual({ icon: 'IconCustom' });
    });
  });
});
