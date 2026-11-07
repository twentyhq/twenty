import { type RestrictedFieldsPermissions } from '@/types/RestrictedFieldsPermissions';
import { type RowLevelRecordsPermissions } from '@/types/RowLevelRecordsPermissions';

export type ObjectRecordsPermissions = {
  canCreateAllRecords: boolean;
  canReadAllRecords: boolean;
  canUpdateAllRecords: boolean;
  canSoftDeleteAllRecords: boolean;
  canDestroyAllRecords: boolean;
  restrictedFields: RestrictedFieldsPermissions;
  rowLevelRecordsPermissions?: RowLevelRecordsPermissions | null;
};
