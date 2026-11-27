type RoleGrants = {
  canUpdateAllSettings: boolean;
  canAccessAllTools: boolean;
  canReadAllObjectRecords: boolean;
  canCreateAllObjectRecords: boolean;
  canUpdateAllObjectRecords: boolean;
  canSoftDeleteAllObjectRecords: boolean;
  canDestroyAllObjectRecords: boolean;
  permissionFlagCount: number;
  objectPermissionCount: number;
};

export const ROLE_WITHOUT_GRANTS: RoleGrants = {
  canUpdateAllSettings: false,
  canAccessAllTools: false,
  canReadAllObjectRecords: false,
  canCreateAllObjectRecords: false,
  canUpdateAllObjectRecords: false,
  canSoftDeleteAllObjectRecords: false,
  canDestroyAllObjectRecords: false,
  permissionFlagCount: 0,
  objectPermissionCount: 0,
};

export const findRoleGrants = async (
  roleId: string,
): Promise<RoleGrants | undefined> => {
  const [roleGrants] = await globalThis.testDataSource.query(
    `SELECT "canUpdateAllSettings", "canAccessAllTools",
            "canReadAllObjectRecords", "canCreateAllObjectRecords",
            "canUpdateAllObjectRecords", "canSoftDeleteAllObjectRecords",
            "canDestroyAllObjectRecords",
            (SELECT COUNT(*)::int FROM core."rolePermissionFlag"
             WHERE "roleId" = role.id) AS "permissionFlagCount",
            (SELECT COUNT(*)::int FROM core."objectPermission"
             WHERE "roleId" = role.id) AS "objectPermissionCount"
     FROM core."role" role WHERE role.id = $1`,
    [roleId],
  );

  return roleGrants;
};
