import { type I18n } from '@lingui/core';
import { SOURCE_LOCALE } from 'twenty-shared/translations';

import { generateMessageId } from 'src/engine/core-modules/i18n/utils/generateMessageId';
import { resolveFieldMetadataStandardOverride } from 'src/engine/metadata-modules/field-metadata/utils/resolve-field-metadata-standard-override.util';

jest.mock('src/engine/core-modules/i18n/utils/generateMessageId');

const mockGenerateMessageId = generateMessageId as jest.MockedFunction<
  typeof generateMessageId
>;

describe('resolveFieldMetadataStandardOverride', () => {
  let mockI18n: jest.Mocked<I18n>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockI18n = {
      _: jest.fn(),
    } as unknown as jest.Mocked<I18n>;
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

      const result = resolveFieldMetadataStandardOverride(
        fieldMetadata,
        'label',
        'fr-FR',
        mockI18n,
        !fieldMetadata.isCustom,
      );

      expect(result).toBe('Custom Label');
    });

    it('should never translate a custom label even when it matches a standard catalog entry', () => {
      const fieldMetadata = {
        label: 'Status',
        description: 'Custom Description',
        icon: 'custom-icon',
        isCustom: true,
        standardOverrides: undefined,
      };

      mockGenerateMessageId.mockReturnValue('status.message.id');
      mockI18n._.mockReturnValue('Statut');

      const result = resolveFieldMetadataStandardOverride(
        fieldMetadata,
        'label',
        'fr-FR',
        mockI18n,
        !fieldMetadata.isCustom,
      );

      expect(result).toBe('Status');
      expect(mockGenerateMessageId).not.toHaveBeenCalled();
      expect(mockI18n._).not.toHaveBeenCalled();
    });

    it('should return the field value for custom description field', () => {
      const fieldMetadata = {
        label: 'Custom Label',
        description: 'Custom Description',
        icon: 'custom-icon',
        isCustom: true,
        standardOverrides: undefined,
      };

      const result = resolveFieldMetadataStandardOverride(
        fieldMetadata,
        'description',
        undefined,
        mockI18n,
        !fieldMetadata.isCustom,
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

      const result = resolveFieldMetadataStandardOverride(
        fieldMetadata,
        'icon',
        SOURCE_LOCALE,
        mockI18n,
        !fieldMetadata.isCustom,
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

      const result = resolveFieldMetadataStandardOverride(
        fieldMetadata,
        'icon',
        'fr-FR',
        mockI18n,
        !fieldMetadata.isCustom,
      );

      expect(result).toBe('override-icon');
    });
  });

  describe('Standard fields - Workspace catalog (value-keyed) overrides', () => {
    it('should prioritize the workspace catalog over shipped translations', () => {
      mockGenerateMessageId.mockReturnValue('label.id');
      mockI18n._.mockReturnValue('Shipped FR');

      const fieldMetadata = {
        label: 'Standard Label',
        description: 'Standard Description',
        icon: 'default-icon',
        isCustom: false,
        standardOverrides: undefined,
      };

      const result = resolveFieldMetadataStandardOverride(
        fieldMetadata,
        'label',
        'fr-FR',
        mockI18n,
        true,
        undefined,
        { 'label.id': 'Libellé (bench)' },
      );

      expect(result).toBe('Libellé (bench)');
      expect(mockI18n._).not.toHaveBeenCalled();
    });

    it('should apply the workspace catalog to custom fields', () => {
      mockGenerateMessageId.mockReturnValue('custom.id');

      const fieldMetadata = {
        label: 'My Custom Field',
        description: 'Custom Description',
        icon: 'default-icon',
        isCustom: true,
        standardOverrides: undefined,
      };

      const result = resolveFieldMetadataStandardOverride(
        fieldMetadata,
        'label',
        'fr-FR',
        mockI18n,
        false,
        undefined,
        { 'custom.id': 'Champ personnalisé' },
      );

      expect(result).toBe('Champ personnalisé');
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
        resolveFieldMetadataStandardOverride(
          fieldMetadata,
          'label',
          SOURCE_LOCALE,
          mockI18n,
          !fieldMetadata.isCustom,
        ),
      ).toBe('Overridden Label');
      expect(
        resolveFieldMetadataStandardOverride(
          fieldMetadata,
          'description',
          SOURCE_LOCALE,
          mockI18n,
          !fieldMetadata.isCustom,
        ),
      ).toBe('Overridden Description');
      expect(
        resolveFieldMetadataStandardOverride(
          fieldMetadata,
          'icon',
          SOURCE_LOCALE,
          mockI18n,
          !fieldMetadata.isCustom,
        ),
      ).toBe('overridden-icon');
    });

    it('should use direct override for non-SOURCE_LOCALE when translation override is missing', () => {
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

      const result = resolveFieldMetadataStandardOverride(
        fieldMetadata,
        'label',
        'fr-FR',
        mockI18n,
        !fieldMetadata.isCustom,
      );

      expect(result).toBe('Overridden Label');
      expect(mockGenerateMessageId).not.toHaveBeenCalled();
      expect(mockI18n._).not.toHaveBeenCalled();
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

      const result = resolveFieldMetadataStandardOverride(
        fieldMetadata,
        'label',
        SOURCE_LOCALE,
        mockI18n,
        !fieldMetadata.isCustom,
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

      const result = resolveFieldMetadataStandardOverride(
        fieldMetadata,
        'label',
        SOURCE_LOCALE,
        mockI18n,
        !fieldMetadata.isCustom,
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

      const result = resolveFieldMetadataStandardOverride(
        fieldMetadata,
        'label',
        'fr-FR',
        mockI18n,
        !fieldMetadata.isCustom,
      );

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

      const result = resolveFieldMetadataStandardOverride(
        fieldMetadata,
        'label',
        'fr-FR',
        mockI18n,
        !fieldMetadata.isCustom,
      );

      expect(result).toBe('Standard Label');
    });
  });

  describe('Priority order - Standard fields', () => {
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

      const result = resolveFieldMetadataStandardOverride(
        fieldMetadata,
        'label',
        SOURCE_LOCALE,
        mockI18n,
        !fieldMetadata.isCustom,
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

      const result = resolveFieldMetadataStandardOverride(
        fieldMetadata,
        'label',
        'de-DE',
        mockI18n,
        !fieldMetadata.isCustom,
      );

      expect(result).toBe('Auto Translated Label');
      expect(mockGenerateMessageId).toHaveBeenCalledWith('Standard Label');
      expect(mockI18n._).toHaveBeenCalledWith('auto.translation.id');
    });
  });
});
