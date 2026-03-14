import { msg } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { WidgetType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-type.enum';
import {
  PageLayoutWidgetException,
  PageLayoutWidgetExceptionCode,
} from 'src/engine/metadata-modules/page-layout-widget/exceptions/page-layout-widget.exception';
import { type AllPageLayoutWidgetConfiguration } from 'src/engine/metadata-modules/page-layout-widget/types/all-page-layout-widget-configuration.type';
import { findActiveFlatFieldMetadataById } from 'src/engine/metadata-modules/page-layout-widget/utils/find-active-flat-field-metadata-by-id.util';
import { isChartFieldsForValidation } from 'src/engine/metadata-modules/page-layout-widget/utils/is-chart-fields-for-validation.util';
import { validateGroupByField } from 'src/engine/metadata-modules/page-layout-widget/utils/validate-group-by-field.util';

export const validateChartConfigurationFieldReferences = ({
  configuration,
  objectMetadataId,
  widgetType,
  widgetTitle,
  flatFieldMetadataMaps,
  flatObjectMetadataMaps,
}: {
  configuration?: AllPageLayoutWidgetConfiguration | null;
  objectMetadataId?: string | null;
  widgetType?: WidgetType | null;
  widgetTitle?: string | null;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
}): void => {
  if (!isDefined(configuration)) {
    return;
  }

  try {
    if (!isChartFieldsForValidation(configuration)) {
      if (widgetType === WidgetType.GRAPH) {
        throw new Error(
          'GRAPH widgets require configurationType AGGREGATE_CHART, BAR_CHART, GAUGE_CHART, LINE_CHART, or PIE_CHART.',
        );
      }

      return;
    }

    if (widgetType && widgetType !== WidgetType.GRAPH) {
      throw new Error(
        `Graph configuration is only valid for widgets of type GRAPH.`,
      );
    }

    if (!isDefined(objectMetadataId)) {
      throw new Error('objectMetadataId is required for graph widgets.');
    }

    const objectMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: objectMetadataId,
      flatEntityMaps: flatObjectMetadataMaps,
    });

    if (!isDefined(objectMetadata) || !objectMetadata.isActive) {
      throw new Error(`objectMetadataId "${objectMetadataId}" not found.`);
    }

    const allFields = Object.values(flatFieldMetadataMaps.byUniversalIdentifier)
      .filter(isDefined)
      .filter((field) => field.isActive);

    const fieldsByObjectId = new Map<string, FlatFieldMetadata[]>();

    allFields.forEach((field) => {
      const existing = fieldsByObjectId.get(field.objectMetadataId) ?? [];

      existing.push(field);
      fieldsByObjectId.set(field.objectMetadataId, existing);
    });

    const aggregateField = findActiveFlatFieldMetadataById(
      configuration.aggregateFieldMetadataId,
      flatFieldMetadataMaps,
    );

    if (!isDefined(aggregateField)) {
      throw new Error(
        `aggregateFieldMetadataId "${configuration.aggregateFieldMetadataId}" not found.`,
      );
    }

    if (aggregateField.objectMetadataId !== objectMetadataId) {
      throw new Error(
        `aggregateFieldMetadataId must belong to objectMetadataId "${objectMetadataId}".`,
      );
    }

    switch (configuration.configurationType) {
      case WidgetConfigurationType.BAR_CHART:
      case WidgetConfigurationType.LINE_CHART: {
        validateGroupByField({
          fieldId: configuration.primaryAxisGroupByFieldMetadataId,
          subFieldName: configuration.primaryAxisGroupBySubFieldName,
          paramName: 'primaryAxisGroupByFieldMetadataId',
          objectMetadataId,
          flatFieldMetadataMaps,
          allFields,
          fieldsByObjectId,
        });

        if (isDefined(configuration.secondaryAxisGroupBySubFieldName)) {
          if (!isDefined(configuration.secondaryAxisGroupByFieldMetadataId)) {
            throw new Error(
              'secondaryAxisGroupByFieldMetadataId is required when secondaryAxisGroupBySubFieldName is provided.',
            );
          }
        }

        if (isDefined(configuration.secondaryAxisGroupByFieldMetadataId)) {
          validateGroupByField({
            fieldId: configuration.secondaryAxisGroupByFieldMetadataId,
            subFieldName: configuration.secondaryAxisGroupBySubFieldName,
            paramName: 'secondaryAxisGroupByFieldMetadataId',
            objectMetadataId,
            flatFieldMetadataMaps,
            allFields,
            fieldsByObjectId,
          });
        }
        break;
      }
      case WidgetConfigurationType.PIE_CHART: {
        validateGroupByField({
          fieldId: configuration.groupByFieldMetadataId,
          subFieldName: configuration.groupBySubFieldName,
          paramName: 'groupByFieldMetadataId',
          objectMetadataId,
          flatFieldMetadataMaps,
          allFields,
          fieldsByObjectId,
        });
        break;
      }
      case WidgetConfigurationType.AGGREGATE_CHART:
      default:
        break;
    }

    if (isDefined(configuration.filter?.recordFilters)) {
      for (const recordFilter of configuration.filter.recordFilters) {
        const filterField = findActiveFlatFieldMetadataById(
          recordFilter.fieldMetadataId,
          flatFieldMetadataMaps,
        );

        if (!isDefined(filterField)) {
          const inactiveOrMissingField = findFlatEntityByIdInFlatEntityMaps({
            flatEntityId: recordFilter.fieldMetadataId,
            flatEntityMaps: flatFieldMetadataMaps,
          });

          const fieldLabel = inactiveOrMissingField
            ? `"${inactiveOrMissingField.label}"`
            : `field id "${recordFilter.fieldMetadataId}"`;

          throw new Error(
            `One of the chart filters uses ${fieldLabel}, but it was deleted. Please remove or replace this filter rule.`,
          );
        }

        if (filterField.objectMetadataId !== objectMetadataId) {
          throw new Error(
            `Filter field "${recordFilter.fieldMetadataId}" must belong to objectMetadataId "${objectMetadataId}".`,
          );
        }
      }
    }
  } catch (error) {
    if (error instanceof PageLayoutWidgetException) {
      throw error;
    }

    const chartContextPrefix = isDefined(widgetTitle)
      ? `Chart "${widgetTitle}": `
      : '';
    const chartValidationMessage =
      chartContextPrefix +
      (error instanceof Error ? error.message : String(error));

    throw new PageLayoutWidgetException(
      chartValidationMessage,
      PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
      {
        userFriendlyMessage: msg`${chartValidationMessage}`,
      },
    );
  }
};
