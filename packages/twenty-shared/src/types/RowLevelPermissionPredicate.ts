/* @license Enterprise */

import { type RowLevelPermissionPredicateOperand } from '@/types/RowLevelPermissionPredicateOperand';
import { type RowLevelPermissionPredicateValue } from '@/types/RowLevelPermissionPredicateValue';

export type RowLevelPermissionPredicate = {
  id: string;
  fieldMetadataId: string;
  objectMetadataId: string;
  operand: RowLevelPermissionPredicateOperand;
  value: RowLevelPermissionPredicateValue;
  subFieldName: string | null;
  workspaceMemberFieldMetadataId: string | null;
  workspaceMemberSubFieldName: string | null;
  roleId: string;
};
