import { type AgentResponseFormat } from 'twenty-shared/ai';

import { computeAiAgentOutputSchema } from 'src/modules/workflow/workflow-builder/workflow-schema/utils/compute-ai-agent-output-schema.util';

describe('computeAiAgentOutputSchema', () => {
  it('returns no fields for a saved JSON format without properties', () => {
    const responseFormat = { type: 'json', schema: {} } as AgentResponseFormat;

    expect(computeAiAgentOutputSchema(responseFormat)).toEqual({});
  });
});
