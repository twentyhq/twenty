import { msg } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import {
  PageLayoutWidgetException,
  PageLayoutWidgetExceptionCode,
} from 'src/engine/metadata-modules/page-layout-widget/exceptions/page-layout-widget.exception';
import { type AllPageLayoutWidgetConfiguration } from 'src/engine/metadata-modules/page-layout-widget/types/all-page-layout-widget-configuration.type';
import { isChartReferencingFieldInConfiguration } from 'src/engine/metadata-modules/page-layout-widget/utils/is-chart-referencing-field-in-configuration.util';
import { findActiveFlatFieldMetadataById } from 'src/engine/metadata-modules/page-layout-widget/utils/find-active-flat-field-metadata-by-id.util';
import { validateGroupByFieldOrThrow } from 'src/engine/metadata-modules/page-layout-widget/utils/validate-group-by-field.util';

export const validateChartConfigurationFieldReferencesOrThrow = ({
  widgetConfiguration,
  widgetObjectMetadataId,
  widgetTitle,
  flatFieldMetadataMaps,
  flatObjectMetadataMaps,
}: {
  widgetConfiguration?: AllPageLayoutWidgetConfiguration | null;
  widgetObjectMetadataId?: string | null;
  widgetTitle?: string | null;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
}): void => {
  if (!isDefined(widgetConfiguration)) {
    return;
  }

  if (!isChartReferencingFieldInConfiguration(widgetConfiguration)) {
    return;
  }

  try {
    if (!isDefined(widgetObjectMetadataId)) {
      throw new Error('objectMetadataId is required for graph widgets.');
    }

    const objectMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: widgetObjectMetadataId,
      flatEntityMaps: flatObjectMetadataMaps,
    });

    if (!isDefined(objectMetadata) || !objectMetadata.isActive) {
      throw new Error(
        `objectMetadataId "${widgetObjectMetadataId}" not found.`,
      );
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
      widgetConfiguration.aggregateFieldMetadataId,
      flatFieldMetadataMaps,
    );

    if (!isDefined(aggregateField)) {
      throw new Error(
        `aggregateFieldMetadataId "${widgetConfiguration.aggregateFieldMetadataId}" not found.`,
      );
    }

    if (aggregateField.objectMetadataId !== widgetObjectMetadataId) {
      throw new Error(
        `aggregateFieldMetadataId must belong to objectMetadataId "${widgetObjectMetadataId}".`,
      );
    }

    switch (widgetConfiguration.configurationType) {
      case WidgetConfigurationType.BAR_CHART:
      case WidgetConfigurationType.LINE_CHART: {
        validateGroupByFieldOrThrow({
          fieldId: widgetConfiguration.primaryAxisGroupByFieldMetadataId,
          subFieldName: widgetConfiguration.primaryAxisGroupBySubFieldName,
          paramName: 'primaryAxisGroupByFieldMetadataId',
          objectMetadataId: widgetObjectMetadataId,
          flatFieldMetadataMaps,
          allFields,
          fieldsByObjectId,
        });

        if (isDefined(widgetConfiguration.secondaryAxisGroupBySubFieldName)) {
          if (
            !isDefined(widgetConfiguration.secondaryAxisGroupByFieldMetadataId)
          ) {
            throw new Error(
              'secondaryAxisGroupByFieldMetadataId is required when secondaryAxisGroupBySubFieldName is provided.',
            );
          }
        }

        if (
          isDefined(widgetConfiguration.secondaryAxisGroupByFieldMetadataId)
        ) {
          validateGroupByFieldOrThrow({
            fieldId: widgetConfiguration.secondaryAxisGroupByFieldMetadataId,
            subFieldName: widgetConfiguration.secondaryAxisGroupBySubFieldName,
            paramName: 'secondaryAxisGroupByFieldMetadataId',
            objectMetadataId: widgetObjectMetadataId,
            flatFieldMetadataMaps,
            allFields,
            fieldsByObjectId,
          });
        }
        break;
      }
      case WidgetConfigurationType.PIE_CHART: {
        validateGroupByFieldOrThrow({
          fieldId: widgetConfiguration.groupByFieldMetadataId,
          subFieldName: widgetConfiguration.groupBySubFieldName,
          paramName: 'groupByFieldMetadataId',
          objectMetadataId: widgetObjectMetadataId,
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

    if (isDefined(widgetConfiguration.filter?.recordFilters)) {
      for (const recordFilter of widgetConfiguration.filter.recordFilters) {
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

        if (filterField.objectMetadataId !== widgetObjectMetadataId) {
          throw new Error(
            `Filter field "${recordFilter.fieldMetadataId}" must belong to objectMetadataId "${widgetObjectMetadataId}".`,
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
