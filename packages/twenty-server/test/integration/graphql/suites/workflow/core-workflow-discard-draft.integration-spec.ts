import {
  activateCoreWorkflowVersion,
  CORE_WORKFLOW_MANUAL_TRIGGER,
  createCoreWorkflow,
  createCoreWorkflowVersionStep,
  createDraftFromCoreWorkflowVersion,
  deleteCoreWorkflows,
  findCoreWorkflowVersionsByCoreWorkflowId,
  updateCoreWorkflowVersionTrigger,
} from 'test/integration/graphql/suites/workflow/utils/core-workflow-test.util';
import { workflowGraphqlRequest } from 'test/integration/graphql/suites/workflow/utils/workflow-graphql-request.util';
import { isDefined } from 'twenty-shared/utils';

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
  let initialCoreWorkflowVersionId: string;
  let draftCoreWorkflowVersionId: string;

  beforeAll(async () => {
    ({ coreWorkflowId, coreWorkflowVersionId: initialCoreWorkflowVersionId } =
      await createCoreWorkflow({ name: 'Discard Draft Target' }));

    await updateCoreWorkflowVersionTrigger({
      coreWorkflowVersionId: initialCoreWorkflowVersionId,
      trigger: CORE_WORKFLOW_MANUAL_TRIGGER,
    });

    await createCoreWorkflowVersionStep({
      coreWorkflowVersionId: initialCoreWorkflowVersionId,
      stepType: 'FIND_RECORDS',
    });

    await activateCoreWorkflowVersion(initialCoreWorkflowVersionId);

    draftCoreWorkflowVersionId = await createDraftFromCoreWorkflowVersion({
      coreWorkflowId,
      coreWorkflowVersionIdToCopy: initialCoreWorkflowVersionId,
    });
  });

  afterAll(async () => {
    if (isDefined(coreWorkflowId)) {
      await deleteCoreWorkflows([coreWorkflowId]);
    }
  });

  it('removes the draft core version and returns the refreshed workflow', async () => {
    const discardResponse = await workflowGraphqlRequest(DISCARD_MUTATION, {
      input: { coreWorkflowVersionId: draftCoreWorkflowVersionId },
    });

    expect(discardResponse.body.errors).toBeUndefined();

    const refreshedWorkflow =
      discardResponse.body.data.discardCoreWorkflowDraft;

    expect(refreshedWorkflow.id).toBe(coreWorkflowId);
    expect(refreshedWorkflow.statuses).not.toContain('DRAFT');

    const remainingVersions =
      await findCoreWorkflowVersionsByCoreWorkflowId(coreWorkflowId);

    expect(remainingVersions.map(({ id }) => id)).toEqual([
      initialCoreWorkflowVersionId,
    ]);
  });

  it('returns null when the draft is already discarded', async () => {
    const discardResponse = await workflowGraphqlRequest(DISCARD_MUTATION, {
      input: { coreWorkflowVersionId: draftCoreWorkflowVersionId },
    });

    expect(discardResponse.body.errors).toBeUndefined();
    expect(discardResponse.body.data.discardCoreWorkflowDraft).toBeNull();
  });

  it('refuses to discard the only remaining version', async () => {
    const {
      coreWorkflowId: guardedCoreWorkflowId,
      coreWorkflowVersionId: onlyCoreWorkflowVersionId,
    } = await createCoreWorkflow({ name: 'Only Version Guard' });

    const discardResponse = await workflowGraphqlRequest(DISCARD_MUTATION, {
      input: { coreWorkflowVersionId: onlyCoreWorkflowVersionId },
    });

    expect(discardResponse.body.errors?.[0]?.message).toContain(
      'initial version',
    );

    await deleteCoreWorkflows([guardedCoreWorkflowId]);
  });
});
