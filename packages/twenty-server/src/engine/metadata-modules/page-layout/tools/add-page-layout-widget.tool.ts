import { z } from 'zod';

import { type CreatePageLayoutWidgetInput } from 'src/engine/metadata-modules/page-layout-widget/dtos/inputs/create-page-layout-widget.input';
import {
  deriveGridPositionForWidget,
  widgetConfigurationPassthroughSchema,
  widgetPositionSchema,
  widgetTypeSchema,
} from 'src/engine/metadata-modules/page-layout/tools/schemas/page-layout-widget.schema';
import {
  type PageLayoutToolContext,
  type PageLayoutToolDependencies,
} from 'src/engine/metadata-modules/page-layout/tools/types/page-layout-tool-dependencies.type';

const addPageLayoutWidgetSchema = z.object({
  pageLayoutTabId: z
    .string()
    .uuid()
    .describe('Id of the tab the widget will live on'),
  title: z.string().describe('Widget title displayed in the header'),
  type: widgetTypeSchema.describe(
    'Widget type. Common picks for record pages: FIELD, FIELDS, RECORD_TABLE, TIMELINE, NOTES, TASKS, FILES, EMAILS, CALENDAR, IFRAME, STANDALONE_RICH_TEXT, FIELD_RICH_TEXT.',
  ),
  position: widgetPositionSchema,
  objectMetadataId: z
    .string()
    .uuid()
    .optional()
    .describe(
      'Required for widgets that operate on an object (FIELD, FIELDS, RECORD_TABLE, charts, etc.).',
    ),
  configuration: widgetConfigurationPassthroughSchema,
});

type AddPageLayoutWidgetParams = z.infer<typeof addPageLayoutWidgetSchema>;

export const createAddPageLayoutWidgetTool = (
  deps: Pick<PageLayoutToolDependencies, 'pageLayoutWidgetService'>,
  context: PageLayoutToolContext,
) => ({
  name: 'add_page_layout_widget' as const,
  description: `Add a single widget to an existing page layout tab.

Common widget recipes:
- FIELD: show one field on the record. configuration: { fieldMetadataId: '<uuid>' }
- FIELDS: show many fields. configuration: { fieldMetadataIds: ['<uuid>', ...] }
- TIMELINE / TASKS / NOTES / FILES / EMAILS / CALENDAR / EMAIL_THREAD: configuration: {} (rendered from the record's relations).
- IFRAME: configuration: { configurationType: 'IFRAME', url: 'https://...' }
- STANDALONE_RICH_TEXT: configuration: { configurationType: 'STANDALONE_RICH_TEXT', body: { ... } }
- RECORD_TABLE: configuration: { configurationType: 'RECORD_TABLE', viewId: '<view-uuid>' } (create a dedicated view first with create_view)
- WORKFLOW / WORKFLOW_VERSION / WORKFLOW_RUN: configuration: { workflowId | workflowVersionId | workflowRunId: '<uuid>' }
For chart-style widgets (GRAPH variants) prefer create_complete_dashboard or the existing dashboard tools, which carry full schema validation.`,
  inputSchema: addPageLayoutWidgetSchema,
  execute: async (parameters: AddPageLayoutWidgetParams) => {
    try {
      const widget = await deps.pageLayoutWidgetService.create({
        input: {
          pageLayoutTabId: parameters.pageLayoutTabId,
          title: parameters.title,
          type: parameters.type,
          gridPosition: deriveGridPositionForWidget(parameters.position),
          position: parameters.position,
          objectMetadataId: parameters.objectMetadataId ?? null,
          configuration: parameters.configuration,
        } as unknown as CreatePageLayoutWidgetInput,
        workspaceId: context.workspaceId,
      });

      return {
        success: true,
        message: `Widget "${widget.title}" added`,
        result: {
          widgetId: widget.id,
          title: widget.title,
          type: widget.type,
          pageLayoutTabId: parameters.pageLayoutTabId,
        },
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      return {
        success: false,
        message: `Failed to add widget: ${message}`,
        error: message,
      };
    }
  },
});
