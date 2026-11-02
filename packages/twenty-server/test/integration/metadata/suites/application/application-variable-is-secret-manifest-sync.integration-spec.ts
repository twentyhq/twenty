import crypto from 'crypto';

import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { type Manifest } from 'twenty-shared/application';

const TEST_APP_ID = crypto.randomUUID();
const TEST_ROLE_ID = crypto.randomUUID();
const SECRET_SETTING_ID = crypto.randomUUID();
const PUBLIC_SETTING_ID = crypto.randomUUID();

type IsSecretByKey = Record<
  | 'SECRET_SETTING'
  | 'PUBLIC_SETTING'
  | 'SECRET_SERVER_KEY'
  | 'PUBLIC_SERVER_KEY',
  boolean
>;

const INITIAL_IS_SECRET_BY_KEY: IsSecretByKey = {
  SECRET_SETTING: true,
  PUBLIC_SETTING: false,
  SECRET_SERVER_KEY: true,
  PUBLIC_SERVER_KEY: false,
};

const buildManifest = ({
  isSecretByKey,
  description,
}: {
  isSecretByKey: IsSecretByKey;
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
      applicationVariables: {
        SECRET_SETTING: {
          universalIdentifier: SECRET_SETTING_ID,
          description,
          isSecret: isSecretByKey.SECRET_SETTING,
        },
        PUBLIC_SETTING: {
          universalIdentifier: PUBLIC_SETTING_ID,
          description,
          isSecret: isSecretByKey.PUBLIC_SETTING,
        },
      },
      serverVariables: {
        SECRET_SERVER_KEY: {
          description,
          isSecret: isSecretByKey.SECRET_SERVER_KEY,
        },
        PUBLIC_SERVER_KEY: {
          description,
          isSecret: isSecretByKey.PUBLIC_SERVER_KEY,
        },
      },
    },
  };
};

const readVariablesByKey = async () => {
  const rows: { key: string; description: string; isSecret: boolean }[] =
    await globalThis.testDataSource.query(
      `SELECT key, description, "isSecret" FROM core."applicationVariable"
       WHERE "universalIdentifier" = ANY($1)
       UNION ALL
       SELECT variable.key, variable.description, variable."isSecret"
       FROM core."applicationRegistrationVariable" variable
       JOIN core."applicationRegistration" registration
         ON registration.id = variable."applicationRegistrationId"
       WHERE registration."universalIdentifier" = $2`,
      [[SECRET_SETTING_ID, PUBLIC_SETTING_ID], TEST_APP_ID],
    );

  return Object.fromEntries(
    rows.map(({ key, description, isSecret }) => [
      key,
      { description, isSecret },
    ]),
  );
};

const buildExpectedVariablesByKey = (description: string) =>
  Object.fromEntries(
    Object.entries(INITIAL_IS_SECRET_BY_KEY).map(([key, isSecret]) => [
      key,
      { description, isSecret },
    ]),
  );

describe('Manifest sync - variable isSecret', () => {
  beforeAll(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: TEST_APP_ID,
      name: 'Test Variable Is Secret App',
      description: 'App for testing variable isSecret changes',
      sourcePath: 'test-application-variable-is-secret',
    });

    await syncApplication({
      manifest: buildManifest({
        isSecretByKey: INITIAL_IS_SECRET_BY_KEY,
        description: 'Initial description',
      }),
      expectToFail: false,
    });
  }, 120000);

  afterAll(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: TEST_APP_ID,
    });
  });

  it.each([
    { key: 'SECRET_SETTING', isSecret: false },
    { key: 'PUBLIC_SETTING', isSecret: true },
  ] as const)(
    'should refuse changing isSecret of application variable $key',
    async ({ key, isSecret }) => {
      const { errors } = await syncApplication({
        manifest: buildManifest({
          isSecretByKey: { ...INITIAL_IS_SECRET_BY_KEY, [key]: isSecret },
          description: 'Initial description',
        }),
        expectToFail: true,
      });

      expectOneNotInternalServerErrorSnapshot({ errors });
      expect(await readVariablesByKey()).toEqual(
        buildExpectedVariablesByKey('Initial description'),
      );
    },
  );

  it('should ignore isSecret changes on server variables', async () => {
    await syncApplication({
      manifest: buildManifest({
        isSecretByKey: {
          ...INITIAL_IS_SECRET_BY_KEY,
          SECRET_SERVER_KEY: false,
          PUBLIC_SERVER_KEY: true,
        },
        description: 'Updated description',
      }),
      expectToFail: false,
    });

    expect(await readVariablesByKey()).toEqual(
      buildExpectedVariablesByKey('Updated description'),
    );
  });
});
