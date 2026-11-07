import { isDefined } from 'twenty-shared/utils';
import {
  createCoreWorkflow,
  createCoreWorkflowVersionStep,
  deleteCoreWorkflows,
  findCoreWorkflowVersion,
  updateCoreWorkflowVersionTrigger,
} from 'test/integration/graphql/suites/workflow/utils/core-workflow.util';
import { workflowGraphqlRequest } from 'test/integration/graphql/suites/workflow/utils/workflow-graphql-request.util';

type IfElseStep = {
  id: string;
  type: string;
  nextStepIds?: string[] | null;
  settings: {
    input: { branches: { id: string; nextStepIds: string[] }[] };
  } & Record<string, unknown>;
} & Record<string, unknown>;

const EDGE_MUTATION = (operation: 'Create' | 'Delete') => `
  mutation ${operation}CoreWorkflowVersionEdge(
    $input: ${operation}CoreWorkflowVersionEdgeInput!
  ) {
    ${operation.toLowerCase()}CoreWorkflowVersionEdge(input: $input) {
      stepsDiff
    }
  }
`;

describe('If/Else edges (e2e)', () => {
  let coreWorkflowId: string;
  let coreWorkflowVersionId: string;
  let ifElseStep: IfElseStep;
  let targetStepId: string;

  const getIfElseStep = async (): Promise<IfElseStep> => {
    const { steps } = await findCoreWorkflowVersion<IfElseStep>({
      coreWorkflowVersionId,
    });

    const step = (steps ?? []).find((step) => step.id === ifElseStep.id);

    if (!isDefined(step)) {
      throw new Error('If/Else step not found');
    }

    return step;
  };

  const getElseBranch = (step: IfElseStep) =>
    step.settings.input.branches[step.settings.input.branches.length - 1];

  beforeAll(async () => {
    ({ coreWorkflowId, coreWorkflowVersionId } = await createCoreWorkflow({
      name: 'If/Else edges test',
    }));

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

    ifElseStep = await createCoreWorkflowVersionStep<IfElseStep>({
      coreWorkflowVersionId,
      stepType: 'IF_ELSE',
    });

    targetStepId = (
      await createCoreWorkflowVersionStep({
        coreWorkflowVersionId,
        stepType: 'CREATE_RECORD',
        position: { x: 400, y: 0 },
      })
    ).id;
  });

  afterAll(async () => {
    await deleteCoreWorkflows({ coreWorkflowIds: [coreWorkflowId] });
  });

  it('refuses an edge from an If/Else that names no branch', async () => {
    const response = await workflowGraphqlRequest(EDGE_MUTATION('Create'), {
      input: {
        coreWorkflowVersionId,
        source: ifElseStep.id,
        target: targetStepId,
      },
    });

    expect(response.body.errors?.[0]?.message).toContain(
      'through one of its branches',
    );
    expect((await getIfElseStep()).nextStepIds ?? []).toEqual([]);
  });

  it('adds and removes an edge in the branch it names', async () => {
    const sourceConnectionOptions = {
      connectedStepType: 'IF_ELSE',
      settings: { branchId: getElseBranch(ifElseStep).id },
    };

    const createResponse = await workflowGraphqlRequest(
      EDGE_MUTATION('Create'),
      {
        input: {
          coreWorkflowVersionId,
          source: ifElseStep.id,
          target: targetStepId,
          sourceConnectionOptions,
        },
      },
    );

    expect(createResponse.body.errors).toBeUndefined();

    const connectedStep = await getIfElseStep();

    expect(getElseBranch(connectedStep).nextStepIds).toContain(targetStepId);
    expect(connectedStep.nextStepIds ?? []).toEqual([]);

    const deleteResponse = await workflowGraphqlRequest(
      EDGE_MUTATION('Delete'),
      {
        input: {
          coreWorkflowVersionId,
          source: ifElseStep.id,
          target: targetStepId,
          sourceConnectionOptions,
        },
      },
    );

    expect(deleteResponse.body.errors).toBeUndefined();
    expect(getElseBranch(await getIfElseStep()).nextStepIds).not.toContain(
      targetStepId,
    );
  });

  it('refuses a step inserted after an If/Else outside its branches', async () => {
    await expect(
      createCoreWorkflowVersionStep({
        coreWorkflowVersionId,
        stepType: 'CREATE_RECORD',
        parentStepId: ifElseStep.id,
      }),
    ).rejects.toThrow('through one of its branches');
  });

  it('refuses an If/Else saved with next steps outside its branches', async () => {
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
      {
        input: {
          coreWorkflowVersionId,
          step: { ...(await getIfElseStep()), nextStepIds: [targetStepId] },
        },
      },
    );

    expect(response.body.errors?.[0]?.message).toContain(
      'outside its branches',
    );
  });
});
