import { parseDataFromContentType } from '@/workflow/utils/parseDataFromContentType';

describe('parseDataFromContentType', () => {
  describe('application/json', () => {
    it('should stringify object data', () => {
      const result = parseDataFromContentType(
        { key: 'value' },
        'application/json',
      );

      expect(result).toBe('{"key":"value"}');
    });

    it('should return string data as-is', () => {
      const result = parseDataFromContentType(
        '{"key":"value"}',
        'application/json',
      );

      expect(result).toBe('{"key":"value"}');
    });
  });

  describe('text/plain', () => {
    it('should return string data as-is', () => {
      const result = parseDataFromContentType('hello', 'text/plain');

      expect(result).toBe('hello');
    });

    it('should convert object to key=val format', () => {
      const result = parseDataFromContentType(
        { name: 'Alice', age: '30' },
        'text/plain',
      );

      expect(result).toContain('name=Alice');
      expect(result).toContain('age=30');
    });
  });

  describe('application/x-www-form-urlencoded', () => {
    it('should convert object to URL-encoded format', () => {
      const result = parseDataFromContentType(
        { key: 'value', foo: 'bar' },
        'application/x-www-form-urlencoded',
      );

      expect(result).toContain('key=value');
      expect(result).toContain('foo=bar');
    });

    it('should parse JSON string data', () => {
      const result = parseDataFromContentType(
        '{"key":"value"}',
        'application/x-www-form-urlencoded',
      );

      expect(result).toContain('key=value');
    });

    it('should handle non-JSON string data', () => {
      const result = parseDataFromContentType(
        'raw-string',
        'application/x-www-form-urlencoded',
      );

      expect(typeof result).toBe('string');
    });
  });

  describe('multipart/form-data', () => {
    it('should return FormData for object data', () => {
      const result = parseDataFromContentType(
        { key: 'value' },
        'multipart/form-data',
      );

      expect(result).toBeInstanceOf(FormData);
    });

    it('should parse JSON string into FormData', () => {
      const result = parseDataFromContentType(
        '{"key":"value"}',
        'multipart/form-data',
      );

      expect(result).toBeInstanceOf(FormData);
    });

    it('should throw for invalid JSON string', () => {
      expect(() =>
        parseDataFromContentType('not-json', 'multipart/form-data'),
      ).toThrow('String data for FormData must be valid JSON');
    });
  });

  describe('default (no content type)', () => {
    it('should default to JSON parsing when content type is undefined', () => {
      const result = parseDataFromContentType({ key: 'value' });

      expect(result).toBe('{"key":"value"}');
    });
  });

  describe('unknown content type', () => {
    it('should default to JSON parsing', () => {
      const result = parseDataFromContentType(
        { key: 'value' },
        'application/xml',
      );

      expect(result).toBe('{"key":"value"}');
    });
  });
});
