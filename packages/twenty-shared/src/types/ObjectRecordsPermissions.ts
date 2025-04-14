export type ObjectRecordsPermissions = {
  [objectName: string]: {
    canRead: boolean;
    canUpdate: boolean;
    canSoftDelete: boolean;
    canDestroy: boolean;
  };
};
