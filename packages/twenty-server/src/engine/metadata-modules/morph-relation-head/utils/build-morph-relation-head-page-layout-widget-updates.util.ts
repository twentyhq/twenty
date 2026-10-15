import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatPageLayoutWidget } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget.type';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';

export const buildMorphRelationHeadPageLayoutWidgetUpdates = ({
  destinationFieldByOriginFieldId,
  flatPageLayoutWidgetMaps,
}: {
  destinationFieldByOriginFieldId: Map<string, FlatFieldMetadata>;
  flatPageLayoutWidgetMaps: FlatEntityMaps<FlatPageLayoutWidget>;
}): FlatPageLayoutWidget[] =>
  Object.values(flatPageLayoutWidgetMaps.byUniversalIdentifier)
    .filter(isDefined)
    .flatMap((pageLayoutWidget) => {
      const { configuration, universalConfiguration } = pageLayoutWidget;

      if (
        (configuration.configurationType !== WidgetConfigurationType.FIELD &&
          configuration.configurationType !==
            WidgetConfigurationType.FORM_FIELD) ||
        (universalConfiguration.configurationType !==
          WidgetConfigurationType.FIELD &&
          universalConfiguration.configurationType !==
            WidgetConfigurationType.FORM_FIELD)
      ) {
        return [];
      }

      const destination = destinationFieldByOriginFieldId.get(
        configuration.fieldMetadataId,
      );

      if (!isDefined(destination)) {
        return [];
      }

      return [
        {
          ...pageLayoutWidget,
          configuration: {
            ...configuration,
            fieldMetadataId: destination.id,
          },
          universalConfiguration: {
            ...universalConfiguration,
            fieldMetadataId: destination.universalIdentifier,
          },
        },
      ];
    });
