import { isDefined } from 'twenty-shared/utils';

import { type AiProviderModelConfig } from 'src/engine/metadata-modules/ai/ai-models/types/ai-provider-model-config.type';
import { type AiProvidersConfig } from 'src/engine/metadata-modules/ai/ai-models/types/ai-providers-config.type';

const mergeProviderModels = (
  catalogModels: AiProviderModelConfig[] | undefined,
  customModels: AiProviderModelConfig[] | undefined,
): AiProviderModelConfig[] | undefined => {
  if (!isDefined(customModels)) {
    return catalogModels;
  }

  if (!isDefined(catalogModels)) {
    return customModels;
  }

  const customModelNames = new Set(customModels.map((model) => model.name));

  return [
    ...catalogModels.filter((model) => !customModelNames.has(model.name)),
    ...customModels,
  ];
};

export const mergeAiProvidersConfig = (
  catalog: AiProvidersConfig,
  custom: AiProvidersConfig,
): AiProvidersConfig => {
  const merged: AiProvidersConfig = { ...catalog };

  for (const [providerName, customProvider] of Object.entries(custom)) {
    const catalogProvider = merged[providerName];

    if (!isDefined(catalogProvider)) {
      merged[providerName] = customProvider;
      continue;
    }

    // A custom entry usually only carries credentials or an endpoint, so the
    // catalog models have to survive it instead of being replaced wholesale.
    const models = mergeProviderModels(
      catalogProvider.models,
      customProvider.models,
    );

    merged[providerName] = {
      ...catalogProvider,
      ...customProvider,
      ...(isDefined(models) ? { models } : {}),
    };
  }

  return merged;
};
