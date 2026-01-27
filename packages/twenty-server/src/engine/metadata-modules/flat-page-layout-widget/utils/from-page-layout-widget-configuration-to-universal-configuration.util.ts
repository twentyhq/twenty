import { isDefined } from 'twenty-shared/utils';

import {
  FlatEntityMapsException,
  FlatEntityMapsExceptionCode,
} from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';
import { type FlatPageLayoutWidget } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget.type';
import { type PageLayoutWidgetEntity } from 'src/engine/metadata-modules/page-layout-widget/entities/page-layout-widget.entity';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';

type PageLayoutWidgetConfiguration = PageLayoutWidgetEntity['configuration'];

type UniversalPageLayoutWidgetConfiguration = NonNullable<
  FlatPageLayoutWidget['__universal']
>['configuration'];

const getFieldMetadataUniversalIdentifierOrThrow = ({
  fieldMetadataId,
  fieldMetadataIdToUniversalIdentifierMap,
  pageLayoutWidgetId,
}: {
  fieldMetadataId: string;
  fieldMetadataIdToUniversalIdentifierMap: Map<string, string>;
  pageLayoutWidgetId: string;
}): string => {
  const universalIdentifier =
    fieldMetadataIdToUniversalIdentifierMap.get(fieldMetadataId);

  if (!isDefined(universalIdentifier)) {
    throw new FlatEntityMapsException(
      `FieldMetadata with id ${fieldMetadataId} not found for pageLayoutWidget configuration ${pageLayoutWidgetId}`,
      FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
    );
  }

  return universalIdentifier;
};

