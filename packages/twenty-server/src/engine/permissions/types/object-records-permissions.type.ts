import { type RestrictedFieldsPermissions } from 'twenty-shared/types';

import { type RowLevelRecordsPermissions } from 'src/engine/permissions/types/row-level-records-permissions.type';

export type ObjectRecordsPermissions = {
  canReadAllRecords: boolean;
  canUpdateAllRecords: boolean;
  canSoftDeleteAllRecords: boolean;
  canDestroyAllRecords: boolean;
  restrictedFields: RestrictedFieldsPermissions;
  rowLevelRecordsPermissions?: RowLevelRecordsPermissions;
};
