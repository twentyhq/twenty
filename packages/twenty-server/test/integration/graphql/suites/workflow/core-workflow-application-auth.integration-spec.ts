import crypto from 'crypto';

import bcrypt from 'bcrypt';
import request from 'supertest';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { generateApplicationToken } from 'test/integration/metadata/suites/application/utils/generate-application-token.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { SystemPermissionFlag } from 'twenty-shared/constants';

import {
  SEED_APPLE_WORKSPACE_ID,
  SEED_YCOMBINATOR_WORKSPACE_ID,
} from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const APPLE_WORKSPACE_SCHEMA = 'workspace_1wgvd1injqtife6y4rvfbu3h5';

const baseUrl = `http://localhost:${APP_PORT}`;

type InstalledTestApplication = {
  applicationUniversalIdentifier: string;
  applicationId: string;
  accessToken: string;
};

const graphqlAs = (token: string, query: string, variables?: object) =>
  request(baseUrl)
    .post('/graphql')
    .set('Authorization', `Bearer ${token}`)
    .send({ query, variables });

const installApplicationWithoutUser = async ({
  name,
  grantsWorkflowsPermission,
}: {
  name: string;
  grantsWorkflowsPermission: boolean;
}): Promise<InstalledTestApplication> => {
  const applicationUniversalIdentifier = crypto.randomUUID();
  const roleUniversalIdentifier = crypto.randomUUID();

  await setupApplicationForSync({
    applicationUniversalIdentifier,
    name,
    description: name,
    sourcePath: name,
  });

  await syncApplication({
    manifest: buildBaseManifest({
      appId: applicationUniversalIdentifier,
      roleId: roleUniversalIdentifier,
      overrides: {
        roles: [
          {
            universalIdentifier: roleUniversalIdentifier,
            label: `${name} role`,
            description: 'Role used by the workflow application auth suite',
            canUpdateAllSettings: false,
            canReadAllObjectRecords: true,
            canUpdateAllObjectRecords: true,
            permissionFlagUniversalIdentifiers: grantsWorkflowsPermission
              ? [SystemPermissionFlag.WORKFLOWS]
              : [],
          },
        ],
      },
    }),
  });

  const [{ id: applicationId, applicationRegistrationId }] =
    await global.testDataSource.query(
      `SELECT id, "applicationRegistrationId" FROM core."application"
       WHERE "universalIdentifier" = $1 AND "workspaceId" = $2`,
      [applicationUniversalIdentifier, SEED_APPLE_WORKSPACE_ID],
    );

  const clientSecret = crypto.randomBytes(32).toString('hex');

  await global.testDataSource.query(
    `UPDATE core."applicationRegistration"
     SET "oAuthClientSecretHash" = $1, "oAuthScopes" = $2
     WHERE id = $3`,
    [
      await bcrypt.hash(clientSecret, 10),
      ['read', 'write'],
      applicationRegistrationId,
    ],
  );

  const [{ oAuthClientId }] = await global.testDataSource.query(
    `SELECT "oAuthClientId" FROM core."applicationRegistration" WHERE id = $1`,
    [applicationRegistrationId],
  );

  const tokenResponse = await request(baseUrl).post('/oauth/token').send({
    grant_type: 'client_credentials',
    client_id: oAuthClientId,
    client_secret: clientSecret,
  });

  if (tokenResponse.status !== 200) {
    throw new Error(
      `client_credentials grant failed (${tokenResponse.status}): ${JSON.stringify(tokenResponse.body)}`,
    );
  }

  return {
    applicationUniversalIdentifier,
    applicationId,
    accessToken: tokenResponse.body.access_token as string,
  };
};

const CREATE_CORE_WORKFLOW = `
  mutation CreateCoreWorkflow($input: CreateCoreWorkflowInput!) {
    createCoreWorkflow(input: $input) {
      id
      workspaceWorkflowId
    }
  }
`;

const CORE_WORKFLOW_VERSIONS = `
  query CoreWorkflowVersionsByCoreWorkflowId($coreWorkflowId: UUID!) {
    coreWorkflowVersionsByCoreWorkflowId(coreWorkflowId: $coreWorkflowId) {
      id
      status
    }
  }
`;

const CORE_WORKFLOW_BY_ID = `
  query CoreWorkflowById($coreWorkflowId: UUID!) {
    coreWorkflowById(coreWorkflowId: $coreWorkflowId) {
      id
      name
    }
  }
`;

