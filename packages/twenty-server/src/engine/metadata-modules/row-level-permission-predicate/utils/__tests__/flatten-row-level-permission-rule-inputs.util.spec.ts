/* @license Enterprise */

import {
  RowLevelPermissionPredicateGroupLogicalOperator,
  RowLevelPermissionPredicateOperand,
} from 'twenty-shared/types';

import { flattenRowLevelPermissionRuleInputs } from 'src/engine/metadata-modules/row-level-permission-predicate/utils/flatten-row-level-permission-rule-inputs.util';

describe('flattenRowLevelPermissionRuleInputs', () => {
  it('links nested groups and predicates to their rule and parent', () => {
    const flattened = flattenRowLevelPermissionRuleInputs([
      {
        id: 'rule-id',
        canUpdateRecords: true,
        predicates: [
          {
            id: 'ungrouped-predicate-id',
            fieldMetadataId: 'field-id',
            operand: RowLevelPermissionPredicateOperand.IS,
          },
        ],
        predicateGroups: [
          {
            id: 'group-id',
            logicalOperator: RowLevelPermissionPredicateGroupLogicalOperator.OR,
            position: 1,
            predicateGroups: [
              {
                id: 'child-group-id',
                logicalOperator:
                  RowLevelPermissionPredicateGroupLogicalOperator.AND,
                predicates: [
                  {
                    id: 'child-predicate-id',
                    fieldMetadataId: 'field-id',
                    operand: RowLevelPermissionPredicateOperand.IS,
                    position: 2,
                  },
                ],
              },
            ],
          },
        ],
      },
    ]);

    expect(flattened.rules).toEqual([
      {
        id: 'rule-id',
        canReadRecords: false,
        canCreateRecords: true,
        canUpdateRecords: true,
        canSoftDeleteRecords: false,
        canDestroyRecords: false,
      },
    ]);
    expect(flattened.predicateGroups).toEqual([
      expect.objectContaining({
        id: 'group-id',
        rowLevelPermissionRuleId: 'rule-id',
        parentRowLevelPermissionPredicateGroupId: null,
        positionInRowLevelPermissionPredicateGroup: 1,
      }),
      expect.objectContaining({
        id: 'child-group-id',
        rowLevelPermissionRuleId: 'rule-id',
        parentRowLevelPermissionPredicateGroupId: 'group-id',
      }),
    ]);
    expect(flattened.predicates).toEqual([
      expect.objectContaining({
        id: 'ungrouped-predicate-id',
        rowLevelPermissionRuleId: 'rule-id',
        rowLevelPermissionPredicateGroupId: null,
      }),
      expect.objectContaining({
        id: 'child-predicate-id',
        rowLevelPermissionRuleId: 'rule-id',
        rowLevelPermissionPredicateGroupId: 'child-group-id',
        positionInRowLevelPermissionPredicateGroup: 2,
      }),
    ]);
  });

  it('accepts null predicate and group lists', () => {
    const flattened = flattenRowLevelPermissionRuleInputs([
      {
        id: 'rule-id',
        predicates: null,
        predicateGroups: [
          {
            id: 'group-id',
            logicalOperator:
              RowLevelPermissionPredicateGroupLogicalOperator.AND,
            predicates: null,
            predicateGroups: null,
          },
        ],
      },
    ]);

    expect(flattened.predicates).toEqual([]);
    expect(flattened.predicateGroups).toHaveLength(1);
  });
});
