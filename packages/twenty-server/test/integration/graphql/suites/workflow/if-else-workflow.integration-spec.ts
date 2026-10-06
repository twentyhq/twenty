import {
  activateCoreWorkflowVersion,
  CORE_WORKFLOW_MANUAL_TRIGGER,
  CORE_WORKFLOW_VERSION_BY_ID_QUERY,
  createCoreWorkflow,
  createCoreWorkflowVersionStep,
  deleteCoreWorkflows,
  findCoreWorkflowById,
  findCoreWorkflowVersionById,
  runCoreWorkflowVersion,
  updateCoreWorkflowVersionStep,
  updateCoreWorkflowVersionTrigger,
} from 'test/integration/graphql/suites/workflow/utils/core-workflow-test.util';
import { workflowGraphqlRequest } from 'test/integration/graphql/suites/workflow/utils/workflow-graphql-request.util';
import {
  destroyWorkflowRun,
  waitForWorkflowCompletion,
} from 'test/integration/graphql/suites/workflow/utils/workflow-run-test.util';
import { StepLogicalOperator, ViewFilterOperand } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { type StepIfElseBranch } from 'twenty-shared/workflow';
import { v4 } from 'uuid';

import { type WorkflowIfElseAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

describe('If/Else Workflow (e2e)', () => {
  let createdCoreWorkflowId: string | null = null;
  let createdCoreWorkflowVersionId: string | null = null;
  let ifElseStepId: string | null = null;
  let ifBranchEmptyNodeId: string | null = null;
  let elseBranchEmptyNodeId: string | null = null;
  let elseIfBranchEmptyNodeId: string | null = null;
  let elseIfBranchId: string | null = null;

  const findIfElseStep = async (): Promise<WorkflowIfElseAction> => {
    const response = await workflowGraphqlRequest(
      CORE_WORKFLOW_VERSION_BY_ID_QUERY,
      { coreWorkflowVersionId: createdCoreWorkflowVersionId },
    );

    expect(response.body.errors).toBeUndefined();

    const ifElseStep = response.body.data.coreWorkflowVersionById.steps.find(
      (step: { type: string }) => step.type === 'IF_ELSE',
    );

    expect(ifElseStep).toBeDefined();

    return ifElseStep;
  };

  beforeAll(async () => {
    const { coreWorkflowId, coreWorkflowVersionId } = await createCoreWorkflow({
      name: 'If/Else Test Workflow',
    });

    createdCoreWorkflowId = coreWorkflowId;
    createdCoreWorkflowVersionId = coreWorkflowVersionId;

    await updateCoreWorkflowVersionTrigger({
      coreWorkflowVersionId,
      trigger: {
        ...CORE_WORKFLOW_MANUAL_TRIGGER,
        settings: {
          outputSchema: {
            number: {
              isLeaf: true,
              type: 'number',
              value: undefined,
            },
          },
        },
      },
    });

    await createCoreWorkflowVersionStep({
      coreWorkflowVersionId,
      stepType: 'IF_ELSE',
    });

    const ifElseStep = await findIfElseStep();

    ifElseStepId = ifElseStep.id;

    const branches = ifElseStep.settings.input.branches;
    const ifBranch = branches.find(
      (branch: StepIfElseBranch) => branch.filterGroupId,
    );
    const elseBranch = branches.find(
      (branch: StepIfElseBranch) => !branch.filterGroupId,
    );

    expect(ifBranch).toBeDefined();
    expect(elseBranch).toBeDefined();
    expect(ifBranch?.nextStepIds.length).toBeGreaterThan(0);
    expect(elseBranch?.nextStepIds.length).toBeGreaterThan(0);

    ifBranchEmptyNodeId = ifBranch?.nextStepIds[0] ?? null;
    elseBranchEmptyNodeId = elseBranch?.nextStepIds[0] ?? null;

    expect(ifElseStep.settings.input.stepFilterGroups.length).toBeGreaterThan(
      0,
    );
    expect(ifElseStep.settings.input.stepFilters.length).toBeGreaterThan(0);
    expect(ifElseStep.settings.input.branches.length).toBe(2);

    const ifFilterGroupId = ifBranch?.filterGroupId;

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

    const elseIfEmptyNode = await createCoreWorkflowVersionStep({
      coreWorkflowVersionId,
      stepType: 'EMPTY',
      parentStepId: null,
      position: { x: 300, y: 100 },
    });

    expect(elseIfEmptyNode.type).toBe('EMPTY');
    elseIfBranchEmptyNodeId = elseIfEmptyNode.id;

    const elseIfFilterGroupId = v4();
    const elseIfFilterId = v4();
    const newElseIfBranchId = v4();

    elseIfBranchId = newElseIfBranchId;

    const currentIfElseStep = await findIfElseStep();

    const updatedBranches = [...currentIfElseStep.settings.input.branches];

    updatedBranches.splice(
      currentIfElseStep.settings.input.branches.length - 1,
      0,
      {
        id: newElseIfBranchId,
        filterGroupId: elseIfFilterGroupId,
        nextStepIds: [elseIfEmptyNode.id],
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

    await activateCoreWorkflowVersion(coreWorkflowVersionId);
  });

  afterAll(async () => {
    if (isDefined(createdCoreWorkflowId)) {
      await deleteCoreWorkflows([createdCoreWorkflowId]);
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
      const coreWorkflow = await findCoreWorkflowById(createdCoreWorkflowId!);

      expect(coreWorkflow?.id).toBe(createdCoreWorkflowId);
      expect(coreWorkflow?.name).toBe('If/Else Test Workflow');
      expect(coreWorkflow?.lastPublishedCoreWorkflowVersionId).toBe(
        createdCoreWorkflowVersionId,
      );
      expect(coreWorkflow?.statuses).toContain('ACTIVE');
    });

    it('should verify If/Else workflow version has correct structure', async () => {
      const workflowVersion = await findCoreWorkflowVersionById(
        createdCoreWorkflowVersionId!,
      );

      expect(workflowVersion?.status).toBe('ACTIVE');

      const trigger = workflowVersion?.trigger;

      expect(trigger?.type).toBe('MANUAL');
      expect(trigger?.nextStepIds).toContain(ifElseStepId);

      const ifElseStepSummary = workflowVersion?.steps?.find(
        (step) => step.id === ifElseStepId,
      );

      expect(ifElseStepSummary).toBeDefined();
      expect(ifElseStepSummary?.type).toBe('IF_ELSE');
      expect(ifElseStepSummary?.name).toBe('If/Else');

      const ifElseStep = await findIfElseStep();

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
        coreWorkflowVersionId: createdCoreWorkflowVersionId!,
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
