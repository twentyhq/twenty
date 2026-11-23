import { type RowLevelRecordsPermissions } from '@/types/RowLevelRecordsPermissions';

export type InheritedFieldPermission = {
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
  inheritedFields?: InheritedFieldPermission[];
  rowLevelRecordsPermissions?: RowLevelRecordsPermissions[] | null;
  canReadSomeRecords?: boolean;
};
