import crypto from 'crypto';

import bcrypt from 'bcrypt';
import request from 'supertest';
import { callMcpTool } from 'test/integration/graphql/suites/application-role-intersection/utils/call-mcp-tool.util';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { generateAppleAdminApplicationTokenPair } from 'test/integration/utils/generate-apple-admin-application-token-pair.util';
import { ToolCategory } from 'twenty-shared/ai';
import { SystemPermissionFlag } from 'twenty-shared/constants';

import {
  SEED_APPLE_WORKSPACE_ID,
  SEED_YCOMBINATOR_WORKSPACE_ID,
} from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

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

const findCoreWorkflowCreator = async (coreWorkflowId: string) => {
  const [coreWorkflow] = await global.testDataSource.query(
    `SELECT "createdByUserWorkspaceId" FROM core."workflow" WHERE id = $1`,
    [coreWorkflowId],
  );

  return coreWorkflow.createdByUserWorkspaceId as string | null;
};

const CREATE_CORE_WORKFLOW = `
  mutation CreateCoreWorkflow($input: CreateCoreWorkflowInput!) {
    createCoreWorkflow(input: $input) {
      id
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

const ACTIVATE_CORE_WORKFLOW_VERSION = `
  mutation ActivateCoreWorkflowVersion($coreWorkflowVersionId: UUID!) {
    activateCoreWorkflowVersion(coreWorkflowVersionId: $coreWorkflowVersionId)
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

const CORE_WORKFLOW_APP_QUERY_FIELDS = [
  'coreWorkflows',
  'coreWorkflowVersionsByCoreWorkflowId',
];

const CORE_WORKFLOW_WRITE_FIELDS = [
  'createCoreWorkflow',
  'createCoreWorkflowVersionStep',
  'updateCoreWorkflowVersionStep',
  'updateCoreWorkflowVersionTrigger',
  'activateCoreWorkflowVersion',
];

const getMcpToolCatalog = async (
  token: string,
): Promise<Record<string, { name: string }[]>> => {
  const result = await callMcpTool({ toolName: 'get_tool_catalog', token });

  expect(result.isError).toBe(false);

  return JSON.parse(result.content[0].text).catalog;
};

const createCoreWorkflowAsMember = async (name: string) => {
  const createResponse = await graphqlAs(
    APPLE_JANE_ADMIN_ACCESS_TOKEN,
    CREATE_CORE_WORKFLOW,
    { input: { name } },
  );

  expect(createResponse.body.errors).toBeUndefined();

  return createResponse.body.data.createCoreWorkflow.id as string;
};

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
        APPLE_JANE_ADMIN_ACCESS_TOKEN,
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

  it('should refuse an application without a human user creating a workflow', async () => {
    const response = await graphqlAs(
      authorizedApplication.accessToken,
      CREATE_CORE_WORKFLOW,
      { input: { name: `App created workflow ${crypto.randomUUID()}` } },
    );

    expect(response.body.errors?.[0]?.extensions?.code).toBe('FORBIDDEN');
    expect(response.body.data?.createCoreWorkflow).toBeFalsy();
  });

  it('should refuse an application configuring and activating a workflow a member created', async () => {
    const coreWorkflowId = await createCoreWorkflowAsMember(
      `Member created workflow ${crypto.randomUUID()}`,
    );

    coreWorkflowIdsToDelete.push(coreWorkflowId);

    const versionsResponse = await graphqlAs(
      APPLE_JANE_ADMIN_ACCESS_TOKEN,
      CORE_WORKFLOW_VERSIONS,
      { coreWorkflowId },
    );

    const [{ id: coreWorkflowVersionId }] =
      versionsResponse.body.data.coreWorkflowVersionsByCoreWorkflowId;

    const triggerResponse = await graphqlAs(
      authorizedApplication.accessToken,
      UPDATE_CORE_TRIGGER,
      { input: { coreWorkflowVersionId, trigger: MANUAL_TRIGGER } },
    );

    expect(triggerResponse.body.errors?.[0]?.extensions?.code).toBe(
      'FORBIDDEN',
    );

    const activateResponse = await graphqlAs(
      authorizedApplication.accessToken,
      ACTIVATE_CORE_WORKFLOW_VERSION,
      { coreWorkflowVersionId },
    );

    expect(activateResponse.body.errors?.[0]?.extensions?.code).toBe(
      'FORBIDDEN',
    );
  });

  it('should attribute the workflow to the workspace member when a user creates it', async () => {
    const createResponse = await graphqlAs(
      APPLE_JANE_ADMIN_ACCESS_TOKEN,
      CREATE_CORE_WORKFLOW,
      { input: { name: `User created workflow ${crypto.randomUUID()}` } },
    );

    expect(createResponse.body.errors).toBeUndefined();

    const { id: coreWorkflowId } = createResponse.body.data.createCoreWorkflow;

    coreWorkflowIdsToDelete.push(coreWorkflowId);

    expect(await findCoreWorkflowCreator(coreWorkflowId)).not.toBeNull();
  });

  it('should refuse a user acting through an application creating a workflow', async () => {
    const { applicationAccessToken } =
      await generateAppleAdminApplicationTokenPair({
        applicationId: authorizedApplication.applicationId,
      });

    const response = await graphqlAs(
      applicationAccessToken.token,
      CREATE_CORE_WORKFLOW,
      { input: { name: `Delegated workflow ${crypto.randomUUID()}` } },
    );

    expect(response.body.errors?.[0]?.extensions?.code).toBe('FORBIDDEN');
    expect(response.body.data?.createCoreWorkflow).toBeFalsy();
  });

  it('should refuse an API key, which is neither a user nor an application', async () => {
    const response = await graphqlAs(
      API_KEY_ACCESS_TOKEN,
      CREATE_CORE_WORKFLOW,
      { input: { name: `Api key workflow ${crypto.randomUUID()}` } },
    );

    expect(response.body.errors?.[0]?.extensions?.code).toBe('FORBIDDEN');
    expect(response.body.data?.createCoreWorkflow).toBeFalsy();
  });

  it('should refuse an API key on a read, where no actor has to be resolved', async () => {
    const response = await graphqlAs(
      API_KEY_ACCESS_TOKEN,
      CORE_WORKFLOW_VERSIONS,
      {
        coreWorkflowId: crypto.randomUUID(),
      },
    );

    expect(response.body.errors?.[0]?.extensions?.code).toBe('FORBIDDEN');
    expect(
      response.body.data?.coreWorkflowVersionsByCoreWorkflowId,
    ).toBeFalsy();
  });

  it('should deny an application whose role does not grant the workflows permission', async () => {
    const response = await graphqlAs(
      deniedApplication.accessToken,
      CORE_WORKFLOW_VERSIONS,
      { coreWorkflowId: crypto.randomUUID() },
    );

    expect(response.body.errors?.[0]?.extensions?.code).toBe('FORBIDDEN');
    expect(
      response.body.data?.coreWorkflowVersionsByCoreWorkflowId,
    ).toBeFalsy();
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

  it('should expose the core workflow reads but no workflow write to the app SDK client', async () => {
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

    for (const fieldName of CORE_WORKFLOW_APP_QUERY_FIELDS) {
      expect(queryFieldNames).toContain(fieldName);
    }

    for (const fieldName of CORE_WORKFLOW_WRITE_FIELDS) {
      expect(mutationFieldNames).not.toContain(fieldName);
    }
  });

  it('should not offer workflow tools to an application over MCP', async () => {
    const applicationCatalog = await getMcpToolCatalog(
      authorizedApplication.accessToken,
    );
    const memberCatalog = await getMcpToolCatalog(
      APPLE_JANE_ADMIN_ACCESS_TOKEN,
    );

    expect(applicationCatalog[ToolCategory.WORKFLOW]).toBeUndefined();
    expect(memberCatalog[ToolCategory.WORKFLOW]?.length).toBeGreaterThan(0);
  });

  it('should let the application read a workflow a member created', async () => {
    const workflowName = `Member workflow read by app ${crypto.randomUUID()}`;
    const coreWorkflowId = await createCoreWorkflowAsMember(workflowName);

    coreWorkflowIdsToDelete.push(coreWorkflowId);

    const readResponse = await graphqlAs(
      authorizedApplication.accessToken,
      CORE_WORKFLOW_BY_ID,
      { coreWorkflowId },
    );

    expect(readResponse.body.errors).toBeUndefined();
    expect(readResponse.body.data?.coreWorkflowById?.id).toBe(coreWorkflowId);
    expect(readResponse.body.data?.coreWorkflowById?.name).toBe(workflowName);
  });
});
