import { getWorkflowAiAgentStepConfigIssues } from '@/workflow/utils/getWorkflowAiAgentStepConfigIssues';

describe('getWorkflowAiAgentStepConfigIssues', () => {
  it('accepts a step running an agent with only a conversation', () => {
    expect(
      getWorkflowAiAgentStepConfigIssues({
        stepKind: 'agent',
        input: {
          humanInputInstructions: 'Ask before choosing a plan.',
          conversation: { scope: 'RUN' },
        },
      }),
    ).toEqual([]);
  });

  it('refuses a step running an agent with its own config', () => {
    expect(
      getWorkflowAiAgentStepConfigIssues({
        stepKind: 'agent',
        input: { scope: {} },
      }),
    ).toEqual(['AGENT_STEP_HAS_INLINE_CONFIG']);
  });

  it('refuses a response format on a step running a reusable agent', () => {
    expect(
      getWorkflowAiAgentStepConfigIssues({
        stepKind: 'agent',
        input: { responseFormat: { type: 'text' } },
      }),
    ).toEqual(['AGENT_STEP_HAS_RESPONSE_FORMAT']);
  });

  it('accepts a response format on a step running its own hidden agent', () => {
    expect(
      getWorkflowAiAgentStepConfigIssues({
        stepKind: 'stepOwnedAgent',
        input: { responseFormat: { type: 'text' } },
      }),
    ).toEqual([]);
  });

  it('refuses a step without an agent that keeps a conversation', () => {
    expect(
      getWorkflowAiAgentStepConfigIssues({
        stepKind: 'generate',
        input: { instructions: 'Qualify', conversation: { scope: 'RUN' } },
      }),
    ).toEqual(['GENERATE_STEP_HAS_CONVERSATION_CONFIG']);
  });

  it('ignores blank human input instructions on a step without an agent', () => {
    expect(
      getWorkflowAiAgentStepConfigIssues({
        stepKind: 'generate',
        input: { instructions: 'Qualify', humanInputInstructions: '  ' },
      }),
    ).toEqual([]);
  });
});
