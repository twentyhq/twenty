import crypto from 'crypto';

import { type Manifest } from 'twenty-shared/application';

import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';

const TEST_APP_ID = crypto.randomUUID();
const TEST_ROLE_ID = crypto.randomUUID();
const APPLICATION_VARIABLE_ID = crypto.randomUUID();
const APPLICATION_VARIABLE_KEY = 'APP_SETTING';
const SERVER_VARIABLE_KEY = 'APP_API_KEY';

const buildManifest = ({
  applicationVariableKey,
  isSecret,
  description,
}: {
  applicationVariableKey: string;
  isSecret: boolean;
  description: string;
}): Manifest => {
  const baseManifest = buildBaseManifest({
    appId: TEST_APP_ID,
    roleId: TEST_ROLE_ID,
  });

  return {
    ...baseManifest,
    application: {
      ...baseManifest.application,
      serverVariables: {
        [SERVER_VARIABLE_KEY]: { description, isSecret },
      },
      applicationVariables: {
        [applicationVariableKey]: {
          universalIdentifier: APPLICATION_VARIABLE_ID,
          description,
          isSecret,
        },
      },
    },
  };
};

describe('Manifest sync - application variable key and isSecret are immutable', () => {
  beforeAll(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: TEST_APP_ID,
      name: 'Test Immutable Variable Properties App',
      description: 'App for testing immutable variable properties',
      sourcePath: 'test-application-variable-immutable-properties',
    });

    await syncApplication({
      manifest: buildManifest({
        applicationVariableKey: APPLICATION_VARIABLE_KEY,
        isSecret: true,
        description: 'Initial description',
      }),
      expectToFail: false,
    });

    await syncApplication({
      manifest: buildManifest({
        applicationVariableKey: 'RENAMED_APP_SETTING',
        isSecret: false,
        description: 'Updated description',
      }),
      expectToFail: false,
    });
  }, 120000);

  afterAll(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: TEST_APP_ID,
    });
  });

  it('should ignore key and isSecret updates on an application variable', async () => {
    const rows = await globalThis.testDataSource.query(
      `SELECT key, description, "isSecret" FROM core."applicationVariable"
       WHERE "universalIdentifier" = $1`,
      [APPLICATION_VARIABLE_ID],
    );

    expect(rows).toEqual([
      {
        key: APPLICATION_VARIABLE_KEY,
        description: 'Updated description',
        isSecret: true,
      },
    ]);
  });

  it('should ignore isSecret updates on an application registration variable', async () => {
    const rows = await globalThis.testDataSource.query(
      `SELECT variable.key, variable.description, variable."isSecret"
       FROM core."applicationRegistrationVariable" variable
       JOIN core."applicationRegistration" registration
         ON registration.id = variable."applicationRegistrationId"
       WHERE registration."universalIdentifier" = $1`,
      [TEST_APP_ID],
    );

    expect(rows).toEqual([
      {
        key: SERVER_VARIABLE_KEY,
        description: 'Updated description',
        isSecret: true,
      },
    ]);
  });
});
