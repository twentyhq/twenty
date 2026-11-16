// Account state that has no dedicated GraphQL surface

export const countUserWorkspaceMemberships = async ({
  email,
  workspaceId,
}: {
  email: string;
  workspaceId: string;
}): Promise<number> => {
  const rows = await globalThis.testDataSource.query(
    `SELECT COUNT(*)::int AS count
       FROM core."userWorkspace" uw
       JOIN core."user" u ON u.id = uw."userId"
      WHERE u.email = $1 AND uw."workspaceId" = $2`,
    [email, workspaceId],
  );

  return rows[0].count;
};

export const getUserIsEmailVerified = async (
  email: string,
): Promise<boolean | null> => {
  const rows = await globalThis.testDataSource.query(
    `SELECT "isEmailVerified" FROM core."user" WHERE email = $1`,
    [email],
  );

  return rows.length > 0 ? rows[0].isEmailVerified : null;
};

export const setUserCanAccessFullAdminPanel = async ({
  email,
  canAccessFullAdminPanel,
}: {
  email: string;
  canAccessFullAdminPanel: boolean;
}): Promise<void> => {
  await globalThis.testDataSource.query(
    `UPDATE core."user" SET "canAccessFullAdminPanel" = $2 WHERE email = $1`,
    [email, canAccessFullAdminPanel],
  );
};

export const deleteUserWorkspaceMembership = async ({
  email,
  workspaceId,
}: {
  email: string;
  workspaceId: string;
}): Promise<void> => {
  await globalThis.testDataSource.query(
    `DELETE FROM core."userWorkspace" uw
      USING core."user" u
      WHERE uw."userId" = u.id AND u.email = $1 AND uw."workspaceId" = $2`,
    [email, workspaceId],
  );
};

export const deleteUserByEmail = async (email: string): Promise<void> => {
  await globalThis.testDataSource.query(
    `DELETE FROM core."user" WHERE email = $1`,
    [email],
  );
};
