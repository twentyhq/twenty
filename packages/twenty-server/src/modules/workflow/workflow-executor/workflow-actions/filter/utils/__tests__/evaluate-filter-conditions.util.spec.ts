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
  ): ResolvedFilter => ({
    id: 'filter1',
    type: 'text',
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
    describe('Is operand', () => {
      it('should return true when values are equal', () => {
        const filter = createFilter(ViewFilterOperand.Is, 'John', 'John');
        const result = evaluateFilterConditions({ filters: [filter] });

        expect(result).toBe(true);
      });

      it('should return true when values are loosely equal', () => {
        const filter = createFilter(ViewFilterOperand.Is, '123', 123);
        const result = evaluateFilterConditions({ filters: [filter] });

        expect(result).toBe(true);
      });

      it('should return false when values are not equal', () => {
        const filter = createFilter(ViewFilterOperand.Is, 'John', 'Jane');
        const result = evaluateFilterConditions({ filters: [filter] });

        expect(result).toBe(false);
      });

      it('should handle null checks', () => {
        const filter1 = createFilter(ViewFilterOperand.Is, null, 'null');
        const filter2 = createFilter(ViewFilterOperand.Is, undefined, 'NULL');
        const filter3 = createFilter(ViewFilterOperand.Is, 'value', 'null');

        expect(evaluateFilterConditions({ filters: [filter1] })).toBe(true);
        expect(evaluateFilterConditions({ filters: [filter2] })).toBe(true);
        expect(evaluateFilterConditions({ filters: [filter3] })).toBe(false);
      });

      it('should handle not null checks', () => {
        const filter1 = createFilter(ViewFilterOperand.Is, 'value', 'not null');
        const filter2 = createFilter(ViewFilterOperand.Is, 'value', 'NOT NULL');
        const filter3 = createFilter(ViewFilterOperand.Is, null, 'not null');
        const filter4 = createFilter(
          ViewFilterOperand.Is,
          undefined,
          'not null',
        );

        expect(evaluateFilterConditions({ filters: [filter1] })).toBe(true);
        expect(evaluateFilterConditions({ filters: [filter2] })).toBe(true);
        expect(evaluateFilterConditions({ filters: [filter3] })).toBe(false);
        expect(evaluateFilterConditions({ filters: [filter4] })).toBe(false);
      });
    });

    describe('IsNot operand', () => {
      it('should return false when values are equal', () => {
        const filter = createFilter(ViewFilterOperand.IsNot, 'John', 'John');
        const result = evaluateFilterConditions({ filters: [filter] });

        expect(result).toBe(false);
      });

      it('should return true when values are not equal', () => {
        const filter = createFilter(ViewFilterOperand.IsNot, 'John', 'Jane');
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
        );
        const filter2 = createFilter(
          ViewFilterOperand.GreaterThanOrEqual,
          30,
          25,
        );
        const filter3 = createFilter(
          ViewFilterOperand.GreaterThanOrEqual,
          20,
          25,
        );

        expect(evaluateFilterConditions({ filters: [filter1] })).toBe(true);
        expect(evaluateFilterConditions({ filters: [filter2] })).toBe(true);
        expect(evaluateFilterConditions({ filters: [filter3] })).toBe(false);
      });

      it('should handle LessThanOrEqual operand correctly', () => {
        const filter1 = createFilter(ViewFilterOperand.LessThanOrEqual, 25, 25);
        const filter2 = createFilter(ViewFilterOperand.LessThanOrEqual, 20, 25);
        const filter3 = createFilter(ViewFilterOperand.LessThanOrEqual, 30, 25);

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
        );
        const filter2 = createFilter(
          ViewFilterOperand.Contains,
          'Hello',
          'World',
        );

        expect(evaluateFilterConditions({ filters: [filter1] })).toBe(true);
        expect(evaluateFilterConditions({ filters: [filter2] })).toBe(false);
      });

      it('should handle DoesNotContain operand with strings', () => {
        const filter1 = createFilter(
          ViewFilterOperand.DoesNotContain,
          'Hello World',
          'World',
        );
        const filter2 = createFilter(
          ViewFilterOperand.DoesNotContain,
          'Hello',
          'World',
        );

        expect(evaluateFilterConditions({ filters: [filter1] })).toBe(false);
        expect(evaluateFilterConditions({ filters: [filter2] })).toBe(true);
      });

      it('should handle Contains operand with arrays', () => {
        const filter1 = createFilter(
          ViewFilterOperand.Contains,
          ['apple', 'banana', 'cherry'],
          'apple',
        );
        const filter2 = createFilter(
          ViewFilterOperand.Contains,
          ['apple', 'banana', 'cherry'],
          'grape',
        );

        expect(evaluateFilterConditions({ filters: [filter1] })).toBe(true);
        expect(evaluateFilterConditions({ filters: [filter2] })).toBe(false);
      });

      it('should handle DoesNotContain operand with arrays', () => {
        const filter1 = createFilter(
          ViewFilterOperand.DoesNotContain,
          ['apple', 'banana', 'cherry'],
          'apple',
        );
        const filter2 = createFilter(
          ViewFilterOperand.DoesNotContain,
          ['apple', 'banana', 'cherry'],
          'grape',
        );

        expect(evaluateFilterConditions({ filters: [filter1] })).toBe(false);
        expect(evaluateFilterConditions({ filters: [filter2] })).toBe(true);
      });
    });

    describe('empty operands', () => {
      it('should handle IsEmpty operand correctly', () => {
        const filter1 = createFilter(ViewFilterOperand.IsEmpty, null, '');
        const filter2 = createFilter(ViewFilterOperand.IsEmpty, undefined, '');
        const filter3 = createFilter(ViewFilterOperand.IsEmpty, '', '');
        const filter4 = createFilter(ViewFilterOperand.IsEmpty, [], '');
        const filter5 = createFilter(
          ViewFilterOperand.IsEmpty,
          'not empty',
          '',
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
        );
        const filter2 = createFilter(
          ViewFilterOperand.IsNotEmpty,
          ['item'],
          '',
        );
        const filter3 = createFilter(ViewFilterOperand.IsNotEmpty, null, '');
        const filter4 = createFilter(ViewFilterOperand.IsNotEmpty, '', '');
        const filter5 = createFilter(ViewFilterOperand.IsNotEmpty, [], '');

        expect(evaluateFilterConditions({ filters: [filter1] })).toBe(true);
        expect(evaluateFilterConditions({ filters: [filter2] })).toBe(true);
        expect(evaluateFilterConditions({ filters: [filter3] })).toBe(false);
        expect(evaluateFilterConditions({ filters: [filter4] })).toBe(false);
        expect(evaluateFilterConditions({ filters: [filter5] })).toBe(false);
      });
    });

    describe('date operands', () => {
      it('should handle date operands (returning false as placeholder)', () => {
        const dateOperands = [
          ViewFilterOperand.IsRelative,
          ViewFilterOperand.IsInPast,
          ViewFilterOperand.IsInFuture,
          ViewFilterOperand.IsToday,
          ViewFilterOperand.IsBefore,
          ViewFilterOperand.IsAfter,
        ];

        dateOperands.forEach((operand) => {
          const filter = createFilter(operand, new Date(), new Date());

          expect(evaluateFilterConditions({ filters: [filter] })).toBe(false);
        });
      });
    });

    describe('error cases', () => {
      it('should throw error for unknown operand', () => {
        const filter = createFilter(
          'unknown' as ViewFilterOperand,
          'value',
          'value',
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
          type: 'text',
          label: 'Name Filter',
          rightOperand: 'John',
          operand: ViewFilterOperand.Is,
          displayValue: 'John',
          stepFilterGroupId: 'group1',
          leftOperand: 'John',
        },
        {
          id: 'filter2',
          type: 'number',
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
          type: 'text',
          label: 'Name Filter',
          rightOperand: 'John',
          operand: ViewFilterOperand.Is,
          displayValue: 'John',
          stepFilterGroupId: 'group1',
          leftOperand: 'John',
        },
        {
          id: 'filter2',
          type: 'number',
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
            type: 'text',
            label: 'Name Filter',
            rightOperand: 'John',
            operand: ViewFilterOperand.Is,
            displayValue: 'John',
            stepFilterGroupId: 'group1',
            leftOperand: 'John',
          },
          {
            id: 'filter2',
            type: 'number',
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
            type: 'text',
            label: 'Name Filter',
            rightOperand: 'John',
            operand: ViewFilterOperand.Is,
            displayValue: 'John',
            stepFilterGroupId: 'group1',
            leftOperand: 'Jane', // This will fail
          },
          {
            id: 'filter2',
            type: 'number',
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
            type: 'text',
            label: 'Name Filter',
            rightOperand: 'John',
            operand: ViewFilterOperand.Is,
            displayValue: 'John',
            stepFilterGroupId: 'group1',
            leftOperand: 'Jane', // This will fail
          },
          {
            id: 'filter2',
            type: 'number',
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
            type: 'text',
            label: 'Name Filter',
            rightOperand: 'John',
            operand: ViewFilterOperand.Is,
            displayValue: 'John',
            stepFilterGroupId: 'group1',
            leftOperand: 'Jane', // This will fail
          },
          {
            id: 'filter2',
            type: 'number',
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
            type: 'text',
            label: 'Name Filter',
            rightOperand: 'John',
            operand: ViewFilterOperand.Is,
            displayValue: 'John',
            stepFilterGroupId: 'group1',
            leftOperand: 'John',
          },
          {
            id: 'filter2',
            type: 'number',
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
            type: 'text',
            label: 'Filter 1',
            rightOperand: 'John',
            operand: ViewFilterOperand.Is,
            displayValue: 'John',
            stepFilterGroupId: 'child1',
            leftOperand: 'Jane', // This will fail
          },
          {
            id: 'filter2',
            type: 'text',
            label: 'Filter 2',
            rightOperand: 'Smith',
            operand: ViewFilterOperand.Is,
            displayValue: 'Smith',
            stepFilterGroupId: 'child1',
            leftOperand: 'Smith', // This will pass (OR group passes)
          },
          {
            id: 'filter3',
            type: 'number',
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
            type: 'text',
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
