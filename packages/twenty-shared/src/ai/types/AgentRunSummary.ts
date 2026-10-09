import type z from 'zod';

import { type agentRunSummarySchema } from '@/ai/schemas/agent-run-summary-schema';

export type AgentRunSummary = z.infer<typeof agentRunSummarySchema>;
