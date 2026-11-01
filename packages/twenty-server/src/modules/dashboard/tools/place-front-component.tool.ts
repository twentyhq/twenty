import { z } from 'zod';
import {
  PageLayoutTabLayoutMode,
  PageLayoutWidgetVerticalListHeightBehavior,
  WidgetType,
} from 'twenty-shared/types';

import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { createAddDashboardWidgetTool } from 'src/modules/dashboard/tools/add-dashboard-widget.tool';
import { widgetPositionSchema } from 'src/modules/dashboard/tools/schemas/widget.schema';
import { type DashboardToolContext } from 'src/modules/dashboard/tools/types/dashboard-tool-dependencies.type';

const placeFrontComponentSchema = z.object({
  frontComponentId: z.uuid(),
  pageLayoutTabId: z.uuid(),
  title: z.string().trim().min(1),
  position: z.discriminatedUnion('layoutMode', [
    widgetPositionSchema,
    z.object({
      layoutMode: z.literal(PageLayoutTabLayoutMode.VERTICAL_LIST),
      index: z.number().int().min(0),
      heightBehavior: z
        .enum(PageLayoutWidgetVerticalListHeightBehavior)
        .optional(),
    }),
  ]),
});

export const createPlaceFrontComponentTool = (
  deps: Parameters<typeof createAddDashboardWidgetTool>[0],
  context: DashboardToolContext,
) => ({
  name: 'place_front_component' as const,
  description: `Place an existing saved frontend component in a dashboard or record-page tab when the user requests it. Use list_front_components to find the component and get_dashboard or list_record_page_layouts to inspect the target tabs and positions. Match the tab's layoutMode: GRID uses row/column/spans, VERTICAL_LIST uses index. Record-page placement changes the shared layout for that object, not only the currently open record. This creates a widget; it does not change component code or publication.`,
  inputSchema: placeFrontComponentSchema,
  execute: async (parameters: z.infer<typeof placeFrontComponentSchema>) =>
    createAddDashboardWidgetTool(deps, context).execute({
      pageLayoutTabId: parameters.pageLayoutTabId,
      title: parameters.title,
      position: parameters.position,
      type: WidgetType.FRONT_COMPONENT,
      configuration: {
        configurationType: WidgetConfigurationType.FRONT_COMPONENT,
        frontComponentId: parameters.frontComponentId,
      },
    }),
});
