import { msg } from '@lingui/core/macro';
import { ToolCategory } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';
import { z } from 'zod';

import { DefineTool } from 'src/engine/core-modules/tool-provider/decorators/define-tool.decorator';
import { BaseTool } from 'src/engine/core-modules/tool-provider/interfaces/base-tool.interface';
import { type ToolExecuteArgs } from 'src/engine/core-modules/tool-provider/types/tool-execute-args.type';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { PAGE_LAYOUT_TOOL_ACCESS_POLICY } from 'src/engine/metadata-modules/page-layout/tools/constants/page-layout-tool-access-policy.constant';
import { PageLayoutToolService } from 'src/engine/metadata-modules/page-layout/tools/services/page-layout-tool.service';
import { PageLayoutWidgetService } from 'src/engine/metadata-modules/page-layout-widget/services/page-layout-widget.service';
import {
  PageLayoutWidgetException,
  PageLayoutWidgetExceptionCode,
} from 'src/engine/metadata-modules/page-layout-widget/exceptions/page-layout-widget.exception';
import {
  widgetPositionSchema,
  widgetConfigurationSchema,
  widgetTypeSchema,
} from 'src/engine/metadata-modules/page-layout/tools/schemas/widget.schema';
import { resolveWidgetFieldNamesToIds } from 'src/engine/metadata-modules/page-layout/tools/utils/resolve-widget-field-names-to-metadata-ids.util';

const addPageLayoutWidgetSchema = z.object({
  pageLayoutTabId: z
    .string()
    .uuid()
    .describe('Tab UUID from get_dashboard or list_record_page_layouts'),
  title: z.string().describe('Widget title'),
  type: widgetTypeSchema.describe('Widget type'),
  position: widgetPositionSchema.describe(
    'Position matching the tab layoutMode: grid coordinates or vertical-list index',
  ),
  objectMetadataId: z
    .uuid()
    .optional()
    .describe(
      'For GRAPH and RECORD_TABLE widgets: object UUID to aggregate or display. Provide this or objectName.',
    ),
  objectName: z
    .string()
    .optional()
    .describe(
      'For GRAPH and RECORD_TABLE widgets: object name, singular or plural. Resolved to a UUID — alternative to objectMetadataId.',
    ),
  configuration: widgetConfigurationSchema,
});

@DefineTool({
  name: 'add_page_layout_widget',
  description: `Add a widget to an existing page-layout tab (dashboard or record page).

Use get_dashboard or list_record_page_layouts first to get pageLayoutTabId, layoutMode and existing widget positions. Match the tab's layoutMode: GRID uses row/column/spans, VERTICAL_LIST uses index. Record-page changes affect the shared layout for that object, not only the currently open record.
You can reference the object and fields by NAME instead of UUID: pass objectName on the widget and the *FieldName variants in configuration (aggregateFieldName, primaryAxisGroupByFieldName, secondaryAxisGroupByFieldName, groupByFieldName). They are resolved server-side, so get_object_metadata / get_field_metadata are usually unnecessary. UUID variants still work and take precedence.

Chart widgets (AGGREGATE_CHART, BAR_CHART, LINE_CHART, PIE_CHART) accept configuration.filter to restrict which records feed the chart, e.g. filter: { recordFilters: [{ fieldName: "createdAt", operand: "IS_RELATIVE", value: "PAST_7_DAY" }] }. Filter fields can be referenced by fieldName or fieldMetadataId and must belong to the widget object.

For RECORD_TABLE widgets: create a dedicated view first with upsert_complete_view (type TABLE, with its fields/filters/sorts in one call), then pass its viewId in configuration. Never reuse an existing record index view.

For FRONT_COMPONENT widgets: pass configuration { configurationType: "FRONT_COMPONENT", frontComponentId } for an existing saved component that is available on the target page layout and object (see list_front_components). This places the component without changing its source or registration. Only place it when the user asks for it on this page layout.

See create_complete_dashboard for full configuration examples.`,
  category: ToolCategory.PAGE_LAYOUT,
  accessPolicy: PAGE_LAYOUT_TOOL_ACCESS_POLICY,
  icon: 'IconAppWindow',
})
export class AddPageLayoutWidgetTool extends BaseTool<
  typeof addPageLayoutWidgetSchema
> {
  readonly inputSchema = addPageLayoutWidgetSchema;

  constructor(
    private readonly pageLayoutToolService: PageLayoutToolService,
    private readonly pageLayoutWidgetService: PageLayoutWidgetService,
  ) {
    super();
  }

  async execute({
    input: parameters,
    context,
  }: ToolExecuteArgs<typeof addPageLayoutWidgetSchema>): Promise<ToolOutput> {
    try {
      await this.pageLayoutToolService.assertFrontComponentWidgetAvailableOnPageLayoutOrThrow(
        {
          configuration: parameters.configuration,
          pageLayoutTabId: parameters.pageLayoutTabId,
          position: parameters.position,
          context: {
            workspaceId: context.workspaceId,
            callingApplication: context.application,
            workspaceCustomApplicationId:
              context.authContext?.workspace.workspaceCustomApplicationId ??
              undefined,
          },
        },
      );

      const identifierMaps =
        await this.pageLayoutToolService.computePageLayoutIdentifierMaps({
          workspaceId: context.workspaceId,
        });
      const widgetWithMetadataIds = resolveWidgetFieldNamesToIds(
        parameters,
        identifierMaps,
      );

      const { configuration } = widgetWithMetadataIds;

      if (!isDefined(configuration)) {
        throw new PageLayoutWidgetException(
          'Widget configuration is required',
          PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
          { userFriendlyMessage: msg`Widget configuration is required.` },
        );
      }

      const widget = await this.pageLayoutWidgetService.create({
        input: {
          ...widgetWithMetadataIds,
          pageLayoutTabId: parameters.pageLayoutTabId,
          configuration,
        },
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
  }
}
