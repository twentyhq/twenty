import { type z } from 'zod';

export type WorkflowTool = {
  name: string;
  description: string;
  inputSchema: z.ZodType;
  execute: (parameters: never) => Promise<unknown>;
  isDestructive?: boolean;
  isReadOnly?: boolean;
};
