import { updateApplicationRegistrationVariable } from 'test/integration/metadata/suites/application-registration-variable/utils/application-registration-variable-api.util';
import { insertApplicationRegistrationVariable } from 'test/integration/metadata/suites/application-registration-variable/utils/insert-application-registration-variable.util';
import { deleteApplicationRegistration } from 'test/integration/metadata/suites/application-registration/utils/delete-application-registration.util';
import {
  insertApplicationRegistrationWithVariable,
  TARGET_VARIABLE_KEY,
} from 'test/integration/metadata/suites/application-registration/utils/insert-application-registration-with-variable.util';
import {
  type ApplicationRegistrationState,
  readApplicationRegistrationState,
} from 'test/integration/metadata/suites/application-registration/utils/read-application-registration-state.util';
import { rotateApplicationRegistrationClientSecret } from 'test/integration/metadata/suites/application-registration/utils/rotate-application-registration-client-secret.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import {
  type ApplicationWithResources,
  setupApplicationWithResources,
} from 'test/integration/metadata/suites/application/utils/setup-application-with-resources.util';
import { updateApplicationRegistration } from 'test/integration/metadata/suites/application/utils/update-application-registration.util';
import { generateAppleAdminApplicationTokenPair } from 'test/integration/utils/generate-apple-admin-application-token-pair.util';
import { generateApplicationTokenPair } from 'test/integration/utils/generate-application-token-pair.util';
import { SystemPermissionFlag } from 'twenty-shared/constants';
import {
  type EachTestingContext,
  eachTestingContextFilter,
} from 'twenty-shared/testing';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

type GlobalTestContext = {
  callingApplication: ApplicationWithResources;
  userBoundToken: string;
  unboundToken: string;
};

type TargetRegistration = {
  applicationRegistrationId: string;
  variableId: string;
};

type MutationTestContext = {
  request: (params: {
    targetRegistration: TargetRegistration;
    token: string;
  }) => Promise<unknown>;
  expectStateChange: (params: {
    stateBefore: ApplicationRegistrationState;
    stateAfter: ApplicationRegistrationState;
  }) => void;
};

const sessionAndApiKeyTokenTestCases: EachTestingContext<{
  token: () => string;
}>[] = [
  {
    title: 'with a user session',
    context: { token: () => APPLE_JANE_ADMIN_ACCESS_TOKEN },
  },
  {
    title: 'with an API key',
    context: { token: () => API_KEY_ACCESS_TOKEN },
  },
];

const applicationTokenTestCases: EachTestingContext<{
  token: (globalContext: GlobalTestContext) => string;
}>[] = [
  {
    title: 'with a user-bound application token',
    context: { token: (globalContext) => globalContext.userBoundToken },
  },
  {
    title: 'with an application token without user binding',
    context: { token: (globalContext) => globalContext.unboundToken },
  },
];

const RENAMED_REGISTRATION_NAME = 'Renamed Registration';
const RENAMED_REDIRECT_URI = 'https://renamed.example.com/callback';

const nonDestructiveMutationTestCases: EachTestingContext<MutationTestContext>[] =
  [
    {
      title: 'updateApplicationRegistration',
      context: {
        request: ({ targetRegistration, token }) =>
          updateApplicationRegistration({
            id: targetRegistration.applicationRegistrationId,
            update: {
              name: RENAMED_REGISTRATION_NAME,
              oAuthRedirectUris: [RENAMED_REDIRECT_URI],
            },
            token,
            expectToFail: false,
          }),
        expectStateChange: ({ stateAfter }) => {
          expect(stateAfter.registration?.name).toBe(RENAMED_REGISTRATION_NAME);
          expect(stateAfter.registration?.oAuthRedirectUris).toEqual([
            RENAMED_REDIRECT_URI,
          ]);
        },
      },
    },
    {
      title: 'rotateApplicationRegistrationClientSecret',
      context: {
        request: ({ targetRegistration, token }) =>
          rotateApplicationRegistrationClientSecret({
            input: { id: targetRegistration.applicationRegistrationId },
            token,
            expectToFail: false,
          }),
        expectStateChange: ({ stateBefore, stateAfter }) => {
          expect(stateAfter.registration?.oAuthClientSecretHash).not.toBe(
            stateBefore.registration?.oAuthClientSecretHash,
          );
        },
      },
    },
    {
      title: 'updateApplicationRegistrationVariable',
      context: {
        request: ({ targetRegistration, token }) =>
          updateApplicationRegistrationVariable({
            id: targetRegistration.variableId,
            value: 'updated-value',
            token,
            expectToFail: false,
          }),
        expectStateChange: ({ stateBefore, stateAfter }) => {
          expect(stateAfter.variables[0].encryptedValue).not.toBe(
            stateBefore.variables[0].encryptedValue,
          );
        },
      },
    },
  ];

