import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import { STANDARD_ROLE } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-role.constant';

const TEST_APP_ID = 'a1b2c3d4-0001-4000-a000-000000000001';
const TEST_ROLE_ID = 'a1b2c3d4-0002-4000-a000-000000000002';
const DUPLICATED_UNIVERSAL_IDENTIFIER = 'a1b2c3d4-0003-4000-a000-000000000003';

describe('Sync application should fail on universalIdentifier conflicts', () => {
  beforeAll(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: TEST_APP_ID,
      name: 'Test Universal Id Conflict App',
      description: 'App for testing universalIdentifier conflict detection',
      sourcePath: 'test-universal-id-conflict',
    });
  }, 60000);

  afterAll(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: TEST_APP_ID,
    });
  });

  it('should fail when two entities in the same manifest share the same universalIdentifier', async () => {
    const manifest = buildBaseManifest({
      appId: TEST_APP_ID,
      roleId: TEST_ROLE_ID,
      overrides: {
        roles: [
          {
            universalIdentifier: TEST_ROLE_ID,
            label: 'First Role',
            description: 'First role',
          },
          {
            universalIdentifier: DUPLICATED_UNIVERSAL_IDENTIFIER,
            label: 'Second Role',
            description: 'Second role',
            objectPermissions: [
              {
                universalIdentifier: DUPLICATED_UNIVERSAL_IDENTIFIER,
                objectUniversalIdentifier:
                  STANDARD_OBJECTS.company.universalIdentifier,
                canReadObjectRecords: true,
                canUpdateObjectRecords: false,
                canSoftDeleteObjectRecords: false,
                canDestroyObjectRecords: false,
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

  it('should fail when an entity uses a universalIdentifier from the twenty-standard app', async () => {
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
              'Attempts to create a role with the standard admin universalIdentifier',
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
