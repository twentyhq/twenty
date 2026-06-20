import { z } from 'zod';

export const workflowStickyNoteSchema = z.object({
  id: z.string(),
  content: z.string(),
  position: z.object({ x: z.number(), y: z.number() }),
  size: z.object({ width: z.number(), height: z.number() }),
  color: z.string(),
});

export type WorkflowStickyNote = z.infer<typeof workflowStickyNoteSchema>;
