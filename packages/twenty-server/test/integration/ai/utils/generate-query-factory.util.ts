import gql from 'graphql-tag';
import { TEST_AI_MODEL_ID } from 'test/integration/constants/test-ai-model-ids.constants';
import { type GenerateMutationInput } from 'twenty-shared/application';

export const generateQueryFactory = (
  input: Omit<GenerateMutationInput, 'modelId'>,
) => ({
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
