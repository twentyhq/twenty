import { PageLayoutTabLayoutMode } from 'twenty-shared/types';
import { z } from 'zod';

// Widget position — canonical, discriminated union by layoutMode. This
// mirrors PageLayoutWidgetPosition in twenty-shared and is the field the
// codebase is migrating to. The legacy `gridPosition` GraphQL input is
// still required by the server DTO, so the tool derives one internally
// from the position payload (using a 12×12 default for non-GRID modes —
// matches how the frontend stores it).
export const widgetPositionSchema = z.discriminatedUnion('layoutMode', [
  z.object({
    layoutMode: z.literal(PageLayoutTabLayoutMode.GRID),
    row: z.number().int().min(0).describe('Row position (0-based)'),
    column: z
      .number()
      .int()
      .min(0)
      .max(11)
      .describe('Column position (0-11 for the 12-column grid)'),
    rowSpan: z
      .number()
      .int()
      .min(1)
      .describe('Number of rows the widget spans'),
    columnSpan: z
      .number()
      .int()
      .min(1)
      .max(12)
      .describe('Number of columns the widget spans (1-12)'),
  }),
  z.object({
    layoutMode: z.literal(PageLayoutTabLayoutMode.VERTICAL_LIST),
    index: z
      .number()
      .int()
      .min(0)
      .describe('Order in the vertical list (0-based)'),
  }),
  z.object({
    layoutMode: z.literal(PageLayoutTabLayoutMode.CANVAS),
  }),
]);
