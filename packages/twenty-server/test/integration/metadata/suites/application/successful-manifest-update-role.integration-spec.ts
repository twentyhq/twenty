import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { uninstallApplication } from 'test/integration/metadata/suites/application/utils/uninstall-application.util';
import { findRoles } from 'test/integration/metadata/suites/role/utils/find-roles.util';
import { type Manifest } from 'twenty-shared/application';
import { v4 as uuidv4 } from 'uuid';

const TEST_APP_ID = uuidv4();
const TEST_WORKSPACE_ID = '20202020-1c25-4d02-bf25-6aeccf7ea419';
const TEST_ROLE_ID = uuidv4();
const TEST_SECOND_ROLE_ID = uuidv4();

const buildManifest = (overrides?: Partial<Pick<Manifest, 'roles'>>) =>
  buildBaseManifest({
    appId: TEST_APP_ID,
    roleId: TEST_ROLE_ID,
    overrides: {
      roles: [
        {
          universalIdentifier: TEST_ROLE_ID,
          label: 'Editor',
          description: 'Can edit',
        },
      ],
      ...overrides,
    },
  });

const findAppRoles = async () => {
  const { data } = await findRoles({
    gqlFields: 'id label description universalIdentifier',
    expectToFail: false,
  });

  return data.getRoles.filter(
    (role) =>
      role.universalIdentifier === TEST_ROLE_ID ||
      role.universalIdentifier === TEST_SECOND_ROLE_ID,
  );
};

describe('Manifest update - roles', () => {
  beforeEach(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: TEST_APP_ID,
      name: 'Test Application',
      description: 'App for testing role manifest updates',
      sourcePath: 'test-manifest-update-role',
    });
  }, 60000);

  afterEach(async () => {
    try {
      await uninstallApplication({
        universalIdentifier: TEST_APP_ID,
        expectToFail: false,
      });
    } catch {
      // Application may not have been installed if the test failed early
    }

    await globalThis.testDataSource.query(
      `DELETE FROM core."role" WHERE "universalIdentifier" IN ($1, $2)`,
      [TEST_ROLE_ID, TEST_SECOND_ROLE_ID],
    );

    await globalThis.testDataSource.query(
      `DELETE FROM core."file" WHERE "applicationId" IN (
        SELECT id FROM core."application" WHERE "universalIdentifier" = $1
      )`,
      [TEST_APP_ID],
    );

    await globalThis.testDataSource.query(
      `DELETE FROM core."application"
       WHERE "universalIdentifier" = $1 AND "workspaceId" = $2`,
      [TEST_APP_ID, TEST_WORKSPACE_ID],
    );

    await globalThis.testDataSource.query(
      `DELETE FROM core."applicationRegistration"
       WHERE "universalIdentifier" = $1 AND "workspaceId" = $2`,
      [TEST_APP_ID, TEST_WORKSPACE_ID],
    );
  });

  it('should create a new role when added to manifest on second sync', async () => {
    await syncApplication({
      manifest: buildManifest({}),
      expectToFail: false,
    });

    const rolesAfterFirstSync = await findAppRoles();

    expect(rolesAfterFirstSync).toHaveLength(1);
    expect(rolesAfterFirstSync[0]).toMatchObject({
      label: 'Editor',
      description: 'Can edit',
    });

    await syncApplication({
      manifest: buildManifest({
        roles: [
          {
            universalIdentifier: TEST_ROLE_ID,
            label: 'Editor',
            description: 'Can edit',
          },
          {
            universalIdentifier: TEST_SECOND_ROLE_ID,
            label: 'Viewer',
            description: 'Read-only access',
          },
        ],
      }),
      expectToFail: false,
    });

    const rolesAfterSecondSync = await findAppRoles();

    expect(rolesAfterSecondSync).toHaveLength(2);
    expect(
      rolesAfterSecondSync.find((r) => r.label === 'Editor'),
    ).toBeDefined();
    expect(
      rolesAfterSecondSync.find((r) => r.label === 'Viewer'),
    ).toBeDefined();
    expect(
      rolesAfterSecondSync.find((r) => r.label === 'Viewer'),
    ).toMatchObject({
      description: 'Read-only access',
    });
  }, 60000);

  it('should update a role when properties change in manifest on second sync', async () => {
    await syncApplication({
      manifest: buildManifest({}),
      expectToFail: false,
    });

    const rolesAfterFirstSync = await findAppRoles();

    expect(rolesAfterFirstSync).toHaveLength(1);
    expect(rolesAfterFirstSync[0]).toMatchObject({
      label: 'Editor',
      description: 'Can edit',
    });

    await syncApplication({
      manifest: buildManifest({
        roles: [
          {
            universalIdentifier: TEST_ROLE_ID,
            label: 'Senior Editor',
            description: 'Can edit everything',
          },
        ],
      }),
      expectToFail: false,
    });

    const rolesAfterSecondSync = await findAppRoles();

    expect(rolesAfterSecondSync).toHaveLength(1);
    expect(rolesAfterSecondSync[0]).toMatchObject({
      label: 'Senior Editor',
      description: 'Can edit everything',
    });
  }, 60000);

  it('should delete a role when removed from manifest on second sync', async () => {
    await syncApplication({
      manifest: buildManifest({
        roles: [
          {
            universalIdentifier: TEST_ROLE_ID,
            label: 'Editor',
            description: 'Can edit',
          },
          {
            universalIdentifier: TEST_SECOND_ROLE_ID,
            label: 'Viewer',
            description: 'Read-only access',
          },
        ],
      }),
      expectToFail: false,
    });

    const rolesAfterFirstSync = await findAppRoles();

    expect(rolesAfterFirstSync).toHaveLength(2);

    await syncApplication({
      manifest: buildManifest({
        roles: [
          {
            universalIdentifier: TEST_ROLE_ID,
            label: 'Editor',
            description: 'Can edit',
          },
        ],
      }),
      expectToFail: false,
    });

    const rolesAfterSecondSync = await findAppRoles();

    expect(rolesAfterSecondSync).toHaveLength(1);
    expect(rolesAfterSecondSync[0]).toMatchObject({
      label: 'Editor',
      description: 'Can edit',
    });
  }, 60000);
});
