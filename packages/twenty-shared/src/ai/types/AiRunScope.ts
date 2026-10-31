import { type z } from 'zod';

import { type aiRunScopeSchema } from '@/workflow/schemas/ai-run-scope-schema';

export type AiRunScope = z.infer<typeof aiRunScopeSchema>;
