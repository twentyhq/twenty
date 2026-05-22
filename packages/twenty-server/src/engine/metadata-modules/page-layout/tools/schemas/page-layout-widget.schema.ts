import { z } from 'zod';

import { widgetConfigurationPassthroughSchema } from 'src/engine/metadata-modules/page-layout/tools/schemas/widget-configuration-passthrough.schema';
import { widgetPositionSchema } from 'src/engine/metadata-modules/page-layout/tools/schemas/widget-position.schema';
import { widgetTypeSchema } from 'src/engine/metadata-modules/page-layout/tools/schemas/widget-type.schema';

export const pageLayoutWidgetSchema = z.object({
  title: z.string().describe('Widget title displayed in the header'),
  type: widgetTypeSchema.describe('Widget type'),
  position: widgetPositionSchema.describe(
    "Position within the tab. Pick the variant matching the tab's layoutMode (GRID for dashboards and most record pages, VERTICAL_LIST or CANVAS for record-page detail panes).",
  ),
  objectMetadataId: z
    .string()
    .uuid()
    .optional()
    .describe(
      'Object id (required for widgets that operate on a single object: FIELD, FIELDS, RECORD_TABLE, charts, etc.)',
    ),
  configuration: widgetConfigurationPassthroughSchema,
});
