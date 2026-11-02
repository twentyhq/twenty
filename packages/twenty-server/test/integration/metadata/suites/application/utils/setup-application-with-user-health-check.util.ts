import { createHash } from 'crypto';

import { TEST_APPLICATION_PACKAGE_JSON_CHECKSUM } from 'test/integration/metadata/suites/application/constants/test-application-package-json.constant';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { findOneApplication } from 'test/integration/metadata/suites/application/utils/find-one-application.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { uploadApplicationFile } from 'test/integration/metadata/suites/application/utils/upload-application-file.util';
import { v4 as uuidv4 } from 'uuid';

export type ApplicationWithUserHealthCheck = {
  id: string;
  universalIdentifier: string;
};

const USER_HEALTH_CHECK_NAME = 'user-health-check';

const USER_HEALTH_CHECK_SOURCE = `export const handler = () => ({ status: 'OK' });`;

export const setupApplicationWithUserHealthCheck = async ({
  name,
}: {
  name: string;
}): Promise<ApplicationWithUserHealthCheck> => {
  const applicationUniversalIdentifier = uuidv4();
  const roleUniversalIdentifier = uuidv4();
  const userHealthCheckUniversalIdentifier = uuidv4();

  await setupApplicationForSync({
    applicationUniversalIdentifier,
    name,
    description: `${name} for user health check tests`,
    sourcePath: `test-${applicationUniversalIdentifier}`,
  });
  jest.useRealTimers();

  await uploadApplicationFile({
    applicationUniversalIdentifier,
    fileFolder: 'BuiltLogicFunction',
    filePath: `dist/${USER_HEALTH_CHECK_NAME}.mjs`,
    filename: `${USER_HEALTH_CHECK_NAME}.mjs`,
    contentType: 'application/javascript',
    fileBuffer: Buffer.from(USER_HEALTH_CHECK_SOURCE),
    expectToFail: false,
  });

  await syncApplication({
    manifest: buildBaseManifest({
      appId: applicationUniversalIdentifier,
      roleId: roleUniversalIdentifier,
      overrides: {
        application: {
          universalIdentifier: applicationUniversalIdentifier,
          defaultRoleUniversalIdentifier: roleUniversalIdentifier,
          displayName: name,
          description: `${name} for user health check tests`,
          applicationVariables: {},
          healthCheckLogicFunction: {
            universalIdentifier: userHealthCheckUniversalIdentifier,
            runOnUserPreferences: true,
          },
          packageJsonChecksum: TEST_APPLICATION_PACKAGE_JSON_CHECKSUM,
          yarnLockChecksum: null,
        },
        roles: [
          {
            universalIdentifier: roleUniversalIdentifier,
            label: `${name} role`,
            description: 'A test role',
          },
        ],
        logicFunctions: [
          {
            universalIdentifier: userHealthCheckUniversalIdentifier,
            name: USER_HEALTH_CHECK_NAME,
            handlerName: 'handler',
            sourceHandlerPath: `src/${USER_HEALTH_CHECK_NAME}.ts`,
            builtHandlerPath: `dist/${USER_HEALTH_CHECK_NAME}.mjs`,
            builtHandlerChecksum: createHash('sha256')
              .update(USER_HEALTH_CHECK_SOURCE)
              .digest('hex'),
            timeoutSeconds: 10,
          },
        ],
      },
    }),
    expectToFail: false,
  });
  jest.useRealTimers();

  const { data } = await findOneApplication({
    input: { universalIdentifier: applicationUniversalIdentifier },
    gqlFields: 'id',
    expectToFail: false,
  });

  return {
    id: data.findOneApplication.id,
    universalIdentifier: applicationUniversalIdentifier,
  };
};
