import { arrayOfUuidOrVariableSchema } from '../validation-schemas/arrayOfUuidsOrVariablesSchema';

describe('arrayOfUuidOrVariableSchema', () => {
  describe('UUID validation', () => {
    it('should accept valid UUIDs', () => {
      const validUuids = [
        '123e4567-e89b-12d3-a456-426614174000',
        '550e8400-e29b-41d4-a716-446655440000',
      ];

      validUuids.forEach((uuid) => {
        // Test as single value
        const singleResult = arrayOfUuidOrVariableSchema.safeParse(uuid);
        expect(singleResult.success).toBe(true);
        if (singleResult.success) {
          expect(singleResult.data).toEqual([uuid]);
        }

        // Test as array
        const arrayResult = arrayOfUuidOrVariableSchema.safeParse([uuid]);
        expect(arrayResult.success).toBe(true);
        if (arrayResult.success) {
          expect(arrayResult.data).toEqual([uuid]);
        }
      });
    });

    it('should return empty array for invalid UUIDs', () => {
      const invalidUuids = [
        'invalid-uuid',
        '12345',
        '550e8400e29b41d4a716446655440000',
        '',
        '123e4567-e89b-12d3-a456-42661417400-',
      ];

      invalidUuids.forEach((uuid) => {
        // Test as single value
        const singleResult = arrayOfUuidOrVariableSchema.safeParse(uuid);
        expect(singleResult.success).toBe(true);
        if (singleResult.success) {
          expect(singleResult.data).toEqual([]);
        }

        // Test as array
        const arrayResult = arrayOfUuidOrVariableSchema.safeParse([uuid]);
        expect(arrayResult.success).toBe(true);
        if (arrayResult.success) {
          expect(arrayResult.data).toEqual([]);
        }
      });
    });
  });

  describe('Variable syntax validation', () => {
    it('should accept valid variable syntax', () => {
      const validVariables = [
        '{{variable}}',
        '{{user.id}}',
        '{{company.name}}',
      ];

      validVariables.forEach((variable) => {
        // Test as single value
        const singleResult = arrayOfUuidOrVariableSchema.safeParse(variable);
        expect(singleResult.success).toBe(true);
        if (singleResult.success) {
          expect(singleResult.data).toEqual([variable]);
        }

        // Test as array
        const arrayResult = arrayOfUuidOrVariableSchema.safeParse([variable]);
        expect(arrayResult.success).toBe(true);
        if (arrayResult.success) {
          expect(arrayResult.data).toEqual([variable]);
        }
      });
    });

    it('should return empty array for invalid variable syntax', () => {
      const invalidVariables = ['{{variable', 'variable}}', '{{}}', '{{', '}}'];

      invalidVariables.forEach((variable) => {
        // Test as single value
        const singleResult = arrayOfUuidOrVariableSchema.safeParse(variable);
        expect(singleResult.success).toBe(true);
        if (singleResult.success) {
          expect(singleResult.data).toEqual([]);
        }

        // Test as array
        const arrayResult = arrayOfUuidOrVariableSchema.safeParse([variable]);
        expect(arrayResult.success).toBe(true);
        if (arrayResult.success) {
          expect(arrayResult.data).toEqual([]);
        }
      });
    });
  });

  describe('Input type handling', () => {
    it('should handle string input with valid JSON', () => {
      const input = JSON.stringify(['123e4567-e89b-12d3-a456-426614174000']);
      const result = arrayOfUuidOrVariableSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(['123e4567-e89b-12d3-a456-426614174000']);
      }
    });

    it('should handle string input with variables', () => {
      const input = '{{variable}}';
      const result = arrayOfUuidOrVariableSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(['{{variable}}']);
      }
    });

    it('should handle array input directly', () => {
      const input = ['123e4567-e89b-12d3-a456-426614174000', '{{variable}}'];
      const result = arrayOfUuidOrVariableSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(input);
      }
    });

    it('should handle single value input', () => {
      const input = '20202020-0687-4c41-b707-ed1bfca972a7';
      const result = arrayOfUuidOrVariableSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual([input]);
      }
    });
  });

  describe('Error handling', () => {
    it('should return empty array for invalid JSON string', () => {
      const input = 'invalid-json';
      const result = arrayOfUuidOrVariableSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual([]);
      }
    });

    it('should return empty array for non-string, non-array input', () => {
      const inputs = [null, undefined, 123, true, {}];
      inputs.forEach((input) => {
        const result = arrayOfUuidOrVariableSchema.safeParse(input);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toEqual([]);
        }
      });
    });

    it('should return empty array for array with invalid values', () => {
      const input = ['invalid-uuid', 'not-a-variable'];
      const result = arrayOfUuidOrVariableSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual([]);
      }
    });
  });
});
