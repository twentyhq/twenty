import request from 'supertest';
import {
  createCoreWorkflow,
  createCoreWorkflowVersionStep,
  deleteCoreWorkflows,
  findCoreWorkflowVersion,
  findCoreWorkflowVersions,
  updateCoreWorkflowVersionTrigger,
} from 'test/integration/graphql/suites/workflow/utils/core-workflow.util';
import { isDefined } from 'twenty-shared/utils';

import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const client = request(`http://localhost:${APP_PORT}`);

const WORKSPACE_SCHEMA = getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID);

const graphql = (query: string, variables?: object) =>
  client
    .post('/graphql')
    .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
    .send({ query, variables });

describe('duplicateCoreWorkflow (e2e)', () => {
  let sourceCoreWorkflowId: string;
  let sourceCoreVersionId: string;
  let duplicatedCoreWorkflowId: string | undefined;

  beforeAll(async () => {
    const createdCoreWorkflow = await createCoreWorkflow({
      name: 'Duplicate Source',
    });

    sourceCoreWorkflowId = createdCoreWorkflow.coreWorkflowId;
    sourceCoreVersionId = createdCoreWorkflow.coreWorkflowVersionId;

    await updateCoreWorkflowVersionTrigger({
      coreWorkflowVersionId: sourceCoreVersionId,
      trigger: {
        name: 'Manual Trigger',
        type: 'MANUAL',
        settings: { outputSchema: {} },
        nextStepIds: [],
        position: { x: 0, y: 0 },
      },
    });

    await createCoreWorkflowVersionStep({
      coreWorkflowVersionId: sourceCoreVersionId,
      stepType: 'FIND_RECORDS',
    });
  });

  afterAll(async () => {
    const coreWorkflowIds = [
      duplicatedCoreWorkflowId,
      sourceCoreWorkflowId,
    ].filter(isDefined);

    if (coreWorkflowIds.length > 0) {
      await deleteCoreWorkflows({ coreWorkflowIds });
    }
  });

  it('duplicates the workflow and mirrors the new draft version to the workspace', async () => {
    const response = await graphql(
      `
        mutation DuplicateCoreWorkflow($input: DuplicateCoreWorkflowInput!) {
          duplicateCoreWorkflow(input: $input) {
            id
            workspaceWorkflowId
          }
        }
      `,
      {
        input: {
          coreWorkflowIdToDuplicate: sourceCoreWorkflowId,
          coreWorkflowVersionIdToCopy: sourceCoreVersionId,
        },
      },
    );

    expect(response.body.errors).toBeUndefined();

    const duplicated = response.body.data.duplicateCoreWorkflow;

    duplicatedCoreWorkflowId = duplicated?.id;

    expect(duplicated.id).not.toBe(sourceCoreWorkflowId);

    const duplicatedVersions = await findCoreWorkflowVersions({
      coreWorkflowId: duplicated.id,
    });

    expect(duplicatedVersions).toHaveLength(1);

    const duplicatedVersion = await findCoreWorkflowVersion({
      coreWorkflowVersionId: duplicatedVersions[0].id,
    });

    expect(duplicatedVersion.id).not.toBe(sourceCoreVersionId);
    expect(duplicatedVersion.status).toBe('DRAFT');
    expect(duplicatedVersion.trigger?.type).toBe('MANUAL');
    expect(Array.isArray(duplicatedVersion.steps)).toBe(true);
    expect(duplicatedVersion.steps?.length).toBeGreaterThan(0);

    const mirrorRows = await global.testDataSource.query(
      `SELECT "id", "steps", "trigger", "status" FROM "${WORKSPACE_SCHEMA}"."workflowVersion"
       WHERE "workflowId" = $1 AND "deletedAt" IS NULL`,
      [duplicated.workspaceWorkflowId],
    );

    expect(mirrorRows).toHaveLength(1);
    expect(mirrorRows[0].id).toBe(duplicatedVersion.workspaceWorkflowVersionId);
    expect(mirrorRows[0].status).toBe('DRAFT');
    expect(Array.isArray(mirrorRows[0].steps)).toBe(true);
    expect(mirrorRows[0].steps.length).toBe(duplicatedVersion.steps?.length);
    expect(mirrorRows[0].trigger.type).toBe('MANUAL');
  });
});
