import { isNonEmptyString } from '@sniptt/guards';
import { isDefined, isEmptyObject } from 'twenty-shared/utils';
import { z } from 'zod';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';

import {
  type PageLayoutWidgetPosition,
  type WidgetType,
} from 'twenty-shared/types';
import { type AllPageLayoutWidgetConfiguration } from 'src/engine/metadata-modules/page-layout-widget/types/all-page-layout-widget-configuration.type';
import {
  widgetPositionSchema,
  widgetConfigurationSchemaWithoutDefaults,
  widgetTypeSchema,
} from 'src/engine/metadata-modules/page-layout/tools/schemas/widget.schema';
import {
  type PageLayoutToolContext,
  type PageLayoutToolDependencies,
} from 'src/engine/metadata-modules/page-layout/tools/types/page-layout-tool-dependencies.type';
import { type WidgetConfigurationInput } from 'src/engine/metadata-modules/page-layout/tools/types/widget-configuration-input.type';
import {
  getObjectMetadataId,
  resolveConfigurationFieldNamesToIds,
} from 'src/engine/metadata-modules/page-layout/tools/utils/resolve-widget-field-names-to-metadata-ids.util';

const updatePageLayoutWidgetSchema = z.object({
  widgetId: z.string().uuid().describe('The UUID of the widget to update'),
  title: z.string().optional().describe('New widget title'),
  type: widgetTypeSchema.optional().describe('New widget type'),
  position: widgetPositionSchema
    .optional()
    .describe(
      'New position matching the tab layoutMode: grid coordinates or vertical-list index',
    ),
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

export const createUpdatePageLayoutWidgetTool = (
  deps: {
    pageLayoutToolService: PageLayoutToolDependencies['pageLayoutToolService'];
    pageLayoutWidgetService: Pick<
      PageLayoutToolDependencies['pageLayoutWidgetService'],
      'findByIdOrThrow' | 'update'
    >;
  },
  context: PageLayoutToolContext,
) => ({
  name: 'update_page_layout_widget' as const,
  description: `Update a widget's properties, position, or configuration in a page layout (dashboard or record page).

Use get_dashboard or list_record_page_layouts first to find the widgetId and tab layoutMode. Record-page changes affect the shared layout for that object, not only the currently open record.

You can reference the object and fields by NAME instead of UUID: pass objectName and the *FieldName variants in configuration (aggregateFieldName, primaryAxisGroupByFieldName, secondaryAxisGroupByFieldName, groupByFieldName) and fieldName inside filter recordFilters. They are resolved server-side against the widget object, falling back to the widget's existing object when you don't change it. UUID variants still work and take precedence.

Only provide fields you want to change - others remain unchanged.`,
  inputSchema: updatePageLayoutWidgetSchema,
  execute: async (parameters: {
    widgetId: string;
    title?: string;
    type?: WidgetType;
    position?: PageLayoutWidgetPosition;
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

      if (
        configuration?.configurationType ===
        WidgetConfigurationType.FRONT_COMPONENT
      ) {
        const existingWidget =
          await deps.pageLayoutWidgetService.findByIdOrThrow({
            id: widgetId,
            workspaceId: context.workspaceId,
          });
        await deps.pageLayoutToolService.assertFrontComponentWidgetAvailableOnPageLayoutOrThrow(
          {
            configuration,
            pageLayoutTabId: existingWidget.pageLayoutTabId,
            position: parameters.position,
            context,
          },
        );
      }

      if (shouldResolveIdentifiers) {
        const identifierMaps =
          await deps.pageLayoutToolService.computePageLayoutIdentifierMaps(
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
          position: widget.position,
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
