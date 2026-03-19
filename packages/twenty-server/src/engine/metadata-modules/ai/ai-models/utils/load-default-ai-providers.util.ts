import { type AiProvidersConfig } from 'src/engine/metadata-modules/ai/ai-models/types/ai-providers.types';

import defaultAiProviders from '../ai-providers.json';

export const loadDefaultAiProviders = (): AiProvidersConfig =>
  defaultAiProviders as unknown as AiProvidersConfig;
