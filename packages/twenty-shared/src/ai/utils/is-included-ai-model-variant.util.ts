import { isDefined } from '@/utils/validation/isDefined';

import { AI_MODEL_EFFORTS } from '../constants/ai-model-effort.const';
import { parseAiModelVariantId } from './parse-ai-model-variant-id.util';

export const isIncludedAiModelVariant = ({
  modelId,
  includedModelId,
}: {
  modelId: string;
  includedModelId: string;
}): boolean => {
  const variant = parseAiModelVariantId(modelId);
  const includedVariant = parseAiModelVariantId(includedModelId);

  if (variant.modelId !== includedVariant.modelId) {
    return false;
  }

  if (!isDefined(variant.effort) || !isDefined(includedVariant.effort)) {
    return variant.effort === includedVariant.effort;
  }

  return (
    AI_MODEL_EFFORTS.indexOf(variant.effort) <=
    AI_MODEL_EFFORTS.indexOf(includedVariant.effort)
  );
};
