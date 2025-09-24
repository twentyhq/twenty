import { type I18n } from '@lingui/core';
import { SOURCE_LOCALE } from 'twenty-shared/translations';

import { generateMessageId } from 'src/engine/core-modules/i18n/utils/generateMessageId';
import { type ObjectMetadataDTO } from 'src/engine/metadata-modules/object-metadata/dtos/object-metadata.dto';
import { resolveObjectMetadataStandardOverride } from 'src/engine/metadata-modules/object-metadata/utils/resolve-object-metadata-standard-override.util';

jest.mock('src/engine/core-modules/i18n/utils/generateMessageId');

const mockGenerateMessageId = generateMessageId as jest.MockedFunction<
  typeof generateMessageId
>;

describe('resolveObjectMetadataStandardOverride', () => {
  let mockI18n: jest.Mocked<I18n>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockI18n = {
      _: jest.fn(),
    } as unknown as jest.Mocked<I18n>;
  });

  describe('Custom objects', () => {
    it('should return the object value for custom labelSingular object', () => {
      const objectMetadata = {
        labelSingular: 'My Custom',
        labelPlural: 'My Customs',
        description: 'Custom Description',
        icon: 'custom-icon',
        isCustom: true,
        standardOverrides: undefined,
      } satisfies Pick<
        ObjectMetadataDTO,
        | 'labelPlural'
        | 'labelSingular'
        | 'description'
        | 'icon'
        | 'isCustom'
        | 'standardOverrides'
      >;

      const result = resolveObjectMetadataStandardOverride(
        objectMetadata,
        'labelSingular',
        'fr-FR',
        mockI18n,
      );

      expect(result).toBe('My Custom');
    });

    it('should return the object value for custom description object', () => {
      const objectMetadata = {
        labelSingular: 'My Custom',
        labelPlural: 'My Customs',
        description: 'Custom Description',
        icon: 'custom-icon',
        isCustom: true,
        standardOverrides: undefined,
      } satisfies Pick<
        ObjectMetadataDTO,
        | 'labelPlural'
        | 'labelSingular'
        | 'description'
        | 'icon'
        | 'isCustom'
        | 'standardOverrides'
      >;

      const result = resolveObjectMetadataStandardOverride(
        objectMetadata,
        'description',
        undefined,
        mockI18n,
      );

      expect(result).toBe('Custom Description');
    });

    it('should return the object value for custom icon object', () => {
      const objectMetadata = {
        labelSingular: 'My Custom',
        labelPlural: 'My Customs',
        description: 'Custom Description',
        icon: 'custom-icon',
        isCustom: true,
        standardOverrides: undefined,
      } satisfies Pick<
        ObjectMetadataDTO,
        | 'labelPlural'
        | 'labelSingular'
        | 'description'
        | 'icon'
        | 'isCustom'
        | 'standardOverrides'
      >;

      const result = resolveObjectMetadataStandardOverride(
        objectMetadata,
        'icon',
        SOURCE_LOCALE,
        mockI18n,
      );

      expect(result).toBe('custom-icon');
    });
  });

  describe('Standard objects - Icon overrides', () => {
    it('should return override icon when available for standard object', () => {
      const objectMetadata = {
        labelSingular: 'My Custom',
        labelPlural: 'My Customs',
        description: 'Standard Description',
        icon: 'default-icon',
        isCustom: false,
        standardOverrides: {
          icon: 'override-icon',
        },
      };

      const result = resolveObjectMetadataStandardOverride(
        objectMetadata,
        'icon',
        'fr-FR',
        mockI18n,
      );

      expect(result).toBe('override-icon');
    });
  });

  describe('Standard objects - Translation overrides', () => {
    it('should return translation override when available for non-icon objects', () => {
      const objectMetadata = {
        labelSingular: 'Standard Label',
        labelPlural: 'Standard Labels',
        description: 'Standard Description',
        icon: 'default-icon',
        isCustom: false,
        standardOverrides: {
          translations: {
            'fr-FR': {
              labelSingular: 'Libellé traduit',
              labelPlural: 'Libellés traduits',
              description: 'Description traduite',
            },
          },
        },
      };

      expect(
        resolveObjectMetadataStandardOverride(
          objectMetadata,
          'labelSingular',
          'fr-FR',
          mockI18n,
        ),
      ).toBe('Libellé traduit');
      expect(
        resolveObjectMetadataStandardOverride(
          objectMetadata,
          'labelPlural',
          'fr-FR',
          mockI18n,
        ),
      ).toBe('Libellés traduits');
      expect(
        resolveObjectMetadataStandardOverride(
          objectMetadata,
          'description',
          'fr-FR',
          mockI18n,
        ),
      ).toBe('Description traduite');
    });

    it('should fallback when translation override is not available for the locale', () => {
      const objectMetadata = {
        labelSingular: 'Standard Label',
        labelPlural: 'Standard Labels',
        description: 'Standard Description',
        icon: 'default-icon',
        isCustom: false,
        standardOverrides: {
          translations: {
            'es-ES': {
              labelSingular: 'Etiqueta en español',
              labelPlural: 'Etiquetas en español',
              description: 'Descripción en español',
            },
          },
        },
      };

      mockGenerateMessageId.mockReturnValue('generated-message-id');
      mockI18n._.mockReturnValue('generated-message-id');

      const result = resolveObjectMetadataStandardOverride(
        objectMetadata,
        'labelSingular',
        'fr-FR',
        mockI18n,
      );

      expect(result).toBe('Standard Label');
    });

    it('should fallback when translation override is not available for the labelKey', () => {
      const objectMetadata = {
        labelSingular: 'Standard Label',
        labelPlural: 'Standard Labels',
        description: 'Standard Description',
        icon: 'default-icon',
        isCustom: false,
        standardOverrides: {
          translations: {
            'fr-FR': {
              labelPlural: 'Libellés traduits',
              labelSingular: 'Libellé traduit',
            },
          },
        },
      };

      mockGenerateMessageId.mockReturnValue('generated-message-id');
      mockI18n._.mockReturnValue('generated-message-id');

      const result = resolveObjectMetadataStandardOverride(
        objectMetadata,
        'description',
        'fr-FR',
        mockI18n,
      );

      expect(result).toBe('Standard Description');
    });

    it('should not use translation overrides when locale is undefined', () => {
      const objectMetadata = {
        labelSingular: 'Standard Label',
        labelPlural: 'Standard Labels',
        description: 'Standard Description',
        icon: 'default-icon',
        isCustom: false,
        standardOverrides: {
          translations: {
            'fr-FR': {
              labelSingular: 'Libellé traduit',
              labelPlural: 'Libellés traduits',
              description: 'Description traduite',
            },
          },
        },
      };

      mockGenerateMessageId.mockReturnValue('generated-message-id');
      mockI18n._.mockReturnValue('generated-message-id');

      const result = resolveObjectMetadataStandardOverride(
        objectMetadata,
        'labelSingular',
        undefined,
        mockI18n,
      );

      expect(result).toBe('Standard Label');
    });
  });

  describe('Standard objects - SOURCE_LOCALE overrides', () => {
    it('should return direct override for SOURCE_LOCALE when available', () => {
      const objectMetadata = {
        labelSingular: 'Standard Label',
        labelPlural: 'Standard Labels',
        description: 'Standard Description',
        icon: 'default-icon',
        isCustom: false,
        standardOverrides: {
          labelSingular: 'Overridden Label',
          labelPlural: 'Overridden Labels',
          description: 'Overridden Description',
          icon: 'overridden-icon',
        },
      };

      expect(
        resolveObjectMetadataStandardOverride(
          objectMetadata,
          'labelSingular',
          SOURCE_LOCALE,
          mockI18n,
        ),
      ).toBe('Overridden Label');
      expect(
        resolveObjectMetadataStandardOverride(
          objectMetadata,
          'labelPlural',
          SOURCE_LOCALE,
          mockI18n,
        ),
      ).toBe('Overridden Labels');
      expect(
        resolveObjectMetadataStandardOverride(
          objectMetadata,
          'description',
          SOURCE_LOCALE,
          mockI18n,
        ),
      ).toBe('Overridden Description');
      expect(
        resolveObjectMetadataStandardOverride(
          objectMetadata,
          'icon',
          SOURCE_LOCALE,
          mockI18n,
        ),
      ).toBe('overridden-icon');
    });

    it('should not use direct override for non-SOURCE_LOCALE', () => {
      const objectMetadata = {
        labelSingular: 'Standard Label',
        labelPlural: 'Standard Labels',
        description: 'Standard Description',
        icon: 'default-icon',
        isCustom: false,
        standardOverrides: {
          labelSingular: 'Overridden Label',
          labelPlural: 'Overridden Labels',
        },
      };

      mockGenerateMessageId.mockReturnValue('generated-message-id');
      mockI18n._.mockReturnValue('generated-message-id');

      const result = resolveObjectMetadataStandardOverride(
        objectMetadata,
        'labelSingular',
        'fr-FR',
        mockI18n,
      );

      expect(result).toBe('Standard Label');
    });

    it('should not use undefined override for SOURCE_LOCALE', () => {
      const objectMetadata = {
        labelSingular: 'Standard Label',
        labelPlural: 'Standard Labels',
        description: 'Standard Description',
        icon: 'default-icon',
        isCustom: false,
        standardOverrides: {
          labelSingular: undefined,
        },
      };

      mockGenerateMessageId.mockReturnValue('generated-message-id');
      mockI18n._.mockReturnValue('generated-message-id');

      const result = resolveObjectMetadataStandardOverride(
        objectMetadata,
        'labelSingular',
        SOURCE_LOCALE,
        mockI18n,
      );

      expect(result).toBe('Standard Label');
    });
  });

  describe('Standard objects - Auto translation fallback', () => {
    it('should return translated message when translation is available', () => {
      const objectMetadata = {
        labelSingular: 'Standard Label',
        labelPlural: 'Standard Labels',
        description: 'Standard Description',
        icon: 'default-icon',
        isCustom: false,
        standardOverrides: undefined,
      };

      mockGenerateMessageId.mockReturnValue('standard.label.message.id');
      mockI18n._.mockReturnValue('Libellé traduit automatiquement');

      const result = resolveObjectMetadataStandardOverride(
        objectMetadata,
        'labelSingular',
        'fr-FR',
        mockI18n,
      );

      expect(mockGenerateMessageId).toHaveBeenCalledWith('Standard Label');
      expect(mockI18n._).toHaveBeenCalledWith('standard.label.message.id');
      expect(result).toBe('Libellé traduit automatiquement');
    });

    it('should return original object value when no translation is found', () => {
      const objectMetadata = {
        labelSingular: 'Standard Label',
        labelPlural: 'Standard Labels',
        description: 'Standard Description',
        icon: 'default-icon',
        isCustom: false,
        standardOverrides: undefined,
      };

      const messageId = 'standard.label.message.id';

      mockGenerateMessageId.mockReturnValue(messageId);
      mockI18n._.mockReturnValue(messageId);

      const result = resolveObjectMetadataStandardOverride(
        objectMetadata,
        'labelSingular',
        'fr-FR',
        mockI18n,
      );

      expect(result).toBe('Standard Label');
    });
  });

  describe('Priority order - Standard objects', () => {
    it('should prioritize translation override over SOURCE_LOCALE override for non-SOURCE_LOCALE', () => {
      const objectMetadata = {
        labelSingular: 'Standard Label',
        labelPlural: 'Standard Labels',
        description: 'Standard Description',
        icon: 'default-icon',
        isCustom: false,
        standardOverrides: {
          labelSingular: 'Source Override',
          labelPlural: 'Source Overrides',
          translations: {
            'fr-FR': {
              labelSingular: 'Translation Override',
              labelPlural: 'Translation Overrides',
            },
          },
        },
      };

      const result = resolveObjectMetadataStandardOverride(
        objectMetadata,
        'labelSingular',
        'fr-FR',
        mockI18n,
      );

      expect(result).toBe('Translation Override');
      expect(mockGenerateMessageId).not.toHaveBeenCalled();
      expect(mockI18n._).not.toHaveBeenCalled();
    });

    it('should prioritize SOURCE_LOCALE override over auto translation for SOURCE_LOCALE', () => {
      const objectMetadata = {
        labelSingular: 'Standard Label',
        labelPlural: 'Standard Labels',
        description: 'Standard Description',
        icon: 'default-icon',
        isCustom: false,
        standardOverrides: {
          labelSingular: 'Source Override',
          labelPlural: 'Source Overrides',
        },
      };

      const result = resolveObjectMetadataStandardOverride(
        objectMetadata,
        'labelSingular',
        SOURCE_LOCALE,
        mockI18n,
      );

      expect(result).toBe('Source Override');
      expect(mockGenerateMessageId).not.toHaveBeenCalled();
      expect(mockI18n._).not.toHaveBeenCalled();
    });

    it('should use auto translation when no overrides are available', () => {
      const objectMetadata = {
        labelSingular: 'Standard Label',
        labelPlural: 'Standard Labels',
        description: 'Standard Description',
        icon: 'default-icon',
        isCustom: false,
        standardOverrides: {},
      };

      mockGenerateMessageId.mockReturnValue('auto.translation.id');
      mockI18n._.mockReturnValue('Auto Translated Label');

      const result = resolveObjectMetadataStandardOverride(
        objectMetadata,
        'labelSingular',
        'de-DE',
        mockI18n,
      );

      expect(result).toBe('Auto Translated Label');
      expect(mockGenerateMessageId).toHaveBeenCalledWith('Standard Label');
      expect(mockI18n._).toHaveBeenCalledWith('auto.translation.id');
    });
  });

  describe('Undefined locale handling', () => {
    it('should use SOURCE_LOCALE fallback when locale is undefined for standard object', () => {
      const objectMetadata = {
        labelSingular: 'Standard Label',
        labelPlural: 'Standard Labels',
        description: 'Standard Description',
        icon: 'default-icon',
        isCustom: false,
        standardOverrides: {
          labelSingular: 'Source Override',
        },
      };

      const result = resolveObjectMetadataStandardOverride(
        objectMetadata,
        'labelSingular',
        undefined,
        mockI18n,
      );

      expect(result).toBe('Source Override');
      expect(mockGenerateMessageId).not.toHaveBeenCalled();
      expect(mockI18n._).not.toHaveBeenCalled();
    });

    it('should fall back to auto translation when locale is undefined and no SOURCE_LOCALE override exists', () => {
      mockI18n._.mockReturnValue('Auto Translated Label');
      mockGenerateMessageId.mockReturnValue('auto.translation.id');

      const objectMetadata = {
        labelSingular: 'Standard Label',
        labelPlural: 'Standard Labels',
        description: 'Standard Description',
        icon: 'default-icon',
        isCustom: false,
        standardOverrides: undefined,
      };

      const result = resolveObjectMetadataStandardOverride(
        objectMetadata,
        'labelSingular',
        undefined,
        mockI18n,
      );

      expect(result).toBe('Auto Translated Label');
      expect(mockGenerateMessageId).toHaveBeenCalledWith('Standard Label');
      expect(mockI18n._).toHaveBeenCalledWith('auto.translation.id');
    });
  });
});
