import { type ObjectRecordsPermissions } from 'src/engine/permissions/types/object-records-permissions.type';

type ObjectMetadataId = string;

export type RoleRecordsPermissions = {
  canReadAllRecords: boolean;
  canUpdateAllRecords: boolean;
  canSoftDeleteAllRecords: boolean;
  canDestroyAllRecords: boolean;
  objects: Partial<Record<ObjectMetadataId, ObjectRecordsPermissions>>;
};
