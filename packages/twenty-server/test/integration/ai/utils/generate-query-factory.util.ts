import gql from 'graphql-tag';
import { TEST_AI_MODEL_ID } from 'test/integration/constants/test-ai-model-ids.constants';
import { type RunAgentMessage } from 'twenty-shared/application';

import { type GenerateInputDTO } from 'src/engine/metadata-modules/ai/ai-agent-execution/dtos/generate.input';

export type GenerateTestInput = Omit<GenerateInputDTO, 'input' | 'modelId'> & {
  input: RunAgentMessage[];
};

export const generateQueryFactory = (input: GenerateTestInput) => ({
  query: gql`
    mutation Generate($input: GenerateInput!) {
      generate(input: $input) {
        success
        text
        object
        error
        runId
        usage {
          inputTokens
          outputTokens
        }
      }
    }
  `,
  variables: { input: { ...input, modelId: TEST_AI_MODEL_ID } },
});
