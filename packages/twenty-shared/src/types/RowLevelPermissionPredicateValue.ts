/* @license Enterprise */

export type RelationPredicateValue = {
  isCurrentWorkspaceMemberSelected?: boolean;
  selectedRecordIds: string[];
};

export type RowLevelPermissionPredicateValue =
  | string
  | string[]
  | boolean
  | number
  | RelationPredicateValue
  | Record<string, unknown>
  | null
  | undefined;
