import { isDefined } from 'twenty-shared/utils';

import { type FlatPageLayoutWidget } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget.type';
import { type PageLayoutWidgetEntity } from 'src/engine/metadata-modules/page-layout-widget/entities/page-layout-widget.entity';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';

type PageLayoutWidgetConfiguration = PageLayoutWidgetEntity['configuration'];

type UniversalPageLayoutWidgetConfiguration =
  NonNullable<FlatPageLayoutWidget>['universalConfiguration'];

// Field metadata IDs in widget configurations might references non existing entities
const getFieldMetadataUniversalIdentifier = ({
  fieldMetadataId,
  fieldMetadataIdToUniversalIdentifierMap,
}: {
  fieldMetadataId: string;
  fieldMetadataIdToUniversalIdentifierMap: Map<string, string>;
}): string | null => {
  return fieldMetadataIdToUniversalIdentifierMap.get(fieldMetadataId) ?? null;
};

export const fromPageLayoutWidgetConfigurationToUniversalConfiguration = ({
  configuration,
  fieldMetadataIdToUniversalIdentifierMap,
}: {
  configuration: PageLayoutWidgetConfiguration;
  fieldMetadataIdToUniversalIdentifierMap: Map<string, string>;
}): UniversalPageLayoutWidgetConfiguration => {
  switch (configuration.configurationType) {
    case WidgetConfigurationType.AGGREGATE_CHART: {
      const { aggregateFieldMetadataId, ratioAggregateConfig, ...rest } =
        configuration;

      const aggregateFieldMetadataUniversalIdentifier =
        getFieldMetadataUniversalIdentifier({
          fieldMetadataId: aggregateFieldMetadataId,
          fieldMetadataIdToUniversalIdentifierMap,
        });

      const universalRatioAggregateConfig = isDefined(ratioAggregateConfig)
        ? {
            optionValue: ratioAggregateConfig.optionValue,
            fieldMetadataUniversalIdentifier:
              getFieldMetadataUniversalIdentifier({
                fieldMetadataId: ratioAggregateConfig.fieldMetadataId,
                fieldMetadataIdToUniversalIdentifierMap,
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
          fieldMetadataIdToUniversalIdentifierMap,
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
          fieldMetadataIdToUniversalIdentifierMap,
        });

      const groupByFieldMetadataUniversalIdentifier =
        getFieldMetadataUniversalIdentifier({
          fieldMetadataId: groupByFieldMetadataId,
          fieldMetadataIdToUniversalIdentifierMap,
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
          fieldMetadataIdToUniversalIdentifierMap,
        });

      const primaryAxisGroupByFieldMetadataUniversalIdentifier =
        getFieldMetadataUniversalIdentifier({
          fieldMetadataId: primaryAxisGroupByFieldMetadataId,
          fieldMetadataIdToUniversalIdentifierMap,
        });

      const secondaryAxisGroupByFieldMetadataUniversalIdentifier = isDefined(
        secondaryAxisGroupByFieldMetadataId,
      )
        ? getFieldMetadataUniversalIdentifier({
            fieldMetadataId: secondaryAxisGroupByFieldMetadataId,
            fieldMetadataIdToUniversalIdentifierMap,
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
          fieldMetadataIdToUniversalIdentifierMap,
        });

      const primaryAxisGroupByFieldMetadataUniversalIdentifier =
        getFieldMetadataUniversalIdentifier({
          fieldMetadataId: primaryAxisGroupByFieldMetadataId,
          fieldMetadataIdToUniversalIdentifierMap,
        });

      const secondaryAxisGroupByFieldMetadataUniversalIdentifier = isDefined(
        secondaryAxisGroupByFieldMetadataId,
      )
        ? getFieldMetadataUniversalIdentifier({
            fieldMetadataId: secondaryAxisGroupByFieldMetadataId,
            fieldMetadataIdToUniversalIdentifierMap,
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
