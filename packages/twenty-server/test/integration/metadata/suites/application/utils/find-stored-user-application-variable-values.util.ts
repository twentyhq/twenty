export const findStoredUserApplicationVariableValues = async ({
  applicationId,
  userWorkspaceId,
}: {
  applicationId: string;
  userWorkspaceId: string;
}): Promise<{ value: string }[]> =>
  global.testDataSource.query(
    `SELECT "userValue"."value"
       FROM "core"."userApplicationVariableValue" "userValue"
       JOIN "core"."applicationVariable" "variable"
         ON "variable"."id" = "userValue"."applicationVariableId"
      WHERE "variable"."applicationId" = $1
        AND "userValue"."userWorkspaceId" = $2`,
    [applicationId, userWorkspaceId],
  );
