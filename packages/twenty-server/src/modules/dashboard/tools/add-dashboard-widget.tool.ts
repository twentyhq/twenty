import { z } from 'zod';

import { type CreatePageLayoutWidgetInput } from 'src/engine/metadata-modules/page-layout-widget/dtos/inputs/create-page-layout-widget.input';
import { type WidgetType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-type.enum';
import { type AllPageLayoutWidgetConfiguration } from 'src/engine/metadata-modules/page-layout-widget/types/all-page-layout-widget-configuration.type';
import {
  gridPositionSchema,
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
  gridPosition: gridPositionSchema.describe('Position in 12-column grid'),
  objectMetadataId: z
    .string()
    .uuid()
    .optional()
    .describe('Required for GRAPH widgets: object UUID to aggregate'),
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

See create_complete_dashboard for configuration examples.`,
  inputSchema: addDashboardWidgetSchema,
  execute: async (parameters: {
    pageLayoutTabId: string;
    title: string;
    type: WidgetType;
    gridPosition: {
      row: number;
      column: number;
      rowSpan: number;
      columnSpan: number;
    };
    objectMetadataId?: string;
    configuration?: AllPageLayoutWidgetConfiguration;
  }) => {
    try {
      const widget = await deps.pageLayoutWidgetService.create(
        parameters as CreatePageLayoutWidgetInput,
        context.workspaceId,
      );

      return {
        success: true,
        message: `Widget "${parameters.title}" added`,
        result: {
          widgetId: widget.id,
          title: widget.title,
          type: widget.type,
          gridPosition: widget.gridPosition,
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
