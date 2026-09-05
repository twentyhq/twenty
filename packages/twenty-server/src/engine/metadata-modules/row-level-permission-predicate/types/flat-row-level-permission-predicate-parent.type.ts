/* @license Enterprise */

export type FlatRowLevelPermissionPredicateParent =
  | {
      roleId: string;
      roleUniversalIdentifier: string;
      sharingRuleId: null;
      sharingRuleUniversalIdentifier: null;
    }
  | {
      roleId: null;
      roleUniversalIdentifier: null;
      sharingRuleId: string;
      sharingRuleUniversalIdentifier: string;
    };

export type RowLevelPermissionPredicateParentIds = Pick<
  FlatRowLevelPermissionPredicateParent,
  'roleId' | 'sharingRuleId'
>;

export const isRowLevelPermissionPredicateOfParent = (
  predicateOrGroup: RowLevelPermissionPredicateParentIds,
  parent: RowLevelPermissionPredicateParentIds,
): boolean =>
  parent.roleId !== null
    ? predicateOrGroup.roleId === parent.roleId
    : predicateOrGroup.sharingRuleId === parent.sharingRuleId;
