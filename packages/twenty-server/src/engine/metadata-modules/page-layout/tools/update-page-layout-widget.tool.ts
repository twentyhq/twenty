import { z } from 'zod';

import { type UpdatePageLayoutWidgetInput } from 'src/engine/metadata-modules/page-layout-widget/dtos/inputs/update-page-layout-widget.input';
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

const updatePageLayoutWidgetSchema = z.object({
  widgetId: z.string().uuid().describe('Id of the widget to update'),
  title: z.string().optional(),
  type: widgetTypeSchema.optional(),
  objectMetadataId: z.string().uuid().nullable().optional(),
  position: widgetPositionSchema.optional(),
  configuration: widgetConfigurationPassthroughSchema.optional(),
});

type UpdatePageLayoutWidgetParams = z.infer<
  typeof updatePageLayoutWidgetSchema
>;

export const createUpdatePageLayoutWidgetTool = (
  deps: Pick<PageLayoutToolDependencies, 'pageLayoutWidgetService'>,
  context: PageLayoutToolContext,
) => ({
  name: 'update_page_layout_widget' as const,
  description: `Update an existing widget. Only the fields you pass are modified. Use get_page_layout first to find the widgetId.`,
  inputSchema: updatePageLayoutWidgetSchema,
  execute: async (parameters: UpdatePageLayoutWidgetParams) => {
    try {
      const updateData: UpdatePageLayoutWidgetInput = {};

      if (parameters.title !== undefined) {
        updateData.title = parameters.title;
      }
      if (parameters.type !== undefined) {
        updateData.type =
          parameters.type as UpdatePageLayoutWidgetInput['type'];
      }
      if (parameters.objectMetadataId !== undefined) {
        updateData.objectMetadataId = parameters.objectMetadataId;
      }
      if (parameters.position !== undefined) {
        updateData.position =
          parameters.position as unknown as UpdatePageLayoutWidgetInput['position'];
        updateData.gridPosition = deriveGridPositionForWidget(
          parameters.position,
        );
      }
      if (parameters.configuration !== undefined) {
        updateData.configuration =
          parameters.configuration as unknown as UpdatePageLayoutWidgetInput['configuration'];
      }

      const widget = await deps.pageLayoutWidgetService.update({
        id: parameters.widgetId,
        workspaceId: context.workspaceId,
        updateData,
      });

      return {
        success: true,
        message: `Widget "${widget.title}" updated`,
        result: {
          widgetId: widget.id,
          title: widget.title,
          type: widget.type,
        },
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      return {
        success: false,
        message: `Failed to update widget: ${message}`,
        error: message,
      };
    }
  },
});
