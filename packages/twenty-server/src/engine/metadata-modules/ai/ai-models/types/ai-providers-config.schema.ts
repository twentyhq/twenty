import { z } from 'zod';

import { AI_SDK_PACKAGES, DATA_RESIDENCY_KEYS } from 'twenty-shared/ai';

import { ModelFamily } from 'src/engine/metadata-modules/ai/ai-models/types/model-family.enum';

const longContextCostSchema = z.object({
  inputCostPerMillionTokens: z.number(),
  outputCostPerMillionTokens: z.number(),
  cachedInputCostPerMillionTokens: z.number().optional(),
  cacheCreationCostPerMillionTokens: z.number().optional(),
  thresholdTokens: z.number(),
});

const aiProviderModelConfigSchema = z.object({
  name: z.string(),
  label: z.string(),
  description: z.string().optional(),
  modelFamily: z.nativeEnum(ModelFamily).optional(),
  inputCostPerMillionTokens: z.number().optional(),
  outputCostPerMillionTokens: z.number().optional(),
  cachedInputCostPerMillionTokens: z.number().optional(),
  cacheCreationCostPerMillionTokens: z.number().optional(),
  longContextCost: longContextCostSchema.optional(),
  contextWindowTokens: z.number().optional(),
  maxOutputTokens: z.number().optional(),
  modalities: z.array(z.string()).optional(),
  supportsReasoning: z.boolean().optional(),
  isDeprecated: z.boolean().optional(),
});

const aiProviderConfigSchema = z.object({
  npm: z.enum(AI_SDK_PACKAGES),
  name: z.string().optional(),
  label: z.string().optional(),
  authType: z.enum(['key', 'credentials', 'role']).optional(),
  apiKey: z.string().optional(),
  baseUrl: z.string().optional(),
  region: z.string().optional(),
  dataResidency: z.enum(DATA_RESIDENCY_KEYS).optional(),
  accessKeyId: z.string().optional(),
  secretAccessKey: z.string().optional(),
  sessionToken: z.string().optional(),
  models: z.array(aiProviderModelConfigSchema).optional(),
});

export const aiProvidersConfigSchema = z.record(
  z.string(),
  aiProviderConfigSchema,
);
