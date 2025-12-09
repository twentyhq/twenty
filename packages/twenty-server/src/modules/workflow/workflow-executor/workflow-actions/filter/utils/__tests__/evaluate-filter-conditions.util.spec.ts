import {
  type StepFilter,
  type StepFilterGroup,
  StepLogicalOperator,
  ViewFilterOperand,
} from 'twenty-shared/types';

import { evaluateFilterConditions } from 'src/modules/workflow/workflow-executor/workflow-actions/filter/utils/evaluate-filter-conditions.util';

describe('evaluateFilterConditions', () => {
  type ResolvedFilter = Omit<StepFilter, 'value' | 'stepOutputKey'> & {
    rightOperand: unknown;
    leftOperand: unknown;
  };

  const createFilter = (
    operand: ViewFilterOperand,
    leftOperand: unknown,
    rightOperand: unknown,
    type = 'TEXT',
  ): ResolvedFilter => ({
    id: 'filter1',
    type: type,
    rightOperand,
    operand,
    stepFilterGroupId: 'group1',
    leftOperand,
  });

  describe('empty inputs', () => {
    it('should return true when no filters or groups are provided', () => {
      const result = evaluateFilterConditions({
        filterGroups: [],
        filters: [],
      });

      expect(result).toBe(true);
    });

    it('should return true when inputs are undefined', () => {
      const result = evaluateFilterConditions({});

      expect(result).toBe(true);
    });
  });

  describe('single filter operands', () => {
    describe('Relation/UUID filter operands', () => {
      it('should return true when values are equal (RELATION)', () => {
        const filter = createFilter(
          ViewFilterOperand.IS,
          'John',
          'John',
          'RELATION',
        );
        const result = evaluateFilterConditions({ filters: [filter] });

        expect(result).toBe(true);
      });

      it('should return false when values are not equal (RELATION)', () => {
        const filter = createFilter(
          ViewFilterOperand.IS,
          'John',
          'Jane',
          'RELATION',
        );
        const result = evaluateFilterConditions({ filters: [filter] });

        expect(result).toBe(false);
      });

      it('should return false when values are equal (IsNot RELATION)', () => {
        const filter = createFilter(
          ViewFilterOperand.IS_NOT,
          'John',
          'John',
          'RELATION',
        );
        const result = evaluateFilterConditions({ filters: [filter] });

        expect(result).toBe(false);
      });

      it('should return true when values are not equal (IsNot RELATION)', () => {
        const filter = createFilter(
          ViewFilterOperand.IS_NOT,
          'John',
          'Jane',
          'RELATION',
        );
        const result = evaluateFilterConditions({ filters: [filter] });

        expect(result).toBe(true);
      });

      // Enhanced relation filter tests with object id extraction
      it('should extract id from left operand object for relation comparison', () => {
        const uuid1 = '550e8400-e29b-41d4-a716-446655440000';
        const leftObject = { id: uuid1, name: 'John Doe' };
        const rightValue = uuid1;

        const filter = createFilter(
          ViewFilterOperand.IS,
          leftObject,
          rightValue,
          'RELATION',
        );
        const result = evaluateFilterConditions({ filters: [filter] });

        expect(result).toBe(true);
      });

      it('should extract id from right operand object for relation comparison', () => {
        const uuid1 = '550e8400-e29b-41d4-a716-446655440000';
        const leftValue = uuid1;
        const rightObject = { id: uuid1, name: 'John Doe' };

        const filter = createFilter(
          ViewFilterOperand.IS,
          leftValue,
          rightObject,
          'RELATION',
        );
        const result = evaluateFilterConditions({ filters: [filter] });

        expect(result).toBe(true);
      });

      it('should extract id from both operands when they are objects for relation comparison', () => {
        const uuid1 = '550e8400-e29b-41d4-a716-446655440000';
        const leftObject = { id: uuid1, name: 'John Doe' };
        const rightObject = { id: uuid1, title: 'Admin' };

        const filter = createFilter(
          ViewFilterOperand.IS,
          leftObject,
          rightObject,
          'RELATION',
        );
        const result = evaluateFilterConditions({ filters: [filter] });

        expect(result).toBe(true);
      });

      it('should return false when extracted ids do not match for relation comparison', () => {
        const uuid1 = '550e8400-e29b-41d4-a716-446655440000';
        const uuid2 = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
        const leftObject = { id: uuid1, name: 'John Doe' };
        const rightObject = { id: uuid2, name: 'Jane Smith' };

        const filter = createFilter(
          ViewFilterOperand.IS,
          leftObject,
          rightObject,
          'RELATION',
        );
        const result = evaluateFilterConditions({ filters: [filter] });

        expect(result).toBe(false);
      });

      it('should handle IsNot with object id extraction for relation comparison', () => {
        const uuid1 = '550e8400-e29b-41d4-a716-446655440000';
        const uuid2 = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
        const leftObject = { id: uuid1, name: 'John Doe' };
        const rightObject = { id: uuid2, name: 'Jane Smith' };

        const filter = createFilter(
          ViewFilterOperand.IS_NOT,
          leftObject,
          rightObject,
          'RELATION',
        );
        const result = evaluateFilterConditions({ filters: [filter] });

        expect(result).toBe(true);
      });

      it('should handle objects without id property for relation comparison', () => {
        const leftObject = { name: 'John Doe' };
        const rightObject = { name: 'John Doe' };

        const filter = createFilter(
          ViewFilterOperand.IS,
          leftObject,
          rightObject,
          'RELATION',
        );
        const result = evaluateFilterConditions({ filters: [filter] });

        expect(result).toBe(false); // Objects are different references
      });

      it('should throw error for unsupported relation filter operand', () => {
        const uuid1 = '550e8400-e29b-41d4-a716-446655440000';
        const uuid2 = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
        const filter = createFilter(
          ViewFilterOperand.CONTAINS,
          uuid1,
          uuid2,
          'RELATION',
        );

        expect(() => evaluateFilterConditions({ filters: [filter] })).toThrow(
          'Operand CONTAINS not supported for relation filter',
        );
      });
    });

    describe('UUID filter operands', () => {
      const uuid1 = '550e8400-e29b-41d4-a716-446655440000';
      const uuid2 = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';

      it('should return true when UUIDs are equal (Is)', () => {
        const filter = createFilter(ViewFilterOperand.IS, uuid1, uuid1, 'UUID');
        const result = evaluateFilterConditions({ filters: [filter] });

        expect(result).toBe(true);
      });

      it('should return false when UUIDs are not equal (Is)', () => {
        const filter = createFilter(ViewFilterOperand.IS, uuid1, uuid2, 'UUID');
        const result = evaluateFilterConditions({ filters: [filter] });

        expect(result).toBe(false);
      });

      it('should return false when UUIDs are equal (IsNot)', () => {
        const filter = createFilter(
          ViewFilterOperand.IS_NOT,
          uuid1,
          uuid1,
          'UUID',
        );
        const result = evaluateFilterConditions({ filters: [filter] });

        expect(result).toBe(false);
      });

      it('should return true when UUIDs are not equal (IsNot)', () => {
        const filter = createFilter(
          ViewFilterOperand.IS_NOT,
          uuid1,
          uuid2,
          'UUID',
        );
        const result = evaluateFilterConditions({ filters: [filter] });

        expect(result).toBe(true);
      });

      it('should handle null/undefined UUIDs with Is operand', () => {
        const filter1 = createFilter(ViewFilterOperand.IS, null, null, 'UUID');
        const filter2 = createFilter(
          ViewFilterOperand.IS,
          undefined,
          undefined,
          'UUID',
        );
        const filter3 = createFilter(ViewFilterOperand.IS, uuid1, null, 'UUID');

        expect(evaluateFilterConditions({ filters: [filter1] })).toBe(true);
        expect(evaluateFilterConditions({ filters: [filter2] })).toBe(true);
        expect(evaluateFilterConditions({ filters: [filter3] })).toBe(false);
      });

      it('should handle null/undefined UUIDs with IsNot operand', () => {
        const filter1 = createFilter(
          ViewFilterOperand.IS_NOT,
          null,
          null,
          'UUID',
        );
        const filter2 = createFilter(
          ViewFilterOperand.IS_NOT,
          undefined,
          undefined,
          'UUID',
        );
        const filter3 = createFilter(
          ViewFilterOperand.IS_NOT,
          uuid1,
          null,
          'UUID',
        );

        expect(evaluateFilterConditions({ filters: [filter1] })).toBe(false);
        expect(evaluateFilterConditions({ filters: [filter2] })).toBe(false);
        expect(evaluateFilterConditions({ filters: [filter3] })).toBe(true);
      });

      it('should handle empty string UUIDs', () => {
        const filter1 = createFilter(ViewFilterOperand.IS, '', '', 'UUID');
        const filter2 = createFilter(ViewFilterOperand.IS, uuid1, '', 'UUID');

        expect(evaluateFilterConditions({ filters: [filter1] })).toBe(true);
        expect(evaluateFilterConditions({ filters: [filter2] })).toBe(false);
      });

      it('should throw error for unsupported UUID filter operand', () => {
        const filter = createFilter(
          ViewFilterOperand.CONTAINS,
          uuid1,
          uuid2,
          'UUID',
        );

        expect(() => evaluateFilterConditions({ filters: [filter] })).toThrow(
          'Operand CONTAINS not supported for uuid filter',
        );
      });
    });

    describe('Select filter operands', () => {
      it('should return true when there are common values (SELECT)', () => {
        const filter = createFilter(
          ViewFilterOperand.IS,
          ['John'],
          ['John', 'Jane'],
          'SELECT',
        );
        const result = evaluateFilterConditions({ filters: [filter] });

        expect(result).toBe(true);
      });

      it('should return false when there are no common values (SELECT)', () => {
        const filter = createFilter(
          ViewFilterOperand.IS,
          ['John'],
          ['Jane'],
          'SELECT',
        );
        const result = evaluateFilterConditions({ filters: [filter] });

        expect(result).toBe(false);
      });

      it('should return true when there are no common values (IsNot)', () => {
        const filter = createFilter(
          ViewFilterOperand.IS_NOT,
          ['John'],
          ['Jane'],
          'SELECT',
        );
        const result = evaluateFilterConditions({ filters: [filter] });

        expect(result).toBe(true);
      });

      it('should return true when there are no values (IsEmpty)', () => {
        const filter = createFilter(
          ViewFilterOperand.IS_EMPTY,
          [],
          '',
          'SELECT',
        );
        const result = evaluateFilterConditions({ filters: [filter] });

        expect(result).toBe(true);
      });

      it('should return false when there is a value (IsEmpty)', () => {
        const filter = createFilter(
          ViewFilterOperand.IS_EMPTY,
          ['John'],
          '',
          'SELECT',
        );
        const result = evaluateFilterConditions({ filters: [filter] });

        expect(result).toBe(false);
      });

      it('should return true when there are values (IsNotEmpty)', () => {
        const filter = createFilter(
          ViewFilterOperand.IS_NOT_EMPTY,
          ['John'],
          '',
          'SELECT',
        );
        const result = evaluateFilterConditions({ filters: [filter] });

        expect(result).toBe(true);
      });
    });

    describe('Boolean filter operands', () => {
      it('should return true when boolean values are equal', () => {
        const filter = createFilter(
          ViewFilterOperand.IS,
          true,
          true,
          'BOOLEAN',
        );
        const result = evaluateFilterConditions({ filters: [filter] });

        expect(result).toBe(true);
      });

      it('should return false when boolean values are not equal', () => {
        const filter = createFilter(
          ViewFilterOperand.IS,
          true,
          false,
          'BOOLEAN',
        );
        const result = evaluateFilterConditions({ filters: [filter] });

        expect(result).toBe(false);
      });

      it('should handle truthy/falsy conversion', () => {
        const filter = createFilter(
          ViewFilterOperand.IS,
          'true',
          true,
          'BOOLEAN',
        );
        const result = evaluateFilterConditions({ filters: [filter] });

        expect(result).toBe(true);
      });
    });

    describe('numeric operands', () => {
      it('should handle GreaterThanOrEqual operand correctly', () => {
        const filter1 = createFilter(
          ViewFilterOperand.GREATER_THAN_OR_EQUAL,
          25,
          25,
          'NUMBER',
        );
        const filter2 = createFilter(
          ViewFilterOperand.GREATER_THAN_OR_EQUAL,
          30,
          25,
          'NUMBER',
        );
        const filter3 = createFilter(
          ViewFilterOperand.GREATER_THAN_OR_EQUAL,
          20,
          25,
          'NUMBER',
        );

        expect(evaluateFilterConditions({ filters: [filter1] })).toBe(true);
        expect(evaluateFilterConditions({ filters: [filter2] })).toBe(true);
        expect(evaluateFilterConditions({ filters: [filter3] })).toBe(false);
      });

      it('should handle LessThanOrEqual operand correctly', () => {
        const filter1 = createFilter(
          ViewFilterOperand.LESS_THAN_OR_EQUAL,
          25,
          25,
          'NUMBER',
        );
        const filter2 = createFilter(
          ViewFilterOperand.LESS_THAN_OR_EQUAL,
          20,
          25,
          'NUMBER',
        );
        const filter3 = createFilter(
          ViewFilterOperand.LESS_THAN_OR_EQUAL,
          30,
          25,
          'NUMBER',
        );

        expect(evaluateFilterConditions({ filters: [filter1] })).toBe(true);
        expect(evaluateFilterConditions({ filters: [filter2] })).toBe(true);
        expect(evaluateFilterConditions({ filters: [filter3] })).toBe(false);
      });

      it('should handle Is operand correctly', () => {
        const filter1 = createFilter(ViewFilterOperand.IS, 25, 25, 'NUMBER');
        const filter2 = createFilter(ViewFilterOperand.IS, 20, 25, 'NUMBER');
        const filter3 = createFilter(ViewFilterOperand.IS, 30, 25, 'NUMBER');

        expect(evaluateFilterConditions({ filters: [filter1] })).toBe(true);
        expect(evaluateFilterConditions({ filters: [filter2] })).toBe(false);
        expect(evaluateFilterConditions({ filters: [filter3] })).toBe(false);
      });

      it('should handle IsNot operand correctly', () => {
        const filter1 = createFilter(
          ViewFilterOperand.IS_NOT,
          25,
          25,
          'NUMBER',
        );
        const filter2 = createFilter(
          ViewFilterOperand.IS_NOT,
          20,
          25,
          'NUMBER',
        );
        const filter3 = createFilter(
          ViewFilterOperand.IS_NOT,
          30,
          25,
          'NUMBER',
        );

        expect(evaluateFilterConditions({ filters: [filter1] })).toBe(false);
        expect(evaluateFilterConditions({ filters: [filter2] })).toBe(true);
        expect(evaluateFilterConditions({ filters: [filter3] })).toBe(true);
      });
    });

    describe('string and array operands', () => {
      it('should handle Contains operand with strings', () => {
        const filter1 = createFilter(
          ViewFilterOperand.CONTAINS,
          'Hello World',
          'World',
          'TEXT',
        );
        const filter2 = createFilter(
          ViewFilterOperand.CONTAINS,
          'Hello',
          'World',
          'TEXT',
        );

        const filter3 = createFilter(
          ViewFilterOperand.CONTAINS,
          null,
          '',
          'TEXT',
        );

        const filter4 = createFilter(
          ViewFilterOperand.CONTAINS,
          '',
          null,
          'TEXT',
        );

        expect(evaluateFilterConditions({ filters: [filter1] })).toBe(true);
        expect(evaluateFilterConditions({ filters: [filter2] })).toBe(false);
        expect(evaluateFilterConditions({ filters: [filter3] })).toBe(true);
        expect(evaluateFilterConditions({ filters: [filter4] })).toBe(true);
      });

      it('should handle DoesNotContain operand with strings', () => {
        const filter1 = createFilter(
          ViewFilterOperand.DOES_NOT_CONTAIN,
          'Hello World',
          'World',
          'TEXT',
        );
        const filter2 = createFilter(
          ViewFilterOperand.DOES_NOT_CONTAIN,
          'Hello',
          'World',
          'TEXT',
        );

        const filter3 = createFilter(
          ViewFilterOperand.DOES_NOT_CONTAIN,
          null,
          '',
          'TEXT',
        );

        expect(evaluateFilterConditions({ filters: [filter1] })).toBe(false);
        expect(evaluateFilterConditions({ filters: [filter2] })).toBe(true);
        expect(evaluateFilterConditions({ filters: [filter3] })).toBe(false);
      });

      it('should handle Contains operand with arrays', () => {
        const filter1 = createFilter(
          ViewFilterOperand.CONTAINS,
          ['apple', 'banana', 'cherry'],
          ['apple'],
          'ARRAY',
        );
        const filter2 = createFilter(
          ViewFilterOperand.CONTAINS,
          ['apple', 'banana', 'cherry'],
          ['grape'],
          'ARRAY',
        );

        const filter3 = createFilter(
          ViewFilterOperand.CONTAINS,
          null,
          [],
          'ARRAY',
        );

        const filter4 = createFilter(
          ViewFilterOperand.CONTAINS,
          [],
          null,
          'ARRAY',
        );

        const filter5 = createFilter(
          ViewFilterOperand.CONTAINS,
          null,
          ['apple'],
          'ARRAY',
        );

        expect(evaluateFilterConditions({ filters: [filter1] })).toBe(true);
        expect(evaluateFilterConditions({ filters: [filter2] })).toBe(false);
        expect(evaluateFilterConditions({ filters: [filter3] })).toBe(true);
        expect(evaluateFilterConditions({ filters: [filter4] })).toBe(true);
        expect(evaluateFilterConditions({ filters: [filter5] })).toBe(false);
      });

      it('should handle DoesNotContain operand with arrays', () => {
        const filter1 = createFilter(
          ViewFilterOperand.DOES_NOT_CONTAIN,
          ['apple', 'banana', 'cherry'],
          ['apple'],
          'ARRAY',
        );
        const filter2 = createFilter(
          ViewFilterOperand.DOES_NOT_CONTAIN,
          ['apple', 'banana', 'cherry'],
          ['grape'],
          'ARRAY',
        );

        const filter3 = createFilter(
          ViewFilterOperand.DOES_NOT_CONTAIN,
          null,
          ['apple'],
          'ARRAY',
        );

        expect(evaluateFilterConditions({ filters: [filter1] })).toBe(false);
        expect(evaluateFilterConditions({ filters: [filter2] })).toBe(true);
        expect(evaluateFilterConditions({ filters: [filter3] })).toBe(true);
      });
    });

    describe('empty operands', () => {
      it('should handle IsEmpty operand correctly', () => {
        const filter1 = createFilter(
          ViewFilterOperand.IS_EMPTY,
          null,
          '',
          'TEXT',
        );
        const filter2 = createFilter(
          ViewFilterOperand.IS_EMPTY,
          undefined,
          '',
          'TEXT',
        );
        const filter3 = createFilter(
          ViewFilterOperand.IS_EMPTY,
          '',
          '',
          'TEXT',
        );
        const filter4 = createFilter(
          ViewFilterOperand.IS_EMPTY,
          [],
          '',
          'ARRAY',
        );
        const filter5 = createFilter(
          ViewFilterOperand.IS_EMPTY,
          'not empty',
          '',
          'TEXT',
        );

        expect(evaluateFilterConditions({ filters: [filter1] })).toBe(true);
        expect(evaluateFilterConditions({ filters: [filter2] })).toBe(true);
        expect(evaluateFilterConditions({ filters: [filter3] })).toBe(true);
        expect(evaluateFilterConditions({ filters: [filter4] })).toBe(true);
        expect(evaluateFilterConditions({ filters: [filter5] })).toBe(false);
      });

      it('should handle IsNotEmpty operand correctly', () => {
        const filter1 = createFilter(
          ViewFilterOperand.IS_NOT_EMPTY,
          'not empty',
          '',
          'TEXT',
        );
        const filter2 = createFilter(
          ViewFilterOperand.IS_NOT_EMPTY,
          ['item'],
          '',
          'ARRAY',
        );
        const filter3 = createFilter(
          ViewFilterOperand.IS_NOT_EMPTY,
          null,
          '',
          'TEXT',
        );
        const filter4 = createFilter(
          ViewFilterOperand.IS_NOT_EMPTY,
          '',
          '',
          'TEXT',
        );
        const filter5 = createFilter(
          ViewFilterOperand.IS_NOT_EMPTY,
          [],
          '',
          'ARRAY',
        );

        expect(evaluateFilterConditions({ filters: [filter1] })).toBe(true);
        expect(evaluateFilterConditions({ filters: [filter2] })).toBe(true);
        expect(evaluateFilterConditions({ filters: [filter3] })).toBe(false);
        expect(evaluateFilterConditions({ filters: [filter4] })).toBe(false);
        expect(evaluateFilterConditions({ filters: [filter5] })).toBe(false);
      });
    });

    describe('date operands', () => {
      const now = new Date();
      const pastDate = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 1 day ago
      const futureDate = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 1 day from now
      const today = new Date();

      it('should handle IsInPast operand correctly', () => {
        const filter = createFilter(
          ViewFilterOperand.IS_IN_PAST,
          pastDate,
          null,
          'DATE',
        );

        expect(evaluateFilterConditions({ filters: [filter] })).toBe(true);

        const futureFilter = createFilter(
          ViewFilterOperand.IS_IN_PAST,
          futureDate,
          null,
          'DATE',
        );

        expect(evaluateFilterConditions({ filters: [futureFilter] })).toBe(
          false,
        );
      });

      it('should handle IsInFuture operand correctly', () => {
        const filter = createFilter(
          ViewFilterOperand.IS_IN_FUTURE,
          futureDate,
          null,
          'DATE',
        );

        expect(evaluateFilterConditions({ filters: [filter] })).toBe(true);

        const pastFilter = createFilter(
          ViewFilterOperand.IS_IN_FUTURE,
          pastDate,
          null,
          'DATE',
        );

        expect(evaluateFilterConditions({ filters: [pastFilter] })).toBe(false);
      });

      it('should handle IsToday operand correctly', () => {
        const filter = createFilter(
          ViewFilterOperand.IS_TODAY,
          today,
          null,
          'DATE',
        );

        expect(evaluateFilterConditions({ filters: [filter] })).toBe(true);

        const pastFilter = createFilter(
          ViewFilterOperand.IS_TODAY,
          pastDate,
          null,
          'DATE',
        );

        expect(evaluateFilterConditions({ filters: [pastFilter] })).toBe(false);
      });

      it('should handle IsBefore operand correctly', () => {
        const filter = createFilter(
          ViewFilterOperand.IS_BEFORE,
          pastDate,
          now,
          'DATE',
        );

        expect(evaluateFilterConditions({ filters: [filter] })).toBe(true);

        const futureFilter = createFilter(
          ViewFilterOperand.IS_BEFORE,
          futureDate,
          now,
          'DATE',
        );

        expect(evaluateFilterConditions({ filters: [futureFilter] })).toBe(
          false,
        );
      });

      it('should handle IsAfter operand correctly', () => {
        const filter = createFilter(
          ViewFilterOperand.IS_AFTER,
          futureDate,
          now,
          'DATE',
        );

        expect(evaluateFilterConditions({ filters: [filter] })).toBe(true);

        const pastFilter = createFilter(
          ViewFilterOperand.IS_AFTER,
          pastDate,
          now,
          'DATE',
        );

        expect(evaluateFilterConditions({ filters: [pastFilter] })).toBe(false);
      });

      it('should handle Is operand for dates correctly', () => {
        const sameDate1 = new Date('2023-01-15');
        const sameDate2 = new Date('2023-01-15');
        const filter = createFilter(
          ViewFilterOperand.IS,
          sameDate1,
          sameDate2,
          'DATE',
        );

        expect(evaluateFilterConditions({ filters: [filter] })).toBe(true);

        const otherDate = new Date('2023-01-16');
        const differentFilter = createFilter(
          ViewFilterOperand.IS,
          sameDate1,
          otherDate,
          'DATE',
        );

        expect(evaluateFilterConditions({ filters: [differentFilter] })).toBe(
          false,
        );
      });

      it('should handle date IsEmpty and IsNotEmpty operands', () => {
        const emptyFilter = createFilter(
          ViewFilterOperand.IS_EMPTY,
          null,
          null,
          'DATE',
        );

        expect(evaluateFilterConditions({ filters: [emptyFilter] })).toBe(true);

        const notEmptyFilter = createFilter(
          ViewFilterOperand.IS_NOT_EMPTY,
          now,
          null,
          'DATE',
        );

        expect(evaluateFilterConditions({ filters: [notEmptyFilter] })).toBe(
          true,
        );
      });
    });

    describe('currency operands', () => {
      it('should handle currency code operands', () => {
        const filter: ResolvedFilter = {
          id: 'filter1',
          type: 'CURRENCY',
          rightOperand: 'USD',
          operand: ViewFilterOperand.IS,
          stepFilterGroupId: 'group1',
          leftOperand: 'USD',
          compositeFieldSubFieldName: 'currencyCode',
        };

        expect(evaluateFilterConditions({ filters: [filter] })).toBe(true);
      });

      it('should handle currency amount operands', () => {
        const filter: ResolvedFilter = {
          id: 'filter1',
          type: 'CURRENCY',
          rightOperand: 100,
          operand: ViewFilterOperand.GREATER_THAN_OR_EQUAL,
          stepFilterGroupId: 'group1',
          leftOperand: 150,
          compositeFieldSubFieldName: 'amountMicros',
        };

        expect(evaluateFilterConditions({ filters: [filter] })).toBe(true);
      });
    });

    describe('error cases', () => {
      it('should throw error for unknown operand', () => {
        const filter = createFilter(
          'unknown' as ViewFilterOperand,
          'value',
          'value',
          'TEXT',
        );

        expect(() => evaluateFilterConditions({ filters: [filter] })).toThrow();
      });

      it('should handle unsupported filter type with default filter logic', () => {
        const filter = createFilter(
          ViewFilterOperand.CONTAINS,
          'Hello World',
          'World',
          'UNSUPPORTED_TYPE',
        );

        // Unsupported types fall through to default filter logic
        expect(evaluateFilterConditions({ filters: [filter] })).toBe(true);
      });
    });

    describe('unknown type filters', () => {
      it('should handle Is operand with unknown type', () => {
        const filter1 = createFilter(
          ViewFilterOperand.IS,
          'test',
          'test',
          'unknown',
        );
        const filter2 = createFilter(
          ViewFilterOperand.IS,
          'test',
          'different',
          'unknown',
        );
        const filter3 = createFilter(
          ViewFilterOperand.IS,
          null,
          null,
          'unknown',
        );
        const filter4 = createFilter(
          ViewFilterOperand.IS,
          undefined,
          undefined,
          'unknown',
        );

        expect(evaluateFilterConditions({ filters: [filter1] })).toBe(true);
        expect(evaluateFilterConditions({ filters: [filter2] })).toBe(false);
        expect(evaluateFilterConditions({ filters: [filter3] })).toBe(true);
        expect(evaluateFilterConditions({ filters: [filter4] })).toBe(true);
      });

      it('should handle IsNot operand with unknown type', () => {
        const filter1 = createFilter(
          ViewFilterOperand.IS_NOT,
          'test',
          'different',
          'unknown',
        );
        const filter2 = createFilter(
          ViewFilterOperand.IS_NOT,
          'test',
          'test',
          'unknown',
        );
        const filter3 = createFilter(
          ViewFilterOperand.IS_NOT,
          null,
          null,
          'unknown',
        );
        const filter4 = createFilter(
          ViewFilterOperand.IS_NOT,
          undefined,
          undefined,
          'unknown',
        );

        expect(evaluateFilterConditions({ filters: [filter1] })).toBe(true);
        expect(evaluateFilterConditions({ filters: [filter2] })).toBe(false);
        expect(evaluateFilterConditions({ filters: [filter3] })).toBe(false);
        expect(evaluateFilterConditions({ filters: [filter4] })).toBe(false);
      });

      it('should handle Contains operand with unknown type', () => {
        const filter1 = createFilter(
          ViewFilterOperand.CONTAINS,
          'Hello World',
          'World',
          'unknown',
        );
        const filter2 = createFilter(
          ViewFilterOperand.CONTAINS,
          'Hello',
          'World',
          'unknown',
        );
        const filter3 = createFilter(
          ViewFilterOperand.CONTAINS,
          [1, 2, 3],
          2,
          'unknown',
        );
        const filter4 = createFilter(
          ViewFilterOperand.CONTAINS,
          [1, 2, 3],
          4,
          'unknown',
        );
        const filter5 = createFilter(
          ViewFilterOperand.CONTAINS,
          null,
          null,
          'unknown',
        );
        const filter6 = createFilter(
          ViewFilterOperand.CONTAINS,
          undefined,
          undefined,
          'unknown',
        );
        const filter7 = createFilter(
          ViewFilterOperand.CONTAINS,
          'Hello World',
          undefined,
          'unknown',
        );

        const filter8 = createFilter(
          ViewFilterOperand.CONTAINS,
          'Hello World',
          null,
          'unknown',
        );
        const filter9 = createFilter(
          ViewFilterOperand.CONTAINS,
          [1, 2, 3],
          null,
          'unknown',
        );
        const filter10 = createFilter(
          ViewFilterOperand.CONTAINS,
          [1, 2, 3],
          undefined,
          'unknown',
        );

        expect(evaluateFilterConditions({ filters: [filter1] })).toBe(true);
        expect(evaluateFilterConditions({ filters: [filter2] })).toBe(false);
        expect(evaluateFilterConditions({ filters: [filter3] })).toBe(true);
        expect(evaluateFilterConditions({ filters: [filter4] })).toBe(false);
        expect(evaluateFilterConditions({ filters: [filter5] })).toBe(true);
        expect(evaluateFilterConditions({ filters: [filter6] })).toBe(true);
        expect(evaluateFilterConditions({ filters: [filter7] })).toBe(false);
        expect(evaluateFilterConditions({ filters: [filter8] })).toBe(false);
        expect(evaluateFilterConditions({ filters: [filter9] })).toBe(false);
        expect(evaluateFilterConditions({ filters: [filter10] })).toBe(false);
      });

      it('should handle DoesNotContain operand with unknown type', () => {
        const filter1 = createFilter(
          ViewFilterOperand.DOES_NOT_CONTAIN,
          'Hello',
          'World',
          'unknown',
        );
        const filter2 = createFilter(
          ViewFilterOperand.DOES_NOT_CONTAIN,
          'Hello World',
          'World',
          'unknown',
        );
        const filter3 = createFilter(
          ViewFilterOperand.DOES_NOT_CONTAIN,
          [1, 2, 3],
          2,
          'unknown',
        );
        const filter4 = createFilter(
          ViewFilterOperand.DOES_NOT_CONTAIN,
          [1, 2, 3],
          4,
          'unknown',
        );
        const filter5 = createFilter(
          ViewFilterOperand.DOES_NOT_CONTAIN,
          null,
          null,
          'unknown',
        );
        const filter6 = createFilter(
          ViewFilterOperand.DOES_NOT_CONTAIN,
          undefined,
          undefined,
          'unknown',
        );
        const filter7 = createFilter(
          ViewFilterOperand.DOES_NOT_CONTAIN,
          'Hello World',
          undefined,
          'unknown',
        );

        const filter8 = createFilter(
          ViewFilterOperand.DOES_NOT_CONTAIN,
          'Hello World',
          null,
          'unknown',
        );
        const filter9 = createFilter(
          ViewFilterOperand.DOES_NOT_CONTAIN,
          [1, 2, 3],
          null,
          'unknown',
        );
        const filter10 = createFilter(
          ViewFilterOperand.DOES_NOT_CONTAIN,
          [1, 2, 3],
          undefined,
          'unknown',
        );

        expect(evaluateFilterConditions({ filters: [filter1] })).toBe(true);
        expect(evaluateFilterConditions({ filters: [filter2] })).toBe(false);
        expect(evaluateFilterConditions({ filters: [filter3] })).toBe(false);
        expect(evaluateFilterConditions({ filters: [filter4] })).toBe(true);
        expect(evaluateFilterConditions({ filters: [filter5] })).toBe(false);
        expect(evaluateFilterConditions({ filters: [filter6] })).toBe(false);
        expect(evaluateFilterConditions({ filters: [filter7] })).toBe(true);
        expect(evaluateFilterConditions({ filters: [filter8] })).toBe(true);
        expect(evaluateFilterConditions({ filters: [filter9] })).toBe(true);
        expect(evaluateFilterConditions({ filters: [filter10] })).toBe(true);
      });

      it('should handle IsEmpty operand with unknown type', () => {
        const filter1 = createFilter(
          ViewFilterOperand.IS_EMPTY,
          null,
          '',
          'unknown',
        );
        const filter2 = createFilter(
          ViewFilterOperand.IS_EMPTY,
          'not empty',
          '',
          'unknown',
        );
        const filter3 = createFilter(
          ViewFilterOperand.IS_EMPTY,
          '',
          '',
          'unknown',
        );
        const filter4 = createFilter(
          ViewFilterOperand.DOES_NOT_CONTAIN,
          [],
          '',
          'unknown',
        );
        const filter5 = createFilter(
          ViewFilterOperand.IS_EMPTY,
          undefined,
          undefined,
          'unknown',
        );

        expect(evaluateFilterConditions({ filters: [filter1] })).toBe(true);
        expect(evaluateFilterConditions({ filters: [filter2] })).toBe(false);
        expect(evaluateFilterConditions({ filters: [filter3] })).toBe(true);
        expect(evaluateFilterConditions({ filters: [filter4] })).toBe(true);
        expect(evaluateFilterConditions({ filters: [filter5] })).toBe(true);
      });

      it('should handle IsNotEmpty operand with unknown type', () => {
        const filter1 = createFilter(
          ViewFilterOperand.IS_NOT_EMPTY,
          'not empty',
          '',
          'unknown',
        );
        const filter2 = createFilter(
          ViewFilterOperand.IS_NOT_EMPTY,
          null,
          '',
          'unknown',
        );
        const filter3 = createFilter(
          ViewFilterOperand.IS_NOT_EMPTY,
          [],
          '',
          'unknown',
        );
        const filter4 = createFilter(
          ViewFilterOperand.IS_NOT_EMPTY,
          '',
          '',
          'unknown',
        );
        const filter5 = createFilter(
          ViewFilterOperand.IS_NOT_EMPTY,
          undefined,
          undefined,
          'unknown',
        );

        expect(evaluateFilterConditions({ filters: [filter1] })).toBe(true);
        expect(evaluateFilterConditions({ filters: [filter2] })).toBe(false);
        expect(evaluateFilterConditions({ filters: [filter3] })).toBe(false);
        expect(evaluateFilterConditions({ filters: [filter4] })).toBe(false);
        expect(evaluateFilterConditions({ filters: [filter5] })).toBe(false);
      });

      it('should handle GreaterThanOrEqual operand with unknown type', () => {
        const filter1 = createFilter(
          ViewFilterOperand.GREATER_THAN_OR_EQUAL,
          100,
          50,
          'unknown',
        );
        const filter2 = createFilter(
          ViewFilterOperand.GREATER_THAN_OR_EQUAL,
          30,
          50,
          'unknown',
        );
        // strings are converted to numbers
        const filter3 = createFilter(
          ViewFilterOperand.GREATER_THAN_OR_EQUAL,
          '1234',
          '123',
          'unknown',
        );
        const filter4 = createFilter(
          ViewFilterOperand.GREATER_THAN_OR_EQUAL,
          undefined,
          undefined,
          'unknown',
        );

        expect(evaluateFilterConditions({ filters: [filter1] })).toBe(true);
        expect(evaluateFilterConditions({ filters: [filter2] })).toBe(false);
        expect(evaluateFilterConditions({ filters: [filter3] })).toBe(true);
        expect(evaluateFilterConditions({ filters: [filter4] })).toBe(false);
      });

      it('should handle LessThanOrEqual operand with unknown type', () => {
        const filter1 = createFilter(
          ViewFilterOperand.LESS_THAN_OR_EQUAL,
          30,
          50,
          'unknown',
        );
        const filter2 = createFilter(
          ViewFilterOperand.LESS_THAN_OR_EQUAL,
          100,
          50,
          'unknown',
        );
        const filter3 = createFilter(
          ViewFilterOperand.LESS_THAN_OR_EQUAL,
          '1234',
          '123',
          'unknown',
        );
        const filter4 = createFilter(
          ViewFilterOperand.LESS_THAN_OR_EQUAL,
          undefined,
          undefined,
          'unknown',
        );

        expect(evaluateFilterConditions({ filters: [filter1] })).toBe(true);
        expect(evaluateFilterConditions({ filters: [filter2] })).toBe(false);
        expect(evaluateFilterConditions({ filters: [filter3] })).toBe(false);
        expect(evaluateFilterConditions({ filters: [filter4] })).toBe(false);
      });

      it('should throw error for unsupported operand with unknown type', () => {
        const filter = createFilter(
          ViewFilterOperand.VECTOR_SEARCH,
          'test',
          'search term',
          'unknown',
        );

        expect(() => evaluateFilterConditions({ filters: [filter] })).toThrow();
      });
    });
  });

  describe('multiple filters without groups', () => {
    it('should apply AND logic by default for multiple filters', () => {
      const filters: ResolvedFilter[] = [
        {
          id: 'filter1',
          type: 'RELATION',
          rightOperand: 'John',
          operand: ViewFilterOperand.IS,
          stepFilterGroupId: 'group1',
          leftOperand: 'John',
        },
        {
          id: 'filter2',
          type: 'NUMBER',
          rightOperand: 25,
          operand: ViewFilterOperand.GREATER_THAN_OR_EQUAL,
          stepFilterGroupId: 'group1',
          leftOperand: 30,
        },
      ];

      const result = evaluateFilterConditions({ filters });

      expect(result).toBe(true);
    });

    it('should return false when one filter fails in AND logic', () => {
      const filters: ResolvedFilter[] = [
        {
          id: 'filter1',
          type: 'RELATION',
          rightOperand: 'John',
          operand: ViewFilterOperand.IS,
          stepFilterGroupId: 'group1',
          leftOperand: 'John',
        },
        {
          id: 'filter2',
          type: 'NUMBER',
          rightOperand: 25,
          operand: ViewFilterOperand.GREATER_THAN_OR_EQUAL,
          stepFilterGroupId: 'group1',
          leftOperand: 20, // This will fail
        },
      ];

      const result = evaluateFilterConditions({ filters });

      expect(result).toBe(false);
    });
  });

  describe('filter groups', () => {
    describe('single group with AND logic', () => {
      it('should return true when all filters pass', () => {
        const filterGroups: StepFilterGroup[] = [
          {
            id: 'group1',
            logicalOperator: StepLogicalOperator.AND,
          },
        ];

        const filters: ResolvedFilter[] = [
          {
            id: 'filter1',
            type: 'RELATION',
            rightOperand: 'John',
            operand: ViewFilterOperand.IS,
            stepFilterGroupId: 'group1',
            leftOperand: 'John',
          },
          {
            id: 'filter2',
            type: 'NUMBER',
            rightOperand: 25,
            operand: ViewFilterOperand.GREATER_THAN_OR_EQUAL,
            stepFilterGroupId: 'group1',
            leftOperand: 30,
          },
        ];

        const result = evaluateFilterConditions({ filterGroups, filters });

        expect(result).toBe(true);
      });

      it('should return false when one filter fails', () => {
        const filterGroups: StepFilterGroup[] = [
          {
            id: 'group1',
            logicalOperator: StepLogicalOperator.AND,
          },
        ];

        const filters: ResolvedFilter[] = [
          {
            id: 'filter1',
            type: 'RELATION',
            rightOperand: 'John',
            operand: ViewFilterOperand.IS,
            stepFilterGroupId: 'group1',
            leftOperand: 'Jane', // This will fail
          },
          {
            id: 'filter2',
            type: 'NUMBER',
            rightOperand: 25,
            operand: ViewFilterOperand.GREATER_THAN_OR_EQUAL,
            stepFilterGroupId: 'group1',
            leftOperand: 30,
          },
        ];

        const result = evaluateFilterConditions({ filterGroups, filters });

        expect(result).toBe(false);
      });
    });

    describe('single group with OR logic', () => {
      it('should return true when at least one filter passes', () => {
        const filterGroups: StepFilterGroup[] = [
          {
            id: 'group1',
            logicalOperator: StepLogicalOperator.OR,
          },
        ];

        const filters: ResolvedFilter[] = [
          {
            id: 'filter1',
            type: 'RELATION',
            rightOperand: 'John',
            operand: ViewFilterOperand.IS,
            stepFilterGroupId: 'group1',
            leftOperand: 'Jane', // This will fail
          },
          {
            id: 'filter2',
            type: 'NUMBER',
            rightOperand: 25,
            operand: ViewFilterOperand.GREATER_THAN_OR_EQUAL,
            stepFilterGroupId: 'group1',
            leftOperand: 30, // This will pass
          },
        ];

        const result = evaluateFilterConditions({ filterGroups, filters });

        expect(result).toBe(true);
      });

      it('should return false when all filters fail', () => {
        const filterGroups: StepFilterGroup[] = [
          {
            id: 'group1',
            logicalOperator: StepLogicalOperator.OR,
          },
        ];

        const filters: ResolvedFilter[] = [
          {
            id: 'filter1',
            type: 'RELATION',
            rightOperand: 'John',
            operand: ViewFilterOperand.IS,
            stepFilterGroupId: 'group1',
            leftOperand: 'Jane', // This will fail
          },
          {
            id: 'filter2',
            type: 'NUMBER',
            rightOperand: 25,
            operand: ViewFilterOperand.GREATER_THAN_OR_EQUAL,
            stepFilterGroupId: 'group1',
            leftOperand: 20, // This will fail
          },
        ];

        const result = evaluateFilterConditions({ filterGroups, filters });

        expect(result).toBe(false);
      });
    });

    describe('multiple groups', () => {
      it('should handle multiple root groups with AND logic between them', () => {
        const filterGroups: StepFilterGroup[] = [
          {
            id: 'group1',
            logicalOperator: StepLogicalOperator.AND,
          },
          {
            id: 'group2',
            logicalOperator: StepLogicalOperator.OR,
          },
        ];

        const filters: ResolvedFilter[] = [
          {
            id: 'filter1',
            type: 'RELATION',
            rightOperand: 'John',
            operand: ViewFilterOperand.IS,
            stepFilterGroupId: 'group1',
            leftOperand: 'John',
          },
          {
            id: 'filter2',
            type: 'NUMBER',
            rightOperand: 25,
            operand: ViewFilterOperand.GREATER_THAN_OR_EQUAL,
            stepFilterGroupId: 'group2',
            leftOperand: 30,
          },
        ];

        const result = evaluateFilterConditions({ filterGroups, filters });

        expect(result).toBe(true);
      });
    });

    describe('nested groups', () => {
      it('should handle nested filter groups correctly', () => {
        const filterGroups: StepFilterGroup[] = [
          {
            id: 'root',
            logicalOperator: StepLogicalOperator.AND,
          },
          {
            id: 'child1',
            logicalOperator: StepLogicalOperator.OR,
            parentStepFilterGroupId: 'root',
            positionInStepFilterGroup: 1,
          },
          {
            id: 'child2',
            logicalOperator: StepLogicalOperator.AND,
            parentStepFilterGroupId: 'root',
            positionInStepFilterGroup: 2,
          },
        ];

        const filters: ResolvedFilter[] = [
          {
            id: 'filter1',
            type: 'RELATION',
            rightOperand: 'John',
            operand: ViewFilterOperand.IS,
            stepFilterGroupId: 'child1',
            leftOperand: 'Jane', // This will fail
          },
          {
            id: 'filter2',
            type: 'RELATION',
            rightOperand: 'Smith',
            operand: ViewFilterOperand.IS,
            stepFilterGroupId: 'child1',
            leftOperand: 'Smith', // This will pass (OR group passes)
          },
          {
            id: 'filter3',
            type: 'NUMBER',
            rightOperand: 25,
            operand: ViewFilterOperand.GREATER_THAN_OR_EQUAL,
            stepFilterGroupId: 'child2',
            leftOperand: 30, // This will pass (AND group passes)
          },
        ];

        const result = evaluateFilterConditions({ filterGroups, filters });

        expect(result).toBe(true); // child1 (OR) passes, child2 (AND) passes, root (AND) passes
      });
    });

    describe('empty groups', () => {
      it('should return true for empty filter groups', () => {
        const filterGroups: StepFilterGroup[] = [
          {
            id: 'group1',
            logicalOperator: StepLogicalOperator.AND,
          },
        ];

        const result = evaluateFilterConditions({ filterGroups, filters: [] });

        expect(result).toBe(true);
      });
    });

    describe('error cases', () => {
      it('should throw error when filter references non-existent group', () => {
        const filterGroups: StepFilterGroup[] = [
          {
            id: 'group1',
            logicalOperator: StepLogicalOperator.AND,
          },
        ];

        const filters: ResolvedFilter[] = [
          {
            id: 'filter1',
            type: 'RELATION',
            rightOperand: 'John',
            operand: ViewFilterOperand.IS,
            stepFilterGroupId: 'nonexistent',
            leftOperand: 'John',
          },
        ];

        expect(() =>
          evaluateFilterConditions({ filterGroups, filters }),
        ).toThrow('Filter group with id nonexistent not found');
      });
    });
  });
});
