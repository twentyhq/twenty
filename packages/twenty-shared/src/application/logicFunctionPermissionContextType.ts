export enum ObjectPermissionLevel {
  READ = 'READ',
  UPDATE = 'UPDATE',
  SOFT_DELETE = 'SOFT_DELETE',
  DESTROY = 'DESTROY',
}

export enum FieldPermissionLevel {
  READ = 'READ',
  UPDATE = 'UPDATE',
}

export type LogicFunctionObjectPermissions = {
  canRead: boolean;
  canUpdate: boolean;
  canSoftDelete: boolean;
  canDestroy: boolean;
  restrictedFields: Record<
    string,
    { canRead?: boolean | null; canUpdate?: boolean | null }
  >;
};

export type LogicFunctionPermissionContext = {
  canReadAllObjectRecords: boolean;
  canUpdateAllObjectRecords: boolean;
  canSoftDeleteAllObjectRecords: boolean;
  canDestroyAllObjectRecords: boolean;
  canUpdateAllSettings: boolean;
  canAccessAllTools: boolean;
  permissionFlags: Record<string, boolean>;
  objectsPermissions: Record<string, LogicFunctionObjectPermissions>;
};
