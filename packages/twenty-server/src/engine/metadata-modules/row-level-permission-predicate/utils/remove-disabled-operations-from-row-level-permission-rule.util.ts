/* @license Enterprise */

import { type ObjectPermissionAction } from 'twenty-shared/application';

import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type FlatRowLevelPermissionRule } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-rule.type';

type RuleOperations = Partial<
  Pick<
    FlatRowLevelPermissionRule,
    | 'canCreateRecords'
    | 'canReadRecords'
    | 'canUpdateRecords'
    | 'canSoftDeleteRecords'
    | 'canDestroyRecords'
  >
>;

// Same actions as validateObjectPermissionGrantsNoDisabledAction: create still follows update
const OBJECT_PERMISSION_ACTION_BY_RULE_OPERATION: Record<
  Exclude<keyof RuleOperations, 'canCreateRecords'>,
  ObjectPermissionAction
> = {
  canReadRecords: 'canReadObjectRecords',
  canUpdateRecords: 'canUpdateObjectRecords',
  canSoftDeleteRecords: 'canSoftDeleteObjectRecords',
  canDestroyRecords: 'canDestroyObjectRecords',
};

// Role settings send the operations a rule inherits from its role, disabled actions included
export const removeDisabledOperationsFromRowLevelPermissionRule = ({
  ruleOperations,
  flatObjectMetadata,
}: {
  ruleOperations: RuleOperations;
  flatObjectMetadata:
    | Pick<FlatObjectMetadata, 'disabledObjectPermissionActions'>
    | undefined;
}): RuleOperations => {
  const disabledActions: string[] =
    flatObjectMetadata?.disabledObjectPermissionActions ?? [];

  const resolveRuleOperation = (
    ruleOperation: keyof typeof OBJECT_PERMISSION_ACTION_BY_RULE_OPERATION,
  ) =>
    disabledActions.includes(
      OBJECT_PERMISSION_ACTION_BY_RULE_OPERATION[ruleOperation],
    )
      ? false
      : ruleOperations[ruleOperation];

  return {
    ...ruleOperations,
    canReadRecords: resolveRuleOperation('canReadRecords'),
    canUpdateRecords: resolveRuleOperation('canUpdateRecords'),
    canSoftDeleteRecords: resolveRuleOperation('canSoftDeleteRecords'),
    canDestroyRecords: resolveRuleOperation('canDestroyRecords'),
  };
};
