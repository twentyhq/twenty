import {
  activateCoreWorkflowVersion,
  coreWorkflowGraphqlRequest,
  createCoreWorkflow,
  createCoreWorkflowVersionStep,
  deleteCoreWorkflows,
  findCoreWorkflowVersion,
  runCoreWorkflowVersion,
  updateCoreWorkflowVersionStep,
  updateCoreWorkflowVersionTrigger,
} from 'test/integration/graphql/suites/workflow/utils/core-workflow.util';
import {
  destroyWorkflowRun,
  waitForWorkflowCompletion,
} from 'test/integration/graphql/suites/workflow/utils/workflow-run-test.util';
import { StepLogicalOperator, ViewFilterOperand } from 'twenty-shared/types';
import { type StepIfElseBranch } from 'twenty-shared/workflow';
import { v4 } from 'uuid';

type IfElseStep = {
  id: string;
  type: string;
  name?: string;
  settings: {
    input: {
      branches: StepIfElseBranch[];
      stepFilterGroups: { id: string }[];
      stepFilters: { id: string }[];
    };
  } & Record<string, unknown>;
};

describe('If/Else Workflow (e2e)', () => {
  let coreWorkflowId: string | null = null;
  let coreWorkflowVersionId: string | null = null;
  let ifElseStepId: string | null = null;
  let ifBranchEmptyNodeId: string | null = null;
  let elseBranchEmptyNodeId: string | null = null;
  let elseIfBranchEmptyNodeId: string | null = null;
  let elseIfBranchId: string | null = null;

  const findIfElseStep = async (): Promise<IfElseStep> => {
    const { steps } = await findCoreWorkflowVersion<IfElseStep>({
      coreWorkflowVersionId: coreWorkflowVersionId!,
    });
    const ifElseStep = steps?.find((step) => step.id === ifElseStepId);

    expect(ifElseStep).toBeDefined();

    return ifElseStep!;
  };

  beforeAll(async () => {
    const coreWorkflow = await createCoreWorkflow({
      name: 'If/Else Test Workflow',
    });

    coreWorkflowId = coreWorkflow.coreWorkflowId;
    coreWorkflowVersionId = coreWorkflow.coreWorkflowVersionId;

    const manualTrigger = {
      name: 'Manual Trigger',
      type: 'MANUAL',
      settings: {
        outputSchema: {
          number: {
            isLeaf: true,
            type: 'number',
            value: undefined,
          },
        },
      },
      nextStepIds: [],
      position: { x: 0, y: 0 },
    };

    await updateCoreWorkflowVersionTrigger({
      coreWorkflowVersionId,
      trigger: manualTrigger,
    });

    const ifElseStep = await createCoreWorkflowVersionStep<IfElseStep>({
      coreWorkflowVersionId,
      stepType: 'IF_ELSE',
    });

    ifElseStepId = ifElseStep.id;

    const [ifBranch, elseBranch] = ifElseStep.settings.input.branches;

    expect(ifElseStep.settings.input.branches).toHaveLength(2);
    expect(elseBranch.filterGroupId).toBeUndefined();
    expect(ifBranch.nextStepIds.length).toBeGreaterThan(0);
    expect(elseBranch.nextStepIds.length).toBeGreaterThan(0);

    ifBranchEmptyNodeId = ifBranch.nextStepIds[0];
    elseBranchEmptyNodeId = elseBranch.nextStepIds[0];

    expect(ifElseStep.settings.input.stepFilterGroups.length).toBeGreaterThan(
      0,
    );
    expect(ifElseStep.settings.input.stepFilters.length).toBeGreaterThan(0);

    const ifFilterGroupId = ifBranch.filterGroupId;

    expect(ifFilterGroupId).toBeDefined();

    const filterGroup = ifElseStep.settings.input.stepFilterGroups.find(
      (group) => group.id === ifFilterGroupId,
    );

    expect(filterGroup).toBeDefined();

    await updateCoreWorkflowVersionStep({
      coreWorkflowVersionId,
      step: {
        ...ifElseStep,
        settings: {
          ...ifElseStep.settings,
          input: {
            ...ifElseStep.settings.input,
            stepFilters: [
              {
                id: ifElseStep.settings.input.stepFilters[0].id,
                type: 'NUMBER',
                stepOutputKey: '{{trigger.number}}',
                operand: ViewFilterOperand.IS,
                value: '10',
                stepFilterGroupId: ifFilterGroupId,
                positionInStepFilterGroup: 0,
              },
            ],
          },
        },
      },
    });

    await coreWorkflowGraphqlRequest({
      query: `
        mutation CreateCoreWorkflowVersionStep(
          $input: CreateCoreWorkflowVersionStepInput!
        ) {
          createCoreWorkflowVersionStep(input: $input) {
            stepsDiff
          }
        }
      `,
      variables: {
        input: {
          coreWorkflowVersionId,
          stepType: 'EMPTY',
          position: { x: 300, y: 100 },
        },
      },
    });

    const { steps: stepsWithElseIfEmptyNode } = await findCoreWorkflowVersion({
      coreWorkflowVersionId,
    });
    const elseIfBranchEmptyNode = stepsWithElseIfEmptyNode?.find(
      (step) =>
        step.type === 'EMPTY' &&
        step.id !== ifBranchEmptyNodeId &&
        step.id !== elseBranchEmptyNodeId,
    );

    expect(elseIfBranchEmptyNode).toBeDefined();
    elseIfBranchEmptyNodeId = elseIfBranchEmptyNode!.id;

    const elseIfFilterGroupId = v4();
    const elseIfFilterId = v4();

    elseIfBranchId = v4();

    const currentIfElseStep = await findIfElseStep();

    const updatedBranches = [...currentIfElseStep.settings.input.branches];

    updatedBranches.splice(
      currentIfElseStep.settings.input.branches.length - 1,
      0,
      {
        id: elseIfBranchId,
        filterGroupId: elseIfFilterGroupId,
        nextStepIds: [elseIfBranchEmptyNodeId],
      },
    );

    const updatedStepFilterGroups = [
      ...currentIfElseStep.settings.input.stepFilterGroups,
      {
        id: elseIfFilterGroupId,
        logicalOperator: StepLogicalOperator.AND,
        positionInStepFilterGroup: 0,
      },
    ];

    const updatedStepFilters = [
      ...currentIfElseStep.settings.input.stepFilters,
      {
        id: elseIfFilterId,
        type: 'NUMBER',
        stepOutputKey: '{{trigger.number}}',
        operand: ViewFilterOperand.IS,
        value: '20',
        stepFilterGroupId: elseIfFilterGroupId,
        positionInStepFilterGroup: 0,
      },
    ];

    await updateCoreWorkflowVersionStep({
      coreWorkflowVersionId,
      step: {
        ...currentIfElseStep,
        settings: {
          ...currentIfElseStep.settings,
          input: {
            ...currentIfElseStep.settings.input,
            branches: updatedBranches,
            stepFilterGroups: updatedStepFilterGroups,
            stepFilters: updatedStepFilters,
          },
        },
      },
    });

    await activateCoreWorkflowVersion({ coreWorkflowVersionId });
  });

  afterAll(async () => {
    if (coreWorkflowId) {
      await deleteCoreWorkflows({ coreWorkflowIds: [coreWorkflowId] });
    }
  });

  const identifyBranches = (branches: StepIfElseBranch[]) => {
    const ifBranch = branches[0];
    const elseBranch = branches.find((branch) => !branch.filterGroupId);
    const elseIfBranches = branches.filter(
      (branch, index) =>
        index > 0 &&
        index < branches.length - 1 &&
        branch.filterGroupId !== undefined,
    );

    return { ifBranch, elseBranch, elseIfBranches };
  };

  describe('Workflow structure', () => {
    it('should verify If/Else workflow exists and is active', async () => {
      const { coreWorkflowById } = await coreWorkflowGraphqlRequest<{
        coreWorkflowById: {
          id: string;
          name: string;
          statuses: string[];
          lastPublishedCoreWorkflowVersionId: string | null;
        };
      }>({
        query: `
          query FindCoreWorkflow($coreWorkflowId: UUID!) {
            coreWorkflowById(coreWorkflowId: $coreWorkflowId) {
              id
              name
              statuses
              lastPublishedCoreWorkflowVersionId
            }
          }
        `,
        variables: { coreWorkflowId },
      });

      expect(coreWorkflowById.id).toBe(coreWorkflowId);
      expect(coreWorkflowById.name).toBe('If/Else Test Workflow');
      expect(coreWorkflowById.lastPublishedCoreWorkflowVersionId).toBe(
        coreWorkflowVersionId,
      );
      expect(coreWorkflowById.statuses).toContain('ACTIVE');
    });

    it('should verify If/Else workflow version has correct structure', async () => {
      const workflowVersion = await findCoreWorkflowVersion<IfElseStep>({
        coreWorkflowVersionId: coreWorkflowVersionId!,
      });

      expect(workflowVersion.status).toBe('ACTIVE');

      const trigger = workflowVersion.trigger;

      expect(trigger?.type).toBe('MANUAL');
      expect(trigger?.nextStepIds).toContain(ifElseStepId);

      const ifElseStep = await findIfElseStep();

      expect(ifElseStep.type).toBe('IF_ELSE');
      expect(ifElseStep.name).toBe('If/Else');
      expect(ifElseStep.settings.input.branches.length).toBe(3);

      const { ifBranch, elseBranch, elseIfBranches } = identifyBranches(
        ifElseStep.settings.input.branches,
      );

      expect(ifBranch?.filterGroupId).toBeDefined();
      expect(elseBranch?.filterGroupId).toBeUndefined();
      expect(ifBranch?.nextStepIds).toContain(ifBranchEmptyNodeId);
      expect(elseBranch?.nextStepIds).toContain(elseBranchEmptyNodeId);

      expect(elseIfBranches.length).toBe(1);
      expect(elseIfBranches[0].filterGroupId).toBeDefined();
      expect(elseIfBranches[0].nextStepIds).toContain(elseIfBranchEmptyNodeId);
    });
  });

  describe('If/Else branching execution', () => {
    const verifyBranchExecution = async ({
      payload,
      expectedBranchType,
    }: {
      payload: { number: number };
      expectedBranchType: 'if' | 'else' | 'else-if';
    }) => {
      const workflowRunId = await runCoreWorkflowVersion({
        coreWorkflowVersionId: coreWorkflowVersionId!,
        payload,
      });

      const workflowRun = await waitForWorkflowCompletion(workflowRunId);

      expect(workflowRun?.status).toBe('COMPLETED');
      expect(workflowRun?.state?.stepInfos?.trigger?.status).toBe('SUCCESS');
      expect(workflowRun?.state?.stepInfos?.[ifElseStepId!]?.status).toBe(
        'SUCCESS',
      );

      const ifElseStepResult = workflowRun?.state?.stepInfos?.[ifElseStepId!]
        ?.result as { matchingBranchId?: string } | undefined;

      expect(ifElseStepResult?.matchingBranchId).toBeDefined();

      const ifElseStep = await findIfElseStep();

      const matchedBranch = ifElseStep.settings.input.branches.find(
        (branch) => branch.id === ifElseStepResult?.matchingBranchId,
      );

      if (!matchedBranch) {
        const branchIds = ifElseStep.settings.input.branches.map((b) => b.id);

        throw new Error(
          `Branch with ID ${ifElseStepResult?.matchingBranchId} not found. Available branch IDs: ${branchIds.join(', ')}`,
        );
      }

      const { ifBranch, elseBranch, elseIfBranches } = identifyBranches(
        ifElseStep.settings.input.branches,
      );

      let expectedBranch: StepIfElseBranch | undefined;
      let expectedEmptyNodeId: string | null = null;
      let otherEmptyNodeIds: (string | null)[] = [];

      if (expectedBranchType === 'if') {
        expectedBranch = ifBranch;
        expectedEmptyNodeId = ifBranchEmptyNodeId;
        otherEmptyNodeIds = [elseBranchEmptyNodeId, elseIfBranchEmptyNodeId];
      } else if (expectedBranchType === 'else') {
        expectedBranch = elseBranch;
        expectedEmptyNodeId = elseBranchEmptyNodeId;
        otherEmptyNodeIds = [ifBranchEmptyNodeId, elseIfBranchEmptyNodeId];
      } else if (expectedBranchType === 'else-if') {
        expectedBranch = elseIfBranches.find(
          (branch) => branch.id === elseIfBranchId,
        );
        expectedEmptyNodeId = elseIfBranchEmptyNodeId;
        otherEmptyNodeIds = [ifBranchEmptyNodeId, elseBranchEmptyNodeId];
      }

      expect(matchedBranch.id).toBe(expectedBranch?.id);
      expect(matchedBranch.nextStepIds).toContain(expectedEmptyNodeId);
      otherEmptyNodeIds.forEach((id) => {
        if (id) {
          expect(matchedBranch.nextStepIds).not.toContain(id);
        }
      });

      await destroyWorkflowRun(workflowRunId);
    };

    it('should execute IF branch when condition is true', async () => {
      await verifyBranchExecution({
        payload: { number: 10 },
        expectedBranchType: 'if',
      });
    });

    it('should execute ELSE branch when condition is false', async () => {
      await verifyBranchExecution({
        payload: { number: 5 },
        expectedBranchType: 'else',
      });
    });

    it('should execute ELSE-IF branch when condition is true', async () => {
      await verifyBranchExecution({
        payload: { number: 20 },
        expectedBranchType: 'else-if',
      });
    });
  });
});
