import request from 'supertest';
import { updateWorkflowVersionTrigger } from 'test/integration/graphql/suites/workflow/utils/update-workflow-version-trigger.util';
import { findCommandMenuItems } from 'test/integration/metadata/suites/command-menu-item/utils/find-command-menu-items.util';

import { type CommandMenuItemDTO } from 'src/engine/metadata-modules/command-menu-item/dtos/command-menu-item.dto';

const client = request(`http://localhost:${APP_PORT}`);

const testWorkflowId = 'd6f9be23-c8e6-42b2-93f5-34ee0f97f1c7';

describe('workflowResolver', () => {
  beforeAll(async () => {
    const queryData = {
      query: `
        mutation CreateOneWorkflow {
          createWorkflow(
            data: {
              name: "Custom Test Workflow"
              id: "${testWorkflowId}"
            }
          ) {
            id
          }
        }
      `,
    };

    await client
      .post('/graphql')
      .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
      .send(queryData);
  });

  afterAll(async () => {
    const queryData = {
      query: `
        mutation DestroyOneWorkflow {
          destroyWorkflow(id: "${testWorkflowId}") {
            id
          }
        }
      `,
    };

    await client
      .post('/graphql')
      .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
      .send(queryData);
  });

  it('should create workflow subEntities', async () => {
    const queryData = {
      query: `
        query FindOneWorkflow {
          workflow(filter: {id: {eq: "${testWorkflowId}"}}) {
            id
            deletedAt
            versions {
              edges {
                node {
                  id
                  deletedAt
                  steps
                }
              }
            }
          }
        }
      `,
    };

    const response = await client
      .post('/graphql')
      .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
      .send(queryData);

    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();

    const workflow = response.body.data.workflow;

    expect(workflow.id).toBe(testWorkflowId);
    expect(workflow.deletedAt).toBeNull();
    expect(workflow.versions.edges.length).toBeGreaterThan(0);
    expect(workflow.versions.edges[0].node.deletedAt).toBeNull();
  });

  it('should delete workflow subEntities', async () => {
    const deleteQueryData = {
      query: `
        mutation DeleteOneWorkflow {
          deleteWorkflow(id: "${testWorkflowId}") {
            id
          }
        }
      `,
    };

    const deleteResponse = await client
      .post('/graphql')
      .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
      .send(deleteQueryData);

    expect(deleteResponse.status).toBe(200);

    const queryData = {
      query: `
        query FindWorkflow {
          workflow(filter: {
            id: { eq: "${testWorkflowId}" },
            not: { deletedAt: { is: NULL } }
          }) {
            id
            deletedAt
          }
        }
      `,
    };

    const response = await client
      .post('/graphql')
      .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
      .send(queryData);

    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();

    const workflow = response.body.data.workflow;

    expect(workflow.id).toBe(testWorkflowId);
    expect(workflow.deletedAt).not.toBeNull();

    const queryWorkflowVersionsData = {
      query: `
        query FindManyWorkflowVersions {
          workflowVersions(filter: {
            workflowId: { eq: "${testWorkflowId}" },
            not: { deletedAt: { is: NULL } }
          }) {
            edges {
              node {
                id
                deletedAt
              }
            }
          }
        }
      `,
    };

    const workflowVersionsResponse = await client
      .post('/graphql')
      .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
      .send(queryWorkflowVersionsData);

    expect(workflowVersionsResponse.status).toBe(200);
    expect(workflowVersionsResponse.body.errors).toBeUndefined();

    const workflowVersions =
      workflowVersionsResponse.body.data.workflowVersions;

    expect(workflowVersions.edges.length).toBeGreaterThan(0);
    expect(workflowVersions.edges[0].node.deletedAt).not.toBeNull();
  });

  it('should restore workflow subEntities', async () => {
    const restoreQueryData = {
      query: `
        mutation RestoreOneWorkflow {
          restoreWorkflow(id: "${testWorkflowId}") {
            id
          }
        }
      `,
    };

    const restoreResponse = await client
      .post('/graphql')
      .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
      .send(restoreQueryData);

    expect(restoreResponse.status).toBe(200);

    const queryData = {
      query: `
        query FindOneWorkflow {
          workflow(filter: {id: {eq: "${testWorkflowId}"}}) {
            id
            deletedAt
            versions {
              edges {
                node {
                  id
                  deletedAt
                  steps
                }
              }
            }
          }
        }
      `,
    };

    const response = await client
      .post('/graphql')
      .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
      .send(queryData);

    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();

    const workflow = response.body.data.workflow;

    expect(workflow.id).toBe(testWorkflowId);
    expect(workflow.deletedAt).toBeNull();
    expect(workflow.versions.edges.length).toBeGreaterThan(0);
    expect(workflow.versions.edges[0].node.deletedAt).toBeNull();
  });
});

const COMMAND_MENU_ITEM_GQL_FIELDS = `
  id
  workflowVersionId
  engineComponentKey
  label
  shortLabel
`;

const findCommandMenuItemForWorkflowVersion = async (
  workflowVersionId: string,
): Promise<CommandMenuItemDTO | undefined> => {
  const { data } = await findCommandMenuItems({
    input: undefined,
    gqlFields: COMMAND_MENU_ITEM_GQL_FIELDS,
  });

  return data?.commandMenuItems.find(
    (item) => item.workflowVersionId === workflowVersionId,
  );
};

