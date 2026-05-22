import { z } from 'zod';

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
