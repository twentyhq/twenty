import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatPageLayoutWidget } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget.type';
import { getChartAggregateAndGroupByFieldMetadataIds } from 'src/engine/metadata-modules/page-layout-widget/utils/get-chart-aggregate-and-group-by-field-metadata-ids.util';

export const computeFlatPageLayoutWidgetsUnboundFromDeletedFields = <
  TFlatPageLayoutWidget extends Pick<
    FlatPageLayoutWidget,
    'deletedAt' | 'configuration' | 'universalConfiguration'
  >,
>({
  flatPageLayoutWidgets,
  deletedFieldIds,
  flatFieldMetadataMaps,
}: {
  flatPageLayoutWidgets: TFlatPageLayoutWidget[];
  deletedFieldIds: ReadonlySet<string>;
  flatFieldMetadataMaps: Pick<
    FlatEntityMaps<FlatFieldMetadata>,
    'byUniversalIdentifier' | 'universalIdentifierById'
  >;
}): TFlatPageLayoutWidget[] => {
  const isFieldKept = (fieldMetadataId: string | undefined) =>
    isDefined(fieldMetadataId) &&
    !deletedFieldIds.has(fieldMetadataId) &&
    isDefined(flatFieldMetadataMaps.universalIdentifierById[fieldMetadataId]);

  const isUniversalFieldKept = (
    fieldMetadataUniversalIdentifier: string | null,
  ) =>
    isDefined(fieldMetadataUniversalIdentifier) &&
    isFieldKept(
      flatFieldMetadataMaps.byUniversalIdentifier[
        fieldMetadataUniversalIdentifier
      ]?.id,
    );

  return flatPageLayoutWidgets.flatMap((flatPageLayoutWidget) => {
    const { configuration, universalConfiguration } = flatPageLayoutWidget;

    if (
      isDefined(flatPageLayoutWidget.deletedAt) ||
      !('dashboardFilterBindings' in configuration) ||
      !('dashboardFilterBindings' in universalConfiguration) ||
      !configuration.dashboardFilterBindings?.some(({ fieldMetadataId }) =>
        deletedFieldIds.has(fieldMetadataId),
      ) ||
      !getChartAggregateAndGroupByFieldMetadataIds(configuration).every(
        isFieldKept,
      )
    ) {
      return [];
    }

    return [
      {
        ...flatPageLayoutWidget,
        configuration: {
          ...configuration,
          ...('filter' in configuration && isDefined(configuration.filter)
            ? {
                filter: {
                  ...configuration.filter,
                  recordFilters: configuration.filter.recordFilters?.filter(
                    ({ fieldMetadataId }) => isFieldKept(fieldMetadataId),
                  ),
                },
              }
            : {}),
          dashboardFilterBindings: configuration.dashboardFilterBindings.filter(
            ({ fieldMetadataId }) => isFieldKept(fieldMetadataId),
          ),
        },
        universalConfiguration: {
          ...universalConfiguration,
          ...('filter' in universalConfiguration &&
          isDefined(universalConfiguration.filter)
            ? {
                filter: {
                  ...universalConfiguration.filter,
                  recordFilters:
                    universalConfiguration.filter.recordFilters?.filter(
                      ({ fieldMetadataUniversalIdentifier }) =>
                        isUniversalFieldKept(fieldMetadataUniversalIdentifier),
                    ),
                },
              }
            : {}),
          dashboardFilterBindings:
            universalConfiguration.dashboardFilterBindings?.filter(
              ({ fieldMetadataUniversalIdentifier }) =>
                isUniversalFieldKept(fieldMetadataUniversalIdentifier),
            ),
        },
      },
    ];
  });
};
