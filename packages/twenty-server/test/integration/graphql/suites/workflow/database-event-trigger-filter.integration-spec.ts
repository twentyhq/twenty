import request from 'supertest';

const client = request(`http://localhost:${APP_PORT}`);

const STEP_FILTER_GROUP_ID = 'a1b2c3d4-1111-4a2b-8c3d-000000000001';
const STEP_FILTER_ID = 'a1b2c3d4-2222-4a2b-8c3d-000000000002';
const FILTER_VALUE = 'trigger-me-co';

type AutomatedTriggerNode = {
  type: string;
  workflowId: string;
  settings: {
    eventName?: string;
    filter?: {
      stepFilters: Array<Record<string, unknown>>;
      stepFilterGroups: Array<Record<string, unknown>>;
    };
  };
};

const graphql = (query: string, variables?: object) =>
  client
    .post('/graphql')
    .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
    .send({ query, variables });

describe('Database event trigger filter (e2e)', () => {
  let createdWorkflowId: string | null = null;
  let createdWorkflowVersionId: string | null = null;

  beforeAll(async () => {
    const createWorkflowResponse = await graphql(`
      mutation CreateWorkflow {
        createWorkflow(data: { name: "DB Event Trigger Filter Test" }) {
          id
        }
      }
    `);

    expect(createWorkflowResponse.body.errors).toBeUndefined();
    createdWorkflowId = createWorkflowResponse.body.data.createWorkflow.id;

    const getWorkflowResponse = await graphql(
      `
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
      { id: createdWorkflowId },
    );

    expect(getWorkflowResponse.body.errors).toBeUndefined();
    createdWorkflowVersionId =
      getWorkflowResponse.body.data.workflow.versions.edges[0].node.id;

    const databaseEventTrigger = {
      name: 'Company is created',
      type: 'DATABASE_EVENT',
      settings: {
        eventName: 'company.created',
        outputSchema: {},
        filter: {
          stepFilterGroups: [
            { id: STEP_FILTER_GROUP_ID, logicalOperator: 'AND' },
          ],
          stepFilters: [
            {
              id: STEP_FILTER_ID,
              type: 'TEXT',
              operand: 'CONTAINS',
              value: FILTER_VALUE,
              stepOutputKey: '{{trigger.properties.after.name}}',
              stepFilterGroupId: STEP_FILTER_GROUP_ID,
            },
          ],
        },
      },
      nextStepIds: [],
      position: { x: 0, y: 0 },
    };

    const updateTriggerResponse = await graphql(
      `
        mutation UpdateWorkflowVersionTrigger(
          $input: UpdateWorkflowVersionTriggerInput!
        ) {
          updateWorkflowVersionTrigger(input: $input) {
            trigger
          }
        }
      `,
      {
        input: {
          workflowVersionId: createdWorkflowVersionId,
          trigger: databaseEventTrigger,
        },
      },
    );

    expect(updateTriggerResponse.body.errors).toBeUndefined();

    const createStepResponse = await graphql(
      `
        mutation CreateWorkflowVersionStep(
          $input: CreateWorkflowVersionStepInput!
        ) {
          createWorkflowVersionStep(input: $input) {
            stepsDiff
          }
        }
      `,
      {
        input: {
          workflowVersionId: createdWorkflowVersionId,
          stepType: 'CODE',
          parentStepId: 'trigger',
          position: { x: 200, y: 0 },
        },
      },
    );

    expect(createStepResponse.body.errors).toBeUndefined();

    const activateResponse = await graphql(
      `
        mutation ActivateWorkflowVersion($workflowVersionId: UUID!) {
          activateWorkflowVersion(workflowVersionId: $workflowVersionId)
        }
      `,
      { workflowVersionId: createdWorkflowVersionId },
    );

    expect(activateResponse.body.errors).toBeUndefined();
    expect(activateResponse.body.data.activateWorkflowVersion).toBe(true);
  });

  afterAll(async () => {
    if (createdWorkflowId) {
      await graphql(
        `
          mutation DestroyWorkflow($id: ID!) {
            destroyWorkflow(id: $id) {
              id
            }
          }
        `,
        { id: createdWorkflowId },
      );
    }
  });

  it('syncs the trigger filter onto the workflowAutomatedTrigger row read by the listener', async () => {
    const response = await graphql(
      `
        query WorkflowAutomatedTriggers($workflowId: UUID!) {
          workflowAutomatedTriggers(
            filter: { workflowId: { eq: $workflowId } }
          ) {
            edges {
              node {
                type
                settings
                workflowId
              }
            }
          }
        }
      `,
      { workflowId: createdWorkflowId },
    );

    expect(response.body.errors).toBeUndefined();

    const automatedTriggers: AutomatedTriggerNode[] =
      response.body.data.workflowAutomatedTriggers.edges.map(
        (edge: { node: AutomatedTriggerNode }) => edge.node,
      );

    expect(automatedTriggers).toHaveLength(1);

    const automatedTrigger = automatedTriggers[0];

    expect(automatedTrigger.type).toBe('DATABASE_EVENT');
    expect(automatedTrigger.settings.eventName).toBe('company.created');

    const filter = automatedTrigger.settings.filter;

    expect(filter).toBeDefined();
    expect(filter?.stepFilterGroups).toHaveLength(1);
    expect(filter?.stepFilters).toHaveLength(1);
    expect(filter?.stepFilters[0]).toMatchObject({
      operand: 'CONTAINS',
      value: FILTER_VALUE,
      stepOutputKey: '{{trigger.properties.after.name}}',
    });
  });
});
