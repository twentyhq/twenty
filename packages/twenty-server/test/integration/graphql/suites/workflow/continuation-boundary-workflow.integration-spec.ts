import { randomUUID } from 'node:crypto';

import { StepLogicalOperator, ViewFilterOperand } from 'twenty-shared/types';
import { WorkflowActionType } from 'twenty-shared/workflow';
import { workflowGraphqlRequest } from 'test/integration/graphql/suites/workflow/utils/workflow-graphql-request.util';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import {
  type WorkflowAction,
  type WorkflowEmptyAction,
  type WorkflowIfElseAction,
} from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { MAX_EXECUTED_STEPS_COUNT } from 'src/modules/workflow/workflow-executor/workspace-services/workflow-executor.workspace-service';

const workspaceId = SEED_APPLE_WORKSPACE_ID;
const schema = getWorkspaceSchemaName(workspaceId);

const STEPS_BEFORE_BOUNDARY = MAX_EXECUTED_STEPS_COUNT + 1;
const SKIPPED_CHAIN_LENGTH = MAX_EXECUTED_STEPS_COUNT + 4;

const settings = {
  input: {},
  outputSchema: {},
  errorHandlingOptions: {
    retryOnFailure: { value: 0 },
    continueOnFailure: { value: false },
  },
};

const emptyStep = (name: string): WorkflowEmptyAction => ({
  id: randomUUID(),
  name,
  type: WorkflowActionType.EMPTY,
  valid: true,
  settings,
  nextStepIds: [],
});

const chainedEmptySteps = (
  count: number,
  name: string,
): WorkflowEmptyAction[] => {
  const steps = Array.from({ length: count }, (_unused, index) =>
    emptyStep(`${name}_${index + 1}`),
  );

  steps.forEach((step, index) => {
    step.nextStepIds = index < steps.length - 1 ? [steps[index + 1].id] : [];
  });

  return steps;
};

const ifElseStep = ({
  ifBranchNextStepIds,
  elseBranchNextStepIds,
}: {
  ifBranchNextStepIds: string[];
  elseBranchNextStepIds: string[];
}): WorkflowIfElseAction => {
  const filterGroupId = randomUUID();

  return {
    id: randomUUID(),
    name: 'If/Else',
    type: WorkflowActionType.IF_ELSE,
    valid: true,
    nextStepIds: [],
    settings: {
      ...settings,
      input: {
        stepFilterGroups: [
          { id: filterGroupId, logicalOperator: StepLogicalOperator.AND },
        ],
        stepFilters: [
          {
            id: randomUUID(),
            type: 'NUMBER',
            stepOutputKey: '{{trigger.number}}',
            operand: ViewFilterOperand.IS,
            value: '10',
            stepFilterGroupId: filterGroupId,
            positionInStepFilterGroup: 0,
          },
        ],
        branches: [
          { id: randomUUID(), filterGroupId, nextStepIds: ifBranchNextStepIds },
          { id: randomUUID(), nextStepIds: elseBranchNextStepIds },
        ],
      },
    },
  } as WorkflowIfElseAction;
};

