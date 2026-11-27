import {
  findApplicationGrantRole,
  findApplicationIdByUniversalIdentifier,
  findRolePermissionSnapshot,
} from 'test/integration/metadata/suites/application-grant-role/utils/find-application-grant-role.util';
import { findApplicationRoleIds } from 'test/integration/metadata/suites/application-grant-role/utils/find-application-role-ids.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { type RemoveTwentyStandardApplicationRoleCommand } from 'src/database/commands/upgrade-version-command/2-66/2-66-workspace-command-1795791151025-remove-twenty-standard-application-role.command';
import { type ApplicationGrantRoleService } from 'src/engine/core-modules/application/application-grant-role/services/application-grant-role.service';
import { type ApplicationService } from 'src/engine/core-modules/application/application.service';
import { ADMIN_ROLE_UNIVERSAL_IDENTIFIER } from 'src/engine/metadata-modules/role/constants/admin-role-universal-identifier.constant';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { TWENTY_STANDARD_APPLICATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-standard-applications';

jest.setTimeout(120000);

describe('2-66 workspace command 1795791151025 - RemoveTwentyStandardApplicationRoleCommand (integration)', () => {
  let command: RemoveTwentyStandardApplicationRoleCommand;
  let twentyStandardApplicationId: string;
  let adminRoleId: string;

  const runOnWorkspace = (options: { dryRun?: boolean } = {}) =>
    command.runOnWorkspace({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      options,
      index: 0,
      total: 1,
    });

  const findTwentyStandardRoles = async () => {
    const { requestedRoleId, grantRoleId } = await findApplicationRoleIds({
      input: { id: twentyStandardApplicationId },
    });
    const grant = await findApplicationGrantRole({
      applicationId: twentyStandardApplicationId,
      workspaceId: SEED_APPLE_WORKSPACE_ID,
    });

    return { requestedRoleId, grantRoleId, grant };
  };

  const findRoleCount = async (roleId: string) => {
    const [{ count }] = await globalThis.testDataSource.query(
      'SELECT COUNT(*)::int AS count FROM core."role" WHERE id = $1',
      [roleId],
    );

    return count;
  };

  const requestAdminWithGrantRole = async () => {
    await getAppProviderByClassName<ApplicationService>(
      'ApplicationService',
    ).update(twentyStandardApplicationId, {
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      requestedRoleId: adminRoleId,
    });
    await getAppProviderByClassName<ApplicationGrantRoleService>(
      'ApplicationGrantRoleService',
    ).upsertGrantRole({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      applicationId: twentyStandardApplicationId,
      isRequestedRoleDeclaredWithLegacyProperties: false,
    });
  };

  beforeAll(async () => {
    jest.useRealTimers();

    command =
      getAppProviderByClassName<RemoveTwentyStandardApplicationRoleCommand>(
        'RemoveTwentyStandardApplicationRoleCommand',
      );

    twentyStandardApplicationId = (await findApplicationIdByUniversalIdentifier(
      { universalIdentifier: TWENTY_STANDARD_APPLICATION.universalIdentifier },
    ))!;

    const [adminRole] = await globalThis.testDataSource.query(
      'SELECT id FROM core."role" WHERE "universalIdentifier" = $1 AND "workspaceId" = $2',
      [ADMIN_ROLE_UNIVERSAL_IDENTIFIER, SEED_APPLE_WORKSPACE_ID],
    );

    adminRoleId = adminRole.id;
  });

  afterAll(async () => {
    await runOnWorkspace();
    jest.useFakeTimers();
  });

  describe('when twenty-standard requests Admin and has a grant role', () => {
    let grantRoleId: string;
    let adminPermissionSnapshotBefore: Awaited<
      ReturnType<typeof findRolePermissionSnapshot>
    >;

    beforeAll(async () => {
      await requestAdminWithGrantRole();

      const { requestedRoleId, grant } = await findTwentyStandardRoles();

      expect(requestedRoleId).toBe(adminRoleId);
      expect(grant).toBeDefined();

      grantRoleId = grant!.role.id;
      adminPermissionSnapshotBefore =
        await findRolePermissionSnapshot(adminRoleId);
    });

    it('writes nothing on a dry run', async () => {
      await runOnWorkspace({ dryRun: true });

      expect(await findTwentyStandardRoles()).toMatchObject({
        requestedRoleId: adminRoleId,
        grantRoleId,
      });
    });

    it('clears the requested role and deletes the grant role and its target', async () => {
      await runOnWorkspace();

      expect(await findTwentyStandardRoles()).toEqual({
        requestedRoleId: null,
        grantRoleId: null,
        grant: undefined,
      });
      expect(await findRoleCount(grantRoleId)).toBe(0);
    });

    it('leaves the Admin role untouched', async () => {
      expect(await findRoleCount(adminRoleId)).toBe(1);
      expect(await findRolePermissionSnapshot(adminRoleId)).toEqual(
        adminPermissionSnapshotBefore,
      );
    });

    it('changes nothing on a second run', async () => {
      await runOnWorkspace();

      expect(await findTwentyStandardRoles()).toEqual({
        requestedRoleId: null,
        grantRoleId: null,
        grant: undefined,
      });
    });
  });

  describe('when an interrupted run left the grant role behind', () => {
    beforeAll(async () => {
      await requestAdminWithGrantRole();
      await globalThis.testDataSource.query(
        'UPDATE core."application" SET "requestedRoleId" = NULL WHERE id = $1',
        [twentyStandardApplicationId],
      );
      await getAppProviderByClassName<WorkspaceCacheService>(
        'WorkspaceCacheService',
      ).invalidateAndRecompute(SEED_APPLE_WORKSPACE_ID, [
        'flatApplicationMaps',
      ]);
    });

    it('deletes the grant role', async () => {
      expect((await findTwentyStandardRoles()).grant).toBeDefined();

      await runOnWorkspace();

      expect(await findTwentyStandardRoles()).toEqual({
        requestedRoleId: null,
        grantRoleId: null,
        grant: undefined,
      });
    });
  });
});
