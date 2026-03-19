import { AiProvider } from 'src/engine/metadata-modules/ai/ai-models/types/ai-providers.types';

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

export const parseCompositeModelId = (
  compositeId: string,
): { providerPrefix: string; rawModelId: string } => {
  const separatorIndex = compositeId.indexOf(COMPOSITE_SEPARATOR);

  if (separatorIndex === -1) {
    return { providerPrefix: '', rawModelId: compositeId };
  }

  return {
    providerPrefix: compositeId.substring(0, separatorIndex),
    rawModelId: compositeId.substring(separatorIndex + 1),
  };
};
