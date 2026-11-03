import { createHash } from 'crypto';

import { TEST_APPLICATION_PACKAGE_JSON_CHECKSUM } from 'test/integration/metadata/suites/application/constants/test-application-package-json.constant';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { findOneApplication } from 'test/integration/metadata/suites/application/utils/find-one-application.util';
import { runApplicationHealthCheck } from 'test/integration/metadata/suites/application/utils/run-application-health-check.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { uploadApplicationFile } from 'test/integration/metadata/suites/application/utils/upload-application-file.util';
import {
  type HealthCheckLogicFunctionApplicationManifest,
  type Manifest,
} from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';
import { v4 as uuidv4 } from 'uuid';

const APPLICATION_UNIVERSAL_IDENTIFIER = uuidv4();
const ROLE_UNIVERSAL_IDENTIFIER = uuidv4();
const APPLICATION_NAME = 'Application syncing member health check opt-in';
const HEALTH_CHECK_SOURCE = `export const handler = () => ({ status: 'OK' });`;
const HEALTH_CHECK_NAME = 'health-check';
const HEALTH_CHECK_REFERENCE = { universalIdentifier: uuidv4() };

const buildHealthCheckManifest = ({
  healthCheckLogicFunction,
}: {
  healthCheckLogicFunction?: HealthCheckLogicFunctionApplicationManifest;
}): Manifest =>
  buildBaseManifest({
    appId: APPLICATION_UNIVERSAL_IDENTIFIER,
    roleId: ROLE_UNIVERSAL_IDENTIFIER,
    overrides: {
      application: {
        universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
        defaultRoleUniversalIdentifier: ROLE_UNIVERSAL_IDENTIFIER,
        displayName: APPLICATION_NAME,
        description: 'App for testing member health check opt-in',
        applicationVariables: {},
        ...(isDefined(healthCheckLogicFunction)
          ? { healthCheckLogicFunction }
          : {}),
        packageJsonChecksum: TEST_APPLICATION_PACKAGE_JSON_CHECKSUM,
        yarnLockChecksum: null,
      },
      logicFunctions: [
        {
          ...HEALTH_CHECK_REFERENCE,
          name: HEALTH_CHECK_NAME,
          handlerName: 'handler',
          sourceHandlerPath: `src/${HEALTH_CHECK_NAME}.ts`,
          builtHandlerPath: `dist/${HEALTH_CHECK_NAME}.mjs`,
          builtHandlerChecksum: createHash('sha256')
            .update(HEALTH_CHECK_SOURCE)
            .digest('hex'),
          timeoutSeconds: 10,
        },
      ],
    },
  });

const findStoredHealthCheck = async (
  applicationId: string,
): Promise<{
  healthCheckUniversalIdentifier: string | null;
  isUserHealthCheckEnabled: boolean;
}> => {
  const [storedApplication] = await globalThis.testDataSource.query(
    `SELECT
       "healthCheckLogicFunction"."universalIdentifier" AS "healthCheckUniversalIdentifier",
       "application"."isUserHealthCheckEnabled"
     FROM core."application" "application"
     LEFT JOIN core."logicFunction" "healthCheckLogicFunction"
       ON "healthCheckLogicFunction".id = "application"."healthCheckLogicFunctionId"
     WHERE "application".id = $1`,
    [applicationId],
  );

  return storedApplication;
};

describe('Sync application member health check opt-in should succeed', () => {
  let applicationId: string;

  beforeAll(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
      name: APPLICATION_NAME,
      description: 'App for testing member health check opt-in',
      sourcePath: `test-${APPLICATION_UNIVERSAL_IDENTIFIER}`,
    });
    jest.useRealTimers();

    await uploadApplicationFile({
      applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
      fileFolder: 'BuiltLogicFunction',
      filePath: `dist/${HEALTH_CHECK_NAME}.mjs`,
      filename: `${HEALTH_CHECK_NAME}.mjs`,
      contentType: 'application/javascript',
      fileBuffer: Buffer.from(HEALTH_CHECK_SOURCE),
      expectToFail: false,
    });

    await syncApplication({
      manifest: buildHealthCheckManifest({
        healthCheckLogicFunction: {
          ...HEALTH_CHECK_REFERENCE,
          runOnUserPreferences: true,
        },
      }),
      expectToFail: false,
    });
    jest.useRealTimers();

    const { data } = await findOneApplication({
      input: { universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER },
      gqlFields: 'id',
      expectToFail: false,
    });

    applicationId = data.findOneApplication.id;
  }, 120000);

  afterAll(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
    });
  });

  it('stores one health check with member execution enabled', async () => {
    expect(await findStoredHealthCheck(applicationId)).toEqual({
      healthCheckUniversalIdentifier:
        HEALTH_CHECK_REFERENCE.universalIdentifier,
      isUserHealthCheckEnabled: true,
    });

    const { data } = await runApplicationHealthCheck({
      input: { applicationId },
      expectToFail: false,
    });

    expect(data.runApplicationHealthCheck).toBeNull();
  });

  it('preserves the check and member opt-in when omitted from a delta sync', async () => {
    await syncApplication({
      manifest: buildHealthCheckManifest({}),
      inferDeletionFromMissingEntities: false,
      expectToFail: false,
    });
    jest.useRealTimers();

    expect(await findStoredHealthCheck(applicationId)).toEqual({
      healthCheckUniversalIdentifier:
        HEALTH_CHECK_REFERENCE.universalIdentifier,
      isUserHealthCheckEnabled: true,
    });
  });

  it('defaults a declared check without member opt-in to workspace-only', async () => {
    await syncApplication({
      manifest: buildHealthCheckManifest({
        healthCheckLogicFunction: HEALTH_CHECK_REFERENCE,
      }),
      inferDeletionFromMissingEntities: false,
      expectToFail: false,
    });
    jest.useRealTimers();

    expect(await findStoredHealthCheck(applicationId)).toEqual({
      healthCheckUniversalIdentifier:
        HEALTH_CHECK_REFERENCE.universalIdentifier,
      isUserHealthCheckEnabled: false,
    });

    const { data } = await runApplicationHealthCheck({
      input: { applicationId },
      expectToFail: false,
    });

    expect(data.runApplicationHealthCheck).toEqual({
      status: 'OK',
      title: null,
    });
  });

  it.each([true, false])(
    'updates member execution to %s without replacing the health check',
    async (runOnUserPreferences) => {
      await syncApplication({
        manifest: buildHealthCheckManifest({
          healthCheckLogicFunction: {
            ...HEALTH_CHECK_REFERENCE,
            runOnUserPreferences,
          },
        }),
        expectToFail: false,
      });
      jest.useRealTimers();

      expect(await findStoredHealthCheck(applicationId)).toEqual({
        healthCheckUniversalIdentifier:
          HEALTH_CHECK_REFERENCE.universalIdentifier,
        isUserHealthCheckEnabled: runOnUserPreferences,
      });
    },
  );

  it('clears the check and member opt-in when omitted from a full sync', async () => {
    await syncApplication({
      manifest: buildHealthCheckManifest({
        healthCheckLogicFunction: {
          ...HEALTH_CHECK_REFERENCE,
          runOnUserPreferences: true,
        },
      }),
      expectToFail: false,
    });
    await syncApplication({
      manifest: buildHealthCheckManifest({}),
      expectToFail: false,
    });
    jest.useRealTimers();

    expect(await findStoredHealthCheck(applicationId)).toEqual({
      healthCheckUniversalIdentifier: null,
      isUserHealthCheckEnabled: false,
    });
  });
});
