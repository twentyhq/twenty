import { isDefined } from 'twenty-shared/utils';
import { z } from 'zod';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { WidgetType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-type.enum';
import { findActiveFlatFieldMetadataById } from 'src/engine/metadata-modules/page-layout-widget/utils/find-active-flat-field-metadata-by-id.util';
import { isChartFieldsForValidation } from 'src/engine/metadata-modules/page-layout-widget/utils/is-chart-fields-for-validation.util';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import {
  type DashboardToolContext,
  type DashboardToolDependencies,
} from 'src/modules/dashboard/tools/types/dashboard-tool-dependencies.type';
import { buildResolvedGroupBy } from 'src/modules/dashboard/tools/utils/build-resolved-group-by.util';

const getDashboardSchema = z.object({
  dashboardId: z.string().uuid().describe('The UUID of the dashboard to fetch'),
});

export const createGetDashboardTool = (
  deps: Pick<
    DashboardToolDependencies,
    | 'pageLayoutService'
    | 'globalWorkspaceOrmManager'
    | 'flatEntityMapsCacheService'
  >,
  context: DashboardToolContext,
) => ({
  name: 'get_dashboard' as const,
  description: `Get a dashboard with its full layout structure including tabs and widgets.`,
  inputSchema: getDashboardSchema,
  execute: async (parameters: { dashboardId: string }) => {
    try {
      const authContext = buildSystemAuthContext(context.workspaceId);
      const { flatFieldMetadataMaps } =
        await deps.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
          {
            workspaceId: context.workspaceId,
            flatMapsKeys: ['flatFieldMetadataMaps'],
          },
        );

      const allFields = Object.values(
        flatFieldMetadataMaps.byUniversalIdentifier,
      )
        .filter(isDefined)
        .filter((field) => field.isActive);

      const fieldsByObjectId = new Map<string, FlatFieldMetadata[]>();

      allFields.forEach((field) => {
        const existing = fieldsByObjectId.get(field.objectMetadataId) ?? [];

        existing.push(field);
        fieldsByObjectId.set(field.objectMetadataId, existing);
      });

      const buildResolvedGroupByForConfiguration = ({
        fieldId,
        subFieldName,
      }: {
        fieldId?: string | null;
        subFieldName?: string | null;
      }) =>
        buildResolvedGroupBy({
          fieldId,
          subFieldName,
          flatFieldMetadataMaps,
          fieldsByObjectId,
          allFields,
        });

      const dashboard =
        await deps.globalWorkspaceOrmManager.executeInWorkspaceContext(
          async () => {
            const repo = await deps.globalWorkspaceOrmManager.getRepository(
              context.workspaceId,
              'dashboard',
              { shouldBypassPermissionChecks: true },
            );

            return repo.findOne({ where: { id: parameters.dashboardId } });
          },
          authContext,
        );

      if (!isDefined(dashboard)) {
        return {
          success: false,
          message: `Dashboard "${parameters.dashboardId}" not found`,
          error: 'DASHBOARD_NOT_FOUND',
        };
      }

      if (!isDefined(dashboard.pageLayoutId)) {
        return {
          success: false,
          message: `Dashboard "${dashboard.title}" has no page layout`,
          error: 'PAGE_LAYOUT_NOT_FOUND',
        };
      }

      const pageLayout = await deps.pageLayoutService.findByIdOrThrow({
        id: dashboard.pageLayoutId,
        workspaceId: context.workspaceId,
      });

      const tabs =
        pageLayout.tabs?.map((tab) => ({
          id: tab.id,
          title: tab.title,
          position: tab.position,
          widgets:
            tab.widgets?.map((w) => {
              if (
                w.type !== WidgetType.GRAPH ||
                !isChartFieldsForValidation(w.configuration)
              ) {
                return {
                  id: w.id,
                  title: w.title,
                  type: w.type,
                  gridPosition: w.gridPosition,
                  objectMetadataId: w.objectMetadataId,
                  configuration: w.configuration,
                };
              }

              const configuration = w.configuration;
              const resolved: Record<string, unknown> = {};

              const aggregateField = findActiveFlatFieldMetadataById(
                configuration.aggregateFieldMetadataId,
                flatFieldMetadataMaps,
              );

              if (isDefined(aggregateField)) {
                resolved.aggregateField = {
                  fieldName: aggregateField.name,
                  fieldLabel: aggregateField.label ?? aggregateField.name,
                };
              }

              switch (configuration.configurationType) {
                case WidgetConfigurationType.BAR_CHART:
                case WidgetConfigurationType.LINE_CHART: {
                  const primaryResolved = buildResolvedGroupByForConfiguration({
                    fieldId: configuration.primaryAxisGroupByFieldMetadataId,
                    subFieldName: configuration.primaryAxisGroupBySubFieldName,
                  });
                  const secondaryResolved =
                    buildResolvedGroupByForConfiguration({
                      fieldId:
                        configuration.secondaryAxisGroupByFieldMetadataId,
                      subFieldName:
                        configuration.secondaryAxisGroupBySubFieldName,
                    });

                  if (isDefined(primaryResolved)) {
                    resolved.primaryAxisGroupBy = primaryResolved;
                  }
                  if (isDefined(secondaryResolved)) {
                    resolved.secondaryAxisGroupBy = secondaryResolved;
                  }
                  break;
                }
                case WidgetConfigurationType.PIE_CHART: {
                  const groupByResolved = buildResolvedGroupByForConfiguration({
                    fieldId: configuration.groupByFieldMetadataId,
                    subFieldName: configuration.groupBySubFieldName,
                  });

                  if (isDefined(groupByResolved)) {
                    resolved.groupBy = groupByResolved;
                  }
                  break;
                }
                case WidgetConfigurationType.AGGREGATE_CHART:
                default:
                  break;
              }

              const enrichedConfiguration = {
                ...configuration,
                _resolved:
                  Object.keys(resolved).length > 0 ? resolved : undefined,
              };

              return {
                id: w.id,
                title: w.title,
                type: w.type,
                gridPosition: w.gridPosition,
                objectMetadataId: w.objectMetadataId,
                configuration: enrichedConfiguration,
              };
            }) ?? [],
        })) ?? [];

      return {
        success: true,
        message: `Retrieved dashboard "${dashboard.title}" with ${tabs.length} tab(s)`,
        result: {
          dashboard: {
            id: dashboard.id,
            title: dashboard.title,
            pageLayoutId: dashboard.pageLayoutId,
            createdAt: dashboard.createdAt,
            updatedAt: dashboard.updatedAt,
          },
          layout: { id: pageLayout.id, name: pageLayout.name, tabs },
        },
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      return {
        success: false,
        message: `Failed to get dashboard: ${errorMessage}`,
        error: errorMessage,
      };
    }
  },
});
