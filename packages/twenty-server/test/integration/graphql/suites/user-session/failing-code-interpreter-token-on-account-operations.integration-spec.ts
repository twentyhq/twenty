import { authorizeApp } from 'test/integration/graphql/suites/user-session/utils/authorize-app.util';
import { currentUserApplicationAuthorizations } from 'test/integration/graphql/suites/user-session/utils/current-user-application-authorizations.util';
import { currentUser } from 'test/integration/graphql/suites/user-session/utils/current-user.util';
import { generatePlaygroundToken } from 'test/integration/graphql/suites/user-session/utils/generate-playground-token.util';
import { revokeApplicationAuthorization } from 'test/integration/graphql/suites/user-session/utils/revoke-application-authorization.util';
import {
  type CodeInterpreterSandboxTokens,
  captureCodeInterpreterSandboxTokens,
} from 'test/integration/graphql/suites/user-session/utils/capture-code-interpreter-sandbox-tokens.util';
import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import {
  type ApplicationWithVariable,
  setupApplicationWithVariable,
} from 'test/integration/metadata/suites/application/utils/setup-application-with-variable.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import {
  type EachTestingContext,
  eachTestingContextFilter,
} from 'twenty-shared/testing';
import { isDefined } from 'twenty-shared/utils';
import { v4 as uuidv4 } from 'uuid';

import {
  AppTokenEntity,
  AppTokenType,
} from 'src/engine/core-modules/app-token/app-token.entity';
import { ApplicationAuthorizationEntity } from 'src/engine/core-modules/application/application-authorization/application-authorization.entity';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_WORKSPACE_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-user-workspaces.util';
import { USER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-users.util';

type GlobalTestContext = CodeInterpreterSandboxTokens & {
  janeApplicationAuthorizationId: string;
};

type TestContext = {
  token: (globalContext: GlobalTestContext) => string;
};

const sandboxTokenTestCases: EachTestingContext<TestContext>[] = [
  {
    title: 'for an agent an application runs as Jane',
    context: {
      token: (globalContext) => globalContext.applicationRunAsJaneToken,
    },
  },
  {
    title: 'for Jane running the interpreter directly',
    context: { token: (globalContext) => globalContext.janeDirectRunToken },
  },
];

const countAuthorizationCodes = () =>
  getCoreRepository<AppTokenEntity>(AppTokenEntity).count({
    where: {
      userId: USER_DATA_SEED_IDS.JANE,
      type: AppTokenType.AuthorizationCode,
    },
  });

const findApplicationAuthorization = (id: string) =>
  getCoreRepository<ApplicationAuthorizationEntity>(
    ApplicationAuthorizationEntity,
  ).findOne({ where: { id } });

describe('Account operations with a code interpreter sandbox token should fail', () => {
  let application: ApplicationWithVariable;
  let globalTestContext: GlobalTestContext;

  beforeAll(async () => {
    application = await setupApplicationWithVariable({
      name: 'Code Interpreter Account Probe',
      variableKey: 'CODE_INTERPRETER_ACCOUNT_PROBE',
    });

    const sandboxTokens = await captureCodeInterpreterSandboxTokens({
      applicationId: application.id,
    });

    const janeApplicationAuthorization =
      await getCoreRepository<ApplicationAuthorizationEntity>(
        ApplicationAuthorizationEntity,
      ).save({
        userId: USER_DATA_SEED_IDS.JANE,
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.JANE,
        applicationId: application.id,
        scopes: [],
        lastAuthorizedAt: new Date(),
        lastUsedAt: new Date(),
        revokedAt: null,
      });

    globalTestContext = {
      ...sandboxTokens,
      janeApplicationAuthorizationId: janeApplicationAuthorization.id,
    };
  }, 120000);

  afterAll(async () => {
    if (!isDefined(application)) {
      return;
    }

    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: application.universalIdentifier,
    });
  });

  describe.each(eachTestingContextFilter(sandboxTokenTestCases))(
    '$title',
    ({ context }) => {
      it('should refuse to consent to an OAuth client, minting no authorization code', async () => {
        const authorizationCodesBefore = await countAuthorizationCodes();

        const { errors } = await authorizeApp({
          input: {
            clientId: uuidv4(),
            redirectUrl: 'https://app.twenty.test/callback',
            codeChallenge: 'a'.repeat(43),
          },
          token: context.token(globalTestContext),
          expectToFail: true,
        });

        expectOneNotInternalServerErrorSnapshot({ errors });

        expect(await countAuthorizationCodes()).toBe(authorizationCodesBefore);
      });

      it('should refuse to list the application authorizations', async () => {
        const { errors } = await currentUserApplicationAuthorizations({
          token: context.token(globalTestContext),
          expectToFail: true,
        });

        expectOneNotInternalServerErrorSnapshot({ errors });
      });

      it('should refuse to revoke an application authorization, which stays live', async () => {
        const { errors } = await revokeApplicationAuthorization({
          input: {
            applicationAuthorizationId:
              globalTestContext.janeApplicationAuthorizationId,
          },
          token: context.token(globalTestContext),
          expectToFail: true,
        });

        expectOneNotInternalServerErrorSnapshot({ errors });

        const applicationAuthorization = await findApplicationAuthorization(
          globalTestContext.janeApplicationAuthorizationId,
        );

        expect(applicationAuthorization?.revokedAt).toBeNull();
      });

      it('should refuse to mint a playground token', async () => {
        const { data, errors } = await generatePlaygroundToken({
          token: context.token(globalTestContext),
          expectToFail: true,
        });

        expectOneNotInternalServerErrorSnapshot({ errors });

        expect(data?.generatePlaygroundToken).toBeFalsy();
      });

      it('should refuse currentUser selecting availableWorkspaces', async () => {
        const { errors } = await currentUser({
          gqlFields: `
            id
            availableWorkspaces {
              availableWorkspacesForSignIn {
                id
              }
            }
          `,
          token: context.token(globalTestContext),
          expectToFail: true,
        });

        expectOneNotInternalServerErrorSnapshot({ errors });
      });
    },
  );
});
