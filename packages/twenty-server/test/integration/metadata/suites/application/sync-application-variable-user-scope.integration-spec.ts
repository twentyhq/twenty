import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { findOneApplication } from 'test/integration/metadata/suites/application/utils/find-one-application.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import {
  type ApplicationVariableScope,
  type ApplicationVariables,
} from 'twenty-shared/application';

const TEST_APP_ID = 'e1b2c3d4-0001-4000-a000-000000000001';
const TEST_ROLE_ID = 'e1b2c3d4-0002-4000-a000-000000000002';
const TEST_VARIABLE_ID = 'e1b2c3d4-0003-4000-a000-000000000003';
const SECRET_VARIABLE_ID = 'e1b2c3d4-0004-4000-a000-000000000004';

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

describe('Sync application variable scopes', () => {
  beforeAll(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: TEST_APP_ID,
      name: 'Test User Variable Scope App',
      description: 'App for testing user application variable validation',
      sourcePath: 'test-user-application-variable-scope',
    });
  }, 120000);

  afterAll(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: TEST_APP_ID,
    });
  });

  it('should reject an unknown scope', async () => {
    const { errors } = await syncApplication({
      manifest: buildManifestWithVariables({
        RECORD_MY_MEETINGS: {
          universalIdentifier: TEST_VARIABLE_ID,
          scope: 'TEAM' as never,
        },
      }),
      expectToFail: true,
    });

    expect(errors).toHaveLength(1);
    expect(errors[0].extensions).toMatchObject({
      code: 'METADATA_VALIDATION_FAILED',
      errors: {
        applicationVariable: [
          {
            errors: [
              expect.objectContaining({
                message: 'Application variable scope "TEAM" is invalid',
              }),
            ],
          },
        ],
      },
    });
  });

  it('should accept secret and required variables when creating and updating their scope', async () => {
    const scopes: ApplicationVariableScope[] = ['USER', 'WORKSPACE', 'USER'];

    for (const scope of scopes) {
      await syncApplication({
        manifest: buildManifestWithVariables({
          API_KEY: {
            universalIdentifier: SECRET_VARIABLE_ID,
            isSecret: true,
            isRequired: true,
            scope,
          },
        }),
        expectToFail: false,
      });

      const { data } = await findOneApplication({
        input: { universalIdentifier: TEST_APP_ID },
        gqlFields: 'applicationVariables { key scope isSecret isRequired }',
        expectToFail: false,
      });

      expect(data.findOneApplication.applicationVariables).toEqual([
        { key: 'API_KEY', scope, isSecret: true, isRequired: true },
      ]);
    }
  }, 60000);
});
