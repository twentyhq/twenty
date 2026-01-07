import { isDefined } from 'twenty-shared/utils';
import { z } from 'zod';

import { type WidgetType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-type.enum';
import {
  gridPositionSchema,
  widgetConfigurationSchema,
  widgetTypeSchema,
} from 'src/modules/dashboard/tools/schemas/widget.schema';
import {
  type DashboardToolContext,
  type DashboardToolDependencies,
} from 'src/modules/dashboard/tools/types/dashboard-tool-dependencies.type';

const updateDashboardWidgetSchema = z.object({
  widgetId: z.string().uuid().describe('The UUID of the widget to update'),
  title: z.string().optional().describe('New widget title'),
  type: widgetTypeSchema.optional().describe('New widget type'),
  gridPosition: gridPositionSchema
    .optional()
    .describe('New position and size in the grid layout'),
  objectMetadataId: z
    .string()
    .uuid()
    .optional()
    .describe('New object metadata ID'),
  configuration: widgetConfigurationSchema,
});

export const createUpdateDashboardWidgetTool = (
  deps: Pick<DashboardToolDependencies, 'pageLayoutWidgetService'>,
  context: DashboardToolContext,
) => ({
  name: 'update_dashboard_widget' as const,
  description: `Update an existing widget's properties, position, or configuration.

Use get_dashboard first to find the widgetId.

Only provide fields you want to change - others remain unchanged.`,
  inputSchema: updateDashboardWidgetSchema,
  execute: async (parameters: {
    widgetId: string;
    title?: string;
    type?: WidgetType;
    gridPosition?: {
      row: number;
      column: number;
      rowSpan: number;
      columnSpan: number;
    };
    objectMetadataId?: string;
    configuration?: Record<string, unknown>;
  }) => {
    try {
      const { widgetId, ...updates } = parameters;
      const updateData = Object.fromEntries(
        Object.entries(updates).filter(([, value]) => isDefined(value)),
      );

      const widget = await deps.pageLayoutWidgetService.update(
        widgetId,
        context.workspaceId,
        updateData,
      );

      return {
        success: true,
        message: `Widget "${widget.title}" updated`,
        result: {
          widgetId: widget.id,
          title: widget.title,
          type: widget.type,
          gridPosition: widget.gridPosition,
          configuration: widget.configuration,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to update widget: ${error.message}`,
        error: error.message,
      };
    }
  },
});
