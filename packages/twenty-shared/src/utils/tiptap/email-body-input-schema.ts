import { z } from 'zod';

import { emailDocumentSchema } from './email-document-schema';

// The format is part of the value: a body is never guessed from a string.
export const emailBodyInputSchema = z.discriminatedUnion('type', [
  emailDocumentSchema,
  z.object({ type: z.literal('html'), html: z.string() }),
  z.object({ type: z.literal('text'), text: z.string() }),
]);

export type EmailBodyInput = z.infer<typeof emailBodyInputSchema>;
