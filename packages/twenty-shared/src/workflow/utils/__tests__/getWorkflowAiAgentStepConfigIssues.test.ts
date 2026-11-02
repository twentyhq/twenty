import { getWorkflowAiAgentStepConfigIssues } from '@/workflow/utils/getWorkflowAiAgentStepConfigIssues';

describe('getWorkflowAiAgentStepConfigIssues', () => {
  it('accepts a step running an agent with only a conversation', () => {
    expect(
      getWorkflowAiAgentStepConfigIssues({
        agentId: 'agent-id',
        humanInputInstructions: 'Ask before choosing a plan.',
        conversation: { scope: 'RUN' },
      }),
    ).toEqual([]);
  });

  it('refuses a step running an agent with its own config', () => {
    expect(
      getWorkflowAiAgentStepConfigIssues({ agentId: 'agent-id', scope: {} }),
    ).toEqual(['AGENT_STEP_HAS_INLINE_CONFIG']);
  });

  it('accepts a response format on a step running an agent', () => {
    expect(
      getWorkflowAiAgentStepConfigIssues({
        agentId: 'agent-id',
        responseFormat: { type: 'text' },
      }),
    ).toEqual([]);
  });

  it('refuses a step without an agent that keeps a conversation', () => {
    expect(
      getWorkflowAiAgentStepConfigIssues({
        instructions: 'Qualify',
        conversation: { scope: 'RUN' },
      }),
    ).toEqual(['GENERATE_STEP_HAS_CONVERSATION_CONFIG']);
  });

  it('ignores blank human input instructions on a step without an agent', () => {
    expect(
      getWorkflowAiAgentStepConfigIssues({
        instructions: 'Qualify',
        humanInputInstructions: '  ',
      }),
    ).toEqual([]);
  });

  it('ignores blank instructions on a step running an agent', () => {
    expect(
      getWorkflowAiAgentStepConfigIssues({
        agentId: 'agent-id',
        instructions: '  ',
        modelId: '',
      }),
    ).toEqual([]);
  });

  it.each([
    {
      repeated: 'an object',
      scope: {
        objectPermissions: [
          { objectUniversalIdentifier: 'person', canReadObjectRecords: true },
          { objectUniversalIdentifier: 'person', canReadObjectRecords: false },
        ],
      },
    },
    {
      repeated: 'a field',
      scope: {
        fieldPermissions: [
          {
            objectUniversalIdentifier: 'person',
            fieldUniversalIdentifier: 'person-email',
            canReadFieldValue: true,
          },
          {
            objectUniversalIdentifier: 'person',
            fieldUniversalIdentifier: 'person-email',
            canReadFieldValue: false,
          },
        ],
      },
    },
  ])(
    'refuses a step without an agent whose permissions repeat $repeated',
    ({ scope }) => {
      expect(
        getWorkflowAiAgentStepConfigIssues({ instructions: 'Qualify', scope }),
      ).toEqual(['GENERATE_STEP_SCOPE_HAS_REPEATED_ENTRIES']);
    },
  );
});