const allMutationTestCases: EachTestingContext<MutationTestContext>[] = [
  ...nonDestructiveMutationTestCases,
  {
    title: 'deleteApplicationRegistration',
    context: {
      request: ({ targetRegistration, token }) =>
        deleteApplicationRegistration({
          input: { id: targetRegistration.applicationRegistrationId },
          token,
          expectToFail: false,
        }),
      expectStateChange: ({ stateAfter }) => {
        expect(stateAfter.registration).toBeUndefined();
        expect(stateAfter.variables).toEqual([]);
      },
    },
  },
];

const runMutationAndExpectStateChange = async ({
  context,
  targetRegistration,
  token,
}: {
  context: MutationTestContext;
  targetRegistration: TargetRegistration;
  token: string;
}) => {
  const stateBefore = await readApplicationRegistrationState(
    targetRegistration.applicationRegistrationId,
  );

  await context.request({ targetRegistration, token });

  context.expectStateChange({
    stateBefore,
    stateAfter: await readApplicationRegistrationState(
      targetRegistration.applicationRegistrationId,
    ),
  });
};

describe('Application registration mutations on a registration the workspace owns should succeed', () => {
  let targetRegistration: TargetRegistration;

  beforeEach(async () => {
    targetRegistration = await insertApplicationRegistrationWithVariable({
      name: 'Registration Mutation Target',
    });
  });

  afterEach(async () => {
    await globalThis.testDataSource.query(
      `DELETE FROM core."applicationRegistration" WHERE id = $1`,
      [targetRegistration.applicationRegistrationId],
    );
  });

  describe.each(eachTestingContextFilter(sessionAndApiKeyTokenTestCases))(
    '$title',
    ({ context: tokenContext }) => {
      it.each(eachTestingContextFilter(allMutationTestCases))(
        'should run $title',
        async ({ context }) => {
          await runMutationAndExpectStateChange({
            context,
            targetRegistration,
            token: tokenContext.token(),
          });
        },
      );
    },
  );
});

describe('Application token mutations on its own registration should succeed', () => {
  let globalTestContext: GlobalTestContext;
  let targetRegistration: TargetRegistration;

  beforeAll(async () => {
    const callingApplication = await setupApplicationWithResources({
      name: 'Own Registration Calling Application',
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

  beforeEach(async () => {
    const { applicationRegistrationId } = globalTestContext.callingApplication;

    const variableId = await insertApplicationRegistrationVariable({
      applicationRegistrationId,
      key: TARGET_VARIABLE_KEY,
      value: 'target-secret-value',
    });

    targetRegistration = { applicationRegistrationId, variableId };
  });

  afterEach(async () => {
    await globalThis.testDataSource.query(
      `DELETE FROM core."applicationRegistrationVariable"
       WHERE "applicationRegistrationId" = $1`,
      [targetRegistration.applicationRegistrationId],
    );
  });

  afterAll(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier:
        globalTestContext.callingApplication.universalIdentifier,
    });
  });

  describe.each(eachTestingContextFilter(applicationTokenTestCases))(
    '$title',
    ({ context: tokenContext }) => {
      it.each(eachTestingContextFilter(nonDestructiveMutationTestCases))(
        'should run $title',
        async ({ context }) => {
          await runMutationAndExpectStateChange({
            context,
            targetRegistration,
            token: tokenContext.token(globalTestContext),
          });
        },
      );
    },
  );
});
