import { z } from 'zod';

import { type CreatePageLayoutWidgetInput } from 'src/engine/metadata-modules/page-layout-widget/dtos/inputs/create-page-layout-widget.input';
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
import { type WidgetConfigurationInput } from 'src/modules/dashboard/tools/types/widget-configuration-input.type';
import { computeDashboardIdentifierMaps } from 'src/modules/dashboard/tools/utils/compute-dashboard-identifier-maps.util';
import { resolveWidgetFieldNamesToIds } from 'src/modules/dashboard/tools/utils/resolve-widget-field-names-to-metadata-ids.util';

const addDashboardWidgetSchema = z.object({
  pageLayoutTabId: z.string().uuid().describe('Tab UUID from get_dashboard'),
  title: z.string().describe('Widget title'),
  type: widgetTypeSchema.describe('Widget type'),
  gridPosition: gridPositionSchema.describe('Position in 12-column grid'),
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

export const createAddDashboardWidgetTool = (
  deps: Pick<
    DashboardToolDependencies,
    'pageLayoutWidgetService' | 'flatEntityMapsCacheService'
  >,
  context: DashboardToolContext,
) => ({
  name: 'add_dashboard_widget' as const,
  description: `Add a widget to an existing dashboard tab.

Use get_dashboard first to get pageLayoutTabId and existing widget positions.
You can reference the object and fields by NAME instead of UUID: pass objectName on the widget and the *FieldName variants in configuration (aggregateFieldName, primaryAxisGroupByFieldName, secondaryAxisGroupByFieldName, groupByFieldName). They are resolved server-side, so get_object_metadata / get_field_metadata are usually unnecessary. UUID variants still work and take precedence.

Chart widgets (AGGREGATE_CHART, BAR_CHART, LINE_CHART, PIE_CHART) accept configuration.filter to restrict which records feed the chart, e.g. filter: { recordFilters: [{ fieldName: "createdAt", operand: "IS_RELATIVE", value: "PAST_7_DAY" }] }. Filter fields can be referenced by fieldName or fieldMetadataId and must belong to the widget object.

For RECORD_TABLE widgets: create a dedicated view first with upsert_complete_view (type TABLE, with its fields/filters/sorts in one call), then pass its viewId in configuration. Never reuse an existing record index view.

See create_complete_dashboard for full configuration examples.`,
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
    objectName?: string;
    configuration?: WidgetConfigurationInput;
  }) => {
    try {
      const identifierMaps = await computeDashboardIdentifierMaps(
        deps,
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
