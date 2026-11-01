import {
  activateCoreWorkflowVersion,
  createCoreWorkflow,
  createCoreWorkflowVersionStep,
  deleteCoreWorkflows,
  updateCoreWorkflowVersionTrigger,
} from 'test/integration/graphql/suites/workflow/utils/core-workflow.util';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

describe('workflow lifecycle core mirror with an active version (e2e)', () => {
  let coreWorkflowId: string;

  beforeAll(async () => {
    const createdCoreWorkflow = await createCoreWorkflow({
      name: 'Lifecycle Mirror',
    });

    coreWorkflowId = createdCoreWorkflow.coreWorkflowId;

    const coreWorkflowVersionId = createdCoreWorkflow.coreWorkflowVersionId;

    await updateCoreWorkflowVersionTrigger({
      coreWorkflowVersionId,
      trigger: {
        name: 'Manual Trigger',
        type: 'MANUAL',
        settings: { outputSchema: {} },
        nextStepIds: [],
        position: { x: 0, y: 0 },
      },
    });

    await createCoreWorkflowVersionStep({
      coreWorkflowVersionId,
      stepType: 'FIND_RECORDS',
    });

    await activateCoreWorkflowVersion({ coreWorkflowVersionId });
  });

  afterAll(async () => {
    if (coreWorkflowId) {
      await deleteCoreWorkflows({ coreWorkflowIds: [coreWorkflowId] });
    }
  });

  it('points the core workflow at the core id of the published version', async () => {
    const rows = await global.testDataSource.query(
      `SELECT cw."lastPublishedCoreWorkflowVersionId" AS "coreVersionId",
              published.id IS NOT NULL AS "resolves"
       FROM core."workflow" cw
       LEFT JOIN core."workflowVersion" published
         ON published.id = cw."lastPublishedCoreWorkflowVersionId"
       WHERE cw."workspaceId" = $1
         AND cw.id = $2`,
      [SEED_APPLE_WORKSPACE_ID, coreWorkflowId],
    );

    expect(typeof rows[0]?.coreVersionId).toBe('string');
    expect(rows[0]?.resolves).toBe(true);
  });
});
