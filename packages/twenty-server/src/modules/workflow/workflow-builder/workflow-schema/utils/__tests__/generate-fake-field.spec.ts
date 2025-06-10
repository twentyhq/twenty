import { FieldMetadataType } from 'twenty-shared/types';

import * as generateFakeValueModule from 'src/engine/utils/generate-fake-value';
import { generateFakeField } from 'src/modules/workflow/workflow-builder/workflow-schema/utils/generate-fake-field';
import * as camelToTitleCaseModule from 'src/utils/camel-to-title-case';

jest.mock('src/engine/utils/generate-fake-value');
jest.mock('src/utils/camel-to-title-case');
jest.mock('src/engine/metadata-modules/field-metadata/composite-types', () => {
  const actualTypes = jest.requireActual('twenty-shared/types');
  const { FieldMetadataType } = actualTypes;

  const compositeTypeDefinitions = new Map();

  compositeTypeDefinitions.set(FieldMetadataType.LINKS, {
    properties: [
      { name: 'label', type: FieldMetadataType.TEXT },
      { name: 'url', type: FieldMetadataType.TEXT },
    ],
  });

  compositeTypeDefinitions.set(FieldMetadataType.CURRENCY, {
    properties: [
      { name: 'amount', type: FieldMetadataType.NUMBER },
      { name: 'currencyCode', type: FieldMetadataType.TEXT },
    ],
  });

  return {
    compositeTypeDefinitions,
  };
});

describe('generateFakeField', () => {
  const generateFakeValueSpy = jest.spyOn(
    generateFakeValueModule,
    'generateFakeValue',
  );
  const camelToTitleCaseSpy = jest.spyOn(
    camelToTitleCaseModule,
    'camelToTitleCase',
  );

  beforeEach(() => {
    jest.clearAllMocks();
    // Default mock implementations
    generateFakeValueSpy.mockImplementation((type) => `fake-${type}`);
    camelToTitleCaseSpy.mockImplementation((str) => `Title ${str}`);
  });

  describe('for simple field types', () => {
    it('should generate a leaf node for TEXT type', () => {
      generateFakeValueSpy.mockReturnValueOnce('Fake Text');

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

      expect(generateFakeValueSpy).toHaveBeenCalledWith(
        FieldMetadataType.TEXT,
        'FieldMetadataType',
      );
    });

    it('should generate a leaf node for NUMBER type with icon', () => {
      generateFakeValueSpy.mockReturnValueOnce(42);

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

      generateFakeValueSpy.mockReturnValueOnce(fakeDate);

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
      generateFakeValueSpy
        .mockReturnValueOnce('Fake Label')
        .mockReturnValueOnce('https://example.com');

      camelToTitleCaseSpy
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

      expect(generateFakeValueSpy).toHaveBeenCalledTimes(2);
      expect(camelToTitleCaseSpy).toHaveBeenCalledWith('label');
      expect(camelToTitleCaseSpy).toHaveBeenCalledWith('url');
    });

    it('should generate a node with properties for CURRENCY type', () => {
      generateFakeValueSpy.mockReturnValueOnce(100).mockReturnValueOnce('USD');

      camelToTitleCaseSpy
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

      generateFakeValueSpy.mockReturnValueOnce('Unknown Value');

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
      generateFakeValueSpy.mockReturnValueOnce('Fake Boolean');

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
