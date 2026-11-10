import { type RowLevelPermissionPredicate } from '@/types/RowLevelPermissionPredicate';
import { type RowLevelPermissionPredicateGroup } from '@/types/RowLevelPermissionPredicateGroup';

// One row level permission rule: the records matching its predicates get its operations and field lists
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
