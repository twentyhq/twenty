import { randomUUID } from 'crypto';

import { claimApplicationRegistrationOwnership } from 'test/integration/metadata/suites/application-registration/utils/claim-application-registration-ownership.util';
import { transferApplicationRegistrationOwnership } from 'test/integration/metadata/suites/application-registration/utils/transfer-application-registration-ownership.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { insertCatalogApplicationRegistration } from 'test/integration/metadata/suites/application/utils/insert-catalog-application-registration.util';
import {
  type ApplicationWithResources,
  setupApplicationWithResources,
} from 'test/integration/metadata/suites/application/utils/setup-application-with-resources.util';
import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { generateAppleAdminApplicationTokenPair } from 'test/integration/utils/generate-apple-admin-application-token-pair.util';
import { generateApplicationTokenPair } from 'test/integration/utils/generate-application-token-pair.util';
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

type OwnershipChangeTestContext = {
  initialOwnerWorkspaceId: string | null;
  request: (params: {
    applicationRegistrationId: string;
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
  {
    title: 'with an API key',
    context: { token: () => API_KEY_ACCESS_TOKEN },
  },
];

const ownershipChangeTestCases: EachTestingContext<OwnershipChangeTestContext>[] =
  [
    {
      title: 'transferApplicationRegistrationOwnership',
      context: {
        initialOwnerWorkspaceId: SEED_APPLE_WORKSPACE_ID,
        request: ({ applicationRegistrationId, token }) =>
          transferApplicationRegistrationOwnership({
            input: {
              applicationRegistrationId,
              targetWorkspaceSubdomain: 'yc',
            },
            token,
            expectToFail: true,
          }),
      },
    },
    {
      title: 'claimApplicationRegistrationOwnership',
      context: {
        initialOwnerWorkspaceId: null,
        request: ({ applicationRegistrationId, token }) =>
          claimApplicationRegistrationOwnership({
            input: { applicationRegistrationId },
            token,
            expectToFail: true,
          }),
      },
    },
  ];

const findOwnerWorkspaceId = async (
  applicationRegistrationId: string,
): Promise<string | null> => {
  const [row] = await globalThis.testDataSource.query(
    `SELECT "workspaceId" FROM core."applicationRegistration" WHERE id = $1`,
    [applicationRegistrationId],
  );

  return row.workspaceId;
};

describe('Application registration ownership change without a user session should fail', () => {
  let globalTestContext: GlobalTestContext;
  let targetRegistrationUniversalIdentifier: string;

  beforeAll(async () => {
    const callingApplication = await setupApplicationWithResources({
      name: 'Ownership Change Calling Application',
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

  afterEach(async () => {
    await globalThis.testDataSource.query(
      `DELETE FROM core."applicationRegistration" WHERE "universalIdentifier" = $1`,
      [targetRegistrationUniversalIdentifier],
    );
  });

  afterAll(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier:
        globalTestContext.callingApplication.universalIdentifier,
    });
  });

  describe.each(eachTestingContextFilter(tokenTestCases))(
    '$title',
    ({ context: tokenContext }) => {
      it.each(eachTestingContextFilter(ownershipChangeTestCases))(
        'should refuse $title and keep the owner',
        async ({ context }) => {
          targetRegistrationUniversalIdentifier = randomUUID();

          const applicationRegistrationId =
            await insertCatalogApplicationRegistration({
              universalIdentifier: targetRegistrationUniversalIdentifier,
              name: 'Ownership Change Target',
              sourcePackage: `ownership-change-target-${targetRegistrationUniversalIdentifier}`,
              workspaceId: context.initialOwnerWorkspaceId,
            });

          const { errors } = await context.request({
            applicationRegistrationId,
            token: tokenContext.token(globalTestContext),
          });

          expectOneNotInternalServerErrorSnapshot({ errors });
          expect(await findOwnerWorkspaceId(applicationRegistrationId)).toBe(
            context.initialOwnerWorkspaceId,
          );
        },
      );
    },
  );
});
