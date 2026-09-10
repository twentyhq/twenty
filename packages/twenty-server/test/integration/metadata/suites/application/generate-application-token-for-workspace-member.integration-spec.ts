import { randomUUID } from 'crypto';

import gql from 'graphql-tag';
import { COMPANY_GQL_FIELDS } from 'test/integration/constants/company-gql-fields.constants';
import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { destroyOneOperationFactory } from 'test/integration/graphql/utils/destroy-one-operation-factory.util';
import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { updateOneOperationFactory } from 'test/integration/graphql/utils/update-one-operation-factory.util';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { generateApplicationToken } from 'test/integration/metadata/suites/application/utils/generate-application-token.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { type Manifest } from 'twenty-shared/application';
import { SystemPermissionFlag } from 'twenty-shared/constants';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { RowLevelPermissionPredicateOperand } from 'twenty-shared/types';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

const TEST_APP_UNIVERSAL_IDENTIFIER = randomUUID();
const TEST_ROLE_UNIVERSAL_IDENTIFIER = randomUUID();
const TEST_OBJECT_PERMISSION_UNIVERSAL_IDENTIFIER = randomUUID();
const TEST_PREDICATE_UNIVERSAL_IDENTIFIER = randomUUID();

const VISIBLE_COMPANY_ID = randomUUID();
const HIDDEN_COMPANY_ID = randomUUID();
const VISIBLE_COMPANY_NAME = `Run As Visible ${VISIBLE_COMPANY_ID}`;
const HIDDEN_COMPANY_NAME = `Run As Hidden ${HIDDEN_COMPANY_ID}`;

const COMPANY_UNIVERSAL_IDENTIFIER =
  STANDARD_OBJECTS.company.universalIdentifier;
const COMPANY_NAME_FIELD_UNIVERSAL_IDENTIFIER =
  STANDARD_OBJECTS.company.fields.name.universalIdentifier;

// The application's role is strictly narrower than the admin it will act as:
// read only, and only companies whose name contains "Run As Visible". Every
// assertion on the minted token fails if either role stops applying.
const buildApplicationManifest = ({
  canImpersonate,
}: {
  canImpersonate: boolean;
}): Manifest =>
  buildBaseManifest({
    appId: TEST_APP_UNIVERSAL_IDENTIFIER,
    roleId: TEST_ROLE_UNIVERSAL_IDENTIFIER,
    overrides: {
      roles: [
        {
          universalIdentifier: TEST_ROLE_UNIVERSAL_IDENTIFIER,
          label: 'Run As Member Test Role',
          description: 'Role narrower than the member the app acts as',
          canUpdateAllSettings: false,
          canReadAllObjectRecords: true,
          canUpdateAllObjectRecords: false,
          objectPermissions: [
            {
              universalIdentifier: TEST_OBJECT_PERMISSION_UNIVERSAL_IDENTIFIER,
              objectUniversalIdentifier: COMPANY_UNIVERSAL_IDENTIFIER,
              canReadObjectRecords: true,
              canUpdateObjectRecords: false,
            },
          ],
          rowLevelPermissionPredicates: [
            {
              universalIdentifier: TEST_PREDICATE_UNIVERSAL_IDENTIFIER,
              objectUniversalIdentifier: COMPANY_UNIVERSAL_IDENTIFIER,
              fieldUniversalIdentifier: COMPANY_NAME_FIELD_UNIVERSAL_IDENTIFIER,
              operand: RowLevelPermissionPredicateOperand.CONTAINS,
              value: 'Run As Visible',
            },
          ],
          permissionFlagUniversalIdentifiers: canImpersonate
            ? [SystemPermissionFlag.IMPERSONATE]
            : [],
        },
      ],
    },
  });

const findApplicationId = async (): Promise<string> => {
  const rows = await globalThis.testDataSource.query(
    `SELECT id FROM core."application"
     WHERE "universalIdentifier" = $1 AND "workspaceId" = $2`,
    [TEST_APP_UNIVERSAL_IDENTIFIER, SEED_APPLE_WORKSPACE_ID],
  );

  return rows[0]?.id;
};

const generateTokenForWorkspaceMember = async ({
  workspaceMemberId,
  token,
}: {
  workspaceMemberId: string;
  token: string;
}) => {
  const response = await makeMetadataAPIRequest(
    {
      query: gql`
        mutation GenerateApplicationTokenForWorkspaceMember(
          $workspaceMemberId: UUID!
        ) {
          generateApplicationTokenForWorkspaceMember(
            workspaceMemberId: $workspaceMemberId
          ) {
            token
            expiresAt
          }
        }
      `,
      variables: { workspaceMemberId },
    },
    token,
  );

  return {
    token: response.body.data?.generateApplicationTokenForWorkspaceMember
      ?.token as string | undefined,
    errors: response.body.errors as { message: string }[] | undefined,
  };
};

const createCompany = async (id: string, name: string) =>
  makeGraphqlAPIRequest(
    createOneOperationFactory({
      objectMetadataSingularName: 'company',
      gqlFields: COMPANY_GQL_FIELDS,
      data: { id, name },
    }),
  );

const destroyCompany = async (id: string) =>
  makeGraphqlAPIRequest(
    destroyOneOperationFactory({
      objectMetadataSingularName: 'company',
      gqlFields: 'id',
      recordId: id,
    }),
  );

const findCompanyNames = async (token?: string): Promise<string[]> => {
  const response = await makeGraphqlAPIRequest(
    findManyOperationFactory({
      objectMetadataSingularName: 'company',
      objectMetadataPluralName: 'companies',
      gqlFields: 'id name',
      filter: { id: { in: [VISIBLE_COMPANY_ID, HIDDEN_COMPANY_ID] } },
    }),
    token,
  );

  expect(response.body.errors).toBeUndefined();

  return response.body.data.companies.edges.map(
    (edge: { node: { name: string } }) => edge.node.name,
  );
};

