import { isDefined } from 'twenty-shared/utils';

import { type AiProviderConfig } from 'src/engine/metadata-modules/ai/ai-models/types/ai-provider-config.type';
import { type AiProviderModelConfig } from 'src/engine/metadata-modules/ai/ai-models/types/ai-provider-model-config.type';
import { type AiProvidersConfig } from 'src/engine/metadata-modules/ai/ai-models/types/ai-providers-config.type';

const mergeModels = ({
  catalogModels,
  customModels,
}: {
  catalogModels: AiProviderModelConfig[];
  customModels: AiProviderModelConfig[];
}): AiProviderModelConfig[] =>
  customModels.map((customModel) => {
    const catalogModel = catalogModels.find(
      (model) => model.name === customModel.name,
    );

    return isDefined(catalogModel)
      ? { ...catalogModel, ...customModel }
      : customModel;
  });

// A custom entry replaces the catalog provider of the same name, but an entry
// written before the catalog carried efforts and benchmarks would then strip
// both from every model it lists, and the tier chains could no longer name
// an effort on it. A model the catalog knows keeps the catalog fields it does
// not set itself; the custom entry still decides which models exist.
export const mergeCustomProvidersIntoCatalog = ({
  catalog,
  custom,
}: {
  catalog: AiProvidersConfig;
  custom: AiProvidersConfig;
}): AiProvidersConfig => {
  const merged: AiProvidersConfig = { ...catalog };

  for (const [providerName, customProvider] of Object.entries(custom)) {
    const catalogProvider: AiProviderConfig | undefined = catalog[providerName];

    merged[providerName] =
      isDefined(catalogProvider) && isDefined(customProvider.models)
        ? {
            ...customProvider,
            models: mergeModels({
              catalogModels: catalogProvider.models ?? [],
              customModels: customProvider.models,
            }),
          }
        : customProvider;
  }

  return merged;
};
