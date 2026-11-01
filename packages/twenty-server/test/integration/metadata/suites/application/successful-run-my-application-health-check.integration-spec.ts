import { createHash } from 'crypto';

import { TEST_APPLICATION_PACKAGE_JSON_CHECKSUM } from 'test/integration/metadata/suites/application/constants/test-application-package-json.constant';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { findOneApplication } from 'test/integration/metadata/suites/application/utils/find-one-application.util';
import { installedApplicationHealthChecksQueryFactory } from 'test/integration/metadata/suites/application/utils/installed-application-health-checks-query-factory.util';
import { myApplicationPreferences } from 'test/integration/metadata/suites/application/utils/my-application-preferences.util';
import { runApplicationHealthCheck } from 'test/integration/metadata/suites/application/utils/run-application-health-check.util';
import { runMyApplicationHealthCheck } from 'test/integration/metadata/suites/application/utils/run-my-application-health-check.util';
import {
  type ApplicationWithUserHealthCheck,
  setupApplicationWithUserHealthCheck,
} from 'test/integration/metadata/suites/application/utils/setup-application-with-user-health-check.util';
import {
  type ApplicationWithVariable,
  setupApplicationWithVariable,
} from 'test/integration/metadata/suites/application/utils/setup-application-with-variable.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { updateMyUserApplicationVariable } from 'test/integration/metadata/suites/application/utils/update-my-user-application-variable.util';
import { uploadApplicationFile } from 'test/integration/metadata/suites/application/utils/upload-application-file.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { type Manifest } from 'twenty-shared/application';
import { v4 as uuidv4 } from 'uuid';

