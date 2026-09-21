import { isNonEmptyString } from '@sniptt/guards';
import { JEV_MODEL_ID } from 'twenty-shared/ai';

import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';

export const resolveJevEvaluationModelId = ({
  requestedModelId,
  isModelAvailable,
}: {
  requestedModelId?: string;
  isModelAvailable: boolean;
}): string => {
  if (isNonEmptyString(requestedModelId) && requestedModelId !== JEV_MODEL_ID) {
    throw new AiException(
      'Classify only supports Jev. Remove the saved model override from this step.',
      AiExceptionCode.EVALUATION_MODEL_NOT_FOUND,
    );
  }

  if (!isModelAvailable) {
    throw new AiException(
      'Jev is unavailable. Configure the TypeSafe AI API key and enable Jev before running Classify.',
      AiExceptionCode.EVALUATION_MODEL_NOT_FOUND,
    );
  }

  return JEV_MODEL_ID;
};
