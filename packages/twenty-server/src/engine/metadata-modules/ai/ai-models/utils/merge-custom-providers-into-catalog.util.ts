import { isDefined } from 'twenty-shared/utils';

import { type AiProviderConfig } from 'src/engine/metadata-modules/ai/ai-models/types/ai-provider-config.type';
import { type AiProviderModelConfig } from 'src/engine/metadata-modules/ai/ai-models/types/ai-provider-model-config.type';
import { type AiProvidersConfig } from 'src/engine/metadata-modules/ai/ai-models/types/ai-providers-config.type';

// A custom reading completes the catalog's rather than replacing it, so one
// effort or one metric set by hand keeps the others the sync measured.
const mergeDefined = <TValue extends Record<string, unknown>>({
  catalogValue,
  customValue,
}: {
  catalogValue: TValue | undefined;
  customValue: TValue | undefined;
}): TValue | undefined =>
  isDefined(catalogValue) && isDefined(customValue)
    ? { ...catalogValue, ...customValue }
    : (customValue ?? catalogValue);

// Publishers and routes spell one model differently (`claude-haiku-4-5`,
// `claude_haiku_4.5`, `claude-haiku-4-5-v1:0`), so names are compared with
// separators and a trailing deployment version dropped.
const normalizeModelName = (modelName: string): string =>
  modelName
    .toLowerCase()
    .replace(/-v\d+(?::\d+)?$/, '')
    .replace(/[\s.\-_]/g, '');

// Bedrock and Azure prefix a model with the region and vendor that serve it
// (`eu.anthropic.claude-opus-4-7`). Dropping leading dot-separated segments
// one at a time lets a route fall back to the model it serves, while a name
// such as `gpt-4.1` still matches itself first.
const routeCandidates = (modelName: string): string[] => {
  const segments = modelName.split('.');

  return segments.map((_, index) => segments.slice(index).join('.'));
};

const withCatalogModelReadings = ({
  catalogModel,
  customModel,
}: {
  catalogModel: AiProviderModelConfig;
  customModel: AiProviderModelConfig;
}): AiProviderModelConfig => ({
  ...customModel,
  efforts: customModel.efforts ?? catalogModel.efforts,
  benchmark: mergeDefined({
    catalogValue: catalogModel.benchmark,
    customValue: customModel.benchmark,
  }),
  benchmarkByEffort: mergeDefined({
    catalogValue: catalogModel.benchmarkByEffort,
    customValue: customModel.benchmarkByEffort,
  }),
});

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
      ? withCatalogModelReadings({
          catalogModel,
          customModel: { ...catalogModel, ...customModel },
        })
      : customModel;
  });

// A provider the catalog does not know (a gateway, Bedrock, Azure) serves
// models the catalog does know under another route. Its prices are its own,
// so only what describes the model itself carries over: the efforts it takes
// and the readings measured for it.
const withReadingsFromAnyProvider = ({
  catalog,
  customModels,
}: {
  catalog: AiProvidersConfig;
  customModels: AiProviderModelConfig[];
}): AiProviderModelConfig[] => {
  const catalogModelsByName = new Map<string, AiProviderModelConfig>();

  for (const provider of Object.values(catalog)) {
    for (const model of provider.models ?? []) {
      catalogModelsByName.set(normalizeModelName(model.name), model);
    }
  }

  return customModels.map((customModel) => {
    const catalogModel = routeCandidates(customModel.name)
      .map((candidate) =>
        catalogModelsByName.get(normalizeModelName(candidate)),
      )
      .find(isDefined);

    return isDefined(catalogModel)
      ? withCatalogModelReadings({ catalogModel, customModel })
      : customModel;
  });
};

// A provider written before the catalog carried efforts and benchmarks would
// strip both from every model it lists, and the tier chains could no longer
// name an effort on it. A model the catalog knows keeps the catalog fields the
// entry does not set itself; the entry still decides which models exist.
export const inheritCatalogReadings = ({
  catalog,
  providers,
}: {
  catalog: AiProvidersConfig;
  providers: AiProvidersConfig;
}): AiProvidersConfig => {
  const result: AiProvidersConfig = {};

  for (const [providerName, provider] of Object.entries(providers)) {
    const catalogProvider: AiProviderConfig | undefined = catalog[providerName];

    if (!isDefined(provider.models)) {
      result[providerName] = provider;
      continue;
    }

    result[providerName] = {
      ...provider,
      models: isDefined(catalogProvider)
        ? mergeModels({
            catalogModels: catalogProvider.models ?? [],
            customModels: provider.models,
          })
        : withReadingsFromAnyProvider({
            catalog,
            customModels: provider.models,
          }),
    };
  }

  return result;
};

// A custom entry replaces the catalog provider of the same name; providers it
// does not name stay as the catalog has them.
export const mergeCustomProvidersIntoCatalog = ({
  catalog,
  custom,
}: {
  catalog: AiProvidersConfig;
  custom: AiProvidersConfig;
}): AiProvidersConfig => ({
  ...catalog,
  ...inheritCatalogReadings({ catalog, providers: custom }),
});