const UPDATE_CORE_TRIGGER = `
  mutation UpdateCoreWorkflowVersionTrigger($input: UpdateCoreWorkflowVersionTriggerInput!) {
    updateCoreWorkflowVersionTrigger(input: $input) {
      trigger
    }
  }
`;

const MANUAL_TRIGGER = {
  name: 'Manual Trigger',
  type: 'MANUAL',
  settings: { outputSchema: {} },
  nextStepIds: [],
  position: { x: 0, y: 0 },
};

const APP_SCHEMA_INTROSPECTION = `
  query AppSchema {
    __schema {
      queryType {
        fields {
          name
        }
      }
      mutationType {
        fields {
          name
        }
      }
    }
  }
`;

const SCHEMA_OPERATION_SIGNATURES = `
  query OperationSignatures {
    __schema {
      queryType {
        fields {
          name
          type { ...TypeRef }
          args { name type { ...TypeRef } }
        }
      }
      mutationType {
        fields {
          name
          type { ...TypeRef }
          args { name type { ...TypeRef } }
        }
      }
    }
  }

  fragment TypeRef on __Type {
    kind
    name
    ofType {
      kind
      name
      ofType {
        kind
        name
        ofType { kind name }
      }
    }
  }
`;

type IntrospectedField = {
  name: string;
  type: object;
  args: { name: string; type: object }[];
};

const indexSignaturesByOperationName = (responseBody: {
  data?: {
    __schema?: {
      queryType?: { fields?: IntrospectedField[] };
      mutationType?: { fields?: IntrospectedField[] };
    };
  };
}): Record<string, string> =>
  Object.fromEntries(
    [
      ...(responseBody.data?.__schema?.queryType?.fields ?? []),
      ...(responseBody.data?.__schema?.mutationType?.fields ?? []),
    ].map((field) => [
      field.name,
      JSON.stringify({
        type: field.type,
        args: [...field.args]
          .sort((left, right) => left.name.localeCompare(right.name))
          .map((argument) => ({ name: argument.name, type: argument.type })),
      }),
    ]),
  );

const CORE_WORKFLOW_SEEDING_QUERY_FIELDS = [
  'coreWorkflows',
  'coreWorkflowVersionsByCoreWorkflowId',
];

const CORE_WORKFLOW_SEEDING_MUTATION_FIELDS = [
  'createCoreWorkflow',
  'createCoreWorkflowVersionStep',
  'updateCoreWorkflowVersionStep',
  'updateCoreWorkflowVersionTrigger',
  'activateCoreWorkflowVersion',
];

