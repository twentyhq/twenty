import { z } from 'zod';

import { AI_SDK_PACKAGES, DATA_RESIDENCY_KEYS } from 'twenty-shared/ai';

import { aiProviderAuthTypeSchema } from 'src/engine/metadata-modules/ai/ai-models/types/ai-provider-auth-type.schema';
import { aiProviderModelConfigSchema } from 'src/engine/metadata-modules/ai/ai-models/types/ai-provider-model-config.schema';

export const aiProviderConfigSchema = z
  .object({
    npm: z.enum(AI_SDK_PACKAGES).optional(),
    evaluationAdapter: z.literal('typesafe').optional(),
    name: z.string().optional(),
    label: z.string().optional(),
    authType: aiProviderAuthTypeSchema.optional(),
    apiKey: z.string().optional(),
    baseUrl: z.string().optional(),
    region: z.string().optional(),
    dataResidency: z.enum(DATA_RESIDENCY_KEYS).optional(),
    accessKeyId: z.string().optional(),
    secretAccessKey: z.string().optional(),
    sessionToken: z.string().optional(),
    models: z.array(aiProviderModelConfigSchema).optional(),
  })
  .superRefine((provider, context) => {
    const isEvaluation = provider.evaluationAdapter === 'typesafe';

    if (isEvaluation === Boolean(provider.npm)) {
      context.addIssue({
        code: 'custom',
        message: 'Configure exactly one of npm or evaluationAdapter',
      });
    }

    if (
      isEvaluation &&
      (provider.baseUrl ||
        provider.authType ||
        provider.accessKeyId ||
        provider.secretAccessKey ||
        provider.sessionToken ||
        provider.region)
    ) {
      context.addIssue({
        code: 'custom',
        message:
          'TypeSafe uses its fixed API endpoint and API key authentication',
      });
    }

    if (
      provider.models?.some(
        (model) => (model.kind === 'evaluation') !== isEvaluation,
      )
    ) {
      context.addIssue({
        code: 'custom',
        message: 'Model kind must match the provider adapter',
      });
    }
  });
