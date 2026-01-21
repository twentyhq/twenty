import { type RestrictedFieldsPermissions } from './RestrictedFieldsPermissions';
import { type RowLevelPermissionPredicate } from './RowLevelPermissionPredicate';
import { type RowLevelPermissionPredicateGroup } from './RowLevelPermissionPredicateGroup';

export type ObjectPermissions = {
  canReadObjectRecords: boolean;
  canUpdateObjectRecords: boolean;
  canSoftDeleteObjectRecords: boolean;
  canDestroyObjectRecords: boolean;
  restrictedFields: RestrictedFieldsPermissions;
  rowLevelPermissionPredicates: RowLevelPermissionPredicate[];
  rowLevelPermissionPredicateGroups: RowLevelPermissionPredicateGroup[];
};
