import { type z } from 'zod';

import { type richTextDocumentSchema } from './rich-text-document-schema';

export type RichTextDocument = z.infer<typeof richTextDocumentSchema>;
