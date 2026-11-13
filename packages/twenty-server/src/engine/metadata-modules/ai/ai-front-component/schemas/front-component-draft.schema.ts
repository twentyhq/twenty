import { z } from 'zod';
import { PageLayoutType } from 'twenty-shared/types';

import { frontComponentQuerySchema } from 'src/engine/metadata-modules/ai/ai-front-component/schemas/front-component-query.schema';

export const frontComponentDraftSchema = z
  .object({
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
        'TSX exporting a named Component that takes no props, with no default export. Load records with CoreApiClient from twenty-client-sdk/core, using an object selection keyed by the workspace object plural name and selecting edges.node, totalCount and pageInfo.hasNextPage. Read the result directly by that plural name, without a data wrapper. The query must match the preview query. For record-page widgets, import useSelectedRecordIds and useSelectedObjectMetadata from twenty-sdk/front-component to read the viewed record and its object. Filter the SDK query by the selected record ID, handle an empty selection and reload when it changes. Preview selects the first sample record; dashboards have no selection. Never hardcode a record ID. Twenty adds the theme and defineFrontComponent registration. Use React and supported twenty-ui imports.',
      ),
    query: frontComponentQuerySchema.describe(
      'Object and fields mocked during preview. Saved components load their own data through the app SDK; this query is not persisted in their source.',
    ),
    sampleRecords: z
      .array(z.record(z.string(), z.unknown()))
      .min(1)
      .max(100)
      .describe(
        'Provide realistic fictional records for preview, including every selected field with its metadata type. For a record-page widget, the first record must include a fictional UUID id and represents the viewed record. Use varied values so filters, sorting and summary counts can be exercised. These records are only used in preview, never saved as workspace records or embedded in the component source.',
      ),
  })
  .superRefine((input, context) => {
    if (
      input.pageLayoutType === PageLayoutType.RECORD_PAGE &&
      !z.uuid().safeParse(input.sampleRecords[0]?.id).success
    ) {
      context.addIssue({
        code: 'custom',
        path: ['sampleRecords', 0, 'id'],
        message:
          'The first sample record needs a fictional UUID id for record-page preview.',
      });
    }
  });
