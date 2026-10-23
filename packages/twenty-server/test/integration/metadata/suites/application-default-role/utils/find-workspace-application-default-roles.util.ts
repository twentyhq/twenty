import { TWENTY_STANDARD_APPLICATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-standard-applications';

export type ApplicationDefaultRole = {
  applicationId: string;
  roleId: string;
  roleApplicationId: string;
  label: string;
  roleUniversalIdentifier: string;
  isEditable: boolean;
  canUpdateAllSettings: boolean;
  canAccessAllTools: boolean;
  canAccessAllAgentChatChannels: boolean;
  canReadAllObjectRecords: boolean;
  canUpdateAllObjectRecords: boolean;
  canSoftDeleteAllObjectRecords: boolean;
  canDestroyAllObjectRecords: boolean;
  canBeAssignedToUsers: boolean;
  canBeAssignedToAgents: boolean;
  canBeAssignedToApiKeys: boolean;
};

const ROLE_COLUMNS = `
  r.id AS "roleId",
  r."applicationId" AS "roleApplicationId",
  r.label,
  r."universalIdentifier" AS "roleUniversalIdentifier",
  r."isEditable",
  r."canUpdateAllSettings",
  r."canAccessAllTools",
  r."canAccessAllAgentChatChannels",
  r."canReadAllObjectRecords",
  r."canUpdateAllObjectRecords",
  r."canSoftDeleteAllObjectRecords",
  r."canDestroyAllObjectRecords",
  r."canBeAssignedToUsers",
  r."canBeAssignedToAgents",
  r."canBeAssignedToApiKeys"
`;

export const findWorkspaceApplicationDefaultRoles = async (
  workspaceId: string,
): Promise<{
  standardApplicationRole: ApplicationDefaultRole | undefined;
  customApplicationRole: ApplicationDefaultRole | undefined;
}> => {
  const rows: (ApplicationDefaultRole & { isStandard: boolean })[] =
    await globalThis.testDataSource.query(
      `SELECT a.id AS "applicationId",
              a."universalIdentifier" = $2 AS "isStandard",
              ${ROLE_COLUMNS}
       FROM core.application a
       JOIN core.workspace w ON w.id = a."workspaceId"
       LEFT JOIN core.role r ON r.id = a."defaultRoleId"
       WHERE a."workspaceId" = $1
         AND (a."universalIdentifier" = $2 OR a.id = w."workspaceCustomApplicationId")`,
      [workspaceId, TWENTY_STANDARD_APPLICATION.universalIdentifier],
    );

  const toRole = (row: (typeof rows)[number] | undefined) => {
    if (row === undefined) {
      return undefined;
    }

    const { isStandard: _isStandard, ...role } = row;

    return role;
  };

  return {
    standardApplicationRole: toRole(rows.find((row) => row.isStandard)),
    customApplicationRole: toRole(rows.find((row) => !row.isStandard)),
  };
};
