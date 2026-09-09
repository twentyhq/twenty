import { type AiModelEffort, isAiModelEffort } from 'twenty-shared/ai';

const EFFORT_SEPARATOR = '@';

export const buildModelVariantId = (
  modelId: string,
  effort: AiModelEffort,
): string => `${modelId}${EFFORT_SEPARATOR}${effort}`;

// Catalog model names never contain `@` (Bedrock ids use `:`), so the last one
// delimits the effort. Any other suffix is part of the id itself.
export const parseModelVariantId = (
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
