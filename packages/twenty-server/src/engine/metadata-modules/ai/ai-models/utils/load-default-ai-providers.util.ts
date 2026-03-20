import { type AiProvidersConfig } from 'src/engine/metadata-modules/ai/ai-models/types/ai-providers-config.type';

import defaultAiProviders from '../ai-providers.json';

export const loadDefaultAiProviders = (): AiProvidersConfig => {
  const catalog = defaultAiProviders as unknown as AiProvidersConfig;

  for (const [key, config] of Object.entries(catalog)) {
    config.name = key;

    for (const model of config.models ?? []) {
      model.source = 'catalog';
    }
  }

  return catalog;
};
