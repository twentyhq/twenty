import {
  activateCoreWorkflowVersion,
  createCoreWorkflow,
  createCoreWorkflowVersionStep,
  deleteCoreWorkflows,
  updateCoreWorkflowVersionTrigger,
} from 'test/integration/graphql/suites/workflow/utils/core-workflow.util';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const STEP_FILTER_GROUP_ID = 'a1b2c3d4-1111-4a2b-8c3d-000000000001';
const STEP_FILTER_ID = 'a1b2c3d4-2222-4a2b-8c3d-000000000002';
const FILTER_VALUE = 'trigger-me-co';

describe('Database event trigger filter (e2e)', () => {
  let coreWorkflowId: string;

  beforeAll(async () => {
    const createdCoreWorkflow = await createCoreWorkflow({
      name: 'DB Event Trigger Filter Test',
    });

    coreWorkflowId = createdCoreWorkflow.coreWorkflowId;

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

  it('builds the trigger filter into the automated trigger read by the listener', async () => {
    const { workflowAutomatedTriggerMaps } =
      await global.workflowTestServices.workspaceCache.getOrRecompute(
        SEED_APPLE_WORKSPACE_ID,
        ['workflowAutomatedTriggerMaps'],
      );

    const automatedTrigger =
      workflowAutomatedTriggerMaps.byWorkflowId[coreWorkflowId];

    expect(automatedTrigger?.type).toBe('DATABASE_EVENT');
    expect(automatedTrigger?.settings).toMatchObject({
      eventName: 'company.created',
      filter: {
        stepFilterGroups: [{ id: STEP_FILTER_GROUP_ID }],
        stepFilters: [
          {
            operand: 'CONTAINS',
            value: FILTER_VALUE,
            stepOutputKey: '{{trigger.properties.after.name}}',
          },
        ],
      },
    });
  });
});
