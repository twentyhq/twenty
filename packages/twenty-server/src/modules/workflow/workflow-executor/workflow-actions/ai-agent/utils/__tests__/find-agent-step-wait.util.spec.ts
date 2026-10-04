import { findAgentStepWait } from 'src/modules/workflow/workflow-executor/workflow-actions/ai-agent/utils/find-agent-step-wait.util';

const WAIT = { type: 'EVENT', eventName: 'company.updated' };

const stepWithResults = (
  ...toolResults: { toolName: string; output: unknown }[]
) => ({ toolResults }) as never;

describe('findAgentStepWait', () => {
  it('finds the wait an execution ended on', () => {
    expect(
      findAgentStepWait([
        stepWithResults({
          toolName: 'wait_for_event',
          output: { success: true, result: { status: 'pending', wait: WAIT } },
        }),
      ]),
    ).toEqual(WAIT);
  });

  it('ignores a wait call made in an earlier step', () => {
    expect(
      findAgentStepWait([
        stepWithResults({
          toolName: 'wait_for_event',
          output: { success: true, result: { status: 'pending', wait: WAIT } },
        }),
        stepWithResults({ toolName: 'search', output: {} }),
      ]),
    ).toBeUndefined();
  });

  it('ignores pending calls of tools that are not waits', () => {
    expect(
      findAgentStepWait([
        stepWithResults({
          toolName: 'ask_question',
          output: { success: true, result: { status: 'pending', wait: WAIT } },
        }),
      ]),
    ).toBeUndefined();
  });

  it('ignores a wait call whose wait cannot be read', () => {
    expect(
      findAgentStepWait([
        stepWithResults({
          toolName: 'wait_for_duration',
          output: { success: true, result: { status: 'pending' } },
        }),
      ]),
    ).toBeUndefined();
  });
});
