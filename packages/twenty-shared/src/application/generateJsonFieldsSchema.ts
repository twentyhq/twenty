import { z } from 'zod';

import { aiRunScopeSchema } from '@/ai/schemas/internal/ai-run-scope-schema';
import { agentResponseFormatSchema } from '@/workflow/schemas/agent-response-format-schema';

// the generate mutation takes these as JSON, so GraphQL cannot validate them
export const generateJsonFieldsSchema = z.object({
  responseFormat: agentResponseFormatSchema.nullish(),
  // no data tools when unset
  scope: aiRunScopeSchema.nullish(),
});
