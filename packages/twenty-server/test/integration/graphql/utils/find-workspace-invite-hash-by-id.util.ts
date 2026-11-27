export const findWorkspaceInviteHashById = async (
  workspaceId: string,
): Promise<string> => {
  const [{ inviteHash }] = await globalThis.testDataSource.query(
    `SELECT "inviteHash" FROM core."workspace" WHERE id = $1`,
    [workspaceId],
  );

  expect(inviteHash).toEqual(expect.stringMatching(/.+/));

  return inviteHash;
};
