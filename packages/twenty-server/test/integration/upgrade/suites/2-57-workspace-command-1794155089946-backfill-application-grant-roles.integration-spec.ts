import { findWorkspaceCustomApplicationId } from 'test/integration/metadata/suites/application-default-role/utils/find-application-default-role.util';
import {
  findApplicationDefaultRoleId,
  findApplicationGrantRole,
  findApplicationIdByUniversalIdentifier,
  findRolePermissionSnapshot,
} from 'test/integration/metadata/suites/application-grant-role/utils/find-application-grant-role.util';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { v4 as uuidv4 } from 'uuid';

import { type BackfillApplicationGrantRolesCommand } from 'src/database/commands/upgrade-version-command/2-57/2-57-workspace-command-1794155089946-backfill-application-grant-roles.command';
import { type ApplicationGrantRoleService } from 'src/engine/core-modules/application/application-grant-role/services/application-grant-role.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { TWENTY_STANDARD_APPLICATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-standard-applications';

jest.setTimeout(120000);

const APPLICATION_UNIVERSAL_IDENTIFIER = uuidv4();
const ROLE_UNIVERSAL_IDENTIFIER = uuidv4();

describe('2-57 workspace command - backfill application grants (integration)', () => {
  let command: BackfillApplicationGrantRolesCommand;
  let applicationIds: string[];

  const runOnWorkspace = (options: { dryRun?: boolean } = {}) =>
    command.runOnWorkspace({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      options,
      index: 0,
      total: 1,
      dataSource: global.testDataSource,
    });

  const findGrantRoles = () =>
    Promise.all(
      applicationIds.map((applicationId) =>
        findApplicationGrantRole({
          applicationId,
          workspaceId: SEED_APPLE_WORKSPACE_ID,
        }),
      ),
    );

  beforeAll(async () => {
    command = getAppProviderByClassName<BackfillApplicationGrantRolesCommand>(
      'BackfillApplicationGrantRolesCommand',
    );

    await setupApplicationForSync({
      applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
      name: 'Grant Backfill',
      description: 'App for testing the application grant backfill',
      sourcePath: 'test-application-grant-backfill',
    });

    jest.useRealTimers();

    const { errors } = await syncApplication({
      manifest: buildBaseManifest({
        appId: APPLICATION_UNIVERSAL_IDENTIFIER,
        roleId: ROLE_UNIVERSAL_IDENTIFIER,
        overrides: {
          roles: [
            {
              universalIdentifier: ROLE_UNIVERSAL_IDENTIFIER,
              label: 'Grant backfill requested role',
              objectPermissions: [
                {
                  objectUniversalIdentifier:
                    STANDARD_OBJECTS.opportunity.universalIdentifier,
                  canReadObjectRecords: true,
                },
              ],
            },
          ],
        },
      }),
      expectToFail: false,
    });

    expect(errors).toBeUndefined();

    applicationIds = await Promise.all(
      [
        TWENTY_STANDARD_APPLICATION.universalIdentifier,
        APPLICATION_UNIVERSAL_IDENTIFIER,
      ].map(
        async (universalIdentifier) =>
          (await findApplicationIdByUniversalIdentifier({
            universalIdentifier,
          }))!,
      ),
    );

    const applicationGrantRoleService =
      getAppProviderByClassName<ApplicationGrantRoleService>(
        'ApplicationGrantRoleService',
      );

    for (const applicationId of applicationIds) {
      await applicationGrantRoleService.deleteGrantRole({
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        applicationId,
      });
    }
  });

  afterAll(async () => {
    await runOnWorkspace();
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
    });
    jest.useFakeTimers();
  });

  it('writes nothing on a dry run', async () => {
    await runOnWorkspace({ dryRun: true });

    expect(await findGrantRoles()).toEqual([undefined, undefined]);
  });

  it('gives twenty-standard and the installed application a grant equal to their requested role', async () => {
    await runOnWorkspace();

    const grants = await findGrantRoles();
    const workspaceCustomApplicationId =
      await findWorkspaceCustomApplicationId();

    for (const [index, grant] of grants.entries()) {
      expect(grant?.role).toMatchObject({
        applicationId: workspaceCustomApplicationId,
        isEditable: false,
        canBeAssignedToUsers: false,
        canBeAssignedToApiKeys: false,
        canBeAssignedToAgents: false,
        canBeAssignedToApplications: true,
      });
      expect(grant?.roleTarget.applicationId).toBe(
        workspaceCustomApplicationId,
      );
      expect(await findRolePermissionSnapshot(grant!.role.id)).toEqual(
        await findRolePermissionSnapshot(
          await findApplicationDefaultRoleId({
            applicationId: applicationIds[index],
          }),
        ),
      );
    }
  });

  it('leaves existing grants untouched on a second run', async () => {
    const grantsBefore = await findGrantRoles();

    await runOnWorkspace();

    expect(await findGrantRoles()).toEqual(grantsBefore);
  });
});
