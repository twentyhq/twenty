import { z } from 'zod';

export const proposeToolCallInputSchema = z.object({
  toolName: z
    .string()
    .trim()
    .min(1)
    .describe(
      'The name of the tool to run once approved, as you would call it yourself.',
    ),
  arguments: z
    .record(z.string(), z.unknown())
    .describe(
      "The tool's arguments, matching its input schema. Call learn_tools first if you have not seen the schema.",
    ),
  summary: z
    .string()
    .trim()
    .min(1)
    .describe(
      'One sentence on what the call does and why, shown to the person deciding (e.g. "Raise the Acme renewal to 120k based on the signed quote").',
    ),
});
