import { z } from 'zod';

import { type CreatePageLayoutWidgetInput } from 'src/engine/metadata-modules/page-layout-widget/dtos/inputs/create-page-layout-widget.input';
import {
  type PageLayoutWidgetPosition,
  type WidgetType,
} from 'twenty-shared/types';
import {
  widgetPositionSchema,
  widgetConfigurationSchema,
  widgetTypeSchema,
} from 'src/engine/metadata-modules/page-layout/tools/schemas/widget.schema';
import {
  type PageLayoutToolContext,
  type PageLayoutToolDependencies,
} from 'src/engine/metadata-modules/page-layout/tools/types/page-layout-tool-dependencies.type';
import { type WidgetConfigurationInput } from 'src/engine/metadata-modules/page-layout/tools/types/widget-configuration-input.type';
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

export const createAddPageLayoutWidgetTool = ({
  deps,
  context,
}: {
  deps: {
    pageLayoutToolService: PageLayoutToolDependencies['pageLayoutToolService'];
    pageLayoutWidgetService: Pick<
      PageLayoutToolDependencies['pageLayoutWidgetService'],
      'create'
    >;
  };
  context: PageLayoutToolContext;
}) => ({
  name: 'add_page_layout_widget' as const,
  description: `Add a widget to an existing page-layout tab (dashboard or record page).

Use get_dashboard or list_record_page_layouts first to get pageLayoutTabId, layoutMode and existing widget positions. Match the tab's layoutMode: GRID uses row/column/spans, VERTICAL_LIST uses index. Record-page changes affect the shared layout for that object, not only the currently open record.
You can reference the object and fields by NAME instead of UUID: pass objectName on the widget and the *FieldName variants in configuration (aggregateFieldName, primaryAxisGroupByFieldName, secondaryAxisGroupByFieldName, groupByFieldName). They are resolved server-side, so get_object_metadata / get_field_metadata are usually unnecessary. UUID variants still work and take precedence.

Chart widgets (AGGREGATE_CHART, BAR_CHART, LINE_CHART, PIE_CHART) accept configuration.filter to restrict which records feed the chart, e.g. filter: { recordFilters: [{ fieldName: "createdAt", operand: "IS_RELATIVE", value: "PAST_7_DAY" }] }. Filter fields can be referenced by fieldName or fieldMetadataId and must belong to the widget object.

For RECORD_TABLE widgets: create a dedicated view first with upsert_complete_view (type TABLE, with its fields/filters/sorts in one call), then pass its viewId in configuration. Never reuse an existing record index view.

For FRONT_COMPONENT widgets: pass configuration { configurationType: "FRONT_COMPONENT", frontComponentId } for an existing saved component that is available on the target page layout and object (see list_front_components). This places the component without changing its source or registration. Only place it when the user asks for it on this page layout.

See create_complete_dashboard for full configuration examples.`,
  inputSchema: addPageLayoutWidgetSchema,
  execute: async (parameters: {
    pageLayoutTabId: string;
    title: string;
    type: WidgetType;
    position: PageLayoutWidgetPosition;
    objectMetadataId?: string;
    objectName?: string;
    configuration?: WidgetConfigurationInput;
  }) => {
    try {
      await deps.pageLayoutToolService.assertFrontComponentWidgetAvailableOnPageLayoutOrThrow(
        {
          configuration: parameters.configuration,
          pageLayoutTabId: parameters.pageLayoutTabId,
          position: parameters.position,
          context,
        },
      );

      const identifierMaps =
        await deps.pageLayoutToolService.computePageLayoutIdentifierMaps(
          context,
        );
      const widgetWithMetadataIds = resolveWidgetFieldNamesToIds(
        parameters,
        identifierMaps,
      );

      const widget = await deps.pageLayoutWidgetService.create({
        input: {
          ...widgetWithMetadataIds,
          pageLayoutTabId: parameters.pageLayoutTabId,
        } as CreatePageLayoutWidgetInput,
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
