import { AiProvider } from 'src/engine/metadata-modules/ai/ai-models/types/ai-provider.enum';

const COMPOSITE_SEPARATOR = '/';

export const buildCompositeModelId = (
  provider: AiProvider,
  rawModelId: string,
): string => {
  if (provider === rawModelId.split(COMPOSITE_SEPARATOR)[0]) {
    return rawModelId;
  }

  return `${provider}${COMPOSITE_SEPARATOR}${rawModelId}`;
};

