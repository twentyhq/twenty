import {
  FieldMetadataType,
  FILTERABLE_FIELD_TYPES,
  RelationType,
  type ChartRecordFilter,
  type ViewFilterOperand,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { getEffectiveFilterFieldType } from 'src/engine/metadata-modules/flat-field-metadata/utils/get-effective-filter-field-type.util';
import { getInvalidSelectFilterOptionValues } from 'src/engine/metadata-modules/flat-field-metadata/utils/get-invalid-select-filter-option-values.util';
import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { PageLayoutWidgetFieldValidationException } from 'src/engine/metadata-modules/page-layout-widget/exceptions/page-layout-widget-field-validation.exception';
import { type AllPageLayoutWidgetConfiguration } from 'src/engine/metadata-modules/page-layout-widget/types/all-page-layout-widget-configuration.type';
import { buildChartFieldValidationException } from 'src/engine/metadata-modules/page-layout-widget/utils/build-chart-field-validation-exception.util';
import { findActiveFlatFieldMetadataById } from 'src/engine/metadata-modules/page-layout-widget/utils/find-active-flat-field-metadata-by-id.util';
import { isChartReferencingFieldInConfiguration } from 'src/engine/metadata-modules/page-layout-widget/utils/is-chart-referencing-field-in-configuration.util';
import { validateGroupByFieldOrThrow } from 'src/engine/metadata-modules/page-layout-widget/utils/validate-group-by-field.util';
import { resolveEffectiveFlatEntityProperty } from 'src/engine/metadata-modules/overrides/utils/resolve-effective-flat-entity-property.util';

const FILTERABLE_FIELD_TYPE_SET: ReadonlySet<string> = new Set(
  FILTERABLE_FIELD_TYPES,
);

const validateGroupByFieldAsChartFieldOrThrow = (
  params: Parameters<typeof validateGroupByFieldOrThrow>[0],
  widgetTitle?: string | null,
): void => {
  try {
    validateGroupByFieldOrThrow(params);
  } catch (error) {
    if (!(error instanceof PageLayoutWidgetFieldValidationException)) {
      throw error;
    }

    throw buildChartFieldValidationException(error.message, widgetTitle);
  }
};

const validateSelectFilterOptionsOrThrow = ({
  recordFilter,
  filterField,
  widgetTitle,
}: {
  recordFilter: ChartRecordFilter;
  filterField: FlatFieldMetadata<
    FieldMetadataType.SELECT | FieldMetadataType.MULTI_SELECT
  >;
  widgetTitle?: string | null;
}): void => {
  if (!isDefined(recordFilter.value)) {
    return;
  }

  const invalidValues = getInvalidSelectFilterOptionValues({
    fieldMetadata: filterField,
    operand: recordFilter.operand as ViewFilterOperand,
    value: recordFilter.value,
  });

  if (invalidValues.length === 0) {
    return;
  }

  const invalidValuesText = invalidValues
    .map((value) => `"${value}"`)
    .join(', ');
  const allowedValuesText = filterField.options
    ?.map((option) => option.value)
    .map((optionValue) => `"${optionValue}"`)
    .join(', ');

  throw buildChartFieldValidationException(
    `Filter on "${filterField.label}" uses option(s) ${invalidValuesText} that do not exist. Allowed values: ${allowedValuesText}.`,
    widgetTitle,
  );
};

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

  if (!isDefined(widgetObjectMetadataId)) {
    throw buildChartFieldValidationException(
      'objectMetadataId is required for graph widgets.',
      widgetTitle,
    );
  }

  const objectMetadata = findFlatEntityByIdInFlatEntityMaps({
    flatEntityId: widgetObjectMetadataId,
    flatEntityMaps: flatObjectMetadataMaps,
  });

  if (
    !isDefined(objectMetadata) ||
    !resolveEffectiveFlatEntityProperty({
      metadataName: 'objectMetadata',
      flatEntity: objectMetadata,
      property: 'isActive',
    })
  ) {
    throw buildChartFieldValidationException(
      `objectMetadataId "${widgetObjectMetadataId}" not found.`,
      widgetTitle,
    );
  }

  const allFields = Object.values(flatFieldMetadataMaps.byUniversalIdentifier)
    .filter(isDefined)
    .filter((field) =>
      resolveEffectiveFlatEntityProperty({
        metadataName: 'fieldMetadata',
        flatEntity: field,
        property: 'isActive',
      }),
    );

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
    throw buildChartFieldValidationException(
      `aggregateFieldMetadataId "${widgetConfiguration.aggregateFieldMetadataId}" not found.`,
      widgetTitle,
    );
  }

  if (aggregateField.objectMetadataId !== widgetObjectMetadataId) {
    throw buildChartFieldValidationException(
      `aggregateFieldMetadataId must belong to objectMetadataId "${widgetObjectMetadataId}".`,
      widgetTitle,
    );
  }

  switch (widgetConfiguration.configurationType) {
    case WidgetConfigurationType.BAR_CHART:
    case WidgetConfigurationType.LINE_CHART: {
      validateGroupByFieldAsChartFieldOrThrow(
        {
          fieldId: widgetConfiguration.primaryAxisGroupByFieldMetadataId,
          subFieldName: widgetConfiguration.primaryAxisGroupBySubFieldName,
          paramName: 'primaryAxisGroupByFieldMetadataId',
          objectMetadataId: widgetObjectMetadataId,
          flatFieldMetadataMaps,
          allFields,
          fieldsByObjectId,
        },
        widgetTitle,
      );

      if (isDefined(widgetConfiguration.secondaryAxisGroupBySubFieldName)) {
        if (
          !isDefined(widgetConfiguration.secondaryAxisGroupByFieldMetadataId)
        ) {
          throw buildChartFieldValidationException(
            'secondaryAxisGroupByFieldMetadataId is required when secondaryAxisGroupBySubFieldName is provided.',
            widgetTitle,
          );
        }
      }

      if (isDefined(widgetConfiguration.secondaryAxisGroupByFieldMetadataId)) {
        validateGroupByFieldAsChartFieldOrThrow(
          {
            fieldId: widgetConfiguration.secondaryAxisGroupByFieldMetadataId,
            subFieldName: widgetConfiguration.secondaryAxisGroupBySubFieldName,
            paramName: 'secondaryAxisGroupByFieldMetadataId',
            objectMetadataId: widgetObjectMetadataId,
            flatFieldMetadataMaps,
            allFields,
            fieldsByObjectId,
          },
          widgetTitle,
        );
      }
      break;
    }
    case WidgetConfigurationType.PIE_CHART: {
      validateGroupByFieldAsChartFieldOrThrow(
        {
          fieldId: widgetConfiguration.groupByFieldMetadataId,
          subFieldName: widgetConfiguration.groupBySubFieldName,
          paramName: 'groupByFieldMetadataId',
          objectMetadataId: widgetObjectMetadataId,
          flatFieldMetadataMaps,
          allFields,
          fieldsByObjectId,
        },
        widgetTitle,
      );
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

        throw buildChartFieldValidationException(
          `One of the chart filters uses ${fieldLabel}, but it was deleted. Please remove or replace this filter rule.`,
          widgetTitle,
        );
      }

      if (filterField.objectMetadataId !== widgetObjectMetadataId) {
        throw buildChartFieldValidationException(
          `Filter field "${recordFilter.fieldMetadataId}" must belong to objectMetadataId "${widgetObjectMetadataId}".`,
          widgetTitle,
        );
      }

      if (
        isFlatFieldMetadataOfType(filterField, FieldMetadataType.SELECT) ||
        isFlatFieldMetadataOfType(filterField, FieldMetadataType.MULTI_SELECT)
      ) {
        validateSelectFilterOptionsOrThrow({
          recordFilter,
          filterField,
          widgetTitle,
        });
      }
    }
  }

  if (isDefined(widgetConfiguration.dashboardFilterBindings)) {
    for (const [slotId, binding] of Object.entries(
      widgetConfiguration.dashboardFilterBindings,
    )) {
      // null means the slot is explicitly not applied to this widget
      if (!isDefined(binding)) {
        continue;
      }

      const boundField = findActiveFlatFieldMetadataById(
        binding.fieldMetadataId,
        flatFieldMetadataMaps,
      );

      if (!isDefined(boundField)) {
        throw buildChartFieldValidationException(
          `Dashboard filter "${slotId}" is bound to field id "${binding.fieldMetadataId}", but it was deleted. Please remove or replace this binding.`,
          widgetTitle,
        );
      }

      if (boundField.objectMetadataId !== widgetObjectMetadataId) {
        throw buildChartFieldValidationException(
          `Dashboard filter "${slotId}" must be bound to a field of objectMetadataId "${widgetObjectMetadataId}".`,
          widgetTitle,
        );
      }

      let relationTargetField: FlatFieldMetadata | null = null;

      if (isDefined(binding.relationTargetFieldMetadataId)) {
        const isManyToOneRelation =
          isFlatFieldMetadataOfType(boundField, FieldMetadataType.RELATION) &&
          boundField.settings?.relationType === RelationType.MANY_TO_ONE;

        if (!isManyToOneRelation) {
          throw buildChartFieldValidationException(
            `Dashboard filter "${slotId}" sets a relation target field on "${boundField.label}", which is not a many-to-one relation.`,
            widgetTitle,
          );
        }

        relationTargetField = findActiveFlatFieldMetadataById(
          binding.relationTargetFieldMetadataId,
          flatFieldMetadataMaps,
        );

        if (!isDefined(relationTargetField)) {
          throw buildChartFieldValidationException(
            `Dashboard filter "${slotId}" targets field id "${binding.relationTargetFieldMetadataId}" through "${boundField.label}", but it was deleted. Please remove or replace this binding.`,
            widgetTitle,
          );
        }

        if (
          relationTargetField.objectMetadataId !==
          boundField.relationTargetObjectMetadataId
        ) {
          throw buildChartFieldValidationException(
            `Dashboard filter "${slotId}" targets field "${relationTargetField.label}", which does not belong to the object "${boundField.label}" points to.`,
            widgetTitle,
          );
        }
      }

      const effectiveFieldType = getEffectiveFilterFieldType({
        fieldType: boundField.type,
        relationTargetFieldType: relationTargetField?.type,
      });

      if (!FILTERABLE_FIELD_TYPE_SET.has(effectiveFieldType)) {
        throw buildChartFieldValidationException(
          `Dashboard filter "${slotId}" is bound to a field of type ${effectiveFieldType}, which cannot be filtered.`,
          widgetTitle,
        );
      }
    }
  }
};
