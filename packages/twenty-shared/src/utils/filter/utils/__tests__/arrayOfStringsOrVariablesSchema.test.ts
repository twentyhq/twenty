import { arrayOfStringsOrVariablesSchema } from '@/utils/filter/utils/validation-schemas/arrayOfStringsOrVariablesSchema';

describe('arrayOfStringsOrVariablesSchema', () => {
  describe('Empty value handling', () => {
    it('should return empty array for empty string', () => {
      const result = arrayOfStringsOrVariablesSchema.safeParse('');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual([]);
      }
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
        const result = arrayOfStringsOrVariablesSchema.safeParse(variable);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toEqual([variable]);
        }
      });
    });
  });

  describe('JSON array handling', () => {
    it('should accept valid JSON array of strings', () => {
      const validArrays = [
        JSON.stringify(['value1', 'value2']),
        JSON.stringify(['{{variable1}}', '{{variable2}}']),
        JSON.stringify(['value1', '{{variable2}}']),
      ];

      validArrays.forEach((array) => {
        const result = arrayOfStringsOrVariablesSchema.safeParse(array);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toEqual(JSON.parse(array));
        }
      });
    });
    it('should reject JSON array with non-string values', () => {
      const invalidArrays = [
        JSON.stringify([1, 2, 3]),
        JSON.stringify([true, false]),
        JSON.stringify([null]),
        JSON.stringify([{}]),
        JSON.stringify([[]]),
      ];

      invalidArrays.forEach((array) => {
        const result = arrayOfStringsOrVariablesSchema.safeParse(array);
        expect(result.success).toBe(false);
      });
    });
  });

  describe('Edge cases', () => {
    it('should handle whitespace in variable syntax', () => {
      const result =
        arrayOfStringsOrVariablesSchema.safeParse('{{ variable }}');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(['{{ variable }}']);
      }
    });

    it('should handle nested variables in JSON array', () => {
      const input = JSON.stringify(['{{outer.{{inner}}}}']);
      const result = arrayOfStringsOrVariablesSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(['{{outer.{{inner}}}}']);
      }
    });

    it('should handle empty array in JSON', () => {
      const result = arrayOfStringsOrVariablesSchema.safeParse('[]');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual([]);
      }
    });
  });
});
