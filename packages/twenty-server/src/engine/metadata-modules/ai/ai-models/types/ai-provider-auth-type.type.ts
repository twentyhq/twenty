import { z } from 'zod';

import { aiProviderAuthTypeSchema } from 'src/engine/metadata-modules/ai/ai-models/types/ai-provider-auth-type.schema';

export type AiProviderAuthType = z.infer<typeof aiProviderAuthTypeSchema>;
