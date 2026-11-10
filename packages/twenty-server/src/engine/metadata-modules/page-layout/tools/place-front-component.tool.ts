import { ToolCategory } from 'twenty-shared/ai';
import { z } from 'zod';
import { WidgetType } from 'twenty-shared/types';

import { DefineTool } from 'src/engine/core-modules/tool-provider/decorators/define-tool.decorator';
import { BaseTool } from 'src/engine/core-modules/tool-provider/interfaces/base-tool.interface';
import { type ToolExecuteArgs } from 'src/engine/core-modules/tool-provider/types/tool-execute-args.type';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { PAGE_LAYOUT_TOOL_ACCESS_POLICY } from 'src/engine/metadata-modules/page-layout/tools/constants/page-layout-tool-access-policy.constant';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { AddPageLayoutWidgetTool } from 'src/engine/metadata-modules/page-layout/tools/add-page-layout-widget.tool';
import { widgetPositionSchema } from 'src/engine/metadata-modules/page-layout/tools/schemas/widget.schema';

const placeFrontComponentSchema = z.object({
  frontComponentId: z.uuid(),
  pageLayoutTabId: z.uuid(),
  title: z.string().trim().min(1),
  position: widgetPositionSchema,
});

@DefineTool({
  name: 'place_front_component',
  description: `Place an existing saved frontend component in a page-layout tab (dashboard or record page) when the user requests it. Use list_front_components to find the component and get_dashboard or list_record_page_layouts to inspect the target tabs and positions. Match the tab's layoutMode: GRID uses row/column/spans, VERTICAL_LIST uses index. Record-page placement changes the shared layout for that object, not only the currently open record. This creates a widget; it does not change component code or publication.`,
  category: ToolCategory.PAGE_LAYOUT,
  accessPolicy: PAGE_LAYOUT_TOOL_ACCESS_POLICY,
  icon: 'IconAppWindow',
})
export class PlaceFrontComponentTool extends BaseTool<
  typeof placeFrontComponentSchema
> {
  readonly inputSchema = placeFrontComponentSchema;

  constructor(
    private readonly addPageLayoutWidgetTool: AddPageLayoutWidgetTool,
  ) {
    super();
  }

  async execute({
    input: parameters,
    context,
  }: ToolExecuteArgs<typeof placeFrontComponentSchema>): Promise<ToolOutput> {
    return this.addPageLayoutWidgetTool.execute({
      context,
      input: {
        pageLayoutTabId: parameters.pageLayoutTabId,
        title: parameters.title,
        position: parameters.position,
        type: WidgetType.FRONT_COMPONENT,
        configuration: {
          configurationType: WidgetConfigurationType.FRONT_COMPONENT,
          frontComponentId: parameters.frontComponentId,
        },
      },
    });
  }
}
