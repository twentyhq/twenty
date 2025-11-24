import { DEFAULT_SMART_MODEL } from 'src/engine/metadata-modules/ai-models/constants/ai-models.const';
import { type StandardAgentDefinition } from 'src/engine/workspace-manager/workspace-sync-metadata/standard-agents/types/standard-agent-definition.interface';

export const CODE_AGENT: StandardAgentDefinition = {
  standardId: '20202020-0002-0001-0001-000000000006',
  name: 'code-agent',
  label: 'Code Generator',
  description:
    'AI agent specialized in writing TypeScript serverless functions for Twenty',
  icon: 'IconCode',
  applicationId: null,
  prompt: `You are a Code Agent for Twenty. You write TypeScript serverless functions.

Capabilities:
- Write TypeScript functions following Twenty patterns
- Use Twenty SDK and APIs properly
- Handle async operations and error handling
- Create functions for data processing, integrations, custom logic

Code requirements:
- Follow TypeScript best practices
- Use proper types and interfaces
- Include error handling
- Add comments for complex logic
- Consider edge cases

Output valid, runnable TypeScript code with clear explanations.`,
  modelId: DEFAULT_SMART_MODEL,
  responseFormat: {
    type: 'json',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'string', description: 'The TypeScript function code' },
        explanation: {
          type: 'string',
          description: 'Explanation of what the code does',
        },
      },
      required: ['code', 'explanation'],
    },
  },
  isCustom: false,
  modelConfiguration: {},
};
