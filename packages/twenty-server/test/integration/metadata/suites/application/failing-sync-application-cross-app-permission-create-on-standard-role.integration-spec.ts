import { PermissionFlagType } from 'twenty-shared/constants';

import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';

import { STANDARD_ROLE } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-role.constant';

const TEST_APP_ID = 'a1b2c3d4-0010-4000-a000-000000000010';
const TEST_ROLE_ID = 'a1b2c3d4-0010-4000-a000-000000000011';
const TEST_PERMISSION_FLAG_ID = 'a1b2c3d4-0010-4000-a000-000000000012';
const TEST_OBJECT_PERMISSION_ID = 'a1b2c3d4-0010-4000-a000-000000000013';
const TEST_FIELD_PERMISSION_ID = 'a1b2c3d4-0010-4000-a000-000000000014';
const FAKE_OBJECT_ID = 'a1b2c3d4-0010-4000-a000-000000000020';
const FAKE_FIELD_ID = 'a1b2c3d4-0010-4000-a000-000000000021';

describe('Sync application should fail when creating permissions on a standard role from another app', () => {
  beforeAll(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: TEST_APP_ID,
      name: 'Test Cross App Permission App',
      description: 'App for testing cross-app permission flag on standard role',
      sourcePath: 'test-cross-app-permission',
    });
  }, 60000);

  afterAll(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: TEST_APP_ID,
    });
  });

  it('should fail when adding a permission flag under the standard admin role', async () => {
    const manifest = buildBaseManifest({
      appId: TEST_APP_ID,
      roleId: TEST_ROLE_ID,
      overrides: {
        roles: [
          {
            universalIdentifier: TEST_ROLE_ID,
            label: 'App Default Role',
            description: 'Default role for the test app',
          },
          {
            universalIdentifier: STANDARD_ROLE.admin.universalIdentifier,
            label: 'Stolen Admin Role',
            description:
              'Attempts to add permissions to the standard admin role',
            permissionFlags: [
              {
                universalIdentifier: TEST_PERMISSION_FLAG_ID,
                flag: PermissionFlagType.WORKSPACE,
              },
            ],
          },
        ],
      },
    });

    const { errors } = await syncApplication({
      manifest,
      expectToFail: true,
    });

    expectOneNotInternalServerErrorSnapshot({ errors });
  }, 60000);

  it('should fail when adding an object permission under the standard admin role', async () => {
    const manifest = buildBaseManifest({
      appId: TEST_APP_ID,
      roleId: TEST_ROLE_ID,
      overrides: {
        roles: [
          {
            universalIdentifier: TEST_ROLE_ID,
            label: 'App Default Role',
            description: 'Default role for the test app',
          },
          {
            universalIdentifier: STANDARD_ROLE.admin.universalIdentifier,
            label: 'Stolen Admin Role',
            description:
              'Attempts to add object permission to the standard admin role',
            objectPermissions: [
              {
                universalIdentifier: TEST_OBJECT_PERMISSION_ID,
                objectUniversalIdentifier: FAKE_OBJECT_ID,
              },
            ],
          },
        ],
      },
    });

    const { errors } = await syncApplication({
      manifest,
      expectToFail: true,
    });

    expectOneNotInternalServerErrorSnapshot({ errors });
  }, 60000);

  it('should fail when adding a field permission under the standard admin role', async () => {
    const manifest = buildBaseManifest({
      appId: TEST_APP_ID,
      roleId: TEST_ROLE_ID,
      overrides: {
        roles: [
          {
            universalIdentifier: TEST_ROLE_ID,
            label: 'App Default Role',
            description: 'Default role for the test app',
          },
          {
            universalIdentifier: STANDARD_ROLE.admin.universalIdentifier,
            label: 'Stolen Admin Role',
            description:
              'Attempts to add field permission to the standard admin role',
            fieldPermissions: [
              {
                universalIdentifier: TEST_FIELD_PERMISSION_ID,
                objectUniversalIdentifier: FAKE_OBJECT_ID,
                fieldUniversalIdentifier: FAKE_FIELD_ID,
              },
            ],
          },
        ],
      },
    });

    const { errors } = await syncApplication({
      manifest,
      expectToFail: true,
    });

    expectOneNotInternalServerErrorSnapshot({ errors });
  }, 60000);
});
