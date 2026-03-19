import { type AiProvidersConfig } from 'src/engine/metadata-modules/ai/ai-models/types/ai-providers.types';

import defaultAiProviders from '../ai-providers.json';

export const loadDefaultAiProviders = (): AiProvidersConfig => {
  const catalog = defaultAiProviders as unknown as AiProvidersConfig;

  for (const config of Object.values(catalog)) {
    for (const model of config.models ?? []) {
      model.source = 'catalog';
    }
  }

  return catalog;
};
