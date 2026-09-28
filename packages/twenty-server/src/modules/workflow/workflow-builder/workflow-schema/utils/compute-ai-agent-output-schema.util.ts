import { type AgentResponseFormat } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';
import { type BaseOutputSchemaV2 } from 'twenty-shared/workflow';

import { generateFakeValue } from 'src/engine/utils/generate-fake-value';

export const computeAiAgentOutputSchema = (
  responseFormat?: AgentResponseFormat | null,
): BaseOutputSchemaV2 => {
  if (responseFormat?.type !== 'json') {
    return {
      response: {
        label: 'Response',
        isLeaf: true,
        type: 'string',
        value: 'Response of the agent',
      },
    };
  }

  return Object.fromEntries(
    Object.entries(responseFormat.schema.properties).map(([name, property]) => [
      name,
      {
        isLeaf: true,
        type: property.type,
        label: name,
        ...(isDefined(property.description)
          ? { description: property.description }
          : {}),
        value: generateFakeValue(property.type),
      },
    ]),
  );
};
