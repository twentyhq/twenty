type ObjectMetadataId = string;

export type RoleRecordsPermissions = {
  canReadAllRecords: boolean;
  canUpdateAllRecords: boolean;
  canSoftDeleteAllRecords: boolean;
  canDestroyAllRecords: boolean;
  objects: Partial<
    Record<
      ObjectMetadataId,
      ObjectRecordsPermissions & { insertFieldExemptionIds?: string[] }
    >
  >;
};
import { type ObjectRecordsPermissions } from 'twenty-shared/types';
