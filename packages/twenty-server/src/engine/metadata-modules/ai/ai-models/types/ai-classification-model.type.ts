import {
  type AiClassificationInput,
  type AiClassificationResult,
} from 'twenty-shared/ai';

export type AiClassificationModel = {
  classify: (
    input: Omit<AiClassificationInput, 'modelId'>,
  ) => Promise<Omit<AiClassificationResult, 'modelId'>>;
};
