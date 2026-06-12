import request from 'supertest';
import { findCommandMenuItems } from 'test/integration/metadata/suites/command-menu-item/utils/find-command-menu-items.util';

import { type CommandMenuItemDTO } from 'src/engine/metadata-modules/command-menu-item/dtos/command-menu-item.dto';

const client = request(`http://localhost:${APP_PORT}`);

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
    gqlFields: COMMAND_MENU_ITEM_GQL_FIELDS,
  });

  return data?.commandMenuItems.find(
    (item) => item.workflowVersionId === workflowVersionId,
  );
};

describe('Workflow command menu item label (e2e)', () => {
  const initialWorkflowName = 'Command Menu Label Sync Test';
  let createdWorkflowId: string | null = null;
  let createdWorkflowVersionId: string | null = null;

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

    await client
      .post('/graphql')
      .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
      .send({
        query: `
          mutation UpdateWorkflowVersion($id: UUID!, $data: WorkflowVersionUpdateInput!) {
            updateWorkflowVersion(id: $id, data: $data) {
              id
            }
          }
        `,
        variables: {
          id: createdWorkflowVersionId,
          data: {
            trigger: {
              name: 'Manual Trigger',
              type: 'MANUAL',
              settings: { outputSchema: {} },
              nextStepIds: [],
              position: { x: 0, y: 0 },
            },
          },
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

  it('should label the command menu item with the workflow name on activation', async () => {
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

  it('should update the command menu item label when the workflow is renamed', async () => {
    const renamedWorkflowName = 'Renamed Command Menu Workflow';

    await renameWorkflow(renamedWorkflowName);

    const commandMenuItem = await findCommandMenuItemForWorkflowVersion(
      createdWorkflowVersionId as string,
    );

    expect(commandMenuItem?.label).toBe(renamedWorkflowName);
    expect(commandMenuItem?.shortLabel).toBe(renamedWorkflowName);
  });

  it('should fall back to "Untitled Workflow" when the workflow name is cleared', async () => {
    await renameWorkflow('');

    const commandMenuItem = await findCommandMenuItemForWorkflowVersion(
      createdWorkflowVersionId as string,
    );

    expect(commandMenuItem?.label).toBe('Untitled Workflow');
    expect(commandMenuItem?.shortLabel).toBe('Untitled Workflow');
  });
});
