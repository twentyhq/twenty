import crypto from 'crypto';

import bcrypt from 'bcrypt';
import request from 'supertest';

import {
  SEED_APPLE_WORKSPACE_ID,
  SEED_YCOMBINATOR_WORKSPACE_ID,
} from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const baseUrl = `http://localhost:${APP_PORT}`;

type InstalledTestApplication = {
  registrationId: string;
  applicationId: string;
  roleId: string;
  accessToken: string;
};

const graphqlAs = (token: string, query: string, variables?: object) =>
  request(baseUrl)
    .post('/graphql')
    .set('Authorization', `Bearer ${token}`)
    .send({ query, variables });

const installApplication = async ({
  workspaceId,
  name,
  canUpdateAllSettings,
}: {
  workspaceId: string;
  name: string;
  canUpdateAllSettings: boolean;
}): Promise<InstalledTestApplication> => {
  const registrationId = crypto.randomUUID();
  const applicationId = crypto.randomUUID();
  const roleId = crypto.randomUUID();
  const clientId = crypto.randomUUID();
  const clientSecret = crypto.randomBytes(32).toString('hex');

  await global.testDataSource.query(
    `INSERT INTO core."applicationRegistration"
      (id, "universalIdentifier", name, "oAuthClientId", "oAuthClientSecretHash", "oAuthRedirectUris", "oAuthScopes", "workspaceId")
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [
      registrationId,
      crypto.randomUUID(),
      name,
      clientId,
      await bcrypt.hash(clientSecret, 10),
      ['https://example.com/callback'],
      ['read', 'write'],
      workspaceId,
    ],
  );

  await global.testDataSource.query(
    `INSERT INTO core."application"
      (id, "universalIdentifier", name, "workspaceId", "applicationRegistrationId", "sourceType", "sourcePath", "canBeUninstalled")
     VALUES ($1, $2, $3, $4, $5, 'local', '', true)`,
    [applicationId, crypto.randomUUID(), name, workspaceId, registrationId],
  );

  await global.testDataSource.query(
    `INSERT INTO core."role"
      (id, "universalIdentifier", "applicationId", "workspaceId", label, "canUpdateAllSettings", "canReadAllObjectRecords", "canUpdateAllObjectRecords")
     VALUES ($1, $2, $3, $4, $5, $6, true, true)`,
    [
      roleId,
      crypto.randomUUID(),
      applicationId,
      workspaceId,
      `${name} role`,
      canUpdateAllSettings,
    ],
  );

  await global.testDataSource.query(
    `UPDATE core."application" SET "defaultRoleId" = $1 WHERE id = $2`,
    [roleId, applicationId],
  );

  const tokenResponse = await request(baseUrl)
    .post('/oauth/token')
    .send({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
    })
    .expect(200);

  return {
    registrationId,
    applicationId,
    roleId,
    accessToken: tokenResponse.body.access_token as string,
  };
};

const cleanupApplication = async (application: InstalledTestApplication) => {
  await global.testDataSource.query(
    `UPDATE core."application" SET "defaultRoleId" = NULL WHERE id = $1`,
    [application.applicationId],
  );
  await global.testDataSource.query(`DELETE FROM core."role" WHERE id = $1`, [
    application.roleId,
  ]);
  await global.testDataSource.query(
    `DELETE FROM core."application" WHERE id = $1`,
    [application.applicationId],
  );
  await global.testDataSource.query(
    `DELETE FROM core."applicationRegistration" WHERE id = $1`,
    [application.registrationId],
  );
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

describe('core workflow API with application credentials (integration)', () => {
  let authorizedApplication: InstalledTestApplication;
  let deniedApplication: InstalledTestApplication;
  let otherWorkspaceApplication: InstalledTestApplication;

  const coreWorkflowIdsToDelete: string[] = [];

  beforeAll(async () => {
    authorizedApplication = await installApplication({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      name: `Authorized workflow app ${crypto.randomUUID()}`,
      canUpdateAllSettings: true,
    });

    deniedApplication = await installApplication({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      name: `Denied workflow app ${crypto.randomUUID()}`,
      canUpdateAllSettings: false,
    });

    otherWorkspaceApplication = await installApplication({
      workspaceId: SEED_YCOMBINATOR_WORKSPACE_ID,
      name: `Cross workspace app ${crypto.randomUUID()}`,
      canUpdateAllSettings: true,
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

    await cleanupApplication(authorizedApplication);
    await cleanupApplication(deniedApplication);
    await cleanupApplication(otherWorkspaceApplication);
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

    const rows = await global.testDataSource.query(
      `SELECT "createdBySource", "createdByWorkspaceMemberId"
       FROM "workspace_1wgvd1injqtife6y4rvfbu3h5"."workflow" WHERE id = $1`,
      [workspaceWorkflowId],
    );

    expect(rows[0].createdBySource).toBe('APPLICATION');
    expect(rows[0].createdByWorkspaceMemberId).toBeNull();
  });

  it('should deny an application whose role does not grant the workflows permission', async () => {
    const response = await graphqlAs(
      deniedApplication.accessToken,
      CREATE_CORE_WORKFLOW,
      { input: { name: `Denied workflow ${crypto.randomUUID()}` } },
    );

    expect(response.body.errors).toBeDefined();
    expect(response.body.data?.createCoreWorkflow).toBeFalsy();
  });

  it('should not expose a workflow of another workspace to an application installed elsewhere', async () => {
    const createResponse = await graphqlAs(
      authorizedApplication.accessToken,
      CREATE_CORE_WORKFLOW,
      { input: { name: `Isolated workflow ${crypto.randomUUID()}` } },
    );

    expect(createResponse.body.errors).toBeUndefined();

    const coreWorkflowId = createResponse.body.data.createCoreWorkflow.id;

    coreWorkflowIdsToDelete.push(coreWorkflowId);

    const crossWorkspaceResponse = await graphqlAs(
      otherWorkspaceApplication.accessToken,
      CORE_WORKFLOW_BY_ID,
      { coreWorkflowId },
    );

    expect(crossWorkspaceResponse.body.data?.coreWorkflowById).toBeNull();
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
});
