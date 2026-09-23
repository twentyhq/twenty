import { z } from 'zod';

import { aiProviderConfigSchema } from 'src/engine/metadata-modules/ai/ai-models/types/ai-provider-config.schema';

// twenty-infra checks each stored catalog against this export, taken from the
// version an environment runs, before uploading it, so it has to stay here.
export const aiProvidersConfigSchema = z.record(
  z.string(),
  aiProviderConfigSchema,
);
