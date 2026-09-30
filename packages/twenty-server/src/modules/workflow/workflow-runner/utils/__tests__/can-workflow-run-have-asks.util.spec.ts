import { StepStatus, WorkflowActionType } from 'twenty-shared/workflow';

import { type WorkflowRunState } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { canWorkflowRunHaveAsks } from 'src/modules/workflow/workflow-runner/utils/can-workflow-run-have-asks.util';

const buildState = ({
  stepTypes,
  stepInfos = {},
}: {
  stepTypes: WorkflowActionType[];
  stepInfos?: WorkflowRunState['stepInfos'];
}) =>
  ({
    flow: {
      trigger: { type: 'MANUAL' },
      steps: stepTypes.map((type, index) => ({ id: `step-${index}`, type })),
    },
    stepInfos,
  }) as unknown as WorkflowRunState;

describe('canWorkflowRunHaveAsks', () => {
  it('knows a run with a form step can', () => {
    expect(
      canWorkflowRunHaveAsks(
        buildState({ stepTypes: [WorkflowActionType.FORM] }),
      ),
    ).toBe(true);
  });

  it('knows a run whose agent step started a conversation can', () => {
    expect(
      canWorkflowRunHaveAsks(
        buildState({
          stepTypes: [WorkflowActionType.AI_AGENT],
          stepInfos: {
            'step-0': { status: StepStatus.SUCCESS, threadId: 'thread-id' },
          },
        }),
      ),
    ).toBe(true);
  });

  it('knows a run with neither cannot', () => {
    expect(
      canWorkflowRunHaveAsks(
        buildState({
          stepTypes: [WorkflowActionType.CODE, WorkflowActionType.AI_AGENT],
          stepInfos: { 'step-0': { status: StepStatus.SUCCESS } },
        }),
      ),
    ).toBe(false);
    expect(canWorkflowRunHaveAsks(null)).toBe(false);
  });
});
