import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

export const findAppleWorkspaceInviteHash = async (): Promise<string> => {
  const [{ inviteHash }] = await globalThis.testDataSource.query(
    `SELECT "inviteHash" FROM core."workspace" WHERE id = $1`,
    [SEED_APPLE_WORKSPACE_ID],
  );

  expect(inviteHash).toEqual(expect.stringMatching(/.+/));

  return inviteHash;
};
