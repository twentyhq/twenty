import { ViewFilterOperand } from '@/types/ViewFilterOperand';

import { isRecordFilterValueValid } from '../isRecordFilterValueValid';

describe('isRecordFilterValueValid', () => {
  describe('operands not expecting a value', () => {
    const operandsNotExpectingValue = [
      ViewFilterOperand.IS_NOT_NULL,
      ViewFilterOperand.IS_EMPTY,
      ViewFilterOperand.IS_NOT_EMPTY,
      ViewFilterOperand.IS_IN_PAST,
      ViewFilterOperand.IS_IN_FUTURE,
      ViewFilterOperand.IS_TODAY,
    ];

    it.each(operandsNotExpectingValue)(
      'should return true for %s regardless of value',
      (operand) => {
        expect(isRecordFilterValueValid({ operand, value: '' })).toBe(true);
        expect(
          isRecordFilterValueValid({
            operand,
            value: undefined as unknown as string,
          }),
        ).toBe(true);
        expect(isRecordFilterValueValid({ operand, value: '[]' })).toBe(true);
        expect(isRecordFilterValueValid({ operand, value: 'some-value' })).toBe(
          true,
        );
      },
    );
  });

  describe('operands expecting a value', () => {
    const operandsExpectingValue = [
      ViewFilterOperand.IS,
      ViewFilterOperand.IS_NOT,
      ViewFilterOperand.CONTAINS,
      ViewFilterOperand.DOES_NOT_CONTAIN,
      ViewFilterOperand.GREATER_THAN_OR_EQUAL,
      ViewFilterOperand.LESS_THAN_OR_EQUAL,
      ViewFilterOperand.IS_BEFORE,
      ViewFilterOperand.IS_AFTER,
      ViewFilterOperand.IS_RELATIVE,
    ];

    it.each(operandsExpectingValue)(
      'should return true for %s with a valid value',
      (operand) => {
        expect(isRecordFilterValueValid({ operand, value: 'some-value' })).toBe(
          true,
        );
      },
    );

    it.each(operandsExpectingValue)(
      'should return false for %s with empty string',
      (operand) => {
        expect(isRecordFilterValueValid({ operand, value: '' })).toBe(false);
      },
    );

    it.each(operandsExpectingValue)(
      'should return false for %s with undefined',
      (operand) => {
        expect(
          isRecordFilterValueValid({
            operand,
            value: undefined as unknown as string,
          }),
        ).toBe(false);
      },
    );

    it.each(operandsExpectingValue)(
      'should return false for %s with empty array string "[]"',
      (operand) => {
        expect(isRecordFilterValueValid({ operand, value: '[]' })).toBe(false);
      },
    );
  });

  describe('edge cases', () => {
    it('should return true for "0" as a valid value', () => {
      expect(
        isRecordFilterValueValid({
          operand: ViewFilterOperand.IS,
          value: '0',
        }),
      ).toBe(true);
    });

    it('should return true for "false" as a valid value', () => {
      expect(
        isRecordFilterValueValid({
          operand: ViewFilterOperand.IS,
          value: 'false',
        }),
      ).toBe(true);
    });

    it('should return true for whitespace-only string', () => {
      expect(
        isRecordFilterValueValid({
          operand: ViewFilterOperand.IS,
          value: '   ',
        }),
      ).toBe(true);
    });

    it('should return true for a non-empty array string', () => {
      expect(
        isRecordFilterValueValid({
          operand: ViewFilterOperand.IS,
          value: '["value1","value2"]',
        }),
      ).toBe(true);
    });
  });

  describe('IS_BETWEEN operand', () => {
    it('should return true for valid "min,max" value', () => {
      expect(
        isRecordFilterValueValid({
          operand: ViewFilterOperand.IS_BETWEEN,
          value: '100,500',
        }),
      ).toBe(true);
    });

    it('should return true for decimal range "min,max" value', () => {
      expect(
        isRecordFilterValueValid({
          operand: ViewFilterOperand.IS_BETWEEN,
          value: '1.5,99.99',
        }),
      ).toBe(true);
    });

    it('should return false for empty string', () => {
      expect(
        isRecordFilterValueValid({
          operand: ViewFilterOperand.IS_BETWEEN,
          value: '',
        }),
      ).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(
        isRecordFilterValueValid({
          operand: ViewFilterOperand.IS_BETWEEN,
          value: undefined as unknown as string,
        }),
      ).toBe(false);
    });

    it('should return false when no comma separator', () => {
      expect(
        isRecordFilterValueValid({
          operand: ViewFilterOperand.IS_BETWEEN,
          value: '100',
        }),
      ).toBe(false);
    });

    it('should return false when min is missing', () => {
      expect(
        isRecordFilterValueValid({
          operand: ViewFilterOperand.IS_BETWEEN,
          value: ',500',
        }),
      ).toBe(false);
    });

    it('should return false when max is missing', () => {
      expect(
        isRecordFilterValueValid({
          operand: ViewFilterOperand.IS_BETWEEN,
          value: '100,',
        }),
      ).toBe(false);
    });

    it('should return true when parts are non-numeric strings (e.g. ISO date instants)', () => {
      expect(
        isRecordFilterValueValid({
          operand: ViewFilterOperand.IS_BETWEEN,
          value: '2024-01-01T00:00:00Z,2024-12-31T00:00:00Z',
        }),
      ).toBe(true);
    });
  });
});
