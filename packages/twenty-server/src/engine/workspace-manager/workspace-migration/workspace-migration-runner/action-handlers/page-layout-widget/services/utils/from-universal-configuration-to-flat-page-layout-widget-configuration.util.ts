import {
  type ChartFilter,
  type UniversalChartFilter,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import {
  FlatEntityMapsException,
  FlatEntityMapsExceptionCode,
} from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';
import { type MetadataFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity-maps.type';
import { findFlatEntityByUniversalIdentifierOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier-or-throw.util';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatPageLayoutWidget } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget.type';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';

const resolveFieldMetadataIdOrThrow = ({
  fieldMetadataUniversalIdentifier,
  flatFieldMetadataMaps,
}: {
  fieldMetadataUniversalIdentifier: string | null;
  flatFieldMetadataMaps: MetadataFlatEntityMaps<'fieldMetadata'>;
}): string => {
  if (!isDefined(fieldMetadataUniversalIdentifier)) {
    throw new FlatEntityMapsException(
      `Could not found any field metadata universal identifier while resolving page layout widget`,
      FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
    );
  }

  const flatFieldMetadata = findFlatEntityByUniversalIdentifierOrThrow({
    flatEntityMaps: flatFieldMetadataMaps,
    universalIdentifier: fieldMetadataUniversalIdentifier,
  });

  return flatFieldMetadata.id;
};

const resolveFieldMetadataId = ({
  fieldMetadataUniversalIdentifier,
  flatFieldMetadataMaps,
}: {
  fieldMetadataUniversalIdentifier: string | null;
  flatFieldMetadataMaps: MetadataFlatEntityMaps<'fieldMetadata'>;
}): string | null => {
  if (!isDefined(fieldMetadataUniversalIdentifier)) {
    return null;
  }

  const flatFieldMetadata = findFlatEntityByUniversalIdentifier({
    flatEntityMaps: flatFieldMetadataMaps,
    universalIdentifier: fieldMetadataUniversalIdentifier,
  });

  return flatFieldMetadata?.id ?? null;
};

const convertUniversalFilterToChartFilter = ({
  filter,
  flatFieldMetadataMaps,
}: {
  filter: UniversalChartFilter | undefined;
  flatFieldMetadataMaps: MetadataFlatEntityMaps<'fieldMetadata'>;
}): ChartFilter | undefined => {
  if (!isDefined(filter)) {
    return undefined;
  }

  return {
    ...filter,
    recordFilters: filter.recordFilters
      ?.map(({ fieldMetadataUniversalIdentifier, ...rest }) => {
        const fieldMetadataId = resolveFieldMetadataId({
          fieldMetadataUniversalIdentifier,
          flatFieldMetadataMaps,
        });

        if (!isDefined(fieldMetadataId)) {
          return undefined;
        }

        return {
          ...rest,
          fieldMetadataId,
        };
      })
      .filter(isDefined),
  };
};

export const fromUniversalConfigurationToFlatPageLayoutWidgetConfiguration = ({
  universalConfiguration,
  flatFieldMetadataMaps,
  flatFrontComponentMaps,
  flatViewMaps,
  flatViewFieldGroupMaps: _flatViewFieldGroupMaps,
}: {
  universalConfiguration: FlatPageLayoutWidget['universalConfiguration'];
  flatFieldMetadataMaps: MetadataFlatEntityMaps<'fieldMetadata'>;
  flatFrontComponentMaps: MetadataFlatEntityMaps<'frontComponent'>;
  flatViewMaps: MetadataFlatEntityMaps<'view'>;
  flatViewFieldGroupMaps: MetadataFlatEntityMaps<'viewFieldGroup'>;
}): FlatPageLayoutWidget['configuration'] => {
  switch (universalConfiguration.configurationType) {
    case WidgetConfigurationType.AGGREGATE_CHART: {
      const {
        aggregateFieldMetadataUniversalIdentifier,
        ratioAggregateConfig: universalRatioAggregateConfig,
        filter,
        ...rest
      } = universalConfiguration;

      const aggregateFieldMetadataId = resolveFieldMetadataIdOrThrow({
        fieldMetadataUniversalIdentifier:
          aggregateFieldMetadataUniversalIdentifier,
        flatFieldMetadataMaps,
      });

      const ratioAggregateConfig = isDefined(universalRatioAggregateConfig)
        ? {
            optionValue: universalRatioAggregateConfig.optionValue,
            fieldMetadataId: resolveFieldMetadataIdOrThrow({
              fieldMetadataUniversalIdentifier:
                universalRatioAggregateConfig.fieldMetadataUniversalIdentifier,
              flatFieldMetadataMaps,
            }),
          }
        : undefined;

      return {
        ...rest,
        aggregateFieldMetadataId,
        ratioAggregateConfig,
        filter: convertUniversalFilterToChartFilter({
          filter,
          flatFieldMetadataMaps,
        }),
      };
    }

    case WidgetConfigurationType.GAUGE_CHART: {
      const { aggregateFieldMetadataUniversalIdentifier, filter, ...rest } =
        universalConfiguration;

      const aggregateFieldMetadataId = resolveFieldMetadataIdOrThrow({
        fieldMetadataUniversalIdentifier:
          aggregateFieldMetadataUniversalIdentifier,
        flatFieldMetadataMaps,
      });

      return {
        ...rest,
        aggregateFieldMetadataId,
        filter: convertUniversalFilterToChartFilter({
          filter,
          flatFieldMetadataMaps,
        }),
      };
    }

    case WidgetConfigurationType.PIE_CHART: {
      const {
        aggregateFieldMetadataUniversalIdentifier,
        groupByFieldMetadataUniversalIdentifier,
        filter,
        ...rest
      } = universalConfiguration;

      const aggregateFieldMetadataId = resolveFieldMetadataIdOrThrow({
        fieldMetadataUniversalIdentifier:
          aggregateFieldMetadataUniversalIdentifier,
        flatFieldMetadataMaps,
      });

      const groupByFieldMetadataId = resolveFieldMetadataIdOrThrow({
        fieldMetadataUniversalIdentifier:
          groupByFieldMetadataUniversalIdentifier,
        flatFieldMetadataMaps,
      });

      return {
        ...rest,
        aggregateFieldMetadataId,
        groupByFieldMetadataId,
        filter: convertUniversalFilterToChartFilter({
          filter,
          flatFieldMetadataMaps,
        }),
      };
    }

    case WidgetConfigurationType.BAR_CHART: {
      const {
        aggregateFieldMetadataUniversalIdentifier,
        primaryAxisGroupByFieldMetadataUniversalIdentifier,
        secondaryAxisGroupByFieldMetadataUniversalIdentifier,
        filter,
        ...rest
      } = universalConfiguration;

      const aggregateFieldMetadataId = resolveFieldMetadataIdOrThrow({
        fieldMetadataUniversalIdentifier:
          aggregateFieldMetadataUniversalIdentifier,
        flatFieldMetadataMaps,
      });

      const primaryAxisGroupByFieldMetadataId = resolveFieldMetadataIdOrThrow({
        fieldMetadataUniversalIdentifier:
          primaryAxisGroupByFieldMetadataUniversalIdentifier,
        flatFieldMetadataMaps,
      });

      const secondaryAxisGroupByFieldMetadataId = isDefined(
        secondaryAxisGroupByFieldMetadataUniversalIdentifier,
      )
        ? resolveFieldMetadataIdOrThrow({
            fieldMetadataUniversalIdentifier:
              secondaryAxisGroupByFieldMetadataUniversalIdentifier,
            flatFieldMetadataMaps,
          })
        : undefined;

      return {
        ...rest,
        aggregateFieldMetadataId,
        primaryAxisGroupByFieldMetadataId,
        secondaryAxisGroupByFieldMetadataId,
        filter: convertUniversalFilterToChartFilter({
          filter,
          flatFieldMetadataMaps,
        }),
      };
    }

    case WidgetConfigurationType.LINE_CHART: {
      const {
        aggregateFieldMetadataUniversalIdentifier,
        primaryAxisGroupByFieldMetadataUniversalIdentifier,
        secondaryAxisGroupByFieldMetadataUniversalIdentifier,
        filter,
        ...rest
      } = universalConfiguration;

      const aggregateFieldMetadataId = resolveFieldMetadataIdOrThrow({
        fieldMetadataUniversalIdentifier:
          aggregateFieldMetadataUniversalIdentifier,
        flatFieldMetadataMaps,
      });

      const primaryAxisGroupByFieldMetadataId = resolveFieldMetadataIdOrThrow({
        fieldMetadataUniversalIdentifier:
          primaryAxisGroupByFieldMetadataUniversalIdentifier,
        flatFieldMetadataMaps,
      });

      const secondaryAxisGroupByFieldMetadataId = isDefined(
        secondaryAxisGroupByFieldMetadataUniversalIdentifier,
      )
        ? resolveFieldMetadataIdOrThrow({
            fieldMetadataUniversalIdentifier:
              secondaryAxisGroupByFieldMetadataUniversalIdentifier,
            flatFieldMetadataMaps,
          })
        : undefined;

      return {
        ...rest,
        aggregateFieldMetadataId,
        primaryAxisGroupByFieldMetadataId,
        secondaryAxisGroupByFieldMetadataId,
        filter: convertUniversalFilterToChartFilter({
          filter,
          flatFieldMetadataMaps,
        }),
      };
    }

    case WidgetConfigurationType.FIELDS: {
      const {
        viewId: viewUniversalIdentifier,
        newFieldDefaultVisibility,
        ...rest
      } = universalConfiguration;

      let viewId: string | null = null;

      if (isDefined(viewUniversalIdentifier)) {
        const flatView = findFlatEntityByUniversalIdentifier({
          flatEntityMaps: flatViewMaps,
          universalIdentifier: viewUniversalIdentifier,
        });

        if (!isDefined(flatView)) {
          throw new FlatEntityMapsException(
            `View not found for universal identifier: ${viewUniversalIdentifier}`,
            FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
          );
        }

        viewId = flatView.id;
      }

      return { ...rest, viewId, newFieldDefaultVisibility };
    }

    case WidgetConfigurationType.FRONT_COMPONENT: {
      const { frontComponentUniversalIdentifier, configurationType } =
        universalConfiguration;

      if (!isDefined(frontComponentUniversalIdentifier)) {
        throw new FlatEntityMapsException(
          `Front component universal identifier is required for FRONT_COMPONENT configuration`,
          FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
        );
      }

      const flatFrontComponent = findFlatEntityByUniversalIdentifier({
        flatEntityMaps: flatFrontComponentMaps,
        universalIdentifier: frontComponentUniversalIdentifier,
      });

      if (!isDefined(flatFrontComponent)) {
        throw new FlatEntityMapsException(
          `Front component not found for universal identifier: ${frontComponentUniversalIdentifier}`,
          FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
        );
      }

      return {
        configurationType,
        frontComponentId: flatFrontComponent.id,
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
    case WidgetConfigurationType.IFRAME:
    case WidgetConfigurationType.STANDALONE_RICH_TEXT:
      return universalConfiguration;
  }
};
