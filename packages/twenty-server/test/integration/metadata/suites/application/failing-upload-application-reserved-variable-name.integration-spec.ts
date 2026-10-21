import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { createAppTarball } from 'test/integration/metadata/suites/application/utils/create-app-tarball.util';
import { uploadAppTarball } from 'test/integration/metadata/suites/application/utils/upload-app-tarball.util';
import {
  type ApplicationVariables,
  type ServerVariables,
} from 'twenty-shared/application';
import { v4 as uuidv4 } from 'uuid';

// The upload flow runs cache-lock retries with real delays, so fake timers
// would hang it — mirror the other application suites.
jest.setTimeout(120000);

const buildTarball = ({
  universalIdentifier,
  serverVariables = {},
  applicationVariables = {},
}: {
  universalIdentifier: string;
  serverVariables?: ServerVariables;
  applicationVariables?: ApplicationVariables;
}): Promise<Buffer> => {
  const baseManifest = buildBaseManifest({
    appId: universalIdentifier,
    roleId: uuidv4(),
  });

  return createAppTarball({
    'manifest.json': JSON.stringify({
      ...baseManifest,
      application: {
        ...baseManifest.application,
        serverVariables,
        applicationVariables,
      },
    }),
    'package.json': JSON.stringify({
      name: `test-reserved-variable-name-${universalIdentifier}`,
      version: '1.0.0',
    }),
  });
};

const readRegistrationServerVariableKeys = async (
  universalIdentifier: string,
): Promise<string[] | null> => {
  const [registration] = await globalThis.testDataSource.query(
    `SELECT id FROM core."applicationRegistration"
     WHERE "universalIdentifier" = $1`,
    [universalIdentifier],
  );

  if (registration === undefined) {
    return null;
  }

  const variables = await globalThis.testDataSource.query(
    `SELECT key FROM core."applicationRegistrationVariable"
     WHERE "applicationRegistrationId" = $1
     ORDER BY key`,
    [registration.id],
  );

  return variables.map(({ key }: { key: string }) => key);
};

describe('Publish application should fail on reserved variable names', () => {
  const universalIdentifier = uuidv4();
  const applicationVariableAppUniversalIdentifier = uuidv4();

  beforeAll(() => {
    jest.useRealTimers();
  });

  afterAll(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: universalIdentifier,
    });

    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: applicationVariableAppUniversalIdentifier,
    });

    jest.useFakeTimers();
  });

  it('should refuse a reserved application variable before creating a registration', async () => {
    const { errors } = await uploadAppTarball({
      tarballBuffer: await buildTarball({
        universalIdentifier: applicationVariableAppUniversalIdentifier,
        applicationVariables: {
          TWENTY_API_URL: {
            universalIdentifier: uuidv4(),
            description: 'Reserved',
            isSecret: false,
          },
        },
      }),
      expectToFail: true,
    });

    expectOneNotInternalServerErrorSnapshot({ errors });
    expect(
      await readRegistrationServerVariableKeys(
        applicationVariableAppUniversalIdentifier,
      ),
    ).toBe(null);

    await uploadAppTarball({
      tarballBuffer: await buildTarball({
        universalIdentifier: applicationVariableAppUniversalIdentifier,
        applicationVariables: {
          APP_SETTING: {
            universalIdentifier: uuidv4(),
            description: 'A workspace setting',
            isSecret: false,
          },
        },
      }),
      expectToFail: false,
    });

    expect(
      await readRegistrationServerVariableKeys(
        applicationVariableAppUniversalIdentifier,
      ),
    ).toEqual([]);
  });

  it('should refuse a reserved server variable before creating a registration', async () => {
    const { errors } = await uploadAppTarball({
      tarballBuffer: await buildTarball({
        universalIdentifier,
        serverVariables: {
          TWENTY_API_URL: { description: 'Reserved', isSecret: false },
        },
      }),
      expectToFail: true,
    });

    expectOneNotInternalServerErrorSnapshot({ errors });
    expect(await readRegistrationServerVariableKeys(universalIdentifier)).toBe(
      null,
    );

    await uploadAppTarball({
      tarballBuffer: await buildTarball({
        universalIdentifier,
        serverVariables: {
          APP_API_KEY: { description: 'Third-party API key', isSecret: true },
        },
      }),
      expectToFail: false,
    });

    expect(
      await readRegistrationServerVariableKeys(universalIdentifier),
    ).toEqual(['APP_API_KEY']);
  });
});
