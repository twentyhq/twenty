import { z } from 'zod';
import { PageLayoutType } from 'twenty-shared/types';

import { frontComponentQuerySchema } from 'src/engine/metadata-modules/ai/ai-front-component/schemas/front-component-query.schema';

export const frontComponentDraftSchema = z.object({
  previousDraftId: z.string().uuid().optional(),
  pageLayoutType: z.enum([
    PageLayoutType.DASHBOARD,
    PageLayoutType.RECORD_PAGE,
  ]),
  name: z.string().trim().min(1).max(100),
  source: z
    .string()
    .min(1)
    .max(50000)
    .describe(
      'TSX exporting a named Component function or const, with no default export. Twenty adds the theme, componentQuery and SDK registration. Use React and supported twenty-ui imports.',
    ),
  query: frontComponentQuerySchema,
  sampleRecords: z.array(z.record(z.string(), z.unknown())).max(100),
});
