import { i18n } from '@lingui/core';
import { SOURCE_LOCALE } from 'twenty-shared/translations';

import { generateMessageId } from 'src/engine/core-modules/i18n/utils/generateMessageId';
import { resolveOverridableString } from 'src/engine/metadata-modules/field-metadata/utils/resolve-overridable-string.util';

jest.mock('@lingui/core');
jest.mock('src/engine/core-modules/i18n/utils/generateMessageId');

const mockI18n = i18n as jest.Mocked<typeof i18n>;
const mockGenerateMessageId = generateMessageId as jest.MockedFunction<
  typeof generateMessageId
>;

describe('resolveOverridableString', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Custom fields', () => {
    it('should return the field value for custom label field', () => {
      const fieldMetadata = {
        label: 'Custom Label',
        description: 'Custom Description',
        icon: 'custom-icon',
        isCustom: true,
        standardOverrides: undefined,
      };

      const result = resolveOverridableString(fieldMetadata, 'label', 'fr-FR');

      expect(result).toBe('Custom Label');
    });

    it('should return the field value for custom description field', () => {
      const fieldMetadata = {
        label: 'Custom Label',
        description: 'Custom Description',
        icon: 'custom-icon',
        isCustom: true,
        standardOverrides: undefined,
      };

      const result = resolveOverridableString(
        fieldMetadata,
        'description',
        undefined,
      );

      expect(result).toBe('Custom Description');
    });

    it('should return the field value for custom icon field', () => {
      const fieldMetadata = {
        label: 'Custom Label',
        description: 'Custom Description',
        icon: 'custom-icon',
        isCustom: true,
        standardOverrides: undefined,
      };

      const result = resolveOverridableString(
        fieldMetadata,
        'icon',
        SOURCE_LOCALE,
      );

      expect(result).toBe('custom-icon');
    });
  });

  describe('Standard fields - Icon overrides', () => {
    it('should return override icon when available for standard field', () => {
      const fieldMetadata = {
        label: 'Standard Label',
        description: 'Standard Description',
        icon: 'default-icon',
        isCustom: false,
        standardOverrides: {
          icon: 'override-icon',
        },
      };

      const result = resolveOverridableString(fieldMetadata, 'icon', 'fr-FR');

      expect(result).toBe('override-icon');
    });
  });

  describe('Standard fields - Translation overrides', () => {
    it('should return translation override when available for non-icon fields', () => {
      const fieldMetadata = {
        label: 'Standard Label',
        description: 'Standard Description',
        icon: 'default-icon',
        isCustom: false,
        standardOverrides: {
          translations: {
            'fr-FR': {
              label: 'Libellé traduit',
              description: 'Description traduite',
            },
          },
        },
      };

      expect(resolveOverridableString(fieldMetadata, 'label', 'fr-FR')).toBe(
        'Libellé traduit',
      );
      expect(
        resolveOverridableString(fieldMetadata, 'description', 'fr-FR'),
      ).toBe('Description traduite');
    });

    it('should fallback when translation override is not available for the locale', () => {
      const fieldMetadata = {
        label: 'Standard Label',
        description: 'Standard Description',
        icon: 'default-icon',
        isCustom: false,
        standardOverrides: {
          translations: {
            'es-ES': {
              label: 'Etiqueta en español',
            },
          },
        },
      };

      mockGenerateMessageId.mockReturnValue('generated-message-id');
      mockI18n._.mockReturnValue('generated-message-id');

      const result = resolveOverridableString(fieldMetadata, 'label', 'fr-FR');

      expect(result).toBe('Standard Label');
    });

    it('should fallback when translation override is not available for the labelKey', () => {
      const fieldMetadata = {
        label: 'Standard Label',
        description: 'Standard Description',
        icon: 'default-icon',
        isCustom: false,
        standardOverrides: {
          translations: {
            'fr-FR': {
              label: 'Libellé traduit',
            },
          },
        },
      };

      mockGenerateMessageId.mockReturnValue('generated-message-id');
      mockI18n._.mockReturnValue('generated-message-id');

      const result = resolveOverridableString(
        fieldMetadata,
        'description',
        'fr-FR',
      );

      expect(result).toBe('Standard Description');
    });

    it('should not use translation overrides when locale is undefined', () => {
      const fieldMetadata = {
        label: 'Standard Label',
        description: 'Standard Description',
        icon: 'default-icon',
        isCustom: false,
        standardOverrides: {
          translations: {
            'fr-FR': {
              label: 'Libellé traduit',
            },
          },
        },
      };

      mockGenerateMessageId.mockReturnValue('generated-message-id');
      mockI18n._.mockReturnValue('generated-message-id');

      const result = resolveOverridableString(
        fieldMetadata,
        'label',
        undefined,
      );

      expect(result).toBe('Standard Label');
    });
  });

  describe('Standard fields - SOURCE_LOCALE overrides', () => {
    it('should return direct override for SOURCE_LOCALE when available', () => {
      const fieldMetadata = {
        label: 'Standard Label',
        description: 'Standard Description',
        icon: 'default-icon',
        isCustom: false,
        standardOverrides: {
          label: 'Overridden Label',
          description: 'Overridden Description',
          icon: 'overridden-icon',
        },
      };

      expect(
        resolveOverridableString(fieldMetadata, 'label', SOURCE_LOCALE),
      ).toBe('Overridden Label');
      expect(
        resolveOverridableString(fieldMetadata, 'description', SOURCE_LOCALE),
      ).toBe('Overridden Description');
      expect(
        resolveOverridableString(fieldMetadata, 'icon', SOURCE_LOCALE),
      ).toBe('overridden-icon');
    });

    it('should not use direct override for non-SOURCE_LOCALE', () => {
      const fieldMetadata = {
        label: 'Standard Label',
        description: 'Standard Description',
        icon: 'default-icon',
        isCustom: false,
        standardOverrides: {
          label: 'Overridden Label',
        },
      };

      mockGenerateMessageId.mockReturnValue('generated-message-id');
      mockI18n._.mockReturnValue('generated-message-id');

      const result = resolveOverridableString(fieldMetadata, 'label', 'fr-FR');

      expect(result).toBe('Standard Label');
    });

    it('should not use empty string override for SOURCE_LOCALE', () => {
      const fieldMetadata = {
        label: 'Standard Label',
        description: 'Standard Description',
        icon: 'default-icon',
        isCustom: false,
        standardOverrides: {
          label: '',
        },
      };

      mockGenerateMessageId.mockReturnValue('generated-message-id');
      mockI18n._.mockReturnValue('generated-message-id');

      const result = resolveOverridableString(
        fieldMetadata,
        'label',
        SOURCE_LOCALE,
      );

      expect(result).toBe('Standard Label');
    });

    it('should not use undefined override for SOURCE_LOCALE', () => {
      const fieldMetadata = {
        label: 'Standard Label',
        description: 'Standard Description',
        icon: 'default-icon',
        isCustom: false,
        standardOverrides: {
          label: undefined,
        },
      };

      mockGenerateMessageId.mockReturnValue('generated-message-id');
      mockI18n._.mockReturnValue('generated-message-id');

      const result = resolveOverridableString(
        fieldMetadata,
        'label',
        SOURCE_LOCALE,
      );

      expect(result).toBe('Standard Label');
    });
  });

  describe('Standard fields - Auto translation fallback', () => {
    it('should return translated message when translation is available', () => {
      const fieldMetadata = {
        label: 'Standard Label',
        description: 'Standard Description',
        icon: 'default-icon',
        isCustom: false,
        standardOverrides: undefined,
      };

      mockGenerateMessageId.mockReturnValue('standard.label.message.id');
      mockI18n._.mockReturnValue('Libellé traduit automatiquement');

      const result = resolveOverridableString(fieldMetadata, 'label', 'fr-FR');

      expect(mockGenerateMessageId).toHaveBeenCalledWith('Standard Label');
      expect(mockI18n._).toHaveBeenCalledWith('standard.label.message.id');
      expect(result).toBe('Libellé traduit automatiquement');
    });

    it('should return original field value when no translation is found', () => {
      const fieldMetadata = {
        label: 'Standard Label',
        description: 'Standard Description',
        icon: 'default-icon',
        isCustom: false,
        standardOverrides: undefined,
      };

      const messageId = 'standard.label.message.id';

      mockGenerateMessageId.mockReturnValue(messageId);
      mockI18n._.mockReturnValue(messageId);

      const result = resolveOverridableString(fieldMetadata, 'label', 'fr-FR');

      expect(result).toBe('Standard Label');
    });
  });

  describe('Priority order - Standard fields', () => {
    it('should prioritize translation override over SOURCE_LOCALE override for non-SOURCE_LOCALE', () => {
      const fieldMetadata = {
        label: 'Standard Label',
        description: 'Standard Description',
        icon: 'default-icon',
        isCustom: false,
        standardOverrides: {
          label: 'Source Override',
          translations: {
            'fr-FR': {
              label: 'Translation Override',
            },
          },
        },
      };

      const result = resolveOverridableString(fieldMetadata, 'label', 'fr-FR');

      expect(result).toBe('Translation Override');
      expect(mockGenerateMessageId).not.toHaveBeenCalled();
      expect(mockI18n._).not.toHaveBeenCalled();
    });

    it('should prioritize SOURCE_LOCALE override over auto translation for SOURCE_LOCALE', () => {
      const fieldMetadata = {
        label: 'Standard Label',
        description: 'Standard Description',
        icon: 'default-icon',
        isCustom: false,
        standardOverrides: {
          label: 'Source Override',
        },
      };

      const result = resolveOverridableString(
        fieldMetadata,
        'label',
        SOURCE_LOCALE,
      );

      expect(result).toBe('Source Override');
      expect(mockGenerateMessageId).not.toHaveBeenCalled();
      expect(mockI18n._).not.toHaveBeenCalled();
    });

    it('should use auto translation when no overrides are available', () => {
      const fieldMetadata = {
        label: 'Standard Label',
        description: 'Standard Description',
        icon: 'default-icon',
        isCustom: false,
        standardOverrides: {},
      };

      mockGenerateMessageId.mockReturnValue('auto.translation.id');
      mockI18n._.mockReturnValue('Auto Translated Label');

      const result = resolveOverridableString(fieldMetadata, 'label', 'de-DE');

      expect(result).toBe('Auto Translated Label');
      expect(mockGenerateMessageId).toHaveBeenCalledWith('Standard Label');
      expect(mockI18n._).toHaveBeenCalledWith('auto.translation.id');
    });
  });
});
