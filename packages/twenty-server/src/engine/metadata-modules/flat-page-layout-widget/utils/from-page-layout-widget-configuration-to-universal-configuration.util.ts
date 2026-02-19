import {
  type ChartFilter,
  type UniversalChartFilter,
} from 'twenty-shared/types';
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

const convertChartFilterToUniversalFilter = ({
  filter,
  fieldMetadataUniversalIdentifierById,
}: {
  filter: ChartFilter | undefined;
  fieldMetadataUniversalIdentifierById: Partial<Record<string, string>>;
  shouldThrowOnMissingIdentifier: boolean;
}): UniversalChartFilter | undefined => {
  if (!isDefined(filter)) {
    return undefined;
  }

  return {
    ...filter,
    recordFilters: filter.recordFilters?.map(
      ({ fieldMetadataId, ...rest }) => ({
        ...rest,
        fieldMetadataUniversalIdentifier: getFieldMetadataUniversalIdentifier({
          fieldMetadataId,
          fieldMetadataUniversalIdentifierById,
          shouldThrowOnMissingIdentifier: false,
        }),
      }),
    ),
  };
};

export const fromPageLayoutWidgetConfigurationToUniversalConfiguration = ({
  configuration,
  fieldMetadataUniversalIdentifierById,
  viewFieldGroupUniversalIdentifierById = {},
  shouldThrowOnMissingIdentifier = false,
}: {
  configuration: PageLayoutWidgetConfiguration;
  fieldMetadataUniversalIdentifierById: Partial<Record<string, string>>;
  viewFieldGroupUniversalIdentifierById?: Partial<Record<string, string>>;
  shouldThrowOnMissingIdentifier?: boolean;
}): UniversalPageLayoutWidgetConfiguration => {
  switch (configuration.configurationType) {
    case WidgetConfigurationType.AGGREGATE_CHART: {
      const {
        aggregateFieldMetadataId,
        ratioAggregateConfig,
        filter,
        ...rest
      } = configuration;

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
        filter: convertChartFilterToUniversalFilter({
          filter,
          fieldMetadataUniversalIdentifierById,
          shouldThrowOnMissingIdentifier,
        }),
      };
    }

    case WidgetConfigurationType.GAUGE_CHART: {
      const { aggregateFieldMetadataId, filter, ...rest } = configuration;

      const aggregateFieldMetadataUniversalIdentifier =
        getFieldMetadataUniversalIdentifier({
          fieldMetadataId: aggregateFieldMetadataId,
          fieldMetadataUniversalIdentifierById,
          shouldThrowOnMissingIdentifier,
        });

      return {
        ...rest,
        aggregateFieldMetadataUniversalIdentifier,
        filter: convertChartFilterToUniversalFilter({
          filter,
          fieldMetadataUniversalIdentifierById,
          shouldThrowOnMissingIdentifier,
        }),
      };
    }

    case WidgetConfigurationType.PIE_CHART: {
      const {
        aggregateFieldMetadataId,
        groupByFieldMetadataId,
        filter,
        ...rest
      } = configuration;

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
        filter: convertChartFilterToUniversalFilter({
          filter,
          fieldMetadataUniversalIdentifierById,
          shouldThrowOnMissingIdentifier,
        }),
      };
    }

    case WidgetConfigurationType.BAR_CHART: {
      const {
        aggregateFieldMetadataId,
        primaryAxisGroupByFieldMetadataId,
        secondaryAxisGroupByFieldMetadataId,
        filter,
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
        filter: convertChartFilterToUniversalFilter({
          filter,
          fieldMetadataUniversalIdentifierById,
          shouldThrowOnMissingIdentifier,
        }),
      };
    }

    case WidgetConfigurationType.LINE_CHART: {
      const {
        aggregateFieldMetadataId,
        primaryAxisGroupByFieldMetadataId,
        secondaryAxisGroupByFieldMetadataId,
        filter,
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
        filter: convertChartFilterToUniversalFilter({
          filter,
          fieldMetadataUniversalIdentifierById,
          shouldThrowOnMissingIdentifier,
        }),
      };
    }

    case WidgetConfigurationType.FIELDS: {
      const { newFieldDefaultConfiguration, ...rest } = configuration;

      if (!isDefined(newFieldDefaultConfiguration)) {
        return configuration;
      }

      let viewFieldGroupUniversalIdentifier: string | null = null;

      if (isDefined(newFieldDefaultConfiguration.viewFieldGroupId)) {
        viewFieldGroupUniversalIdentifier =
          viewFieldGroupUniversalIdentifierById[
            newFieldDefaultConfiguration.viewFieldGroupId
          ] ?? null;

        if (
          !isDefined(viewFieldGroupUniversalIdentifier) &&
          shouldThrowOnMissingIdentifier
        ) {
          throw new FlatEntityMapsException(
            `View field group universal identifier not found for id: ${newFieldDefaultConfiguration.viewFieldGroupId}`,
            FlatEntityMapsExceptionCode.RELATION_UNIVERSAL_IDENTIFIER_NOT_FOUND,
          );
        }
      }

      return {
        ...rest,
        newFieldDefaultConfiguration: {
          isVisible: newFieldDefaultConfiguration.isVisible,
          viewFieldGroupId: viewFieldGroupUniversalIdentifier,
        },
      };
    }

    case WidgetConfigurationType.VIEW:
    case WidgetConfigurationType.FIELD:
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
