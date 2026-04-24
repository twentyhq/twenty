import { z } from 'zod';

import { type CreatePageLayoutWidgetInput } from 'src/engine/metadata-modules/page-layout-widget/dtos/inputs/create-page-layout-widget.input';
import {
  positionSchema,
  widgetConfigurationSchema,
  widgetTypeSchema,
} from 'src/modules/dashboard/tools/schemas/widget.schema';
import {
  type DashboardToolContext,
  type DashboardToolDependencies,
} from 'src/modules/dashboard/tools/types/dashboard-tool-dependencies.type';

const addDashboardWidgetSchema = z.object({
  pageLayoutTabId: z.string().uuid().describe('Tab UUID from get_dashboard'),
  title: z.string().describe('Widget title'),
  type: widgetTypeSchema.describe('Widget type'),
  position: positionSchema.describe(
    'Position in 12-column grid (layoutMode must be "GRID")',
  ),
  objectMetadataId: z
    .string()
    .uuid()
    .optional()
    .describe(
      'Required for GRAPH and RECORD_TABLE widgets: object UUID to aggregate or display',
    ),
  configuration: widgetConfigurationSchema,
});

export const createAddDashboardWidgetTool = (
  deps: Pick<DashboardToolDependencies, 'pageLayoutWidgetService'>,
  context: DashboardToolContext,
) => ({
  name: 'add_dashboard_widget' as const,
  description: `Add a widget to an existing dashboard tab.

Use get_dashboard first to get pageLayoutTabId and existing widget positions.
Use list_object_metadata_items to get objectMetadataId and field IDs for GRAPH widgets.

For RECORD_TABLE widgets: create a dedicated view first with create_view (type TABLE), then pass its viewId in configuration. Never reuse an existing record index view.

See create_complete_dashboard for full configuration examples.`,
  inputSchema: addDashboardWidgetSchema,
  execute: async (parameters: z.infer<typeof addDashboardWidgetSchema>) => {
    try {
      const widget = await deps.pageLayoutWidgetService.create({
        input: parameters as CreatePageLayoutWidgetInput,
        workspaceId: context.workspaceId,
      });

      return {
        success: true,
        message: `Widget "${parameters.title}" added`,
        result: {
          widgetId: widget.id,
          title: widget.title,
          type: widget.type,
          position: widget.position,
          pageLayoutTabId: parameters.pageLayoutTabId,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to add widget: ${error.message}`,
        error: error.message,
      };
    }
  },
});
