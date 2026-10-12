import request from 'supertest';
import {
  activateCoreWorkflowVersion,
  createCoreWorkflow,
  createCoreWorkflowVersionStep,
  deleteCoreWorkflows,
  updateCoreWorkflowVersionTrigger,
} from 'test/integration/graphql/suites/workflow/utils/core-workflow.util';

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
  let coreWorkflowId: string | null = null;
  let workspaceWorkflowId: string | null = null;

  beforeAll(async () => {
    const createdCoreWorkflow = await createCoreWorkflow({
      name: 'DB Event Trigger Filter Test',
    });

    coreWorkflowId = createdCoreWorkflow.coreWorkflowId;
    workspaceWorkflowId = createdCoreWorkflow.workspaceWorkflowId;

    const coreWorkflowVersionId = createdCoreWorkflow.coreWorkflowVersionId;

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

    await updateCoreWorkflowVersionTrigger({
      coreWorkflowVersionId,
      trigger: databaseEventTrigger,
    });

    await createCoreWorkflowVersionStep({
      coreWorkflowVersionId,
      stepType: 'CODE',
    });

    await activateCoreWorkflowVersion({ coreWorkflowVersionId });
  });

  afterAll(async () => {
    if (coreWorkflowId) {
      await deleteCoreWorkflows({ coreWorkflowIds: [coreWorkflowId] });
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
      { workflowId: workspaceWorkflowId },
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
