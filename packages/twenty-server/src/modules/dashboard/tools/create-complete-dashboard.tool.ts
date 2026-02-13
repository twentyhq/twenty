import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';

import { type CreatePageLayoutWidgetInput } from 'src/engine/metadata-modules/page-layout-widget/dtos/inputs/create-page-layout-widget.input';
import { type WidgetType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-type.enum';
import { type AllPageLayoutWidgetConfiguration } from 'src/engine/metadata-modules/page-layout-widget/types/all-page-layout-widget-configuration.type';
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

const widgetSchema = z.object({
  title: z.string().describe('Widget title displayed in the header'),
  type: widgetTypeSchema.describe('Widget type'),
  gridPosition: gridPositionSchema.describe('Position in 12-column grid'),
  objectMetadataId: z
    .string()
    .uuid()
    .optional()
    .describe(
      'REQUIRED for GRAPH widgets: UUID of the object to aggregate (e.g., opportunity, company)',
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

IMPORTANT: Before creating GRAPH widgets, you MUST use list_object_metadata_items to get valid objectMetadataId and field IDs.

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

5. IFRAME: { type: "IFRAME", configuration: { configurationType: "IFRAME", url: "https://..." } }

6. STANDALONE_RICH_TEXT: { type: "STANDALONE_RICH_TEXT", configuration: { configurationType: "STANDALONE_RICH_TEXT", body: { ... } } }

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
      configuration?: AllPageLayoutWidgetConfiguration;
    }>;
  }) => {
    try {
      const tabTitle = parameters.tabTitle ?? 'Main';
      const widgets = parameters.widgets ?? [];
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
          const createdWidget = await deps.pageLayoutWidgetService.create({
            input: {
              ...widget,
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
