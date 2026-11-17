/* @license Enterprise */

import {
  type RowLevelPermissionPredicateGroupLogicalOperator,
  type RowLevelPermissionPredicateOperand,
  type RowLevelPermissionPredicateValue,
} from 'twenty-shared/types';

import { type FlatRowLevelPermissionRule } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-rule.type';

export type FlattenedRowLevelPermissionRuleInput = Pick<
  FlatRowLevelPermissionRule,
  | 'id'
  | 'canReadRecords'
  | 'canCreateRecords'
  | 'canUpdateRecords'
  | 'canSoftDeleteRecords'
  | 'canDestroyRecords'
>;

export type FlattenedRowLevelPermissionPredicateGroupInput = {
  id: string;
  rowLevelPermissionRuleId: string;
  parentRowLevelPermissionPredicateGroupId: string | null;
  logicalOperator: RowLevelPermissionPredicateGroupLogicalOperator;
  positionInRowLevelPermissionPredicateGroup: number | null;
};

export type FlattenedRowLevelPermissionPredicateInput = {
  id: string;
  rowLevelPermissionRuleId: string;
  rowLevelPermissionPredicateGroupId: string | null;
  fieldMetadataId: string;
  relationFieldMetadataId?: string | null;
  operand: RowLevelPermissionPredicateOperand;
  value?: RowLevelPermissionPredicateValue | null;
  subFieldName?: string | null;
  workspaceMemberFieldMetadataId?: string | null;
  workspaceMemberSubFieldName?: string | null;
  positionInRowLevelPermissionPredicateGroup: number | null;
};

export type FlattenedRowLevelPermissionRuleInputs = {
  rules: FlattenedRowLevelPermissionRuleInput[];
  predicateGroups: FlattenedRowLevelPermissionPredicateGroupInput[];
  predicates: FlattenedRowLevelPermissionPredicateInput[];
};
