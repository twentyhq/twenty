import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { type ApplicationVariables } from 'twenty-shared/application';
import {
  type EachTestingContext,
  eachTestingContextFilter,
} from 'twenty-shared/testing';

import { type BaseGraphQLError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';

const TEST_APP_ID = 'e1b2c3d4-0001-4000-a000-000000000001';
const TEST_ROLE_ID = 'e1b2c3d4-0002-4000-a000-000000000002';
const TEST_VARIABLE_ID = 'e1b2c3d4-0003-4000-a000-000000000003';
const SECRET_VARIABLE_ID = 'e1b2c3d4-0004-4000-a000-000000000004';

type TestContext = {
  applicationVariables: ApplicationVariables;
  expectedMessage: string;
};

const failingUserScopeSyncTestCases: EachTestingContext<TestContext>[] = [
  {
    title: 'when a user variable is secret',
    context: {
      applicationVariables: {
        API_KEY: {
          universalIdentifier: TEST_VARIABLE_ID,
          isSecret: true,
          scope: 'USER',
        },
      },
      expectedMessage: 'A user application variable cannot be secret',
    },
  },
  {
    title: 'when a user variable is required',
    context: {
      applicationVariables: {
        RECORD_MY_MEETINGS: {
          universalIdentifier: TEST_VARIABLE_ID,
          value: 'false',
          isRequired: true,
          scope: 'USER',
        },
      },
      expectedMessage: 'A user application variable cannot be required',
    },
  },
  {
    title: 'when the scope is unknown',
    context: {
      applicationVariables: {
        RECORD_MY_MEETINGS: {
          universalIdentifier: TEST_VARIABLE_ID,
          scope: 'TEAM' as never,
        },
      },
      expectedMessage: 'Application variable scope "TEAM" is invalid',
    },
  },
];

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

const expectOneApplicationVariableValidationError = ({
  errors,
  expectedMessage,
}: {
  errors: BaseGraphQLError[];
  expectedMessage: string;
}) => {
  expect(errors).toHaveLength(1);
  expect(errors[0].extensions).toMatchObject({
    code: 'METADATA_VALIDATION_FAILED',
    errors: {
      applicationVariable: [
        {
          errors: [expect.objectContaining({ message: expectedMessage })],
        },
      ],
    },
  });
};

describe('Sync application should fail on invalid user application variables', () => {
  beforeAll(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: TEST_APP_ID,
      name: 'Test Invalid User Variable App',
      description: 'App for testing user application variable validation',
      sourcePath: 'test-invalid-user-application-variable',
    });
  }, 120000);

  afterAll(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: TEST_APP_ID,
    });
  });

  it.each(eachTestingContextFilter(failingUserScopeSyncTestCases))(
    '$title',
    async ({ context }) => {
      const { errors } = await syncApplication({
        manifest: buildManifestWithVariables(context.applicationVariables),
        expectToFail: true,
      });

      expectOneApplicationVariableValidationError({
        errors,
        expectedMessage: context.expectedMessage,
      });
    },
    60000,
  );

  it('should refuse turning a secret variable into a user variable', async () => {
    await syncApplication({
      manifest: buildManifestWithVariables({
        API_KEY: { universalIdentifier: SECRET_VARIABLE_ID, isSecret: true },
      }),
      expectToFail: false,
    });

    const { errors } = await syncApplication({
      manifest: buildManifestWithVariables({
        API_KEY: {
          universalIdentifier: SECRET_VARIABLE_ID,
          isSecret: true,
          scope: 'USER',
        },
      }),
      expectToFail: true,
    });

    expectOneApplicationVariableValidationError({
      errors,
      expectedMessage: 'A user application variable cannot be secret',
    });
  }, 60000);
});
