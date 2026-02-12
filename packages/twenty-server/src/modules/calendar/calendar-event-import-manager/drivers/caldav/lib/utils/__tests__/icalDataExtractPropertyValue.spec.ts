import { icalDataExtractPropertyValue } from 'src/modules/calendar/calendar-event-import-manager/drivers/caldav/lib/utils/icalDataExtractPropertyValue';

describe('icalDataExtractPropertyValue', () => {
  describe('properties with parameters (RFC 5545 Section 3.2)', () => {
    it('should extract value from property object with val and params', () => {
      const property = {
        val: 'Meeting Title',
        params: { LANGUAGE: 'en-US' },
      };

      const result = icalDataExtractPropertyValue(property);

      expect(result).toBe('Meeting Title');
    });

    it('should handle property with val but no params', () => {
      const property = {
        val: 'Conference Room A',
      };

      const result = icalDataExtractPropertyValue(property);

      expect(result).toBe('Conference Room A');
    });

    it('should convert non-string val to string', () => {
      const property = {
        val: 12345,
        params: { TYPE: 'INTEGER' },
      } as any;

      const result = icalDataExtractPropertyValue(property);

      expect(result).toBe('12345');
    });

    it('should handle property with empty string val', () => {
      const property = {
        val: '',
        params: { LANGUAGE: 'de-DE' },
      };

      const result = icalDataExtractPropertyValue(property, 'default');

      expect(result).toBe('');
    });
  });

  describe('multiple values in a single property (RFC 5545 Section 3.1.2)', () => {
    it('should join multiple string values with comma and space', () => {
      const property = ['Value 1', 'Value 2', 'Value 3'] as any;

      const result = icalDataExtractPropertyValue(property);

      expect(result).toBe('Value 1, Value 2, Value 3');
    });

    it('should handle array of property objects with val', () => {
      const property = [
        { val: 'First Value', params: { LANGUAGE: 'en' } },
        { val: 'Second Value', params: { LANGUAGE: 'fr' } },
      ] as any;

      const result = icalDataExtractPropertyValue(property);

      expect(result).toBe('First Value, Second Value');
    });

    it('should filter out empty values from array', () => {
      const property = ['Value 1', '', 'Value 3', { val: '' }] as any;

      const result = icalDataExtractPropertyValue(property);

      expect(result).toBe('Value 1, Value 3');
    });

    it('should return default value when array contains only empty values', () => {
      const property = ['', { val: '' }, null] as any;

      const result = icalDataExtractPropertyValue(property, 'No values');

      expect(result).toBe('No values');
    });

    it('should handle mixed array of strings and objects', () => {
      const property = [
        'Plain String',
        { val: 'Object Value', params: {} },
        'Another String',
      ] as any;

      const result = icalDataExtractPropertyValue(property);

      expect(result).toBe('Plain String, Object Value, Another String');
    });
  });
});
