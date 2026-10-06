import { findAgentStepWait } from 'src/modules/workflow/workflow-executor/workflow-actions/ai-agent/utils/find-agent-step-wait.util';

const WAIT = { type: 'EVENT', eventName: 'company.updated' };

describe('findAgentStepWait', () => {
  it('finds the wait a run paused on', () => {
    expect(
      findAgentStepWait([
        {
          toolName: 'wait_for_event',
          output: { success: true, result: { status: 'pending', wait: WAIT } },
        },
      ]),
    ).toEqual(WAIT);
  });

  it('ignores pending calls of tools that are not waits', () => {
    expect(
      findAgentStepWait([
        {
          toolName: 'ask_question',
          output: { success: true, result: { status: 'pending', wait: WAIT } },
        },
      ]),
    ).toBeUndefined();
  });

  it('ignores a wait call that no longer waits', () => {
    expect(
      findAgentStepWait([
        {
          toolName: 'wait_for_event',
          output: {
            success: true,
            result: { status: 'completed', wait: WAIT },
          },
        },
      ]),
    ).toBeUndefined();
  });

  it('ignores a wait call whose wait cannot be read', () => {
    expect(
      findAgentStepWait([
        {
          toolName: 'wait_for_duration',
          output: { success: true, result: { status: 'pending' } },
        },
      ]),
    ).toBeUndefined();
  });
});
