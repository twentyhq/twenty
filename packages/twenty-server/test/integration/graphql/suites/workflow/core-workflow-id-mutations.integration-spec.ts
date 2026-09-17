import { workflowGraphqlRequest } from 'test/integration/graphql/suites/workflow/utils/workflow-graphql-request.util';
import {
  destroyWorkflowRun,
  waitForWorkflowCompletion,
} from 'test/integration/graphql/suites/workflow/utils/workflow-run-test.util';

const CORE_WORKFLOW_VERSIONS = `
  query CoreWorkflowVersionsByCoreWorkflowId($coreWorkflowId: UUID!) {
    coreWorkflowVersionsByCoreWorkflowId(coreWorkflowId: $coreWorkflowId) {
      id
      status
    }
  }
`;

const CORE_WORKFLOW_VERSION_BY_ID = `
  query CoreWorkflowVersionById($coreWorkflowVersionId: UUID!) {
    coreWorkflowVersionById(coreWorkflowVersionId: $coreWorkflowVersionId) {
      id
      status
      trigger
      steps
    }
  }
`;

const MANUAL_TRIGGER = {
  name: 'Manual Trigger',
  type: 'MANUAL',
  settings: { outputSchema: {} },
  nextStepIds: [],
  position: { x: 0, y: 0 },
};

