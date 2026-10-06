import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { findOneApplication } from 'test/integration/metadata/suites/application/utils/find-one-application.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { updateOneApplicationVariable } from 'test/integration/metadata/suites/application/utils/update-one-application-variable.util';

const TEST_APP_ID = 'e3b2c3d4-0001-4000-a000-000000000001';
const TEST_ROLE_ID = 'e3b2c3d4-0002-4000-a000-000000000002';
const USER_VARIABLE_ID = 'e3b2c3d4-0003-4000-a000-000000000003';
const USER_VARIABLE_KEY = 'API_KEY';

describe('Updating the workspace value of a user application variable should fail', () => {
  let applicationId: string;

  beforeAll(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: TEST_APP_ID,
      name: 'Test User Application Variable Update App',
      description: 'App for testing user application variable updates',
      sourcePath: 'test-user-application-variable-update',
    });

    const baseManifest = buildBaseManifest({
      appId: TEST_APP_ID,
      roleId: TEST_ROLE_ID,
    });

    await syncApplication({
      manifest: {
        ...baseManifest,
        application: {
          ...baseManifest.application,
          applicationVariables: {
            [USER_VARIABLE_KEY]: {
              universalIdentifier: USER_VARIABLE_ID,
              scope: 'USER',
            },
          },
        },
      },
      expectToFail: false,
    });

    const { data } = await findOneApplication({
      input: { universalIdentifier: TEST_APP_ID },
      gqlFields: 'id',
      expectToFail: false,
    });

    applicationId = data.findOneApplication.id;
  }, 120000);

  afterAll(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: TEST_APP_ID,
    });
  });

  it('should refuse to set a workspace value on a user variable', async () => {
    const { errors } = await updateOneApplicationVariable({
      input: {
        key: USER_VARIABLE_KEY,
        value: 'workspace-value',
        applicationId,
      },
      expectToFail: true,
    });

    expectOneNotInternalServerErrorSnapshot({ errors });
  });
});
