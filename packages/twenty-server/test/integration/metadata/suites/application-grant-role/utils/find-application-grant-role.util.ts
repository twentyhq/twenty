import { findOneApplication } from 'test/integration/metadata/suites/application/utils/find-one-application.util';
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

export type ApplicationGrantRole = {
  role: RoleRow;
  roleTarget: { id: string; applicationId: string };
};

export const findApplicationIdByUniversalIdentifier = async ({
  universalIdentifier,
  token,
}: {
  universalIdentifier: string;
  token?: string;
}): Promise<string | undefined> => {
  const { data } = await findOneApplication({
    input: { universalIdentifier },
    expectToFail: false,
    token,
  });

  return data?.findOneApplication?.id;
};

export const findApplicationGrantRole = async ({
  applicationId,
  workspaceId,
}: {
  applicationId: string;
  workspaceId: string;
}): Promise<ApplicationGrantRole | undefined> => {
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

export const findApplicationDefaultRoleId = async ({
  applicationId,
  token,
}: {
  applicationId: string;
  token?: string;
}): Promise<string> => {
  const { data } = await findOneApplication({
    input: { id: applicationId },
    gqlFields: 'id defaultRoleId',
    expectToFail: false,
    token,
  });

  const defaultRoleId = data?.findOneApplication?.defaultRoleId;

  if (!isDefined(defaultRoleId)) {
    throw new Error(`Application ${applicationId} has no default role`);
  }

  return defaultRoleId;
};

const sortByKey = <TRow extends Record<string, unknown>>(rows: TRow[]) =>
  [...rows].sort((left, right) =>
    JSON.stringify(left).localeCompare(JSON.stringify(right)),
  );

export const findRolePermissionSnapshot = async (roleId: string) => {
  const query = (sql: string) => globalThis.testDataSource.query(sql, [roleId]);

  const [switches] = await query(
    `SELECT "canUpdateAllSettings", "canAccessAllTools", "canAccessAllAgentChatChannels",
            "canReadAllObjectRecords", "canCreateAllObjectRecords", "canUpdateAllObjectRecords",
            "canSoftDeleteAllObjectRecords", "canDestroyAllObjectRecords"
     FROM core."role" WHERE id = $1`,
  );

  const objectPermissions = await query(
    `SELECT "objectMetadataId", "canReadObjectRecords", "canCreateObjectRecords", "canUpdateObjectRecords",
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
    `SELECT predicate."objectMetadataId", predicate."fieldMetadataId",
            predicate."relationFieldMetadataId", predicate.operand, predicate.value,
            predicate."subFieldName", predicate."workspaceMemberFieldMetadataId",
            predicate."workspaceMemberSubFieldName",
            predicate."positionInRowLevelPermissionPredicateGroup",
            "group"."logicalOperator" AS "groupLogicalOperator",
            "group"."positionInRowLevelPermissionPredicateGroup" AS "groupPosition"
     FROM core."rowLevelPermissionPredicate" AS predicate
     LEFT JOIN core."rowLevelPermissionPredicateGroup" AS "group"
       ON "group".id = predicate."rowLevelPermissionPredicateGroupId"
     WHERE predicate."roleId" = $1 AND predicate."deletedAt" IS NULL`,
  );

  const rowLevelPermissionPredicateGroups = await query(
    `SELECT "group"."objectMetadataId", "group"."logicalOperator",
            "group"."positionInRowLevelPermissionPredicateGroup",
            "group"."canReadRecords", "group"."canCreateRecords", "group"."canUpdateRecords",
            "group"."canSoftDeleteRecords", "group"."canDestroyRecords",
            parent."logicalOperator" AS "parentLogicalOperator",
            parent."positionInRowLevelPermissionPredicateGroup" AS "parentPosition"
     FROM core."rowLevelPermissionPredicateGroup" AS "group"
     LEFT JOIN core."rowLevelPermissionPredicateGroup" AS parent
       ON parent.id = "group"."parentRowLevelPermissionPredicateGroupId"
     WHERE "group"."roleId" = $1 AND "group"."deletedAt" IS NULL`,
  );

  return {
    switches,
    objectPermissions: sortByKey(objectPermissions),
    fieldPermissions: sortByKey(fieldPermissions),
    permissionFlags: sortByKey(permissionFlags),
    rowLevelPermissionPredicates: sortByKey(rowLevelPermissionPredicates),
    rowLevelPermissionPredicateGroups: sortByKey(
      rowLevelPermissionPredicateGroups,
    ),
  };
};
