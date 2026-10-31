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
      'TSX exporting a named Component that takes no props, with no default export. Load records with CoreApiClient from twenty-client-sdk/core, using the workspace object plural name and selecting edges.node, totalCount and pageInfo.hasNextPage. The query must match the preview query. Twenty adds the theme and defineFrontComponent registration. Use React and supported twenty-ui imports.',
    ),
  query: frontComponentQuerySchema.describe(
    'Object and fields mocked during preview. Saved components load their own data through the app SDK; this query is not persisted in their source.',
  ),
  sampleRecords: z.array(z.record(z.string(), z.unknown())).max(100),
});
