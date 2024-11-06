import { isUuid } from 'src/utils/is-uuid';

describe('isUuid', () => {
  describe('when input is a valid UUID', () => {
    it('should return true for a valid UUID v4', () => {
      expect(isUuid('123e4567-e89b-12d3-a456-426614174000')).toBe(true);
    });

    it('should return true for a UUID with uppercase letters', () => {
      expect(isUuid('123E4567-E89B-12D3-A456-426614174000')).toBe(true);
    });
  });

  describe('when input is not a valid UUID', () => {
    it('should return false for non-string values', () => {
      expect(isUuid(undefined)).toBe(false);
      expect(isUuid(null)).toBe(false);
      expect(isUuid(123)).toBe(false);
      expect(isUuid({})).toBe(false);
      expect(isUuid([])).toBe(false);
    });

    it('should return false for strings with incorrect length', () => {
      expect(isUuid('123')).toBe(false);
      expect(isUuid('123e4567-e89b-12d3-a456-4266141740000')).toBe(false); // too long
      expect(isUuid('123e4567-e89b-12d3-a456-42661417400')).toBe(false); // too short
    });

    it('should return false for strings with incorrect format', () => {
      expect(isUuid('123e4567e89b12d3a456426614174000')).toBe(false); // missing hyphens
      expect(isUuid('123e4567-e89b-12d3-a456_426614174000')).toBe(false); // wrong separator
      expect(isUuid('123e4567-e89b-12d3-a456-42661417400g')).toBe(false); // invalid character
    });

    it('should return false for similar looking strings', () => {
      expect(isUuid('xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx')).toBe(false);
      expect(isUuid('00000000-0000-0000-0000-000000000000')).toBe(true); // valid but all zeros
      expect(isUuid('not-a-uuid-at-all')).toBe(false);
    });

    it('should return false for malformed UUIDs', () => {
      expect(isUuid('-123e4567-e89b-12d3-a456-426614174000')).toBe(false); // extra hyphen
      expect(isUuid('123e4567-e89b--12d3-a456-426614174000')).toBe(false); // double hyphen
      expect(isUuid(' 123e4567-e89b-12d3-a456-426614174000')).toBe(false); // leading space
      expect(isUuid('123e4567-e89b-12d3-a456-426614174000 ')).toBe(false); // trailing space
    });
  });

  describe('edge cases', () => {
    it('should handle empty string', () => {
      expect(isUuid('')).toBe(false);
    });

    it('should handle whitespace strings', () => {
      expect(isUuid('   ')).toBe(false);
    });

    it('should return true for valid UUIDs with different versions', () => {
      // Different valid UUID versions should all return true
      expect(isUuid('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
      expect(isUuid('6ba7b810-9dad-11d1-80b4-00c04fd430c8')).toBe(true);
      expect(isUuid('6ba7b810-9dad-31d1-80b4-00c04fd430c8')).toBe(true);
    });
  });
});
