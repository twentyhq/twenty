import { type AllRecordsPermissionsManifest } from 'twenty-shared/application';

export const NO_ALL_RECORDS_PERMISSIONS = {
  canReadAllRecords: false,
  canCreateAllRecords: false,
  canUpdateAllRecords: false,
  canSoftDeleteAllRecords: false,
  canDestroyAllRecords: false,
} as const satisfies AllRecordsPermissionsManifest;