import { USER_WORKSPACE_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-user-workspaces.util';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

type HealthCheckSource = {
  universalIdentifier: string;
  name: string;
  source: string;
};

const APPLICATION_UNIVERSAL_IDENTIFIER = uuidv4();
const ROLE_UNIVERSAL_IDENTIFIER = uuidv4();
const LANGUAGE_VARIABLE_UNIVERSAL_IDENTIFIER = uuidv4();
const APPLICATION_NAME = 'Application with a user health check';

const HEALTH_CHECK: HealthCheckSource = {
  universalIdentifier: uuidv4(),
  name: 'health-check',
  source: `export const handler = ({ userWorkspaceId }, context) => {
  if (userWorkspaceId === undefined) {
    return {
      status: 'INFO',
      title: 'Workspace check run by ' + String(context.userWorkspaceId) + ' with payload ' + String(userWorkspaceId),
    };
  }

  return {
    status: 'WARNING',
    title: 'User check run by ' + context.workspaceMemberId + ' as ' + userWorkspaceId,
    description: 'Language: ' + process.env.LANGUAGE + ' for ' + context.userWorkspaceId,
  };
};`,
};

const buildHealthCheckManifest = ({
  runOnUserPreferences,
}: {
  runOnUserPreferences?: boolean;
}): Manifest =>
  buildBaseManifest({
    appId: APPLICATION_UNIVERSAL_IDENTIFIER,
    roleId: ROLE_UNIVERSAL_IDENTIFIER,
    overrides: {
      application: {
        universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
        defaultRoleUniversalIdentifier: ROLE_UNIVERSAL_IDENTIFIER,
        displayName: APPLICATION_NAME,
        description: 'App for testing the user health check',
        applicationVariables: {
          LANGUAGE: {
            universalIdentifier: LANGUAGE_VARIABLE_UNIVERSAL_IDENTIFIER,
            scope: 'USER',
            value: 'en',
          },
        },
        healthCheckLogicFunction: {
          universalIdentifier: HEALTH_CHECK.universalIdentifier,
          runOnUserPreferences,
        },
        packageJsonChecksum: TEST_APPLICATION_PACKAGE_JSON_CHECKSUM,
        yarnLockChecksum: null,
      },
      logicFunctions: [HEALTH_CHECK].map(
        ({ universalIdentifier, name, source }) => ({
          universalIdentifier,
          name,
          handlerName: 'handler',
          sourceHandlerPath: `src/${name}.ts`,
          builtHandlerPath: `dist/${name}.mjs`,
          builtHandlerChecksum: createHash('sha256')
            .update(source)
            .digest('hex'),
          timeoutSeconds: 10,
        }),
      ),
    },
  });

describe('Run my application health check should succeed', () => {
  let applicationId: string;
  let healthCheckOnlyApplication: ApplicationWithUserHealthCheck;
  let applicationWithoutHealthCheck: ApplicationWithVariable;

  beforeAll(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
      name: APPLICATION_NAME,
      description: 'App for testing the user health check',
      sourcePath: 'user-health-check',
    });
    jest.useRealTimers();

    for (const healthCheck of [HEALTH_CHECK]) {
      await uploadApplicationFile({
        applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
        fileFolder: 'BuiltLogicFunction',
        filePath: `dist/${healthCheck.name}.mjs`,
        filename: `${healthCheck.name}.mjs`,
        contentType: 'application/javascript',
        fileBuffer: Buffer.from(healthCheck.source),
        expectToFail: false,
      });
    }

    await syncApplication({
      manifest: buildHealthCheckManifest({
        runOnUserPreferences: true,
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

    healthCheckOnlyApplication = await setupApplicationWithUserHealthCheck({
      name: 'Application with only a user health check',
    });

    applicationWithoutHealthCheck = await setupApplicationWithVariable({
      name: 'Application without a user health check',
      variableKey: 'RECORD_MY_MEETINGS',
      variableScope: 'USER',
    });
    jest.useRealTimers();
  }, 240000);

  afterAll(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
    });
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier:
        healthCheckOnlyApplication.universalIdentifier,
    });
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier:
        applicationWithoutHealthCheck.universalIdentifier,
    });
  });

  it('should list applications that enable member execution, even without other preferences', async () => {
    const { data } = await myApplicationPreferences({
      input: {},
      gqlFields: 'applicationId hasUserHealthCheck',
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
      expectToFail: false,
    });

    expect(data.myApplicationPreferences).toEqual(
      expect.arrayContaining([
        { applicationId, hasUserHealthCheck: true },
        {
          applicationId: healthCheckOnlyApplication.id,
          hasUserHealthCheck: true,
        },
        {
          applicationId: applicationWithoutHealthCheck.id,
          hasUserHealthCheck: false,
        },
      ]),
    );
  });

  it('should expose the execution location on mapped installed applications', async () => {
    const response = await makeMetadataApiRequest(
      installedApplicationHealthChecksQueryFactory(),
    );

    expect(response.body.errors).toBeUndefined();
    expect(
      response.body.data.currentUser.currentWorkspace.installedApplications,
    ).toEqual(
      expect.arrayContaining([
        { id: applicationId, runOnUserPreferences: true },
        { id: healthCheckOnlyApplication.id, runOnUserPreferences: true },
        { id: applicationWithoutHealthCheck.id, runOnUserPreferences: false },
      ]),
    );
  });

  it('should run the health check as the requesting member with their own variable values', async () => {
    await updateMyUserApplicationVariable({
      input: {
        applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
        key: 'LANGUAGE',
        value: 'fr',
      },
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
      expectToFail: false,
    });
    await updateMyUserApplicationVariable({
      input: {
        applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
        key: 'LANGUAGE',
        value: 'de',
      },
      token: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      expectToFail: false,
    });

    const { data: jonyData } = await runMyApplicationHealthCheck({
      input: { applicationId },
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
      expectToFail: false,
    });

    expect(jonyData.runMyApplicationHealthCheck).toEqual({
      status: 'WARNING',
      title: `User check run by ${WORKSPACE_MEMBER_DATA_SEED_IDS.JONY} as ${USER_WORKSPACE_DATA_SEED_IDS.JONY}`,
      description: `Language: fr for ${USER_WORKSPACE_DATA_SEED_IDS.JONY}`,
    });

    const { data: janeData } = await runMyApplicationHealthCheck({
      input: { applicationId },
      token: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      expectToFail: false,
    });

    expect(janeData.runMyApplicationHealthCheck).toEqual({
      status: 'WARNING',
      title: `User check run by ${WORKSPACE_MEMBER_DATA_SEED_IDS.JANE} as ${USER_WORKSPACE_DATA_SEED_IDS.JANE}`,
      description: `Language: de for ${USER_WORKSPACE_DATA_SEED_IDS.JANE}`,
    });
  });

  it('should not run a member-only handler from the workspace application page', async () => {
    const { data: applicationData } = await findOneApplication({
      input: { universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER },
      gqlFields: 'id runOnUserPreferences',
      expectToFail: false,
    });

    expect(applicationData.findOneApplication.runOnUserPreferences).toBe(true);

    const { data } = await runApplicationHealthCheck({
      input: { applicationId },
      expectToFail: false,
    });

    expect(data.runApplicationHealthCheck).toBeNull();
  });

  it('should return null for an application without a health check', async () => {
    const { data } = await runMyApplicationHealthCheck({
      input: { applicationId: applicationWithoutHealthCheck.id },
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
      expectToFail: false,
    });

    expect(data.runMyApplicationHealthCheck).toBeNull();
  });

  it.each([undefined, false])(
    'should keep runOnUserPreferences=%s workspace-only and out of member preferences',
    async (runOnUserPreferences) => {
      const workspaceOnlyManifest = buildHealthCheckManifest({
        runOnUserPreferences,
      });

      await syncApplication({
        manifest: {
          ...workspaceOnlyManifest,
          application: {
            ...workspaceOnlyManifest.application,
            applicationVariables: {},
          },
        },
        expectToFail: false,
      });
      jest.useRealTimers();

      const [storedApplication] = await globalThis.testDataSource.query(
        `SELECT "healthCheckLogicFunctionId", "isUserHealthCheckEnabled" FROM core."application" WHERE id = $1`,
        [applicationId],
      );

      expect(storedApplication.healthCheckLogicFunctionId).toEqual(
        expect.any(String),
      );
      expect(storedApplication.isUserHealthCheckEnabled).toBe(false);

      const { data: applicationData } = await findOneApplication({
        input: { universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER },
        gqlFields: 'id runOnUserPreferences',
        expectToFail: false,
      });

      expect(applicationData.findOneApplication.runOnUserPreferences).toBe(
        false,
      );

      const { data: workspaceData } = await runApplicationHealthCheck({
        input: { applicationId },
        expectToFail: false,
      });

      expect(workspaceData.runApplicationHealthCheck).toEqual({
        status: 'INFO',
        title: 'Workspace check run by null with payload undefined',
      });

      const { data: preferencesData } = await myApplicationPreferences({
        input: {},
        gqlFields: 'applicationId hasUserHealthCheck',
        token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
        expectToFail: false,
      });

      expect(preferencesData.myApplicationPreferences).not.toEqual(
        expect.arrayContaining([expect.objectContaining({ applicationId })]),
      );

      const { data } = await runMyApplicationHealthCheck({
        input: { applicationId },
        token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
        expectToFail: false,
      });

      expect(data.runMyApplicationHealthCheck).toBeNull();
    },
  );
});
