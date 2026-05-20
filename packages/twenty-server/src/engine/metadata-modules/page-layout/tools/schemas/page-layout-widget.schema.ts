import { PageLayoutTabLayoutMode } from 'twenty-shared/types';
import { z } from 'zod';

import { WidgetType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-type.enum';
import { PageLayoutType } from 'src/engine/metadata-modules/page-layout/enums/page-layout-type.enum';

export const pageLayoutTypeSchema = z.enum([
  PageLayoutType.RECORD_PAGE,
  PageLayoutType.RECORD_INDEX,
  PageLayoutType.STANDALONE_PAGE,
  PageLayoutType.DASHBOARD,
]);

export const pageLayoutTabLayoutModeSchema = z.enum(
  Object.values(PageLayoutTabLayoutMode) as [string, ...string[]],
);

export const widgetTypeSchema = z.enum(
  Object.values(WidgetType) as [string, ...string[]],
);

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

export type WidgetPositionInput = z.infer<typeof widgetPositionSchema>;

const DEFAULT_GRID_POSITION = {
  row: 0,
  column: 0,
  rowSpan: 12,
  columnSpan: 12,
} as const;

// The server's CreatePageLayoutWidgetInput.gridPosition is still required
// even when the tab layoutMode is VERTICAL_LIST or CANVAS. Match how the
// frontend stores widgets in those modes: a full-tab default grid box.
export const deriveGridPositionForWidget = (
  position: WidgetPositionInput,
): {
  row: number;
  column: number;
  rowSpan: number;
  columnSpan: number;
} => {
  if (position.layoutMode === PageLayoutTabLayoutMode.GRID) {
    return {
      row: position.row,
      column: position.column,
      rowSpan: position.rowSpan,
      columnSpan: position.columnSpan,
    };
  }

  return DEFAULT_GRID_POSITION;
};

// Widget configurations vary widely by widget type (19 variants in
// WidgetType, plus several configurationType sub-variants for GRAPH).
// The dashboard tool ships a strict discriminated union for the 5 chart-
// adjacent variants it supports. The page-layout tool accepts the broader
// space, so configuration is passed through as opaque JSON and validated
// by the workspace migration pipeline server-side.
export const widgetConfigurationPassthroughSchema = z
  .record(z.string(), z.unknown())
  .describe(
    `Widget configuration. Shape depends on the widget type. Common shapes:
- FIELD / FIELD_RICH_TEXT: { fieldMetadataId: '<uuid>' }
- FIELDS: { fieldMetadataIds: ['<uuid>', ...] }
- IFRAME: { configurationType: 'IFRAME', url: '<https-url>' }
- STANDALONE_RICH_TEXT: { configurationType: 'STANDALONE_RICH_TEXT', body: { ... } }
- VIEW / RECORD_TABLE: { configurationType: '<TYPE>', viewId: '<view-uuid>' }
- TIMELINE / TASKS / NOTES / FILES / EMAILS / CALENDAR / EMAIL_THREAD: {} (no configuration)
- WORKFLOW: { workflowId: '<uuid>' }
- WORKFLOW_VERSION: { workflowVersionId: '<uuid>' }
- WORKFLOW_RUN: { workflowRunId: '<uuid>' }
- Charts (AGGREGATE_CHART, BAR_CHART, LINE_CHART, PIE_CHART, GAUGE_CHART): see the dashboard tool reference.

If a configuration is invalid the server returns a descriptive error.`,
  );

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

export type PageLayoutWidgetInput = z.infer<typeof pageLayoutWidgetSchema>;
export type PageLayoutTabInput = z.infer<typeof pageLayoutTabInputSchema>;
