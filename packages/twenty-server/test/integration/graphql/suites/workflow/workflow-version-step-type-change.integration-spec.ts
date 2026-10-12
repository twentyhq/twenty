import { updateWorkflowVersionTrigger } from 'test/integration/graphql/suites/workflow/utils/update-workflow-version-trigger.util';
import { workflowGraphqlRequest } from 'test/integration/graphql/suites/workflow/utils/workflow-graphql-request.util';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

type WorkflowStep = {
  id: string;
  name: string;
  type: string;
  nextStepIds?: string[];
  position?: { x: number; y: number };
  settings: { input: Record<string, unknown> };
};

type CreateStepInput = {
  id?: string;
  stepType: string;
  parentStepId: string;
  position: { x: number; y: number };
};

type WorkflowBuilderApi = {
  name: string;
  createDraftVersion: () => Promise<{ workflowId: string; versionId: string }>;
  getSteps: (versionId: string) => Promise<WorkflowStep[]>;
  createStep: (versionId: string, input: CreateStepInput) => Promise<void>;
  updateStep: (
    versionId: string,
    step: WorkflowStep,
  ) => Promise<{ errors?: { message: string }[] }>;
  cleanup: () => Promise<void>;
};

const MANUAL_TRIGGER = {
  name: 'Manual Trigger',
  type: 'MANUAL',
  settings: { outputSchema: {} },
  nextStepIds: [],
  position: { x: 0, y: 0 },
};

const expectNoErrors = (body: { errors?: unknown }) => {
  expect(body.errors).toBeUndefined();
};

