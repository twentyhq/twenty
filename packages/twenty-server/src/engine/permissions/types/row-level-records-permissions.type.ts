import {
  type RowLevelPermissionPredicate,
  type RowLevelPermissionPredicateGroup,
} from 'twenty-shared/types';

export type RowLevelRecordsPermissions = {
  canReadRecords: boolean;
  canUpdateRecords: boolean;
  canSoftDeleteRecords: boolean;
  canDestroyRecords: boolean;
  predicates: RowLevelPermissionPredicate[];
  predicateGroups: RowLevelPermissionPredicateGroup[];
};
