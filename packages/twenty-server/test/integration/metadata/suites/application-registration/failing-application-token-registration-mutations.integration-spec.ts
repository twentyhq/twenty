import { updateApplicationRegistrationVariable } from 'test/integration/metadata/suites/application-registration-variable/utils/application-registration-variable-api.util';
import { insertApplicationRegistrationVariable } from 'test/integration/metadata/suites/application-registration-variable/utils/insert-application-registration-variable.util';
import { deleteApplicationRegistration } from 'test/integration/metadata/suites/application-registration/utils/delete-application-registration.util';
import {
  insertApplicationRegistrationWithVariable,
  TARGET_VARIABLE_KEY,
} from 'test/integration/metadata/suites/application-registration/utils/insert-application-registration-with-variable.util';
import { readApplicationRegistrationState } from 'test/integration/metadata/suites/application-registration/utils/read-application-registration-state.util';
import { rotateApplicationRegistrationClientSecret } from 'test/integration/metadata/suites/application-registration/utils/rotate-application-registration-client-secret.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import {
  type ApplicationWithResources,
  setupApplicationWithResources,
} from 'test/integration/metadata/suites/application/utils/setup-application-with-resources.util';
import { updateApplicationRegistration } from 'test/integration/metadata/suites/application/utils/update-application-registration.util';
import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { generateAppleAdminApplicationTokenPair } from 'test/integration/utils/generate-apple-admin-application-token-pair.util';
import { generateApplicationTokenPair } from 'test/integration/utils/generate-application-token-pair.util';
import { SystemPermissionFlag } from 'twenty-shared/constants';
import {
  type EachTestingContext,
  eachTestingContextFilter,
} from 'twenty-shared/testing';

import { type BaseGraphQLError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

type GlobalTestContext = {
  callingApplication: ApplicationWithResources;
  userBoundToken: string;
  unboundToken: string;
};

type TokenTestContext = {
  token: (globalContext: GlobalTestContext) => string;
};

type TargetRegistration = {
  applicationRegistrationId: string;
  variableId: string;
};

type TargetTestContext = {
  createTargetRegistration: (
    globalContext: GlobalTestContext,
  ) => Promise<TargetRegistration>;
  removeTargetRegistration: (
    targetRegistration: TargetRegistration,
  ) => Promise<unknown>;
};

type MutationTestContext = {
  requestTargetRegistration: (params: {
    targetRegistration: TargetRegistration;
    token: string;
  }) => Promise<{ errors: BaseGraphQLError[] }>;
};

const tokenTestCases: EachTestingContext<TokenTestContext>[] = [
  {
    title: 'with a user-bound application token',
    context: { token: (globalContext) => globalContext.userBoundToken },
  },
  {
    title: 'with an application token without user binding',
    context: { token: (globalContext) => globalContext.unboundToken },
  },
];

const targetTestCases: EachTestingContext<TargetTestContext>[] = [
  {
    title: 'its own registration',
    context: {
      createTargetRegistration: async ({ callingApplication }) => ({
        applicationRegistrationId: callingApplication.applicationRegistrationId,
        variableId: await insertApplicationRegistrationVariable({
          applicationRegistrationId:
            callingApplication.applicationRegistrationId,
          key: TARGET_VARIABLE_KEY,
          value: 'target-secret-value',
        }),
      }),
      removeTargetRegistration: ({ applicationRegistrationId }) =>
        globalThis.testDataSource.query(
          `DELETE FROM core."applicationRegistrationVariable"
           WHERE "applicationRegistrationId" = $1`,
          [applicationRegistrationId],
        ),
    },
  },
  {
    title: 'another registration of the same workspace',
    context: {
      createTargetRegistration: () =>
        insertApplicationRegistrationWithVariable({
          name: 'Registration Mutation Target',
        }),
      removeTargetRegistration: ({ applicationRegistrationId }) =>
        globalThis.testDataSource.query(
          `DELETE FROM core."applicationRegistration" WHERE id = $1`,
          [applicationRegistrationId],
        ),
    },
  },
];

const mutationTestCases: EachTestingContext<MutationTestContext>[] = [
  {
    title: 'updateApplicationRegistration',
    context: {
      requestTargetRegistration: ({ targetRegistration, token }) =>
        updateApplicationRegistration({
          id: targetRegistration.applicationRegistrationId,
          update: {
            name: 'Renamed by an application',
            oAuthRedirectUris: ['https://application.example.com/callback'],
          },
          token,
          expectToFail: true,
        }),
    },
  },
  {
    title: 'deleteApplicationRegistration',
    context: {
      requestTargetRegistration: ({ targetRegistration, token }) =>
        deleteApplicationRegistration({
          input: { id: targetRegistration.applicationRegistrationId },
          token,
          expectToFail: true,
        }),
    },
  },
  {
    title: 'rotateApplicationRegistrationClientSecret',
    context: {
      requestTargetRegistration: ({ targetRegistration, token }) =>
        rotateApplicationRegistrationClientSecret({
          input: { id: targetRegistration.applicationRegistrationId },
          token,
          expectToFail: true,
        }),
    },
  },
  {
    title: 'updateApplicationRegistrationVariable',
    context: {
      requestTargetRegistration: ({ targetRegistration, token }) =>
        updateApplicationRegistrationVariable({
          id: targetRegistration.variableId,
          value: 'https://application.example.com',
          token,
          expectToFail: true,
        }),
    },
  },
];

describe('Application token mutations on a registration should fail', () => {
  let globalTestContext: GlobalTestContext;

  beforeAll(async () => {
    const callingApplication = await setupApplicationWithResources({
      name: 'Registration Mutation Calling Application',
      permissionFlagUniversalIdentifiers: [
        SystemPermissionFlag.APPLICATIONS,
        SystemPermissionFlag.API_KEYS_AND_WEBHOOKS,
        SystemPermissionFlag.ROLES,
      ],
    });

    const [userBoundTokenPair, unboundTokenPair] = await Promise.all([
      generateAppleAdminApplicationTokenPair({
        applicationId: callingApplication.id,
      }),
      generateApplicationTokenPair({
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        applicationId: callingApplication.id,
      }),
    ]);

    globalTestContext = {
      callingApplication,
      userBoundToken: userBoundTokenPair.applicationAccessToken.token,
      unboundToken: unboundTokenPair.applicationAccessToken.token,
    };
  }, 120000);

  afterAll(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier:
        globalTestContext.callingApplication.universalIdentifier,
    });
  });

  describe.each(eachTestingContextFilter(targetTestCases))(
    'on $title',
    ({ context: targetContext }) => {
      let targetRegistration: TargetRegistration;

      beforeEach(async () => {
        targetRegistration =
          await targetContext.createTargetRegistration(globalTestContext);
      });

      afterEach(async () => {
        await targetContext.removeTargetRegistration(targetRegistration);
      });

      describe.each(eachTestingContextFilter(tokenTestCases))(
        '$title',
        ({ context: tokenContext }) => {
          it.each(eachTestingContextFilter(mutationTestCases))(
            'should refuse $title and leave the registration unchanged',
            async ({ context }) => {
              const stateBeforeAttempt = await readApplicationRegistrationState(
                targetRegistration.applicationRegistrationId,
              );

              const { errors } = await context.requestTargetRegistration({
                targetRegistration,
                token: tokenContext.token(globalTestContext),
              });

              expectOneNotInternalServerErrorSnapshot({ errors });
              expect(
                await readApplicationRegistrationState(
                  targetRegistration.applicationRegistrationId,
                ),
              ).toEqual(stateBeforeAttempt);
            },
          );
        },
      );
    },
  );
});
