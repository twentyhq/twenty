type ObjectMetadataId = string;
export type ObjectRecordsPermissions = Record<ObjectMetadataId, {
    canRead: boolean;
    canUpdate: boolean;
    canSoftDelete: boolean;
    canDestroy: boolean;
  }>;
