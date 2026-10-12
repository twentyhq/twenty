import {
  activateCoreWorkflowVersion,
  coreWorkflowGraphqlRequest,
  createCoreWorkflow,
  createCoreWorkflowVersionStep,
  deleteCoreWorkflows,
  updateCoreWorkflowVersionTrigger,
} from 'test/integration/graphql/suites/workflow/utils/core-workflow.util';
import { workflowGraphqlRequest } from 'test/integration/graphql/suites/workflow/utils/workflow-graphql-request.util';
import { isDefined } from 'twenty-shared/utils';

import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const WORKSPACE_SCHEMA = getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID);

const DISCARD_MUTATION = `
  mutation Discard($input: DiscardCoreWorkflowDraftInput!) {
    discardCoreWorkflowDraft(input: $input) {
      id
      statuses
    }
  }
`;

describe('discardCoreWorkflowDraft (e2e)', () => {
  let coreWorkflowId: string;
  let draftCoreVersionId: string;
  let draftWorkspaceVersionId: string;

  beforeAll(async () => {
    const createdCoreWorkflow = await createCoreWorkflow({
      name: 'Discard Draft Target',
    });

    coreWorkflowId = createdCoreWorkflow.coreWorkflowId;

    const initialCoreVersionId = createdCoreWorkflow.coreWorkflowVersionId;

    await updateCoreWorkflowVersionTrigger({
      coreWorkflowVersionId: initialCoreVersionId,
      trigger: {
        name: 'Manual Trigger',
        type: 'MANUAL',
        settings: { outputSchema: {} },
        nextStepIds: [],
        position: { x: 0, y: 0 },
      },
    });

    await createCoreWorkflowVersionStep({
      coreWorkflowVersionId: initialCoreVersionId,
      stepType: 'FIND_RECORDS',
    });

    await activateCoreWorkflowVersion({
      coreWorkflowVersionId: initialCoreVersionId,
    });

    const { createDraftFromCoreWorkflowVersion: draftVersion } =
      await coreWorkflowGraphqlRequest<{
        createDraftFromCoreWorkflowVersion: {
          id: string;
          workspaceWorkflowVersionId: string;
        };
      }>({
        query: `
          mutation CreateDraft(
            $input: CreateDraftFromCoreWorkflowVersionInput!
          ) {
            createDraftFromCoreWorkflowVersion(input: $input) {
              id
              workspaceWorkflowVersionId
            }
          }
        `,
        variables: {
          input: {
            coreWorkflowId,
            coreWorkflowVersionIdToCopy: initialCoreVersionId,
          },
        },
      });

    draftCoreVersionId = draftVersion.id;
    draftWorkspaceVersionId = draftVersion.workspaceWorkflowVersionId;
  });

  afterAll(async () => {
    if (isDefined(coreWorkflowId)) {
      await deleteCoreWorkflows({ coreWorkflowIds: [coreWorkflowId] });
    }
  });

  it('soft-deletes the workspace draft, removes its core row and returns the refreshed workflow', async () => {
    const discardResponse = await workflowGraphqlRequest(DISCARD_MUTATION, {
      input: { coreWorkflowVersionId: draftCoreVersionId },
    });

    expect(discardResponse.body.errors).toBeUndefined();

    const refreshedWorkflow =
      discardResponse.body.data.discardCoreWorkflowDraft;

    expect(refreshedWorkflow.id).toBe(coreWorkflowId);
    expect(refreshedWorkflow.statuses).not.toContain('DRAFT');

    const workspaceRows = await global.testDataSource.query(
      `SELECT "deletedAt" FROM "${WORKSPACE_SCHEMA}"."workflowVersion" WHERE id = $1`,
      [draftWorkspaceVersionId],
    );

    expect(workspaceRows[0]?.deletedAt).not.toBeNull();

    const coreVersionRows = await global.testDataSource.query(
      `SELECT id FROM core."workflowVersion" WHERE "workspaceId" = $1 AND id = $2`,
      [SEED_APPLE_WORKSPACE_ID, draftCoreVersionId],
    );

    expect(coreVersionRows).toHaveLength(0);
  });

  it('returns null when the draft is already discarded', async () => {
    const discardResponse = await workflowGraphqlRequest(DISCARD_MUTATION, {
      input: { coreWorkflowVersionId: draftCoreVersionId },
    });

    expect(discardResponse.body.errors).toBeUndefined();
    expect(discardResponse.body.data.discardCoreWorkflowDraft).toBeNull();
  });

  it('refuses to discard the only remaining version', async () => {
    const guardedCoreWorkflow = await createCoreWorkflow({
      name: 'Only Version Guard',
    });

    const discardResponse = await workflowGraphqlRequest(DISCARD_MUTATION, {
      input: {
        coreWorkflowVersionId: guardedCoreWorkflow.coreWorkflowVersionId,
      },
    });

    expect(discardResponse.body.errors?.[0]?.message).toContain(
      'initial version',
    );

    await deleteCoreWorkflows({
      coreWorkflowIds: [guardedCoreWorkflow.coreWorkflowId],
    });
  });
});