describe('workflow run continuation boundary (e2e)', () => {
  const coreWorkflowIds: string[] = [];

  const createMirrorlessFixture = async (
    steps: WorkflowAction[],
  ): Promise<string> => {
    const coreWorkflowId = randomUUID();
    const coreWorkflowVersionId = randomUUID();

    const [workspace] = await global.testDataSource.query(
      `SELECT "workspaceCustomApplicationId" FROM core.workspace WHERE id = $1`,
      [workspaceId],
    );

    const trigger = {
      name: 'Manual trigger',
      type: 'MANUAL',
      settings: { outputSchema: {} },
      nextStepIds: [steps[0].id],
    };

    await global.testDataSource.query(
      `INSERT INTO core.workflow (id, "workspaceId", "applicationId", "universalIdentifier", name)
       VALUES ($1, $2, $3, $4, 'Continuation boundary')`,
      [
        coreWorkflowId,
        workspaceId,
        workspace.workspaceCustomApplicationId,
        randomUUID(),
      ],
    );
    await global.testDataSource.query(
      `INSERT INTO core."workflowVersion" (id, "workspaceId", "applicationId", "universalIdentifier", "coreWorkflowId", "workflowId", status, triggers, steps)
       VALUES ($1, $2, $3, $4, $5, NULL, 'ACTIVE', $6, $7)`,
      [
        coreWorkflowVersionId,
        workspaceId,
        workspace.workspaceCustomApplicationId,
        randomUUID(),
        coreWorkflowId,
        JSON.stringify([trigger]),
        JSON.stringify(steps),
      ],
    );
    await global.testDataSource.query(
      `UPDATE core.workflow SET "lastPublishedCoreWorkflowVersionId" = $2 WHERE id = $1`,
      [coreWorkflowId, coreWorkflowVersionId],
    );

    coreWorkflowIds.push(coreWorkflowId);

    return coreWorkflowVersionId;
  };

  const runUntilSettled = async (coreWorkflowVersionId: string) => {
    const workflowRunId = randomUUID();

    const response = await workflowGraphqlRequest(
      'mutation Run($input: RunCoreWorkflowVersionInput!) { runCoreWorkflowVersion(input: $input) { workflowRunId } }',
      {
        input: {
          coreWorkflowVersionId,
          workflowRunId,
          payload: { number: 10 },
        },
      },
    );

    expect(response.body.errors).toBeUndefined();

    for (let attempt = 0; attempt < 300; attempt++) {
      const [run] = await global.testDataSource.query(
        `SELECT status, state FROM "${schema}"."workflowRun" WHERE id = $1`,
        [workflowRunId],
      );

      if (run?.status === 'COMPLETED' || run?.status === 'FAILED') {
        return run;
      }

      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    const [run] = await global.testDataSource.query(
      `SELECT status, state FROM "${schema}"."workflowRun" WHERE id = $1`,
      [workflowRunId],
    );

    return run;
  };

  afterAll(async () => {
    for (const coreWorkflowId of coreWorkflowIds) {
      await global.testDataSource.query(
        `DELETE FROM "${schema}"."workflowRun" WHERE "coreWorkflowId" = $1`,
        [coreWorkflowId],
      );
      await global.testDataSource.query(
        'DELETE FROM core."workflowVersion" WHERE "coreWorkflowId" = $1',
        [coreWorkflowId],
      );
      await global.testDataSource.query(
        'DELETE FROM core.workflow WHERE id = $1',
        [coreWorkflowId],
      );
    }
  });

  it('executes the selected if/else branch when the if/else lands on the continuation boundary', async () => {
    const leadingSteps = chainedEmptySteps(STEPS_BEFORE_BOUNDARY, 'plain');
    const selectedChild = emptyStep('selected_child');
    const unselectedChild = emptyStep('unselected_child');
    const branchingStep = ifElseStep({
      ifBranchNextStepIds: [selectedChild.id],
      elseBranchNextStepIds: [unselectedChild.id],
    });

    leadingSteps[leadingSteps.length - 1].nextStepIds = [branchingStep.id];

    const run = await runUntilSettled(
      await createMirrorlessFixture([
        ...leadingSteps,
        branchingStep,
        selectedChild,
        unselectedChild,
      ]),
    );

    expect(run.status).toBe('COMPLETED');

    const stepInfos = run.state.stepInfos;

    leadingSteps.forEach((step) => {
      expect(stepInfos[step.id].status).toBe('SUCCESS');
    });
    expect(stepInfos[branchingStep.id].status).toBe('SUCCESS');
    expect(stepInfos[selectedChild.id].status).toBe('SUCCESS');
    expect(stepInfos[unselectedChild.id].status).toBe('SKIPPED');
  });

  it('reaches the merge step when skip propagation crosses the continuation boundary', async () => {
    const skippedChain = chainedEmptySteps(SKIPPED_CHAIN_LENGTH, 'skipped');
    const selectedChild = emptyStep('selected_child');
    const mergeStep = emptyStep('merge');
    const receiptStep = emptyStep('receipt');
    const branchingStep = ifElseStep({
      ifBranchNextStepIds: [selectedChild.id],
      elseBranchNextStepIds: [skippedChain[0].id],
    });

    selectedChild.nextStepIds = [mergeStep.id];
    skippedChain[skippedChain.length - 1].nextStepIds = [mergeStep.id];
    mergeStep.nextStepIds = [receiptStep.id];

    const run = await runUntilSettled(
      await createMirrorlessFixture([
        branchingStep,
        selectedChild,
        ...skippedChain,
        mergeStep,
        receiptStep,
      ]),
    );

    expect(run.status).toBe('COMPLETED');

    const stepInfos = run.state.stepInfos;

    expect(stepInfos[selectedChild.id].status).toBe('SUCCESS');
    skippedChain.forEach((step) => {
      expect(stepInfos[step.id].status).toBe('SKIPPED');
    });
    expect(stepInfos[mergeStep.id].status).toBe('SUCCESS');
    expect(stepInfos[receiptStep.id].status).toBe('SUCCESS');
  });
});