export const fromPageLayoutWidgetConfigurationToUniversalConfiguration = ({
  configuration,
  fieldMetadataIdToUniversalIdentifierMap,
  pageLayoutWidgetId,
}: {
  configuration: PageLayoutWidgetConfiguration;
  fieldMetadataIdToUniversalIdentifierMap: Map<string, string>;
  pageLayoutWidgetId: string;
}): UniversalPageLayoutWidgetConfiguration => {
  switch (configuration.configurationType) {
    case WidgetConfigurationType.AGGREGATE_CHART: {
      const { aggregateFieldMetadataId, ratioAggregateConfig, ...rest } =
        configuration;

      return {
        ...rest,
        aggregateFieldMetadataUniversalIdentifier:
          getFieldMetadataUniversalIdentifierOrThrow({
            fieldMetadataId: aggregateFieldMetadataId,
            fieldMetadataIdToUniversalIdentifierMap,
            pageLayoutWidgetId,
          }),
        ...(isDefined(ratioAggregateConfig) && {
          ratioAggregateConfig: {
            optionValue: ratioAggregateConfig.optionValue,
            fieldMetadataUniversalIdentifier:
              getFieldMetadataUniversalIdentifierOrThrow({
                fieldMetadataId: ratioAggregateConfig.fieldMetadataId,
                fieldMetadataIdToUniversalIdentifierMap,
                pageLayoutWidgetId,
              }),
          },
        }),
      };
    }

    case WidgetConfigurationType.GAUGE_CHART: {
      const { aggregateFieldMetadataId, ...rest } = configuration;

      return {
        ...rest,
        aggregateFieldMetadataUniversalIdentifier:
          getFieldMetadataUniversalIdentifierOrThrow({
            fieldMetadataId: aggregateFieldMetadataId,
            fieldMetadataIdToUniversalIdentifierMap,
            pageLayoutWidgetId,
          }),
      };
    }

    case WidgetConfigurationType.PIE_CHART: {
      const { aggregateFieldMetadataId, groupByFieldMetadataId, ...rest } =
        configuration;

      return {
        ...rest,
        aggregateFieldMetadataUniversalIdentifier:
          getFieldMetadataUniversalIdentifierOrThrow({
            fieldMetadataId: aggregateFieldMetadataId,
            fieldMetadataIdToUniversalIdentifierMap,
            pageLayoutWidgetId,
          }),
        groupByFieldMetadataUniversalIdentifier:
          getFieldMetadataUniversalIdentifierOrThrow({
            fieldMetadataId: groupByFieldMetadataId,
            fieldMetadataIdToUniversalIdentifierMap,
            pageLayoutWidgetId,
          }),
      };
    }

    case WidgetConfigurationType.BAR_CHART: {
      const {
        aggregateFieldMetadataId,
        primaryAxisGroupByFieldMetadataId,
        secondaryAxisGroupByFieldMetadataId,
        ...rest
      } = configuration;

      return {
        ...rest,
        aggregateFieldMetadataUniversalIdentifier:
          getFieldMetadataUniversalIdentifierOrThrow({
            fieldMetadataId: aggregateFieldMetadataId,
            fieldMetadataIdToUniversalIdentifierMap,
            pageLayoutWidgetId,
          }),
        primaryAxisGroupByFieldMetadataUniversalIdentifier:
          getFieldMetadataUniversalIdentifierOrThrow({
            fieldMetadataId: primaryAxisGroupByFieldMetadataId,
            fieldMetadataIdToUniversalIdentifierMap,
            pageLayoutWidgetId,
          }),
        ...(isDefined(secondaryAxisGroupByFieldMetadataId) && {
          secondaryAxisGroupByFieldMetadataUniversalIdentifier:
            getFieldMetadataUniversalIdentifierOrThrow({
              fieldMetadataId: secondaryAxisGroupByFieldMetadataId,
              fieldMetadataIdToUniversalIdentifierMap,
              pageLayoutWidgetId,
            }),
        }),
      };
    }

    case WidgetConfigurationType.LINE_CHART: {
      const {
        aggregateFieldMetadataId,
        primaryAxisGroupByFieldMetadataId,
        secondaryAxisGroupByFieldMetadataId,
        ...rest
      } = configuration;

      return {
        ...rest,
        aggregateFieldMetadataUniversalIdentifier:
          getFieldMetadataUniversalIdentifierOrThrow({
            fieldMetadataId: aggregateFieldMetadataId,
            fieldMetadataIdToUniversalIdentifierMap,
            pageLayoutWidgetId,
          }),
        primaryAxisGroupByFieldMetadataUniversalIdentifier:
          getFieldMetadataUniversalIdentifierOrThrow({
            fieldMetadataId: primaryAxisGroupByFieldMetadataId,
            fieldMetadataIdToUniversalIdentifierMap,
            pageLayoutWidgetId,
          }),
        ...(isDefined(secondaryAxisGroupByFieldMetadataId) && {
          secondaryAxisGroupByFieldMetadataUniversalIdentifier:
            getFieldMetadataUniversalIdentifierOrThrow({
              fieldMetadataId: secondaryAxisGroupByFieldMetadataId,
              fieldMetadataIdToUniversalIdentifierMap,
              pageLayoutWidgetId,
            }),
        }),
      };
    }

    case WidgetConfigurationType.VIEW:
    case WidgetConfigurationType.FIELD:
    case WidgetConfigurationType.FIELDS:
    case WidgetConfigurationType.TIMELINE:
    case WidgetConfigurationType.TASKS:
    case WidgetConfigurationType.NOTES:
    case WidgetConfigurationType.FILES:
    case WidgetConfigurationType.EMAILS:
    case WidgetConfigurationType.CALENDAR:
    case WidgetConfigurationType.FIELD_RICH_TEXT:
    case WidgetConfigurationType.WORKFLOW:
    case WidgetConfigurationType.WORKFLOW_VERSION:
    case WidgetConfigurationType.WORKFLOW_RUN:
    case WidgetConfigurationType.FRONT_COMPONENT:
    case WidgetConfigurationType.IFRAME:
    case WidgetConfigurationType.STANDALONE_RICH_TEXT:
      return configuration;
  }
};
