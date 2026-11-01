import { WorkflowActionType } from 'twenty-shared/workflow';

import { WorkflowStepExecutorExceptionCode } from 'src/modules/workflow/workflow-executor/exceptions/workflow-step-executor.exception';
import { DelayWorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/delay/delay.workflow-action';

const NOW = new Date('2026-10-04T10:00:00.000Z');

const executeWithInput = (input: Record<string, unknown>) =>
  new DelayWorkflowAction().execute({
    currentStepId: 'step-id',
    steps: [
      {
        id: 'step-id',
        name: 'Delay',
        type: WorkflowActionType.DELAY,
        valid: true,
        settings: {
          input,
          outputSchema: {},
          errorHandlingOptions: {
            continueOnFailure: { value: false },
            retryOnFailure: { value: false },
          },
        },
      },
    ] as never,
    context: { trigger: { object: { waitHours: 'soon' } } },
    runInfo: { workflowRunId: 'run-id', workspaceId: 'workspace-id' },
  });

describe('DelayWorkflowAction', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(NOW);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('resumes after its duration', async () => {
    await expect(
      executeWithInput({
        delayType: 'DURATION',
        duration: { days: 1, hours: 2, minutes: 3, seconds: 4 },
      }),
    ).resolves.toEqual({
      wait: { type: 'TIME', resumeAt: '2026-10-05T12:03:04.000Z' },
    });
  });

  it('fails as an input error when its duration is not a number', async () => {
    await expect(
      executeWithInput({
        delayType: 'DURATION',
        duration: { hours: '{{trigger.object.waitHours}}' },
      }),
    ).rejects.toMatchObject({
      message: 'Duration must be made of non-negative numbers',
      code: WorkflowStepExecutorExceptionCode.INVALID_STEP_INPUT,
    });
  });

  it('refuses a duration too long to schedule', async () => {
    await expect(
      executeWithInput({ delayType: 'DURATION', duration: { days: 366 } }),
    ).rejects.toThrow('Duration cannot exceed one year');
  });
});
