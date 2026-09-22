import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { findManyApplications } from 'test/integration/graphql/utils/find-many-applications.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { findOneApplication } from 'test/integration/metadata/suites/application/utils/find-one-application.util';
import { generateApplicationToken } from 'test/integration/metadata/suites/application/utils/generate-application-token.util';
import {
  type ApplicationWithVariable,
  setupApplicationWithVariable,
} from 'test/integration/metadata/suites/application/utils/setup-application-with-variable.util';
import { updateOneApplicationVariable } from 'test/integration/metadata/suites/application/utils/update-one-application-variable.util';
import { generateApplicationTokenPair } from 'test/integration/utils/generate-application-token-pair.util';
import {
  type EachTestingContext,
  eachTestingContextFilter,
} from 'twenty-shared/testing';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

type GlobalTestContext = {
  callingApplication: ApplicationWithVariable;
  otherApplication: ApplicationWithVariable;
  userBoundToken: string;
  unboundToken: string;
};

type TestContext = {
  token: (globalContext: GlobalTestContext) => string;
};

const applicationTokenTestCases: EachTestingContext<TestContext>[] = [
  {
    title: 'with a user-bound application token',
    context: { token: (globalContext) => globalContext.userBoundToken },
  },
  {
    title: 'with an application token without user binding',
    context: { token: (globalContext) => globalContext.unboundToken },
  },
];

describe('Application variable access across applications should fail', () => {
  let globalTestContext: GlobalTestContext;

  beforeAll(async () => {
    const callingApplication = await setupApplicationWithVariable({
      name: 'Calling Application',
      variableKey: 'CALLING_APPLICATION_VARIABLE',
    });
    const otherApplication = await setupApplicationWithVariable({
      name: 'Other Application',
      variableKey: 'OTHER_APPLICATION_VARIABLE',
    });

    const [{ data: userBoundTokenData }, unboundTokenPair] = await Promise.all([
      generateApplicationToken({
        applicationId: callingApplication.id,
        expectToFail: false,
      }),
      generateApplicationTokenPair({
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        applicationId: callingApplication.id,
      }),
    ]);

    globalTestContext = {
      callingApplication,
      otherApplication,
      userBoundToken:
        userBoundTokenData.generateApplicationToken.applicationAccessToken
          .token,
      unboundToken: unboundTokenPair.applicationAccessToken.token,
    };
  }, 120000);

  afterAll(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier:
        globalTestContext.callingApplication.universalIdentifier,
    });
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier:
        globalTestContext.otherApplication.universalIdentifier,
    });
  });

  describe.each(eachTestingContextFilter(applicationTokenTestCases))(
    '$title',
    ({ context }) => {
      it('should refuse to update another application variable', async () => {
        const { otherApplication } = globalTestContext;

        const { errors } = await updateOneApplicationVariable({
          input: {
            key: otherApplication.variableKey,
            value: 'overwritten',
            applicationId: otherApplication.id,
          },
          token: context.token(globalTestContext),
          expectToFail: true,
        });

        expectOneNotInternalServerErrorSnapshot({ errors });

        const { data } = await findOneApplication({
          input: { id: otherApplication.id },
          gqlFields: `
            applicationVariables {
              key
              value
            }
          `,
          expectToFail: false,
        });

        expect(data.findOneApplication.applicationVariables).toEqual([
          { key: otherApplication.variableKey, value: 'initial' },
        ]);
      });

      it('should refuse to read another application by id', async () => {
        const { errors } = await findOneApplication({
          input: { id: globalTestContext.otherApplication.id },
          gqlFields: `
            id
            applicationVariables {
              key
              value
            }
          `,
          token: context.token(globalTestContext),
          expectToFail: true,
        });

        expectOneNotInternalServerErrorSnapshot({ errors });
      });

      it('should refuse to read another application by universal identifier', async () => {
        const { errors } = await findOneApplication({
          input: {
            universalIdentifier:
              globalTestContext.otherApplication.universalIdentifier,
          },
          token: context.token(globalTestContext),
          expectToFail: true,
        });

        expectOneNotInternalServerErrorSnapshot({ errors });
      });

      it('should never resolve another application variables in a list', async () => {
        const { data, errors } = await findManyApplications({
          gqlFields: `
            id
            applicationVariables {
              key
              value
            }
          `,
          accessToken: context.token(globalTestContext),
          expectToFail: true,
        });

        expect(data).toBeNull();
        expect(errors.map(({ extensions }) => extensions.code)).toContain(
          'FORBIDDEN',
        );
      });
    },
  );

  it('should refuse two application identifiers from a session', async () => {
    const { callingApplication, otherApplication } = globalTestContext;

    const { errors } = await findOneApplication({
      input: {
        id: callingApplication.id,
        universalIdentifier: otherApplication.universalIdentifier,
      },
      expectToFail: true,
    });

    expectOneNotInternalServerErrorSnapshot({ errors });
  });

  it('should require an application identifier from a session', async () => {
    const { errors } = await findOneApplication({
      input: {},
      expectToFail: true,
    });

    expectOneNotInternalServerErrorSnapshot({ errors });
  });

  it('should require an application id from a session', async () => {
    const { errors } = await updateOneApplicationVariable({
      input: {
        key: globalTestContext.callingApplication.variableKey,
        value: 'from-session',
      },
      expectToFail: true,
    });

    expectOneNotInternalServerErrorSnapshot({ errors });
  });
});
