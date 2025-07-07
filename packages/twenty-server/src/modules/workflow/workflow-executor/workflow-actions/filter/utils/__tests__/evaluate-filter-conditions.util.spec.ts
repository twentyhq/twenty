import {
  StepFilter,
  StepFilterGroup,
  StepLogicalOperator,
  StepOperand,
} from 'twenty-shared/types';

import { evaluateFilterConditions } from 'src/modules/workflow/workflow-executor/workflow-actions/filter/utils/evaluate-filter-conditions.util';

describe('evaluateFilterConditions', () => {
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
    type ResolvedFilter = Omit<StepFilter, 'value' | 'stepOutputKey'> & {
      rightOperand: unknown;
      leftOperand: unknown;
    };

    const createFilter = (
      operand: StepOperand,
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

    describe('eq operand', () => {
      it('should return true when values are equal', () => {
        const filter = createFilter(StepOperand.EQ, 'John', 'John');
        const result = evaluateFilterConditions({ filters: [filter] });

        expect(result).toBe(true);
      });

      it('should return true when values are loosely equal', () => {
        const filter = createFilter(StepOperand.EQ, '123', 123);
        const result = evaluateFilterConditions({ filters: [filter] });

        expect(result).toBe(true);
      });

      it('should return false when values are not equal', () => {
        const filter = createFilter(StepOperand.EQ, 'John', 'Jane');
        const result = evaluateFilterConditions({ filters: [filter] });

        expect(result).toBe(false);
      });
    });

    describe('ne operand', () => {
      it('should return false when values are equal', () => {
        const filter = createFilter(StepOperand.NE, 'John', 'John');
        const result = evaluateFilterConditions({ filters: [filter] });

        expect(result).toBe(false);
      });

      it('should return true when values are not equal', () => {
        const filter = createFilter(StepOperand.NE, 'John', 'Jane');
        const result = evaluateFilterConditions({ filters: [filter] });

        expect(result).toBe(true);
      });
    });

    describe('numeric operands', () => {
      it('should handle gt operand correctly', () => {
        const filter1 = createFilter(StepOperand.GT, 30, 25);
        const filter2 = createFilter(StepOperand.GT, 20, 25);

        expect(evaluateFilterConditions({ filters: [filter1] })).toBe(true);
        expect(evaluateFilterConditions({ filters: [filter2] })).toBe(false);
      });

      it('should handle gte operand correctly', () => {
        const filter1 = createFilter(StepOperand.GTE, 25, 25);
        const filter2 = createFilter(StepOperand.GTE, 30, 25);
        const filter3 = createFilter(StepOperand.GTE, 20, 25);

        expect(evaluateFilterConditions({ filters: [filter1] })).toBe(true);
        expect(evaluateFilterConditions({ filters: [filter2] })).toBe(true);
        expect(evaluateFilterConditions({ filters: [filter3] })).toBe(false);
      });

      it('should handle lt operand correctly', () => {
        const filter1 = createFilter(StepOperand.LT, 20, 25);
        const filter2 = createFilter(StepOperand.LT, 30, 25);

        expect(evaluateFilterConditions({ filters: [filter1] })).toBe(true);
        expect(evaluateFilterConditions({ filters: [filter2] })).toBe(false);
      });

      it('should handle lte operand correctly', () => {
        const filter1 = createFilter(StepOperand.LTE, 25, 25);
        const filter2 = createFilter(StepOperand.LTE, 20, 25);
        const filter3 = createFilter(StepOperand.LTE, 30, 25);

        expect(evaluateFilterConditions({ filters: [filter1] })).toBe(true);
        expect(evaluateFilterConditions({ filters: [filter2] })).toBe(true);
        expect(evaluateFilterConditions({ filters: [filter3] })).toBe(false);
      });

      it('should convert string numbers for numeric comparisons', () => {
        const filter1 = createFilter(StepOperand.GT, '30', '25');
        const filter2 = createFilter(StepOperand.LT, '20', '25');

        expect(evaluateFilterConditions({ filters: [filter1] })).toBe(true);
        expect(evaluateFilterConditions({ filters: [filter2] })).toBe(true);
      });
    });

    describe('string operands', () => {
      it('should handle like operand correctly', () => {
        const filter1 = createFilter(StepOperand.LIKE, 'Hello World', 'World');
        const filter2 = createFilter(StepOperand.LIKE, 'Hello', 'World');

        expect(evaluateFilterConditions({ filters: [filter1] })).toBe(true);
        expect(evaluateFilterConditions({ filters: [filter2] })).toBe(false);
      });

      it('should handle ilike operand correctly (case insensitive)', () => {
        const filter1 = createFilter(StepOperand.ILIKE, 'Hello World', 'WORLD');
        const filter2 = createFilter(StepOperand.ILIKE, 'Hello World', 'world');
        const filter3 = createFilter(StepOperand.ILIKE, 'Hello', 'WORLD');

        expect(evaluateFilterConditions({ filters: [filter1] })).toBe(true);
        expect(evaluateFilterConditions({ filters: [filter2] })).toBe(true);
        expect(evaluateFilterConditions({ filters: [filter3] })).toBe(false);
      });
    });

    describe('in operand', () => {
      it('should handle JSON array values', () => {
        const filter1 = createFilter(
          StepOperand.IN,
          'apple',
          '["apple", "banana", "cherry"]',
        );
        const filter2 = createFilter(
          StepOperand.IN,
          'grape',
          '["apple", "banana", "cherry"]',
        );

        expect(evaluateFilterConditions({ filters: [filter1] })).toBe(true);
        expect(evaluateFilterConditions({ filters: [filter2] })).toBe(false);
      });

      it('should handle comma-separated string values when JSON parsing fails', () => {
        const filter1 = createFilter(
          StepOperand.IN,
          'apple',
          'apple, banana, cherry',
        );
        const filter2 = createFilter(
          StepOperand.IN,
          'grape',
          'apple, banana, cherry',
        );

        expect(evaluateFilterConditions({ filters: [filter1] })).toBe(true);
        expect(evaluateFilterConditions({ filters: [filter2] })).toBe(false);
      });

      it('should handle comma-separated values with whitespace', () => {
        const filter = createFilter(
          StepOperand.IN,
          'apple',
          ' apple , banana , cherry ',
        );

        expect(evaluateFilterConditions({ filters: [filter] })).toBe(true);
      });

      it('should return false for non-array JSON values', () => {
        const filter = createFilter(
          StepOperand.IN,
          'apple',
          '{"key": "value"}',
        );

        expect(evaluateFilterConditions({ filters: [filter] })).toBe(false);
      });
    });

    describe('is operand', () => {
      it('should handle null checks', () => {
        const filter1 = createFilter(StepOperand.IS, null, 'null');
        const filter2 = createFilter(StepOperand.IS, undefined, 'NULL');
        const filter3 = createFilter(StepOperand.IS, 'value', 'null');

        expect(evaluateFilterConditions({ filters: [filter1] })).toBe(true);
        expect(evaluateFilterConditions({ filters: [filter2] })).toBe(true);
        expect(evaluateFilterConditions({ filters: [filter3] })).toBe(false);
      });

      it('should handle not null checks', () => {
        const filter1 = createFilter(StepOperand.IS, 'value', 'not null');
        const filter2 = createFilter(StepOperand.IS, 'value', 'NOT NULL');
        const filter3 = createFilter(StepOperand.IS, null, 'not null');
        const filter4 = createFilter(StepOperand.IS, undefined, 'not null');

        expect(evaluateFilterConditions({ filters: [filter1] })).toBe(true);
        expect(evaluateFilterConditions({ filters: [filter2] })).toBe(true);
        expect(evaluateFilterConditions({ filters: [filter3] })).toBe(false);
        expect(evaluateFilterConditions({ filters: [filter4] })).toBe(false);
      });

      it('should handle exact value comparisons for non-null/not-null cases', () => {
        const filter1 = createFilter(StepOperand.IS, 'exact', 'exact');
        const filter2 = createFilter(StepOperand.IS, 'value', 'different');

        expect(evaluateFilterConditions({ filters: [filter1] })).toBe(true);
        expect(evaluateFilterConditions({ filters: [filter2] })).toBe(false);
      });
    });

    describe('error cases', () => {
      it('should throw error for unknown operand', () => {
        const filter = createFilter('unknown' as StepOperand, 'value', 'value');

        expect(() => evaluateFilterConditions({ filters: [filter] })).toThrow(
          'Unknown operand: unknown',
        );
      });
    });
  });

  describe('multiple filters without groups', () => {
    type ResolvedFilter = Omit<StepFilter, 'value' | 'stepOutputKey'> & {
      rightOperand: unknown;
      leftOperand: unknown;
    };

    it('should apply AND logic by default for multiple filters', () => {
      const filters: ResolvedFilter[] = [
        {
          id: 'filter1',
          type: 'text',
          label: 'Name Filter',
          rightOperand: 'John',
          operand: StepOperand.EQ,
          displayValue: 'John',
          stepFilterGroupId: 'group1',
          leftOperand: 'John',
        },
        {
          id: 'filter2',
          type: 'number',
          label: 'Age Filter',
          rightOperand: 25,
          operand: StepOperand.GT,
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
          operand: StepOperand.EQ,
          displayValue: 'John',
          stepFilterGroupId: 'group1',
          leftOperand: 'John',
        },
        {
          id: 'filter2',
          type: 'number',
          label: 'Age Filter',
          rightOperand: 25,
          operand: StepOperand.GT,
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
    type ResolvedFilter = Omit<StepFilter, 'value' | 'stepOutputKey'> & {
      rightOperand: unknown;
      leftOperand: unknown;
    };

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
            operand: StepOperand.EQ,
            displayValue: 'John',
            stepFilterGroupId: 'group1',
            leftOperand: 'John',
          },
          {
            id: 'filter2',
            type: 'number',
            label: 'Age Filter',
            rightOperand: 25,
            operand: StepOperand.GT,
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
            operand: StepOperand.EQ,
            displayValue: 'John',
            stepFilterGroupId: 'group1',
            leftOperand: 'Jane', // This will fail
          },
          {
            id: 'filter2',
            type: 'number',
            label: 'Age Filter',
            rightOperand: 25,
            operand: StepOperand.GT,
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
            operand: StepOperand.EQ,
            displayValue: 'John',
            stepFilterGroupId: 'group1',
            leftOperand: 'Jane', // This will fail
          },
          {
            id: 'filter2',
            type: 'number',
            label: 'Age Filter',
            rightOperand: 25,
            operand: StepOperand.GT,
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
            operand: StepOperand.EQ,
            displayValue: 'John',
            stepFilterGroupId: 'group1',
            leftOperand: 'Jane', // This will fail
          },
          {
            id: 'filter2',
            type: 'number',
            label: 'Age Filter',
            rightOperand: 25,
            operand: StepOperand.GT,
            displayValue: '25',
            stepFilterGroupId: 'group1',
            leftOperand: 20, // This will fail
          },
        ];

        const result = evaluateFilterConditions({ filterGroups, filters });

        expect(result).toBe(false);
      });
    });

    describe('empty groups', () => {
      it('should return true for empty group', () => {
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

    describe('nested groups', () => {
      it('should handle nested groups correctly', () => {
        const filterGroups: StepFilterGroup[] = [
          {
            id: 'group1',
            logicalOperator: StepLogicalOperator.AND,
          },
          {
            id: 'group2',
            logicalOperator: StepLogicalOperator.OR,
            parentStepFilterGroupId: 'group1',
            positionInStepFilterGroup: 1,
          },
        ];

        const filters: ResolvedFilter[] = [
          // Filter in parent group
          {
            id: 'filter1',
            type: 'text',
            label: 'Name Filter',
            rightOperand: 'John',
            operand: StepOperand.EQ,
            displayValue: 'John',
            stepFilterGroupId: 'group1',
            leftOperand: 'John', // This will pass
          },
          // Filters in child group with OR logic
          {
            id: 'filter2',
            type: 'number',
            label: 'Age Filter',
            rightOperand: 25,
            operand: StepOperand.GT,
            displayValue: '25',
            stepFilterGroupId: 'group2',
            leftOperand: 20, // This will fail
          },
          {
            id: 'filter3',
            type: 'text',
            label: 'City Filter',
            rightOperand: 'NYC',
            operand: StepOperand.EQ,
            displayValue: 'NYC',
            stepFilterGroupId: 'group2',
            leftOperand: 'NYC', // This will pass
          },
        ];

        // Parent group uses AND: filter1 (pass) AND group2 (pass because filter3 passes)
        const result = evaluateFilterConditions({ filterGroups, filters });

        expect(result).toBe(true);
      });

      it('should handle multiple child groups with correct positioning', () => {
        const filterGroups: StepFilterGroup[] = [
          {
            id: 'group1',
            logicalOperator: StepLogicalOperator.AND,
          },
          {
            id: 'group2',
            logicalOperator: StepLogicalOperator.OR,
            parentStepFilterGroupId: 'group1',
            positionInStepFilterGroup: 1,
          },
          {
            id: 'group3',
            logicalOperator: StepLogicalOperator.AND,
            parentStepFilterGroupId: 'group1',
            positionInStepFilterGroup: 2,
          },
        ];

        const filters: ResolvedFilter[] = [
          // Group2 filters (OR logic)
          {
            id: 'filter1',
            type: 'text',
            label: 'Name Filter',
            rightOperand: 'John',
            operand: StepOperand.EQ,
            displayValue: 'John',
            stepFilterGroupId: 'group2',
            leftOperand: 'Jane', // This will fail
          },
          {
            id: 'filter2',
            type: 'text',
            label: 'Status Filter',
            rightOperand: 'active',
            operand: StepOperand.EQ,
            displayValue: 'active',
            stepFilterGroupId: 'group2',
            leftOperand: 'active', // This will pass
          },
          // Group3 filters (AND logic)
          {
            id: 'filter3',
            type: 'number',
            label: 'Age Filter',
            rightOperand: 18,
            operand: StepOperand.GTE,
            displayValue: '18',
            stepFilterGroupId: 'group3',
            leftOperand: 25, // This will pass
          },
          {
            id: 'filter4',
            type: 'number',
            label: 'Score Filter',
            rightOperand: 80,
            operand: StepOperand.GT,
            displayValue: '80',
            stepFilterGroupId: 'group3',
            leftOperand: 85, // This will pass
          },
        ];

        // Group1 uses AND: group2 (pass) AND group3 (pass)
        const result = evaluateFilterConditions({ filterGroups, filters });

        expect(result).toBe(true);
      });
    });

    describe('multiple root groups', () => {
      it('should combine multiple root groups with AND logic', () => {
        const filterGroups: StepFilterGroup[] = [
          {
            id: 'group1',
            logicalOperator: StepLogicalOperator.OR,
          },
          {
            id: 'group2',
            logicalOperator: StepLogicalOperator.AND,
          },
        ];

        const filters: ResolvedFilter[] = [
          // Group1 filters (OR logic)
          {
            id: 'filter1',
            type: 'text',
            label: 'Name Filter',
            rightOperand: 'John',
            operand: StepOperand.EQ,
            displayValue: 'John',
            stepFilterGroupId: 'group1',
            leftOperand: 'John', // This will pass
          },
          {
            id: 'filter2',
            type: 'text',
            label: 'Status Filter',
            rightOperand: 'inactive',
            operand: StepOperand.EQ,
            displayValue: 'inactive',
            stepFilterGroupId: 'group1',
            leftOperand: 'active', // This will fail
          },
          // Group2 filters (AND logic)
          {
            id: 'filter3',
            type: 'number',
            label: 'Age Filter',
            rightOperand: 18,
            operand: StepOperand.GTE,
            displayValue: '18',
            stepFilterGroupId: 'group2',
            leftOperand: 25, // This will pass
          },
          {
            id: 'filter4',
            type: 'number',
            label: 'Score Filter',
            rightOperand: 80,
            operand: StepOperand.GT,
            displayValue: '80',
            stepFilterGroupId: 'group2',
            leftOperand: 85, // This will pass
          },
        ];

        // Root groups combined with AND: group1 (pass) AND group2 (pass)
        const result = evaluateFilterConditions({ filterGroups, filters });

        expect(result).toBe(true);
      });

      it('should return false when one root group fails', () => {
        const filterGroups: StepFilterGroup[] = [
          {
            id: 'group1',
            logicalOperator: StepLogicalOperator.OR,
          },
          {
            id: 'group2',
            logicalOperator: StepLogicalOperator.AND,
          },
        ];

        const filters: ResolvedFilter[] = [
          // Group1 filters (OR logic) - will pass
          {
            id: 'filter1',
            type: 'text',
            label: 'Name Filter',
            rightOperand: 'John',
            operand: StepOperand.EQ,
            displayValue: 'John',
            stepFilterGroupId: 'group1',
            leftOperand: 'John', // This will pass
          },
          // Group2 filters (AND logic) - will fail
          {
            id: 'filter2',
            type: 'number',
            label: 'Age Filter',
            rightOperand: 30,
            operand: StepOperand.GT,
            displayValue: '30',
            stepFilterGroupId: 'group2',
            leftOperand: 25, // This will fail
          },
          {
            id: 'filter3',
            type: 'number',
            label: 'Score Filter',
            rightOperand: 80,
            operand: StepOperand.GT,
            displayValue: '80',
            stepFilterGroupId: 'group2',
            leftOperand: 85, // This will pass
          },
        ];

        // Root groups combined with AND: group1 (pass) AND group2 (fail)
        const result = evaluateFilterConditions({ filterGroups, filters });

        expect(result).toBe(false);
      });
    });

    describe('error cases', () => {
      it('should throw error when filter group is not found', () => {
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
            operand: StepOperand.EQ,
            displayValue: 'John',
            stepFilterGroupId: 'nonexistent-group',
            leftOperand: 'John',
          },
        ];

        expect(() =>
          evaluateFilterConditions({ filterGroups, filters }),
        ).toThrow('Filter group with id nonexistent-group not found');
      });

      it('should throw error for unknown logical operator', () => {
        const filterGroups: StepFilterGroup[] = [
          {
            id: 'group1',
            logicalOperator: 'UNKNOWN' as StepLogicalOperator,
          },
        ];

        const filters: ResolvedFilter[] = [
          {
            id: 'filter1',
            type: 'text',
            label: 'Name Filter',
            rightOperand: 'John',
            operand: StepOperand.EQ,
            displayValue: 'John',
            stepFilterGroupId: 'group1',
            leftOperand: 'John',
          },
        ];

        expect(() =>
          evaluateFilterConditions({ filterGroups, filters }),
        ).toThrow('Unknown logical operator: UNKNOWN');
      });
    });
  });
});
