import { WORKSPACE_MEMBER_INDIVIDUAL_ROLE_LABEL_PREFIX } from 'src/engine/permissions/workspace-member-individual-role/constants/workspace-member-individual-role.constant';

export const findUserWorkspaceRoleTargets = ({
  userWorkspaceId,
}: {
  userWorkspaceId: string;
}): Promise<{ roleId: string }[]> =>
  globalThis.testDataSource.query(
    `SELECT "roleTarget"."roleId" FROM core."roleTarget" AS "roleTarget"
     JOIN core."role" AS "role" ON "role"."id" = "roleTarget"."roleId"
     WHERE "roleTarget"."userWorkspaceId" = $1
       AND NOT ("role"."isSystemSideEffect" AND "role"."label" LIKE $2)`,
    [userWorkspaceId, `${WORKSPACE_MEMBER_INDIVIDUAL_ROLE_LABEL_PREFIX}%`],
  );
