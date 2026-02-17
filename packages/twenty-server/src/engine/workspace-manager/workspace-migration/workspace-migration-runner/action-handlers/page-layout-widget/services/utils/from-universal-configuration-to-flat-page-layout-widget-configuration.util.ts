import { isDefined } from 'twenty-shared/utils';

import {
  FlatEntityMapsException,
  FlatEntityMapsExceptionCode,
} from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';
import { type MetadataFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity-maps.type';
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

  const flatFieldMetadata = findFlatEntityByUniversalIdentifier({
    flatEntityMaps: flatFieldMetadataMaps,
    universalIdentifier: fieldMetadataUniversalIdentifier,
  });

  if (!isDefined(flatFieldMetadata)) {
    throw new FlatEntityMapsException(
      `Field metadata not found for universal identifier: ${fieldMetadataUniversalIdentifier}`,
      FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
    );
  }

  return flatFieldMetadata.id;
};

export const fromUniversalConfigurationToFlatPageLayoutWidgetConfiguration = ({
  universalConfiguration,
  flatFieldMetadataMaps,
  flatViewMaps,
}: {
  universalConfiguration: FlatPageLayoutWidget['universalConfiguration'];
  flatFieldMetadataMaps: MetadataFlatEntityMaps<'fieldMetadata'>;
  flatViewMaps: MetadataFlatEntityMaps<'view'>;
}): FlatPageLayoutWidget['configuration'] => {
  switch (universalConfiguration.configurationType) {
    case WidgetConfigurationType.AGGREGATE_CHART: {
      const {
        aggregateFieldMetadataUniversalIdentifier,
        ratioAggregateConfig: universalRatioAggregateConfig,
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
      };
    }

    case WidgetConfigurationType.GAUGE_CHART: {
      const { aggregateFieldMetadataUniversalIdentifier, ...rest } =
        universalConfiguration;

      const aggregateFieldMetadataId = resolveFieldMetadataIdOrThrow({
        fieldMetadataUniversalIdentifier:
          aggregateFieldMetadataUniversalIdentifier,
        flatFieldMetadataMaps,
      });

      return {
        ...rest,
        aggregateFieldMetadataId,
      };
    }

    case WidgetConfigurationType.PIE_CHART: {
      const {
        aggregateFieldMetadataUniversalIdentifier,
        groupByFieldMetadataUniversalIdentifier,
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
      };
    }

    case WidgetConfigurationType.BAR_CHART: {
      const {
        aggregateFieldMetadataUniversalIdentifier,
        primaryAxisGroupByFieldMetadataUniversalIdentifier,
        secondaryAxisGroupByFieldMetadataUniversalIdentifier,
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
      };
    }

    case WidgetConfigurationType.LINE_CHART: {
      const {
        aggregateFieldMetadataUniversalIdentifier,
        primaryAxisGroupByFieldMetadataUniversalIdentifier,
        secondaryAxisGroupByFieldMetadataUniversalIdentifier,
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
      };
    }

    case WidgetConfigurationType.FIELDS: {
      const { viewId: viewUniversalIdentifier, ...rest } =
        universalConfiguration;

      if (!isDefined(viewUniversalIdentifier)) {
        return { ...rest, viewId: null };
      }

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

      return { ...rest, viewId: flatView.id };
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
      return universalConfiguration;
  }
};
