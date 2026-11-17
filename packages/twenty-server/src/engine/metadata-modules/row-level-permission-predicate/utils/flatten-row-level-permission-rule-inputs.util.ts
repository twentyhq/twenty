/* @license Enterprise */

import { v4 } from 'uuid';

import {
  type RowLevelPermissionRuleInput,
  type RowLevelPermissionRulePredicateGroupInput,
  type RowLevelPermissionRulePredicateInput,
} from 'src/engine/metadata-modules/row-level-permission-predicate/dtos/inputs/upsert-row-level-permission-rules.input';
import { type FlattenedRowLevelPermissionRuleInputs } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flattened-row-level-permission-rule-inputs.type';

export const flattenRowLevelPermissionRuleInputs = (
  rules: RowLevelPermissionRuleInput[],
): FlattenedRowLevelPermissionRuleInputs => {
  const flattened: FlattenedRowLevelPermissionRuleInputs = {
    rules: [],
    predicateGroups: [],
    predicates: [],
  };

  for (const rule of rules) {
    const rowLevelPermissionRuleId = rule.id ?? v4();

    flattened.rules.push({
      id: rowLevelPermissionRuleId,
      canReadRecords: rule.canReadRecords ?? false,
      canCreateRecords: rule.canCreateRecords ?? rule.canUpdateRecords ?? false,
      canUpdateRecords: rule.canUpdateRecords ?? false,
      canSoftDeleteRecords: rule.canSoftDeleteRecords ?? false,
      canDestroyRecords: rule.canDestroyRecords ?? false,
    });

    const flattenChildren = ({
      predicates,
      predicateGroups,
      parentPredicateGroupId,
    }: {
      predicates?: RowLevelPermissionRulePredicateInput[] | null;
      predicateGroups?: RowLevelPermissionRulePredicateGroupInput[] | null;
      parentPredicateGroupId: string | null;
    }): void => {
      for (const { id, position, ...predicate } of predicates ?? []) {
        flattened.predicates.push({
          ...predicate,
          id: id ?? v4(),
          rowLevelPermissionRuleId,
          rowLevelPermissionPredicateGroupId: parentPredicateGroupId,
          positionInRowLevelPermissionPredicateGroup: position ?? null,
        });
      }

      for (const predicateGroup of predicateGroups ?? []) {
        const predicateGroupId = predicateGroup.id ?? v4();

        flattened.predicateGroups.push({
          id: predicateGroupId,
          rowLevelPermissionRuleId,
          parentRowLevelPermissionPredicateGroupId: parentPredicateGroupId,
          logicalOperator: predicateGroup.logicalOperator,
          positionInRowLevelPermissionPredicateGroup:
            predicateGroup.position ?? null,
        });

        flattenChildren({
          predicates: predicateGroup.predicates,
          predicateGroups: predicateGroup.predicateGroups,
          parentPredicateGroupId: predicateGroupId,
        });
      }
    };

    flattenChildren({
      predicates: rule.predicates,
      predicateGroups: rule.predicateGroups,
      parentPredicateGroupId: null,
    });
  }

  return flattened;
};