describe('workflowResolver command menu item label', () => {
  const initialWorkflowName = 'Command Menu Label Sync Test';
  let createdWorkflowId: string | null = null;
  let createdWorkflowVersionId: string | null = null;

  const renameWorkflow = async (name: string) => {
    const response = await client
      .post('/graphql')
      .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
      .send({
        query: `
          mutation UpdateWorkflow($id: ID!, $name: String) {
            updateWorkflow(id: $id, data: { name: $name }) {
              id
              name
            }
          }
        `,
        variables: { id: createdWorkflowId, name },
      });

    expect(response.body.errors).toBeUndefined();
  };

  beforeAll(async () => {
    const createWorkflowResponse = await client
      .post('/graphql')
      .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
      .send({
        query: `
          mutation CreateWorkflow($name: String!) {
            createWorkflow(data: { name: $name }) {
              id
            }
          }
        `,
        variables: { name: initialWorkflowName },
      });

    expect(createWorkflowResponse.body.errors).toBeUndefined();
    createdWorkflowId = createWorkflowResponse.body.data.createWorkflow.id;

    const getWorkflowResponse = await client
      .post('/graphql')
      .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
      .send({
        query: `
          query GetWorkflow($id: UUID!) {
            workflow(filter: { id: { eq: $id } }) {
              id
              versions {
                edges {
                  node {
                    id
                  }
                }
              }
            }
          }
        `,
        variables: { id: createdWorkflowId },
      });

    createdWorkflowVersionId =
      getWorkflowResponse.body.data.workflow.versions.edges[0].node.id;

    await updateWorkflowVersionTrigger({
      workflowVersionId: createdWorkflowVersionId!,
      trigger: {
        name: 'Manual Trigger',
        type: 'MANUAL',
        settings: { outputSchema: {} },
        nextStepIds: [],
        position: { x: 0, y: 0 },
      },
    });

    const createStepResponse = await client
      .post('/graphql')
      .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
      .send({
        query: `
          mutation CreateWorkflowVersionStep($input: CreateWorkflowVersionStepInput!) {
            createWorkflowVersionStep(input: $input) {
              stepsDiff
            }
          }
        `,
        variables: {
          input: {
            workflowVersionId: createdWorkflowVersionId,
            stepType: 'FIND_RECORDS',
            parentStepId: 'trigger',
            position: { x: 200, y: 0 },
          },
        },
      });

    expect(createStepResponse.body.errors).toBeUndefined();

    const activateResponse = await client
      .post('/graphql')
      .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
      .send({
        query: `
          mutation ActivateWorkflowVersion($workflowVersionId: UUID!) {
            activateWorkflowVersion(workflowVersionId: $workflowVersionId)
          }
        `,
        variables: { workflowVersionId: createdWorkflowVersionId },
      });

    expect(activateResponse.body.errors).toBeUndefined();
    expect(activateResponse.body.data.activateWorkflowVersion).toBe(true);
  });

  afterAll(async () => {
    if (createdWorkflowVersionId) {
      await client
        .post('/graphql')
        .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
        .send({
          query: `
            mutation DeactivateWorkflowVersion($workflowVersionId: UUID!) {
              deactivateWorkflowVersion(workflowVersionId: $workflowVersionId)
            }
          `,
          variables: { workflowVersionId: createdWorkflowVersionId },
        });
    }

    if (createdWorkflowId) {
      await client
        .post('/graphql')
        .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
        .send({
          query: `
            mutation DestroyWorkflow($id: ID!) {
              destroyWorkflow(id: $id) {
                id
              }
            }
          `,
          variables: { id: createdWorkflowId },
        });
    }
  });

  it('labels the command menu item with the workflow name on activation', async () => {
    const commandMenuItem = await findCommandMenuItemForWorkflowVersion(
      createdWorkflowVersionId as string,
    );

    expect(commandMenuItem).toBeDefined();
    expect(commandMenuItem?.engineComponentKey).toBe(
      'TRIGGER_WORKFLOW_VERSION',
    );
    expect(commandMenuItem?.label).toBe(initialWorkflowName);
    expect(commandMenuItem?.shortLabel).toBe(initialWorkflowName);
  });

  it('updates the command menu item label when the workflow is renamed', async () => {
    const renamedWorkflowName = 'Renamed Command Menu Workflow';

    await renameWorkflow(renamedWorkflowName);

    const commandMenuItem = await findCommandMenuItemForWorkflowVersion(
      createdWorkflowVersionId as string,
    );

    expect(commandMenuItem?.label).toBe(renamedWorkflowName);
    expect(commandMenuItem?.shortLabel).toBe(renamedWorkflowName);
  });

  it('falls back to "Untitled Workflow" when the workflow name is cleared', async () => {
    await renameWorkflow('');

    const commandMenuItem = await findCommandMenuItemForWorkflowVersion(
      createdWorkflowVersionId as string,
    );

    expect(commandMenuItem?.label).toBe('Untitled Workflow');
    expect(commandMenuItem?.shortLabel).toBe('Untitled Workflow');
  });
});
