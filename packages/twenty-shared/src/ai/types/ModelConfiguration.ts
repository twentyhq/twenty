import { type z } from 'zod';

import { type modelConfigurationSchema } from '@/workflow/schemas/model-configuration-schema';

export type ModelConfiguration = z.infer<typeof modelConfigurationSchema>;
