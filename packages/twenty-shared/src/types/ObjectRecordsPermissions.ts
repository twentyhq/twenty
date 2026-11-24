import { type RowLevelRecordsPermissions } from '@/types/RowLevelRecordsPermissions';

export type UnreadableNestedFieldPermission = {
  fieldMetadataId: string;
  sourceFieldMetadataId: string;
};

export type ObjectRecordsPermissions = {
  canCreateAllRecords: boolean;
  canReadAllRecords: boolean;
  canUpdateAllRecords: boolean;
  canSoftDeleteAllRecords: boolean;
  canDestroyAllRecords: boolean;
  unreadableFields: string[];
  uneditableFields: string[];
  unreadableNestedFields?: UnreadableNestedFieldPermission[];
  rowLevelRecordsPermissions?: RowLevelRecordsPermissions[] | null;
  canReadSomeRecords?: boolean;
};
