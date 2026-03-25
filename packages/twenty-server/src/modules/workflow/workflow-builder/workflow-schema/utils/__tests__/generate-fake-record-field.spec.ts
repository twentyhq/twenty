import { FieldMetadataType } from 'twenty-shared/types';

import * as generateFakeValueModule from 'src/engine/utils/generate-fake-value';
import { generateFakeRecordField } from 'src/modules/workflow/workflow-builder/workflow-schema/utils/generate-fake-record-field';
import * as camelToTitleCaseModule from 'src/utils/camel-to-title-case';

jest.mock('src/engine/utils/generate-fake-value');
jest.mock('src/utils/camel-to-title-case');

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

      const result = generateFakeRecordField({
        type: FieldMetadataType.TEXT,
        label: 'Text Field',
        fieldMetadataId: '123e4567-e89b-12d3-a456-426614174000',
      });

      expect(result).toEqual({
        isLeaf: true,
        type: FieldMetadataType.TEXT,
        icon: undefined,
        label: 'Text Field',
        value: 'Fake Text',
        fieldMetadataId: '123e4567-e89b-12d3-a456-426614174000',
      });

      expect(generateFakeValueSpy).toHaveBeenCalledWith(
        FieldMetadataType.TEXT,
        'FieldMetadataType',
      );
    });

    it('should handle custom value', () => {
      const result = generateFakeRecordField({
        type: FieldMetadataType.TEXT,
        label: 'Text Field',
        value: 'Test value',
        fieldMetadataId: '123e4567-e89b-12d3-a456-426614174000',
      });

      expect(result).toEqual({
        isLeaf: true,
        type: FieldMetadataType.TEXT,
        icon: undefined,
        label: 'Text Field',
        value: 'Test value',
        fieldMetadataId: '123e4567-e89b-12d3-a456-426614174000',
      });

      expect(generateFakeValueSpy).not.toHaveBeenCalled();
    });

    it('should generate a leaf node for NUMBER type with icon', () => {
      generateFakeValueSpy.mockReturnValueOnce(42);

      const result = generateFakeRecordField({
        type: FieldMetadataType.NUMBER,
        label: 'Number Field',
        icon: 'IconNumber',
        fieldMetadataId: '123e4567-e89b-12d3-a456-426614174000',
      });

      expect(result).toEqual({
        isLeaf: true,
        type: FieldMetadataType.NUMBER,
        icon: 'IconNumber',
        label: 'Number Field',
        value: 42,
        fieldMetadataId: '123e4567-e89b-12d3-a456-426614174000',
      });
    });

    it('should generate a leaf node for DATE type', () => {
      const fakeDate = new Date('2023-01-01');

      generateFakeValueSpy.mockReturnValueOnce(fakeDate);

      const result = generateFakeRecordField({
        type: FieldMetadataType.DATE,
        label: 'Date Field',
        fieldMetadataId: '123e4567-e89b-12d3-a456-426614174000',
      });

      expect(result).toEqual({
        isLeaf: true,
        type: FieldMetadataType.DATE,
        icon: undefined,
        label: 'Date Field',
        value: fakeDate,
        fieldMetadataId: '123e4567-e89b-12d3-a456-426614174000',
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

      const result = generateFakeRecordField({
        type: FieldMetadataType.LINKS,
        label: 'Links Field',
        fieldMetadataId: '123e4567-e89b-12d3-a456-426614174000',
      });

      expect(result).toEqual({
        isLeaf: false,
        icon: undefined,
        label: 'Links Field',
        type: FieldMetadataType.LINKS,
        value: {
          primaryLinkLabel: {
            fieldMetadataId: '123e4567-e89b-12d3-a456-426614174000',
            isCompositeSubField: true,
            isLeaf: true,
            type: FieldMetadataType.TEXT,
            label: 'Label',
            value: 'Fake Label',
          },
          primaryLinkUrl: {
            fieldMetadataId: '123e4567-e89b-12d3-a456-426614174000',
            isCompositeSubField: true,
            isLeaf: true,
            type: FieldMetadataType.TEXT,
            label: 'Url',
            value: 'https://example.com',
          },
          secondaryLinks: {
            fieldMetadataId: '123e4567-e89b-12d3-a456-426614174000',
            isCompositeSubField: true,
            isLeaf: true,
            label: 'Title secondaryLinks',
            type: 'RAW_JSON',
            value: 'fake-RAW_JSON',
          },
        },
        fieldMetadataId: '123e4567-e89b-12d3-a456-426614174000',
      });

      expect(generateFakeValueSpy).toHaveBeenCalledTimes(3);
      expect(camelToTitleCaseSpy).toHaveBeenCalledWith('primaryLinkLabel');
      expect(camelToTitleCaseSpy).toHaveBeenCalledWith('primaryLinkUrl');
      expect(camelToTitleCaseSpy).toHaveBeenCalledWith('secondaryLinks');
    });

    it('should generate a node with properties for CURRENCY type', () => {
      generateFakeValueSpy.mockReturnValueOnce(100).mockReturnValueOnce('USD');

      camelToTitleCaseSpy
        .mockReturnValueOnce('Amount')
        .mockReturnValueOnce('Currency Code');

      const result = generateFakeRecordField({
        type: FieldMetadataType.CURRENCY,
        label: 'Currency Field',
        icon: 'IconCurrency',
        fieldMetadataId: '123e4567-e89b-12d3-a456-426614174000',
      });

      expect(result).toEqual({
        isLeaf: false,
        icon: 'IconCurrency',
        label: 'Currency Field',
        type: FieldMetadataType.CURRENCY,
        value: {
          amountMicros: {
            fieldMetadataId: '123e4567-e89b-12d3-a456-426614174000',
            isCompositeSubField: true,
            isLeaf: true,
            type: FieldMetadataType.NUMERIC,
            label: 'Amount',
            value: 100,
          },
          currencyCode: {
            fieldMetadataId: '123e4567-e89b-12d3-a456-426614174000',
            isCompositeSubField: true,
            isLeaf: true,
            type: FieldMetadataType.TEXT,
            label: 'Currency Code',
            value: 'USD',
          },
        },
        fieldMetadataId: '123e4567-e89b-12d3-a456-426614174000',
      });
    });
  });

  describe('edge cases', () => {
    it('should handle unknown field types as leaf nodes', () => {
      const unknownType = 'UNKNOWN_TYPE' as FieldMetadataType;

      generateFakeValueSpy.mockReturnValueOnce('Unknown Value');

      const result = generateFakeRecordField({
        type: unknownType,
        label: 'Unknown Field',
        fieldMetadataId: '123e4567-e89b-12d3-a456-426614174000',
      });

      expect(result).toEqual({
        isLeaf: true,
        type: unknownType,
        icon: undefined,
        label: 'Unknown Field',
        value: 'Unknown Value',
        fieldMetadataId: '123e4567-e89b-12d3-a456-426614174000',
      });
    });

    it('should handle empty label', () => {
      generateFakeValueSpy.mockReturnValueOnce('Fake Boolean');

      const result = generateFakeRecordField({
        type: FieldMetadataType.BOOLEAN,
        label: '',
        fieldMetadataId: '123e4567-e89b-12d3-a456-426614174000',
      });

      expect(result).toEqual({
        isLeaf: true,
        type: FieldMetadataType.BOOLEAN,
        icon: undefined,
        label: '',
        value: 'Fake Boolean',
        fieldMetadataId: '123e4567-e89b-12d3-a456-426614174000',
      });
    });
  });
});
