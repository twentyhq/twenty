import { getWorkflowRunContext } from '@/workflow/utils/getWorkflowRunContext';
import {
  StepStatus,
  type WorkflowRunStepInfos,
} from '@/workflow/types/WorkflowRunStateStepInfos';

describe('getWorkflowRunContext', () => {
  it('returns a context with only steps that have a defined result', () => {
    const stepInfos: WorkflowRunStepInfos = {
      step1: { result: { res: 'value1' }, status: StepStatus.SUCCESS },
      step2: { result: {}, status: StepStatus.SUCCESS },
      step3: { status: StepStatus.NOT_STARTED },
      step4: { result: { res: 0 }, status: StepStatus.SUCCESS },
      step5: { result: { res: undefined }, status: StepStatus.SUCCESS },
    };

    const context = getWorkflowRunContext(stepInfos);

    expect(context).toEqual({
      step1: { res: 'value1' },
      step2: {},
      step4: { res: 0 },
      step5: { res: undefined },
    });
  });

  it('returns an empty object when no step has a defined result', () => {
    const stepInfos: WorkflowRunStepInfos = {
      step1: { status: StepStatus.NOT_STARTED },
      step2: { status: StepStatus.NOT_STARTED },
    };

    const context = getWorkflowRunContext(stepInfos);

    expect(context).toEqual({});
  });
});
