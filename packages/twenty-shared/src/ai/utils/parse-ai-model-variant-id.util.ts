import { type AiModelEffort } from '../constants/ai-model-effort.const';
import { isAiModelEffort } from './is-ai-model-effort.util';

const EFFORT_SEPARATOR = '@';

// Catalog model names never contain `@` (Bedrock ids use `:`), so the last one
// delimits the effort. Any other suffix is part of the id itself.
export const parseAiModelVariantId = (
  modelId: string,
): { modelId: string; effort?: AiModelEffort } => {
  const separatorIndex = modelId.lastIndexOf(EFFORT_SEPARATOR);

  if (separatorIndex === -1) {
    return { modelId };
  }

  const effort = modelId.slice(separatorIndex + 1);

  if (!isAiModelEffort(effort)) {
    return { modelId };
  }

  return { modelId: modelId.slice(0, separatorIndex), effort };
};
