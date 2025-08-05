import {
  StepFilter,
  StepFilterGroup,
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
    label: 'Test Filter',
    rightOperand,
    operand,
    displayValue: String(rightOperand),
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
          ViewFilterOperand.Is,
          'John',
          'John',
          'RELATION',
        );
        const result = evaluateFilterConditions({ filters: [filter] });

        expect(result).toBe(true);
      });

      it('should return false when values are not equal (RELATION)', () => {
        const filter = createFilter(
          ViewFilterOperand.Is,
          'John',
          'Jane',
          'RELATION',
        );
        const result = evaluateFilterConditions({ filters: [filter] });

        expect(result).toBe(false);
      });

      it('should return false when values are equal (IsNot RELATION)', () => {
        const filter = createFilter(
          ViewFilterOperand.IsNot,
          'John',
          'John',
          'RELATION',
        );
        const result = evaluateFilterConditions({ filters: [filter] });

        expect(result).toBe(false);
      });

      it('should return true when values are not equal (IsNot RELATION)', () => {
        const filter = createFilter(
          ViewFilterOperand.IsNot,
          'John',
          'Jane',
          'RELATION',
        );
        const result = evaluateFilterConditions({ filters: [filter] });

        expect(result).toBe(true);
      });
    });

    describe('Boolean filter operands', () => {
      it('should return true when boolean values are equal', () => {
        const filter = createFilter(
          ViewFilterOperand.Is,
          true,
          true,
          'BOOLEAN',
        );
        const result = evaluateFilterConditions({ filters: [filter] });

        expect(result).toBe(true);
      });

      it('should return false when boolean values are not equal', () => {
        const filter = createFilter(
          ViewFilterOperand.Is,
          true,
          false,
          'BOOLEAN',
        );
        const result = evaluateFilterConditions({ filters: [filter] });

        expect(result).toBe(false);
      });

      it('should handle truthy/falsy conversion', () => {
        const filter = createFilter(ViewFilterOperand.Is, 1, true, 'BOOLEAN');
        const result = evaluateFilterConditions({ filters: [filter] });

        expect(result).toBe(true);
      });
    });

    describe('numeric operands', () => {
      it('should handle GreaterThanOrEqual operand correctly', () => {
        const filter1 = createFilter(
          ViewFilterOperand.GreaterThanOrEqual,
          25,
          25,
          'NUMBER',
        );
        const filter2 = createFilter(
          ViewFilterOperand.GreaterThanOrEqual,
          30,
          25,
          'NUMBER',
        );
        const filter3 = createFilter(
          ViewFilterOperand.GreaterThanOrEqual,
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
          ViewFilterOperand.LessThanOrEqual,
          25,
          25,
          'NUMBER',
        );
        const filter2 = createFilter(
          ViewFilterOperand.LessThanOrEqual,
          20,
          25,
          'NUMBER',
        );
        const filter3 = createFilter(
          ViewFilterOperand.LessThanOrEqual,
          30,
          25,
          'NUMBER',
        );

        expect(evaluateFilterConditions({ filters: [filter1] })).toBe(true);
        expect(evaluateFilterConditions({ filters: [filter2] })).toBe(true);
        expect(evaluateFilterConditions({ filters: [filter3] })).toBe(false);
      });
    });

    describe('string and array operands', () => {
      it('should handle Contains operand with strings', () => {
        const filter1 = createFilter(
          ViewFilterOperand.Contains,
          'Hello World',
          'World',
          'TEXT',
        );
        const filter2 = createFilter(
          ViewFilterOperand.Contains,
          'Hello',
          'World',
          'TEXT',
        );

        expect(evaluateFilterConditions({ filters: [filter1] })).toBe(true);
        expect(evaluateFilterConditions({ filters: [filter2] })).toBe(false);
      });

      it('should handle DoesNotContain operand with strings', () => {
        const filter1 = createFilter(
          ViewFilterOperand.DoesNotContain,
          'Hello World',
          'World',
          'TEXT',
        );
        const filter2 = createFilter(
          ViewFilterOperand.DoesNotContain,
          'Hello',
          'World',
          'TEXT',
        );

        expect(evaluateFilterConditions({ filters: [filter1] })).toBe(false);
        expect(evaluateFilterConditions({ filters: [filter2] })).toBe(true);
      });

      it('should handle Contains operand with arrays', () => {
        const filter1 = createFilter(
          ViewFilterOperand.Contains,
          ['apple', 'banana', 'cherry'],
          ['apple'],
          'ARRAY',
        );
        const filter2 = createFilter(
          ViewFilterOperand.Contains,
          ['apple', 'banana', 'cherry'],
          ['grape'],
          'ARRAY',
        );

        expect(evaluateFilterConditions({ filters: [filter1] })).toBe(true);
        expect(evaluateFilterConditions({ filters: [filter2] })).toBe(false);
      });

      it('should handle DoesNotContain operand with arrays', () => {
        const filter1 = createFilter(
          ViewFilterOperand.DoesNotContain,
          ['apple', 'banana', 'cherry'],
          ['apple'],
          'ARRAY',
        );
        const filter2 = createFilter(
          ViewFilterOperand.DoesNotContain,
          ['apple', 'banana', 'cherry'],
          ['grape'],
          'ARRAY',
        );

        expect(evaluateFilterConditions({ filters: [filter1] })).toBe(false);
        expect(evaluateFilterConditions({ filters: [filter2] })).toBe(true);
      });
    });

    describe('empty operands', () => {
      it('should handle IsEmpty operand correctly', () => {
        const filter1 = createFilter(
          ViewFilterOperand.IsEmpty,
          null,
          '',
          'TEXT',
        );
        const filter2 = createFilter(
          ViewFilterOperand.IsEmpty,
          undefined,
          '',
          'TEXT',
        );
        const filter3 = createFilter(ViewFilterOperand.IsEmpty, '', '', 'TEXT');
        const filter4 = createFilter(
          ViewFilterOperand.IsEmpty,
          [],
          '',
          'ARRAY',
        );
        const filter5 = createFilter(
          ViewFilterOperand.IsEmpty,
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
          ViewFilterOperand.IsNotEmpty,
          'not empty',
          '',
          'TEXT',
        );
        const filter2 = createFilter(
          ViewFilterOperand.IsNotEmpty,
          ['item'],
          '',
          'ARRAY',
        );
        const filter3 = createFilter(
          ViewFilterOperand.IsNotEmpty,
          null,
          '',
          'TEXT',
        );
        const filter4 = createFilter(
          ViewFilterOperand.IsNotEmpty,
          '',
          '',
          'TEXT',
        );
        const filter5 = createFilter(
          ViewFilterOperand.IsNotEmpty,
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
          ViewFilterOperand.IsInPast,
          pastDate,
          null,
          'DATE',
        );

        expect(evaluateFilterConditions({ filters: [filter] })).toBe(true);

        const futureFilter = createFilter(
          ViewFilterOperand.IsInPast,
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
          ViewFilterOperand.IsInFuture,
          futureDate,
          null,
          'DATE',
        );

        expect(evaluateFilterConditions({ filters: [filter] })).toBe(true);

        const pastFilter = createFilter(
          ViewFilterOperand.IsInFuture,
          pastDate,
          null,
          'DATE',
        );

        expect(evaluateFilterConditions({ filters: [pastFilter] })).toBe(false);
      });

      it('should handle IsToday operand correctly', () => {
        const filter = createFilter(
          ViewFilterOperand.IsToday,
          today,
          null,
          'DATE',
        );

        expect(evaluateFilterConditions({ filters: [filter] })).toBe(true);

        const pastFilter = createFilter(
          ViewFilterOperand.IsToday,
          pastDate,
          null,
          'DATE',
        );

        expect(evaluateFilterConditions({ filters: [pastFilter] })).toBe(false);
      });

      it('should handle IsBefore operand correctly', () => {
        const filter = createFilter(
          ViewFilterOperand.IsBefore,
          pastDate,
          now,
          'DATE',
        );

        expect(evaluateFilterConditions({ filters: [filter] })).toBe(true);

        const futureFilter = createFilter(
          ViewFilterOperand.IsBefore,
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
          ViewFilterOperand.IsAfter,
          futureDate,
          now,
          'DATE',
        );

        expect(evaluateFilterConditions({ filters: [filter] })).toBe(true);

        const pastFilter = createFilter(
          ViewFilterOperand.IsAfter,
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
          ViewFilterOperand.Is,
          sameDate1,
          sameDate2,
          'DATE',
        );

        expect(evaluateFilterConditions({ filters: [filter] })).toBe(true);

        const differentFilter = createFilter(
          ViewFilterOperand.Is,
          sameDate1,
          now,
          'DATE',
        );

        expect(evaluateFilterConditions({ filters: [differentFilter] })).toBe(
          false,
        );
      });

      it('should handle date IsEmpty and IsNotEmpty operands', () => {
        const emptyFilter = createFilter(
          ViewFilterOperand.IsEmpty,
          null,
          null,
          'DATE',
        );

        expect(evaluateFilterConditions({ filters: [emptyFilter] })).toBe(true);

        const notEmptyFilter = createFilter(
          ViewFilterOperand.IsNotEmpty,
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
          label: 'Currency Filter',
          rightOperand: 'USD',
          operand: ViewFilterOperand.Is,
          displayValue: 'USD',
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
          label: 'Currency Filter',
          rightOperand: 100,
          operand: ViewFilterOperand.GreaterThanOrEqual,
          displayValue: '100',
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
          ViewFilterOperand.Contains,
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
          ViewFilterOperand.Is,
          'test',
          'test',
          'unknown',
        );
        const filter2 = createFilter(
          ViewFilterOperand.Is,
          'test',
          'different',
          'unknown',
        );
        const filter3 = createFilter(
          ViewFilterOperand.Is,
          null,
          null,
          'unknown',
        );
        const filter4 = createFilter(
          ViewFilterOperand.Is,
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
          ViewFilterOperand.IsNot,
          'test',
          'different',
          'unknown',
        );
        const filter2 = createFilter(
          ViewFilterOperand.IsNot,
          'test',
          'test',
          'unknown',
        );
        const filter3 = createFilter(
          ViewFilterOperand.IsNot,
          null,
          null,
          'unknown',
        );
        const filter4 = createFilter(
          ViewFilterOperand.IsNot,
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
          ViewFilterOperand.Contains,
          'Hello World',
          'World',
          'unknown',
        );
        const filter2 = createFilter(
          ViewFilterOperand.Contains,
          'Hello',
          'World',
          'unknown',
        );
        const filter3 = createFilter(
          ViewFilterOperand.Contains,
          [1, 2, 3],
          2,
          'unknown',
        );
        const filter4 = createFilter(
          ViewFilterOperand.Contains,
          [1, 2, 3],
          4,
          'unknown',
        );
        const filter5 = createFilter(
          ViewFilterOperand.Contains,
          null,
          null,
          'unknown',
        );
        const filter6 = createFilter(
          ViewFilterOperand.Contains,
          undefined,
          undefined,
          'unknown',
        );
        const filter7 = createFilter(
          ViewFilterOperand.Contains,
          'Hello World',
          undefined,
          'unknown',
        );

        const filter8 = createFilter(
          ViewFilterOperand.Contains,
          'Hello World',
          null,
          'unknown',
        );
        const filter9 = createFilter(
          ViewFilterOperand.Contains,
          [1, 2, 3],
          null,
          'unknown',
        );
        const filter10 = createFilter(
          ViewFilterOperand.Contains,
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
          ViewFilterOperand.DoesNotContain,
          'Hello',
          'World',
          'unknown',
        );
        const filter2 = createFilter(
          ViewFilterOperand.DoesNotContain,
          'Hello World',
          'World',
          'unknown',
        );
        const filter3 = createFilter(
          ViewFilterOperand.DoesNotContain,
          [1, 2, 3],
          2,
          'unknown',
        );
        const filter4 = createFilter(
          ViewFilterOperand.DoesNotContain,
          [1, 2, 3],
          4,
          'unknown',
        );
        const filter5 = createFilter(
          ViewFilterOperand.DoesNotContain,
          null,
          null,
          'unknown',
        );
        const filter6 = createFilter(
          ViewFilterOperand.DoesNotContain,
          undefined,
          undefined,
          'unknown',
        );
        const filter7 = createFilter(
          ViewFilterOperand.DoesNotContain,
          'Hello World',
          undefined,
          'unknown',
        );

        const filter8 = createFilter(
          ViewFilterOperand.DoesNotContain,
          'Hello World',
          null,
          'unknown',
        );
        const filter9 = createFilter(
          ViewFilterOperand.DoesNotContain,
          [1, 2, 3],
          null,
          'unknown',
        );
        const filter10 = createFilter(
          ViewFilterOperand.DoesNotContain,
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
          ViewFilterOperand.IsEmpty,
          null,
          '',
          'unknown',
        );
        const filter2 = createFilter(
          ViewFilterOperand.IsEmpty,
          'not empty',
          '',
          'unknown',
        );
        const filter3 = createFilter(
          ViewFilterOperand.IsEmpty,
          '',
          '',
          'unknown',
        );
        const filter4 = createFilter(
          ViewFilterOperand.DoesNotContain,
          [],
          '',
          'unknown',
        );
        const filter5 = createFilter(
          ViewFilterOperand.IsEmpty,
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
          ViewFilterOperand.IsNotEmpty,
          'not empty',
          '',
          'unknown',
        );
        const filter2 = createFilter(
          ViewFilterOperand.IsNotEmpty,
          null,
          '',
          'unknown',
        );
        const filter3 = createFilter(
          ViewFilterOperand.IsNotEmpty,
          [],
          '',
          'unknown',
        );
        const filter4 = createFilter(
          ViewFilterOperand.IsNotEmpty,
          '',
          '',
          'unknown',
        );
        const filter5 = createFilter(
          ViewFilterOperand.IsNotEmpty,
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
          ViewFilterOperand.GreaterThanOrEqual,
          100,
          50,
          'unknown',
        );
        const filter2 = createFilter(
          ViewFilterOperand.GreaterThanOrEqual,
          30,
          50,
          'unknown',
        );
        // strings are converted to numbers
        const filter3 = createFilter(
          ViewFilterOperand.GreaterThanOrEqual,
          '1234',
          '123',
          'unknown',
        );
        const filter4 = createFilter(
          ViewFilterOperand.GreaterThanOrEqual,
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
          ViewFilterOperand.LessThanOrEqual,
          30,
          50,
          'unknown',
        );
        const filter2 = createFilter(
          ViewFilterOperand.LessThanOrEqual,
          100,
          50,
          'unknown',
        );
        const filter3 = createFilter(
          ViewFilterOperand.LessThanOrEqual,
          '1234',
          '123',
          'unknown',
        );
        const filter4 = createFilter(
          ViewFilterOperand.LessThanOrEqual,
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
          ViewFilterOperand.VectorSearch,
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
          label: 'Name Filter',
          rightOperand: 'John',
          operand: ViewFilterOperand.Is,
          displayValue: 'John',
          stepFilterGroupId: 'group1',
          leftOperand: 'John',
        },
        {
          id: 'filter2',
          type: 'NUMBER',
          label: 'Age Filter',
          rightOperand: 25,
          operand: ViewFilterOperand.GreaterThanOrEqual,
          displayValue: '25',
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
          label: 'Name Filter',
          rightOperand: 'John',
          operand: ViewFilterOperand.Is,
          displayValue: 'John',
          stepFilterGroupId: 'group1',
          leftOperand: 'John',
        },
        {
          id: 'filter2',
          type: 'NUMBER',
          label: 'Age Filter',
          rightOperand: 25,
          operand: ViewFilterOperand.GreaterThanOrEqual,
          displayValue: '25',
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
            label: 'Name Filter',
            rightOperand: 'John',
            operand: ViewFilterOperand.Is,
            displayValue: 'John',
            stepFilterGroupId: 'group1',
            leftOperand: 'John',
          },
          {
            id: 'filter2',
            type: 'NUMBER',
            label: 'Age Filter',
            rightOperand: 25,
            operand: ViewFilterOperand.GreaterThanOrEqual,
            displayValue: '25',
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
            label: 'Name Filter',
            rightOperand: 'John',
            operand: ViewFilterOperand.Is,
            displayValue: 'John',
            stepFilterGroupId: 'group1',
            leftOperand: 'Jane', // This will fail
          },
          {
            id: 'filter2',
            type: 'NUMBER',
            label: 'Age Filter',
            rightOperand: 25,
            operand: ViewFilterOperand.GreaterThanOrEqual,
            displayValue: '25',
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
            label: 'Name Filter',
            rightOperand: 'John',
            operand: ViewFilterOperand.Is,
            displayValue: 'John',
            stepFilterGroupId: 'group1',
            leftOperand: 'Jane', // This will fail
          },
          {
            id: 'filter2',
            type: 'NUMBER',
            label: 'Age Filter',
            rightOperand: 25,
            operand: ViewFilterOperand.GreaterThanOrEqual,
            displayValue: '25',
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
            label: 'Name Filter',
            rightOperand: 'John',
            operand: ViewFilterOperand.Is,
            displayValue: 'John',
            stepFilterGroupId: 'group1',
            leftOperand: 'Jane', // This will fail
          },
          {
            id: 'filter2',
            type: 'NUMBER',
            label: 'Age Filter',
            rightOperand: 25,
            operand: ViewFilterOperand.GreaterThanOrEqual,
            displayValue: '25',
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
            label: 'Name Filter',
            rightOperand: 'John',
            operand: ViewFilterOperand.Is,
            displayValue: 'John',
            stepFilterGroupId: 'group1',
            leftOperand: 'John',
          },
          {
            id: 'filter2',
            type: 'NUMBER',
            label: 'Age Filter',
            rightOperand: 25,
            operand: ViewFilterOperand.GreaterThanOrEqual,
            displayValue: '25',
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
            label: 'Filter 1',
            rightOperand: 'John',
            operand: ViewFilterOperand.Is,
            displayValue: 'John',
            stepFilterGroupId: 'child1',
            leftOperand: 'Jane', // This will fail
          },
          {
            id: 'filter2',
            type: 'RELATION',
            label: 'Filter 2',
            rightOperand: 'Smith',
            operand: ViewFilterOperand.Is,
            displayValue: 'Smith',
            stepFilterGroupId: 'child1',
            leftOperand: 'Smith', // This will pass (OR group passes)
          },
          {
            id: 'filter3',
            type: 'NUMBER',
            label: 'Filter 3',
            rightOperand: 25,
            operand: ViewFilterOperand.GreaterThanOrEqual,
            displayValue: '25',
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
            label: 'Name Filter',
            rightOperand: 'John',
            operand: ViewFilterOperand.Is,
            displayValue: 'John',
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
