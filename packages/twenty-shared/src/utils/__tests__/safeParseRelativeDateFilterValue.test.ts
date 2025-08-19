import { safeParseRelativeDateFilterValue } from '../safeParseRelativeDateFilterValue';

describe('safeParseRelativeDateFilterValue', () => {
  describe('valid inputs', () => {
    describe('NEXT direction', () => {
      it('should parse NEXT direction with DAY unit', () => {
        const input = JSON.stringify({
          direction: 'NEXT',
          amount: 3,
          unit: 'DAY',
        });

        const result = safeParseRelativeDateFilterValue(input);

        expect(result).toEqual({
          direction: 'NEXT',
          amount: 3,
          unit: 'DAY',
        });
      });

      it('should parse NEXT direction with WEEK unit', () => {
        const input = JSON.stringify({
          direction: 'NEXT',
          amount: 2,
          unit: 'WEEK',
        });

        const result = safeParseRelativeDateFilterValue(input);

        expect(result).toEqual({
          direction: 'NEXT',
          amount: 2,
          unit: 'WEEK',
        });
      });

      it('should parse NEXT direction with MONTH unit', () => {
        const input = JSON.stringify({
          direction: 'NEXT',
          amount: 1,
          unit: 'MONTH',
        });

        const result = safeParseRelativeDateFilterValue(input);

        expect(result).toEqual({
          direction: 'NEXT',
          amount: 1,
          unit: 'MONTH',
        });
      });

      it('should parse NEXT direction with YEAR unit', () => {
        const input = JSON.stringify({
          direction: 'NEXT',
          amount: 5,
          unit: 'YEAR',
        });

        const result = safeParseRelativeDateFilterValue(input);

        expect(result).toEqual({
          direction: 'NEXT',
          amount: 5,
          unit: 'YEAR',
        });
      });
    });

    describe('PAST direction', () => {
      it('should parse PAST direction with DAY unit', () => {
        const input = JSON.stringify({
          direction: 'PAST',
          amount: 7,
          unit: 'DAY',
        });

        const result = safeParseRelativeDateFilterValue(input);

        expect(result).toEqual({
          direction: 'PAST',
          amount: 7,
          unit: 'DAY',
        });
      });

      it('should parse PAST direction with WEEK unit', () => {
        const input = JSON.stringify({
          direction: 'PAST',
          amount: 3,
          unit: 'WEEK',
        });

        const result = safeParseRelativeDateFilterValue(input);

        expect(result).toEqual({
          direction: 'PAST',
          amount: 3,
          unit: 'WEEK',
        });
      });

      it('should parse PAST direction with MONTH unit', () => {
        const input = JSON.stringify({
          direction: 'PAST',
          amount: 6,
          unit: 'MONTH',
        });

        const result = safeParseRelativeDateFilterValue(input);

        expect(result).toEqual({
          direction: 'PAST',
          amount: 6,
          unit: 'MONTH',
        });
      });

      it('should parse PAST direction with YEAR unit', () => {
        const input = JSON.stringify({
          direction: 'PAST',
          amount: 2,
          unit: 'YEAR',
        });

        const result = safeParseRelativeDateFilterValue(input);

        expect(result).toEqual({
          direction: 'PAST',
          amount: 2,
          unit: 'YEAR',
        });
      });
    });

    describe('THIS direction', () => {
      it('should parse THIS direction with DAY unit (no amount)', () => {
        const input = JSON.stringify({
          direction: 'THIS',
          unit: 'DAY',
        });

        const result = safeParseRelativeDateFilterValue(input);

        expect(result).toEqual({
          direction: 'THIS',
          unit: 'DAY',
        });
      });

      it('should parse THIS direction with WEEK unit (no amount)', () => {
        const input = JSON.stringify({
          direction: 'THIS',
          unit: 'WEEK',
        });

        const result = safeParseRelativeDateFilterValue(input);

        expect(result).toEqual({
          direction: 'THIS',
          unit: 'WEEK',
        });
      });

      it('should parse THIS direction with MONTH unit (no amount)', () => {
        const input = JSON.stringify({
          direction: 'THIS',
          unit: 'MONTH',
        });

        const result = safeParseRelativeDateFilterValue(input);

        expect(result).toEqual({
          direction: 'THIS',
          unit: 'MONTH',
        });
      });

      it('should parse THIS direction with YEAR unit (no amount)', () => {
        const input = JSON.stringify({
          direction: 'THIS',
          unit: 'YEAR',
        });

        const result = safeParseRelativeDateFilterValue(input);

        expect(result).toEqual({
          direction: 'THIS',
          unit: 'YEAR',
        });
      });

      it('should parse THIS direction with undefined amount explicitly', () => {
        const input = JSON.stringify({
          direction: 'THIS',
          unit: 'DAY',
          amount: undefined,
        });

        const result = safeParseRelativeDateFilterValue(input);

        expect(result).toEqual({
          direction: 'THIS',
          unit: 'DAY',
        });
      });
    });
  });

  describe('invalid inputs', () => {
    describe('JSON parsing errors', () => {
      it('should return undefined for invalid JSON', () => {
        const result = safeParseRelativeDateFilterValue('invalid json');
        expect(result).toBeUndefined();
      });

      it('should return undefined for empty string', () => {
        const result = safeParseRelativeDateFilterValue('');
        expect(result).toBeUndefined();
      });

      it('should return undefined for unclosed JSON', () => {
        const result = safeParseRelativeDateFilterValue('{"direction": "NEXT"');
        expect(result).toBeUndefined();
      });
    });

    describe('schema validation errors', () => {
      it('should return undefined for missing direction', () => {
        const input = JSON.stringify({
          amount: 1,
          unit: 'DAY',
        });

        const result = safeParseRelativeDateFilterValue(input);
        expect(result).toBeUndefined();
      });

      it('should return undefined for missing unit', () => {
        const input = JSON.stringify({
          direction: 'NEXT',
          amount: 1,
        });

        const result = safeParseRelativeDateFilterValue(input);
        expect(result).toBeUndefined();
      });

      it('should return undefined for invalid direction', () => {
        const input = JSON.stringify({
          direction: 'INVALID',
          amount: 1,
          unit: 'DAY',
        });

        const result = safeParseRelativeDateFilterValue(input);
        expect(result).toBeUndefined();
      });

      it('should return undefined for invalid unit', () => {
        const input = JSON.stringify({
          direction: 'NEXT',
          amount: 1,
          unit: 'HOUR',
        });

        const result = safeParseRelativeDateFilterValue(input);
        expect(result).toBeUndefined();
      });

      it('should return undefined for NEXT direction without amount', () => {
        const input = JSON.stringify({
          direction: 'NEXT',
          unit: 'DAY',
        });

        const result = safeParseRelativeDateFilterValue(input);
        expect(result).toBeUndefined();
      });

      it('should return undefined for PAST direction without amount', () => {
        const input = JSON.stringify({
          direction: 'PAST',
          unit: 'DAY',
        });

        const result = safeParseRelativeDateFilterValue(input);
        expect(result).toBeUndefined();
      });

      it('should return undefined for NEXT direction with zero amount', () => {
        const input = JSON.stringify({
          direction: 'NEXT',
          amount: 0,
          unit: 'DAY',
        });

        const result = safeParseRelativeDateFilterValue(input);
        expect(result).toBeUndefined();
      });

      it('should return undefined for PAST direction with negative amount', () => {
        const input = JSON.stringify({
          direction: 'PAST',
          amount: -1,
          unit: 'DAY',
        });

        const result = safeParseRelativeDateFilterValue(input);
        expect(result).toBeUndefined();
      });

      it('should return undefined for NEXT direction with string amount', () => {
        const input = JSON.stringify({
          direction: 'NEXT',
          amount: '1',
          unit: 'DAY',
        });

        const result = safeParseRelativeDateFilterValue(input);
        expect(result).toBeUndefined();
      });

      it('should return undefined for non-object input', () => {
        const result = safeParseRelativeDateFilterValue('"string"');
        expect(result).toBeUndefined();
      });

      it('should return undefined for array input', () => {
        const result = safeParseRelativeDateFilterValue('[1, 2, 3]');
        expect(result).toBeUndefined();
      });

      it('should return undefined for null input', () => {
        const result = safeParseRelativeDateFilterValue('null');
        expect(result).toBeUndefined();
      });

      it('should return undefined for boolean input', () => {
        const result = safeParseRelativeDateFilterValue('true');
        expect(result).toBeUndefined();
      });

      it('should return undefined for number input', () => {
        const result = safeParseRelativeDateFilterValue('123');
        expect(result).toBeUndefined();
      });
    });

    describe('edge cases', () => {
      it('should return undefined for NEXT direction with decimal amount', () => {
        const input = JSON.stringify({
          direction: 'NEXT',
          amount: 1.5,
          unit: 'DAY',
        });

        const result = safeParseRelativeDateFilterValue(input);
        expect(result).toEqual({
          direction: 'NEXT',
          amount: 1.5,
          unit: 'DAY',
        });
      });

      it('should return undefined for object with extra properties', () => {
        const input = JSON.stringify({
          direction: 'NEXT',
          amount: 1,
          unit: 'DAY',
          extraProperty: 'should be ignored',
        });

        const result = safeParseRelativeDateFilterValue(input);
        expect(result).toEqual({
          direction: 'NEXT',
          amount: 1,
          unit: 'DAY',
        });
      });

      it('should return undefined for empty object', () => {
        const input = JSON.stringify({});

        const result = safeParseRelativeDateFilterValue(input);
        expect(result).toBeUndefined();
      });

      it('should return undefined for THIS direction with amount', () => {
        const input = JSON.stringify({
          direction: 'THIS',
          amount: 1,
          unit: 'DAY',
        });

        // THIS direction should work with amount present, as the schema allows it
        const result = safeParseRelativeDateFilterValue(input);
        expect(result).toEqual({
          direction: 'THIS',
          amount: 1,
          unit: 'DAY',
        });
      });

      it('should handle very large amounts', () => {
        const input = JSON.stringify({
          direction: 'NEXT',
          amount: 999999,
          unit: 'DAY',
        });

        const result = safeParseRelativeDateFilterValue(input);
        expect(result).toEqual({
          direction: 'NEXT',
          amount: 999999,
          unit: 'DAY',
        });
      });
    });
  });
});