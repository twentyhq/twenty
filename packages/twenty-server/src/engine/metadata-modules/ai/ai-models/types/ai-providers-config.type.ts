import { z } from 'zod';

import {
  aiProviderConfigSchema,
  type AiProviderConfig,
} from 'src/engine/metadata-modules/ai/ai-models/types/ai-provider-config.type';

export const aiProvidersConfigSchema = z.record(
  z.string(),
  aiProviderConfigSchema,
);

export type AiProvidersConfig = Record<string, AiProviderConfig>;
