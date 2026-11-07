import { isDefined } from 'twenty-shared/utils';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatPageLayoutWidget } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget.type';

export const computeFlatPageLayoutWidgetsUnboundFromDeletedFields = <
  TFlatPageLayoutWidget extends Pick<
    FlatPageLayoutWidget,
    'configuration' | 'universalConfiguration'
  >,
>({
  flatPageLayoutWidgets,
  deletedFlatFieldMetadatas,
}: {
  flatPageLayoutWidgets: TFlatPageLayoutWidget[];
  deletedFlatFieldMetadatas: Pick<
    FlatFieldMetadata,
    'id' | 'universalIdentifier'
  >[];
}): TFlatPageLayoutWidget[] => {
  const deletedFieldIds = new Set(
    deletedFlatFieldMetadatas.map(({ id }) => id),
  );
  const deletedFieldUniversalIdentifiers = deletedFlatFieldMetadatas.map(
    ({ universalIdentifier }) => universalIdentifier,
  );

  return flatPageLayoutWidgets.flatMap((flatPageLayoutWidget) => {
    const { configuration, universalConfiguration } = flatPageLayoutWidget;

    if (
      !('dashboardFilterBindings' in configuration) ||
      !('dashboardFilterBindings' in universalConfiguration) ||
      !configuration.dashboardFilterBindings?.some(({ fieldMetadataId }) =>
        deletedFieldIds.has(fieldMetadataId),
      )
    ) {
      return [];
    }

    const unboundUniversalConfiguration = {
      ...universalConfiguration,
      dashboardFilterBindings:
        universalConfiguration.dashboardFilterBindings?.filter(
          ({ fieldMetadataUniversalIdentifier }) =>
            !isDefined(fieldMetadataUniversalIdentifier) ||
            !deletedFieldUniversalIdentifiers.includes(
              fieldMetadataUniversalIdentifier,
            ),
        ),
    };

    // The runner cannot resolve a deleted field, so a widget that still references one elsewhere keeps its bindings
    const serializedUnboundUniversalConfiguration = JSON.stringify(
      unboundUniversalConfiguration,
    );

    if (
      deletedFieldUniversalIdentifiers.some((deletedFieldUniversalIdentifier) =>
        serializedUnboundUniversalConfiguration.includes(
          deletedFieldUniversalIdentifier,
        ),
      )
    ) {
      return [];
    }

    return [
      {
        ...flatPageLayoutWidget,
        configuration: {
          ...configuration,
          dashboardFilterBindings: configuration.dashboardFilterBindings.filter(
            ({ fieldMetadataId }) => !deletedFieldIds.has(fieldMetadataId),
          ),
        },
        universalConfiguration: unboundUniversalConfiguration,
      },
    ];
  });
};
