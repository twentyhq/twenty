import { randomUUID } from 'crypto';

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
import { createOneRole } from 'test/integration/metadata/suites/role/utils/create-one-role.util';
import { type Manifest } from 'twenty-shared/application';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { RowLevelPermissionPredicateOperand } from 'twenty-shared/types';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const TEST_APP_UNIVERSAL_IDENTIFIER = randomUUID();
const TEST_ROLE_UNIVERSAL_IDENTIFIER = randomUUID();
const TEST_OBJECT_PERMISSION_UNIVERSAL_IDENTIFIER = randomUUID();
const TEST_PREDICATE_UNIVERSAL_IDENTIFIER = randomUUID();

const VISIBLE_COMPANY_ID = randomUUID();
const HIDDEN_COMPANY_ID = randomUUID();
const VISIBLE_COMPANY_NAME = `Intersection Visible ${VISIBLE_COMPANY_ID}`;
const HIDDEN_COMPANY_NAME = `Intersection Hidden ${HIDDEN_COMPANY_ID}`;

const COMPANY_UNIVERSAL_IDENTIFIER =
  STANDARD_OBJECTS.company.universalIdentifier;
const COMPANY_NAME_FIELD_UNIVERSAL_IDENTIFIER =
  STANDARD_OBJECTS.company.fields.name.universalIdentifier;

// The application declares a role that is strictly narrower than the admin who
// holds the token: it may read but not update, and only sees companies whose
// name contains "Intersection Visible". The admin has neither bound, so every
// assertion below fails if the application's role is dropped.
const buildApplicationManifest = (): Manifest =>
  buildBaseManifest({
    appId: TEST_APP_UNIVERSAL_IDENTIFIER,
    roleId: TEST_ROLE_UNIVERSAL_IDENTIFIER,
    overrides: {
      roles: [
        {
          universalIdentifier: TEST_ROLE_UNIVERSAL_IDENTIFIER,
          label: 'Intersection Test Role',
          description: 'Role narrower than the user acting through the app',
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
              value: 'Intersection Visible',
            },
          ],
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

const findApplicationDefaultRoleId = async (): Promise<string | null> => {
  const rows = await globalThis.testDataSource.query(
    `SELECT "defaultRoleId" FROM core."application"
     WHERE "universalIdentifier" = $1 AND "workspaceId" = $2`,
    [TEST_APP_UNIVERSAL_IDENTIFIER, SEED_APPLE_WORKSPACE_ID],
  );

  return rows[0]?.defaultRoleId ?? null;
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

describe('An application acting for a user is bound by both roles', () => {
  let applicationAccessToken: string;

  beforeAll(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: TEST_APP_UNIVERSAL_IDENTIFIER,
      name: 'Role Intersection Test Application',
      description: 'App for testing application and user role intersection',
      sourcePath: 'test-role-intersection',
    });

    // setupApplicationForSync leaves fake timers installed.
    jest.useRealTimers();

    const { errors } = await syncApplication({
      manifest: buildApplicationManifest(),
      expectToFail: false,
    });

    expect(errors).toBeUndefined();

    const applicationId = await findApplicationId();

    expect(applicationId).toBeTruthy();
    expect(await findApplicationDefaultRoleId()).toBeTruthy();

    await createCompany(VISIBLE_COMPANY_ID, VISIBLE_COMPANY_NAME);
    await createCompany(HIDDEN_COMPANY_ID, HIDDEN_COMPANY_NAME);

    // Minted with the admin token, so it carries that admin's userId and
    // userWorkspaceId alongside the applicationId.
    const { data } = await generateApplicationToken({
      applicationId,
      expectToFail: false,
    });

    applicationAccessToken =
      data.generateApplicationToken.applicationAccessToken.token;
  }, 120000);

  afterAll(async () => {
    await destroyCompany(VISIBLE_COMPANY_ID);
    await destroyCompany(HIDDEN_COMPANY_ID);

    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: TEST_APP_UNIVERSAL_IDENTIFIER,
    });
  }, 120000);

  it('should let the user see both companies when acting on their own', async () => {
    const names = await findCompanyNames();

    expect(names).toHaveLength(2);
    expect(names).toEqual(
      expect.arrayContaining([VISIBLE_COMPANY_NAME, HIDDEN_COMPANY_NAME]),
    );
  });

  it('should apply the application row-level predicate even though the user has none', async () => {
    const names = await findCompanyNames(applicationAccessToken);

    expect(names).toEqual([VISIBLE_COMPANY_NAME]);
  });

  it('should refuse an update the application role forbids and the user role allows', async () => {
    const response = await makeGraphqlAPIRequest(
      updateOneOperationFactory({
        objectMetadataSingularName: 'company',
        gqlFields: COMPANY_GQL_FIELDS,
        recordId: VISIBLE_COMPANY_ID,
        data: { name: `${VISIBLE_COMPANY_NAME} edited` },
      }),
      applicationAccessToken,
    );

    expect(response.body.errors).toBeDefined();
    expect(response.body.data?.updateCompany).toBeFalsy();
  });

  it('should refuse a settings mutation the application role forbids', async () => {
    const { errors } = await createOneRole({
      expectToFail: true,
      token: applicationAccessToken,
      input: {
        label: `Should Never Exist ${randomUUID()}`,
        description: 'Created through an application whose role forbids it',
        icon: 'IconLock',
      },
    });

    expect(errors).toBeDefined();
  });

  it('should let the same update through when the user acts on their own', async () => {
    const response = await makeGraphqlAPIRequest(
      updateOneOperationFactory({
        objectMetadataSingularName: 'company',
        gqlFields: COMPANY_GQL_FIELDS,
        recordId: VISIBLE_COMPANY_ID,
        data: { name: VISIBLE_COMPANY_NAME },
      }),
    );

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.updateCompany.id).toBe(VISIBLE_COMPANY_ID);
  });
});
