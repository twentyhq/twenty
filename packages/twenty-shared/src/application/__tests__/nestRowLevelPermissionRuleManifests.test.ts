import { flattenRowLevelPermissionRuleManifests } from '@/application/utils/flattenRowLevelPermissionRuleManifests';
import { nestRowLevelPermissionRuleManifests } from '@/application/utils/nestRowLevelPermissionRuleManifests';
import {
  RowLevelPermissionPredicateGroupLogicalOperator,
  RowLevelPermissionPredicateOperand,
} from '@/types';

const buildPredicate = (universalIdentifier: string) => ({
  universalIdentifier,
  fieldUniversalIdentifier: 'field',
  operand: RowLevelPermissionPredicateOperand.IS,
});

const RULE = {
  universalIdentifier: 'rule',
  objectUniversalIdentifier: 'company',
  canReadRecords: true,
};

const NESTED_RULE = {
  ...RULE,
  predicates: [buildPredicate('top-level-predicate')],
  predicateGroups: [
    {
      universalIdentifier: 'group',
      logicalOperator: RowLevelPermissionPredicateGroupLogicalOperator.OR,
      predicates: [buildPredicate('predicate-in-group')],
      predicateGroups: [
        {
          universalIdentifier: 'nested-group',
          logicalOperator: RowLevelPermissionPredicateGroupLogicalOperator.AND,
          predicates: [buildPredicate('predicate-in-nested-group')],
        },
      ],
    },
  ],
};

describe('nestRowLevelPermissionRuleManifests', () => {
  it('should rebuild the rules a flattening came from', () => {
    expect(
      nestRowLevelPermissionRuleManifests({
        rules: [RULE],
        ...flattenRowLevelPermissionRuleManifests({ rules: [NESTED_RULE] }),
      }),
    ).toEqual({ rules: [NESTED_RULE], predicateGroups: [], predicates: [] });
  });

  it('should leave predicates and groups linked to no rule in the flat form', () => {
    const predicate = {
      ...buildPredicate('predicate'),
      objectUniversalIdentifier: 'company',
    };

    expect(
      nestRowLevelPermissionRuleManifests({
        rules: [RULE],
        predicateGroups: [],
        predicates: [
          { ...predicate, rowLevelPermissionRuleUniversalIdentifier: null },
        ],
      }),
    ).toEqual({ rules: [RULE], predicateGroups: [], predicates: [predicate] });
  });
});
