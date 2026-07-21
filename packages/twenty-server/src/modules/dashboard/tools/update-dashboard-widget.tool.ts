import { isNonEmptyString } from '@sniptt/guards';
import { isDefined, isEmptyObject } from 'twenty-shared/utils';
import { z } from 'zod';

import { type WidgetType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-type.enum';
import { type AllPageLayoutWidgetConfiguration } from 'src/engine/metadata-modules/page-layout-widget/types/all-page-layout-widget-configuration.type';
import {
  gridPositionSchema,
  widgetConfigurationSchemaWithoutDefaults,
  widgetTypeSchema,
} from 'src/modules/dashboard/tools/schemas/widget.schema';
import {
  type DashboardToolContext,
  type DashboardToolDependencies,
} from 'src/modules/dashboard/tools/types/dashboard-tool-dependencies.type';
import { type WidgetConfigurationInput } from 'src/modules/dashboard/tools/types/widget-configuration-input.type';
import { computeDashboardIdentifierMaps } from 'src/modules/dashboard/tools/utils/compute-dashboard-identifier-maps.util';
import {
  getObjectMetadataId,
  resolveConfigurationFieldNamesToIds,
} from 'src/modules/dashboard/tools/utils/resolve-widget-field-names-to-metadata-ids.util';

const updateDashboardWidgetSchema = z.object({
  widgetId: z.string().uuid().describe('The UUID of the widget to update'),
  title: z.string().optional().describe('New widget title'),
  type: widgetTypeSchema.optional().describe('New widget type'),
  gridPosition: gridPositionSchema
    .optional()
    .describe('New position and size in the grid layout'),
  objectMetadataId: z
    .uuid()
    .optional()
    .describe('New object metadata ID. Provide this or objectName.'),
  objectName: z
    .string()
    .optional()
    .describe(
      'New object name, singular or plural. Resolved to a UUID — alternative to objectMetadataId.',
    ),
  configuration: widgetConfigurationSchemaWithoutDefaults.optional(),
});

export const createUpdateDashboardWidgetTool = (
  deps: Pick<
    DashboardToolDependencies,
    'pageLayoutWidgetService' | 'flatEntityMapsCacheService'
  >,
  context: DashboardToolContext,
) => ({
  name: 'update_dashboard_widget' as const,
  description: `Update an existing widget's properties, position, or configuration.

Use get_dashboard first to find the widgetId.

You can reference the object and fields by NAME instead of UUID: pass objectName and the *FieldName variants in configuration (aggregateFieldName, primaryAxisGroupByFieldName, secondaryAxisGroupByFieldName, groupByFieldName) and fieldName inside filter recordFilters. They are resolved server-side against the widget object, falling back to the widget's existing object when you don't change it. UUID variants still work and take precedence.

Only provide fields you want to change - others remain unchanged.`,
  inputSchema: updateDashboardWidgetSchema,
  execute: async (parameters: {
    widgetId: string;
    title?: string;
    type?: WidgetType;
    gridPosition?: {
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
      const { widgetId, objectName, configuration, ...rest } = parameters;

      const hasConfigurationUpdate =
        isDefined(configuration) && !isEmptyObject(configuration);
      const shouldResolveIdentifiers =
        hasConfigurationUpdate || isNonEmptyString(objectName);

      let resolvedObjectMetadataId = rest.objectMetadataId;
      let resolvedConfiguration: AllPageLayoutWidgetConfiguration | undefined;

      if (shouldResolveIdentifiers) {
        const identifierMaps = await computeDashboardIdentifierMaps(
          deps,
          context,
        );

        resolvedObjectMetadataId = getObjectMetadataId({
          objectMetadataId: rest.objectMetadataId,
          objectName,
          maps: identifierMaps,
        });

        if (isDefined(configuration) && !isEmptyObject(configuration)) {
          const objectMetadataIdForFields =
            resolvedObjectMetadataId ??
            (
              await deps.pageLayoutWidgetService.findByIdOrThrow({
                id: widgetId,
                workspaceId: context.workspaceId,
              })
            ).objectMetadataId;

          resolvedConfiguration = resolveConfigurationFieldNamesToIds(
            configuration,
            objectMetadataIdForFields,
            identifierMaps,
          );
        }
      }

      const updateData = Object.fromEntries(
        Object.entries({
          ...rest,
          objectMetadataId: resolvedObjectMetadataId,
          configuration: resolvedConfiguration,
        }).filter(([key, value]) => {
          if (!isDefined(value)) {
            return false;
          }
          if (key === 'configuration' && isEmptyObject(value)) {
            return false;
          }

          return true;
        }),
      );

      const widget = await deps.pageLayoutWidgetService.update({
        id: widgetId,
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
          gridPosition: widget.gridPosition,
          configuration: widget.configuration,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to update widget: ${error.message}`,
        error: error.message,
      };
    }
  },
});
