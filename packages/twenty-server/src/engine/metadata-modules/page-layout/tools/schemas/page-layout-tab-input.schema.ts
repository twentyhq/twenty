import { z } from 'zod';

import { pageLayoutTabLayoutModeSchema } from 'src/engine/metadata-modules/page-layout/tools/schemas/page-layout-tab-layout-mode.schema';
import { pageLayoutWidgetSchema } from 'src/engine/metadata-modules/page-layout/tools/schemas/page-layout-widget.schema';

export const pageLayoutTabInputSchema = z.object({
  title: z.string().describe('Tab title'),
  icon: z.string().optional().describe('Optional icon identifier'),
  layoutMode: pageLayoutTabLayoutModeSchema
    .optional()
    .describe('Layout mode (GRID by default)'),
  position: z
    .number()
    .optional()
    .describe('Position among tabs (defaults to the end)'),
  widgets: z
    .array(pageLayoutWidgetSchema)
    .optional()
    .default([])
    .describe('Widgets to add to this tab'),
});
