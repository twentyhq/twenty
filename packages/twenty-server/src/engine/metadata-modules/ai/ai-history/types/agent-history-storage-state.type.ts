import { z } from 'zod';
import { AGENT_HISTORY_OBJECT_NAMES } from 'src/engine/metadata-modules/ai/ai-history/constants/agent-history-object-names.constant';

export const agentHistoryStorageStateSchema = z
  .object({
    storage: z.enum(['core', 'workspace']),
    migration: z
      .object({
        phase: z.enum(['clearing', 'copying', 'aborting']),
        target: z.enum(['core', 'workspace']),
        tableIndex: z
          .number()
          .int()
          .min(0)
          .max(AGENT_HISTORY_OBJECT_NAMES.length),
        lastId: z.string().uuid().nullable(),
      })
      .optional(),
    verifiedAt: z.string().datetime().optional(),
    cleanedAt: z.string().datetime().optional(),
  })
  .refine(
    (state) => !state.migration || state.migration.target !== state.storage,
  );

export type AgentHistoryStorageState = z.infer<
  typeof agentHistoryStorageStateSchema
>;
