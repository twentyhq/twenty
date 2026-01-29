import { SOURCE_LOCALE } from 'twenty-shared/translations';

import { removeStandardOverride } from 'src/engine/metadata-modules/object-metadata/utils/remove-standard-override.util';

describe('removeStandardOverride', () => {
  it('should return null when overrides is null', () => {
    const result = removeStandardOverride({
      overrides: null,
      property: 'labelSingular',
      locale: SOURCE_LOCALE,
    });

    expect(result).toBeNull();
  });

  describe('Source locale (English)', () => {
    it('should return unchanged overrides when property does not exist', () => {
      const result = removeStandardOverride({
        overrides: { icon: 'IconCustom' },
        property: 'labelSingular',
        locale: SOURCE_LOCALE,
      });

      expect(result).toEqual({ icon: 'IconCustom' });
    });

    it('should remove the specified property from top level', () => {
      const result = removeStandardOverride({
        overrides: {
          labelSingular: 'Custom Label',
          description: 'Custom Description',
        },
        property: 'labelSingular',
        locale: SOURCE_LOCALE,
      });

      expect(result).toEqual({ description: 'Custom Description' });
    });

    it('should preserve translations when removing top-level property', () => {
      const result = removeStandardOverride({
        overrides: {
          labelSingular: 'Custom Label',
          translations: {
            'fr-FR': { labelSingular: 'French Label' },
          },
        },
        property: 'labelSingular',
        locale: SOURCE_LOCALE,
      });

      expect(result).toEqual({
        translations: {
          'fr-FR': { labelSingular: 'French Label' },
        },
      });
    });
  });

  describe('Non-source locale (French)', () => {
    it('should remove property from translations[locale]', () => {
      const result = removeStandardOverride({
        overrides: {
          translations: {
            'fr-FR': {
              labelSingular: 'French Label',
              description: 'French Description',
            },
          },
        },
        property: 'labelSingular',
        locale: 'fr-FR',
      });

      expect(result).toEqual({
        translations: {
          'fr-FR': { description: 'French Description' },
        },
      });
    });

    it('should preserve top-level overrides when removing from translations', () => {
      const result = removeStandardOverride({
        overrides: {
          labelSingular: 'English Override',
          translations: {
            'fr-FR': { labelSingular: 'French Label' },
          },
        },
        property: 'labelSingular',
        locale: 'fr-FR',
      });

      expect(result).toEqual({
        labelSingular: 'English Override',
        translations: {
          'fr-FR': {},
        },
      });
    });

    it('should preserve other locales when removing from one locale', () => {
      const result = removeStandardOverride({
        overrides: {
          translations: {
            'fr-FR': { labelSingular: 'French Label' },
            'es-ES': { labelSingular: 'Spanish Label' },
          },
        },
        property: 'labelSingular',
        locale: 'fr-FR',
      });

      expect(result).toEqual({
        translations: {
          'fr-FR': {},
          'es-ES': { labelSingular: 'Spanish Label' },
        },
      });
    });

    it('should return unchanged when translation does not exist', () => {
      const overrides = {
        translations: {
          'es-ES': { labelSingular: 'Spanish Label' },
        },
      };

      const result = removeStandardOverride({
        overrides,
        property: 'labelSingular',
        locale: 'fr-FR',
      });

      expect(result).toEqual(overrides);
    });
  });

  describe('Icon property', () => {
    it('should always remove icon from top level regardless of locale', () => {
      const result = removeStandardOverride({
        overrides: {
          icon: 'IconCustom',
          labelSingular: 'Custom Label',
        },
        property: 'icon',
        locale: 'fr-FR',
      });

      expect(result).toEqual({ labelSingular: 'Custom Label' });
    });
  });
});
