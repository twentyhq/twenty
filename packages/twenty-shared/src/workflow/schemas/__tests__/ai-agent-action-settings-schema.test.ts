import { workflowAiAgentActionSettingsSchema } from '../ai-agent-action-settings-schema';

describe('workflowAiAgentActionSettingsSchema', () => {
  it('should keep the native tool configuration of an inline step', () => {
    const modelConfiguration = {
      webSearch: { enabled: true, configuration: { maxUses: 3 } },
      twitterSearch: { enabled: false, configuration: { region: 'FR' } },
    };

    const result = workflowAiAgentActionSettingsSchema.parse({
      input: {
        instructions: 'Summarize the company',
        modelConfiguration,
        prompt: 'Go',
      },
      outputSchema: {},
      errorHandlingOptions: {
        retryOnFailure: { value: 0 },
        continueOnFailure: { value: false },
      },
    });

    expect(result.input.modelConfiguration).toEqual(modelConfiguration);
  });
});
