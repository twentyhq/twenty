import { JEV_MODEL_ID } from 'twenty-shared/ai';

import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';

export const resolveJevEvaluationModelIdOrThrow = ({
  isModelAvailable,
}: {
  isModelAvailable: boolean;
}): string => {
  if (!isModelAvailable) {
    throw new AiException(
      'Jev is unavailable. Configure the TypeSafe AI API key and enable Jev before running Classify.',
      AiExceptionCode.EVALUATION_MODEL_NOT_FOUND,
    );
  }

  return JEV_MODEL_ID;
};
