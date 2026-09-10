import { isDefined } from 'twenty-shared/utils';

import { type AiProviderConfig } from 'src/engine/metadata-modules/ai/ai-models/types/ai-provider-config.type';
import { type AiProviderModelConfig } from 'src/engine/metadata-modules/ai/ai-models/types/ai-provider-model-config.type';
import { type AiProvidersConfig } from 'src/engine/metadata-modules/ai/ai-models/types/ai-providers-config.type';

// A custom reading completes the catalog's rather than replacing it, so one
// effort or one metric set by hand keeps the others the sync measured.
const mergeDefined = <TValue extends Record<string, unknown>>(
  catalogValue: TValue | undefined,
  customValue: TValue | undefined,
): TValue | undefined =>
  isDefined(catalogValue) && isDefined(customValue)
    ? { ...catalogValue, ...customValue }
    : (customValue ?? catalogValue);

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

    if (!isDefined(catalogModel)) {
      return customModel;
    }

    return {
      ...catalogModel,
      ...customModel,
      benchmark: mergeDefined(catalogModel.benchmark, customModel.benchmark),
      benchmarkByEffort: mergeDefined(
        catalogModel.benchmarkByEffort,
        customModel.benchmarkByEffort,
      ),
    };
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
