import { type z } from 'zod';

import { type aiRunScopeSchema } from '@/ai/schemas/ai-run-scope-schema';

export type AiRunScope = z.infer<typeof aiRunScopeSchema>;
