import { type z } from 'zod';

import { type modelConfigurationSchema } from '@/ai/schemas/internal/model-configuration-schema';

export type ModelConfiguration = z.infer<typeof modelConfigurationSchema>;
