import { StepStatus, type WorkflowRunStepInfos } from 'twenty-shared/workflow';

import { findStepIdByThreadId } from 'src/modules/workflow/workflow-runner/utils/find-step-id-by-thread-id.util';

describe('findStepIdByThreadId', () => {
  const stepInfos: WorkflowRunStepInfos = {
    trigger: { status: StepStatus.SUCCESS },
    'agent-1': { status: StepStatus.PENDING, threadId: 'thread-1' },
    'agent-2': {
      status: StepStatus.PENDING,
      threadId: 'thread-3',
      history: [
        { status: StepStatus.FAILED, retryAttempt: 1, threadId: 'thread-2' },
      ],
    },
  };

  it('returns the step whose current execution recorded the thread', () => {
    expect(findStepIdByThreadId({ stepInfos, threadId: 'thread-1' })).toBe(
      'agent-1',
    );
    expect(findStepIdByThreadId({ stepInfos, threadId: 'thread-3' })).toBe(
      'agent-2',
    );
  });

  it('returns nothing for a thread a retry has replaced', () => {
    expect(
      findStepIdByThreadId({ stepInfos, threadId: 'thread-2' }),
    ).toBeUndefined();
  });

  it('returns nothing for a thread no step recorded', () => {
    expect(
      findStepIdByThreadId({ stepInfos, threadId: 'unknown' }),
    ).toBeUndefined();
  });
});
