import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { type ApplicationVariables } from 'twenty-shared/application';
import {
  type EachTestingContext,
  eachTestingContextFilter,
} from 'twenty-shared/testing';

const TEST_APP_ID = 'e1b2c3d4-0001-4000-a000-000000000001';
const TEST_ROLE_ID = 'e1b2c3d4-0002-4000-a000-000000000002';
const USER_VARIABLE_ID = 'e1b2c3d4-0003-4000-a000-000000000003';
const NEW_VARIABLE_ID = 'e1b2c3d4-0004-4000-a000-000000000004';
const NEW_USER_VARIABLE_ID = 'e1b2c3d4-0005-4000-a000-000000000005';

const buildManifestWithVariables = (
  applicationVariables: ApplicationVariables,
) => {
  const baseManifest = buildBaseManifest({
    appId: TEST_APP_ID,
    roleId: TEST_ROLE_ID,
  });

  return {
    ...baseManifest,
    application: { ...baseManifest.application, applicationVariables },
  };
};

type TestContext = {
  applicationVariables: ApplicationVariables;
};

const failingApplicationVariableScopeSyncTestCases: EachTestingContext<TestContext>[] =
  [
    {
      title: 'when syncing a variable with an unknown scope',
      context: {
        applicationVariables: {
          RECORD_MY_MEETINGS: {
            universalIdentifier: NEW_VARIABLE_ID,
            scope: 'TEAM' as never,
          },
        },
      },
    },
    {
      title: 'when declaring a value on a user variable',
      context: {
        applicationVariables: {
          API_KEY: {
            universalIdentifier: USER_VARIABLE_ID,
            scope: 'USER',
          },
          EMAIL_SIGNATURE: {
            universalIdentifier: NEW_USER_VARIABLE_ID,
            value: 'Best regards',
            scope: 'USER',
          },
        },
      },
    },
    {
      title: 'when changing the scope of an existing variable',
      context: {
        applicationVariables: {
          API_KEY: {
            universalIdentifier: USER_VARIABLE_ID,
            scope: 'WORKSPACE',
          },
        },
      },
    },
  ];

describe('Sync application should fail on invalid application variable scopes', () => {
  beforeAll(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: TEST_APP_ID,
      name: 'Test Application Variable Scope App',
      description: 'App for testing application variable scope validation',
      sourcePath: 'test-application-variable-scope',
    });

    await syncApplication({
      manifest: buildManifestWithVariables({
        API_KEY: {
          universalIdentifier: USER_VARIABLE_ID,
          scope: 'USER',
        },
      }),
      expectToFail: false,
    });
  }, 120000);

  afterAll(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: TEST_APP_ID,
    });
  });

  it.each(
    eachTestingContextFilter(failingApplicationVariableScopeSyncTestCases),
  )(
    '$title',
    async ({ context }) => {
      const { errors } = await syncApplication({
        manifest: buildManifestWithVariables(context.applicationVariables),
        expectToFail: true,
      });

      expectOneNotInternalServerErrorSnapshot({ errors });
    },
    60000,
  );
});
