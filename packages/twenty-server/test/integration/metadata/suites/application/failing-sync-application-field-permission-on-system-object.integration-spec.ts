import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';

import { PermissionsExceptionCode } from 'src/engine/metadata-modules/permissions/permissions.exception';

const TEST_APP_ID = 'a1b2c3d4-0011-4000-a000-000000000010';
const TEST_ROLE_ID = 'a1b2c3d4-0011-4000-a000-000000000011';
const TEST_FIELD_PERMISSION_ID = 'a1b2c3d4-0011-4000-a000-000000000014';

describe('Sync application should fail when adding a field permission on a system object', () => {
  beforeAll(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: TEST_APP_ID,
      name: 'Test System Object Field Permission App',
      description: 'App for testing field permissions on system objects',
      sourcePath: 'test-system-object-field-permission',
    });
  }, 60000);

  afterAll(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: TEST_APP_ID,
    });
  });

  it('should refuse a field permission on a timelineActivity field', async () => {
    const manifest = buildBaseManifest({
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
                objectUniversalIdentifier:
                  STANDARD_OBJECTS.timelineActivity.universalIdentifier,
                fieldUniversalIdentifier:
                  STANDARD_OBJECTS.timelineActivity.fields
                    .linkedObjectMetadataId.universalIdentifier,
                canReadFieldValue: false,
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

    expect(JSON.stringify(errors)).toContain(
      PermissionsExceptionCode.CANNOT_ADD_FIELD_PERMISSION_ON_SYSTEM_OBJECT,
    );
  }, 60000);
});
