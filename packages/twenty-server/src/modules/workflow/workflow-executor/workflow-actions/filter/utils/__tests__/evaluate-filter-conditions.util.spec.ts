import {
  FilterGroup,
  LogicalOperator,
  Operand,
} from 'src/modules/workflow/workflow-executor/workflow-actions/filter/types/workflow-filter-action-settings.type';
import { evaluateFilterConditions } from 'src/modules/workflow/workflow-executor/workflow-actions/filter/utils/evaluate-filter-conditions.util';

type ResolvedFilter = {
  id: string;
  type: string;
  label: string;
  rightOperand: unknown;
  operand: Operand;
  displayValue: string;
  fieldMetadataId: string;
  recordFilterGroupId: string;
  leftOperand: unknown;
};

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
    const createFilter = (
      operand: Operand,
      leftOperand: unknown,
      rightOperand: unknown,
    ): ResolvedFilter => ({
      id: 'filter1',
      type: 'text',
      label: 'Test Filter',
      rightOperand,
      operand,
      displayValue: String(rightOperand),
      fieldMetadataId: 'field1',
      recordFilterGroupId: 'group1',
      leftOperand,
    });

    describe('eq operand', () => {
      it('should return true when values are equal', () => {
        const filter = createFilter(Operand.EQ, 'John', 'John');
        const result = evaluateFilterConditions({ filters: [filter] });

        expect(result).toBe(true);
      });

      it('should return true when values are loosely equal', () => {
        const filter = createFilter(Operand.EQ, '123', 123);
        const result = evaluateFilterConditions({ filters: [filter] });

        expect(result).toBe(true);
      });

      it('should return false when values are not equal', () => {
        const filter = createFilter(Operand.EQ, 'John', 'Jane');
        const result = evaluateFilterConditions({ filters: [filter] });

        expect(result).toBe(false);
      });
    });

    describe('ne operand', () => {
      it('should return false when values are equal', () => {
        const filter = createFilter(Operand.NE, 'John', 'John');
        const result = evaluateFilterConditions({ filters: [filter] });

        expect(result).toBe(false);
      });

      it('should return true when values are not equal', () => {
        const filter = createFilter(Operand.NE, 'John', 'Jane');
        const result = evaluateFilterConditions({ filters: [filter] });

        expect(result).toBe(true);
      });
    });

    describe('numeric operands', () => {
      it('should handle gt operand correctly', () => {
        const filter1 = createFilter(Operand.GT, 30, 25);
        const filter2 = createFilter(Operand.GT, 20, 25);

        expect(evaluateFilterConditions({ filters: [filter1] })).toBe(true);
        expect(evaluateFilterConditions({ filters: [filter2] })).toBe(false);
      });

      it('should handle gte operand correctly', () => {
        const filter1 = createFilter(Operand.GTE, 25, 25);
        const filter2 = createFilter(Operand.GTE, 30, 25);
        const filter3 = createFilter(Operand.GTE, 20, 25);

        expect(evaluateFilterConditions({ filters: [filter1] })).toBe(true);
        expect(evaluateFilterConditions({ filters: [filter2] })).toBe(true);
        expect(evaluateFilterConditions({ filters: [filter3] })).toBe(false);
      });

      it('should handle lt operand correctly', () => {
        const filter1 = createFilter(Operand.LT, 20, 25);
        const filter2 = createFilter(Operand.LT, 30, 25);

        expect(evaluateFilterConditions({ filters: [filter1] })).toBe(true);
        expect(evaluateFilterConditions({ filters: [filter2] })).toBe(false);
      });

      it('should handle lte operand correctly', () => {
        const filter1 = createFilter(Operand.LTE, 25, 25);
        const filter2 = createFilter(Operand.LTE, 20, 25);
        const filter3 = createFilter(Operand.LTE, 30, 25);

        expect(evaluateFilterConditions({ filters: [filter1] })).toBe(true);
        expect(evaluateFilterConditions({ filters: [filter2] })).toBe(true);
        expect(evaluateFilterConditions({ filters: [filter3] })).toBe(false);
      });

      it('should convert string numbers for numeric comparisons', () => {
        const filter1 = createFilter(Operand.GT, '30', '25');
        const filter2 = createFilter(Operand.LT, '20', '25');

        expect(evaluateFilterConditions({ filters: [filter1] })).toBe(true);
        expect(evaluateFilterConditions({ filters: [filter2] })).toBe(true);
      });
    });

    describe('string operands', () => {
      it('should handle like operand correctly', () => {
        const filter1 = createFilter(Operand.LIKE, 'Hello World', 'World');
        const filter2 = createFilter(Operand.LIKE, 'Hello', 'World');

        expect(evaluateFilterConditions({ filters: [filter1] })).toBe(true);
        expect(evaluateFilterConditions({ filters: [filter2] })).toBe(false);
      });

      it('should handle ilike operand correctly (case insensitive)', () => {
        const filter1 = createFilter(Operand.ILIKE, 'Hello World', 'WORLD');
        const filter2 = createFilter(Operand.ILIKE, 'Hello World', 'world');
        const filter3 = createFilter(Operand.ILIKE, 'Hello', 'WORLD');

        expect(evaluateFilterConditions({ filters: [filter1] })).toBe(true);
        expect(evaluateFilterConditions({ filters: [filter2] })).toBe(true);
        expect(evaluateFilterConditions({ filters: [filter3] })).toBe(false);
      });
    });

    describe('in operand', () => {
      it('should handle JSON array values', () => {
        const filter1 = createFilter(
          Operand.IN,
          'apple',
          '["apple", "banana", "cherry"]',
        );
        const filter2 = createFilter(
          Operand.IN,
          'grape',
          '["apple", "banana", "cherry"]',
        );

        expect(evaluateFilterConditions({ filters: [filter1] })).toBe(true);
        expect(evaluateFilterConditions({ filters: [filter2] })).toBe(false);
      });

      it('should handle comma-separated string values when JSON parsing fails', () => {
        const filter1 = createFilter(
          Operand.IN,
          'apple',
          'apple, banana, cherry',
        );
        const filter2 = createFilter(
          Operand.IN,
          'grape',
          'apple, banana, cherry',
        );

        expect(evaluateFilterConditions({ filters: [filter1] })).toBe(true);
        expect(evaluateFilterConditions({ filters: [filter2] })).toBe(false);
      });

      it('should handle comma-separated values with whitespace', () => {
        const filter = createFilter(
          Operand.IN,
          'apple',
          ' apple , banana , cherry ',
        );

        expect(evaluateFilterConditions({ filters: [filter] })).toBe(true);
      });

      it('should return false for non-array JSON values', () => {
        const filter = createFilter(Operand.IN, 'apple', '{"key": "value"}');

        expect(evaluateFilterConditions({ filters: [filter] })).toBe(false);
      });
    });

    describe('is operand', () => {
      it('should handle null checks', () => {
        const filter1 = createFilter(Operand.IS, null, 'null');
        const filter2 = createFilter(Operand.IS, undefined, 'NULL');
        const filter3 = createFilter(Operand.IS, 'value', 'null');

        expect(evaluateFilterConditions({ filters: [filter1] })).toBe(true);
        expect(evaluateFilterConditions({ filters: [filter2] })).toBe(true);
        expect(evaluateFilterConditions({ filters: [filter3] })).toBe(false);
      });

      it('should handle not null checks', () => {
        const filter1 = createFilter(Operand.IS, 'value', 'not null');
        const filter2 = createFilter(Operand.IS, 'value', 'NOT NULL');
        const filter3 = createFilter(Operand.IS, null, 'not null');
        const filter4 = createFilter(Operand.IS, undefined, 'not null');

        expect(evaluateFilterConditions({ filters: [filter1] })).toBe(true);
        expect(evaluateFilterConditions({ filters: [filter2] })).toBe(true);
        expect(evaluateFilterConditions({ filters: [filter3] })).toBe(false);
        expect(evaluateFilterConditions({ filters: [filter4] })).toBe(false);
      });

      it('should handle exact value comparisons for non-null/not-null cases', () => {
        const filter1 = createFilter(Operand.IS, 'exact', 'exact');
        const filter2 = createFilter(Operand.IS, 'value', 'different');

        expect(evaluateFilterConditions({ filters: [filter1] })).toBe(true);
        expect(evaluateFilterConditions({ filters: [filter2] })).toBe(false);
      });
    });

    describe('error cases', () => {
      it('should throw error for unknown operand', () => {
        const filter = createFilter('unknown' as Operand, 'value', 'value');

        expect(() => evaluateFilterConditions({ filters: [filter] })).toThrow(
          'Unknown operand: unknown',
        );
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
          operand: Operand.EQ,
          displayValue: 'John',
          fieldMetadataId: 'field1',
          recordFilterGroupId: 'group1',
          leftOperand: 'John',
        },
        {
          id: 'filter2',
          type: 'number',
          label: 'Age Filter',
          rightOperand: 25,
          operand: Operand.GT,
          displayValue: '25',
          fieldMetadataId: 'field2',
          recordFilterGroupId: 'group1',
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
          operand: Operand.EQ,
          displayValue: 'John',
          fieldMetadataId: 'field1',
          recordFilterGroupId: 'group1',
          leftOperand: 'John',
        },
        {
          id: 'filter2',
          type: 'number',
          label: 'Age Filter',
          rightOperand: 25,
          operand: Operand.GT,
          displayValue: '25',
          fieldMetadataId: 'field2',
          recordFilterGroupId: 'group1',
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
        const filterGroups: FilterGroup[] = [
          {
            id: 'group1',
            logicalOperator: LogicalOperator.AND,
          },
        ];

        const filters: ResolvedFilter[] = [
          {
            id: 'filter1',
            type: 'text',
            label: 'Name Filter',
            rightOperand: 'John',
            operand: Operand.EQ,
            displayValue: 'John',
            fieldMetadataId: 'field1',
            recordFilterGroupId: 'group1',
            leftOperand: 'John',
          },
          {
            id: 'filter2',
            type: 'number',
            label: 'Age Filter',
            rightOperand: 25,
            operand: Operand.GT,
            displayValue: '25',
            fieldMetadataId: 'field2',
            recordFilterGroupId: 'group1',
            leftOperand: 30,
          },
        ];

        const result = evaluateFilterConditions({ filterGroups, filters });

        expect(result).toBe(true);
      });

      it('should return false when one filter fails', () => {
        const filterGroups: FilterGroup[] = [
          {
            id: 'group1',
            logicalOperator: LogicalOperator.AND,
          },
        ];

        const filters: ResolvedFilter[] = [
          {
            id: 'filter1',
            type: 'text',
            label: 'Name Filter',
            rightOperand: 'John',
            operand: Operand.EQ,
            displayValue: 'John',
            fieldMetadataId: 'field1',
            recordFilterGroupId: 'group1',
            leftOperand: 'Jane', // This will fail
          },
          {
            id: 'filter2',
            type: 'number',
            label: 'Age Filter',
            rightOperand: 25,
            operand: Operand.GT,
            displayValue: '25',
            fieldMetadataId: 'field2',
            recordFilterGroupId: 'group1',
            leftOperand: 30,
          },
        ];

        const result = evaluateFilterConditions({ filterGroups, filters });

        expect(result).toBe(false);
      });
    });

    describe('single group with OR logic', () => {
      it('should return true when at least one filter passes', () => {
        const filterGroups: FilterGroup[] = [
          {
            id: 'group1',
            logicalOperator: LogicalOperator.OR,
          },
        ];

        const filters: ResolvedFilter[] = [
          {
            id: 'filter1',
            type: 'text',
            label: 'Name Filter',
            rightOperand: 'John',
            operand: Operand.EQ,
            displayValue: 'John',
            fieldMetadataId: 'field1',
            recordFilterGroupId: 'group1',
            leftOperand: 'Jane', // This will fail
          },
          {
            id: 'filter2',
            type: 'number',
            label: 'Age Filter',
            rightOperand: 25,
            operand: Operand.GT,
            displayValue: '25',
            fieldMetadataId: 'field2',
            recordFilterGroupId: 'group1',
            leftOperand: 30, // This will pass
          },
        ];

        const result = evaluateFilterConditions({ filterGroups, filters });

        expect(result).toBe(true);
      });

      it('should return false when all filters fail', () => {
        const filterGroups: FilterGroup[] = [
          {
            id: 'group1',
            logicalOperator: LogicalOperator.OR,
          },
        ];

        const filters: ResolvedFilter[] = [
          {
            id: 'filter1',
            type: 'text',
            label: 'Name Filter',
            rightOperand: 'John',
            operand: Operand.EQ,
            displayValue: 'John',
            fieldMetadataId: 'field1',
            recordFilterGroupId: 'group1',
            leftOperand: 'Jane', // This will fail
          },
          {
            id: 'filter2',
            type: 'number',
            label: 'Age Filter',
            rightOperand: 25,
            operand: Operand.GT,
            displayValue: '25',
            fieldMetadataId: 'field2',
            recordFilterGroupId: 'group1',
            leftOperand: 20, // This will fail
          },
        ];

        const result = evaluateFilterConditions({ filterGroups, filters });

        expect(result).toBe(false);
      });
    });

    describe('empty groups', () => {
      it('should return true for empty group', () => {
        const filterGroups: FilterGroup[] = [
          {
            id: 'group1',
            logicalOperator: LogicalOperator.AND,
          },
        ];

        const result = evaluateFilterConditions({ filterGroups, filters: [] });

        expect(result).toBe(true);
      });
    });

    describe('nested groups', () => {
      it('should handle nested groups correctly', () => {
        const filterGroups: FilterGroup[] = [
          {
            id: 'group1',
            logicalOperator: LogicalOperator.AND,
          },
          {
            id: 'group2',
            logicalOperator: LogicalOperator.OR,
            parentRecordFilterGroupId: 'group1',
            positionInRecordFilterGroup: 1,
          },
        ];

        const filters: ResolvedFilter[] = [
          // Filter in parent group
          {
            id: 'filter1',
            type: 'text',
            label: 'Name Filter',
            rightOperand: 'John',
            operand: Operand.EQ,
            displayValue: 'John',
            fieldMetadataId: 'field1',
            recordFilterGroupId: 'group1',
            leftOperand: 'John', // This will pass
          },
          // Filters in child group with OR logic
          {
            id: 'filter2',
            type: 'number',
            label: 'Age Filter',
            rightOperand: 25,
            operand: Operand.GT,
            displayValue: '25',
            fieldMetadataId: 'field2',
            recordFilterGroupId: 'group2',
            leftOperand: 20, // This will fail
          },
          {
            id: 'filter3',
            type: 'text',
            label: 'City Filter',
            rightOperand: 'NYC',
            operand: Operand.EQ,
            displayValue: 'NYC',
            fieldMetadataId: 'field3',
            recordFilterGroupId: 'group2',
            leftOperand: 'NYC', // This will pass
          },
        ];

        // Parent group uses AND: filter1 (pass) AND group2 (pass because filter3 passes)
        const result = evaluateFilterConditions({ filterGroups, filters });

        expect(result).toBe(true);
      });

      it('should handle multiple child groups with correct positioning', () => {
        const filterGroups: FilterGroup[] = [
          {
            id: 'group1',
            logicalOperator: LogicalOperator.AND,
          },
          {
            id: 'group2',
            logicalOperator: LogicalOperator.OR,
            parentRecordFilterGroupId: 'group1',
            positionInRecordFilterGroup: 1,
          },
          {
            id: 'group3',
            logicalOperator: LogicalOperator.AND,
            parentRecordFilterGroupId: 'group1',
            positionInRecordFilterGroup: 2,
          },
        ];

        const filters: ResolvedFilter[] = [
          // Group2 filters (OR logic)
          {
            id: 'filter1',
            type: 'text',
            label: 'Name Filter',
            rightOperand: 'John',
            operand: Operand.EQ,
            displayValue: 'John',
            fieldMetadataId: 'field1',
            recordFilterGroupId: 'group2',
            leftOperand: 'Jane', // This will fail
          },
          {
            id: 'filter2',
            type: 'text',
            label: 'Status Filter',
            rightOperand: 'active',
            operand: Operand.EQ,
            displayValue: 'active',
            fieldMetadataId: 'field2',
            recordFilterGroupId: 'group2',
            leftOperand: 'active', // This will pass
          },
          // Group3 filters (AND logic)
          {
            id: 'filter3',
            type: 'number',
            label: 'Age Filter',
            rightOperand: 18,
            operand: Operand.GTE,
            displayValue: '18',
            fieldMetadataId: 'field3',
            recordFilterGroupId: 'group3',
            leftOperand: 25, // This will pass
          },
          {
            id: 'filter4',
            type: 'number',
            label: 'Score Filter',
            rightOperand: 80,
            operand: Operand.GT,
            displayValue: '80',
            fieldMetadataId: 'field4',
            recordFilterGroupId: 'group3',
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
        const filterGroups: FilterGroup[] = [
          {
            id: 'group1',
            logicalOperator: LogicalOperator.OR,
          },
          {
            id: 'group2',
            logicalOperator: LogicalOperator.AND,
          },
        ];

        const filters: ResolvedFilter[] = [
          // Group1 filters (OR logic)
          {
            id: 'filter1',
            type: 'text',
            label: 'Name Filter',
            rightOperand: 'John',
            operand: Operand.EQ,
            displayValue: 'John',
            fieldMetadataId: 'field1',
            recordFilterGroupId: 'group1',
            leftOperand: 'John', // This will pass
          },
          {
            id: 'filter2',
            type: 'text',
            label: 'Status Filter',
            rightOperand: 'inactive',
            operand: Operand.EQ,
            displayValue: 'inactive',
            fieldMetadataId: 'field2',
            recordFilterGroupId: 'group1',
            leftOperand: 'active', // This will fail
          },
          // Group2 filters (AND logic)
          {
            id: 'filter3',
            type: 'number',
            label: 'Age Filter',
            rightOperand: 18,
            operand: Operand.GTE,
            displayValue: '18',
            fieldMetadataId: 'field3',
            recordFilterGroupId: 'group2',
            leftOperand: 25, // This will pass
          },
          {
            id: 'filter4',
            type: 'number',
            label: 'Score Filter',
            rightOperand: 80,
            operand: Operand.GT,
            displayValue: '80',
            fieldMetadataId: 'field4',
            recordFilterGroupId: 'group2',
            leftOperand: 85, // This will pass
          },
        ];

        // Root groups combined with AND: group1 (pass) AND group2 (pass)
        const result = evaluateFilterConditions({ filterGroups, filters });

        expect(result).toBe(true);
      });

      it('should return false when one root group fails', () => {
        const filterGroups: FilterGroup[] = [
          {
            id: 'group1',
            logicalOperator: LogicalOperator.OR,
          },
          {
            id: 'group2',
            logicalOperator: LogicalOperator.AND,
          },
        ];

        const filters: ResolvedFilter[] = [
          // Group1 filters (OR logic) - will pass
          {
            id: 'filter1',
            type: 'text',
            label: 'Name Filter',
            rightOperand: 'John',
            operand: Operand.EQ,
            displayValue: 'John',
            fieldMetadataId: 'field1',
            recordFilterGroupId: 'group1',
            leftOperand: 'John', // This will pass
          },
          // Group2 filters (AND logic) - will fail
          {
            id: 'filter2',
            type: 'number',
            label: 'Age Filter',
            rightOperand: 30,
            operand: Operand.GT,
            displayValue: '30',
            fieldMetadataId: 'field2',
            recordFilterGroupId: 'group2',
            leftOperand: 25, // This will fail
          },
          {
            id: 'filter3',
            type: 'number',
            label: 'Score Filter',
            rightOperand: 80,
            operand: Operand.GT,
            displayValue: '80',
            fieldMetadataId: 'field3',
            recordFilterGroupId: 'group2',
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
        const filterGroups: FilterGroup[] = [
          {
            id: 'group1',
            logicalOperator: LogicalOperator.AND,
          },
        ];

        const filters: ResolvedFilter[] = [
          {
            id: 'filter1',
            type: 'text',
            label: 'Name Filter',
            rightOperand: 'John',
            operand: Operand.EQ,
            displayValue: 'John',
            fieldMetadataId: 'field1',
            recordFilterGroupId: 'nonexistent-group',
            leftOperand: 'John',
          },
        ];

        expect(() =>
          evaluateFilterConditions({ filterGroups, filters }),
        ).toThrow('Filter group with id nonexistent-group not found');
      });

      it('should throw error for unknown logical operator', () => {
        const filterGroups: FilterGroup[] = [
          {
            id: 'group1',
            logicalOperator: 'UNKNOWN' as LogicalOperator,
          },
        ];

        const filters: ResolvedFilter[] = [
          {
            id: 'filter1',
            type: 'text',
            label: 'Name Filter',
            rightOperand: 'John',
            operand: Operand.EQ,
            displayValue: 'John',
            fieldMetadataId: 'field1',
            recordFilterGroupId: 'group1',
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
