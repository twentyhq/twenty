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

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

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
        };
      }>({
        query: `
          mutation CreateDraft(
            $input: CreateDraftFromCoreWorkflowVersionInput!
          ) {
            createDraftFromCoreWorkflowVersion(input: $input) {
              id
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
  });

  afterAll(async () => {
    if (isDefined(coreWorkflowId)) {
      await deleteCoreWorkflows({ coreWorkflowIds: [coreWorkflowId] });
    }
  });

  it('removes the core draft and returns the refreshed workflow', async () => {
    const discardResponse = await workflowGraphqlRequest(DISCARD_MUTATION, {
      input: { coreWorkflowVersionId: draftCoreVersionId },
    });

    expect(discardResponse.body.errors).toBeUndefined();

    const refreshedWorkflow =
      discardResponse.body.data.discardCoreWorkflowDraft;

    expect(refreshedWorkflow.id).toBe(coreWorkflowId);
    expect(refreshedWorkflow.statuses).not.toContain('DRAFT');

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
