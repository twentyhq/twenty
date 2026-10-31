import { getWorkflowAiAgentStepConfigIssues } from '@/workflow/utils/getWorkflowAiAgentStepConfigIssues';

describe('getWorkflowAiAgentStepConfigIssues', () => {
  it('accepts a step running an agent with only a conversation', () => {
    expect(
      getWorkflowAiAgentStepConfigIssues({
        hasAgent: true,
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
        hasAgent: true,
        input: { scope: {} },
      }),
    ).toEqual(['AGENT_STEP_HAS_INLINE_CONFIG']);
  });

  it('refuses a step without an agent that keeps a conversation', () => {
    expect(
      getWorkflowAiAgentStepConfigIssues({
        hasAgent: false,
        input: { instructions: 'Qualify', conversation: { scope: 'RUN' } },
      }),
    ).toEqual(['GENERATE_STEP_HAS_CONVERSATION_CONFIG']);
  });

  it('ignores blank human input instructions on a step without an agent', () => {
    expect(
      getWorkflowAiAgentStepConfigIssues({
        hasAgent: false,
        input: { instructions: 'Qualify', humanInputInstructions: '  ' },
      }),
    ).toEqual([]);
  });
});
