/* @license Enterprise */

import { type RowLevelPermissionPredicateGroupLogicalOperator } from '@/types/RowLevelPermissionPredicateGroupLogicalOperator';

export type RowLevelPermissionPredicateGroup = {
  id: string;
  logicalOperator: RowLevelPermissionPredicateGroupLogicalOperator;
  objectMetadataId: string;
  parentRowLevelPermissionPredicateGroupId: string | null;
  positionInRowLevelPermissionPredicateGroup: number | null;
  canReadRecords: boolean;
  canUpdateRecords: boolean;
  canSoftDeleteRecords: boolean;
  canDestroyRecords: boolean;
  roleId: string;
};
