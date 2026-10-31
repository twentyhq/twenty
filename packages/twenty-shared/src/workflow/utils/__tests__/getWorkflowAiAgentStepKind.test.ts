import { getWorkflowAiAgentStepKind } from '@/workflow/utils/getWorkflowAiAgentStepKind';

describe('getWorkflowAiAgentStepKind', () => {
  it('reads a step without an agent as a Generate step', () => {
    expect(getWorkflowAiAgentStepKind({ agentId: '' })).toBe('generate');
  });

  it('reads a step running a reusable agent as an agent step', () => {
    expect(
      getWorkflowAiAgentStepKind({ agentId: 'agent-id' }, { isSystem: false }),
    ).toBe('agent');
  });

  it('reads a step running its hidden agent as a step-owned agent step', () => {
    expect(
      getWorkflowAiAgentStepKind({ agentId: 'agent-id' }, { isSystem: true }),
    ).toBe('stepOwnedAgent');
  });

  it('reads a step whose agent is not loaded as an agent step', () => {
    expect(getWorkflowAiAgentStepKind({ agentId: 'agent-id' }, null)).toBe(
      'agent',
    );
  });
});
