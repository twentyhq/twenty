import {
  checkFields,
  getFieldType,
} from 'src/core/api-rest/utils/metadata-query.utils';
import { objectMetadataItem } from 'src/core/api-rest/utils/__tests__/utils';

describe('MetadataQueryUtils', () => {
  describe('getFieldType', () => {
    it('should get field type', () => {
      expect(getFieldType(objectMetadataItem, 'fieldNumber')).toEqual('NUMBER');
    });
  });

  describe('checkFields', () => {
    it('should check field types', () => {
      expect(() =>
        checkFields(objectMetadataItem, ['fieldNumber']),
      ).not.toThrow();

      expect(() => checkFields(objectMetadataItem, ['wrongField'])).toThrow();

      expect(() =>
        checkFields(objectMetadataItem, ['fieldNumber', 'wrongField']),
      ).toThrow();
    });
  });
});
