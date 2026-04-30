import { PermissionFlagType } from 'twenty-shared/constants';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';

import { STANDARD_ROLE } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-role.constant';

const TEST_APP_ID = 'a1b2c3d4-0020-4000-a000-000000000010';
const TEST_ROLE_ID = 'a1b2c3d4-0020-4000-a000-000000000011';
const TEST_PERMISSION_FLAG_ID = 'a1b2c3d4-0020-4000-a000-000000000012';
const TEST_OBJECT_PERMISSION_ID = 'a1b2c3d4-0020-4000-a000-000000000013';
const TEST_FIELD_PERMISSION_ID = 'a1b2c3d4-0020-4000-a000-000000000014';

const COMPANY_OBJECT_ID = STANDARD_OBJECTS.company.universalIdentifier;
const COMPANY_NAME_FIELD_ID =
  STANDARD_OBJECTS.company.fields.name.universalIdentifier;

describe('Sync application should fail when retargeting existing permissions to a standard role on update', () => {
  beforeAll(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: TEST_APP_ID,
      name: 'Test Cross App Permission Retarget App',
      description: 'App for testing cross-app permission retargeting on update',
      sourcePath: 'test-cross-app-retarget',
    });
  }, 60000);

  afterAll(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: TEST_APP_ID,
    });
  });

  it('should fail when retargeting a permission flag from own role to the standard admin role', async () => {
    const initialManifest = buildBaseManifest({
      appId: TEST_APP_ID,
      roleId: TEST_ROLE_ID,
      overrides: {
        roles: [
          {
            universalIdentifier: TEST_ROLE_ID,
            label: 'App Default Role',
            description: 'Default role for the test app',
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

    await syncApplication({
      manifest: initialManifest,
      expectToFail: false,
    });

    const retargetManifest = buildBaseManifest({
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
            label: 'Admin',
            description: 'Attempts to retarget permission flag to admin role',
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
      manifest: retargetManifest,
      expectToFail: true,
    });

    expectOneNotInternalServerErrorSnapshot({ errors });
  }, 60000);

  it('should fail when retargeting an object permission from own role to the standard admin role', async () => {
    const initialManifest = buildBaseManifest({
      appId: TEST_APP_ID,
      roleId: TEST_ROLE_ID,
      overrides: {
        roles: [
          {
            universalIdentifier: TEST_ROLE_ID,
            label: 'App Default Role',
            description: 'Default role for the test app',
            objectPermissions: [
              {
                universalIdentifier: TEST_OBJECT_PERMISSION_ID,
                objectUniversalIdentifier: COMPANY_OBJECT_ID,
              },
            ],
          },
        ],
      },
    });

    await syncApplication({
      manifest: initialManifest,
      expectToFail: false,
    });

    const retargetManifest = buildBaseManifest({
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
            label: 'Admin',
            description: 'Attempts to retarget object permission to admin role',
            objectPermissions: [
              {
                universalIdentifier: TEST_OBJECT_PERMISSION_ID,
                objectUniversalIdentifier: COMPANY_OBJECT_ID,
              },
            ],
          },
        ],
      },
    });

    const { errors } = await syncApplication({
      manifest: retargetManifest,
      expectToFail: true,
    });

    expectOneNotInternalServerErrorSnapshot({ errors });
  }, 60000);

  it('should fail when retargeting a field permission from own role to the standard admin role', async () => {
    const initialManifest = buildBaseManifest({
      appId: TEST_APP_ID,
      roleId: TEST_ROLE_ID,
      overrides: {
        roles: [
          {
            universalIdentifier: TEST_ROLE_ID,
            label: 'App Default Role',
            description: 'Default role for the test app',
            fieldPermissions: [
              {
                universalIdentifier: TEST_FIELD_PERMISSION_ID,
                objectUniversalIdentifier: COMPANY_OBJECT_ID,
                fieldUniversalIdentifier: COMPANY_NAME_FIELD_ID,
              },
            ],
          },
        ],
      },
    });

    await syncApplication({
      manifest: initialManifest,
      expectToFail: false,
    });

    const retargetManifest = buildBaseManifest({
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
            label: 'Admin',
            description: 'Attempts to retarget field permission to admin role',
            fieldPermissions: [
              {
                universalIdentifier: TEST_FIELD_PERMISSION_ID,
                objectUniversalIdentifier: COMPANY_OBJECT_ID,
                fieldUniversalIdentifier: COMPANY_NAME_FIELD_ID,
              },
            ],
          },
        ],
      },
    });

    const { errors } = await syncApplication({
      manifest: retargetManifest,
      expectToFail: true,
    });

    expectOneNotInternalServerErrorSnapshot({ errors });
  }, 60000);
});
