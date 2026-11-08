import {
  findApplicationDefaultRoleId,
  findApplicationGrant,
  findApplicationIdByUniversalIdentifier,
  findRolePermissionSnapshot,
  findWorkspaceCustomApplicationIdFromDatabase,
} from 'test/integration/metadata/suites/application-grant/utils/find-application-grant.util';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { v4 as uuidv4 } from 'uuid';

import { type BackfillApplicationGrantsCommand } from 'src/database/commands/upgrade-version-command/2-57/2-57-workspace-command-1794140266339-backfill-application-grants.command';
import { type ApplicationGrantService } from 'src/engine/core-modules/application/application-grant/services/application-grant.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { TWENTY_STANDARD_APPLICATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-standard-applications';

jest.setTimeout(120000);

const APPLICATION_UNIVERSAL_IDENTIFIER = uuidv4();
const ROLE_UNIVERSAL_IDENTIFIER = uuidv4();

describe('2-57 workspace command - backfill application grants (integration)', () => {
  let command: BackfillApplicationGrantsCommand;
  let applicationIds: string[];

  const runOnWorkspace = (options: { dryRun?: boolean } = {}) =>
    command.runOnWorkspace({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      options,
      index: 0,
      total: 1,
      dataSource: global.testDataSource,
    });

  const findGrants = () =>
    Promise.all(
      applicationIds.map((applicationId) =>
        findApplicationGrant({
          applicationId,
          workspaceId: SEED_APPLE_WORKSPACE_ID,
        }),
      ),
    );

  beforeAll(async () => {
    command = getAppProviderByClassName<BackfillApplicationGrantsCommand>(
      'BackfillApplicationGrantsCommand',
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
            workspaceId: SEED_APPLE_WORKSPACE_ID,
          }))!,
      ),
    );

    const applicationGrantService =
      getAppProviderByClassName<ApplicationGrantService>(
        'ApplicationGrantService',
      );

    for (const applicationId of applicationIds) {
      await applicationGrantService.deleteGrant({
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

    expect(await findGrants()).toEqual([undefined, undefined]);
  });

  it('gives twenty-standard and the installed application a grant equal to their requested role', async () => {
    await runOnWorkspace();

    const grants = await findGrants();
    const workspaceCustomApplicationId =
      await findWorkspaceCustomApplicationIdFromDatabase(
        SEED_APPLE_WORKSPACE_ID,
      );

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
          await findApplicationDefaultRoleId(applicationIds[index]),
        ),
      );
    }
  });

  it('leaves existing grants untouched on a second run', async () => {
    const grantsBefore = await findGrants();

    await runOnWorkspace();

    expect(await findGrants()).toEqual(grantsBefore);
  });
});
