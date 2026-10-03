import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import {
  type ApplicationVariables,
  type Manifest,
  type ServerVariables,
} from 'twenty-shared/application';
import {
  type EachTestingContext,
  eachTestingContextFilter,
} from 'twenty-shared/testing';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const TEST_APP_ID = 'c572a0e1-0001-4000-a000-000000000001';
const TEST_ROLE_ID = 'c572a0e1-0002-4000-a000-000000000002';
const APPLICATION_SETTING_VARIABLE_ID = 'c572a0e1-0003-4000-a000-000000000003';
const RESERVED_APPLICATION_VARIABLE_ID = 'c572a0e1-0004-4000-a000-000000000004';

const BASELINE_SERVER_VARIABLES: ServerVariables = {
  APP_API_KEY: { description: 'Third-party API key', isSecret: true },
};

const BASELINE_APPLICATION_VARIABLES: ApplicationVariables = {
  APP_SETTING: {
    universalIdentifier: APPLICATION_SETTING_VARIABLE_ID,
    description: 'A workspace setting',
    isSecret: false,
  },
};

// The logic function executor injects these into every run
const RESERVED_NAMES = [
  'TWENTY_API_URL',
  'TWENTY_APP_ACCESS_TOKEN',
  'TWENTY_APP_APPLICATION_ACCESS_TOKEN',
  'TWENTY_API_KEY',
  'TWENTY_FUNCTIONS_URL',
  'APPLICATION_ID',
];

type TestContext = {
  serverVariables: ServerVariables;
  applicationVariables: ApplicationVariables;
};

const testCases: EachTestingContext<TestContext>[] = RESERVED_NAMES.flatMap(
  (reservedName) => [
    {
      title: `a server variable named ${reservedName}`,
      context: {
        serverVariables: {
          ...BASELINE_SERVER_VARIABLES,
          [reservedName]: { description: 'Reserved', isSecret: true },
        },
        applicationVariables: BASELINE_APPLICATION_VARIABLES,
      },
    },
    {
      title: `an application variable named ${reservedName}`,
      context: {
        serverVariables: BASELINE_SERVER_VARIABLES,
        applicationVariables: {
          ...BASELINE_APPLICATION_VARIABLES,
          [reservedName]: {
            universalIdentifier: RESERVED_APPLICATION_VARIABLE_ID,
            description: 'Reserved',
            isSecret: false,
          },
        },
      },
    },
  ],
);

const buildManifest = ({
  serverVariables,
  applicationVariables,
}: {
  serverVariables: ServerVariables;
  applicationVariables: ApplicationVariables;
}): Manifest => {
  const baseManifest = buildBaseManifest({
    appId: TEST_APP_ID,
    roleId: TEST_ROLE_ID,
  });

  return {
    ...baseManifest,
    application: {
      ...baseManifest.application,
      serverVariables,
      applicationVariables,
    },
  };
};

const readDeclaredVariableKeys = async () => {
  const serverVariables = await globalThis.testDataSource.query(
    `SELECT variable.key
     FROM core."applicationRegistrationVariable" variable
     JOIN core."applicationRegistration" registration
       ON registration.id = variable."applicationRegistrationId"
     WHERE registration."universalIdentifier" = $1
     ORDER BY variable.key`,
    [TEST_APP_ID],
  );

  const applicationVariables = await globalThis.testDataSource.query(
    `SELECT variable.key
     FROM core."applicationVariable" variable
     JOIN core."application" application
       ON application.id = variable."applicationId"
     WHERE application."universalIdentifier" = $1
       AND application."workspaceId" = $2
     ORDER BY variable.key`,
    [TEST_APP_ID, SEED_APPLE_WORKSPACE_ID],
  );

  return {
    serverVariableKeys: serverVariables.map(({ key }: { key: string }) => key),
    applicationVariableKeys: applicationVariables.map(
      ({ key }: { key: string }) => key,
    ),
  };
};

describe('Sync application should fail on reserved variable names', () => {
  beforeAll(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: TEST_APP_ID,
      name: 'Reserved Variable Name App',
      description: 'App for testing reserved variable names',
      sourcePath: 'test-reserved-variable-name',
    });

    await syncApplication({
      manifest: buildManifest({
        serverVariables: BASELINE_SERVER_VARIABLES,
        applicationVariables: BASELINE_APPLICATION_VARIABLES,
      }),
      expectToFail: false,
    });

    expect(await readDeclaredVariableKeys()).toEqual({
      serverVariableKeys: ['APP_API_KEY'],
      applicationVariableKeys: ['APP_SETTING'],
    });
  }, 60000);

  afterAll(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: TEST_APP_ID,
    });
  });

  it.each(eachTestingContextFilter(testCases))(
    'should refuse a manifest declaring $title',
    async ({ context }) => {
      const { errors } = await syncApplication({
        manifest: buildManifest(context),
        expectToFail: true,
      });

      expectOneNotInternalServerErrorSnapshot({ errors });
      expect(await readDeclaredVariableKeys()).toEqual({
        serverVariableKeys: ['APP_API_KEY'],
        applicationVariableKeys: ['APP_SETTING'],
      });
    },
    60000,
  );
});
