import {
  activateCoreWorkflowVersion,
  coreWorkflowGraphqlRequest,
  createCoreWorkflow,
  createCoreWorkflowVersionStep,
  deleteCoreWorkflows,
  updateCoreWorkflowVersionTrigger,
} from 'test/integration/graphql/suites/workflow/utils/core-workflow.util';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

describe('discard draft workflow version core mirror (e2e)', () => {
  let coreWorkflowId: string;
  let draftVersionId: string;

  const coreVersions = async (): Promise<{ id: string; status: string }[]> => {
    return global.testDataSource.query(
      `SELECT "id", "status" FROM core."workflowVersion"
       WHERE "workspaceId" = $1 AND "coreWorkflowId" = $2`,
      [SEED_APPLE_WORKSPACE_ID, coreWorkflowId],
    );
  };

  beforeAll(async () => {
    const createdCoreWorkflow = await createCoreWorkflow({
      name: 'Discard Draft Mirror',
    });

    coreWorkflowId = createdCoreWorkflow.coreWorkflowId;

    const firstVersionId = createdCoreWorkflow.coreWorkflowVersionId;

    await updateCoreWorkflowVersionTrigger({
      coreWorkflowVersionId: firstVersionId,
      trigger: {
        name: 'Manual Trigger',
        type: 'MANUAL',
        settings: { outputSchema: {} },
        nextStepIds: [],
        position: { x: 0, y: 0 },
      },
    });

    await createCoreWorkflowVersionStep({
      coreWorkflowVersionId: firstVersionId,
      stepType: 'FIND_RECORDS',
    });

    await activateCoreWorkflowVersion({
      coreWorkflowVersionId: firstVersionId,
    });

    const { createDraftFromCoreWorkflowVersion: draftVersion } =
      await coreWorkflowGraphqlRequest<{
        createDraftFromCoreWorkflowVersion: { id: string };
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
            coreWorkflowVersionIdToCopy: firstVersionId,
          },
        },
      });

    draftVersionId = draftVersion.id;
  });

  afterAll(async () => {
    if (coreWorkflowId) {
      await deleteCoreWorkflows({ coreWorkflowIds: [coreWorkflowId] });
    }
  });

  it('removes only the discarded draft core row, keeping the active version', async () => {
    const versionsBefore = await coreVersions();

    expect(versionsBefore.map((version) => version.status).sort()).toEqual([
      'ACTIVE',
      'DRAFT',
    ]);

    const activeCoreId = versionsBefore.find(
      (version) => version.status === 'ACTIVE',
    )?.id;
    const draftCoreId = versionsBefore.find(
      (version) => version.status === 'DRAFT',
    )?.id;

    expect(activeCoreId).toBeDefined();
    expect(draftCoreId).toBe(draftVersionId);

    await coreWorkflowGraphqlRequest({
      query: `
        mutation Discard($input: DiscardCoreWorkflowDraftInput!) {
          discardCoreWorkflowDraft(input: $input) {
            id
          }
        }
      `,
      variables: { input: { coreWorkflowVersionId: draftVersionId } },
    });

    const versionsAfter = await coreVersions();

    // only the discarded draft's core row is removed; the active row remains
    expect(versionsAfter).toHaveLength(1);
    expect(versionsAfter[0].id).toBe(activeCoreId);
    expect(versionsAfter[0].id).not.toBe(draftCoreId);
  });
});
