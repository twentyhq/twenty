import { type RowLevelPermissionPredicate } from '@/types/RowLevelPermissionPredicate';
import { type RowLevelPermissionPredicateGroup } from '@/types/RowLevelPermissionPredicateGroup';

export type RowLevelRecordsPermissions = {
  ruleId: string;
  canCreateRecords: boolean;
  canReadRecords: boolean;
  canUpdateRecords: boolean;
  canSoftDeleteRecords: boolean;
  canDestroyRecords: boolean;
  predicates: RowLevelPermissionPredicate[];
  predicateGroups: RowLevelPermissionPredicateGroup[];
  unreadableFields: string[];
  uneditableFields: string[];
};