const buildWorkspaceApi = (): WorkflowBuilderApi => {
  const workflowIds: string[] = [];

  return {
    name: 'workspace workflow version API',
    createDraftVersion: async () => {
      const createResponse = await workflowGraphqlRequest(`
        mutation CreateWorkflow {
          createWorkflow(data: { name: "Step type change test" }) {
            id
          }
        }
      `);

      expectNoErrors(createResponse.body);

      const workflowId = createResponse.body.data.createWorkflow.id;

      workflowIds.push(workflowId);

      const workflowResponse = await workflowGraphqlRequest(
        `
          query GetWorkflow($id: UUID!) {
            workflow(filter: { id: { eq: $id } }) {
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
        { id: workflowId },
      );

      expectNoErrors(workflowResponse.body);

      const versionId =
        workflowResponse.body.data.workflow.versions.edges[0].node.id;

      await updateWorkflowVersionTrigger({
        workflowVersionId: versionId,
        trigger: MANUAL_TRIGGER,
      });

      return { workflowId, versionId };
    },
    getSteps: async (versionId) => {
      const response = await workflowGraphqlRequest(
        `
          query GetWorkflowVersion($id: UUID!) {
            workflowVersion(filter: { id: { eq: $id } }) {
              steps
            }
          }
        `,
        { id: versionId },
      );

      expectNoErrors(response.body);

      return response.body.data.workflowVersion.steps;
    },
    createStep: async (versionId, input) => {
      const response = await workflowGraphqlRequest(
        `
          mutation CreateWorkflowVersionStep(
            $input: CreateWorkflowVersionStepInput!
          ) {
            createWorkflowVersionStep(input: $input) {
              stepsDiff
            }
          }
        `,
        { input: { workflowVersionId: versionId, ...input } },
      );

      expectNoErrors(response.body);
    },
    updateStep: async (versionId, step) => {
      const response = await workflowGraphqlRequest(
        `
          mutation UpdateWorkflowVersionStep(
            $input: UpdateWorkflowVersionStepInput!
          ) {
            updateWorkflowVersionStep(input: $input) {
              id
            }
          }
        `,
        { input: { workflowVersionId: versionId, step } },
      );

      return response.body;
    },
    cleanup: async () => {
      for (const workflowId of workflowIds) {
        await workflowGraphqlRequest(
          `
            mutation DestroyWorkflow($id: ID!) {
              destroyWorkflow(id: $id) {
                id
              }
            }
          `,
          { id: workflowId },
        );
      }
    },
  };
};

const buildCoreApi = (): WorkflowBuilderApi => {
  const coreWorkflowIds: string[] = [];

  return {
    name: 'core workflow version API',
    createDraftVersion: async () => {
      const createResponse = await workflowGraphqlRequest(`
        mutation {
          createCoreWorkflow(input: { name: "Core step type change test" }) {
            id
          }
        }
      `);

      expectNoErrors(createResponse.body);

      const coreWorkflowId = createResponse.body.data.createCoreWorkflow.id;

      coreWorkflowIds.push(coreWorkflowId);

      const versionsResponse = await workflowGraphqlRequest(
        `
          query CoreWorkflowVersionsByCoreWorkflowId($coreWorkflowId: UUID!) {
            coreWorkflowVersionsByCoreWorkflowId(
              coreWorkflowId: $coreWorkflowId
            ) {
              id
            }
          }
        `,
        { coreWorkflowId },
      );

      expectNoErrors(versionsResponse.body);

      const coreWorkflowVersionId =
        versionsResponse.body.data.coreWorkflowVersionsByCoreWorkflowId[0].id;

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

      expectNoErrors(triggerResponse.body);

      return { workflowId: coreWorkflowId, versionId: coreWorkflowVersionId };
    },
    getSteps: async (versionId) => {
      const response = await workflowGraphqlRequest(
        `
          query CoreWorkflowVersionById($coreWorkflowVersionId: UUID!) {
            coreWorkflowVersionById(
              coreWorkflowVersionId: $coreWorkflowVersionId
            ) {
              steps
            }
          }
        `,
        { coreWorkflowVersionId: versionId },
      );

      expectNoErrors(response.body);

      return response.body.data.coreWorkflowVersionById.steps;
    },
    createStep: async (versionId, input) => {
      const response = await workflowGraphqlRequest(
        `
          mutation CreateCoreWorkflowVersionStep(
            $input: CreateCoreWorkflowVersionStepInput!
          ) {
            createCoreWorkflowVersionStep(input: $input) {
              stepsDiff
            }
          }
        `,
        { input: { coreWorkflowVersionId: versionId, ...input } },
      );

      expectNoErrors(response.body);
    },
    updateStep: async (versionId, step) => {
      const response = await workflowGraphqlRequest(
        `
          mutation UpdateCoreWorkflowVersionStep(
            $input: UpdateCoreWorkflowVersionStepInput!
          ) {
            updateCoreWorkflowVersionStep(input: $input) {
              id
            }
          }
        `,
        { input: { coreWorkflowVersionId: versionId, step } },
      );

      return response.body;
    },
    cleanup: async () => {
      await workflowGraphqlRequest(
        `
          mutation DeleteCoreWorkflows($input: DeleteCoreWorkflowsInput!) {
            deleteCoreWorkflows(input: $input) {
              id
            }
          }
        `,
        { input: { coreWorkflowIds } },
      );
    },
  };
};

const findStepOrThrow = (steps: WorkflowStep[], stepId: string) => {
  const step = steps.find((candidateStep) => candidateStep.id === stepId);

  if (!isDefined(step)) {
    throw new Error(`Step ${stepId} not found`);
  }

  return step;
};

const changeStepTypeToIterator = async (
  api: WorkflowBuilderApi,
  versionId: string,
  existingStep: WorkflowStep,
) => {
  const responseBody = await api.updateStep(versionId, {
    ...existingStep,
    type: 'ITERATOR',
  });

  expectNoErrors(responseBody);

  const steps = await api.getSteps(versionId);
  const iteratorStep = findStepOrThrow(steps, existingStep.id);

  expect(iteratorStep.type).toBe('ITERATOR');

  const initialLoopStepIds = iteratorStep.settings.input
    .initialLoopStepIds as string[];

  expect(initialLoopStepIds).toHaveLength(1);

  const loopPlaceholderStep = findStepOrThrow(steps, initialLoopStepIds[0]);

  expect(loopPlaceholderStep.type).toBe('EMPTY');
  expect(loopPlaceholderStep.nextStepIds).toEqual([existingStep.id]);
};

describe.each([buildWorkspaceApi(), buildCoreApi()])(
  'Workflow version step type change through the $name (e2e)',
  (api) => {
    afterAll(async () => {
      await api.cleanup();
    });

    it('converts an If/Else branch placeholder into an Iterator', async () => {
      const { versionId } = await api.createDraftVersion();
      const ifElseStepId = v4();

      await api.createStep(versionId, {
        id: ifElseStepId,
        stepType: 'IF_ELSE',
        parentStepId: 'trigger',
        position: { x: 0, y: 200 },
      });

      const steps = await api.getSteps(versionId);
      const ifElseStep = findStepOrThrow(steps, ifElseStepId);
      const branches = ifElseStep.settings.input.branches as {
        nextStepIds: string[];
      }[];
      const branchPlaceholderStep = findStepOrThrow(
        steps,
        branches[0].nextStepIds[0],
      );

      expect(branchPlaceholderStep.type).toBe('EMPTY');

      await changeStepTypeToIterator(api, versionId, branchPlaceholderStep);
    });

    it('changes an existing step into an Iterator', async () => {
      const { versionId } = await api.createDraftVersion();
      const delayStepId = v4();

      await api.createStep(versionId, {
        id: delayStepId,
        stepType: 'DELAY',
        parentStepId: 'trigger',
        position: { x: 0, y: 200 },
      });

      const delayStep = findStepOrThrow(
        await api.getSteps(versionId),
        delayStepId,
      );

      await changeStepTypeToIterator(api, versionId, delayStep);
    });
  },
);

describe('Workflow version step type change into Code (e2e)', () => {
  const api = buildWorkspaceApi();

  afterAll(async () => {
    await api.cleanup();
  });

  it('creates a new logic function when a step shared with a published version is changed back into Code', async () => {
    const { workflowId, versionId: publishedVersionId } =
      await api.createDraftVersion();
    const codeStepId = v4();

    await api.createStep(publishedVersionId, {
      id: codeStepId,
      stepType: 'CODE',
      parentStepId: 'trigger',
      position: { x: 0, y: 200 },
    });

    const activateResponse = await workflowGraphqlRequest(
      `
        mutation ActivateWorkflowVersion($workflowVersionId: UUID!) {
          activateWorkflowVersion(workflowVersionId: $workflowVersionId)
        }
      `,
      { workflowVersionId: publishedVersionId },
    );

    expectNoErrors(activateResponse.body);

    const draftResponse = await workflowGraphqlRequest(
      `
        mutation CreateDraftFromWorkflowVersion(
          $input: CreateDraftFromWorkflowVersionInput!
        ) {
          createDraftFromWorkflowVersion(input: $input) {
            id
          }
        }
      `,
      { input: { workflowId, workflowVersionIdToCopy: publishedVersionId } },
    );

    expectNoErrors(draftResponse.body);

    const draftVersionId =
      draftResponse.body.data.createDraftFromWorkflowVersion.id;

    const draftCodeStep = findStepOrThrow(
      await api.getSteps(draftVersionId),
      codeStepId,
    );

    expectNoErrors(
      await api.updateStep(draftVersionId, { ...draftCodeStep, type: 'DELAY' }),
    );

    const draftDelayStep = findStepOrThrow(
      await api.getSteps(draftVersionId),
      codeStepId,
    );

    expectNoErrors(
      await api.updateStep(draftVersionId, { ...draftDelayStep, type: 'CODE' }),
    );

    const publishedCodeStep = findStepOrThrow(
      await api.getSteps(publishedVersionId),
      codeStepId,
    );
    const rebuiltCodeStep = findStepOrThrow(
      await api.getSteps(draftVersionId),
      codeStepId,
    );

    expect(rebuiltCodeStep.type).toBe('CODE');
    expect(rebuiltCodeStep.settings.input.logicFunctionId).toBeDefined();
    expect(rebuiltCodeStep.settings.input.logicFunctionId).not.toBe(
      publishedCodeStep.settings.input.logicFunctionId,
    );
  });
});
