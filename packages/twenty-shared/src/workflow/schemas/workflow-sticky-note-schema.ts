import { z } from 'zod';

export const WORKFLOW_STICKY_NOTE_COLORS = [
  'yellow',
  'orange',
  'green',
  'blue',
  'purple',
  'pink',
  'gray',
] as const;

export const workflowStickyNoteSchema = z.object({
  id: z.string(),
  content: z.string(),
  position: z.object({ x: z.number(), y: z.number() }),
  size: z.object({
    width: z.number().positive(),
    height: z.number().positive(),
  }),
  color: z.enum(WORKFLOW_STICKY_NOTE_COLORS),
});

export type WorkflowStickyNote = z.infer<typeof workflowStickyNoteSchema>;
