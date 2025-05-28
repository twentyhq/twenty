export type ObjectRecordsPermissions = {
  [objectMetadataId: string]: {
    canRead: boolean;
    canUpdate: boolean;
    canSoftDelete: boolean;
    canDestroy: boolean;
  };
};
