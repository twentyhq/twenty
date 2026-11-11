/* @license Enterprise */

import { type ObjectPermissionAction } from 'twenty-shared/application';

import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type FlatRowLevelPermissionRule } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-rule.type';

type RuleGrants = Partial<
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
const OBJECT_PERMISSION_ACTION_BY_RULE_GRANT: Record<
  Exclude<keyof RuleGrants, 'canCreateRecords'>,
  ObjectPermissionAction
> = {
  canReadRecords: 'canReadObjectRecords',
  canUpdateRecords: 'canUpdateObjectRecords',
  canSoftDeleteRecords: 'canSoftDeleteObjectRecords',
  canDestroyRecords: 'canDestroyObjectRecords',
};

// Role settings send the grants a rule inherits from its role, disabled actions included
export const removeDisabledActionsFromRowLevelPermissionRuleGrants = ({
  ruleGrants,
  flatObjectMetadata,
}: {
  ruleGrants: RuleGrants;
  flatObjectMetadata:
    | Pick<FlatObjectMetadata, 'disabledObjectPermissionActions'>
    | undefined;
}): RuleGrants => {
  const disabledActions: string[] =
    flatObjectMetadata?.disabledObjectPermissionActions ?? [];

  const resolveRuleGrant = (
    ruleGrant: keyof typeof OBJECT_PERMISSION_ACTION_BY_RULE_GRANT,
  ) =>
    disabledActions.includes(OBJECT_PERMISSION_ACTION_BY_RULE_GRANT[ruleGrant])
      ? false
      : ruleGrants[ruleGrant];

  return {
    ...ruleGrants,
    canReadRecords: resolveRuleGrant('canReadRecords'),
    canUpdateRecords: resolveRuleGrant('canUpdateRecords'),
    canSoftDeleteRecords: resolveRuleGrant('canSoftDeleteRecords'),
    canDestroyRecords: resolveRuleGrant('canDestroyRecords'),
  };
};
