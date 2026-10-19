import { deleteOneRole } from 'test/integration/metadata/suites/role/utils/delete-one-role.util';
import { findOneRoleByLabel } from 'test/integration/metadata/suites/role/utils/find-one-role-by-label.util';

import { PermissionsExceptionCode } from 'src/engine/metadata-modules/permissions/permissions.exception';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_WORKSPACE_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-user-workspaces.util';

const setWorkspaceDefaultRoleId = (roleId: string) =>
  global.testDataSource.query(
    `UPDATE core."workspace" SET "defaultRoleId" = $1 WHERE id = $2`,
    [roleId, SEED_APPLE_WORKSPACE_ID],
  );

describe('Member role deletion should fail', () => {
  let adminRoleId: string;
  let memberRoleId: string;

  beforeAll(async () => {
    adminRoleId = (await findOneRoleByLabel({ label: 'Admin' })).id;
    memberRoleId = (await findOneRoleByLabel({ label: 'Member' })).id;

    await setWorkspaceDefaultRoleId(adminRoleId);
  });

  afterAll(async () => {
    await setWorkspaceDefaultRoleId(memberRoleId);
  });

  it('should refuse deleting Member without moving its members', async () => {
    const { errors } = await deleteOneRole({
      expectToFail: true,
      input: { idToDelete: memberRoleId },
    });

    expect(errors?.[0]?.extensions?.subCode).toBe(
      PermissionsExceptionCode.MEMBER_ROLE_CANNOT_BE_DELETED,
    );

    const roleTargets: { roleId: string }[] = await global.testDataSource.query(
      `SELECT "roleId" FROM core."roleTarget" WHERE "workspaceId" = $1 AND "userWorkspaceId" = $2`,
      [SEED_APPLE_WORKSPACE_ID, USER_WORKSPACE_DATA_SEED_IDS.JONY],
    );

    expect(roleTargets).toEqual([{ roleId: memberRoleId }]);
  });
});
