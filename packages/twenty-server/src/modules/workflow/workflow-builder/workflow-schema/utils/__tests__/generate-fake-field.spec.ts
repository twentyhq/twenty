import { FieldMetadataType } from 'twenty-shared';

import { generateFakeValue } from 'src/engine/utils/generate-fake-value';
import { generateFakeField } from 'src/modules/workflow/workflow-builder/workflow-schema/utils/generate-fake-field';
import { camelToTitleCase } from 'src/utils/camel-to-title-case';

jest.mock('src/engine/utils/generate-fake-value');
jest.mock('src/utils/camel-to-title-case');
jest.mock('src/engine/metadata-modules/field-metadata/composite-types', () => {
  const mockCompositeTypeDefinitions = new Map();

  mockCompositeTypeDefinitions.set(FieldMetadataType.LINKS, {
    properties: [
      { name: 'label', type: FieldMetadataType.TEXT },
      { name: 'url', type: FieldMetadataType.TEXT },
    ],
  });

  mockCompositeTypeDefinitions.set(FieldMetadataType.CURRENCY, {
    properties: [
      { name: 'amount', type: FieldMetadataType.NUMBER },
      { name: 'currencyCode', type: FieldMetadataType.TEXT },
    ],
  });

  return {
    compositeTypeDefinitions: mockCompositeTypeDefinitions,
  };
});

describe('generateFakeField', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock implementations
    (generateFakeValue as jest.Mock).mockImplementation(
      (type) => `fake-${type}`,
    );
    (camelToTitleCase as jest.Mock).mockImplementation((str) => `Title ${str}`);
  });

  describe('for simple field types', () => {
    it('should generate a leaf node for TEXT type', () => {
      (generateFakeValue as jest.Mock).mockReturnValueOnce('Fake Text');

      const result = generateFakeField({
        type: FieldMetadataType.TEXT,
        label: 'Text Field',
      });

      expect(result).toEqual({
        isLeaf: true,
        type: FieldMetadataType.TEXT,
        icon: undefined,
        label: 'Text Field',
        value: 'Fake Text',
      });

      expect(generateFakeValue).toHaveBeenCalledWith(
        FieldMetadataType.TEXT,
        'FieldMetadataType',
      );
    });

    it('should generate a leaf node for NUMBER type with icon', () => {
      (generateFakeValue as jest.Mock).mockReturnValueOnce(42);

      const result = generateFakeField({
        type: FieldMetadataType.NUMBER,
        label: 'Number Field',
        icon: 'IconNumber',
      });

      expect(result).toEqual({
        isLeaf: true,
        type: FieldMetadataType.NUMBER,
        icon: 'IconNumber',
        label: 'Number Field',
        value: 42,
      });
    });

    it('should generate a leaf node for DATE type', () => {
      const fakeDate = new Date('2023-01-01');

      (generateFakeValue as jest.Mock).mockReturnValueOnce(fakeDate);

      const result = generateFakeField({
        type: FieldMetadataType.DATE,
        label: 'Date Field',
      });

      expect(result).toEqual({
        isLeaf: true,
        type: FieldMetadataType.DATE,
        icon: undefined,
        label: 'Date Field',
        value: fakeDate,
      });
    });
  });

  describe('for composite field types', () => {
    it('should generate a node with properties for LINKS type', () => {
      (generateFakeValue as jest.Mock)
        .mockReturnValueOnce('Fake Label')
        .mockReturnValueOnce('https://example.com');

      (camelToTitleCase as jest.Mock)
        .mockReturnValueOnce('Label')
        .mockReturnValueOnce('Url');

      const result = generateFakeField({
        type: FieldMetadataType.LINKS,
        label: 'Links Field',
      });

      expect(result).toEqual({
        isLeaf: false,
        icon: undefined,
        label: 'Links Field',
        value: {
          label: {
            isLeaf: true,
            type: FieldMetadataType.TEXT,
            label: 'Label',
            value: 'Fake Label',
          },
          url: {
            isLeaf: true,
            type: FieldMetadataType.TEXT,
            label: 'Url',
            value: 'https://example.com',
          },
        },
      });

      expect(generateFakeValue).toHaveBeenCalledTimes(2);
      expect(camelToTitleCase).toHaveBeenCalledWith('label');
      expect(camelToTitleCase).toHaveBeenCalledWith('url');
    });

    it('should generate a node with properties for CURRENCY type', () => {
      (generateFakeValue as jest.Mock)
        .mockReturnValueOnce(100)
        .mockReturnValueOnce('USD');

      (camelToTitleCase as jest.Mock)
        .mockReturnValueOnce('Amount')
        .mockReturnValueOnce('Currency Code');

      const result = generateFakeField({
        type: FieldMetadataType.CURRENCY,
        label: 'Currency Field',
        icon: 'IconCurrency',
      });

      expect(result).toEqual({
        isLeaf: false,
        icon: 'IconCurrency',
        label: 'Currency Field',
        value: {
          amount: {
            isLeaf: true,
            type: FieldMetadataType.NUMBER,
            label: 'Amount',
            value: 100,
          },
          currencyCode: {
            isLeaf: true,
            type: FieldMetadataType.TEXT,
            label: 'Currency Code',
            value: 'USD',
          },
        },
      });
    });
  });

  describe('edge cases', () => {
    it('should handle unknown field types as leaf nodes', () => {
      const unknownType = 'UNKNOWN_TYPE' as FieldMetadataType;

      (generateFakeValue as jest.Mock).mockReturnValueOnce('Unknown Value');

      const result = generateFakeField({
        type: unknownType,
        label: 'Unknown Field',
      });

      expect(result).toEqual({
        isLeaf: true,
        type: unknownType,
        icon: undefined,
        label: 'Unknown Field',
        value: 'Unknown Value',
      });
    });

    it('should handle empty label', () => {
      (generateFakeValue as jest.Mock).mockReturnValueOnce('Fake Boolean');

      const result = generateFakeField({
        type: FieldMetadataType.BOOLEAN,
        label: '',
      });

      expect(result).toEqual({
        isLeaf: true,
        type: FieldMetadataType.BOOLEAN,
        icon: undefined,
        label: '',
        value: 'Fake Boolean',
      });
    });
  });
});