describe('core workflow id mutations (e2e)', () => {
  let coreWorkflowId: string;
  let coreWorkflowVersionId: string;
  const workflowRunIds: string[] = [];
  const coreWorkflowIdsToDelete: string[] = [];

  const getVersions = async (workflowId: string) => {
    const response = await workflowGraphqlRequest(CORE_WORKFLOW_VERSIONS, {
      coreWorkflowId: workflowId,
    });

    expect(response.body.errors).toBeUndefined();

    return response.body.data.coreWorkflowVersionsByCoreWorkflowId;
  };

  const getVersionById = async (id: string) => {
    const response = await workflowGraphqlRequest(CORE_WORKFLOW_VERSION_BY_ID, {
      coreWorkflowVersionId: id,
    });

    expect(response.body.errors).toBeUndefined();

    return response.body.data.coreWorkflowVersionById;
  };

  beforeAll(async () => {
    const createResponse = await workflowGraphqlRequest(`
      mutation {
        createCoreWorkflow(input: { name: "Core Id Mutations" }) {
          id
        }
      }
    `);

    expect(createResponse.body.errors).toBeUndefined();

    coreWorkflowId = createResponse.body.data.createCoreWorkflow.id;
    coreWorkflowIdsToDelete.push(coreWorkflowId);

    const versions = await getVersions(coreWorkflowId);

    expect(versions).toHaveLength(1);

    coreWorkflowVersionId = versions[0].id;
  });

  afterAll(async () => {
    for (const workflowRunId of workflowRunIds) {
      await destroyWorkflowRun(workflowRunId);
    }

    await workflowGraphqlRequest(
      `
        mutation DeleteCoreWorkflows($input: DeleteCoreWorkflowsInput!) {
          deleteCoreWorkflows(input: $input) {
            id
          }
        }
      `,
      { input: { coreWorkflowIds: coreWorkflowIdsToDelete } },
    );
  });

  it('renames the workflow by core id', async () => {
    const response = await workflowGraphqlRequest(
      `
        mutation UpdateCoreWorkflow($input: UpdateCoreWorkflowInput!) {
          updateCoreWorkflow(input: $input) {
            id
            name
          }
        }
      `,
      { input: { coreWorkflowId, name: 'Core Id Mutations Renamed' } },
    );

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.updateCoreWorkflow.name).toBe(
      'Core Id Mutations Renamed',
    );
  });

  it('builds the draft through core-id builder mutations', async () => {
    const triggerResponse = await workflowGraphqlRequest(
      `
        mutation UpdateCoreWorkflowVersionTrigger(
          $input: UpdateCoreWorkflowVersionTriggerInput!
        ) {
          updateCoreWorkflowVersionTrigger(input: $input) {
            trigger
          }
        }
      `,
      { input: { coreWorkflowVersionId, trigger: MANUAL_TRIGGER } },
    );

    expect(triggerResponse.body.errors).toBeUndefined();

    const createStepResponse = await workflowGraphqlRequest(
      `
        mutation CreateCoreWorkflowVersionStep(
          $input: CreateCoreWorkflowVersionStepInput!
        ) {
          createCoreWorkflowVersionStep(input: $input) {
            stepsDiff
          }
        }
      `,
      {
        input: {
          coreWorkflowVersionId,
          stepType: 'CODE',
          parentStepId: 'trigger',
          position: { x: 200, y: 0 },
        },
      },
    );

    expect(createStepResponse.body.errors).toBeUndefined();

    const versionAfterStepCreation = await getVersionById(
      coreWorkflowVersionId,
    );

    expect(versionAfterStepCreation.steps).toHaveLength(1);

    const stepId = versionAfterStepCreation.steps[0].id;

    const positionsResponse = await workflowGraphqlRequest(
      `
        mutation UpdateCoreWorkflowVersionPositions(
          $input: UpdateCoreWorkflowVersionPositionsInput!
        ) {
          updateCoreWorkflowVersionPositions(input: $input)
        }
      `,
      {
        input: {
          coreWorkflowVersionId,
          positions: [{ id: stepId, position: { x: 250, y: 50 } }],
        },
      },
    );

    expect(positionsResponse.body.errors).toBeUndefined();

    const deleteEdgeResponse = await workflowGraphqlRequest(
      `
        mutation DeleteCoreWorkflowVersionEdge(
          $input: DeleteCoreWorkflowVersionEdgeInput!
        ) {
          deleteCoreWorkflowVersionEdge(input: $input) {
            triggerDiff
          }
        }
      `,
      { input: { coreWorkflowVersionId, source: 'trigger', target: stepId } },
    );

    expect(deleteEdgeResponse.body.errors).toBeUndefined();

    const createEdgeResponse = await workflowGraphqlRequest(
      `
        mutation CreateCoreWorkflowVersionEdge(
          $input: CreateCoreWorkflowVersionEdgeInput!
        ) {
          createCoreWorkflowVersionEdge(input: $input) {
            triggerDiff
          }
        }
      `,
      { input: { coreWorkflowVersionId, source: 'trigger', target: stepId } },
    );

    expect(createEdgeResponse.body.errors).toBeUndefined();

    const version = await getVersionById(coreWorkflowVersionId);

    expect(version.trigger.type).toBe('MANUAL');
    expect(version.trigger.nextStepIds).toEqual([stepId]);
    expect(version.steps).toHaveLength(1);
  });

  it('activates, runs and deactivates by core ids', async () => {
    const validateResponse = await workflowGraphqlRequest(
      `
        mutation ValidateCoreWorkflowVersion($coreWorkflowVersionId: UUID!) {
          validateCoreWorkflowVersion(
            coreWorkflowVersionId: $coreWorkflowVersionId
          )
        }
      `,
      { coreWorkflowVersionId },
    );

    expect(validateResponse.body.errors).toBeUndefined();
    expect(validateResponse.body.data.validateCoreWorkflowVersion).toBe(true);

    const activateResponse = await workflowGraphqlRequest(
      `
        mutation ActivateCoreWorkflowVersion($coreWorkflowVersionId: UUID!) {
          activateCoreWorkflowVersion(
            coreWorkflowVersionId: $coreWorkflowVersionId
          )
        }
      `,
      { coreWorkflowVersionId },
    );

    expect(activateResponse.body.errors).toBeUndefined();
    expect(activateResponse.body.data.activateCoreWorkflowVersion).toBe(true);

    const activatedVersion = await getVersionById(coreWorkflowVersionId);

    expect(activatedVersion.status).toBe('ACTIVE');

    const runResponse = await workflowGraphqlRequest(
      `
        mutation RunCoreWorkflowVersion($input: RunCoreWorkflowVersionInput!) {
          runCoreWorkflowVersion(input: $input) {
            workflowRunId
          }
        }
      `,
      { input: { coreWorkflowVersionId } },
    );

    expect(runResponse.body.errors).toBeUndefined();

    const workflowRunId =
      runResponse.body.data.runCoreWorkflowVersion.workflowRunId;

    workflowRunIds.push(workflowRunId);

    const completedRun = await waitForWorkflowCompletion(workflowRunId);

    expect(completedRun?.status).toBe('COMPLETED');

    const deactivateResponse = await workflowGraphqlRequest(
      `
        mutation DeactivateCoreWorkflowVersion($coreWorkflowVersionId: UUID!) {
          deactivateCoreWorkflowVersion(
            coreWorkflowVersionId: $coreWorkflowVersionId
          )
        }
      `,
      { coreWorkflowVersionId },
    );

    expect(deactivateResponse.body.errors).toBeUndefined();

    const deactivatedVersion = await getVersionById(coreWorkflowVersionId);

    expect(deactivatedVersion.status).toBe('DEACTIVATED');
  });

  it('archives the previously published version when publishing after a deactivation', async () => {
    const createResponse = await workflowGraphqlRequest(`
      mutation {
        createCoreWorkflow(input: { name: "Core Republish After Deactivation" }) {
          id
        }
      }
    `);

    expect(createResponse.body.errors).toBeUndefined();

    const republishedCoreWorkflowId =
      createResponse.body.data.createCoreWorkflow.id;

    coreWorkflowIdsToDelete.push(republishedCoreWorkflowId);

    const [firstVersion] = await getVersions(republishedCoreWorkflowId);

    const triggerResponse = await workflowGraphqlRequest(
      `
        mutation UpdateCoreWorkflowVersionTrigger(
          $input: UpdateCoreWorkflowVersionTriggerInput!
        ) {
          updateCoreWorkflowVersionTrigger(input: $input) {
            trigger
          }
        }
      `,
      {
        input: {
          coreWorkflowVersionId: firstVersion.id,
          trigger: MANUAL_TRIGGER,
        },
      },
    );

    expect(triggerResponse.body.errors).toBeUndefined();

    const createStepResponse = await workflowGraphqlRequest(
      `
        mutation CreateCoreWorkflowVersionStep(
          $input: CreateCoreWorkflowVersionStepInput!
        ) {
          createCoreWorkflowVersionStep(input: $input) {
            stepsDiff
          }
        }
      `,
      {
        input: {
          coreWorkflowVersionId: firstVersion.id,
          stepType: 'CODE',
          parentStepId: 'trigger',
          position: { x: 200, y: 0 },
        },
      },
    );

    expect(createStepResponse.body.errors).toBeUndefined();

    const activateMutation = `
      mutation ActivateCoreWorkflowVersion($coreWorkflowVersionId: UUID!) {
        activateCoreWorkflowVersion(coreWorkflowVersionId: $coreWorkflowVersionId)
      }
    `;

    const firstActivationResponse = await workflowGraphqlRequest(
      activateMutation,
      { coreWorkflowVersionId: firstVersion.id },
    );

    expect(firstActivationResponse.body.errors).toBeUndefined();

    const deactivationResponse = await workflowGraphqlRequest(
      `
        mutation DeactivateCoreWorkflowVersion($coreWorkflowVersionId: UUID!) {
          deactivateCoreWorkflowVersion(
            coreWorkflowVersionId: $coreWorkflowVersionId
          )
        }
      `,
      { coreWorkflowVersionId: firstVersion.id },
    );

    expect(deactivationResponse.body.errors).toBeUndefined();

    const draftResponse = await workflowGraphqlRequest(
      `
        mutation CreateDraftFromCoreWorkflowVersion(
          $input: CreateDraftFromCoreWorkflowVersionInput!
        ) {
          createDraftFromCoreWorkflowVersion(input: $input) {
            id
          }
        }
      `,
      {
        input: {
          coreWorkflowId: republishedCoreWorkflowId,
          coreWorkflowVersionIdToCopy: firstVersion.id,
        },
      },
    );

    expect(draftResponse.body.errors).toBeUndefined();

    const secondVersionId =
      draftResponse.body.data.createDraftFromCoreWorkflowVersion.id;

    const secondActivationResponse = await workflowGraphqlRequest(
      activateMutation,
      { coreWorkflowVersionId: secondVersionId },
    );

    expect(secondActivationResponse.body.errors).toBeUndefined();

    const firstVersionAfterRepublish = await getVersionById(firstVersion.id);
    const secondVersionAfterRepublish = await getVersionById(secondVersionId);

    expect(firstVersionAfterRepublish.status).toBe('ARCHIVED');
    expect(secondVersionAfterRepublish.status).toBe('ACTIVE');

    await workflowGraphqlRequest(
      `
        mutation DeactivateCoreWorkflowVersion($coreWorkflowVersionId: UUID!) {
          deactivateCoreWorkflowVersion(
            coreWorkflowVersionId: $coreWorkflowVersionId
          )
        }
      `,
      { coreWorkflowVersionId: secondVersionId },
    );
  });

  it('creates a draft from a core version, edits it and discards it by core id', async () => {
    const draftResponse = await workflowGraphqlRequest(
      `
        mutation CreateDraftFromCoreWorkflowVersion(
          $input: CreateDraftFromCoreWorkflowVersionInput!
        ) {
          createDraftFromCoreWorkflowVersion(input: $input) {
            id
            status
          }
        }
      `,
      {
        input: {
          coreWorkflowId,
          coreWorkflowVersionIdToCopy: coreWorkflowVersionId,
        },
      },
    );

    expect(draftResponse.body.errors).toBeUndefined();

    const draft = draftResponse.body.data.createDraftFromCoreWorkflowVersion;

    expect(draft.status).toBe('DRAFT');
    expect(draft.id).not.toBe(coreWorkflowVersionId);

    const draftContent = await getVersionById(draft.id);
    const copiedStepId = draftContent.steps[0].id;

    const duplicateStepResponse = await workflowGraphqlRequest(
      `
        mutation DuplicateCoreWorkflowVersionStep(
          $input: DuplicateCoreWorkflowVersionStepInput!
        ) {
          duplicateCoreWorkflowVersionStep(input: $input) {
            stepsDiff
          }
        }
      `,
      { input: { coreWorkflowVersionId: draft.id, stepId: copiedStepId } },
    );

    expect(duplicateStepResponse.body.errors).toBeUndefined();

    const draftAfterDuplication = await getVersionById(draft.id);

    expect(draftAfterDuplication.steps).toHaveLength(2);

    const duplicatedStepId = draftAfterDuplication.steps.find(
      (step: { id: string }) => step.id !== copiedStepId,
    ).id;

    const deleteStepResponse = await workflowGraphqlRequest(
      `
        mutation DeleteCoreWorkflowVersionStep(
          $input: DeleteCoreWorkflowVersionStepInput!
        ) {
          deleteCoreWorkflowVersionStep(input: $input) {
            stepsDiff
          }
        }
      `,
      { input: { coreWorkflowVersionId: draft.id, stepId: duplicatedStepId } },
    );

    expect(deleteStepResponse.body.errors).toBeUndefined();

    const discardResponse = await workflowGraphqlRequest(
      `
        mutation DiscardCoreWorkflowDraft($input: DiscardCoreWorkflowDraftInput!) {
          discardCoreWorkflowDraft(input: $input) {
            id
          }
        }
      `,
      { input: { coreWorkflowVersionId: draft.id } },
    );

    expect(discardResponse.body.errors).toBeUndefined();
    expect(discardResponse.body.data.discardCoreWorkflowDraft.id).toBe(
      coreWorkflowId,
    );

    expect(await getVersionById(draft.id)).toBeNull();
  });

  it('duplicates the workflow by core ids', async () => {
    const response = await workflowGraphqlRequest(
      `
        mutation DuplicateCoreWorkflow($input: DuplicateCoreWorkflowInput!) {
          duplicateCoreWorkflow(input: $input) {
            id
            name
          }
        }
      `,
      {
        input: {
          coreWorkflowIdToDuplicate: coreWorkflowId,
          coreWorkflowVersionIdToCopy: coreWorkflowVersionId,
        },
      },
    );

    expect(response.body.errors).toBeUndefined();

    const duplicated = response.body.data.duplicateCoreWorkflow;

    expect(duplicated.id).not.toBe(coreWorkflowId);

    coreWorkflowIdsToDelete.push(duplicated.id);

    const duplicatedVersions = await getVersions(duplicated.id);

    expect(duplicatedVersions).toHaveLength(1);
  });

  it('rejects core ids that do not exist', async () => {
    const absentId = '00000000-0000-4000-8000-000000000000';

    const response = await workflowGraphqlRequest(
      `
        mutation ActivateCoreWorkflowVersion($coreWorkflowVersionId: UUID!) {
          activateCoreWorkflowVersion(
            coreWorkflowVersionId: $coreWorkflowVersionId
          )
        }
      `,
      { coreWorkflowVersionId: absentId },
    );

    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toContain('not found');
  });

  it('rejects a discard carrying both transitional ids', async () => {
    const response = await workflowGraphqlRequest(
      `
        mutation DiscardCoreWorkflowDraft($input: DiscardCoreWorkflowDraftInput!) {
          discardCoreWorkflowDraft(input: $input) {
            id
          }
        }
      `,
      {
        input: {
          coreWorkflowVersionId: coreWorkflowVersionId,
          workspaceWorkflowVersionId: coreWorkflowVersionId,
        },
      },
    );

    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toContain('Only one');
  });
});