describe('generateApplicationTokenForWorkspaceMember', () => {
  let applicationId: string;
  // Minted with the API key, so it names no person: the shape a logic
  // function run holds when nobody triggered it.
  let applicationOnlyToken: string;
  // Minted with Jane's admin token, so it is already bound to Jane.
  let janeDelegatedToken: string;

  beforeAll(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: TEST_APP_UNIVERSAL_IDENTIFIER,
      name: 'Run As Member Test Application',
      description: 'App for testing member-bound application tokens',
      sourcePath: 'test-run-as-member',
    });

    // setupApplicationForSync leaves fake timers installed.
    jest.useRealTimers();

    const { errors } = await syncApplication({
      manifest: buildApplicationManifest({ canImpersonate: false }),
      expectToFail: false,
    });

    expect(errors).toBeUndefined();

    applicationId = await findApplicationId();

    expect(applicationId).toBeTruthy();

    await createCompany(VISIBLE_COMPANY_ID, VISIBLE_COMPANY_NAME);
    await createCompany(HIDDEN_COMPANY_ID, HIDDEN_COMPANY_NAME);

    const { data: applicationOnly } = await generateApplicationToken({
      applicationId,
      expectToFail: false,
      token: API_KEY_ACCESS_TOKEN,
    });

    applicationOnlyToken =
      applicationOnly.generateApplicationToken.applicationAccessToken.token;

    const { data: delegated } = await generateApplicationToken({
      applicationId,
      expectToFail: false,
    });

    janeDelegatedToken =
      delegated.generateApplicationToken.applicationAccessToken.token;
  }, 120000);

  afterAll(async () => {
    await destroyCompany(VISIBLE_COMPANY_ID);
    await destroyCompany(HIDDEN_COMPANY_ID);

    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: TEST_APP_UNIVERSAL_IDENTIFIER,
    });
  }, 120000);

  it('should refuse a token that is not an application token', async () => {
    const { token, errors } = await generateTokenForWorkspaceMember({
      workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
      token: APPLE_JANE_ADMIN_ACCESS_TOKEN,
    });

    expect(token).toBeUndefined();
    expect(errors?.[0]?.message).toContain('APPLICATION_ACCESS');
  });

  it('should refuse an application whose role does not declare the impersonate permission', async () => {
    const { token, errors } = await generateTokenForWorkspaceMember({
      workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
      token: applicationOnlyToken,
    });

    expect(token).toBeUndefined();
    expect(errors).toBeDefined();
  });

  describe('once the application role declares the impersonate permission', () => {
    let timToken: string;

    beforeAll(async () => {
      const { errors } = await syncApplication({
        manifest: buildApplicationManifest({ canImpersonate: true }),
        expectToFail: false,
      });

      expect(errors).toBeUndefined();

      const minted = await generateTokenForWorkspaceMember({
        workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
        token: applicationOnlyToken,
      });

      expect(minted.errors).toBeUndefined();
      expect(minted.token).toBeTruthy();

      timToken = minted.token as string;
    }, 120000);

    it('should issue only an access token', async () => {
      const response = await makeMetadataAPIRequest(
        {
          query: gql`
            mutation GenerateApplicationTokenForWorkspaceMember(
              $workspaceMemberId: UUID!
            ) {
              generateApplicationTokenForWorkspaceMember(
                workspaceMemberId: $workspaceMemberId
              ) {
                applicationRefreshToken {
                  token
                }
              }
            }
          `,
          variables: { workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM },
        },
        applicationOnlyToken,
      );

      expect(response.body.errors).toBeDefined();
      expect(response.body.data).toBeFalsy();
    });

    it('should let the admin see both companies when acting on their own', async () => {
      const names = await findCompanyNames();

      expect(names).toEqual(
        expect.arrayContaining([VISIBLE_COMPANY_NAME, HIDDEN_COMPANY_NAME]),
      );
    });

    it('should bound the minted token by the application role even though the member is an admin', async () => {
      const names = await findCompanyNames(timToken);

      expect(names).toEqual([VISIBLE_COMPANY_NAME]);
    });

    it('should refuse a write the application role forbids, whatever the member may do', async () => {
      const response = await makeGraphqlAPIRequest(
        updateOneOperationFactory({
          objectMetadataSingularName: 'company',
          gqlFields: COMPANY_GQL_FIELDS,
          recordId: VISIBLE_COMPANY_ID,
          data: { name: `${VISIBLE_COMPANY_NAME} edited` },
        }),
        timToken,
      );

      expect(response.body.errors).toBeDefined();
      expect(response.body.data?.updateCompany).toBeFalsy();
    });

    it('should refuse an unknown member', async () => {
      const { token, errors } = await generateTokenForWorkspaceMember({
        workspaceMemberId: '20202020-0000-4000-8000-000000000000',
        token: applicationOnlyToken,
      });

      expect(token).toBeUndefined();
      expect(errors?.[0]?.message).toContain('not found');
    });

    it('should let a token already bound to a person re-issue itself for that person only', async () => {
      const self = await generateTokenForWorkspaceMember({
        workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
        token: janeDelegatedToken,
      });

      expect(self.errors).toBeUndefined();
      expect(self.token).toBeTruthy();

      const other = await generateTokenForWorkspaceMember({
        workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
        token: janeDelegatedToken,
      });

      expect(other.token).toBeUndefined();
      expect(other.errors?.[0]?.message).toContain('only act as that user');
    });
  });
});