describe('core workflow API with application credentials (integration)', () => {
  let authorizedApplication: InstalledTestApplication;
  let deniedApplication: InstalledTestApplication;

  const coreWorkflowIdsToDelete: string[] = [];

  beforeAll(async () => {
    authorizedApplication = await installApplicationWithoutUser({
      name: `Authorized workflow app ${crypto.randomUUID().slice(0, 8)}`,
      grantsWorkflowsPermission: true,
    });

    deniedApplication = await installApplicationWithoutUser({
      name: `Denied workflow app ${crypto.randomUUID().slice(0, 8)}`,
      grantsWorkflowsPermission: false,
    });
  });

  afterAll(async () => {
    if (coreWorkflowIdsToDelete.length > 0) {
      await graphqlAs(
        authorizedApplication.accessToken,
        `
          mutation DeleteCoreWorkflows($input: DeleteCoreWorkflowsInput!) {
            deleteCoreWorkflows(input: $input) {
              id
            }
          }
        `,
        { input: { coreWorkflowIds: coreWorkflowIdsToDelete } },
      );
    }

    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier:
        authorizedApplication.applicationUniversalIdentifier,
    });
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier:
        deniedApplication.applicationUniversalIdentifier,
    });
  });

  it('should let an application without a human user create and configure a workflow', async () => {
    const createResponse = await graphqlAs(
      authorizedApplication.accessToken,
      CREATE_CORE_WORKFLOW,
      { input: { name: `App seeded workflow ${crypto.randomUUID()}` } },
    );

    expect(createResponse.body.errors).toBeUndefined();

    const coreWorkflowId = createResponse.body.data.createCoreWorkflow.id;

    coreWorkflowIdsToDelete.push(coreWorkflowId);

    const versionsResponse = await graphqlAs(
      authorizedApplication.accessToken,
      CORE_WORKFLOW_VERSIONS,
      { coreWorkflowId },
    );

    expect(versionsResponse.body.errors).toBeUndefined();

    const versions =
      versionsResponse.body.data.coreWorkflowVersionsByCoreWorkflowId;

    expect(versions).toHaveLength(1);
    expect(versions[0].status).toBe('DRAFT');

    const triggerResponse = await graphqlAs(
      authorizedApplication.accessToken,
      UPDATE_CORE_TRIGGER,
      {
        input: {
          coreWorkflowVersionId: versions[0].id,
          trigger: MANUAL_TRIGGER,
        },
      },
    );

    expect(triggerResponse.body.errors).toBeUndefined();
  });

  it('should attribute the created workflow to the application rather than to a workspace member', async () => {
    const createResponse = await graphqlAs(
      authorizedApplication.accessToken,
      CREATE_CORE_WORKFLOW,
      { input: { name: `App attributed workflow ${crypto.randomUUID()}` } },
    );

    expect(createResponse.body.errors).toBeUndefined();

    const { id: coreWorkflowId, workspaceWorkflowId } =
      createResponse.body.data.createCoreWorkflow;

    coreWorkflowIdsToDelete.push(coreWorkflowId);

    const [mirror] = await global.testDataSource.query(
      `SELECT "createdBySource", "createdByWorkspaceMemberId"
       FROM "${APPLE_WORKSPACE_SCHEMA}"."workflow" WHERE id = $1`,
      [workspaceWorkflowId],
    );

    expect(mirror.createdBySource).toBe('APPLICATION');
    expect(mirror.createdByWorkspaceMemberId).toBeNull();
  });

  it('should attribute the workflow to the workspace member when a user creates it', async () => {
    const createResponse = await graphqlAs(
      APPLE_JANE_ADMIN_ACCESS_TOKEN,
      CREATE_CORE_WORKFLOW,
      { input: { name: `User created workflow ${crypto.randomUUID()}` } },
    );

    expect(createResponse.body.errors).toBeUndefined();

    const { id: coreWorkflowId, workspaceWorkflowId } =
      createResponse.body.data.createCoreWorkflow;

    coreWorkflowIdsToDelete.push(coreWorkflowId);

    const [mirror] = await global.testDataSource.query(
      `SELECT "createdBySource", "createdByWorkspaceMemberId", "createdByName"
       FROM "${APPLE_WORKSPACE_SCHEMA}"."workflow" WHERE id = $1`,
      [workspaceWorkflowId],
    );

    expect(mirror.createdBySource).toBe('MANUAL');
    expect(mirror.createdByWorkspaceMemberId).not.toBeNull();
  });

  it('should keep the application role when a user acts through the application', async () => {
    const { data } = await generateApplicationToken({
      applicationId: authorizedApplication.applicationId,
    });

    const delegatedToken =
      data.generateApplicationToken.applicationAccessToken.token;

    const createResponse = await graphqlAs(
      delegatedToken,
      CREATE_CORE_WORKFLOW,
      { input: { name: `Delegated workflow ${crypto.randomUUID()}` } },
    );

    expect(createResponse.body.errors).toBeUndefined();

    const { id: coreWorkflowId, workspaceWorkflowId } =
      createResponse.body.data.createCoreWorkflow;

    coreWorkflowIdsToDelete.push(coreWorkflowId);

    const [mirror] = await global.testDataSource.query(
      `SELECT "createdBySource", "createdByWorkspaceMemberId"
       FROM "${APPLE_WORKSPACE_SCHEMA}"."workflow" WHERE id = $1`,
      [workspaceWorkflowId],
    );

    expect(mirror.createdBySource).toBe('MANUAL');
    expect(mirror.createdByWorkspaceMemberId).not.toBeNull();
  });

  it('should refuse an API key, which is neither a user nor an application', async () => {
    const response = await graphqlAs(
      API_KEY_ACCESS_TOKEN,
      CREATE_CORE_WORKFLOW,
      { input: { name: `Api key workflow ${crypto.randomUUID()}` } },
    );

    expect(response.body.errors).toBeDefined();
    expect(response.body.data?.createCoreWorkflow).toBeFalsy();
  });

  it('should deny an application whose role does not grant the workflows permission', async () => {
    const response = await graphqlAs(
      deniedApplication.accessToken,
      CREATE_CORE_WORKFLOW,
      { input: { name: `Denied workflow ${crypto.randomUUID()}` } },
    );

    expect(response.body.errors?.[0]?.extensions?.code).toBe('FORBIDDEN');
    expect(response.body.data?.createCoreWorkflow).toBeFalsy();
  });

  it('should not expose a core workflow that belongs to another workspace', async () => {
    const otherWorkspaceCoreWorkflowId = crypto.randomUUID();

    const [{ id: otherWorkspaceApplicationId }] =
      await global.testDataSource.query(
        `SELECT id FROM core."application" WHERE "workspaceId" = $1 LIMIT 1`,
        [SEED_YCOMBINATOR_WORKSPACE_ID],
      );

    await global.testDataSource.query(
      `INSERT INTO core."workflow" (id, "workspaceId", name, "universalIdentifier", "applicationId")
       VALUES ($1, $2, 'Other workspace workflow', $3, $4)`,
      [
        otherWorkspaceCoreWorkflowId,
        SEED_YCOMBINATOR_WORKSPACE_ID,
        crypto.randomUUID(),
        otherWorkspaceApplicationId,
      ],
    );

    try {
      const response = await graphqlAs(
        authorizedApplication.accessToken,
        CORE_WORKFLOW_BY_ID,
        { coreWorkflowId: otherWorkspaceCoreWorkflowId },
      );

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data?.coreWorkflowById).toBeNull();
    } finally {
      await global.testDataSource.query(
        `DELETE FROM core."workflow" WHERE id = $1`,
        [otherWorkspaceCoreWorkflowId],
      );
    }
  });

  it('should keep refusing an unauthenticated request', async () => {
    const response = await request(baseUrl)
      .post('/graphql')
      .send({
        query: CREATE_CORE_WORKFLOW,
        variables: { input: { name: 'Unauthenticated workflow' } },
      });

    expect(response.body.errors).toBeDefined();
    expect(response.body.data?.createCoreWorkflow).toBeFalsy();
  });

  it('should expose the core workflow operations the app SDK client seeds with', async () => {
    const response = await graphqlAs(
      authorizedApplication.accessToken,
      APP_SCHEMA_INTROSPECTION,
    );

    expect(response.body.errors).toBeUndefined();

    const queryFieldNames = (
      response.body.data?.__schema?.queryType?.fields ?? []
    ).map((field: { name: string }) => field.name);
    const mutationFieldNames = (
      response.body.data?.__schema?.mutationType?.fields ?? []
    ).map((field: { name: string }) => field.name);

    for (const fieldName of CORE_WORKFLOW_SEEDING_QUERY_FIELDS) {
      expect(queryFieldNames).toContain(fieldName);
    }

    for (const fieldName of CORE_WORKFLOW_SEEDING_MUTATION_FIELDS) {
      expect(mutationFieldNames).toContain(fieldName);
    }
  });

  it('should declare the seeded operations exactly as the core schema declares them', async () => {
    const [appSchemaResponse, coreSchemaResponse] = await Promise.all([
      graphqlAs(authorizedApplication.accessToken, SCHEMA_OPERATION_SIGNATURES),
      graphqlAs(APPLE_JANE_ADMIN_ACCESS_TOKEN, SCHEMA_OPERATION_SIGNATURES),
    ]);

    expect(appSchemaResponse.body.errors).toBeUndefined();
    expect(coreSchemaResponse.body.errors).toBeUndefined();

    const appSignatures = indexSignaturesByOperationName(
      appSchemaResponse.body,
    );
    const coreSignatures = indexSignaturesByOperationName(
      coreSchemaResponse.body,
    );

    for (const operationName of [
      ...CORE_WORKFLOW_SEEDING_QUERY_FIELDS,
      ...CORE_WORKFLOW_SEEDING_MUTATION_FIELDS,
    ]) {
      expect(coreSignatures[operationName]).toBeDefined();
      expect({
        operationName,
        signature: appSignatures[operationName],
      }).toEqual({ operationName, signature: coreSignatures[operationName] });
    }
  });

  it('should let the application read back a workflow it just created', async () => {
    const workflowName = `Seeded enrichment workflow ${crypto.randomUUID()}`;

    const createResponse = await graphqlAs(
      authorizedApplication.accessToken,
      CREATE_CORE_WORKFLOW,
      { input: { name: workflowName } },
    );

    expect(createResponse.body.errors).toBeUndefined();

    const createdCoreWorkflowId =
      createResponse.body.data?.createCoreWorkflow?.id;

    expect(createdCoreWorkflowId).toBeDefined();

    coreWorkflowIdsToDelete.push(createdCoreWorkflowId);

    const readResponse = await graphqlAs(
      authorizedApplication.accessToken,
      CORE_WORKFLOW_BY_ID,
      { coreWorkflowId: createdCoreWorkflowId },
    );

    expect(readResponse.body.errors).toBeUndefined();
    expect(readResponse.body.data?.coreWorkflowById?.id).toBe(
      createdCoreWorkflowId,
    );
    expect(readResponse.body.data?.coreWorkflowById?.name).toBe(workflowName);
  });
});
