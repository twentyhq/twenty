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
      step1: { res: 'value1', result: { res: 'value1' } },
      step2: { result: {} },
      step4: { res: 0, result: { res: 0 } },
      step5: { res: undefined, result: { res: undefined } },
    });
  });

  it('allows accessing step output via result property for backward compatibility', () => {
    const stepInfos: WorkflowRunStepInfos = {
      'code-step-001': {
        result: { memberName: 'Mike Chen', eventName: 'Gala' },
        status: StepStatus.SUCCESS,
      },
    };

    const context = getWorkflowRunContext(stepInfos);

    // Direct access (used by UI-generated variables)
    expect(
      (context['code-step-001'] as Record<string, unknown>)['memberName'],
    ).toBe('Mike Chen');

    // Access via result property (used by manually written variables)
    expect(
      (
        (context['code-step-001'] as Record<string, unknown>)[
          'result'
        ] as Record<string, unknown>
      )['memberName'],
    ).toBe('Mike Chen');
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
