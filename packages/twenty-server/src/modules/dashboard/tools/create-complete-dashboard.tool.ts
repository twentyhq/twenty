import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';

import { type CreatePageLayoutWidgetInput } from 'src/engine/metadata-modules/page-layout-widget/dtos/inputs/create-page-layout-widget.input';
import { type WidgetType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-type.enum';
import { PageLayoutType } from 'src/engine/metadata-modules/page-layout/enums/page-layout-type.enum';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
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

const widgetSchema = z.object({
  title: z.string().describe('Widget title displayed in the header'),
  type: widgetTypeSchema.describe('Widget type'),
  gridPosition: gridPositionSchema.describe('Position in 12-column grid'),
  objectMetadataId: z
    .uuid()
    .optional()
    .describe(
      'For GRAPH and RECORD_TABLE widgets: UUID of the object to aggregate or display. Provide this or objectName.',
    ),
  objectName: z
    .string()
    .optional()
    .describe(
      'For GRAPH and RECORD_TABLE widgets: object name, singular or plural (e.g. "opportunity"). Resolved to a UUID — alternative to objectMetadataId.',
    ),
  configuration: widgetConfigurationSchema,
});

const createCompleteDashboardSchema = z.object({
  title: z.string().describe('Dashboard title'),
  tabTitle: z
    .string()
    .optional()
    .default('Main')
    .describe('Title of the first tab'),
  widgets: z
    .array(widgetSchema)
    .optional()
    .default([])
    .describe('Widgets to add'),
});

export const createCreateCompleteDashboardTool = (
  deps: DashboardToolDependencies,
  context: DashboardToolContext,
) => ({
  name: 'create_complete_dashboard' as const,
  description: `Create a dashboard with layout, tab, and widgets.

OBJECT & FIELD REFERENCES: You can reference the object and fields by NAME instead of UUID. Use objectName (e.g. "opportunity") on the widget and the *FieldName variants in configuration (aggregateFieldName, primaryAxisGroupByFieldName, secondaryAxisGroupByFieldName, groupByFieldName). They are resolved to UUIDs server-side, so you usually do NOT need get_object_metadata / get_field_metadata first. UUID variants (objectMetadataId, *FieldMetadataId) still work and take precedence when both are given.

GRID SYSTEM:
- 12 columns (0-11), rows start at 0
- Full width: columnSpan: 12, Half: columnSpan: 6, Third: columnSpan: 4
- Row spans: 2-4 (KPI), 6-8 (charts)

WIDGET TYPES:

1. GRAPH with configurationType "AGGREGATE_CHART" (KPI number):
   - Requires: objectMetadataId, configuration.configurationType, configuration.aggregateFieldMetadataId, configuration.aggregateOperation
   - Example: { type: "GRAPH", objectMetadataId: "<opportunity-object-uuid>", configuration: { configurationType: "AGGREGATE_CHART", aggregateFieldMetadataId: "<amount-field-uuid>", aggregateOperation: "SUM" } }

2. GRAPH with configurationType "BAR_CHART":
   - Additional required: configuration.primaryAxisGroupByFieldMetadataId, configuration.layout ("VERTICAL" or "HORIZONTAL")
   - IMPORTANT: When grouping by a RELATION field (e.g. owner, company), you MUST provide primaryAxisGroupBySubFieldName (e.g. "name", "email") — otherwise it groups by raw UUID which is useless. Composite fields (e.g. address) also require a subfield (e.g. "addressCity").
   - Example (simple field): { type: "GRAPH", objectMetadataId: "<opportunity-object-uuid>", configuration: { configurationType: "BAR_CHART", aggregateFieldMetadataId: "<amount-field-uuid>", aggregateOperation: "COUNT", primaryAxisGroupByFieldMetadataId: "<stage-field-uuid>", layout: "VERTICAL" } }
   - Example (relation field): { type: "GRAPH", objectMetadataId: "<opportunity-object-uuid>", configuration: { configurationType: "BAR_CHART", aggregateFieldMetadataId: "<amount-field-uuid>", aggregateOperation: "SUM", primaryAxisGroupByFieldMetadataId: "<company-field-uuid>", primaryAxisGroupBySubFieldName: "name", layout: "VERTICAL" } }

3. GRAPH with configurationType "LINE_CHART":
   - Additional required: configuration.primaryAxisGroupByFieldMetadataId
   - Example: { type: "GRAPH", objectMetadataId: "<opportunity-object-uuid>", configuration: { configurationType: "LINE_CHART", aggregateFieldMetadataId: "<amount-field-uuid>", aggregateOperation: "SUM", primaryAxisGroupByFieldMetadataId: "<created-date-field-uuid>" } }

4. GRAPH with configurationType "PIE_CHART":
   - Additional required: configuration.groupByFieldMetadataId (note: different field name!)
   - Example: { type: "GRAPH", objectMetadataId: "<opportunity-object-uuid>", configuration: { configurationType: "PIE_CHART", aggregateFieldMetadataId: "<id-field-uuid>", aggregateOperation: "COUNT", groupByFieldMetadataId: "<stage-field-uuid>" } }

CHART FILTERS (AGGREGATE_CHART, BAR_CHART, LINE_CHART, PIE_CHART):
- Add configuration.filter to restrict which records feed the chart. All filtered fields must belong to the widget object.
- Reference filter fields by name (fieldName) or UUID (fieldMetadataId).
- Shape: { filter: { recordFilters: [{ fieldName, operand, value, subFieldName? }] } }. Multiple rules are ANDed; use recordFilterGroups with logicalOperator AND/OR for advanced logic.
- Relative dates: operand "IS_RELATIVE" with value like "PAST_7_DAY", "THIS_1_MONTH", "NEXT_3_WEEK" (DIRECTION_AMOUNT_UNIT; DIRECTION=PAST|THIS|NEXT, UNIT=DAY|WEEK|MONTH|QUARTER|YEAR). Use IS_IN_PAST/IS_IN_FUTURE/IS_TODAY (no value) for open-ended ranges.
- SELECT/MULTI_SELECT/RELATION values are JSON array strings, e.g. '["WON"]'. CURRENCY value is the major unit with subFieldName "amountMicros".
- Example (won opportunities created in the last 30 days): { type: "GRAPH", objectName: "opportunity", configuration: { configurationType: "AGGREGATE_CHART", aggregateFieldName: "amount", aggregateOperation: "SUM", filter: { recordFilters: [{ fieldName: "stage", operand: "IS", value: "[\\"WON\\"]" }, { fieldName: "createdAt", operand: "IS_RELATIVE", value: "PAST_30_DAY" }] } } }

5. IFRAME: { type: "IFRAME", configuration: { configurationType: "IFRAME", url: "https://..." } }

6. STANDALONE_RICH_TEXT: { type: "STANDALONE_RICH_TEXT", configuration: { configurationType: "STANDALONE_RICH_TEXT", body: { ... } } }

7. RECORD_TABLE: displays a live, filterable record list directly on the dashboard.
   - IMPORTANT: you MUST create a dedicated view for the widget BEFORE creating the widget. Use create_view to create a new TABLE_WIDGET view for the object, then pass its ID as viewId. Never reuse an existing index-page view and never use plain TABLE/KANBAN/CALENDAR types for widget-backing views — non-widget view types leak into record index view pickers.
   - Requires: objectMetadataId (top-level, UUID of the object to display) AND configuration.viewId (UUID of the dedicated view you just created)
   - configuration.configurationType must be "RECORD_TABLE"
   - Recommended size: rowSpan 8-10, columnSpan 12 (full width)
   - Workflow: (1) call create_view with the appropriate *_WIDGET type (TABLE_WIDGET for a table, KANBAN_WIDGET for a board, CALENDAR_WIDGET for a calendar — kanban requires mainGroupByFieldName, calendar requires calendarFieldName) → get the viewId, (2) call create_many_view_fields to add visible columns to that view, (3) create the widget with that viewId
   - The widget renders according to its view type: TABLE_WIDGET renders a table, KANBAN_WIDGET a board (requires mainGroupByFieldName pointing at a SELECT or many-to-one relation field), CALENDAR_WIDGET a calendar (requires a date calendar field)
   - Example: { type: "RECORD_TABLE", objectMetadataId: "<object-uuid>", configuration: { configurationType: "RECORD_TABLE", viewId: "<dedicated-view-uuid>" } }

AGGREGATION OPERATIONS: COUNT, SUM, AVG, MIN, MAX, COUNT_EMPTY, COUNT_NOT_EMPTY`,
  inputSchema: createCompleteDashboardSchema,
  execute: async (parameters: {
    title: string;
    tabTitle?: string;
    widgets?: Array<{
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
    }>;
  }) => {
    try {
      const tabTitle = parameters.tabTitle ?? 'Main';
      const widgets = parameters.widgets ?? [];
      const identifierMaps =
        widgets.length > 0
          ? await computeDashboardIdentifierMaps(deps, context)
          : null;
      const pageLayout = await deps.pageLayoutService.create({
        createPageLayoutInput: {
          name: parameters.title,
          type: PageLayoutType.DASHBOARD,
        },
        workspaceId: context.workspaceId,
      });

      const pageLayoutTab = await deps.pageLayoutTabService.create({
        createPageLayoutTabInput: {
          title: tabTitle,
          pageLayoutId: pageLayout.id,
          position: 0,
        },
        workspaceId: context.workspaceId,
      });

      const createdWidgets = [];
      const widgetErrors = [];

      for (const widget of widgets) {
        try {
          const widgetWithMetadataIds = identifierMaps
            ? resolveWidgetFieldNamesToIds(widget, identifierMaps)
            : widget;

          const createdWidget = await deps.pageLayoutWidgetService.create({
            input: {
              ...widgetWithMetadataIds,
              pageLayoutTabId: pageLayoutTab.id,
            } as CreatePageLayoutWidgetInput,
            workspaceId: context.workspaceId,
          });

          createdWidgets.push({
            id: createdWidget.id,
            title: createdWidget.title,
            type: createdWidget.type,
          });
        } catch (widgetError) {
          widgetErrors.push({
            title: widget.title,
            error: widgetError.message,
          });
        }
      }

      const dashboardId = await createDashboardRecord(
        deps,
        context,
        parameters.title,
        pageLayout.id,
      );

      const result = {
        dashboardId,
        pageLayoutId: pageLayout.id,
        pageLayoutTabId: pageLayoutTab.id,
        title: parameters.title,
        widgets: createdWidgets,
      };

      if (widgetErrors.length > 0) {
        return {
          success: true,
          message: `Dashboard created with ${createdWidgets.length} widgets. ${widgetErrors.length} widget(s) failed.`,
          result,
          widgetErrors,
          recordReferences: [
            {
              objectNameSingular: 'dashboard',
              recordId: dashboardId,
              displayName: parameters.title,
            },
          ],
        };
      }

      return {
        success: true,
        message: `Dashboard "${parameters.title}" created with ${createdWidgets.length} widgets`,
        result,
        recordReferences: [
          {
            objectNameSingular: 'dashboard',
            recordId: dashboardId,
            displayName: parameters.title,
          },
        ],
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to create dashboard: ${error.message}`,
        error: error.message,
      };
    }
  },
});

const createDashboardRecord = async (
  deps: DashboardToolDependencies,
  context: DashboardToolContext,
  title: string,
  pageLayoutId: string,
): Promise<string> => {
  const authContext = buildSystemAuthContext(context.workspaceId);

  return deps.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
    const dashboardRepository =
      await deps.globalWorkspaceOrmManager.getRepository(
        context.workspaceId,
        'dashboard',
        { shouldBypassPermissionChecks: true },
      );

    const position = await deps.recordPositionService.buildRecordPosition({
      value: 'first',
      objectMetadata: { isCustom: false, nameSingular: 'dashboard' },
      workspaceId: context.workspaceId,
    });

    const dashboard = { id: uuidv4(), title, pageLayoutId, position };

    await dashboardRepository.insert(dashboard);

    return dashboard.id;
  }, authContext);
};
