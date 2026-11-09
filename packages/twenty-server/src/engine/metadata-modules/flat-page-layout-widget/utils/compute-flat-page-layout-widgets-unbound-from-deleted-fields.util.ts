import { isNull } from '@sniptt/guards';
import {
  getChartReferencedFieldMetadataIds,
  isDefined,
} from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatPageLayoutWidget } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget.type';

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
      !configuration.dashboardFilterBindings?.some(
        ({ fieldMetadataId }) =>
          isDefined(fieldMetadataId) && deletedFieldIds.has(fieldMetadataId),
      ) ||
      !getChartReferencedFieldMetadataIds(configuration).every(isFieldKept)
    ) {
      return [];
    }

    const keptDashboardFilterBindings =
      configuration.dashboardFilterBindings.filter(
        ({ fieldMetadataId }) =>
          isNull(fieldMetadataId) || isFieldKept(fieldMetadataId),
      );
    const keptPageLayoutFilterIds = new Set(
      keptDashboardFilterBindings.map(
        ({ pageLayoutFilterId }) => pageLayoutFilterId,
      ),
    );

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
          dashboardFilterBindings: keptDashboardFilterBindings,
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
              ({ pageLayoutFilterId }) =>
                keptPageLayoutFilterIds.has(pageLayoutFilterId),
            ),
        },
      },
    ];
  });
};
