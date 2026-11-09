import { z } from 'zod';
import { WidgetType } from 'twenty-shared/types';

import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { createAddPageLayoutWidgetTool } from 'src/engine/metadata-modules/page-layout/tools/add-page-layout-widget.tool';
import { widgetPositionSchema } from 'src/engine/metadata-modules/page-layout/tools/schemas/widget.schema';
import { type PageLayoutToolContext } from 'src/engine/metadata-modules/page-layout/tools/types/page-layout-tool-dependencies.type';

const placeFrontComponentSchema = z.object({
  frontComponentId: z.uuid(),
  pageLayoutTabId: z.uuid(),
  title: z.string().trim().min(1),
  position: widgetPositionSchema,
});

export const createPlaceFrontComponentTool = ({
  deps,
  context,
}: {
  deps: Parameters<typeof createAddPageLayoutWidgetTool>[0]['deps'];
  context: PageLayoutToolContext;
}) => ({
  name: 'place_front_component' as const,
  description: `Place an existing saved frontend component in a page-layout tab (dashboard or record page) when the user requests it. Use list_front_components to find the component and get_dashboard or list_record_page_layouts to inspect the target tabs and positions. Match the tab's layoutMode: GRID uses row/column/spans, VERTICAL_LIST uses index. Record-page placement changes the shared layout for that object, not only the currently open record. This creates a widget; it does not change component code or publication.`,
  inputSchema: placeFrontComponentSchema,
  execute: async (parameters: z.infer<typeof placeFrontComponentSchema>) =>
    createAddPageLayoutWidgetTool({ deps, context }).execute({
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
