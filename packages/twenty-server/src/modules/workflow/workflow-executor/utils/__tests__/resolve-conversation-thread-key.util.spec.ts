import { resolveConversationThreadKey } from 'src/modules/workflow/workflow-executor/utils/resolve-conversation-thread-key.util';

const RUN_ID = 'run-1';
const STEP_EXECUTION_KEY = 'step-1:iterator=2';

describe('resolveConversationThreadKey', () => {
  it('falls back to the default scope when the step sets none', () => {
    expect(
      resolveConversationThreadKey({
        conversation: undefined,
        defaultScope: 'RUN',
        workflowRunId: RUN_ID,
        stepExecutionKey: STEP_EXECUTION_KEY,
      }),
    ).toBe(RUN_ID);

    expect(
      resolveConversationThreadKey({
        conversation: undefined,
        defaultScope: 'STEP',
        workflowRunId: RUN_ID,
        stepExecutionKey: STEP_EXECUTION_KEY,
      }),
    ).toBe(`${RUN_ID}:${STEP_EXECUTION_KEY}`);
  });

  it('keeps a run conversation separate from each execution of a step', () => {
    const runKey = resolveConversationThreadKey({
      conversation: { scope: 'RUN' },
      defaultScope: 'STEP',
      workflowRunId: RUN_ID,
      stepExecutionKey: STEP_EXECUTION_KEY,
    });
    const stepKey = resolveConversationThreadKey({
      conversation: { scope: 'STEP' },
      defaultScope: 'RUN',
      workflowRunId: RUN_ID,
      stepExecutionKey: STEP_EXECUTION_KEY,
    });

    expect(runKey).not.toBe(stepKey);
  });

  it('uses a trimmed custom key that cannot equal a run conversation', () => {
    expect(
      resolveConversationThreadKey({
        conversation: { scope: 'KEY', key: `  ${RUN_ID} ` },
        defaultScope: 'RUN',
        workflowRunId: RUN_ID,
        stepExecutionKey: STEP_EXECUTION_KEY,
      }),
    ).toBe(`key:${RUN_ID}`);
  });

  it('refuses a key scope without a key', () => {
    expect(() =>
      resolveConversationThreadKey({
        conversation: { scope: 'KEY', key: '  ' },
        defaultScope: 'RUN',
        workflowRunId: RUN_ID,
        stepExecutionKey: STEP_EXECUTION_KEY,
      }),
    ).toThrow('A conversation key is required');
  });
});
