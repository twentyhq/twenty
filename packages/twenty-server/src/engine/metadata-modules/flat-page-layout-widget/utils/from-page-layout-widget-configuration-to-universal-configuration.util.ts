import { isDefined } from 'twenty-shared/utils';

import {
  FlatEntityMapsException,
  FlatEntityMapsExceptionCode,
} from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';
import { type FlatPageLayoutWidget } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget.type';
import { type PageLayoutWidgetEntity } from 'src/engine/metadata-modules/page-layout-widget/entities/page-layout-widget.entity';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';

type PageLayoutWidgetConfiguration = PageLayoutWidgetEntity['configuration'];

type UniversalPageLayoutWidgetConfiguration =
  NonNullable<FlatPageLayoutWidget>['universalConfiguration'];

const getFieldMetadataUniversalIdentifier = ({
  fieldMetadataId,
  fieldMetadataUniversalIdentifierById,
  shouldThrowOnMissingIdentifier,
}: {
  fieldMetadataId: string;
  fieldMetadataUniversalIdentifierById: Partial<Record<string, string>>;
  shouldThrowOnMissingIdentifier: boolean;
}): string | null => {
  const universalIdentifier =
    fieldMetadataUniversalIdentifierById[fieldMetadataId];

  if (!isDefined(universalIdentifier)) {
    if (shouldThrowOnMissingIdentifier) {
      throw new FlatEntityMapsException(
        `Field metadata universal identifier not found for id: ${fieldMetadataId}`,
        FlatEntityMapsExceptionCode.RELATION_UNIVERSAL_IDENTIFIER_NOT_FOUND,
      );
    }

    return null;
  }

  return universalIdentifier;
};

export const fromPageLayoutWidgetConfigurationToUniversalConfiguration = ({
  configuration,
  fieldMetadataUniversalIdentifierById,
  shouldThrowOnMissingIdentifier = false,
}: {
  configuration: PageLayoutWidgetConfiguration;
  fieldMetadataUniversalIdentifierById: Partial<Record<string, string>>;
  shouldThrowOnMissingIdentifier?: boolean;
}): UniversalPageLayoutWidgetConfiguration => {
  switch (configuration.configurationType) {
    case WidgetConfigurationType.AGGREGATE_CHART: {
      const { aggregateFieldMetadataId, ratioAggregateConfig, ...rest } =
        configuration;

      const aggregateFieldMetadataUniversalIdentifier =
        getFieldMetadataUniversalIdentifier({
          fieldMetadataId: aggregateFieldMetadataId,
          fieldMetadataUniversalIdentifierById,
          shouldThrowOnMissingIdentifier,
        });

      const universalRatioAggregateConfig = isDefined(ratioAggregateConfig)
        ? {
            optionValue: ratioAggregateConfig.optionValue,
            fieldMetadataUniversalIdentifier:
              getFieldMetadataUniversalIdentifier({
                fieldMetadataId: ratioAggregateConfig.fieldMetadataId,
                fieldMetadataUniversalIdentifierById,
                shouldThrowOnMissingIdentifier,
              }),
          }
        : undefined;

      return {
        ...rest,
        aggregateFieldMetadataUniversalIdentifier,
        ratioAggregateConfig: universalRatioAggregateConfig,
      };
    }

    case WidgetConfigurationType.GAUGE_CHART: {
      const { aggregateFieldMetadataId, ...rest } = configuration;

      const aggregateFieldMetadataUniversalIdentifier =
        getFieldMetadataUniversalIdentifier({
          fieldMetadataId: aggregateFieldMetadataId,
          fieldMetadataUniversalIdentifierById,
          shouldThrowOnMissingIdentifier,
        });

      return {
        ...rest,
        aggregateFieldMetadataUniversalIdentifier,
      };
    }

    case WidgetConfigurationType.PIE_CHART: {
      const { aggregateFieldMetadataId, groupByFieldMetadataId, ...rest } =
        configuration;

      const aggregateFieldMetadataUniversalIdentifier =
        getFieldMetadataUniversalIdentifier({
          fieldMetadataId: aggregateFieldMetadataId,
          fieldMetadataUniversalIdentifierById,
          shouldThrowOnMissingIdentifier,
        });

      const groupByFieldMetadataUniversalIdentifier =
        getFieldMetadataUniversalIdentifier({
          fieldMetadataId: groupByFieldMetadataId,
          fieldMetadataUniversalIdentifierById,
          shouldThrowOnMissingIdentifier,
        });

      return {
        ...rest,
        aggregateFieldMetadataUniversalIdentifier,
        groupByFieldMetadataUniversalIdentifier,
      };
    }

    case WidgetConfigurationType.BAR_CHART: {
      const {
        aggregateFieldMetadataId,
        primaryAxisGroupByFieldMetadataId,
        secondaryAxisGroupByFieldMetadataId,
        ...rest
      } = configuration;

      const aggregateFieldMetadataUniversalIdentifier =
        getFieldMetadataUniversalIdentifier({
          fieldMetadataId: aggregateFieldMetadataId,
          fieldMetadataUniversalIdentifierById,
          shouldThrowOnMissingIdentifier,
        });

      const primaryAxisGroupByFieldMetadataUniversalIdentifier =
        getFieldMetadataUniversalIdentifier({
          fieldMetadataId: primaryAxisGroupByFieldMetadataId,
          fieldMetadataUniversalIdentifierById,
          shouldThrowOnMissingIdentifier,
        });

      const secondaryAxisGroupByFieldMetadataUniversalIdentifier = isDefined(
        secondaryAxisGroupByFieldMetadataId,
      )
        ? getFieldMetadataUniversalIdentifier({
            fieldMetadataId: secondaryAxisGroupByFieldMetadataId,
            fieldMetadataUniversalIdentifierById,
            shouldThrowOnMissingIdentifier,
          })
        : undefined;

      return {
        ...rest,
        aggregateFieldMetadataUniversalIdentifier,
        primaryAxisGroupByFieldMetadataUniversalIdentifier,
        secondaryAxisGroupByFieldMetadataUniversalIdentifier,
      };
    }

    case WidgetConfigurationType.LINE_CHART: {
      const {
        aggregateFieldMetadataId,
        primaryAxisGroupByFieldMetadataId,
        secondaryAxisGroupByFieldMetadataId,
        ...rest
      } = configuration;

      const aggregateFieldMetadataUniversalIdentifier =
        getFieldMetadataUniversalIdentifier({
          fieldMetadataId: aggregateFieldMetadataId,
          fieldMetadataUniversalIdentifierById,
          shouldThrowOnMissingIdentifier,
        });

      const primaryAxisGroupByFieldMetadataUniversalIdentifier =
        getFieldMetadataUniversalIdentifier({
          fieldMetadataId: primaryAxisGroupByFieldMetadataId,
          fieldMetadataUniversalIdentifierById,
          shouldThrowOnMissingIdentifier,
        });

      const secondaryAxisGroupByFieldMetadataUniversalIdentifier = isDefined(
        secondaryAxisGroupByFieldMetadataId,
      )
        ? getFieldMetadataUniversalIdentifier({
            fieldMetadataId: secondaryAxisGroupByFieldMetadataId,
            fieldMetadataUniversalIdentifierById,
            shouldThrowOnMissingIdentifier,
          })
        : undefined;

      return {
        ...rest,
        aggregateFieldMetadataUniversalIdentifier,
        primaryAxisGroupByFieldMetadataUniversalIdentifier,
        secondaryAxisGroupByFieldMetadataUniversalIdentifier,
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
