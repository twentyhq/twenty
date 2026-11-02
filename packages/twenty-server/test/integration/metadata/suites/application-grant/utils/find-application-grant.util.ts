import { isDefined } from 'twenty-shared/utils';

type RoleRow = {
  id: string;
  label: string;
  applicationId: string;
  isEditable: boolean;
  canBeAssignedToUsers: boolean;
  canBeAssignedToAgents: boolean;
  canBeAssignedToApiKeys: boolean;
  canBeAssignedToApplications: boolean;
};

export type ApplicationGrant = {
  role: RoleRow;
  roleTarget: { id: string; applicationId: string };
};

export const findWorkspaceCustomApplicationIdFromDatabase = async (
  workspaceId: string,
): Promise<string> => {
  const [workspace] = await globalThis.testDataSource.query(
    `SELECT "workspaceCustomApplicationId" FROM core."workspace" WHERE id = $1`,
    [workspaceId],
  );

  return workspace.workspaceCustomApplicationId;
};

export const findApplicationIdByUniversalIdentifier = async ({
  universalIdentifier,
  workspaceId,
}: {
  universalIdentifier: string;
  workspaceId: string;
}): Promise<string | undefined> => {
  const [application] = await globalThis.testDataSource.query(
    `SELECT id FROM core."application"
     WHERE "universalIdentifier" = $1 AND "workspaceId" = $2`,
    [universalIdentifier, workspaceId],
  );

  return application?.id;
};

export const findApplicationGrant = async ({
  applicationId,
  workspaceId,
}: {
  applicationId: string;
  workspaceId: string;
}): Promise<ApplicationGrant | undefined> => {
  const [row] = await globalThis.testDataSource.query(
    `SELECT "roleTarget".id AS "roleTargetId",
            "roleTarget"."applicationId" AS "roleTargetApplicationId",
            role.id, role.label, role."applicationId", role."isEditable",
            role."canBeAssignedToUsers", role."canBeAssignedToAgents",
            role."canBeAssignedToApiKeys", role."canBeAssignedToApplications"
     FROM core."roleTarget" AS "roleTarget"
     JOIN core."role" AS role ON role.id = "roleTarget"."roleId"
     WHERE "roleTarget"."targetApplicationId" = $1
       AND "roleTarget"."workspaceId" = $2`,
    [applicationId, workspaceId],
  );

  if (!isDefined(row)) {
    return undefined;
  }

  const { roleTargetId, roleTargetApplicationId, ...role } = row;

  return {
    role,
    roleTarget: { id: roleTargetId, applicationId: roleTargetApplicationId },
  };
};

export const findApplicationDefaultRoleId = async (
  applicationId: string,
): Promise<string> => {
  const [application] = await globalThis.testDataSource.query(
    `SELECT "defaultRoleId" FROM core."application" WHERE id = $1`,
    [applicationId],
  );

  return application.defaultRoleId;
};

const sortByKey = <TRow extends Record<string, unknown>>(rows: TRow[]) =>
  [...rows].sort((left, right) =>
    JSON.stringify(left).localeCompare(JSON.stringify(right)),
  );

export const findRolePermissionSnapshot = async (roleId: string) => {
  const query = (sql: string) => globalThis.testDataSource.query(sql, [roleId]);

  const [switches] = await query(
    `SELECT "canUpdateAllSettings", "canAccessAllTools", "canAccessAllAgentChatChannels",
            "canReadAllObjectRecords", "canUpdateAllObjectRecords",
            "canSoftDeleteAllObjectRecords", "canDestroyAllObjectRecords"
     FROM core."role" WHERE id = $1`,
  );

  const objectPermissions = await query(
    `SELECT "objectMetadataId", "canReadObjectRecords", "canUpdateObjectRecords",
            "canSoftDeleteObjectRecords", "canDestroyObjectRecords"
     FROM core."objectPermission" WHERE "roleId" = $1`,
  );

  const fieldPermissions = await query(
    `SELECT "objectMetadataId", "fieldMetadataId", "canReadFieldValue", "canUpdateFieldValue"
     FROM core."fieldPermission" WHERE "roleId" = $1`,
  );

  const permissionFlags = await query(
    `SELECT "permissionFlagId" FROM core."rolePermissionFlag" WHERE "roleId" = $1`,
  );

  const rowLevelPermissionPredicates = await query(
    `SELECT "objectMetadataId", "fieldMetadataId", operand, value, "subFieldName",
            "workspaceMemberFieldMetadataId", "workspaceMemberSubFieldName",
            "positionInRowLevelPermissionPredicateGroup",
            "rowLevelPermissionPredicateGroupId" IS NOT NULL AS "isInGroup"
     FROM core."rowLevelPermissionPredicate"
     WHERE "roleId" = $1 AND "deletedAt" IS NULL`,
  );

  return {
    switches,
    objectPermissions: sortByKey(objectPermissions),
    fieldPermissions: sortByKey(fieldPermissions),
    permissionFlags: sortByKey(permissionFlags),
    rowLevelPermissionPredicates: sortByKey(rowLevelPermissionPredicates),
  };
};
