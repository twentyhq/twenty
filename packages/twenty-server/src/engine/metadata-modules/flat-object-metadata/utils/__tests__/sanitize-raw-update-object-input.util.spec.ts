import { APP_LOCALES, SOURCE_LOCALE } from 'twenty-shared/translations';

import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { sanitizeRawUpdateObjectInput } from 'src/engine/metadata-modules/flat-object-metadata/utils/sanitize-raw-update-object-input';
import { TWENTY_STANDARD_APPLICATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-standard-applications';

const STANDARD_OBJECT_BASE = getFlatObjectMetadataMock({
  universalIdentifier: '20202020-b374-4779-a561-80086cb2e17f',
  applicationUniversalIdentifier:
    TWENTY_STANDARD_APPLICATION.universalIdentifier,
  labelSingular: 'Company',
  labelPlural: 'Companies',
  description: 'A company',
  icon: 'IconBuildingSkyscraper',
  standardOverrides: null,
});

const FR = APP_LOCALES['fr-FR'];
const DE = APP_LOCALES['de-DE'];

const callSanitize = (
  update: Record<string, unknown>,
  locale?: keyof typeof APP_LOCALES,
  existingOverrides = STANDARD_OBJECT_BASE.standardOverrides,
) =>
  sanitizeRawUpdateObjectInput({
    rawUpdateObjectInput: { update } as never,
    existingFlatObjectMetadata: {
      ...STANDARD_OBJECT_BASE,
      standardOverrides: existingOverrides,
    },
    locale,
  });

describe('sanitizeRawUpdateObjectInput', () => {
  describe('source locale', () => {
    it('should store label override at root level when value differs from base', () => {
      const result = callSanitize({ labelSingular: 'Corp' }, SOURCE_LOCALE);

      expect(result.standardOverrides).toEqual({ labelSingular: 'Corp' });
    });

    it('should remove label override when value equals base value', () => {
      const result = callSanitize({ labelSingular: 'Company' }, SOURCE_LOCALE, {
        labelSingular: 'Corp',
      });

      expect(result.standardOverrides).toBeNull();
    });

    it('should set standardOverrides to null when no locale is provided and value equals base', () => {
      const result = callSanitize({ labelSingular: 'Company' }, undefined, {
        labelSingular: 'Corp',
      });

      expect(result.standardOverrides).toBeNull();
    });
  });

  describe('icon', () => {
    it('should always store icon at root level regardless of locale', () => {
      const result = callSanitize({ icon: 'IconStar' }, FR);

      expect(result.standardOverrides).toMatchObject({ icon: 'IconStar' });
      expect(result.standardOverrides).not.toHaveProperty('translations');
    });
  });

  describe('non-source locale', () => {
    it('should store label override under translations[locale] when value differs from base', () => {
      const result = callSanitize({ labelSingular: 'Société' }, FR);

      expect(result.standardOverrides).toEqual({
        translations: { [FR]: { labelSingular: 'Société' } },
      });
    });

    it('should remove translation override when value equals base value', () => {
      const result = callSanitize({ labelSingular: 'Company' }, FR, {
        translations: { [FR]: { labelSingular: 'Société' } },
      });

      expect(result.standardOverrides).toBeNull();
    });

    it('should only remove the matching key and keep other translation keys', () => {
      const result = callSanitize({ labelSingular: 'Company' }, FR, {
        translations: {
          [FR]: { labelSingular: 'Société', labelPlural: 'Sociétés' },
        },
      });

      expect(result.standardOverrides).toEqual({
        translations: { [FR]: { labelPlural: 'Sociétés' } },
      });
    });

    it('should remove the locale entirely when all its keys are reset to base values', () => {
      const result = callSanitize({ labelSingular: 'Company' }, FR, {
        translations: {
          [FR]: { labelSingular: 'Société' },
          [DE]: { labelSingular: 'Firma' },
        },
      });

      expect(result.standardOverrides).toEqual({
        translations: { [DE]: { labelSingular: 'Firma' } },
      });
    });

    it('should not create an override when value already equals the current stored translation', () => {
      const result = callSanitize({ labelSingular: 'Société' }, FR, {
        translations: { [FR]: { labelSingular: 'Société' } },
      });

      expect(result.standardOverrides).toEqual({
        translations: { [FR]: { labelSingular: 'Société' } },
      });
    });

    it('should keep root-level overrides when translations are fully removed', () => {
      const result = callSanitize({ labelSingular: 'Company' }, FR, {
        icon: 'IconStar',
        translations: { [FR]: { labelSingular: 'Société' } },
      });

      expect(result.standardOverrides).toEqual({ icon: 'IconStar' });
    });
  });
});
