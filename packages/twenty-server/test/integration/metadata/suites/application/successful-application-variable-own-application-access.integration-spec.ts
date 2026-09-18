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
  application: ApplicationWithVariable;
  otherApplication: ApplicationWithVariable;
  userBoundToken: string;
  unboundToken: string;
};

type TestContext = {
  token: (globalContext: GlobalTestContext) => string;
};

const APPLICATION_VARIABLES_GQL_FIELDS = `
  id
  applicationVariables {
    key
    value
  }
`;

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

describe('Application variable access to the own application should succeed', () => {
  let globalTestContext: GlobalTestContext;

  beforeAll(async () => {
    const application = await setupApplicationWithVariable({
      name: 'Own Application',
      variableKey: 'OWN_APPLICATION_VARIABLE',
    });
    const otherApplication = await setupApplicationWithVariable({
      name: 'Other Application',
      variableKey: 'OTHER_APPLICATION_VARIABLE',
    });

    const [{ data: userBoundTokenData }, unboundTokenPair] = await Promise.all([
      generateApplicationToken({
        applicationId: application.id,
        expectToFail: false,
      }),
      generateApplicationTokenPair({
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        applicationId: application.id,
      }),
    ]);

    globalTestContext = {
      application,
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
        globalTestContext.application.universalIdentifier,
    });
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier:
        globalTestContext.otherApplication.universalIdentifier,
    });
  });

  describe.each(eachTestingContextFilter(applicationTokenTestCases))(
    '$title',
    ({ context }) => {
      it('should update and read the own variables without an application id', async () => {
        const { application } = globalTestContext;
        const token = context.token(globalTestContext);

        const { data: updateData } = await updateOneApplicationVariable({
          input: { key: application.variableKey, value: 'inferred' },
          token,
          expectToFail: false,
        });

        expect(updateData.updateOneApplicationVariable).toBe(true);

        const { data } = await findOneApplication({
          input: {},
          gqlFields: APPLICATION_VARIABLES_GQL_FIELDS,
          token,
          expectToFail: false,
        });

        expect(data.findOneApplication).toEqual({
          id: application.id,
          applicationVariables: [
            { key: application.variableKey, value: 'inferred' },
          ],
        });
      });

      it('should keep accepting the own application id, as published apps send it', async () => {
        const { application } = globalTestContext;
        const token = context.token(globalTestContext);

        const { data: updateData } = await updateOneApplicationVariable({
          input: {
            key: application.variableKey,
            value: 'explicit',
            applicationId: application.id,
          },
          token,
          expectToFail: false,
        });

        expect(updateData.updateOneApplicationVariable).toBe(true);

        const { data } = await findOneApplication({
          input: { id: application.id },
          gqlFields: APPLICATION_VARIABLES_GQL_FIELDS,
          token,
          expectToFail: false,
        });

        expect(data.findOneApplication).toEqual({
          id: application.id,
          applicationVariables: [
            { key: application.variableKey, value: 'explicit' },
          ],
        });
      });
    },
  );

  it('should let a session edit and read any chosen application', async () => {
    const { otherApplication } = globalTestContext;

    const { data: updateData } = await updateOneApplicationVariable({
      input: {
        key: otherApplication.variableKey,
        value: 'from-session',
        applicationId: otherApplication.id,
      },
      expectToFail: false,
    });

    expect(updateData.updateOneApplicationVariable).toBe(true);

    const { data } = await findOneApplication({
      input: { id: otherApplication.id },
      gqlFields: APPLICATION_VARIABLES_GQL_FIELDS,
      expectToFail: false,
    });

    expect(data.findOneApplication).toEqual({
      id: otherApplication.id,
      applicationVariables: [
        { key: otherApplication.variableKey, value: 'from-session' },
      ],
    });
  });
});
