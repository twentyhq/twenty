import gql from 'graphql-tag';
import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import {
  ADMINISTRATION_OPERATION_QUERY_FACTORIES,
  type CallingApplication,
} from 'test/integration/metadata/suites/application/utils/administration-operation-query-factories.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import {
  type ApplicationWithVariable,
  setupApplicationWithVariable,
} from 'test/integration/metadata/suites/application/utils/setup-application-with-variable.util';
import { updateOneRoleQueryFactory } from 'test/integration/metadata/suites/role/utils/update-one-role-query-factory.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { makeMetadataApiRequestWithFileUpload } from 'test/integration/metadata/suites/utils/make-metadata-api-request-with-file-upload.util';
import { generateAppleAdminApplicationTokenPair } from 'test/integration/utils/generate-apple-admin-application-token-pair.util';
import { generateApplicationTokenPair } from 'test/integration/utils/generate-application-token-pair.util';
import { SystemPermissionFlag } from 'twenty-shared/constants';
import {
  type EachTestingContext,
  eachTestingContextFilter,
} from 'twenty-shared/testing';
import { isDefined } from 'twenty-shared/utils';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

type GlobalTestContext = {
  application: ApplicationWithVariable;
  callingApplication: CallingApplication;
  userBoundToken: string;
  unboundToken: string;
};

type TokenTestContext = {
  token: (globalContext: GlobalTestContext) => string;
};

const ADMINISTRATION_PERMISSION_FLAGS = [
  SystemPermissionFlag.APPLICATIONS,
  SystemPermissionFlag.MARKETPLACE_APPS,
  SystemPermissionFlag.UPLOAD_FILE,
  SystemPermissionFlag.API_KEYS_AND_WEBHOOKS,
  SystemPermissionFlag.ROLES,
  SystemPermissionFlag.WORKSPACE,
  SystemPermissionFlag.WORKSPACE_MEMBERS,
  SystemPermissionFlag.BILLING,
  SystemPermissionFlag.WORKFLOWS,
];

type OperationName = keyof typeof ADMINISTRATION_OPERATION_QUERY_FACTORIES;

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

const readRolePermissions = async (roleId: string) => {
  const [role] = await globalThis.testDataSource.query(
    `SELECT "canUpdateAllSettings", "canReadAllObjectRecords", "canUpdateAllObjectRecords", "canDestroyAllObjectRecords"
     FROM core."role" WHERE id = $1`,
    [roleId],
  );

  return role;
};

const operationNames = Object.keys(
  ADMINISTRATION_OPERATION_QUERY_FACTORIES,
) as OperationName[];

describe('Administration operations with an application token should fail', () => {
  let globalTestContext: GlobalTestContext;

  beforeAll(async () => {
    const application = await setupApplicationWithVariable({
      name: 'Administration Probe',
      variableKey: 'ADMINISTRATION_PROBE',
      permissionFlagUniversalIdentifiers: ADMINISTRATION_PERMISSION_FLAGS,
    });

    const [{ applicationRegistrationId }] =
      await globalThis.testDataSource.query(
        `SELECT "applicationRegistrationId" FROM core."application" WHERE "id" = $1`,
        [application.id],
      );

    const [userBoundTokenPair, unboundTokenPair] = await Promise.all([
      generateAppleAdminApplicationTokenPair({ applicationId: application.id }),
      generateApplicationTokenPair({
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        applicationId: application.id,
      }),
    ]);

    globalTestContext = {
      application,
      callingApplication: {
        applicationId: application.id,
        applicationUniversalIdentifier: application.universalIdentifier,
        applicationRegistrationId,
      },
      userBoundToken: userBoundTokenPair.applicationAccessToken.token,
      unboundToken: unboundTokenPair.applicationAccessToken.token,
    };
  }, 120000);

  afterAll(async () => {
    if (!isDefined(globalTestContext)) {
      return;
    }

    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier:
        globalTestContext.application.universalIdentifier,
    });
  });

  describe.each(eachTestingContextFilter(tokenTestCases))(
    '$title',
    ({ context }) => {
      it.each(operationNames)('should refuse %s', async (operationName) => {
        const response = await makeMetadataApiRequest(
          ADMINISTRATION_OPERATION_QUERY_FACTORIES[operationName](
            globalTestContext.callingApplication,
          ),
          context.token(globalTestContext),
        );

        expectOneNotInternalServerErrorSnapshot({
          errors: response.body.errors,
        });
      });

      it('should refuse uploadWorkspaceLogo', async () => {
        const response = await makeMetadataApiRequestWithFileUpload(
          {
            query: gql`
              mutation UploadWorkspaceLogo($file: Upload!) {
                uploadWorkspaceLogo(file: $file) {
                  __typename
                }
              }
            `,
            variables: { file: null },
          },
          {
            field: 'file',
            buffer: Buffer.from('application-token-probe'),
            filename: 'logo.png',
            contentType: 'image/png',
          },
          context.token(globalTestContext),
        );

        expectOneNotInternalServerErrorSnapshot({
          errors: response.body.errors,
        });
      });

      it('should refuse to raise its own role, which stays unchanged', async () => {
        const { defaultRoleId } = globalTestContext.application;
        const permissionsBeforeAttempt =
          await readRolePermissions(defaultRoleId);

        const response = await makeMetadataApiRequest(
          updateOneRoleQueryFactory({
            input: {
              idToUpdate: defaultRoleId,
              updatePayload: {
                canUpdateAllSettings: true,
                canReadAllObjectRecords: true,
                canUpdateAllObjectRecords: true,
                canDestroyAllObjectRecords: true,
              },
            },
          }),
          context.token(globalTestContext),
        );

        expectOneNotInternalServerErrorSnapshot({
          errors: response.body.errors,
        });
        expect(await readRolePermissions(defaultRoleId)).toEqual(
          permissionsBeforeAttempt,
        );
      });
    },
  );
});
